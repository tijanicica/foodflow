# FoodFlow 

A full-featured food delivery platform faculty project — restaurants, menus, live order tracking, driver dispatch, customer support ticketing with automatic NLP triage, and a Gemini-powered AI ordering assistant, with dedicated dashboards for every role in the business.

## Concept

FoodFlow models a multi-restaurant delivery service with six distinct roles, each with its own dashboard:

- **Customer** — browse restaurants/menus, build a cart, checkout, schedule/repeat orders, track deliveries live on a map, rate drivers, chat with an AI assistant for recommendations, and raise support tickets.
- **Driver** — dashboard of available/assigned deliveries, accept/reject offers, update live location, view earnings and performance stats, delivery support chat.
- **Restaurant Manager** — manage menu items and versions, view/track their restaurant's orders, live-track active deliveries, see financial reports.
- **Operator** — customer support agent handling tickets, chat with customers, view own performance analytics.
- **Support Administrator** — oversee the support desk: ticket categories, operator management, support-wide analytics.
- **Administrator** — manage managers, live-track all deliveries platform-wide, driver performance oversight.

Core flows:

- **Ordering** — restaurant/menu browsing with dietary/allergen filters, cart, checkout (address, saved cards, coupons), scheduled and repeat orders, PDF invoice generation.
- **Delivery & dispatch** — automatic order-to-driver assignment, driver accept/reject offers, live GPS tracking with ETA (Leaflet + routing), delivery delay reporting, driver simulation for demoing without real GPS.
- **Support desk** — customers open support tickets; a separate NLP microservice auto-categorizes the ticket text so it's routed to the right problem category; operators/support admins triage and respond via chat.
- **AI assistant** — an in-app chat that answers customer questions using restaurant/menu data as context, backed by Google's Gemini API.
- **Ratings & analytics** — customers rate drivers, drivers/restaurants get combined ratings, and every role above Customer/Driver has an analytics dashboard (order volume, revenue, driver performance, support metrics) built with Recharts.
- **Real-time** — order status, delivery location and chat all push over WebSocket/STOMP rather than polling.

## Architecture

```
┌───────────────────┐   REST + WebSocket(STOMP)   ┌──────────────────────┐
│  foodflow-frontend │ ───────────────────────────▶│      foodflow          │
│  React 18 SPA      │◀─────────────────────────── │  Spring Boot backend  │
└───────────────────┘                              └──────────┬────────────┘
                                                                │
                                          ┌─────────────────────┼───────────────────┐
                                          │                     │                   │
                                    PostgreSQL              Gemini API         Gmail SMTP
                                    (JPA/Hibernate)      (AI chat assistant)  (account emails)
                                                                │
                                                    HTTP  ┌──────────────┐
                                                    ─────▶│ nlp-service   │
                                                           │ Flask + HF   │
                                                           │ transformers │
                                                           │ (ticket      │
                                                           │  categorizer)│
                                                           └──────────────┘
```

- **Frontend** (`foodflow-frontend/`) — React 18 + Vite SPA, Tailwind + Radix UI components, React Router, Leaflet/react-leaflet + leaflet-routing-machine for maps and live tracking, Recharts for analytics, STOMP over SockJS for real-time updates.
- **Backend** (`foodflow/`) — Spring Boot monolith: REST controllers per domain (auth, orders, restaurants, drivers, coupons, ratings, support, analytics...), JWT auth with role-based access control, WebSocket message broker, scheduled jobs (order scheduling, driver simulation), PDF invoice generation (OpenHTMLtoPDF + Thymeleaf), PostgreSQL via Spring Data JPA.
- **NLP service** (`nlp-service/`) — standalone Python Flask microservice serving a fine-tuned Hugging Face `transformers` text-classification model; the backend calls it to auto-categorize incoming support ticket text (`train_model.py`/`tickets_dataset.csv` are the training script and dataset used to produce the fine-tuned model).

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Radix UI, Framer Motion, Leaflet + react-leaflet + leaflet-routing-machine, Recharts, Axios, STOMP.js + SockJS, react-hot-toast |
| Backend | Java, Spring Boot (Web, Security, Data JPA, Validation, WebSocket, Mail, Thymeleaf), Hibernate |
| Auth | JWT (jjwt), Spring Security, role-based access (`@PreAuthorize`) |
| Database | PostgreSQL |
| Real-time | WebSocket + STOMP (order/delivery/chat updates) |
| AI / NLP | Google Gemini API (chat assistant), Hugging Face `transformers` fine-tuned classifier served via Flask (support ticket categorization) |
| Documents | OpenHTMLtoPDF + Thymeleaf (order invoice PDFs) |
| Testing | Spring Boot Test, Spring Security Test |

## Repository structure

```
.
├── foodflow/                 # Spring Boot backend
│   └── src/main/java/com/iis/foodflow/
│       ├── controller/        # Auth, Order, Restaurant, Driver, Manager, Operator,
│       │                       # Admin, Support*, Analytics, Coupon, Rating, AI, Chat...
│       ├── service/           # Business logic (Order, Driver, DriverSimulation,
│       │                       # OrderAssignment, AI, Analytics, Rating, Pdf...)
│       ├── model/              # order/, restaurant/, user/, delivery/, support/
│       ├── repository/ dto/ enums/ security/ config/
│       └── resources/
│           ├── application.properties
│           ├── data.sql
│           └── templates/invoice_template.html
├── foodflow-frontend/         # React SPA
│   └── src/pages/             # Customer, Driver, Manager, Operator, Support*, Admin* pages
├── nlp-service/                # Flask support-ticket categorization microservice
│   ├── app.py
│   ├── train_model.py
│   └── tickets_dataset.csv
└── package-lock.json
```

## Startup guide

There's no Docker Compose here — the three pieces run as separate local processes.

### 1. Prerequisites

- Java 17+ and Maven (or use the bundled `./mvnw`)
- Node.js 18+ and npm
- PostgreSQL running locally
- Python 3 (only needed for the NLP support-ticket categorization service)

### 2. Database

```sql
CREATE DATABASE foodflow_db;
```

Update `foodflow/src/main/resources/application.properties` to match your local Postgres credentials. `spring.jpa.hibernate.ddl-auto=create-drop` means the schema is recreated on every restart, and `data.sql` seeds it with demo restaurants/menus/users.

### 3. Backend

```bash
cd foodflow
./mvnw spring-boot:run
```

Runs on `http://localhost:8088`. Notes:

- The AI chat assistant needs a valid `google.api.key` (Gemini API) in `application.properties` — without it, `/api/ai/chat` will fail gracefully with an error message.
- Email (activation/notifications) needs working `spring.mail.*` SMTP credentials.
- WebSocket endpoint is `/ws`, currently allowlisted for `http://localhost:5173` / `:5174` (the Vite dev server ports) in `WebSocketConfig`/`SecurityConfig`.

### 4. Frontend

```bash
cd foodflow-frontend
npm install
npm run dev
```

Vite dev server, default `http://localhost:5173`, talking to the backend via Axios (`src/services/api.js`).

### 5. (Optional) NLP support-ticket categorizer

```bash
cd nlp-service
pip install -r requirements.txt
python app.py
```

Runs on `http://localhost:5000`, exposing `POST /categorize`. It expects a fine-tuned model directory at `./final_model` (produced by `train_model.py` against `tickets_dataset.csv`) — without it, the endpoint returns a 500 and the backend falls back accordingly.
