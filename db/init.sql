-- Type Groups (lookup table)
CREATE TABLE type_group (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Types (lookup table)
CREATE TABLE types (
  id INTEGER PRIMARY KEY,
  type_group_id INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_types_type_group FOREIGN KEY (type_group_id) REFERENCES type_group(id)
);

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Users Settings
CREATE TABLE users_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  unit_of_measure VARCHAR DEFAULT 'MT',
  user_type_id INTEGER NOT NULL DEFAULT 102,
  CONSTRAINT fk_users_settings_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_users_settings_type FOREIGN KEY (user_type_id) REFERENCES types(id)
);

-- Gear
CREATE TABLE gear (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  brand VARCHAR,
  model VARCHAR,
  purchase_date TIMESTAMP,
  usage_km DECIMAL,
  notes VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  retired_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  status_id INTEGER NOT NULL,
  CONSTRAINT fk_gear_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_gear_status FOREIGN KEY (status_id) REFERENCES types(id)
);

-- Gear Health
CREATE TABLE gear_health (
  id SERIAL PRIMARY KEY,
  gear_id INTEGER NOT NULL UNIQUE,
  use_days BOOLEAN,
  use_km BOOLEAN,
  threshold_days INTEGER,
  threshold_km DECIMAL,
  CONSTRAINT fk_gear_health_gear FOREIGN KEY (gear_id) REFERENCES gear(id)
);

-- Gear Usage Log
CREATE TABLE gear_usage_log (
  id SERIAL PRIMARY KEY,
  gear_id INTEGER NOT NULL,
  source_id INTEGER,
  usage_km DECIMAL,
  usage_days INTEGER,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_gear_usage_log_gear FOREIGN KEY (gear_id) REFERENCES gear(id)
);

-- Part
CREATE TABLE part (
  id SERIAL PRIMARY KEY,
  gear_id INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  brand VARCHAR,
  notes VARCHAR,
  price DECIMAL,
  usage_km DECIMAL,
  purchase_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  retired_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  status_id INTEGER NOT NULL,
  CONSTRAINT fk_part_gear FOREIGN KEY (gear_id) REFERENCES gear(id),
  CONSTRAINT fk_part_status FOREIGN KEY (status_id) REFERENCES types(id)
);

-- Tracker
CREATE TABLE tracker (
  id SERIAL PRIMARY KEY,
  gear_id INTEGER,
  part_id INTEGER,
  type_id INTEGER NOT NULL,
  threshold_days INTEGER,
  threshold_km DECIMAL,
  notification_type_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_tracker_gear FOREIGN KEY (gear_id) REFERENCES gear(id),
  CONSTRAINT fk_tracker_part FOREIGN KEY (part_id) REFERENCES part(id),
  CONSTRAINT fk_tracker_notification_type FOREIGN KEY (notification_type_id) REFERENCES types(id)
);

-- Maintenance Log
CREATE TABLE maintenance_log (
  id SERIAL PRIMARY KEY,
  gear_id INTEGER,
  part_id INTEGER,
  notes VARCHAR,
  usage_km_at_service DECIMAL,
  cost DECIMAL,
  service_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_maintenance_log_gear FOREIGN KEY (gear_id) REFERENCES gear(id),
  CONSTRAINT fk_maintenance_log_part FOREIGN KEY (part_id) REFERENCES part(id)
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  source_id INTEGER,
  type_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_received BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_notifications_type FOREIGN KEY (type_id) REFERENCES types(id)
);

-- Create indexes for common query patterns
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_gear_user_id ON gear(user_id);
CREATE INDEX idx_gear_status_id ON gear(status_id);
CREATE INDEX idx_gear_usage_log_gear_id ON gear_usage_log(gear_id);
CREATE INDEX idx_part_gear_id ON part(gear_id);
CREATE INDEX idx_part_status_id ON part(status_id);
CREATE INDEX idx_tracker_gear_id ON tracker(gear_id);
CREATE INDEX idx_tracker_part_id ON tracker(part_id);
CREATE INDEX idx_maintenance_log_gear_id ON maintenance_log(gear_id);
CREATE INDEX idx_maintenance_log_part_id ON maintenance_log(part_id);
CREATE INDEX idx_notifications_type_id ON notifications(type_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_types_type_group_id ON types(type_group_id);

-- INSERT STATEMENTS

INSERT INTO users (first_name, last_name, username, password, email, is_deleted) VALUES
('Jane', 'Foster', 'jdfoster', '', 'jane.foster@example.com', false),
('Richard', 'Miller', 'richardm19', '', 'richard.miller@example.com', true),
('Barrys', 'Bonds', 'thebarrybb88', '', 'barrys.bonds@example.com', false),
('Harold', 'Foster', 'hryfoster', '', 'harold.foster@example.com', false);

INSERT INTO type_group (id, name, code) VALUES 
(200, 'Gear Status', 'GRS'),
(300, 'Part Status', 'PTS'),
(100, 'User Types', 'UST');

INSERT INTO types (id, type_group_id, name, code) VALUES 
(101, 100, 'Admin', 'ADM'),
(102, 100, 'Regular', 'REG'),
(205, 200, 'Healthy', 'HTH'), 
(305, 300, 'Healthy', 'HTH'); 

INSERT INTO gear (user_id, name, brand, model, purchase_date, usage_km, notes, status_id) VALUES 
(1, 'Bike', 'Cannondale', 'Mark 2', CURRENT_TIMESTAMP, 500, 'These are notes.', 205);

INSERT INTO gear (user_id, name, brand, model, purchase_date, usage_km, notes, status_id) VALUES 
(1, 'Snowboard', 'Burton', 'Board 7', CURRENT_TIMESTAMP, 70, 'These are notes.', 205);

INSERT INTO part (gear_id, name, brand, notes, price, usage_km, status_id) VALUES 
(1, 'Chain', 'Chain Brand', 'notes', 150, 50, 305);