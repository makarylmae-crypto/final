-- FreshKart PH Aiven MySQL database setup
-- Run this in your Aiven MySQL console/database before deployment.
-- The server.js also creates these tables and seeds these records automatically if tables are empty.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('farmer','resident','admin') NOT NULL DEFAULT 'resident',
  address TEXT,
  phone VARCHAR(80),
  farm_name VARCHAR(190),
  farm_description TEXT,
  farm_avatar LONGTEXT,
  avatar LONGTEXT,
  created_at VARCHAR(40) NOT NULL,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(80) PRIMARY KEY,
  farmer_id VARCHAR(80) NOT NULL,
  farmer_name VARCHAR(150) NOT NULL,
  farm_name VARCHAR(190) NOT NULL,
  name VARCHAR(190) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit VARCHAR(40) NOT NULL DEFAULT 'kg',
  category VARCHAR(60) NOT NULL DEFAULT 'other',
  image LONGTEXT,
  stock INT NOT NULL DEFAULT 0,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  organic TINYINT(1) NOT NULL DEFAULT 0,
  location VARCHAR(190),
  created_at VARCHAR(40) NOT NULL,
  INDEX idx_products_farmer (farmer_id),
  INDEX idx_products_category (category),
  INDEX idx_products_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(80) PRIMARY KEY,
  resident_id VARCHAR(80) NOT NULL,
  resident_name VARCHAR(150) NOT NULL,
  resident_address TEXT,
  resident_phone VARCHAR(80),
  farmer_id VARCHAR(80) NOT NULL,
  items JSON NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  status_history JSON NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  delivery_address TEXT,
  notes TEXT,
  payment JSON NOT NULL,
  delivery_assignment JSON NULL,
  INDEX idx_orders_resident (resident_id),
  INDEX idx_orders_farmer (farmer_id),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO users (id, name, email, password, role, address, phone, farm_name, farm_description, farm_avatar, avatar, created_at) VALUES
  ('seed-admin-1', 'Admin FreshKart', 'admin@freshkart.ph', 'admin123', 'admin', 'Hinunangan, Southern Leyte', '+63 999 000 1111', '', '', '', '', '2026-01-01T00:00:00Z'),
  ('seed-farmer-1', 'Juan Dela Cruz', 'juan@freshkart.ph', 'farmer123', 'farmer', 'Poblacion, Hinunangan, Southern Leyte', '+63 912 345 6789', 'Bayanihan Farm', '', '', '', '2026-01-01T08:00:00Z'),
  ('seed-farmer-2', 'Maria Santos', 'maria@freshkart.ph', 'farmer123', 'farmer', 'Brgy. San Jose, Hinunangan, Southern Leyte', '+63 923 456 7890', 'Masagana Agri-Farm', '', '', '', '2026-01-02T08:00:00Z'),
  ('seed-farmer-3', 'Pedro Reyes', 'pedro@freshkart.ph', 'farmer123', 'farmer', 'Brgy. Mahayahay, Hinunangan, Southern Leyte', '+63 934 567 8901', 'Bulacan Harvest', '', '', '', '2026-01-03T08:00:00Z'),
  ('seed-resident-1', 'Anna Gonzales', 'anna@freshkart.ph', 'resident123', 'resident', 'Brgy. Catublian, Hinunangan, Southern Leyte', '+63 945 678 9012', '', '', '', '', '2026-01-05T08:00:00Z'),
  ('seed-resident-2', 'Benito Reyes', 'ben@freshkart.ph', 'resident123', 'resident', 'Brgy. San Antonio, Hinunangan, Southern Leyte', '+63 956 789 0123', '', '', '', '', '2026-01-07T08:00:00Z')
ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), role = VALUES(role), address = VALUES(address), phone = VALUES(phone), farm_name = VALUES(farm_name);

INSERT INTO products (id, farmer_id, farmer_name, farm_name, name, description, price, unit, category, image, stock, is_available, organic, location, created_at) VALUES
  ('seed-p-1', 'seed-farmer-1', 'Juan Dela Cruz', 'Bayanihan Farm', 'Fresh Baguio Beans', 'Freshly picked green beans from the cool highlands. Pesticide-free.', 80, 'kg', 'vegetables', 'https://images.pexels.com/photos/4148642/pexels-photo-4148642.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', 50, 1, 1, 'Hinunangan, Southern Leyte', '2026-01-15T08:00:00Z'),
  ('seed-p-2', 'seed-farmer-1', 'Juan Dela Cruz', 'Bayanihan Farm', 'Organic Eggplant', 'Large, glossy purple eggplants grown with natural compost.', 60, 'kg', 'vegetables', 'https://images.pexels.com/photos/16732700/pexels-photo-16732700.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', 40, 1, 1, 'Hinunangan, Southern Leyte', '2026-01-15T08:00:00Z'),
  ('seed-p-3', 'seed-farmer-1', 'Juan Dela Cruz', 'Bayanihan Farm', 'Cavendish Banana', 'Sweet ripe Cavendish bananas from our plantation.', 50, 'kg', 'fruits', 'https://images.pexels.com/photos/30893281/pexels-photo-30893281.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', 100, 1, 0, 'Hinunangan, Southern Leyte', '2026-01-15T08:00:00Z'),
  ('seed-p-4', 'seed-farmer-2', 'Maria Santos', 'Masagana Agri-Farm', 'Fresh Tilapia', 'Live fresh tilapia from our fishpond. Clean and sweet-tasting.', 120, 'kg', 'fish', 'https://images.pexels.com/photos/36618317/pexels-photo-36618317.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', 30, 1, 1, 'Hinunangan, Southern Leyte', '2026-01-16T08:00:00Z'),
  ('seed-p-5', 'seed-farmer-2', 'Maria Santos', 'Masagana Agri-Farm', 'Free-Range Native Chicken', 'Native chicken raised free-range. Perfect for tinola.', 250, 'piece', 'poultry', 'https://images.pexels.com/photos/30248442/pexels-photo-30248442.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', 20, 1, 1, 'Hinunangan, Southern Leyte', '2026-01-16T08:00:00Z'),
  ('seed-p-6', 'seed-farmer-2', 'Maria Santos', 'Masagana Agri-Farm', 'Carabao Mangoes', 'Sweetest carabao mangoes from Luzon. Farm-fresh!', 150, 'kg', 'fruits', 'https://images.pexels.com/photos/30893290/pexels-photo-30893290.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', 25, 1, 1, 'Hinunangan, Southern Leyte', '2026-01-16T08:00:00Z'),
  ('seed-p-7', 'seed-farmer-3', 'Pedro Reyes', 'Bulacan Harvest', 'Fresh Duck Eggs (Itlog na Pato)', 'Farm-fresh duck eggs. Perfect for balut or salted egg.', 12, 'piece', 'poultry', 'https://images.pexels.com/photos/32701556/pexels-photo-32701556.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', 200, 1, 0, 'Hinunangan, Southern Leyte', '2026-01-17T08:00:00Z'),
  ('seed-p-8', 'seed-farmer-3', 'Pedro Reyes', 'Bulacan Harvest', 'Malagkit Rice (Glutinous)', 'Premium malagkit rice perfect for suman and kakanin.', 70, 'kg', 'rice-grains', 'https://images.pexels.com/photos/18446086/pexels-photo-18446086.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', 100, 1, 0, 'Hinunangan, Southern Leyte', '2026-01-17T08:00:00Z')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price = VALUES(price), stock = VALUES(stock), is_available = VALUES(is_available), organic = VALUES(organic), location = VALUES(location);

INSERT INTO orders (id, resident_id, resident_name, resident_address, resident_phone, farmer_id, items, total_amount, status, status_history, created_at, updated_at, delivery_address, notes, payment, delivery_assignment) VALUES
  ('seed-order-1', 'seed-resident-1', 'Anna Gonzales', 'Brgy. Catublian, Hinunangan, Southern Leyte', '+63 945 678 9012', 'seed-farmer-1', '[{"productId":"seed-p-1","productName":"Fresh Baguio Beans","quantity":2,"unitPrice":80},{"productId":"seed-p-3","productName":"Cavendish Banana","quantity":3,"unitPrice":50}]', 310, 'delivered', '[{"status":"pending","timestamp":"2026-02-01T08:00:00Z"},{"status":"confirmed","timestamp":"2026-02-01T10:00:00Z"},{"status":"processing","timestamp":"2026-02-01T14:00:00Z"},{"status":"shipped","timestamp":"2026-02-02T06:00:00Z"},{"status":"delivered","timestamp":"2026-02-02T14:00:00Z"}]', '2026-02-01T08:00:00Z', '2026-02-02T14:00:00Z', 'Brgy. Catublian, Hinunangan, Southern Leyte', '', '{"method":"gcash","status":"paid","reference":"GC-2026-001","paidAt":"2026-02-01T08:05:00Z"}', '{"driverName":"Carlos Mendoza","driverPhone":"+63 917 111 2233","assignedAt":"2026-02-02T06:00:00Z","estimatedDelivery":"2026-02-02T14:00:00Z"}'),
  ('seed-order-2', 'seed-resident-1', 'Anna Gonzales', 'Brgy. Catublian, Hinunangan, Southern Leyte', '+63 945 678 9012', 'seed-farmer-2', '[{"productId":"seed-p-4","productName":"Fresh Tilapia","quantity":2,"unitPrice":120},{"productId":"seed-p-6","productName":"Carabao Mangoes","quantity":1,"unitPrice":150}]', 390, 'shipped', '[{"status":"pending","timestamp":"2026-02-05T08:00:00Z"},{"status":"confirmed","timestamp":"2026-02-05T09:00:00Z"},{"status":"processing","timestamp":"2026-02-05T12:00:00Z"},{"status":"shipped","timestamp":"2026-02-06T06:00:00Z"}]', '2026-02-05T08:00:00Z', '2026-02-06T06:00:00Z', 'Brgy. Catublian, Hinunangan, Southern Leyte', '', '{"method":"cod","status":"unpaid"}', '{"driverName":"Liza Fernandez","driverPhone":"+63 918 222 3344","assignedAt":"2026-02-06T06:00:00Z","estimatedDelivery":"2026-02-06T18:00:00Z"}')
ON DUPLICATE KEY UPDATE status = VALUES(status), status_history = VALUES(status_history), payment = VALUES(payment), delivery_assignment = VALUES(delivery_assignment);

SET FOREIGN_KEY_CHECKS = 1;

-- Demo accounts:
-- Admin: admin@freshkart.ph / admin123
-- Farmer: juan@freshkart.ph / farmer123
-- Farmer: maria@freshkart.ph / farmer123
-- Resident: anna@freshkart.ph / resident123
-- Resident: ben@freshkart.ph / resident123
