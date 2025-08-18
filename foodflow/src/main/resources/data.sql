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



-- Track on map
INSERT INTO driver (id, email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, timestamp, average_rating) VALUES
    (9, 'driver3@example.com', '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi', 'Marko', 'Marković', '066123456', 'DRIVER', 'CAR', 'ONLINE', 0, 45.2550, 19.8456, NOW(), 0.0);

-- ISPRAVLJENA INSERT KOMANDA ZA PORUDŽBINU #31 (SIMULACIJA OD 30 SEKUNDI)
-- ISPRAVLJENA INSERT KOMANDA ZA PORUDŽBINU #31 (za praćenje)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, eta) VALUES
    (31, 'PICKED_UP', 'CARD', 'REGULAR',
     NOW() - INTERVAL '2 hours',          -- Postavlja vreme kreiranja na SADA (u UTC)
     150.00, 1450.00, 1, 11, 9,
     (NOW() - INTERVAL '2 hours') + INTERVAL '5 minute' -- Postavlja ETA na 5 MINUTA U BUDUĆNOST (u UTC)
    );
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (31, 1, 31, 122); -- 1x Piletina sa karijem

-- Ponudu je prihvatio novi vozač
INSERT INTO order_offer (id, order_id, driver_id, status) VALUES
    (31, 31, 9, 'ACCEPTED');
-- ====================================================================
-- PORUDŽBINE U PRETHODNIM MESECIMA (ZA GRAFIKON) SA SPECIFIČNIM BROJEM PO MESECU
-- ====================================================================

-- Mart 2025 (1 porudžbina)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at) VALUES
    (80, 'DELIVERED', 'CARD', 'REGULAR', '2025-03-15 18:00:00', 150.00, 1300.00, 1, 1, 2, '2025-03-15 18:32:00');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
    (80, 1, 80, 67); -- Pizza Capricciosa

-- April 2025 (3 porudžbine)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at) VALUES
                                                                                                                                                            (81, 'DELIVERED', 'CASH', 'REGULAR', '2025-04-05 13:10:00', 150.00, 1000.00, 1, 1, 8, '2025-04-05 13:45:00'),
                                                                                                                                                            (82, 'DELIVERED', 'CARD', 'REGULAR', '2025-04-18 20:00:00', 150.00, 1750.00, 1, 11, 9, '2025-04-18 20:25:00'),
                                                                                                                                                            (83, 'DELIVERED', 'CARD', 'REGULAR', '2025-04-29 19:00:00', 150.00, 2050.00, 1, 1, 2, '2025-04-29 19:33:00');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (81, 1, 81, 23), -- Classic Cheeseburger
                                                                          (82, 1, 82, 36), -- Spicy Tuna Roll
                                                                          (83, 2, 83, 46); -- 2x Pljeskavica with Kajmak

-- Maj 2025 (4 porudžbine)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at) VALUES
                                                                                                                                                            (84, 'DELIVERED', 'CARD', 'REGULAR', '2025-05-01 12:00:00', 150.00, 1450.00, 1, 11, 9, '2025-05-01 12:22:00'),
                                                                                                                                                            (85, 'DELIVERED', 'CASH', 'REGULAR', '2025-05-12 21:00:00', 150.00, 1950.00, 1, 1, 8, '2025-05-12 21:34:00'),
                                                                                                                                                            (86, 'DELIVERED', 'CARD', 'REGULAR', '2025-05-22 14:30:00', 150.00, 1450.00, 1, 1, 2, '2025-05-22 14:58:00'),
                                                                                                                                                            (87, 'DELIVERED', 'CARD', 'REGULAR', '2025-05-30 20:15:00', 150.00, 850.00, 1, 1, 8, '2025-05-30 20:40:00');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (84, 1, 84, 122),-- Chicken with Curry
                                                                          (85, 1, 85, 16), -- Grilled Salmon
                                                                          (86, 1, 86, 100),-- Gluten-Free Pizza
                                                                          (87, 1, 87, 98); -- Chocolate Lava Cake

-- Jun 2025 (2 porudžbine)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at) VALUES
                                                                                                                                                            (88, 'DELIVERED', 'CARD', 'REGULAR', '2025-06-10 20:00:00', 150.00, 2750.00, 1, 1, 2, '2025-06-10 20:40:00'),
                                                                                                                                                            (89, 'DELIVERED', 'CASH', 'REGULAR', '2025-06-25 13:00:00', 150.00, 1050.00, 1, 11, 9, '2025-06-25 13:21:00');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (88, 1, 88, 91), -- Rump Steak
                                                                          (89, 1, 89, 111);-- Hake and Chips

-- Juli 2025 (5 porudžbina)
INSERT INTO orders (id, status, payment_type, order_type, creation_date, delivery_price, total_price, customer_id, address_id, driver_id, delivered_at) VALUES
                                                                                                                                                            (90, 'DELIVERED', 'CARD', 'REGULAR', '2025-07-02 19:10:00', 150.00, 1400.00, 1, 1, 8, '2025-07-02 19:45:00'),
                                                                                                                                                            (91, 'DELIVERED', 'CASH', 'REGULAR', '2025-07-09 14:00:00', 150.00, 1250.00, 1, 1, 2, '2025-07-09 14:28:00'),
                                                                                                                                                            (92, 'DELIVERED', 'CARD', 'REGULAR', '2025-07-15 12:30:00', 150.00, 1400.00, 1, 11, 9, '2025-07-15 12:55:00'),
                                                                                                                                                            (93, 'DELIVERED', 'CARD', 'REGULAR', '2025-07-22 21:00:00', 150.00, 1950.00, 1, 1, 8, '2025-07-22 21:30:00'),
                                                                                                                                                            (94, 'DELIVERED', 'CARD', 'REGULAR', '2025-07-30 18:45:00', 150.00, 2950.00, 1, 1, 2, '2025-07-30 19:15:00');
INSERT INTO order_item (id, quantity, order_id, menu_item_version_id) VALUES
                                                                          (90, 1, 90, 1),   -- Pasta Carbonara
                                                                          (91, 1, 91, 78),  -- Falafel Bowl
                                                                          (92, 1, 92, 68),  -- Quattro Formaggi
                                                                          (93, 3, 93, 45),  -- 3x Ćevapi
                                                                          (94, 1, 94, 56);  -- Beefsteak in Pepper Sauce

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



ALTER SEQUENCE customer_id_seq RESTART WITH 200;
ALTER SEQUENCE driver_id_seq RESTART WITH 200;
ALTER SEQUENCE operator_id_seq RESTART WITH 200;
ALTER SEQUENCE manager_id_seq RESTART WITH 200;
ALTER SEQUENCE administrator_id_seq RESTART WITH 200;
ALTER SEQUENCE support_administrator_id_seq RESTART WITH 200;
ALTER SEQUENCE address_id_seq RESTART WITH 200;
ALTER SEQUENCE restaurant_id_seq RESTART WITH 200;
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