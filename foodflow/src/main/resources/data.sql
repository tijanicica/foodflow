-- Lozinka za sve korisnike je 'password'. Spring Security će je hešovati.
-- Bcrypt hash za 'password' je: $2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi
-- Uloge: CUSTOMER, DRIVER, OPERATOR, MANAGER, ADMINISTRATOR, SUPPORT_ADMINISTRATOR

-- KORISNICI
-- Customer
INSERT INTO customer (id, email, password, first_name, last_name, phone, role) VALUES
    (1, 'customer@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Petar', 'Petrović', '064111222', 'CUSTOMER');

-- Driver
INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, rejection_count, latitude, longitude, timestamp) VALUES
    (2, 'driver@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Jovan', 'Jovanović', '064333444', 'DRIVER', 'Car', 0, 44.8125, 20.4612, NOW());

-- Operator
INSERT INTO operator (id, email, password, first_name, last_name, phone, role) VALUES
    (3, 'operator@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Ana', 'Anić', '064555666', 'OPERATOR');

-- Manager
INSERT INTO manager (id, email, password, first_name, last_name, phone, role) VALUES
    (4, 'manager@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Olivia', 'Rhye', '064777888', 'MANAGER');

-- Administrator
INSERT INTO administrator (id, email, password, first_name, last_name, phone, role) VALUES
    (5, 'admin@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Admin', 'Adminović', '064999000', 'ADMINISTRATOR');

-- Support Administrator
INSERT INTO support_administrator (id, email, password, first_name, last_name, phone, role) VALUES
    (6, 'supportadmin@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Support', 'Adminović', '064123456', 'SUPPORT_ADMINISTRATOR');


-- ADRESE
INSERT INTO address (id, street, street_number, city, country, nickname, postal_code, customer_id) VALUES
    (1, 'Kralja Milana', '20', 'Beograd', 'Srbija', 'Kuća', '11000', 1);

INSERT INTO address (id, street, street_number, city, country, postal_code) VALUES
    (2, 'Kralja Petra', '12', 'Beograd', 'Srbija', '11000');


-- RESTORAN I MENI
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, manager_id, address_id) VALUES
    (1, 'Pasta Paradise', '09:00:00', '23:00:00', 4.8, 4, 2);

INSERT INTO menu (id, name, restaurant_id) VALUES
    (1, 'Glavni Meni', 1);

INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (1, 1, NOW(), true, 1);

-- STAVKE MENIJA I NJIHOVE VERZIJE
INSERT INTO menu_item (id, name, description, image_url) VALUES
                                                             (1, 'Pasta Carbonara', 'Creamy pasta with pancetta and parmesan.', 'url/to/image1.jpg'),
                                                             (2, 'Coca-Cola', '0.5l', 'url/to/image2.jpg');

INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES
                                                                                                 (1, 1250.00, true, true, 1, 1),
                                                                                                 (2, 250.00, true, false, 2, 1);


-- ALERGENI I TIPOVI ISHRANE
INSERT INTO allergen (id, name) VALUES (1, 'Gluten'), (2, 'Jaja'), (3, 'Mleko');
INSERT INTO diet_type (id, name) VALUES (1, 'Vegetarijansko');

-- POVEZIVANJE STAVKI MENIJA SA ALERGENIMA I TIPOVIMA ISHRANE
INSERT INTO menu_item_allergen (menu_item_id, allergen_id) VALUES (1, 1), (1, 2), (1, 3);
-- Nema diet_type za Carbonaru


-- PORUDŽBINE
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id) VALUES
    (1, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '1 day', 150.00, 1400.00, 1);

INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (1, 1, 1, 1);


-- KATEGORIJE PROBLEMA ZA KORISNIČKU PODRŠKU
INSERT INTO problem_category (id, name, parent_category_id) VALUES
                                                                (1, 'Problem sa porudžbinom', NULL),
                                                                (2, 'Problem sa dostavom', NULL),
                                                                (3, 'Tehnički problem', NULL),
                                                                (4, 'Ostalo', NULL),
                                                                (5, 'Nepotpuna porudžbina', 1),
                                                                (6, 'Pogrešna porudžbina', 1),
                                                                (7, 'Kašnjenje isporuke', 2),
                                                                (8, 'Problem sa sajtom', 3);


-- Resetovanje sekvenci da bi ID-jevi išli od sledećeg broja
ALTER SEQUENCE customer_id_seq RESTART WITH 10;
ALTER SEQUENCE driver_id_seq RESTART WITH 10;
ALTER SEQUENCE operator_id_seq RESTART WITH 10;
ALTER SEQUENCE manager_id_seq RESTART WITH 10;
ALTER SEQUENCE administrator_id_seq RESTART WITH 10;
ALTER SEQUENCE support_administrator_id_seq RESTART WITH 10;
ALTER SEQUENCE address_id_seq RESTART WITH 10;
ALTER SEQUENCE restaurant_id_seq RESTART WITH 10;
ALTER SEQUENCE menu_id_seq RESTART WITH 10;
ALTER SEQUENCE menu_version_id_seq RESTART WITH 10;
ALTER SEQUENCE menu_item_id_seq RESTART WITH 10;
ALTER SEQUENCE menu_item_version_id_seq RESTART WITH 10;
ALTER SEQUENCE orders_id_seq RESTART WITH 10;
ALTER SEQUENCE order_item_id_seq RESTART WITH 10;
ALTER SEQUENCE problem_category_id_seq RESTART WITH 20;