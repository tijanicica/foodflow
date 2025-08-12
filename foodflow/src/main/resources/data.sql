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


-- STAVKE MENIJA (SADA SA TIPOM: MAIN_COURSE, DESSERT, DRINK)
-- ====================================================================
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
-- 1. Pasta Paradise (IDs: 1-11)
    (1, 'Pasta Carbonara', 'Pancetta, jaja, parmezan', 'https://images.unsplash.com/photo-1608797223204-a2e5f39e5855', 'MAIN_COURSE'),
    (2, 'Pizza Margherita', 'Paradajz, mocarela, bosiljak', 'https://images.unsplash.com/photo-1595854337175-53a06f8eda5e', 'MAIN_COURSE'),
    (3, 'Lasagne Bolognese', 'Mleveno meso, bešamel', 'https://images.unsplash.com/photo-1574894709920-81b29d819163', 'MAIN_COURSE'),
    (4, 'Gnocchi al Pesto', 'Njoke sa pesto sosom', 'https://images.unsplash.com/photo-1621237022561-0262137e9628', 'MAIN_COURSE'),
    (5, 'Bruschetta', 'Paradajz, beli luk, maslinovo ulje', 'https://images.unsplash.com/photo-1505253716362-afb74bf60d44', 'MAIN_COURSE'),
    (6, 'Coca-Cola', '0.33l', 'https://images.unsplash.com/photo-1622483767028-3f6e282a54e8', 'DRINK'),
    (7, 'Espresso', 'Domaća kafa', 'https://images.unsplash.com/photo-1599394022918-5003c3a42055', 'DRINK'),
    (8, 'Limunada', 'Sveže ceđena', 'https://images.unsplash.com/photo-1605600139994-0f63c4a29a03', 'DRINK'),
    (9, 'Tiramisu', 'Kafa, maskarpone, piškote', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', 'DESSERT'),
    (10, 'Panna Cotta', 'Sa prelivom od šumskog voća', 'https://images.unsplash.com/photo-1587314168485-3236d6710814', 'DESSERT'),
    (11, 'Cheesecake', 'Klasični cheesecake', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 'DESSERT'),
-- 2. Green Garden (IDs: 12-22)
    (12, 'Caesar Salata', 'Piletina, krutoni, preliv', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9', 'MAIN_COURSE'),
    (13, 'Quinoa Salata', 'Kinoa, povrće, limun', 'https://images.unsplash.com/photo-1551248429-4e6786348237', 'MAIN_COURSE'),
    (14, 'Potaž od bundeve', 'Kremasta supa od bundeve', 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a', 'MAIN_COURSE'),
    (15, 'Pileći file sa grilovanim povrćem', 'Zdrav i ukusan obrok', 'https://images.unsplash.com/photo-1600891964092-4316c288032e', 'MAIN_COURSE'),
    (16, 'Losos na žaru', 'Svež losos sa šparglom', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2', 'MAIN_COURSE'),
    (17, 'Sveže ceđena narandža', '0.3l', 'https://images.unsplash.com/photo-1600271886742-f698a3a4b99c', 'DRINK'),
    (18, 'Zeleni čaj', 'Topli napitak', 'https://images.unsplash.com/photo-1627435601361-ec25f2b74421', 'DRINK'),
    (19, 'Voda', 'Rosa 0.5l', 'https://images.unsplash.com/photo-1553564262-132d586d0e44', 'DRINK'),
    (20, 'Voćna Salata', 'Sveže sezonsko voće', 'https://images.unsplash.com/photo-1562347810-092264645332', 'DESSERT'),
    (21, 'Chia puding', 'Sa kokosovim mlekom i voćem', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773', 'DESSERT'),
    (22, 'Energetske kuglice', ' urme, orasi, kakao', 'https://images.unsplash.com/photo-1610970881699-44a5c8a01490', 'DESSERT'),
-- 3. Burger Queen (IDs: 23-33)
    (23, 'Classic Cheeseburger', 'Junetina, čedar, salata', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 'MAIN_COURSE'),
    (24, 'Dupli Bacon Burger', 'Dupla junetina, hrskava slanina', 'https://images.unsplash.com/photo-1550950158-d09cd61ae321', 'MAIN_COURSE'),
    (25, 'Veggie Burger', 'Pljeskavica od povrća, avokado', 'https://images.unsplash.com/photo-1549611016-3a70d8a55246', 'MAIN_COURSE'),
    (26, 'Pileća krilca', 'Hrskava, pikantna krilca', 'https://images.unsplash.com/photo-1562967916-33221c27d425', 'MAIN_COURSE'),
    (27, 'Pomfrit', 'Hrskavi pomfrit', 'https://images.unsplash.com/photo-1576107290643-44141072a22b', 'MAIN_COURSE'),
    (28, 'Pivo', 'Domaće kraft pivo 0.5l', 'https://images.unsplash.com/photo-1587888792224-b9036952136e', 'DRINK'),
    (29, 'Ice Tea', 'Ledeni čaj od breskve', 'https://images.unsplash.com/photo-1556755214-a9b44b8e2195', 'DRINK'),
    (30, 'Sprite', '0.5l', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3', 'DRINK'),
    (31, 'Milkshake od čokolade', 'Gust i kremast', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699', 'DESSERT'),
    (32, 'Američke palačinke', 'Sa javorovim sirupom', 'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7', 'DESSERT'),
    (33, 'Krofna sa glazurom', 'Čokoladna glazura', 'https://images.unsplash.com/photo-1551024601-bec7828ab647', 'DESSERT');
-- 4. Sushi Heaven (IDs: 34-44)
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
    (34, 'California Roll', 'Krab, avokado, krastavac', 'https://images.unsplash.com/photo-1611142028751-5f79f22d43a0', 'MAIN_COURSE'),
    (35, 'Sake Nigiri', 'Sveži losos na pirinču', 'https://images.unsplash.com/photo-1615361200141-f45040f367be', 'MAIN_COURSE'),
    (36, 'Spicy Tuna Roll', 'Pikantna tuna, krastavac', 'https://images.unsplash.com/photo-1617196035154-9b6a6b21841b', 'MAIN_COURSE'),
    (37, 'Miso Supa', 'Tradicionalna japanska supa', 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf', 'MAIN_COURSE'),
    (38, 'Edamame', 'Kuvana soja sa morskom solju', 'https://images.unsplash.com/photo-1599497840638-380d306b4545', 'MAIN_COURSE'),
    (39, 'Sake (Japanese Rice Wine)', 'Topli ili hladni', 'https://images.unsplash.com/photo-1553531889-a42f2b31174a', 'DRINK'),
    (40, 'Asahi Beer', 'Japansko pivo', 'https://images.unsplash.com/photo-1623124220023-1d0ab91a27e7', 'DRINK'),
    (41, 'Zeleni čaj', 'Sencha ili Matcha', 'https://images.unsplash.com/photo-1627435601361-ec25f2b74421', 'DRINK'),
    (42, 'Mochi Sladoled', 'Sladoled u testu od pirinča', 'https://images.unsplash.com/photo-1625821929949-0d6a2f3a6b5a', 'DESSERT'),
    (43, 'Matcha Cheesecake', 'Kremasti kolač od sira', 'https://images.unsplash.com/photo-1587314168485-3236d6710814', 'DESSERT'),
(44, 'Dorayaki', 'Japanske palačinke sa pasuljem', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b', 'DESSERT');

-- 5. Meraklija Grill (IDs: 45-55)
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
    (45, 'Ćevapi 10 komada', 'Domaći ćevapi sa lukom u lepinji', 'https://images.unsplash.com/photo-1565299585323-21d1d1437a3a', 'MAIN_COURSE'),
    (46, 'Pljeskavica na kajmaku', 'Gurmanska pljeskavica sa kajmakom', 'https://images.unsplash.com/photo-1628219808429-1a0e3a67039a', 'MAIN_COURSE'),
    (47, 'Mešano meso', 'Porcija za dvoje sa prilozima', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 'MAIN_COURSE'),
    (48, 'Vešalica', 'Svinjska vešalica na žaru', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd', 'MAIN_COURSE'),
    (49, 'Šopska salata', 'Paradajz, krastavac, paprika, sir', 'https://images.unsplash.com/photo-1551248429-4e6786348237', 'MAIN_COURSE'),
    (50, 'Jelen Pivo', '0.5l', 'https://images.unsplash.com/photo-1618885474210-63c6515aa025', 'DRINK'),
    (51, 'Domaća rakija', 'Šljivovica', 'https://images.unsplash.com/photo-1621502224050-928c03795914', 'DRINK'),
    (52, 'Knjaz Miloš', 'Mineralna voda 1l', 'https://images.unsplash.com/photo-1553564262-132d586d0e44', 'DRINK'),
    (53, 'Orasnice', 'Domaći kolač sa orasima', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 'DESSERT'),
    (54, 'Tufahije', 'Kuvane jabuke punjene orasima', 'https://images.unsplash.com/photo-1587314168485-3236d6710814', 'DESSERT'),
(55, 'Palačinke sa džemom', 'Dve palačinke', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93', 'DESSERT');

-- 6. The Golden Spoon (IDs: 56-66)
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
    (56, 'Biftek u sosu od bibera', 'Najfiniji komad mesa', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b', 'MAIN_COURSE'),
    (57, 'Rižoto sa pečurkama', 'Kremasti rižoto sa tartufima', 'https://images.unsplash.com/photo-1595908129323-c2a831e5447a', 'MAIN_COURSE'),
    (58, 'Fileti lososa', 'Na žaru sa blitvom', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2', 'MAIN_COURSE'),
    (59, 'Pačije grudi', 'Sa sosom od pomorandže', 'https://images.unsplash.com/photo-1574945331934-2e99f43a4122', 'MAIN_COURSE'),
    (60, 'Salata sa kozjim sirom', 'Grilovani sir, rukola, orasi', 'https://images.unsplash.com/photo-1505253716362-afb74bf60d44', 'MAIN_COURSE'),
    (61, 'Chardonnay', 'Čaša belog vina', 'https://images.unsplash.com/photo-1578911373434-0cb19b29312a', 'DRINK'),
    (62, 'Prosecco', 'Čaša penušavog vina', 'https://images.unsplash.com/photo-1590799131298-c3e1e4a648e5', 'DRINK'),
    (63, 'Negroni', 'Klasični italijanski koktel', 'https://images.unsplash.com/photo-1621257124135-373f7c46f345', 'DRINK'),
    (64, 'Čokoladni sufle', 'Sa toplim jezgrom', 'https://images.unsplash.com/photo-1587314168485-3236d6710814', 'DESSERT'),
    (65, 'Creme Brulee', 'Hrskava korica od karamele', 'https://images.unsplash.com/photo-1543322778-90f3b499b80b', 'DESSERT'),
    (66, 'Selekcija sireva', 'Domaći i strani sirevi', 'https://images.unsplash.com/photo-1627435601361-ec25f2b74421', 'DESSERT');

-- 7. Pizza Corner (IDs: 67-77)
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
    (67, 'Capricciosa', 'Šunka, pečurke, sir, masline', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', 'MAIN_COURSE'),
    (68, 'Quattro Formaggi', 'Četiri vrste sira', 'https://images.unsplash.com/photo-1593560704563-f176a2eb61db', 'MAIN_COURSE'),
    (69, 'Vegetariana', 'Sezonsko povrće', 'https://images.unsplash.com/photo-1594007654729-407eedc4be65', 'MAIN_COURSE'),
    (70, 'Pancerota', 'Punjeno testo sa šunkom i sirom', 'https://images.unsplash.com/photo-1627222239595-a8a25a2e0717', 'MAIN_COURSE'),
    (71, 'Beli luk hleb', 'Sa sirom i peršunom', 'https://images.unsplash.com/photo-1598679253443-4b5c7e753e61', 'MAIN_COURSE'),
    (72, 'Coca-Cola Zero', '0.5l', 'https://images.unsplash.com/photo-1554756869-168a6b3b02a9', 'DRINK'),
    (73, 'Fanta', '0.5l', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3', 'DRINK'),
    (74, 'Heineken Pivo', '0.4l', 'https://images.unsplash.com/photo-1618885474210-63c6515aa025', 'DRINK'),
    (75, 'Čokoladna Pizza', 'Nutela, plazma, voće', 'https://images.unsplash.com/photo-1587314168485-3236d6710814', 'DESSERT'),
    (76, 'Voćni Kup', 'Sladoled sa svežim voćem', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 'DESSERT'),
(77, 'Ledene Kocke', 'Klasičan domaći kolač', 'https://images.unsplash.com/photo-1543322778-90f3b499b80b', 'DESSERT');

-- 8. Vegan Oasis (IDs: 78-88)
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
    (78, 'Falafel Bowl', 'Falafel, humus, salata, tahini preliv', 'https://images.unsplash.com/photo-1594212699903-89169655fab6', 'MAIN_COURSE'),
    (79, 'Sočivo Burger', 'Burger od sočiva sa veganskim sirom', 'https://images.unsplash.com/photo-1521319320833-c348e3a2f768', 'MAIN_COURSE'),
    (80, 'Buddha Bowl', 'Raznovrsno povrće, kinoa i tofu', 'https://images.unsplash.com/photo-1540420773420-2850a86b2b50', 'MAIN_COURSE'),
    (81, 'Veganska Musaka', 'Plavi patlidžan, sočivo, krompir', 'https://images.unsplash.com/photo-1598289431512-b973a5ba4922', 'MAIN_COURSE'),
    (82, 'Burito sa povrćem', 'Crveni pasulj, kukuruz, pirinač, gvakamole', 'https://images.unsplash.com/photo-1565299585323-21d1d1437a3a', 'MAIN_COURSE'),
    (83, 'Kombucha', 'Fermentisani čaj', 'https://images.unsplash.com/photo-1556755214-a9b44b8e2195', 'DRINK'),
    (84, 'Ceđeni sok Cvekla-Jabuka', 'Sveže ceđeno', 'https://images.unsplash.com/photo-1600271886742-f698a3a4b99c', 'DRINK'),
    (85, 'Zeleni Smoothie', 'Spanać, banana, bademovo mleko', 'https://images.unsplash.com/photo-1610970881699-44a5c8a01490', 'DRINK'),
    (86, 'Sirova torta od limuna', 'Indijski orah, limun, urme', 'https://images.unsplash.com/photo-1562347810-092264645332', 'DESSERT'),
    (87, 'Avokado-Čoko Mus', 'Kremasti mus od avokada i kakaoa', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773', 'DESSERT'),
    (88, 'Pečene jabuke sa cimetom', 'Tople jabuke sa cimetom i orasima', 'https://images.unsplash.com/photo-1587314168485-3236d6710814', 'DESSERT');

-- 9. Steak House (IDs: 89-99)
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
    (89, 'Rib-eye Steak', '300g odležalog junećeg mesa', 'https://images.unsplash.com/photo-1551028150-64b9f398f67b', 'MAIN_COURSE'),
    (90, 'T-Bone Steak', '500g sa koskom, serviran sa puterom', 'https://images.unsplash.com/photo-1546964124-6cce460f09ef', 'MAIN_COURSE'),
    (91, 'Ramstek', 'Sočan i ukusan, 250g', 'https://images.unsplash.com/photo-1629734180429-775b31e9c240', 'MAIN_COURSE'),
    (92, 'Juneći Burger', 'Domaća lepinja, ajzberg, paradajz', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 'MAIN_COURSE'),
    (93, 'Krompir u foliji', 'Sa kajmakom i začinskim biljem', 'https://images.unsplash.com/photo-1518779578993-6bae68262ae2', 'MAIN_COURSE'),
    (94, 'Jack Daniels', 'Viski, 0.03l', 'https://images.unsplash.com/photo-1587888792224-b9036952136e', 'DRINK'),
    (95, 'Crno vino', 'Cabernet Sauvignon, čaša', 'https://images.unsplash.com/photo-1553531889-a42f2b31174a', 'DRINK'),
    (96, 'Coca-Cola', '0.33l', 'https://images.unsplash.com/photo-1622483767028-3f6e282a54e8', 'DRINK'),
    (97, 'New York Cheesecake', 'Klasični američki cheesecake', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 'DESSERT'),
    (98, 'Čokoladni Lava Kolač', 'Sa sladoledom od vanile', 'https://images.unsplash.com/photo-1587314168485-3236d6710814', 'DESSERT'),
    (99, 'Tiramisu', 'Italijanski klasik', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', 'DESSERT');


-- 10. Gluten-Free Heaven (IDs: 100-110)
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
    (100, 'Bezglutenska pica', 'Sa pelatom, veganskim sirom i povrćem', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 'MAIN_COURSE'),
    (101, 'Piletina sa kinoom', 'Grilovana piletina sa kinoom i salatom', 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf', 'MAIN_COURSE'),
    (102, 'Salata sa avokadom', 'Avokado, piletina, čeri paradajz, miks salata', 'https://images.unsplash.com/photo-1505253716362-afb74bf60d44', 'MAIN_COURSE'),
    (103, 'Rižoto sa gamborima', 'Bezglutenski rižoto sa gamborima i šafranom', 'https://images.unsplash.com/photo-1595908129323-c2a831e5447a', 'MAIN_COURSE'),
    (104, 'Lazanja sa povrćem', 'Bezglutenske kore sa patlidžanom i tikvicama', 'https://images.unsplash.com/photo-1574894709920-81b29d819163', 'MAIN_COURSE'),
    (105, 'Sveže ceđena jabuka', '0.3l', 'https://images.unsplash.com/photo-1600271886742-f698a3a4b99c', 'DRINK'),
    (106, 'Kafa bez kofeina', 'Espresso bez kofeina', 'https://images.unsplash.com/photo-1599394022918-5003c3a42055', 'DRINK'),
    (107, 'Mineralna voda', 'Knjaz Miloš 0.5l', 'https://images.unsplash.com/photo-1553564262-132d586d0e44', 'DRINK'),
    (108, 'Palačinke od heljde', 'Sa džemom bez šećera', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93', 'DESSERT'),
    (109, 'Mafini od badema', 'Bez glutena i šećera', 'https://images.unsplash.com/photo-1607478900766-efe13248b125', 'DESSERT'),
    (110, 'Voćni ražnjići', 'Sveže voće na štapiću', 'https://images.unsplash.com/photo-1562347810-092264645332', 'DESSERT');

-- 11. Fish & Chips (IDs: 111-121)
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
    (111, 'Oslić i pomfrit', 'Klasični fish and chips sa tartar sosom', 'https://images.unsplash.com/photo-1599923572242-3a5576145326', 'MAIN_COURSE'),
    (112, 'Lignje na žaru', 'Sveže lignje sa dalmatinskim varivom', 'https://images.unsplash.com/photo-1616091216773-8a2b5e0b7b0f', 'MAIN_COURSE'),
    (113, 'Riblja čorba', 'Domaća riblja čorba sa komadićima ribe', 'https://images.unsplash.com/photo-1574894709920-81b29d819163', 'MAIN_COURSE'),
    (114, 'Salata od morskih plodova', 'Škampi, dagnje, hobotnica, masline', 'https://images.unsplash.com/photo-1594343384813-89510619a0a1', 'MAIN_COURSE'),
    (115, 'Pohovani štapići od sira', 'Mocarela štapići sa slatko-ljutim sosom', 'https://images.unsplash.com/photo-1608797223204-a2e5f39e5855', 'MAIN_COURSE'),
    (116, 'Zaječarsko pivo', '0.5l', 'https://images.unsplash.com/photo-1618885474210-63c6515aa025', 'DRINK'),
    (117, 'Belo vino', 'Čaša Grašca', 'https://images.unsplash.com/photo-1578911373434-0cb19b29312a', 'DRINK'),
    (118, 'Pepsi', '0.33l', 'https://images.unsplash.com/photo-1622483767028-3f6e282a54e8', 'DRINK'),
    (119, 'Tri leće', 'Sočni kolač sa mlekom', 'https://images.unsplash.com/photo-1543322778-90f3b499b80b', 'DESSERT'),
    (120, 'Sladoled', 'Dve kugle po izboru', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 'DESSERT'),
    (121, 'Pita sa jabukama', 'Domaća pita', 'https://images.unsplash.com/photo-1587314168485-3236d6710814', 'DESSERT');

-- 12. Wok Express (IDs: 122-132)
INSERT INTO menu_item (id, name, description, image_url, type) VALUES
    (122, 'Piletina sa karijem', 'Piletina u crvenom kari sosu sa pirinčem', 'https://images.unsplash.com/photo-1565299585323-21d1d1437a3a', 'MAIN_COURSE'),
    (123, 'Slatko-kisela piletina', 'Klasično kinesko jelo sa ananasom', 'https://images.unsplash.com/photo-1582512968953-c91753063543', 'MAIN_COURSE'),
    (124, 'Nudle sa povrćem', 'Pržene nudle sa svežim povrćem i soja sosom', 'https://images.unsplash.com/photo-1585032226651-759b368d7246', 'MAIN_COURSE'),
    (125, 'Govedina sa brokolijem', 'Sočna govedina u sosu od ostriga', 'https://images.unsplash.com/photo-1600891964092-4316c288032e', 'MAIN_COURSE'),
    (126, 'Prolećne rolnice', 'Hrskave rolnice sa povrćem (3 kom)', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe', 'MAIN_COURSE'),
    (127, 'Kinesko pivo Tsingtao', '0.33l', 'https://images.unsplash.com/photo-1623124220023-1d0ab91a27e7', 'DRINK'),
    (128, 'Čaj od jasmina', 'Tradicionalni kineski čaj', 'https://images.unsplash.com/photo-1627435601361-ec25f2b74421', 'DRINK'),
    (129, 'Sok od ličija', 'Egzotični voćni sok', 'https://images.unsplash.com/photo-1605600139994-0f63c4a29a03', 'DRINK'),
    (130, 'Pohovana banana', 'Sa medom i susamom', 'https://images.unsplash.com/photo-1615870215124-4f013ab3b0a2', 'DESSERT'),
    (131, 'Pohovani sladoled', 'Toplo-hladni dezert', 'https://images.unsplash.com/photo-1587314168485-3236d6710814', 'DESSERT'),
    (132, 'Kolačići sreće', 'Kolačić sa porukom (2 kom)', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 'DESSERT');


-- VERZIJE STAVKI MENIJA (cene, popularnost, dostupnost)
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES
    -- Pasta Paradise
    (1, 1250, true, true, 1, 1), (2, 1100, true, false, 2, 1),
    (3, 1400, true, false, 3, 1), (4, 1150, true, false, 4, 1),
    (5, 550, true, false, 5, 1), (6, 250, true, false, 6, 1),
    (7, 180, true, false, 7, 1), (8, 320, true, false, 8, 1),
    (9, 650, true, false, 9, 1), (10, 450, true, false, 10, 1),
    (11, 550, true, false, 11, 1),
    -- Green Garden
    (12, 1150, true, true, 12, 2), (13, 1200, true, false, 13, 2),
    (14, 450, true, false, 14, 2), (15, 1350, true, false, 15, 2),
    (16, 1800, true, false, 16, 2), (17, 350, true, false, 17, 2),
    (18, 220, true, false, 18, 2), (19, 150, true, false, 19, 2),
    (20, 500, true, false, 20, 2), (21, 600, true, false, 21, 2),
    (22, 400, true, false, 22, 2),
    -- Burger Queen
    (23, 850, true, true, 23, 3), (24, 1050, true, false, 24, 3),
    (25, 900, true, false, 25, 3), (26, 750, true, false, 26, 3),
    (27, 300, true, false, 27, 3), (28, 350, true, false, 28, 3),
    (29, 280, true, false, 29, 3), (30, 250, true, false, 30, 3),
    (31, 450, true, false, 31, 3), (32, 550, true, false, 32, 3),
    (33, 250, true, false, 33, 3);
-- Dodavanje OGRANIČENE dostupnosti za po jednu stavku
UPDATE menu_item_version SET time_from = '09:00:00', time_to = '12:00:00' WHERE id = 5; -- Bruschetta (samo za doručak)
UPDATE menu_item_version SET time_from = '12:00:00', time_to = '15:00:00' WHERE id = 14; -- Potaž od bundeve (samo za ručak)
UPDATE menu_item_version SET time_from = '14:00:00', time_to = '01:00:00' WHERE id = 31; -- Milkshake (tek popodne)


INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES
    -- Sushi Heaven
    (34, 1500, true, true, 34, 4), -- POPULARNO
    (35, 400, true, false, 35, 4),
    (36, 1600, true, false, 36, 4),
    (37, 350, true, false, 37, 4),
    (38, 450, true, false, 38, 4),
    (39, 700, true, false, 39, 4),
    (40, 500, true, false, 40, 4),
    (41, 250, true, false, 41, 4),
    (42, 650, true, false, 42, 4),
    (43, 800, true, false, 43, 4),
    (44, 400, true, false, 44, 4),
    -- Meraklija Grill
    (45, 600, true, true, 45, 5), -- POPULARNO
    (46, 950, true, false, 46, 5),
    (47, 1800, true, false, 47, 5),
    (48, 850, true, false, 48, 5),
    (49, 300, true, false, 49, 5),
    (50, 280, true, false, 50, 5),
    (51, 250, true, false, 51, 5),
    (52, 180, true, false, 52, 5),
    (53, 350, true, false, 53, 5),
    (54, 450, true, false, 54, 5),
    (55, 300, true, false, 55, 5),
    -- The Golden Spoon
    (56, 2800, true, true, 56, 6), -- POPULARNO
    (57, 1900, true, false, 57, 6),
    (58, 2400, true, false, 58, 6),
    (59, 2600, true, false, 59, 6),
    (60, 1100, true, false, 60, 6),
    (61, 600, true, false, 61, 6),
    (62, 700, true, false, 62, 6),
    (63, 850, true, false, 63, 6),
    (64, 800, true, false, 64, 6),
    (65, 700, true, false, 65, 6),
    (66, 1200, true, false, 66, 6);

-- Sushi Heaven, Meraklija Grill, The Golden Spoon
UPDATE menu_item_version SET time_from = '15:00:00', time_to = '18:00:00' WHERE id = 35; -- Sake Nigiri (samo za happy hour)
UPDATE menu_item_version SET time_from = '11:00:00', time_to = '22:00:00' WHERE id = 46; -- Pljeskavica (nije dostupna za rani doručak)
UPDATE menu_item_version SET time_from = '18:00:00', time_to = '23:00:00' WHERE id = 58; -- Fileti lososa (samo za večeru)

INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES
    -- Pizza Corner
    (67, 1150, true, true, 67, 7), -- POPULARNO
    (68, 1250, true, false, 68, 7),
    (69, 1100, true, false, 69, 7),
    (70, 950, true, false, 70, 7),
    (71, 400, true, false, 71, 7),
    (72, 280, true, false, 72, 7),
    (73, 280, true, false, 73, 7),
    (74, 350, true, false, 74, 7),
    (75, 1300, true, false, 75, 7),
    (76, 500, true, false, 76, 7),
    (77, 450, true, false, 77, 7),
    -- Vegan Oasis
    (78, 1100, true, true, 78, 8), -- POPULARNO
    (79, 950, true, false, 79, 8),
    (80, 1200, true, false, 80, 8),
    (81, 1250, true, false, 81, 8),
    (82, 900, true, false, 82, 8),
    (83, 400, true, false, 83, 8),
    (84, 380, true, false, 84, 8),
    (85, 550, true, false, 85, 8),
    (86, 700, true, false, 86, 8),
    (87, 650, true, false, 87, 8),
    (88, 500, true, false, 88, 8),
    -- Steak House
    (89, 2900, true, true, 89, 9), -- POPULARNO
    (90, 3500, true, false, 90, 9),
    (91, 2600, true, false, 91, 9),
    (92, 1400, true, false, 92, 9),
    (93, 450, true, false, 93, 9),
    (94, 480, true, false, 94, 9),
    (95, 550, true, false, 95, 9),
    (96, 280, true, false, 96, 9),
    (97, 600, true, false, 97, 9),
    (98, 700, true, false, 98, 9),
    (99, 650, true, false, 99, 9);

-- Pizza Corner, Vegan Oasis, Steak House
UPDATE menu_item_version SET time_from = '12:00:00', time_to = '16:00:00' WHERE id = 68; -- Quattro Formaggi (ponuda za ručak)
UPDATE menu_item_version SET time_from = '17:00:00', time_to = '21:00:00' WHERE id = 81; -- Veganska Musaka (dostupna samo za večeru)
UPDATE menu_item_version SET time_from = '18:00:00', time_to = '01:00:00' WHERE id = 91; -- Ramstek (tek od 18h)

INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id) VALUES
    -- Gluten-Free Heaven
    (100, 1300, true, true, 100, 10), -- POPULARNO
    (101, 1400, true, false, 101, 10),
    (102, 1150, true, false, 102, 10),
    (103, 1600, true, false, 103, 10),
    (104, 1350, true, false, 104, 10),
    (105, 300, true, false, 105, 10),
    (106, 200, true, false, 106, 10),
    (107, 180, true, false, 107, 10),
    (108, 600, true, false, 108, 10),
    (109, 400, true, false, 109, 10),
    (110, 350, true, false, 110, 10),
    -- Fish & Chips
    (111, 900, true, true, 111, 11), -- POPULARNO
    (112, 1500, true, false, 112, 11),
    (113, 500, true, false, 113, 11),
    (114, 1600, true, false, 114, 11),
    (115, 600, true, false, 115, 11),
    (116, 300, true, false, 116, 11),
    (117, 450, true, false, 117, 11),
    (118, 250, true, false, 118, 11),
    (119, 480, true, false, 119, 11),
    (120, 350, true, false, 120, 11),
    (121, 400, true, false, 121, 11),
    -- Wok Express
    (122, 1300, true, true, 122, 12), -- POPULARNO
    (123, 1350, true, false, 123, 12),
    (124, 1100, true, false, 124, 12),
    (125, 1450, true, false, 125, 12),
    (126, 550, true, false, 126, 12),
    (127, 400, true, false, 127, 12),
    (128, 250, true, false, 128, 12),
    (129, 300, true, false, 129, 12),
    (130, 450, true, false, 130, 12),
    (131, 550, true, false, 131, 12),
    (132, 200, true, false, 132, 12);
-- Gluten-Free Heaven, Fish & Chips, Wok Express
UPDATE menu_item_version SET time_from = '12:00:00', time_to = '15:00:00' WHERE id = 101; -- Piletina sa kinoom (specijalna ponuda za ručak)
UPDATE menu_item_version SET time_from = '13:00:00', time_to = '22:00:00' WHERE id = 112; -- Lignje na žaru (dostupne nakon 13h)
UPDATE menu_item_version SET time_from = '12:00:00', time_to = '16:00:00' WHERE id = 123; -- Slatko-kisela piletina (samo za ručak)

-- POVEZIVANJE STAVKI SA ALERGENIMA I TIPOVIMA ISHRANE
INSERT INTO menu_item_allergen (menu_item_id, allergen_id) VALUES
-- Pasta Paradise
(1,1), (1,2), (1,3), (2,1), (2,3), (3,1), (3,2), (3,3), (4,1), (4,3), (5,1), (9,1), (9,2), (9,3), (11,1), (11,3),
-- Burger Queen
(23,1), (23,3), (24,1), (24,3), (25,1), (26,1), (31,3), (32,1), (32,3), (33,1), (33,3);
INSERT INTO menu_item_allergen (menu_item_id, allergen_id) VALUES
    -- Sushi Heaven
    (43, 3), (44, 1),
    -- Meraklija Grill
    (45, 1), (46, 1), (46, 3), (47, 1), (48, 1), (49, 3), (53, 4), (54, 4), (55, 1), (55, 3),
    -- The Golden Spoon
    (56, 3), (57, 3),  (60, 3), (60, 4), (64, 1), (64, 2), (64, 3), (65, 2), (65, 3), (66, 3);
INSERT INTO menu_item_allergen (menu_item_id, allergen_id) VALUES
    -- Pizza Corner
    (67, 1), (67, 3), (68, 1), (68, 3), (69, 1), (70, 1), (70, 3), (71, 1), (71, 3), (75, 1), (75, 3), (75, 4), (76, 3), (77, 1), (77, 2), (77, 3),
    -- Vegan Oasis
    (79, 1), (86, 4), (88, 4),
    -- Steak House
    (92, 1), (92, 3), (93, 3), (97, 1), (97, 2), (97, 3), (98, 1), (98, 2), (98, 3), (99, 1), (99, 2), (99, 3);

INSERT INTO menu_item_allergen (menu_item_id, allergen_id) VALUES
    -- Gluten-Free Heaven
    (108, 2), (109, 3), (109, 4),
    -- Fish & Chips
    (111, 1),  (115, 1), (115, 3), (119, 1), (119, 2), (119, 3), (120, 3), (121, 1), (121, 2),
    -- Wok Express
 (123, 1), (124, 1),  (126, 1), (130, 1), (131, 1), (131, 3);
INSERT INTO menu_item_diet_type (menu_item_id, diet_type_id) VALUES
    -- Green Garden
    (13,1), (13,2), (13,3), (14,1), (14,2), (14,3), (20,1), (20,2), (20,3), (21,1), (21,2), (22,1),
    -- Burger Queen
    (25,1);
INSERT INTO menu_item_diet_type (menu_item_id, diet_type_id) VALUES
     -- Sushi Heaven
     (37, 2), (38, 2),
     -- Meraklija Grill
     (49, 1),
     -- The Golden Spoon
     (60, 1);

INSERT INTO menu_item_diet_type (menu_item_id, diet_type_id) VALUES
    -- Pizza Corner
    (69, 1),
    -- Vegan Oasis (SVE JE VEGANSKO)
    (78, 2), (79, 2), (80, 2), (81, 2), (82, 2), (86, 2), (87, 2), (88, 2);
INSERT INTO menu_item_diet_type (menu_item_id, diet_type_id) VALUES
     -- Gluten-Free Heaven (SVA GLAVNA JELA SU BEZ GLUTENA)
     (100, 3), (101, 3), (102, 3), (103, 3), (104, 3), (108, 3), (109, 3), (110, 3),
     (100, 2), (104, 1), -- Neka su i veganska/vegetarijanska
     -- Wok Express
     (124, 1), (126, 1);

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
    (2, 'CANCELED', 'CASH', 'REGULAR', NOW() - INTERVAL '1 day', 150.00, 1350.00, 1, 1, 2);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (2, 1, 2, 9), -- Tiramisu
    (3, 1, 2, 11); -- Cheesecake


INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (2, 2, 2, 'ACCEPTED');


-- PORUDŽBINA #3: DELIVERED, od Jovana (ID=2)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at) VALUES
    (3, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '1 day', 150.00, 1350.00, 1, 1, 2,
     NOW() - INTERVAL '1 day' + INTERVAL '40 minute', -- Rok isporuke (ETA) je bio 40 minuta
     NOW() - INTERVAL '1 day' + INTERVAL '55 minute'   -- A isporučeno je za 55 minuta. KASNI!
    );
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
        (4, 1, 3, 21);

INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (3, 3, 2, 'ACCEPTED');

-- PORUDŽBINA #4: SCHEDULED_PENDING (nema vozača)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, scheduled_for) VALUES
    (4, 'SCHEDULED_PENDING', 'CARD', 'SCHEDULED', NOW(), 150.00, 4250.00, 1, 1, NOW() + INTERVAL '1 day');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
  (5, 2, 4, 16), -- Losos na žaru
  (6, 1, 4, 20); -- Voćna Salata


-- PORUDŽBINA #5: CREATED (nema vozača, čeka potvrdu menadžera)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id) VALUES
    (5, 'CREATED', 'COMBINED', 'REPEATING', NOW(), 150.00, 1050.00, 1, 1);

INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (7, 1, 5, 6),
                                                                          (8, 1, 5, 9);


INSERT INTO repeating_order (id, original_order_id, repeat_type, day_of_week, delivery_time, active, unlimited) VALUES
    (1, 5, 'WEEKLY', 'FRIDAY', '19:00:00', true, true);

UPDATE orders SET repeating_order_template_id = 1 WHERE id = 5;


-- PORUDŽBINA #6: CONFIRMED (nema vozača, ali ponuđena nekome - idealno za test dashboarda)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id) VALUES
    (6, 'CONFIRMED', 'CASH', 'REGULAR', NOW() - INTERVAL '30 minute', 150.00, 1000.00, 1, 1);

INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (9, 1, 6, 23);

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
    (8, 'CONFIRMED', 'CARD', 'REGULAR', NOW() - INTERVAL '1 hour', 150.00, 1650.00, 1, 1);

-- KORAK 2: Dodajemo stavke za tu porudžbinu.
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (11, 1, 8, 34); -- Npr. 1x Pizza Capricciosa

-- KORAK 3: Kreiramo ponudu za Vozača #8 i odmah je označavamo kao ODBIJENU (REJECTED).
INSERT INTO order_offer (id, order_id, driver_id, status, created_at, reason_for_rejection) VALUES
    (8, 8, 8, 'REJECTED', NOW() - INTERVAL '30 minute', 'Saobraćajna gužva u tom dijelu grada.');



-- ====================================================================
-- KUPONI ZA KORISNIKA ID=1
-- ====================================================================
INSERT INTO coupon (id, code, date_from, date_to, active, used, customer_id) VALUES
    (1, 'FREEDELIVERY', '2025-08-01', '2025-09-01', true, false, 1),
    (2, 'FREEDELIVERY', '2025-08-01', '2025-09-01', true, false, 1);


-- ====================================================================
-- NOVA PORUDŽBINA #30: DELIVERED, SA KUPONOM I OCENOM
-- Računica: (1x Biftek @ 2800) + Dostava @ 150 - Kupon = 2800.00
-- ====================================================================

-- KORAK 1: Kreiramo porudžbinu i povezujemo je sa kuponom ID=1
-- Važno: total_price je 2800.00 jer je delivery_price 0 zbog kupona.
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, card_amount, delivered_at, coupon_id) VALUES
    (30, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '3 day', 0.00, 2800.00, 1, 1, 8, 2800.00, NOW() - INTERVAL '3 day' + INTERVAL '30 minute', 1);

-- KORAK 2: Dodajemo stavke za porudžbinu
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (30, 1, 30, 56); -- 1x Biftek u sosu od bibera

-- KORAK 3: Označavamo kupon ID=1 kao iskorišćen
UPDATE coupon SET used = true, usage_date = NOW() - INTERVAL '3 day' WHERE id = 1;

-- KORAK 4: Dodajemo ocenu za porudžbinu (OrderRating)
-- ID mora da se poklapa sa ID-jem porudžbine
INSERT INTO order_rating (id, quality, taste, portion_size) VALUES
    (30, 5, 5, 4); -- Odličan kvalitet i ukus, porcija dobra




-- Porudžbina je potvrđena od strane restorana i sada čeka na dodjelu
-- Ne može imati 'delivered_at' i ne bi trebala još imati 'driver_id'
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, card_amount, cash_amount) VALUES
    (20, 'CONFIRMED', 'CARD', 'REGULAR', NOW() - INTERVAL '2 day', 150.00, 1400.00, 1, 11, 1400.00, 0.00);

-- Stavke za porudžbinu #7
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (20, 1, 20, 1); -- 1x Pasta Carbonara


-- Ponuda je poslana Jovanu (ID=2) i ima status 'SENT'
INSERT INTO order_offer (id, order_id, driver_id, status, created_at, reason_for_rejection) VALUES
    (20, 20, 2, 'SENT', NOW() - INTERVAL '1 day', NULL);



-- Porudžbina je potvrđena od strane restorana i sada čeka na dodjelu
-- Ne može imati 'delivered_at' i ne bi trebala još imati 'driver_id'
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, card_amount, cash_amount) VALUES
    (21, 'READY_FOR_PICKUP', 'CARD', 'REGULAR', NOW() - INTERVAL '2 day', 150.00, 1400.00, 1, 13, 1400.00, 0.00);

-- Stavke za porudžbinu #7
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (21, 1, 21, 2); -- 1x Pasta Carbonara


-- Ponuda je poslana Jovanu (ID=2) i ima status 'SENT'
INSERT INTO order_offer (id, order_id, driver_id, status, created_at, reason_for_rejection) VALUES
    (21, 21, 2, 'SENT', NOW() - INTERVAL '1 day', NULL);





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