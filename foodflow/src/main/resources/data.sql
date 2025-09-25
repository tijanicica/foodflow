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


-- Support Administrator
INSERT INTO support_administrator (id, email, password, first_name, last_name, phone, role) VALUES
    (6, 'supportadmin@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Support', 'Adminović', '064123456', 'SUPPORT_ADMINISTRATOR');


-- Operator
INSERT INTO operator (id, support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (3, 6, 'operator@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Ana', 'Anić', '064555666', 'OPERATOR');
INSERT INTO operator (id,support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (555,6,  'operatorlana@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Lana', 'Lanic', '064555661', 'OPERATOR');
INSERT INTO operator (id,support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (551, 6, 'operatorena@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Ena', 'Enic', '064555662', 'OPERATOR');
INSERT INTO operator (id, support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (552,6, 'operatormia@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Mia', 'Miic', '064555663', 'OPERATOR');
INSERT INTO operator (id, support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (553, 6,'operatorlela@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Lela', 'Lelic', '064553666', 'OPERATOR');
INSERT INTO operator (id, support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (554, 6,'operatorina@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Ina', 'Inic', '064555664', 'OPERATOR');
INSERT INTO operator (id, support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (556, 6,'operatormare@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Marko', 'Markovic', '064525666', 'OPERATOR');
INSERT INTO operator (id, support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (557, 6,'operatorzile@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Zile', 'Zilic', '064555669', 'OPERATOR');
INSERT INTO operator (id, support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (558, 6,'operatorsteva@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Steva', 'Stevic', '064551666', 'OPERATOR');
INSERT INTO operator (id, support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (559, 6,'operatorsrdjan@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Srdjan', 'Stanic', '064155666', 'OPERATOR');
INSERT INTO operator (id, support_admin_id, email, password, first_name, last_name, phone, role) VALUES
    (600, 6,'operatordejan@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Dejan', 'Dejanovic', '061555666', 'OPERATOR');
-- Manager
INSERT INTO manager (id, email, password, first_name, last_name, phone, role) VALUES
    (4, 'manager1@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Olivia', 'Rhye', '064777888', 'MANAGER');
INSERT INTO manager (id, email, password, first_name, last_name, phone, role) VALUES
    (7, 'manager2@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Marko', 'Marković', '064111223', 'MANAGER');


-- Administrator
INSERT INTO administrator (id, email, password, first_name, last_name, phone, role) VALUES
    (5, 'admin@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Admin', 'Adminović', '064999000', 'ADMINISTRATOR');

-- Adrese sa koordinatama
INSERT INTO address (id, street, street_number, city, country, nickname, postal_code, latitude, longitude, customer_id) VALUES
    (1, 'Kralja Milana', '20', 'Beograd', 'Serbia', 'Home', '11000', 44.8111, 20.4593, 1);

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
    (1, 'Pasta Paradise', '09:00:00', '23:00:00', 4.8, '$$', 4, 10, '/images/restaurants/Pasta_Paradise.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (2, 'Green Garden', '10:00:00', '22:00:00', 4.9, '$$', 7, 11, '/images/restaurants/Green-Garden.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (3, 'Burger Queen', '11:00:00', '01:00:00', 4.6, '$', 4, 12, '/images/restaurants/Burger-Queen.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (4, 'Sushi Heaven', '12:00:00', '23:00:00', 4.7, '$$$', 7, 13, '/images/restaurants/Sushi-Heaven.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (5, 'Meraklija Grill', '08:00:00', '22:00:00', 4.5, '$', 4, 14, '/images/restaurants/Meraklija-Grill.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (6, 'The Golden Spoon', '12:00:00', '23:00:00', 5.0, '$$$', 7, 15, '/images/restaurants/The-Golden-Spoon.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (7, 'Pizza Corner', '10:00:00', '00:00:00', 4.4, '$$', 4, 16, '/images/restaurants/Pizza.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (8, 'Vegan Oasis', '09:00:00', '21:00:00', 4.9, '$$', 7, 17, '/images/restaurants/Vegan-Oasis.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (9, 'Steak House', '17:00:00', '01:00:00', 4.8, '$$$', 4, 18, '/images/restaurants/Steak-House.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (10, 'Gluten-Free Heaven', '08:00:00', '20:00:00', 4.7, '$$', 7, 19, '/images/restaurants/Gluten-Free-Heaven.jpg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (11, 'Fish & Chips', '12:00:00', '22:00:00', 4.3, '$', 4, 20, '/images/restaurants/Fish-Chips.jpeg');
INSERT INTO restaurant (id, name, opening_time, closing_time, average_rating, price_range, manager_id, address_id, image_url) VALUES
    (12, 'Wok Express', '11:00:00', '23:00:00', 4.6, '$$', 7, 21, '/images/restaurants/Wok.jpg');

INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (1, 'Glavni Meni', 1, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (2, 'Meni Zdravlja', 2, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (3, 'Burger Meni', 3, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (4, 'Sushi Meni', 4, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (5, 'Roštilj Meni', 5, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (6, 'Fine Dining', 6, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (7, 'Pizza Meni', 7, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (8, 'Veganski Meni', 8, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (9, 'Steak Meni', 9, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (10, 'Bezglutenski Meni', 10, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (11, 'Morski Meni', 11, false);
INSERT INTO menu (id, name, restaurant_id, is_deleted) VALUES
    (12, 'Azijski Meni', 12, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (1, 1, NOW(), true, 1, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (2, 1, NOW(), true, 2, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (3, 1, NOW(), true, 3, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (4, 1, NOW(), true, 4, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (5, 1, NOW(), true, 5, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (6, 1, NOW(), true, 6, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (7, 1, NOW(), true, 7, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (8, 1, NOW(), true, 8, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (9, 1, NOW(), true, 9, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (10, 1, NOW(), true, 10, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (11, 1, NOW(), true, 11, false);
INSERT INTO menu_version (id, version_number, creation_date, active, menu_id, is_deleted) VALUES
    (12, 1, NOW(), true, 12, false);

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
--- STAVKE MENIJA (SADA SA ISPRAVLJENIM UNOSOM)
-- ====================================================================
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               -- 1. Pasta Paradise (IDs: 1-11)
                                                                               (1, 'Pasta Carbonara', 'Pancetta, eggs, parmesan', '/images/Pasta/carbonara.jpeg', 'MAIN_COURSE', false),
                                                                               (2, 'Pizza Margherita', 'Tomato, mozzarella, basil', '/images/Pasta/margarita.jpg', 'MAIN_COURSE', false),
                                                                               (3, 'Lasagne Bolognese', 'Minced meat, béchamel sauce', '/images/Pasta/lasagna.jpeg', 'MAIN_COURSE', false),
                                                                               (4, 'Gnocchi al Pesto', 'Gnocchi with pesto sauce', '/images/Pasta/Gnocchi-al-Pesto.jpeg', 'MAIN_COURSE', false),
                                                                               (5, 'Bruschetta', 'Tomato, garlic, olive oil', '/images/Pasta/bruschetta.jpg', 'MAIN_COURSE', false),
                                                                               (6, 'Coca-Cola', '0.33l', '/images/Pasta/cola.jpg', 'DRINK', false),
                                                                               (7, 'Espresso', 'Classic Italian espresso', '/images/Pasta/espresso.jpg', 'DRINK', false),
                                                                               (8, 'Lemonade', 'Freshly squeezed', '/images/Pasta/lemonade.jpeg', 'DRINK', false),
                                                                               (9, 'Tiramisu', 'Coffee, mascarpone, ladyfingers', '/images/Pasta/tiramisu.jpeg', 'DESSERT', false),
                                                                               (10, 'Panna Cotta', 'With a forest fruit topping', '/images/Pasta/panna-cotta.jpg', 'DESSERT', false),
                                                                               (11, 'Cheesecake', 'Classic cheesecake', '/images/Pasta/cheesecake.jpg', 'DESSERT', false);
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               -- 2. Green Garden (IDs: 12-22)
                                                                               (12, 'Caesar Salad', 'Chicken, croutons, dressing', '/images/Green/cezar.jpg', 'MAIN_COURSE', false),
                                                                               (13, 'Quinoa Salad', 'Quinoa, vegetables, lemon', '/images/Green/kinoa.jpg', 'MAIN_COURSE', false),
                                                                               (14, 'Pumpkin Soup', 'Creamy pumpkin soup', '/images/Green/bundeva.jpeg', 'MAIN_COURSE', false),
                                                                               (15, 'Chicken Fillet with Grilled Vegetables', 'A healthy and tasty meal', '/images/Green/piletina.jpeg', 'MAIN_COURSE', false),
                                                                               (16, 'Grilled Salmon', 'Fresh salmon with asparagus', '/images/Green/losos.jpeg', 'MAIN_COURSE', false),
                                                                               (17, 'Freshly Squeezed Orange Juice', '0.3l', '/images/Green/narandza.jpg', 'DRINK', false),
                                                                               (18, 'Green Tea', 'Hot beverage', '/images/Green/zeleni-caj.jpeg', 'DRINK', false),
                                                                               (19, 'Water', 'Fiji 0.5l', '/images/Green/vofa.jpg', 'DRINK', false),
                                                                               (20, 'Fruit Salad', 'Fresh seasonal fruit', '/images/Green/vocna.jpeg', 'DESSERT', false),
                                                                               (21, 'Chia Pudding', 'With coconut milk and fruit', '/images/Green/chia.jpeg', 'DESSERT', false),
                                                                               (22, 'Energy Balls', 'Dates, walnuts, cocoa', '/images/Green/energy.jpeg', 'DESSERT', false);
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               -- 3. Burger Queen (IDs: 23-33)
                                                                               (23, 'Classic Cheeseburger', 'Beef, cheddar, lettuce', '/images/burgers/chess.jpg', 'MAIN_COURSE', false),
                                                                               (24, 'Double Bacon Burger', 'Double beef patty, crispy bacon', '/images/burgers/dupli.jpeg', 'MAIN_COURSE', false),
                                                                               (25, 'Veggie Burger', 'Vegetable patty, avocado', '/images/burgers/veg.jpg', 'MAIN_COURSE', false),
                                                                               (26, 'Chicken Wings', 'Crispy, spicy wings', '/images/burgers/krilca.jpg', 'MAIN_COURSE', false),
                                                                               (27, 'French Fries', 'Crispy french fries', '/images/burgers/pomfrit.jpeg', 'MAIN_COURSE', false),
                                                                               (28, 'Beer', 'Domestic craft beer 0.5l', '/images/burgers/pivkan.jpg', 'DRINK', false),
                                                                               (29, 'Ice Tea', 'Peach-flavored iced tea', '/images/burgers/ice-tea.jpg', 'DRINK', false),
                                                                               (30, 'Sprite', '0.5l', '/images/burgers/sprite.jpg', 'DRINK', false),
                                                                               (31, 'Chocolate Milkshake', 'Thick and creamy', '/images/burgers/milkshake.jpeg', 'DESSERT', false),
                                                                               (32, 'American Pancakes', 'With maple syrup', '/images/burgers/american.jpg', 'DESSERT', false),
                                                                               (33, 'Glazed Donut', 'Chocolate glaze', '/images/burgers/krofne.jpg', 'DESSERT', false);

-- 4. Sushi Heaven (IDs: 34-44)
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               (34, 'California Roll', 'Crab, avocado, cucumber', '/images/Sushi/California-Roll.jpeg', 'MAIN_COURSE', false),
                                                                               (35, 'Sake Nigiri', 'Fresh salmon on rice', '/images/Sushi/sake.jpeg', 'MAIN_COURSE', false),
                                                                               (36, 'Spicy Tuna Roll', 'Spicy tuna, cucumber', '/images/Sushi/tuna.jpeg', 'MAIN_COURSE', false),
                                                                               (37, 'Miso Soup', 'Traditional Japanese soup', '/images/Sushi/miso.jpg', 'MAIN_COURSE', false),
                                                                               (38, 'Edamame', 'Boiled soybeans with sea salt', '/images/Sushi/Edamame.jpeg', 'MAIN_COURSE', false),
                                                                               (39, 'Sake (Japanese Rice Wine)', 'Warm or cold', '/images/Sushi/wine.jpeg', 'DRINK', false),
                                                                               (40, 'Asahi Beer', 'Japanese beer', '/images/Sushi/beer.jpeg', 'DRINK', false),
                                                                               (41, 'Green Tea', 'Sencha or Matcha', '/images/Sushi/green-tea.jpg', 'DRINK', false),
                                                                               (42, 'Mochi Ice Cream', 'Ice cream in rice dough', '/images/Sushi/mochi.jpeg', 'DESSERT', false),
                                                                               (43, 'Matcha Cheesecake', 'Creamy cheesecake', '/images/Sushi/matcha.jpg', 'DESSERT', false),
                                                                               (44, 'Dorayaki', 'Japanese pancakes with bean paste', '/images/Sushi/dora.jpg', 'DESSERT', false);

-- 5. Meraklija Grill (IDs: 45-55)
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               (45, 'Ćevapi (10 pieces)', 'Homemade ćevapi with onions in a flatbread', '/images/Meraklija/cevapi.jpeg', 'MAIN_COURSE', false),
                                                                               (46, 'Pljeskavica with Kajmak', 'Gourmet burger with clotted cream', '/images/Meraklija/pljeskavica-kajmak-2.jpg', 'MAIN_COURSE', false),
                                                                               (47, 'Mixed Grilled Meat', 'A portion for two with side dishes', '/images/Meraklija/mesano.jpeg', 'MAIN_COURSE', false),
                                                                               (48, 'Grilled Pork Loin', 'Grilled pork loin steak', '/images/Meraklija/vesalica.jpg', 'MAIN_COURSE', false),
                                                                               (49, 'Šopska Salad', 'Tomato, cucumber, pepper, cheese', '/images/Meraklija/sopska.jpeg', 'MAIN_COURSE', false),
                                                                               (50, 'Jelen Beer', '0.5l', '/images/Meraklija/jelen.jpg', 'DRINK', false),
                                                                               (51, 'Homemade Rakija', 'Slivovitz (plum brandy)', '/images/Meraklija/rakija.jpg', 'DRINK', false),
                                                                               (52, 'Knjaz Miloš', 'Mineral water 1l', '/images/Meraklija/knjaz.jpg', 'DRINK', false),
                                                                               (53, 'Orasnice', 'Homemade walnut cookies', '/images/Meraklija/orasnice.jpg', 'DESSERT', false),
                                                                               (54, 'Tufahije', 'Poached apples stuffed with walnuts', '/images/Meraklija/tufahije.jpeg', 'DESSERT', false),
                                                                               (55, 'Pancakes with Jam', 'Two pancakes', '/images/Meraklija/palacinke.jpg', 'DESSERT', false);

-- 6. The Golden Spoon (IDs: 56-66)
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               (56, 'Beefsteak in Pepper Sauce', 'The finest cut of meat', '/images/Golden/bifetk-sa-crnim-biberom3.jpg', 'MAIN_COURSE', false),
                                                                               (57, 'Mushroom Risotto', 'Creamy risotto with truffles', '/images/Golden/rizoto.jpeg', 'MAIN_COURSE', false),
                                                                               (58, 'Salmon Fillets', 'Grilled with chard', '/images/Golden/fileti.jpg', 'MAIN_COURSE', false),
                                                                               (59, 'Duck Breast', 'With orange sauce', '/images/Golden/pacije-grudi-u-sosu-od-vina-7.jpg', 'MAIN_COURSE', false),
                                                                               (60, 'Goat Cheese Salad', 'Grilled cheese, arugula, walnuts', '/images/Golden/salata-sa-kozjim-sirom.jpg', 'MAIN_COURSE', false),
                                                                               (61, 'Chardonnay', 'A glass of white wine', '/images/Golden/gerovasiliouchardonnay.webp', 'DRINK', false),
                                                                               (62, 'Prosecco', 'A glass of sparkling wine', '/images/Golden/prosecco.jpg', 'DRINK', false),
                                                                               (63, 'Negroni', 'Classic Italian cocktail', '/images/Golden/negroni.jpg', 'DRINK', false),
                                                                               (64, 'Chocolate Soufflé', 'With a warm, molten center', '/images/Golden/sufle-cokoladni.jpg', 'DESSERT', false),
                                                                               (65, 'Creme Brulee', 'Crispy caramel crust', '/images/Golden/creme-brule.jpg', 'DESSERT', false),
                                                                               (66, 'Cheese Selection', 'Domestic and foreign cheeses', '/images/Golden/selekcija-sireva-kombinacija.jpg', 'DESSERT', false);

-- 7. Pizza Corner (IDs: 67-77)
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               (67, 'Capricciosa', 'Ham, mushrooms, cheese, olives', '/images/Pizza/kapricoza.jpeg', 'MAIN_COURSE', false),
                                                                               (68, 'Quattro Formaggi', 'Four types of cheese', '/images/Pizza/formaggi.jpg', 'MAIN_COURSE', false),
                                                                               (69, 'Vegetariana', 'Seasonal vegetables', '/images/Pizza/vegetariana.jpeg', 'MAIN_COURSE', false),
                                                                               (70, 'Panzerotto', 'Stuffed dough with ham and cheese', '/images/Pizza/pancerota.jpg', 'MAIN_COURSE', false),
                                                                               (71, 'Garlic Bread', 'With cheese and parsley', '/images/Pizza/beli-luk.jpeg', 'MAIN_COURSE', false),
                                                                               (72, 'Coca-Cola Zero', '0.5l', '/images/Pizza/coca-cola-zero.jpg', 'DRINK', false),
                                                                               (73, 'Fanta', '0.5l', '/images/Pizza/fanta.jpeg', 'DRINK', false),
                                                                               (74, 'Heineken Beer', '0.4l', '/images/Pizza/heineken.jpeg', 'DRINK', false),
                                                                               (75, 'Chocolate Pizza', 'Nutella, crushed biscuits, fruit', '/images/Pizza/cokoladna-pizza.jpeg', 'DESSERT', false),
                                                                               (76, 'Fruit Cup', 'Ice cream with fresh fruit', '/images/Pizza/vocni-kup.jpeg', 'DESSERT', false),
                                                                               (77, 'Ice Cubes Cake', 'Classic homemade cake', '/images/Pizza/ledene-kocke.jpg', 'DESSERT', false);

-- 8. Vegan Oasis (IDs: 78-88)
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               (78, 'Falafel Bowl', 'Falafel, hummus, salad, tahini dressing', '/images/Vegan/falafel.jpeg', 'MAIN_COURSE', false),
                                                                               (79, 'Lentil Burger', 'Lentil burger with vegan cheese', '/images/Vegan/posne-pljeskavice.jpeg', 'MAIN_COURSE', false),
                                                                               (80, 'Buddha Bowl', 'Assorted vegetables, quinoa, and tofu', '/images/Vegan/buddha.jpeg', 'MAIN_COURSE', false),
                                                                               (81, 'Vegan Moussaka', 'Eggplant, lentils, potato', '/images/Vegan/veganska-musaka.jpeg', 'MAIN_COURSE', false),
                                                                               (82, 'Vegetable Burrito', 'Red beans, corn, rice, guacamole', '/images/Vegan/burrito-s-piletinom-i-povrcem.jpg', 'MAIN_COURSE', false),
                                                                               (83, 'Kombucha', 'Fermented tea', '/images/Vegan/kombucha.jpeg', 'DRINK', false),
                                                                               (84, 'Beetroot-Apple Juice', 'Freshly squeezed', '/images/Vegan/cvekla.jpeg', 'DRINK', false),
                                                                               (85, 'Green Smoothie', 'Spinach, banana, almond milk', '/images/Vegan/zeleni-smoothie.jpeg', 'DRINK', false),
                                                                               (86, 'Raw Lemon Cake', 'Cashews, lemon, dates', '/images/Vegan/sirova.jpg', 'DESSERT', false),
                                                                               (87, 'Avocado-Choco Mousse', 'Creamy avocado and cocoa mousse', '/images/Vegan/avokado.jpeg', 'DESSERT', false),
                                                                               (88, 'Baked Apples with Cinnamon', 'Warm apples with cinnamon and walnuts', '/images/Vegan/jabuka.jpeg', 'DESSERT', false);

-- 9. Steak House (IDs: 89-99)
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               (89, 'Rib-eye Steak', '300g of aged beef', '/images/Steak/ribeye-steak.jpg', 'MAIN_COURSE', false),
                                                                               (90, 'T-Bone Steak', '500g bone-in, served with butter', '/images/Steak/t.jpeg', 'MAIN_COURSE', false),
                                                                               (91, 'Rump Steak', 'Juicy and delicious, 250g', '/images/Steak/ramstek.jpeg', 'MAIN_COURSE', false),
                                                                               (92, 'Beef Burger', 'Homemade bun, iceberg lettuce, tomato', '/images/Steak/juneci.jpeg', 'MAIN_COURSE', false),
                                                                               (93, 'Foil-Baked Potato', 'With kajmak (clotted cream) and herbs', '/images/Steak/punjeni-krompir.jpeg', 'MAIN_COURSE', false),
                                                                               (94, 'Jack Daniels', 'Whiskey, 0.03l', '/images/Steak/jack_daniels.jpg', 'DRINK', false),
                                                                               (95, 'Red Wine', 'Cabernet Sauvignon, glass', '/images/Steak/RUBINOVO-CRNO.jpg', 'DRINK', false),
                                                                               (96, 'Coca-Cola', '0.33l', '/images/Steak/cocacola.jpg', 'DRINK', false),
                                                                               (97, 'New York Cheesecake', 'Classic American cheesecake', '/images/Steak/cheesecake.webp', 'DESSERT', false),
                                                                               (98, 'Chocolate Lava Cake', 'With vanilla ice cream', '/images/Steak/lava.jpeg', 'DESSERT', false),
                                                                               (99, 'Tiramisu', 'An Italian classic', '/images/Steak/Tiramisu.jpg', 'DESSERT', false);


-- 10. Gluten-Free Heaven (IDs: 100-110)
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               (100, 'Gluten-Free Pizza', 'With tomato sauce, vegan cheese, and vegetables', '/images/gluten/gluten-free-pizza.jpeg', 'MAIN_COURSE', false),
                                                                               (101, 'Chicken with Quinoa', 'Grilled chicken with quinoa and salad', '/images/gluten/kinoa.jpeg', 'MAIN_COURSE', false),
                                                                               (102, 'Avocado Salad', 'Avocado, chicken, cherry tomatoes, mixed greens', '/images/gluten/avokado.jpeg', 'MAIN_COURSE', false),
                                                                               (103, 'Shrimp Risotto', 'Gluten-free risotto with shrimp and saffron', '/images/gluten/Rizoto-s-kozicama.jpg', 'MAIN_COURSE', false),
                                                                               (104, 'Vegetable Lasagna', 'Gluten-free pasta with eggplant and zucchini', '/images/gluten/lazanje.jpg', 'MAIN_COURSE', false),
                                                                               (105, 'Freshly Squeezed Apple Juice', '0.3l', '/images/gluten/apple-juice-recipe.jpg', 'DRINK', false),
                                                                               (106, 'Decaf Coffee', 'Decaffeinated espresso', '/images/gluten/decaf-coffee.jpg', 'DRINK', false),
                                                                               (107, 'Mineral Water', 'Knjaz Miloš 0.5l', '/images/gluten/knjaz.jpg', 'DRINK', false),
                                                                               (108, 'Buckwheat Pancakes', 'With sugar-free jam', '/images/gluten/palacinke-od-heljde.jpg', 'DESSERT', false),
                                                                               (109, 'Almond Muffins', 'Gluten-free and sugar-free', '/images/gluten/mafini.jpeg', 'DESSERT', false),
                                                                               (110, 'Fruit Skewers', 'Fresh fruit on a stick', '/images/gluten/voce.jpeg', 'DESSERT', false);

-- 11. Fish & Chips (IDs: 111-121)
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               (111, 'Hake and Chips', 'Classic fish and chips with tartar sauce', '/images/Fish/oslic.jpg', 'MAIN_COURSE', false),
                                                                               (112, 'Grilled Squid', 'Fresh squid with Dalmatian-style stew', '/images/Fish/LIGNJE.jpg', 'MAIN_COURSE', false),
                                                                               (113, 'Fish Soup', 'Homemade fish soup with pieces of fish', '/images/Fish/riblja.jpeg', 'MAIN_COURSE', false),
                                                                               (114, 'Seafood Salad', 'Shrimp, mussels, octopus, olives', '/images/Fish/plodovi.jpg', 'MAIN_COURSE', false),
                                                                               (115, 'Fried Cheese Sticks', 'Mozzarella sticks with sweet chili sauce', '/images/Fish/Stapici-sa-sirom.jpeg', 'MAIN_COURSE', false),
                                                                               (116, 'Zaječarsko Beer', '0.5l', '/images/Fish/zajecarsko.jpeg', 'DRINK', false),
                                                                               (117, 'White Wine', 'A glass of Grašac', '/images/Fish/belo-vino.jpg', 'DRINK', false),
                                                                               (118, 'Pepsi', '0.33l', '/images/Fish/pepsi.jpg', 'DRINK', false),
                                                                               (119, 'Tres Leches Cake', 'Juicy milk cake', '/images/Fish/trilece.jpg', 'DESSERT', false),
                                                                               (120, 'Ice Cream', 'Two scoops of your choice', '/images/Fish/sladoled.jpg', 'DESSERT', false),
                                                                               (121, 'Apple Pie', 'Homemade pie', '/images/Fish/pita.jpeg', 'DESSERT', false);

-- 12. Wok Express (IDs: 122-132)
INSERT INTO menu_item (id, name, description, image_url, type, is_deleted) VALUES
                                                                               (122, 'Chicken with Curry', 'Chicken in red curry sauce with rice', '/images/wok/kari.jpeg', 'MAIN_COURSE', false),
                                                                               (123, 'Sweet and Sour Chicken', 'Classic Chinese dish with pineapple', '/images/wok/slatko.jpeg', 'MAIN_COURSE', false),
                                                                               (124, 'Vegetable Noodles', 'Fried noodles with fresh vegetables and soy sauce', '/images/wok/nudle.jpeg', 'MAIN_COURSE', false),
                                                                               (125, 'Beef with Broccoli', 'Juicy beef in oyster sauce', '/images/wok/govedina.jpeg', 'MAIN_COURSE', false),
                                                                               (126, 'Spring Rolls', 'Crispy vegetable rolls (3 pcs)', '/images/wok/rolnice.jpeg', 'MAIN_COURSE', false),
                                                                               (127, 'Tsingtao Chinese Beer', '0.33l', '/images/wok/pivo.jpeg', 'DRINK', false),
                                                                               (128, 'Jasmine Tea', 'Traditional Chinese tea', '/images/wok/jasmin.jpeg', 'DRINK', false),
                                                                               (129, 'Lychee Juice', 'Exotic fruit juice', '/images/wok/licije.jpg', 'DRINK', false),
                                                                               (130, 'Fried Banana', 'With honey and sesame', '/images/wok/banana.jpeg', 'DESSERT', false),
                                                                               (131, 'Fried Ice Cream', 'Hot and cold dessert', '/images/wok/pohovani.jpg', 'DESSERT', false),
                                                                               (132, 'Fortune Cookies', 'Cookie with a message (2 pcs)', '/images/wok/sreca.jpg', 'DESSERT', false);


-- VERZIJE STAVKI MENIJA (cene, popularnost, dostupnost)
INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id, is_deleted) VALUES
                                                                                                             -- Pasta Paradise
                                                                                                             (1, 1250, true, true, 1, 1, false), (2, 1100, true, false, 2, 1, false),
                                                                                                             (3, 1400, true, false, 3, 1, false), (4, 1150, true, false, 4, 1, false),
                                                                                                             (5, 550, true, false, 5, 1, false), (6, 250, true, false, 6, 1, false),
                                                                                                             (7, 180, true, false, 7, 1, false), (8, 320, true, false, 8, 1, false),
                                                                                                             (9, 650, true, false, 9, 1, false), (10, 450, true, false, 10, 1, false),
                                                                                                             (11, 550, true, false, 11, 1, false),
                                                                                                             -- Green Garden
                                                                                                             (12, 1150, true, true, 12, 2, false), (13, 1200, true, false, 13, 2, false),
                                                                                                             (14, 450, true, false, 14, 2, false), (15, 1350, true, false, 15, 2, false),
                                                                                                             (16, 1800, true, false, 16, 2, false), (17, 350, true, false, 17, 2, false),
                                                                                                             (18, 220, true, false, 18, 2, false), (19, 150, true, false, 19, 2, false),
                                                                                                             (20, 500, true, false, 20, 2, false), (21, 600, true, false, 21, 2, false),
                                                                                                             (22, 400, true, false, 22, 2, false),
                                                                                                             -- Burger Queen
                                                                                                             (23, 850, true, true, 23, 3, false), (24, 1050, true, false, 24, 3, false),
                                                                                                             (25, 900, true, false, 25, 3, false), (26, 750, true, false, 26, 3, false),
                                                                                                             (27, 300, true, false, 27, 3, false), (28, 350, true, false, 28, 3, false),
                                                                                                             (29, 280, true, false, 29, 3, false), (30, 250, true, false, 30, 3, false),
                                                                                                             (31, 450, true, false, 31, 3, false), (32, 550, true, false, 32, 3, false),
                                                                                                             (33, 250, true, false, 33, 3, false);
-- Dodavanje OGRANIČENE dostupnosti za po jednu stavku
UPDATE menu_item_version SET time_from = '09:00:00', time_to = '12:00:00' WHERE id = 5; -- Bruschetta (samo za doručak)
UPDATE menu_item_version SET time_from = '12:00:00', time_to = '15:00:00' WHERE id = 14; -- Potaž od bundeve (samo za ručak)
UPDATE menu_item_version SET time_from = '14:00:00', time_to = '01:00:00' WHERE id = 31; -- Milkshake (tek popodne)


INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id, is_deleted) VALUES
                                                                                                             -- Sushi Heaven
                                                                                                             (34, 1500, true, true, 34, 4, false), -- POPULARNO
                                                                                                             (35, 400, true, false, 35, 4, false),
                                                                                                             (36, 1600, true, false, 36, 4, false),
                                                                                                             (37, 350, true, false, 37, 4, false),
                                                                                                             (38, 450, true, false, 38, 4, false),
                                                                                                             (39, 700, true, false, 39, 4, false),
                                                                                                             (40, 500, true, false, 40, 4, false),
                                                                                                             (41, 250, true, false, 41, 4, false),
                                                                                                             (42, 650, true, false, 42, 4, false),
                                                                                                             (43, 800, true, false, 43, 4, false),
                                                                                                             (44, 400, true, false, 44, 4, false),
                                                                                                             -- Meraklija Grill
                                                                                                             (45, 600, true, true, 45, 5, false), -- POPULARNO
                                                                                                             (46, 950, true, false, 46, 5, false),
                                                                                                             (47, 1800, true, false, 47, 5, false),
                                                                                                             (48, 850, true, false, 48, 5, false),
                                                                                                             (49, 300, true, false, 49, 5, false),
                                                                                                             (50, 280, true, false, 50, 5, false),
                                                                                                             (51, 250, true, false, 51, 5, false),
                                                                                                             (52, 180, true, false, 52, 5, false),
                                                                                                             (53, 350, true, false, 53, 5, false),
                                                                                                             (54, 450, true, false, 54, 5, false),
                                                                                                             (55, 300, true, false, 55, 5, false),
                                                                                                             -- The Golden Spoon
                                                                                                             (56, 2800, true, true, 56, 6, false), -- POPULARNO
                                                                                                             (57, 1900, true, false, 57, 6, false),
                                                                                                             (58, 2400, true, false, 58, 6, false),
                                                                                                             (59, 2600, true, false, 59, 6, false),
                                                                                                             (60, 1100, true, false, 60, 6, false),
                                                                                                             (61, 600, true, false, 61, 6, false),
                                                                                                             (62, 700, true, false, 62, 6, false),
                                                                                                             (63, 850, true, false, 63, 6, false),
                                                                                                             (64, 800, true, false, 64, 6, false),
                                                                                                             (65, 700, true, false, 65, 6, false),
                                                                                                             (66, 1200, true, false, 66, 6, false);

-- Sushi Heaven, Meraklija Grill, The Golden Spoon
UPDATE menu_item_version SET time_from = '15:00:00', time_to = '18:00:00' WHERE id = 35; -- Sake Nigiri (samo za happy hour)
UPDATE menu_item_version SET time_from = '11:00:00', time_to = '22:00:00' WHERE id = 46; -- Pljeskavica (nije dostupna za rani doručak)
UPDATE menu_item_version SET time_from = '18:00:00', time_to = '23:00:00' WHERE id = 58; -- Fileti lososa (samo za večeru)

INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id, is_deleted) VALUES
                                                                                                             -- Pizza Corner
                                                                                                             (67, 1150, true, true, 67, 7, false), -- POPULARNO
                                                                                                             (68, 1250, true, false, 68, 7, false),
                                                                                                             (69, 1100, true, false, 69, 7, false),
                                                                                                             (70, 950, true, false, 70, 7, false),
                                                                                                             (71, 400, true, false, 71, 7, false),
                                                                                                             (72, 280, true, false, 72, 7, false),
                                                                                                             (73, 280, true, false, 73, 7, false),
                                                                                                             (74, 350, true, false, 74, 7, false),
                                                                                                             (75, 1300, true, false, 75, 7, false),
                                                                                                             (76, 500, true, false, 76, 7, false),
                                                                                                             (77, 450, true, false, 77, 7, false),
                                                                                                             -- Vegan Oasis
                                                                                                             (78, 1100, true, true, 78, 8, false), -- POPULARNO
                                                                                                             (79, 950, true, false, 79, 8, false),
                                                                                                             (80, 1200, true, false, 80, 8, false),
                                                                                                             (81, 1250, true, false, 81, 8, false),
                                                                                                             (82, 900, true, false, 82, 8, false),
                                                                                                             (83, 400, true, false, 83, 8, false),
                                                                                                             (84, 380, true, false, 84, 8, false),
                                                                                                             (85, 550, true, false, 85, 8, false),
                                                                                                             (86, 700, true, false, 86, 8, false),
                                                                                                             (87, 650, true, false, 87, 8, false),
                                                                                                             (88, 500, true, false, 88, 8, false),
                                                                                                             -- Steak House
                                                                                                             (89, 2900, true, true, 89, 9, false), -- POPULARNO
                                                                                                             (90, 3500, true, false, 90, 9, false),
                                                                                                             (91, 2600, true, false, 91, 9, false),
                                                                                                             (92, 1400, true, false, 92, 9, false),
                                                                                                             (93, 450, true, false, 93, 9, false),
                                                                                                             (94, 480, true, false, 94, 9, false),
                                                                                                             (95, 550, true, false, 95, 9, false),
                                                                                                             (96, 280, true, false, 96, 9, false),
                                                                                                             (97, 600, true, false, 97, 9, false),
                                                                                                             (98, 700, true, false, 98, 9, false),
                                                                                                             (99, 650, true, false, 99, 9, false);

-- Pizza Corner, Vegan Oasis, Steak House
UPDATE menu_item_version SET time_from = '12:00:00', time_to = '16:00:00' WHERE id = 68; -- Quattro Formaggi (ponuda za ručak)
UPDATE menu_item_version SET time_from = '17:00:00', time_to = '21:00:00' WHERE id = 81; -- Veganska Musaka (dostupna samo za večeru)
UPDATE menu_item_version SET time_from = '18:00:00', time_to = '01:00:00' WHERE id = 91; -- Ramstek (tek od 18h)

INSERT INTO menu_item_version (id, price, available, popular, menu_item_id, menu_version_id, is_deleted) VALUES
                                                                                                             -- Gluten-Free Heaven
                                                                                                             (100, 1300, true, true, 100, 10, false), -- POPULARNO
                                                                                                             (101, 1400, true, false, 101, 10, false),
                                                                                                             (102, 1150, true, false, 102, 10, false),
                                                                                                             (103, 1600, true, false, 103, 10, false),
                                                                                                             (104, 1350, true, false, 104, 10, false),
                                                                                                             (105, 300, true, false, 105, 10, false),
                                                                                                             (106, 200, true, false, 106, 10, false),
                                                                                                             (107, 180, true, false, 107, 10, false),
                                                                                                             (108, 600, true, false, 108, 10, false),
                                                                                                             (109, 400, true, false, 109, 10, false),
                                                                                                             (110, 350, true, false, 110, 10, false),
                                                                                                             -- Fish & Chips
                                                                                                             (111, 900, true, true, 111, 11, false), -- POPULARNO
                                                                                                             (112, 1500, true, false, 112, 11, false),
                                                                                                             (113, 500, true, false, 113, 11, false),
                                                                                                             (114, 1600, true, false, 114, 11, false),
                                                                                                             (115, 600, true, false, 115, 11, false),
                                                                                                             (116, 300, true, false, 116, 11, false),
                                                                                                             (117, 450, true, false, 117, 11, false),
                                                                                                             (118, 250, true, false, 118, 11, false),
                                                                                                             (119, 480, true, false, 119, 11, false),
                                                                                                             (120, 350, true, false, 120, 11, false),
                                                                                                             (121, 400, true, false, 121, 11, false),
                                                                                                             -- Wok Express
                                                                                                             (122, 1300, true, true, 122, 12, false), -- POPULARNO
                                                                                                             (123, 1350, true, false, 123, 12, false),
                                                                                                             (124, 1100, true, false, 124, 12, false),
                                                                                                             (125, 1450, true, false, 125, 12, false),
                                                                                                             (126, 550, true, false, 126, 12, false),
                                                                                                             (127, 400, true, false, 127, 12, false),
                                                                                                             (128, 250, true, false, 128, 12, false),
                                                                                                             (129, 300, true, false, 129, 12, false),
                                                                                                             (130, 450, true, false, 130, 12, false),
                                                                                                             (131, 550, true, false, 131, 12, false),
                                                                                                             (132, 200, true, false, 132, 12, false);
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
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, card_amount, cash_amount) VALUES
    (1, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '2 day', 150.00, 1400.00, 1, 1, 2,
     NOW() - INTERVAL '2 day' + INTERVAL '45 minute', -- Rok isporuke (ETA) je bio 45 minuta
     NOW() - INTERVAL '2 day' + INTERVAL '30 minute',  -- A isporučeno je za 30 minuta. NA VRIJEME!
     1400.00, 0.00
    );

INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (1, 1, 1, 1);

INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (1, 1, 2, 'ACCEPTED');

-- PORUDŽBINA #2: CANCELED, prihvaćena od Jovana (ID=2)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, card_amount, cash_amount) VALUES
    (2, 'CANCELED', 'CASH', 'REGULAR', NOW() - INTERVAL '1 day', 150.00, 1350.00, 1, 1, 2, 0.00, 1350.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (2, 1, 2, 9), -- Tiramisu
                                                                          (3, 1, 2, 11); -- Cheesecake


INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (2, 2, 2, 'ACCEPTED');


-- PORUDŽBINA #3: DELIVERED, od Jovana (ID=2)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, card_amount, cash_amount) VALUES
    (3, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '1 day', 150.00, 1350.00, 1, 1, 2,
     NOW() - INTERVAL '1 day' + INTERVAL '40 minute', -- Rok isporuke (ETA) je bio 40 minuta
     NOW() - INTERVAL '1 day' + INTERVAL '55 minute',   -- A isporučeno je za 55 minuta. KASNI!
     0.00, 1350.00
    );
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (4, 1, 3, 21);

INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (3, 3, 2, 'ACCEPTED');

-- PORUDŽBINA #4: SCHEDULED_PENDING (nema vozača)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, scheduled_for, card_amount, cash_amount) VALUES
    (4, 'SCHEDULED_PENDING', 'CARD', 'SCHEDULED', NOW(), 150.00, 4250.00, 1, 1, NOW() + INTERVAL '1 day', 4250.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (5, 2, 4, 16), -- Losos na žaru
                                                                          (6, 1, 4, 20); -- Voćna Salata


-- PORUDŽBINA #5: CREATED (nema vozača, čeka potvrdu menadžera)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, card_amount, cash_amount) VALUES
    (5, 'CREATED', 'COMBINED', 'REPEATING', NOW(), 150.00, 1050.00, 1, 1, 550.00, 500.00);

INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (7, 1, 5, 6),
                                                                          (8, 1, 5, 9);


INSERT INTO repeating_order (id, original_order_id, repeat_type, day_of_week, delivery_time, active, unlimited) VALUES
    (1, 5, 'WEEKLY', 'FRIDAY', '19:00:00', true, true);

UPDATE orders SET repeating_order_template_id = 1 WHERE id = 5;


-- PORUDŽBINA #6: CONFIRMED (nema vozača, ali ponuđena nekome - idealno za test dashboarda)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, card_amount, cash_amount) VALUES
    (6, 'CONFIRMED', 'CASH', 'REGULAR', NOW() - INTERVAL '30 minute', 150.00, 1000.00, 1, 1, 0.00, 1000.00);

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
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, card_amount, cash_amount) VALUES
    (8, 'CONFIRMED', 'CARD', 'REGULAR', NOW() - INTERVAL '1 hour', 150.00, 1650.00, 1, 1, 1650.00, 0.00);

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
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, card_amount, cash_amount, delivered_at, coupon_id) VALUES
    (30, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '3 day', 0.00, 2800.00, 1, 1, 8, 2800.00, 0.0 ,NOW() - INTERVAL '3 day' + INTERVAL '30 minute', 1);

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



-- Track on map
INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (9, 'driver3@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Marko', 'Marković', '066123456', 'DRIVER', 'CAR', 'ONLINE', 0, 45.2550, 19.8456, NOW(), 0.0);

-- Novi vozač za testiranje
INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (10, 'driver4@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Milan', 'Milanović', '067123456', 'DRIVER', 'CAR', 'ONLINE', 0, 44.8080, 20.4600, NOW(), 0.0);
INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (11, 'driver5@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Stefan', 'Petrovic', '061111222', 'DRIVER', 'BICYCLE', 'ONLINE', 1, 44.8150, 20.4620, NOW(), 0.0);

INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (12, 'driver6@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Luka', 'Markovic', '062222333', 'DRIVER', 'MOTORCYCLE', 'OFFLINE', 0, 44.7866, 20.4489, NOW(), 0.0);

INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (13, 'driver7@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Ivan', 'Djordjevic', '063333444', 'DRIVER', 'CAR', 'ONLINE', 2, 44.8205, 20.4651, NOW(), 0.0);

INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (14, 'driver8@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Filip', 'Nikolic', '064444555', 'DRIVER', 'BICYCLE', 'ONLINE', 0, 44.8020, 20.4700, NOW(), 0.0);
INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (15, 'driver9@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Nemanja', 'Ilic', '065555666', 'DRIVER', 'MOTORCYCLE', 'ONLINE', 1, 44.8100, 20.4550, NOW(), 0.0);

INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (16, 'driver10@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Andrej', 'Jovic', '066666777', 'DRIVER', 'CAR', 'OFFLINE', 3, 44.7950, 20.4800, NOW(), 0.0);

INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (17, 'driver11@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'David', 'Pavlovic', '069888999', 'DRIVER', 'BICYCLE', 'ONLINE', 0, 44.8180, 20.4580, NOW(), 0.0);

INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, card_amount, cash_amount) VALUES
    (32, 'PICKED_UP', 'CASH', 'REGULAR',
     NOW() - INTERVAL '5 minute',          -- Kreirana pre 5 minuta
     150.00, 1000.00, 1, 1, 10,
     NOW() + INTERVAL '30 minute', -- ETA je za 30 minuta od sada
     0.00, 1000.00
    );

-- KORAK 2: Dodajemo stavku za tu porudžbinu
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (32, 1, 32, 23); -- 1x Classic Cheeseburger

-- KORAK 3: Dodajemo ponudu koju je vozač prihvatio
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (32, 32, 10, 'REJECTED');
-- Scenario for Driver #11 (Stefan, BICYCLE, ONLINE)
-- A successfully delivered order in the past.
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, card_amount, cash_amount) VALUES
    (101, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '3 day', 200.00, 1300.00, 1, 15, 11, NOW() - INTERVAL '3 day' + INTERVAL '50 minute', NOW() - INTERVAL '3 day' + INTERVAL '45 minute', 1300.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (101, 1, 101, 78); -- Falafel Bowl
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (101, 101, 11, 'ACCEPTED');


-- Scenario for Driver #12 (Luka, MOTORCYCLE, OFFLINE)
-- Two past orders, one delivered, one canceled. He is offline, so no new offers.
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, card_amount, cash_amount) VALUES
    (102, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '5 day', 150.00, 750.00, 1, 12, 12, NOW() - INTERVAL '5 day' + INTERVAL '25 minute', NOW() - INTERVAL '5 day' + INTERVAL '20 minute', 0.00, 750.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (102, 1, 102, 45); -- Ćevapi
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (102, 102, 12, 'ACCEPTED');

INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, card_amount, cash_amount) VALUES
    (103, 'CANCELED', 'CARD', 'REGULAR', NOW() - INTERVAL '2 day', 150.00, 1250.00, 1, 1, 12, 1250.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (103, 1, 103, 68); -- Quattro Formaggi
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (103, 103, 12, 'ACCEPTED');


-- Scenario for Driver #13 (Ivan, CAR, ONLINE)
-- This driver has REJECTED an offer for an order that is still waiting.
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, card_amount, cash_amount) VALUES
    (104, 'CONFIRMED', 'CARD', 'REGULAR', NOW() - INTERVAL '1 hour', 150.00, 3050.00, 1, 18, 3050.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (104, 1, 104, 89); -- Rib-eye Steak
INSERT INTO order_offer (id, order_id, driver_id, status, reason_for_rejection) VALUES (104, 104, 13, 'REJECTED', 'Too far from my current location.');


-- Scenario for Driver #14 (Filip, BICYCLE, DELIVERING)
-- This driver is currently on an active delivery.
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, start_delivery_time, card_amount, cash_amount) VALUES
    (105, 'PICKED_UP', 'CASH', 'REGULAR', NOW() - INTERVAL '15 minute', 200.00, 1300.00, 1, 19, 14, NOW() + INTERVAL '20 minute', NOW() - INTERVAL '5 minute', 0.00, 1300.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (105, 1, 105, 100); -- Gluten-Free Pizza
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (105, 105, 14, 'ACCEPTED');


-- Scenario for Driver #15 (Nemanja, MOTORCYCLE, ONLINE)
-- This driver has a new offer waiting for him on his dashboard.
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, card_amount, cash_amount) VALUES
    (106, 'CONFIRMED', 'COMBINED', 'REGULAR', NOW() - INTERVAL '10 minute', 150.00, 1650.00, 1, 20, 1000.00, 650.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (106, 1, 106, 123); -- Sweet and Sour Chicken
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (106, 106, 15, 'SENT');


-- Scenario for Driver #16 (Andrej, CAR, OFFLINE)
-- This driver has a significant delivery history but is currently offline.
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, card_amount, cash_amount) VALUES
                                                                                                                                                                                           (107, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '4 day', 150.00, 1050.00, 1, 14, 16, NOW() - INTERVAL '4 day' + INTERVAL '30 minute', NOW() - INTERVAL '4 day' + INTERVAL '28 minute', 1050.00, 0.00),
                                                                                                                                                                                           (108, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '6 day', 150.00, 1650.00, 1, 16, 16, NOW() - INTERVAL '6 day' + INTERVAL '40 minute', NOW() - INTERVAL '6 day' + INTERVAL '35 minute', 1650.00, 0.00),
                                                                                                                                                                                           (109, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '8 day', 150.00, 3650.00, 1, 1, 16, NOW() - INTERVAL '8 day' + INTERVAL '45 minute', NOW() - INTERVAL '8 day' + INTERVAL '50 minute', 0.00, 3650.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (107, 1, 107, 24), -- Double Bacon Burger
                                                                          (108, 1, 108, 67), -- Capricciosa
                                                                          (109, 1, 109, 90); -- T-Bone Steak
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
                                                              (107, 107, 16, 'ACCEPTED'),
                                                              (108, 108, 16, 'ACCEPTED'),
                                                              (109, 109, 16, 'ACCEPTED');


-- ISPRAVLJENA INSERT KOMANDA ZA PORUDŽBINU #31 (SIMULACIJA OD 30 SEKUNDI)
-- ISPRAVLJENA INSERT KOMANDA ZA PORUDŽBINU #31 (za praćenje)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, card_amount, cash_amount) VALUES
    (31, 'PICKED_UP', 'CARD', 'REGULAR',
     NOW() - INTERVAL '2 hours',          -- Postavlja vreme kreiranja na SADA (u UTC)
     150.00, 1450.00, 1, 11, 9,
     (NOW() - INTERVAL '2 hours') + INTERVAL '5 minute', -- Postavlja ETA na 5 MINUTA U BUDUĆNOST (u UTC)
     1450.00, 0.00
    );
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (31, 1, 31, 122); -- 1x Piletina sa karijem

-- Ponudu je prihvatio novi vozač
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (31, 31, 9, 'ACCEPTED');

INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (201, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '10 day', 150.00, 1200.00, 1, 1, 2, NOW() - INTERVAL '10 day' + INTERVAL '30 minute', NOW() - INTERVAL '10 day' + INTERVAL '25 minute', NOW() - INTERVAL '10 day' + INTERVAL '10 minute'),
                                                                                                                                                                                      (202, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '9 day', 150.00, 1050.00, 1, 1, 2, NOW() - INTERVAL '9 day' + INTERVAL '40 minute', NOW() - INTERVAL '9 day' + INTERVAL '38 minute', NOW() - INTERVAL '9 day' + INTERVAL '15 minute'),
                                                                                                                                                                                      (203, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '8 day', 150.00, 800.00, 1, 1, 2, NOW() - INTERVAL '8 day' + INTERVAL '35 minute', NOW() - INTERVAL '8 day' + INTERVAL '31 minute', NOW() - INTERVAL '8 day' + INTERVAL '12 minute');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (201, 1, 201, 24),
                                                                          (202, 1, 202, 23),
                                                                          (203, 1, 203, 46);
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
                                                              (201, 201, 2, 'ACCEPTED'), (202, 202, 2, 'ACCEPTED'), (203, 203, 2, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
                                                                                                                                                          (201, 201, 2, 1, 4, 5, 5, 5),
                                                                                                                                                          (202, 202, 2, 1, 4, 4, 4, 4),
                                                                                                                                                          (203, 203, 2, 1, 4, 3, 4, 3);

INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (204, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '12 day', 150.00, 1900.00, 1, 1, 8, NOW() - INTERVAL '12 day' + INTERVAL '25 minute', NOW() - INTERVAL '12 day' + INTERVAL '20 minute', NOW() - INTERVAL '12 day' + INTERVAL '8 minute'),
                                                                                                                                                                                      (205, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '11 day', 150.00, 1600.00, 1, 1, 8, NOW() - INTERVAL '11 day' + INTERVAL '30 minute', NOW() - INTERVAL '11 day' + INTERVAL '22 minute', NOW() - INTERVAL '11 day' + INTERVAL '7 minute'),
                                                                                                                                                                                      (206, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '10 day', 150.00, 1300.00, 1, 1, 8, NOW() - INTERVAL '10 day' + INTERVAL '35 minute', NOW() - INTERVAL '10 day' + INTERVAL '33 minute', NOW() - INTERVAL '10 day' + INTERVAL '14 minute');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (204, 1, 204, 34),
                                                                          (205, 1, 205, 36),
                                                                          (206, 1, 206, 67);
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
                                                              (204, 204, 8, 'ACCEPTED'), (205, 205, 8, 'ACCEPTED'), (206, 206, 8, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
                                                                                                                                                          (204, 204, 8, 1, 7, 5, 5, 5),
                                                                                                                                                          (205, 205, 8, 1, 7, 5, 4, 5),
                                                                                                                                                          (206, 206, 8, 1, 4, 3, 3, 4);

INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (207, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '15 day', 150.00, 1450.00, 1, 21, 16, NOW() - INTERVAL '15 day' + INTERVAL '30 minute', NOW() - INTERVAL '15 day' + INTERVAL '29 minute', NOW() - INTERVAL '15 day' + INTERVAL '11 minute'),
                                                                                                                                                                                      (208, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '14 day', 150.00, 1600.00, 1, 21, 16, NOW() - INTERVAL '14 day' + INTERVAL '30 minute', NOW() - INTERVAL '14 day' + INTERVAL '35 minute', NOW() - INTERVAL '14 day' + INTERVAL '15 minute'),
                                                                                                                                                                                      (209, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '13 day', 150.00, 1650.00, 1, 21, 16, NOW() - INTERVAL '13 day' + INTERVAL '35 minute', NOW() - INTERVAL '13 day' + INTERVAL '30 minute', NOW() - INTERVAL '13 day' + INTERVAL '10 minute');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (207, 1, 207, 122),
                                                                          (208, 1, 208, 124),
                                                                          (209, 1, 209, 125);
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
                                                              (207, 207, 16, 'ACCEPTED'), (208, 208, 16, 'ACCEPTED'), (209, 209, 16, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
                                                                                                                                                          (207, 207, 16, 1, 7, 5, 5, 4),
                                                                                                                                                          (208, 208, 16, 1, 7, 4, 4, 4),

                                                                                                                                                          (209, 209, 16, 1, 7, 5, 5, 5);


-- Vozač #11 (Stefan, BICYCLE) dobija još 3 isporuke iz različitih restorana.
-- ====================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (301, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '10 day', 200.00, 1100.00, 1, 17, 11, NOW() - INTERVAL '10 day' + INTERVAL '45 minute', NOW() - INTERVAL '10 day' + INTERVAL '48 minute', NOW() - INTERVAL '10 day' + INTERVAL '15 minute'), -- Malo kasni
                                                                                                                                                                                      (302, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '9 day', 200.00, 1450.00, 1, 1, 11, NOW() - INTERVAL '9 day' + INTERVAL '50 minute', NOW() - INTERVAL '9 day' + INTERVAL '45 minute', NOW() - INTERVAL '9 day' + INTERVAL '20 minute');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (301, 1, 301, 69), -- Pizza Corner: Vegetariana
                                                                          (302, 1, 302, 23); -- Burger Queen: Classic Cheeseburger
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (301, 301, 11, 'ACCEPTED'), (302, 302, 11, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
                                                                                                                                                          (301, 301, 11, 1, 4, 3, 4, 3), -- Lošija ocena za Pizza Corner
                                                                                                                                                          (302, 302, 11, 1, 4, 5, 5, 5); -- Odlična ocena za Burger Queen


-- Vozač #12 (Luka, MOTORCYCLE) dobija 2 nove uspešne isporuke.
-- ====================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (303, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '7 day', 150.00, 3100.00, 1, 13, 12, NOW() - INTERVAL '7 day' + INTERVAL '25 minute', NOW() - INTERVAL '7 day' + INTERVAL '18 minute', NOW() - INTERVAL '7 day' + INTERVAL '5 minute'),
                                                                                                                                                                                      (304, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '6 day', 150.00, 1600.00, 1, 1, 12, NOW() - INTERVAL '6 day' + INTERVAL '30 minute', NOW() - INTERVAL '6 day' + INTERVAL '25 minute', NOW() - INTERVAL '6 day' + INTERVAL '10 minute');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (303, 1, 303, 56), -- The Golden Spoon: Beefsteak
                                                                          (304, 1, 304, 12); -- Green Garden: Caesar Salad
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (303, 303, 12, 'ACCEPTED'), (304, 304, 12, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
                                                                                                                                                          (303, 303, 12, 1, 7, 5, 5, 5), -- Odličan za Golden Spoon
                                                                                                                                                          (304, 304, 12, 1, 7, 4, 5, 4); -- Dobar za Green Garden


-- Vozač #13 (Ivan, CAR) dobija 2 isporuke.
-- ====================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (305, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '5 day', 150.00, 1100.00, 1, 20, 13, NOW() - INTERVAL '5 day' + INTERVAL '35 minute', NOW() - INTERVAL '5 day' + INTERVAL '40 minute', NOW() - INTERVAL '5 day' + INTERVAL '15 minute'), -- Kasni
                                                                                                                                                                                      (306, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '4 day', 150.00, 1800.00, 1, 21, 13, NOW() - INTERVAL '4 day' + INTERVAL '30 minute', NOW() - INTERVAL '4 day' + INTERVAL '28 minute', NOW() - INTERVAL '4 day' + INTERVAL '12 minute');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (305, 1, 305, 111),-- Fish & Chips: Hake and Chips
                                                                          (306, 1, 306, 122);-- Wok Express: Chicken with Curry
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (305, 305, 13, 'ACCEPTED'), (306, 306, 13, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
                                                                                                                                                          (305, 305, 13, 1, 4, 2, 3, 2), -- Loša ocena zbog kašnjenja
                                                                                                                                                          (306, 306, 13, 1, 7, 5, 4, 5); -- Dobra ocena


-- Vozač #14 (Filip, BICYCLE) završava svoju dostavu i dobija još 2.
-- ====================================================================
UPDATE orders SET status = 'DELIVERED', delivered_at = NOW() - INTERVAL '5 minute' WHERE id = 105; -- Završava dostavu
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (105, 105, 14, 1, 7, 5, 5, 5); -- Dobija odličnu ocenu za nju

INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (307, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '3 day', 200.00, 1400.00, 1, 1, 14, NOW() - INTERVAL '3 day' + INTERVAL '55 minute', NOW() - INTERVAL '3 day' + INTERVAL '50 minute', NOW() - INTERVAL '3 day' + INTERVAL '20 minute'),
                                                                                                                                                                                      (308, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '2 day', 200.00, 1150.00, 1, 11, 14, NOW() - INTERVAL '2 day' + INTERVAL '50 minute', NOW() - INTERVAL '2 day' + INTERVAL '55 minute', NOW() - INTERVAL '2 day' + INTERVAL '22 minute'); -- Kasni
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (307, 1, 307, 1),  -- Pasta Paradise: Carbonara
                                                                          (308, 1, 308, 13); -- Green Garden: Quinoa Salad
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (307, 307, 14, 'ACCEPTED'), (308, 308, 14, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
                                                                                                                                                          (307, 307, 14, 1, 4, 5, 5, 5),
                                                                                                                                                          (308, 308, 14, 1, 7, 3, 4, 3);


-- Vozač #15 (Nemanja, MOTORCYCLE) dobija 3 dostave.
-- ====================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (309, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '5 day', 150.00, 1250.00, 1, 16, 15, NOW() - INTERVAL '5 day' + INTERVAL '30 minute', NOW() - INTERVAL '5 day' + INTERVAL '20 minute', NOW() - INTERVAL '5 day' + INTERVAL '8 minute'),
                                                                                                                                                                                      (310, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '4 day', 150.00, 3200.00, 1, 1, 15, NOW() - INTERVAL '4 day' + INTERVAL '25 minute', NOW() - INTERVAL '4 day' + INTERVAL '21 minute', NOW() - INTERVAL '4 day' + INTERVAL '7 minute'),
                                                                                                                                                                                      (311, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '3 day', 150.00, 800.00, 1, 14, 15, NOW() - INTERVAL '3 day' + INTERVAL '35 minute', NOW() - INTERVAL '3 day' + INTERVAL '33 minute', NOW() - INTERVAL '3 day' + INTERVAL '12 minute');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (309, 1, 309, 68), -- Pizza Corner
                                                                          (310, 2, 310, 36), -- Sushi Heaven
                                                                          (311, 1, 311, 49); -- Meraklija Grill
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (309, 309, 15, 'ACCEPTED'), (310, 310, 15, 'ACCEPTED'), (311, 311, 15, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
                                                                                                                                                          (309, 309, 15, 1, 4, 4, 5, 4),
                                                                                                                                                          (310, 310, 15, 1, 7, 5, 5, 5),
                                                                                                                                                          (311, 311, 15, 1, 4, 5, 4, 4);


-- Vozač #9 (Marko, CAR) dobija još 2 dostave.
-- ====================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (312, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '7 day', 150.00, 1300.00, 1, 1, 9, NOW() - INTERVAL '7 day' + INTERVAL '30 minute', NOW() - INTERVAL '7 day' + INTERVAL '25 minute', NOW() - INTERVAL '7 day' + INTERVAL '10 minute'),
                                                                                                                                                                                      (313, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '6 day', 150.00, 1000.00, 1, 1, 9, NOW() - INTERVAL '6 day' + INTERVAL '35 minute', NOW() - INTERVAL '6 day' + INTERVAL '31 minute', NOW() - INTERVAL '6 day' + INTERVAL '14 minute');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (312, 1, 312, 1), -- Pasta Paradise
                                                                          (313, 1, 313, 23);-- Burger Queen
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (312, 312, 9, 'ACCEPTED'), (313, 313, 9, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
                                                                                                                                                          (312, 312, 9, 1, 4, 5, 5, 5),
                                                                                                                                                          (313, 313, 9, 1, 4, 4, 5, 4);

-- Vozač #10 (Milan, CAR) dobija još 2 dostave.
-- ====================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, delivered_at, start_delivery_time) VALUES
                                                                                                                                                                                      (314, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '9 day', 150.00, 2400.00, 1, 1, 10, NOW() - INTERVAL '9 day' + INTERVAL '40 minute', NOW() - INTERVAL '9 day' + INTERVAL '38 minute', NOW() - INTERVAL '9 day' + INTERVAL '15 minute'),
                                                                                                                                                                                      (315, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '8 day', 150.00, 1300.00, 1, 1, 10, NOW() - INTERVAL '8 day' + INTERVAL '35 minute', NOW() - INTERVAL '8 day' + INTERVAL '40 minute', NOW() - INTERVAL '8 day' + INTERVAL '12 minute'); -- Kasni
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (314, 1, 314, 58), -- The Golden Spoon
                                                                          (315, 1, 315, 7); -- Pasta Paradise (nema stavke 7, pretpostavka greške, koristimo ID 1 za Carbonara)
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (314, 314, 10, 'ACCEPTED'), (315, 315, 10, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES




                                                                                                                                                  (314, 314, 10, 1, 7, 5, 5, 5),
                                                                                                                                                         (315, 315, 10, 1, 4, 2, 4, 3);
-- ====================================================================
-- SCENARIJI ZA AKTIVNE I SPREMNE PORUDŽBINE - RASPOREĐENO NA 3 VOZAČA
-- Cilj: Testirati logiku prikaza i brisanja sa više aktivnih vozača.
-- ====================================================================

-- SCENARIO 1: Vozač #13 (Ivan, CAR) je POKUPIO porudžbinu i vozi je ka kupcu.
-- Ako probate da obrišete Ivana, triger će ga BLOKIRATI.
-- =====================================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, start_delivery_time, card_amount, cash_amount) VALUES
    (401, 'PICKED_UP', 'CASH', 'REGULAR', NOW() - INTERVAL '30 minute', 150.00, 1000.00, 1, 1, 13, NOW() + INTERVAL '15 minute', NOW() - INTERVAL '5 minute', 0.00, 1000.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (401, 1, 401, 23); -- Burger Queen: Classic Cheeseburger
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (401, 401, 13, 'ACCEPTED');


-- SCENARIO 2: Vozač #15 (Nemanja, MOTORCYCLE) je prihvatio porudžbinu, koja je sada spremna u restoranu.
-- Ako probate da obrišete Nemanju, triger će ga BLOKIRATI.
-- =======================================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, card_amount, cash_amount) VALUES
    (402, 'READY_FOR_PICKUP', 'CARD', 'REGULAR', NOW() - INTERVAL '20 minute', 150.00, 1500.00, 1, 13, 15, NOW() + INTERVAL '25 minute', 1500.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (402, 1, 402, 34); -- Sushi Heaven: California Roll
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (402, 402, 15, 'ACCEPTED');


-- SCENARIO 3: Vozač #17 (David, BICYCLE) je takođe prihvatio porudžbinu koja ga čeka u restoranu.
-- Ako probate da obrišete Davida, triger će ga BLOKIRATI.
-- ======================================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, card_amount, cash_amount) VALUES
    (403, 'READY_FOR_PICKUP', 'CARD', 'REGULAR', NOW() - INTERVAL '15 minute', 200.00, 1300.00, 1, 16, 17, NOW() + INTERVAL '35 minute', 1300.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (403, 1, 403, 67); -- Pizza Corner: Capricciosa
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (403, 403, 17, 'ACCEPTED');

INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id) VALUES
    (601, 'CONFIRMED', 'CARD', 'REGULAR', NOW() - INTERVAL '2 day', 150.00, 1400.00, 1, 1);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (601, 1, 601, 1);
INSERT INTO order_offer (id, order_id, driver_id, status, created_at, reason_for_rejection) VALUES
    (601, 601, 13, 'REJECTED', NOW() - INTERVAL '2 day', 'Prethodna dostava se odužila.');

-- Porudžbina #602, takođe ponuđena Ivanu, on je odbio.
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id) VALUES
    (602, 'CONFIRMED', 'CASH', 'REGULAR', NOW() - INTERVAL '3 day', 150.00, 950.00, 1, 1);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (602, 1, 602, 46);
INSERT INTO order_offer (id, order_id, driver_id, status, created_at, reason_for_rejection) VALUES
    (602, 602, 13, 'REJECTED', NOW() - INTERVAL '3 day', 'Problem sa vozilom.');


INSERT INTO orders (
    id, status, payment_type, order_type, creation_date,
    delivery_price, total_price, customer_id, address_id, driver_id,
    eta, start_delivery_time, delivered_at,
    driver_reported_delay -- Ključna kolona!
) VALUES (
             603, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '5 day',
             150.00, 1800.00, 1, 1, 16,
             NOW() - INTERVAL '5 day' + INTERVAL '55 minute', -- Originalni ETA je bio 40 min, plus 15 min kašnjenja
             NOW() - INTERVAL '5 day' + INTERVAL '25 minute', -- Krenuo je na vreme
             NOW() - INTERVAL '5 day' + INTERVAL '52 minute', -- Isporučio je za 52 min (kasni 12 min u odnosu na ETA)
             15 -- Prijavio je kašnjenje od 15 minuta
         );
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (603, 1, 603, 58); -- Golden Spoon
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (603, 603, 16, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (603, 603, 16, 1, 7, 3, 5, 4); -- Dobio je osrednju ocenu zbog kašnjenja


UPDATE driver SET vehicle_type = 'MOTORCYCLE' WHERE id = 2;

INSERT INTO orders (
    id, status, payment_type, order_type, creation_date,
    delivery_price, total_price, customer_id, address_id, driver_id,
    eta, start_delivery_time, delivered_at
) VALUES (
             604, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '1 day',
             150.00, 1600.00, 1, 1, 2,
             NOW() - INTERVAL '1 day' + INTERVAL '25 minute', -- Motor je brži, pa je ETA kraći
             NOW() - INTERVAL '1 day' + INTERVAL '10 minute',
             NOW() - INTERVAL '1 day' + INTERVAL '22 minute' -- Isporučeno na vreme
         );
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (604, 1, 604, 34); -- Sushi Heaven
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (604, 604, 2, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (604, 604, 2, 1, 7, 5, 5, 5); -- Odlična ocena za brzu isporuku

-- Vraćamo mu originalni tip vozila
UPDATE driver SET vehicle_type = 'CAR' WHERE id = 2;


INSERT INTO orders (
    id, status, payment_type, order_type, creation_date,
    delivery_price, total_price, customer_id, address_id, driver_id,
    eta, start_delivery_time, delivered_at,
    driver_reported_delay -- Ključna kolona za kursor!
) VALUES (
             701, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '5 day',
             150.00, 1800.00, 1, 1, 16,
             NOW() - INTERVAL '5 day' + INTERVAL '55 minute', -- Originalni ETA (40 min) + prijavljeno kašnjenje (15 min)
             NOW() - INTERVAL '5 day' + INTERVAL '25 minute', -- Krenuo je na vreme
             NOW() - INTERVAL '5 day' + INTERVAL '52 minute', -- Isporučio je za 52 min (kasni 12 min u odnosu na originalni ETA)
             15 -- Prijavio je kašnjenje od 15 minuta
         );
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (701, 1, 701, 58); -- Golden Spoon
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (701, 701, 16, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (701, 701, 16, 1, 7, 3, 5, 4);

-- ====================================================================
-- DODATNI PODACI ZA TESTIRANJE KURSORA (delayed_orders_details)
-- Cilj: Obezbediti više porudžbina gde su vozači prijavili kašnjenje.
-- ====================================================================

-- Slučaj 2: Vozač #2 (Jovan Jovanović) prijavljuje kašnjenje, ali ipak stiže na vreme.
-- ==================================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, start_delivery_time, delivered_at, driver_reported_delay) VALUES
    (702, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '10 day', 150.00, 1050.00, 1, 1, 2, NOW() - INTERVAL '10 day' + INTERVAL '45 minute', NOW() - INTERVAL '10 day' + INTERVAL '20 minute', NOW() - INTERVAL '10 day' + INTERVAL '44 minute', 10);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (702, 1, 702, 23);
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (702, 702, 2, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES (702, 702, 2, 1, 4, 5, 5, 5);


-- Slučaj 3: Vozač #8 (Petar Petrović) prijavljuje veliko kašnjenje i dobija lošu ocenu.
-- =================================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, start_delivery_time, delivered_at, driver_reported_delay) VALUES
    (703, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '12 day', 150.00, 1300.00, 1, 1, 8, NOW() - INTERVAL '12 day' + INTERVAL '50 minute', NOW() - INTERVAL '12 day' + INTERVAL '15 minute', NOW() - INTERVAL '12 day' + INTERVAL '58 minute', 20);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (703, 1, 703, 67);
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (703, 703, 8, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES (703, 703, 8, 1, 4, 2, 4, 3);


-- Slučaj 4: Vozač #11 (Stefan Petrović) prijavljuje kašnjenje na biciklu.
-- =======================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, start_delivery_time, delivered_at, driver_reported_delay) VALUES
    (704, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '7 day', 200.00, 1100.00, 1, 17, 11, NOW() - INTERVAL '7 day' + INTERVAL '55 minute', NOW() - INTERVAL '7 day' + INTERVAL '25 minute', NOW() - INTERVAL '7 day' + INTERVAL '53 minute', 10);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (704, 1, 704, 69);
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (704, 704, 11, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES (704, 704, 11, 1, 4, 4, 5, 4);


-- Slučaj 5: Vozač #15 (Nemanja Ilic) prijavljuje kašnjenje ali je i dalje super brz sa motorom.
-- ===========================================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, start_delivery_time, delivered_at, driver_reported_delay) VALUES
    (705, 'DELIVERED', 'CARD', 'REGULAR', NOW() - INTERVAL '6 day', 150.00, 3200.00, 1, 1, 15, NOW() - INTERVAL '6 day' + INTERVAL '30 minute', NOW() - INTERVAL '6 day' + INTERVAL '10 minute', NOW() - INTERVAL '6 day' + INTERVAL '29 minute', 5);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (705, 2, 705, 36);
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (705, 705, 15, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES (705, 705, 15, 1, 7, 5, 5, 5);


-- Slučaj 6: Još jedno prijavljeno kašnjenje za Andreja Jovića (ID=16) da bi imao više od jednog unosa.
-- =================================================================================================
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta, start_delivery_time, delivered_at, driver_reported_delay) VALUES
    (706, 'DELIVERED', 'CASH', 'REGULAR', NOW() - INTERVAL '3 day', 150.00, 1650.00, 1, 1, 16, NOW() - INTERVAL '3 day' + INTERVAL '45 minute', NOW() - INTERVAL '3 day' + INTERVAL '20 minute', NOW() - INTERVAL '3 day' + INTERVAL '48 minute', 5);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES (706, 1, 706, 90);
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES (706, 706, 16, 'ACCEPTED');
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES (706, 706, 16, 1, 4, 3, 4, 4);
-- ====================================================================
-- PORUDŽBINE U PRETHODNIM MESECIMA (ZA GRAFIKON) SA SPECIFIČNIM BROJEM PO MESECU
-- ====================================================================

-- Mart 2025 (1 porudžbina)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at, card_amount, cash_amount) VALUES
    (80, 'DELIVERED', 'CARD', 'REGULAR', '2025-03-15 18:00:00', 150.00, 1300.00, 1, 1, 2, '2025-03-15 18:32:00', 1300.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (80, 1, 80, 67); -- Pizza Capricciosa

-- April 2025 (3 porudžbine)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at, card_amount, cash_amount) VALUES
                                                                                                                                                            (81, 'DELIVERED', 'CASH', 'REGULAR', '2025-04-05 13:10:00', 150.00, 1000.00, 1, 1, 8, '2025-04-05 13:45:00', 0.00, 1000.00),
                                                                                                                                                            (82, 'DELIVERED', 'CARD', 'REGULAR', '2025-04-18 20:00:00', 150.00, 1750.00, 1, 11, 9, '2025-04-18 20:25:00', 1750.00, 0.00),
                                                                                                                                                            (83, 'DELIVERED', 'CARD', 'REGULAR', '2025-04-29 19:00:00', 150.00, 2050.00, 1, 1, 2, '2025-04-29 19:33:00', 2050.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (81, 1, 81, 23), -- Classic Cheeseburger
                                                                          (82, 1, 82, 36), -- Spicy Tuna Roll
                                                                          (83, 2, 83, 46); -- 2x Pljeskavica with Kajmak

-- Maj 2025 (4 porudžbine)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at, card_amount, cash_amount) VALUES
                                                                                                                                                            (84, 'DELIVERED', 'CARD', 'REGULAR', '2025-05-01 12:00:00', 150.00, 1450.00, 1, 11, 9, '2025-05-01 12:22:00', 1450.00, 0.00),
                                                                                                                                                            (85, 'DELIVERED', 'CASH', 'REGULAR', '2025-05-12 21:00:00', 150.00, 1950.00, 1, 1, 8, '2025-05-12 21:34:00', 0.00, 1950.00),
                                                                                                                                                            (86, 'DELIVERED', 'CARD', 'REGULAR', '2025-05-22 14:30:00', 150.00, 1450.00, 1, 1, 2, '2025-05-22 14:58:00', 1450.00, 0.00),
                                                                                                                                                            (87, 'DELIVERED', 'CARD', 'REGULAR', '2025-05-30 20:15:00', 150.00, 850.00, 1, 1, 8, '2025-05-30 20:40:00', 850.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (84, 1, 84, 122),-- Chicken with Curry
                                                                          (85, 1, 85, 16), -- Grilled Salmon
                                                                          (86, 1, 86, 100),-- Gluten-Free Pizza
                                                                          (87, 1, 87, 98); -- Chocolate Lava Cake

-- Jun 2025 (2 porudžbine)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at, card_amount, cash_amount) VALUES
                                                                                                                                                            (88, 'DELIVERED', 'CARD', 'REGULAR', '2025-06-10 20:00:00', 150.00, 2750.00, 1, 1, 2, '2025-06-10 20:40:00', 2750.00, 0.00),
                                                                                                                                                            (89, 'DELIVERED', 'CASH', 'REGULAR', '2025-06-25 13:00:00', 150.00, 1050.00, 1, 11, 9, '2025-06-25 13:21:00', 0.00, 1050.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (88, 1, 88, 91), -- Rump Steak
                                                                          (89, 1, 89, 111);-- Hake and Chips

-- Juli 2025 (5 porudžbina)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at, card_amount, cash_amount) VALUES
                                                                                                                                                            (90, 'DELIVERED', 'CARD', 'REGULAR', '2025-07-02 19:10:00', 150.00, 1400.00, 1, 1, 8, '2025-07-02 19:45:00', 1400.00, 0.00),
                                                                                                                                                            (91, 'DELIVERED', 'CASH', 'REGULAR', '2025-07-09 14:00:00', 150.00, 1250.00, 1, 1, 2, '2025-07-09 14:28:00', 0.00, 1250.00),
                                                                                                                                                            (92, 'DELIVERED', 'CARD', 'REGULAR', '2025-07-15 12:30:00', 150.00, 1400.00, 1, 11, 9, '2025-07-15 12:55:00', 1400.00, 0.00),
                                                                                                                                                            (93, 'DELIVERED', 'CARD', 'REGULAR', '2025-07-22 21:00:00', 150.00, 1950.00, 1, 1, 8, '2025-07-22 21:30:00', 1950.00, 0.00),
                                                                                                                                                            (94, 'DELIVERED', 'CARD', 'REGULAR', '2025-07-30 18:45:00', 150.00, 2950.00, 1, 1, 2, '2025-07-30 19:15:00', 2950.00, 0.00);
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (90, 1, 90, 1),   -- Pasta Carbonara
                                                                          (91, 1, 91, 78),  -- Falafel Bowl
                                                                          (92, 1, 92, 68),  -- Quattro Formaggi
                                                                          (93, 3, 93, 45),  -- 3x Ćevapi
                                                                          (94, 1, 94, 56);  -- Beefsteak in Pepper Sauce

-- KATEGORIJE PROBLEMA ZA KORISNIČKU PODRŠKU
INSERT INTO problem_category (id, name, parent_category_id) VALUES
                                                                (1, 'Order problem', NULL),
                                                                (2, 'Delivery problem', NULL),
                                                                (3, 'Technical problem', NULL),
                                                                (4, 'Other', NULL),
                                                                (5, 'Incomplete order', 1),
                                                                (6, 'Wrong order', 1),
                                                                (7, 'Damaged food/packaging', 1),
                                                                (8, 'Cold/spoiled food', 1),
                                                                (9, 'Undeclared allergens', 1),
                                                                (10, 'Undeclared diet type', 1),
                                                                (11, 'Delivery delay', 2),
                                                                (12, 'Order not delivered', 2),
                                                                (13, 'Problem with delivery person', 2),
                                                                (14, 'Website problem', 3);



-- OCJENE ZA DOSTAVLJAČE (DriverRating)
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (1, 1, 2, 1, 5, 3, 5, 4, 5, 5, 5);

INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (3, 3, 2, 1, 5, 3, 5, 4, 5, 5, 5);

-- OCJENE ZA DOSTAVLJAČE (DriverRating)
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (2, 2, 2, 1, 1, 3, 5, 4, null, 5, null);
-- Driver #11 (Stefan) gets a good manager rating for order #101.
-- Restaurant #8 is managed by Manager #7.
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (10, 101, 11, 1, 5, 5, 5, 7, 5, 5, 5);

-- Driver #12 (Luka) gets an average customer rating for order #102, with no manager feedback.
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (11, 102, 12, 1, 4, 3, 4, NULL, NULL, NULL, NULL);

-- Driver #16 (Andrej) has a rich history, let's give him varied ratings.
-- Order #107: Excellent rating from both customer and manager.
-- Restaurant #3 is managed by Manager #4.
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (12, 107, 16, 1, 5, 5, 5, 4, 5, 5, 5);

-- Order #108: A poor rating from the manager, but the customer was satisfied.
-- Restaurant #7 is managed by Manager #4.
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (13, 108, 16, 1, 5, 4, 5, 4, 2, 3, 3);

-- Order #109: Manager-only rating. The customer did not leave a review.
-- Restaurant #9 is managed by Manager #4.
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (14, 109, 16, 1, NULL, NULL, NULL, 4, 4, 5, 4);


-- More ratings for original drivers
-- =======================================

-- Driver #2 (Jovan) gets more ratings for his historical orders.
-- Order #88: Good rating. Restaurant #9 is managed by Manager #4.
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (15, 88, 2, 1, 4, 5, 5, 4, 4, 5, 5);

-- Order #91: The customer complained about hygiene, but the manager rated him well.
-- Restaurant #8 is managed by Manager #7.
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (16, 91, 2, 1, 5, 2, 4, 7, 5, 5, 5);

-- Driver #8 (Petar) gets a perfect score for the delivery with the coupon (order #30).
-- Restaurant #6 is managed by Manager #7.
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (17, 30, 8, 1, 5, 5, 5, 7, 5, 5, 5);

-- Driver #9 (Marko) gets a rating for order #82.
-- Restaurant #4 is managed by Manager #7.
INSERT INTO driver_rating (id, order_id, driver_id, customer_id, on_time_arrival_rating, hygiene_rating_customer, kindness_rating, manager_id, professionalism_rating, hygiene_rating_restaurant, communication_rating) VALUES
    (18, 82, 9, 1, 5, 4, 5, 7, 4, 5, 4);


-- ===== PORUDŽBINA ZA TESTIRANJE "TRACK ON MAP" =====

-- Porudžbina sa ID-jem 150, status je PICKED_UP
-- Dodeljena je vozaču sa ID-jem 9 (Marko Marković)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta) VALUES
    (150, 'PICKED_UP', 'CARD', 'REGULAR', NOW() - INTERVAL '15 minute', 150.00, 1450.00, 1, 1, 9, NOW() + INTERVAL '25 minute');

-- Stavka za tu porudžbinu je iz restorana "Wok Express" (menu_item_version_id = 122)
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (150, 1, 150, 122);

-- Ponuda je morala biti prihvaćena da bi status bio PICKED_UP
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (150, 150, 9, 'ACCEPTED');

-- ====================================================================
-- KORISNIČKA PODRŠKA (SUPPORT TICKETS) I OCENE OPERATERA
-- ====================================================================

-- TIKETI VEZANI ZA PROBLEM SA PORUDŽBINOM (kategorije 5, 6, 7, 8)
-- #1 (Ana, ID=3) - Very fast resolution (12 minutes)
INSERT INTO support_ticket (id, status, description, creation_time, closing_time, operator_id, order_id, problem_category_id) VALUES
    (1, 'CLOSED', 'U porudžbini je nedostajao prilog.', NOW() - INTERVAL '3 day', NOW() - INTERVAL '3 day' + INTERVAL '12 minute', 3, 30, 5);
INSERT INTO operator_rating (id, rating, comment, rating_date) VALUES
    (1, 5, 'Ana je odmah reagovala i organizovala slanje priloga. Svaka čast!', NOW() - INTERVAL '3 day' + INTERVAL '1 hour');

-- #2 (Lana, ID=555) - Fast resolution (25 minutes)
INSERT INTO support_ticket (id, status, description, creation_time, closing_time, operator_id, order_id, problem_category_id) VALUES
    (2, 'CLOSED', 'Stigla mi je pogrešna pica.', NOW() - INTERVAL '5 day', NOW() - INTERVAL '5 day' + INTERVAL '25 minute', 555, 80, 6);
INSERT INTO operator_rating (id, rating, comment, rating_date) VALUES
    (2, 4, 'Problem je rešen, hvala.', NOW() - INTERVAL '5 day' + INTERVAL '1 hour');

-- #3 (Ena, ID=551) - Slower resolution (1 hour 10 minutes)
INSERT INTO support_ticket (id, status, description, creation_time, closing_time, operator_id, order_id, problem_category_id) VALUES
    (3, 'CLOSED', 'Pakovanje je bilo oštećeno i hrana se prosula.', NOW() - INTERVAL '10 day', NOW() - INTERVAL '10 day' + INTERVAL '70 minute', 551, 81, 7);
INSERT INTO operator_rating (id, rating, comment, rating_date) VALUES
    (3, 3, 'Rešeno je, ali je moglo brže.', NOW() - INTERVAL '10 day' + INTERVAL '2 hours');

-- TIKETI VEZANI ZA PROBLEM SA DOSTAVOM (kategorije 11, 13)
-- #4 (Ana, ID=3) - Average resolution (35 minutes)
--INSERT INTO support_ticket (id, status, description, creation_time, closing_time, operator_id, order_id, problem_category_id) VALUES
  --  (4, 'CLOSED', 'Porudžbina kasni već 20 minuta.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '35 minute', 3, 3, 11);
--INSERT INTO operator_rating (id, rating, comment, rating_date) VALUES
  --  (4, 4, 'Dala mi je informaciju gde se vozač nalazi.', NOW() - INTERVAL '1 day' + INTERVAL '1 hour');

-- #5 (Zile, ID=557) - Very fast resolution (8 minutes)
INSERT INTO support_ticket (id, status, description, creation_time, closing_time, operator_id, order_id, problem_category_id) VALUES
    (5, 'CLOSED', 'Vozač je bio izuzetno neljubazan.', NOW() - INTERVAL '4 day', NOW() - INTERVAL '4 day' + INTERVAL '8 minute', 557, 94, 13);
INSERT INTO operator_rating (id, rating, comment, rating_date) VALUES
    (5, 5, 'Zile se izvinio u ime kompanije i ponudio popust, profesionalno.', NOW() - INTERVAL '4 day' + INTERVAL '30 minute');

-- TIKETI VEZANI ZA TEHNIČKE PROBLEME (kategorija 14)
-- #6 (Ana, ID=3) - Fast resolution (18 minutes)
INSERT INTO support_ticket (id, status, description, creation_time, closing_time, operator_id, order_id, problem_category_id) VALUES
    (6, 'CLOSED', 'Ne mogu da platim karticom, sajt izbacuje grešku.', '2025-06-10 20:45:00', '2025-06-10 21:03:00', 3, 88, 14);
INSERT INTO operator_rating (id, rating, comment, rating_date) VALUES
    (6, 5, 'Rešeno u roku od 20 minuta!', '2025-06-10 21:10:00');

-- #7 (Lana, ID=555) - Slower resolution (1 hour 30 minutes)
INSERT INTO support_ticket (id, status, description, creation_time, closing_time, operator_id, order_id, problem_category_id) VALUES
    (7, 'CLOSED', 'Ne učitava mi se stranica za praćenje porudžbine.', NOW() - INTERVAL '6 day', NOW() - INTERVAL '6 day' + INTERVAL '90 minute', 555, 90, 14);
INSERT INTO operator_rating (id, rating, comment, rating_date) VALUES
    (7, 3, 'Odgovorili su posle sat i po.', NOW() - INTERVAL '5 day');


-- TIKETI U KATEGORIJI "OSTALO" (kategorija 4)
-- #8 (Marko, ID=556) - Very fast resolution (4 minutes)
INSERT INTO support_ticket (id, status, description, creation_time, closing_time, operator_id, order_id, problem_category_id) VALUES
    (8, 'CLOSED', 'Želim da pohvalim vozača Petra, bio je izuzetno brz i ljubazan!', NOW() - INTERVAL '2 day', NOW() - INTERVAL '2 day' + INTERVAL '4 minute', 556, 1, 4);
INSERT INTO operator_rating (id, rating, comment, rating_date) VALUES
    (8, 5, 'Hvala Marku što je prosledio pohvalu.', NOW() - INTERVAL '2 day' + INTERVAL '10 minute');


-- OTVORENI TIKETI (NE ULAZE U STATISTIKU)
-- #9 (Mia, ID=552) - Još uvek otvoren
INSERT INTO support_ticket (id, status, description, creation_time, closing_time, operator_id, order_id, problem_category_id) VALUES
    (9, 'OPEN', 'Ne mogu da se ulogujem na nalog.', NOW() - INTERVAL '1 hour', NULL, 552, 92, 14);

ALTER SEQUENCE customer_id_seq RESTART WITH 200;
ALTER SEQUENCE driver_id_seq RESTART WITH 200;
ALTER SEQUENCE operator_id_seq RESTART WITH 200;
ALTER SEQUENCE manager_id_seq RESTART WITH 200;
ALTER SEQUENCE administrator_id_seq RESTART WITH 200;
ALTER SEQUENCE support_administrator_id_seq RESTART WITH 200;
ALTER SEQUENCE address_id_seq RESTART WITH 300000;
ALTER SEQUENCE restaurant_id_seq RESTART WITH 300000;
ALTER SEQUENCE menu_id_seq RESTART WITH 200;
ALTER SEQUENCE menu_version_id_seq RESTART WITH 200;
ALTER SEQUENCE menu_item_id_seq RESTART WITH 200;
ALTER SEQUENCE menu_item_version_id_seq RESTART WITH 200;
ALTER SEQUENCE orders_id_seq RESTART WITH 200;
ALTER SEQUENCE order_item_id_seq RESTART WITH 200;
ALTER SEQUENCE problem_category_id_seq RESTART WITH 200;
ALTER SEQUENCE allergen_id_seq RESTART WITH 200;
ALTER SEQUENCE diet_type_id_seq RESTART WITH 200;
ALTER SEQUENCE driver_rating_id_seq RESTART WITH 200;
ALTER SEQUENCE order_offer_id_seq RESTART WITH 200;
ALTER SEQUENCE repeating_order_id_seq RESTART WITH 200;
ALTER SEQUENCE support_ticket_id_seq RESTART WITH 100;