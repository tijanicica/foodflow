-- Lozinka za sve korisnike je 'password'. Spring Security će je hešovati.
-- Bcrypt hash za 'password' je: $2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi
-- Uloge: CUSTOMER, DRIVER, OPERATOR, MANAGER, ADMINISTRATOR, SUPPORT_ADMINISTRATOR

-- KORISNICI
-- Customer
INSERT INTO customer (id, email, password, first_name, last_name, phone, role) VALUES
    (1, 'stojicic.nikola02@gmail.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Petar', 'Petrović', '064111222', 'CUSTOMER');
-- Vozaci
INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (2, 'driver1@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Jovan', 'Jovanović', '064333444', 'DRIVER', 'CAR', 'OFFLINE', 0, 44.8125, 20.4612, NOW(), 0.0);

-- Drugi vozač je već ispravan
INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (8, 'driver2@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Petar', 'Petrović', '065111222', 'DRIVER', 'MOTORCYCLE', 'ONLINE', 0, 44.8040, 20.4651, NOW(), 0.0);
-- Operator
INSERT INTO operator (id, email, password, first_name, last_name, phone, role) VALUES
    (3, 'operator@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Ana', 'Anić', '064555666', 'OPERATOR');

-- Manager
INSERT INTO manager (id, email, password, first_name, last_name, phone, role) VALUES
    (4, 'manager1@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Olivia', 'Rhye', '064777888', 'MANAGER');
INSERT INTO manager (id, email, password, first_name, last_name, phone, role) VALUES
    (7, 'manager2@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Marko', 'Marković', '064111223', 'MANAGER');


-- Administrator
INSERT INTO administrator (id, email, password, first_name, last_name, phone, role) VALUES
    (5, 'admin@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Admin', 'Adminović', '064999000', 'ADMINISTRATOR');

-- Support Administrator
INSERT INTO support_administrator (id, email, password, first_name, last_name, phone, role) VALUES
    (6, 'supportadmin@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Support', 'Adminović', '064123456', 'SUPPORT_ADMINISTRATOR');

-- Adrese sa koordinatama
INSERT INTO address (id, street, street_number, city, country, nickname, postal_code, latitude, longitude, customer_id) VALUES
    (1, 'Kralja Milana', '20', 'Beograd', 'Srbija', 'Kuća', '11000', 44.8111, 20.4593, 1);

INSERT INTO address (id, street, street_number, city, country, postal_code, latitude, longitude) VALUES
                                                                                                     (10, 'Kralja Petra', '12', 'Beograd', 'Srbija', '11000', 44.8196, 20.4569),
                                                                                                     (11, 'Njegoševa', '5', 'Novi Sad', 'Srbija', '21000', 45.2576, 19.8444),
                                                                                                     (12, 'Bulevar Oslobođenja', '102', 'Novi Sad', 'Srbija', '21000', 45.2463, 19.8369),
                                                                                                     (13, 'Knez Mihailova', '30', 'Beograd', 'Srbija', '11000', 44.8176, 20.4565),
                                                                                                     (14, 'Cara Dušana', '44', 'Niš', 'Srbija', '18000', 43.3194, 21.8950),
                                                                                                     (15, 'Trg Slobode', '1', 'Novi Sad', 'Srbija', '21000', 45.2550, 19.8456),
                                                                                                     (16, 'Kralja Aleksandra I Karađorđevića', '25', 'Kragujevac', 'Srbija', '34000', 44.0151, 20.9114),
                                                                                                     (17, 'Gospodar Jevremova', '50', 'Beograd', 'Srbija', '11000', 44.8213, 20.4607),
                                                                                                     (18, 'Bulevar Nemanjića', '22', 'Niš', 'Srbija', '18000', 43.3169, 21.8906),
                                                                                                     (19, 'Palmotićeva', '2', 'Beograd', 'Srbija', '11000', 44.8161, 20.4652),
                                                                                                     (20, 'Vojvode Mišića', '10', 'Niš', 'Srbija', '18000', 43.3242, 21.8924),
                                                                                                     (21, 'Laze Telečkog', '8', 'Novi Sad', 'Srbija', '21000', 45.2557, 19.8459);

-- RESTORAN I MENI
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (1, 'Pasta Paradise', '09:00:00', '23:00:00', 4.8, '$$', 4, 10, 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (2, 'Green Garden', '10:00:00', '22:00:00', 4.9, '$$', 7, 11, 'https://images.unsplash.com/photo-1498837167922-ddd27525d352');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (3, 'Burger Queen', '11:00:00', '01:00:00', 4.6, '$', 4, 12, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (4, 'Sushi Heaven', '12:00:00', '23:00:00', 4.7, '$$$', 7, 13, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (5, 'Meraklija Grill', '08:00:00', '22:00:00', 4.5, '$', 4, 14, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (6, 'The Golden Spoon', '12:00:00', '23:00:00', 5.0, '$$$', 7, 15, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (7, 'Pizza Corner', '10:00:00', '00:00:00', 4.4, '$$', 4, 16, 'https://images.unsplash.com/photo-1513104890138-7c749659a591');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (8, 'Vegan Oasis', '09:00:00', '21:00:00', 4.9, '$$', 7, 17, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (9, 'Steak House', '17:00:00', '01:00:00', 4.8, '$$$', 4, 18, 'https://images.unsplash.com/photo-1600891964092-4316c288032e');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (10, 'Gluten-Free Heaven', '08:00:00', '20:00:00', 4.7, '$$', 7, 19, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (11, 'Fish & Chips', '12:00:00', '22:00:00', 4.3, '$', 4, 20, 'https://images.unsplash.com/photo-1577003811926-53b288a6e5d0');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (12, 'Wok Express', '11:00:00', '23:00:00', 4.6, '$$', 7, 21, 'https://images.unsplash.com/photo-1585032226651-759b368d7246');
INSERT INTO menu (id, name, restaurant_id) VALUES
    (1, 'Glavni Meni', 1);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (2, 'Meni Zdravlja', 2);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (3, 'Burger Meni', 3);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (4, 'Sushi Meni', 4);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (5, 'Roštilj Meni', 5);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (6, 'Fine Dining', 6);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (7, 'Pizza Meni', 7);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (8, 'Veganski Meni', 8);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (9, 'Steak Meni', 9);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (10, 'Bezglutenski Meni', 10);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (11, 'Morski Meni', 11);
INSERT INTO menu (id, name, restaurant_id) VALUES
    (12, 'Azijski Meni', 12);

INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (1, 1, NOW(), true, 1);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (2, 1, NOW(), true, 2);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (3, 1, NOW(), true, 3);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (4, 1, NOW(), true, 4);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (5, 1, NOW(), true, 5);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (6, 1, NOW(), true, 6);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (7, 1, NOW(), true, 7);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (8, 1, NOW(), true, 8);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (9, 1, NOW(), true, 9);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (10, 1, NOW(), true, 10);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (11, 1, NOW(), true, 11);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id) VALUES
    (12, 1, NOW(), true, 12);

-- STAVKE MENIJA I NJIHOVE VERZIJE
INSERT INTO menu_item (id, name, description, image_url) VALUES
-- Pasta Paradise (1-5)
(1, 'Pasta Carbonara', 'Pancetta, jaja, parmezan', 'https://images.unsplash.com/photo-1608797223204-a2e5f39e5855');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (2, 'Pizza Margherita', 'Paradajz, mocarela, bosiljak', 'https://images.unsplash.com/photo-1595854337175-53a06f8eda5e');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (3, 'Lasagne Bolognese', 'Mleveno meso, bešamel', 'https://images.unsplash.com/photo-1574894709920-81b29d819163');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (4, 'Tiramisu', 'Kafa, maskarpone, piškote', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (5, 'Bruschetta', 'Paradajz, beli luk, maslinovo ulje', 'https://images.unsplash.com/photo-1505253716362-afb74bf60d44');
-- Green Garden (6-10)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (6, 'Caesar Salata', 'Piletina, krutoni, preliv', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (7, 'Quinoa Salata', 'Kinoa, povrće, limun', 'https://images.unsplash.com/photo-1551248429-4e6786348237');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (8, 'Potaž od bundeve', 'Kremasta supa od bundeve', 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (9, 'Pileći file sa grilovanim povrćem', 'Zdrav i ukusan obrok', 'https://images.unsplash.com/photo-1600891964092-4316c288032e');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (10, 'Voćna Salata', 'Sveže sezonsko voće', 'https://images.unsplash.com/photo-1562347810-092264645332');
-- Burger Queen (11-15)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (11, 'Classic Cheeseburger', 'Junetina, čedar, salata', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (12, 'Dupli Bacon Burger', 'Dupla junetina, hrskava slanina', 'https://images.unsplash.com/photo-1550950158-d09cd61ae321');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (13, 'Veggie Burger', 'Pljeskavica od povrća, avokado', 'https://images.unsplash.com/photo-1549611016-3a70d8a55246');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (14, 'Pomfrit', 'Hrskavi pomfrit', 'https://images.unsplash.com/photo-1576107290643-44141072a22b');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (15, 'Milkshake od čokolade', 'Gust i kremast', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699');
-- Sushi Heaven (16-20)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (16, 'California Roll', 'Krab, avokado, krastavac', 'https://images.unsplash.com/photo-1611142028751-5f79f22d43a0');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (17, 'Sake Nigiri', 'Sveži losos na pirinču', 'https://images.unsplash.com/photo-1615361200141-f45040f367be');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (18, 'Miso Supa', 'Tradicionalna japanska supa', 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (19, 'Edamame', 'Kuvana soja sa morskom solju', 'https://images.unsplash.com/photo-1599497840638-380d306b4545');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (20, 'Spicy Tuna Roll', 'Pikantna tuna, krastavac', 'https://images.unsplash.com/photo-1617196035154-9b6a6b21841b');
-- Meraklija Grill (21-25)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (21, 'Ćevapi 10 komada', 'Domaći ćevapi sa lukom', 'https://images.unsplash.com/photo-1565299585323-21d1d1437a3a');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (22, 'Pljeskavica na kajmaku', 'Gurmanska pljeskavica', 'https://images.unsplash.com/photo-1628219808429-1a0e3a67039a');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (23, 'Mešano meso', 'Porcija za dvoje', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (24, 'Šopska salata', 'Paradajz, krastavac, sir', 'https://images.unsplash.com/photo-1551248429-4e6786348237');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (25, 'Domaća lepinja', 'Sveže pečena', 'https://images.unsplash.com/photo-1533560793024-4f591a541014');
-- The Golden Spoon (26-30)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (26, 'Biftek u sosu od bibera', 'Najfiniji komad mesa', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (27, 'Rižoto sa pečurkama', 'Kremasti rižoto sa tartufima', 'https://images.unsplash.com/photo-1595908129323-c2a831e5447a');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (28, 'Fileti lososa', 'Na žaru sa blitvom', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (29, 'Čokoladni sufle', 'Sa toplim jezgrom', 'https://images.unsplash.com/photo-1587314168485-3236d6710814');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (30, 'Creme Brulee', 'Hrskava korica od karamele', 'https://images.unsplash.com/photo-1543322778-90f3b499b80b');
-- Pizza Corner (31-35)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (31, 'Capricciosa', 'Šunka, pečurke, sir', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (32, 'Quattro Formaggi', 'Četiri vrste sira', 'https://images.unsplash.com/photo-1593560704563-f176a2eb61db');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (33, 'Vegetariana', 'Sezonsko povrće', 'https://images.unsplash.com/photo-1594007654729-407eedc4be65');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (34, 'Pancerota', 'Punjeno testo', 'https://images.unsplash.com/photo-1627222239595-a8a25a2e0717');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (35, 'Beli luk hleb', 'Sa sirom', 'https://images.unsplash.com/photo-1598679253443-4b5c7e753e61');
-- Vegan Oasis (36-40)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (36, 'Falafel Bowl', 'Falafel, humus, salata', 'https://images.unsplash.com/photo-1594212699903-89169655fab6');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (37, 'Sočivo Burger', 'Burger od sočiva', 'https://images.unsplash.com/photo-1521319320833-c348e3a2f768');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (38, 'Buddha Bowl', 'Raznovrsno povrće i žitarice', 'https://images.unsplash.com/photo-1540420773420-2850a86b2b50');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (39, 'Sirova torta od limuna', 'Bez pečenja', 'https://images.unsplash.com/photo-1562347810-092264645332');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (40, 'Zeleni Smoothie', 'Spanać, banana, bademovo mleko', 'https://images.unsplash.com/photo-1610970881699-44a5c8a01490');
-- Steak House (41-45)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (41, 'Rib-eye Steak', '300g odležalog mesa', 'https://images.unsplash.com/photo-1551028150-64b9f398f67b');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (42, 'T-Bone Steak', '500g sa koskom', 'https://images.unsplash.com/photo-1546964124-6cce460f09ef');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (43, 'Ramstek', 'Sočan i ukusan', 'https://images.unsplash.com/photo-1629734180429-775b31e9c240');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (44, 'Krompir u foliji', 'Sa kajmakom', 'https://images.unsplash.com/photo-1518779578993-6bae68262ae2');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (45, 'Salata od rukole i čerija', 'Sveža salata', 'https://images.unsplash.com/photo-1505253716362-afb74bf60d44');
-- Gluten-Free Heaven (46-50)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (46, 'Bezglutenska pica', 'Sa sastojcima po izboru', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (47, 'Piletina sa kinoom', 'Zdrav obrok', 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (48, 'Salata sa avokadom', 'Avokado, piletina, povrće', 'https://images.unsplash.com/photo-1505253716362-afb74bf60d44');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (49, 'Palačinke od heljde', 'Sa džemom bez šećera', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (50, 'Mafini od badema', 'Bez glutena i šećera', 'https://images.unsplash.com/photo-1607478900766-efe13248b125');
-- Fish & Chips (51-55)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (51, 'Oslić i pomfrit', 'Klasični fish and chips', 'https://images.unsplash.com/photo-1599923572242-3a5576145326');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (52, 'Lignje na žaru', 'Sveže lignje', 'https://images.unsplash.com/photo-1616091216773-8a2b5e0b7b0f');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (53, 'Riblja čorba', 'Domaća riblja čorba', 'https://images.unsplash.com/photo-1574894709920-81b29d819163');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (54, 'Salata od morskih plodova', 'Škampi, dagnje, hobotnica', 'https://images.unsplash.com/photo-1594343384813-89510619a0a1');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (55, 'Pohovani štapići od sira', 'Sa tartar sosom', 'https://images.unsplash.com/photo-1608797223204-a2e5f39e5855');
-- Wok Express (56-60)
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (56, 'Piletina sa karijem', 'Piletina u crvenom kari sosu', 'https://images.unsplash.com/photo-1565299585323-21d1d1437a3a');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (57, 'Slatko-kisela piletina', 'Klasično kinesko jelo', 'https://images.unsplash.com/photo-1582512968953-c91753063543');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (58, 'Nudle sa povrćem', 'Pržene nudle sa svežim povrćem', 'https://images.unsplash.com/photo-1585032226651-759b368d7246');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (59, 'Prolećne rolnice', 'Hrskave rolnice sa povrćem', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe');
INSERT INTO menu_item (id, name, description, image_url) VALUES
    (60, 'Pohovana banana', 'Sa medom i susamom', 'https://images.unsplash.com/photo-1615870215124-4f013ab3b0a2');

-- VERZIJE STAVKI MENIJA (cene) - Svaka kao zasebna naredba radi sigurnosti i kompatibilnosti
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (1, 1250, true, true, 1, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (2, 1100, true, true, 2, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (3, 1400, true, false, 3, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (4, 650, true, true, 4, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (5, 550, true, false, 5, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (6, 1150, true, true, 6, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (7, 1200, true, true, 7, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (8, 450, true, false, 8, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (9, 1350, true, true, 9, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (10, 500, true, false, 10, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (11, 850, true, true, 11, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (12, 1050, true, true, 12, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (13, 900, true, false, 13, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (14, 300, true, true, 14, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (15, 450, true, false, 15, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (16, 1500, true, true, 16, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (17, 400, true, true, 17, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (18, 350, true, false, 18, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (19, 450, true, true, 19, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (20, 1600, true, false, 20, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (21, 600, true, true, 21, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (22, 950, true, true, 22, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (23, 1800, true, false, 23, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (24, 300, true, true, 24, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (25, 100, true, false, 25, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (26, 2800, true, true, 26, 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (27, 1900, true, true, 27, 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (28, 2400, true, false, 28, 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (29, 800, true, true, 29, 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (30, 700, true, false, 30, 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (31, 1150, true, true, 31, 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (32, 1250, true, true, 32, 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (33, 1100, true, false, 33, 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (34, 950, true, true, 34, 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (35, 400, true, false, 35, 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (36, 1100, true, true, 36, 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (37, 950, true, true, 37, 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (38, 1200, true, false, 38, 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (39, 700, true, true, 39, 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (40, 550, true, false, 40, 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (41, 2900, true, true, 41, 9) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (42, 3500, true, true, 42, 9) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (43, 2600, true, false, 43, 9) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (44, 450, true, true, 44, 9) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (45, 500, true, false, 45, 9) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (46, 1300, true, true, 46, 10) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (47, 1400, true, true, 47, 10) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (48, 1150, true, false, 48, 10) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (49, 600, true, true, 49, 10) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (50, 400, true, false, 50, 10) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (51, 900, true, true, 51, 11) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (52, 1500, true, true, 52, 11) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (53, 500, true, false, 53, 11) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (54, 1600, true, true, 54, 11) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (55, 600, true, false, 55, 11) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (56, 1300, true, true, 56, 12) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (57, 1350, true, true, 57, 12) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (58, 1100, true, false, 58, 12) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (59, 550, true, true, 59, 12) ON CONFLICT (id) DO NOTHING;
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES (60, 450, true, false, 60, 12) ON CONFLICT (id) DO NOTHING;

-- ALERGENI I TIPOVI ISHRANE
INSERT INTO allergen (id, name) VALUES
    (1, 'Gluten');
INSERT INTO allergen (id, name) VALUES
    (2, 'Eggs');
INSERT INTO allergen (id, name) VALUES
    (3, 'Milk');
INSERT INTO allergen (id, name) VALUES
    (4, 'Nuts');

INSERT INTO diet_type (id, name) VALUES
    (1, 'Vegeterian');
INSERT INTO diet_type (id, name) VALUES
    (2, 'Vegan');
INSERT INTO diet_type (id, name) VALUES
    (3, 'Gluten-Free');


-- POVEZIVANJE STAVKI SA ALERGENIMA I TIPOVIMA ISHRANE
-- Pasta Paradise (Italian, contains gluten, milk, eggs)
INSERT INTO menu_item_allergen (menu_item_id, allergen_id) VALUES (1,1), (1,2), (1,3), (2,1), (2,3), (3,1), (3,2), (3,3), (4,2), (4,3), (5,1);
-- Green Garden (Healthy, some vegetarian/gluten-free options)
INSERT INTO menu_item_diet_type (menu_item_id, diet_type_id) VALUES (7,1), (7,2), (7,3), (8,1), (8,2), (8,3), (10,1), (10,2), (10,3);
-- Burger Queen (Fast food, contains gluten, milk)
INSERT INTO menu_item_allergen (menu_item_id, allergen_id) VALUES (11,1), (11,3), (12,1), (12,3), (13,1), (15,3);
INSERT INTO menu_item_diet_type (menu_item_id, diet_type_id) VALUES (13,1);
-- Vegan Oasis (ALL VEGAN)
INSERT INTO menu_item_diet_type (menu_item_id, diet_type_id) VALUES (36,2), (37,2), (38,2), (39,2), (40,2);
INSERT INTO menu_item_allergen (menu_item_id, allergen_id) VALUES (37,1), (39,4); -- Burger bun has gluten, cake has nuts
-- Gluten-Free Heaven (ALL GLUTEN-FREE)
INSERT INTO menu_item_diet_type (menu_item_id, diet_type_id) VALUES (46,3), (47,3), (48,3), (49,3), (50,3);
INSERT INTO menu_item_allergen (menu_item_id, allergen_id) VALUES (49,2), (50,4);




-- PORUDŽBINE
-- ====================================================================

-- ====================================================================
-- KONAČNA I ISPRAVLJENA VERZIJA ZA PORUDŽBINE
-- (Uključuje ispravne 'driver_id' i 'address_id')
-- ====================================================================

-- PORUDŽBINA #1: DELIVERED, od Jovana (ID=2), na adresu (ID=1)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at) VALUES
    (1, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '2 day', 150.00, 1400.00, 1, 1, 2,
     NOW() - INTERVAL '2 day' + INTERVAL '45 minute', -- Rok isporuke (ETA) je bio 45 minuta
     NOW() - INTERVAL '2 day' + INTERVAL '30 minute'  -- A isporučeno je za 30 minuta. NA VRIJEME!
    );

INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (1, 1, 1, 1);
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (1, 1, 2, 'ACCEPTED');

-- PORUDŽBINA #2: CANCELED, prihvaćena od Jovana (ID=2)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id) VALUES
    (2, 'CANCELED', 'CASH', 'REGULAR', NOW() - INTERVAL '1 day', 150.00, 1300.00, 1, 1, 2);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (2, 1, 2, 11),
                                                                          (3, 1, 2, 14);

INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (2, 2, 2, 'ACCEPTED');


-- PORUDŽBINA #3: DELIVERED, od Jovana (ID=2)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at) VALUES
    (3, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '1 day', 150.00, 1350.00, 1, 1, 2,
     NOW() - INTERVAL '1 day' + INTERVAL '40 minute', -- Rok isporuke (ETA) je bio 40 minuta
     NOW() - INTERVAL '1 day' + INTERVAL '55 minute'   -- A isporučeno je za 55 minuta. KASNI!
    );
-- Ostali inserti za porudžbinu #3 ostaju isti...
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (4, 2, 3, 21);

INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (3, 3, 2, 'ACCEPTED');

-- PORUDŽBINA #4: SCHEDULED_PENDING (nema vozača)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, scheduled_for) VALUES
    (4, 'SCHEDULED_PENDING', 'CARD', 'SCHEDULED', NOW(), 150.00, 4750.00, 1, 1, NOW() + INTERVAL '1 day');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (5, 2, 4, 16),
                                                                          (6, 1, 4, 20);


-- PORUDŽBINA #5: CREATED (nema vozača, čeka potvrdu menadžera)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id) VALUES
    (5, 'CREATED', 'COMBINED', 'REPEATING', NOW(), 150.00, 2650.00, 1, 1);

INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (7, 1, 5, 6),
                                                                          (8, 1, 5, 9);

INSERT INTO repeating_order (id, original_order_id, repeat_type, day_of_week, delivery_time, active, unlimited) VALUES
    (1, 5, 'WEEKLY', 'FRIDAY', '19:00:00', true, true);

UPDATE orders SET repeating_order_template_id = 1 WHERE id = 5;


-- PORUDŽBINA #6: CONFIRMED (nema vozača, ali ponuđena nekome - idealno za test dashboarda)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id) VALUES
    (6, 'CONFIRMED', 'CASH', 'REGULAR', NOW() - INTERVAL '30 minute', 150.00, 1350.00, 1, 1);

INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (9, 2, 6, 21);

-- Ponuda poslata Petru (ID=8) da bi se pojavila na njegovom dashboardu
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (5, 6, 8, 'SENT');




-- ====================================================================
-- ISPRAVLJENA PORUDŽBINA #7: CONFIRMED, ponuđena Jovanu (ID=2)
-- Računica: (1x Carbonara @ 1250) + Dostava @ 150 = 1400.00
-- ====================================================================

-- Porudžbina je potvrđena od strane restorana i sada čeka na dodjelu
-- Ne može imati 'delivered_at' i ne bi trebala još imati 'driver_id'
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, card_amount, cash_amount) VALUES
    (7, 'CONFIRMED', 'CARD', 'REGULAR', NOW() - INTERVAL '2 day', 150.00, 1400.00, 1, 1, 1400.00, 0.00);

-- Stavke za porudžbinu #7
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (10, 1, 7, 1); -- 1x Pasta Carbonara


-- Ponuda je poslana Jovanu (ID=2) i ima status 'SENT'
INSERT INTO order_offer (id, order_id, driver_id, status, created_at, reason_for_rejection) VALUES
    (6, 7, 2, 'SENT', NOW() - INTERVAL '1 day', NULL);


-- ====================================================================
-- NOVI SCENARIO: Porudžbina ID=8, odbačena od strane Vozača ID=8
-- ====================================================================

-- KORAK 1: Kreiramo novu porudžbinu sa ID=8.
-- Status joj je 'CONFIRMED' jer čeka na dodjelu vozaču.
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id) VALUES
    (8, 'CONFIRMED', 'CARD', 'REGULAR', NOW() - INTERVAL '1 hour', 200.00, 1500.00, 1, 1);

-- KORAK 2: Dodajemo stavke za tu porudžbinu.
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (11, 1, 8, 31); -- Npr. 1x Pizza Capricciosa

-- KORAK 3: Kreiramo ponudu za Vozača #8 i odmah je označavamo kao ODBIJENU (REJECTED).
INSERT INTO order_offer (id, order_id, driver_id, status, created_at, reason_for_rejection) VALUES
    (8, 8, 8, 'REJECTED', NOW() - INTERVAL '30 minute', 'Saobraćajna gužva u tom dijelu grada.');





-- Porudžbina je potvrđena od strane restorana i sada čeka na dodjelu
-- Ne može imati 'delivered_at' i ne bi trebala još imati 'driver_id'
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, card_amount, cash_amount) VALUES
    (20, 'CONFIRMED', 'CARD', 'REGULAR', NOW() - INTERVAL '2 day', 150.00, 1400.00, 1, 1, 1400.00, 0.00);

-- Stavke za porudžbinu #7
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (20, 1, 20, 1); -- 1x Pasta Carbonara


-- Ponuda je poslana Jovanu (ID=2) i ima status 'SENT'
INSERT INTO order_offer (id, order_id, driver_id, status, created_at, reason_for_rejection) VALUES
    (20, 20, 2, 'SENT', NOW() - INTERVAL '1 day', NULL);








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



-- OCJENE ZA DOSTAVLJAČE (DriverRating)
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (1, 1, 2, 1, 5, 3, 5, 4, 5, 5, 5);


-- Resetovanje sekvenci
ALTER SEQUENCE customer_id_seq RESTART WITH 100;
ALTER SEQUENCE driver_id_seq RESTART WITH 100;
ALTER SEQUENCE operator_id_seq RESTART WITH 100;
ALTER SEQUENCE manager_id_seq RESTART WITH 100;
ALTER SEQUENCE administrator_id_seq RESTART WITH 100;
ALTER SEQUENCE support_administrator_id_seq RESTART WITH 100;
ALTER SEQUENCE address_id_seq RESTART WITH 100;
ALTER SEQUENCE restaurant_id_seq RESTART WITH 100;
ALTER SEQUENCE menu_id_seq RESTART WITH 100;
ALTER SEQUENCE menu_version_id_seq RESTART WITH 100;
ALTER SEQUENCE menu_item_id_seq RESTART WITH 100;
ALTER SEQUENCE menu_item_version_id_seq RESTART WITH 100;
ALTER SEQUENCE orders_id_seq RESTART WITH 100;
ALTER SEQUENCE order_item_id_seq RESTART WITH 100;
ALTER SEQUENCE problem_category_id_seq RESTART WITH 100;
ALTER SEQUENCE allergen_id_seq RESTART WITH 100;
ALTER SEQUENCE diet_type_id_seq RESTART WITH 100;
ALTER SEQUENCE driver_rating_id_seq RESTART WITH 100;
ALTER SEQUENCE order_offer_id_seq RESTART WITH 100;
ALTER SEQUENCE repeating_order_id_seq RESTART WITH 100;