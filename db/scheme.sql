CREATE DATABASE gatekeeping_db;

use gatekeeping_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin', 'resident', 'gatekeeper') NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE residents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    face_data_ref VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE home(
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_section varchar(20),
    home_num varchar(20),
    home_appart varchar(20),
    res_id int not null,
    FOREIGN KEY (res_id) REFERENCES residents(id)
);

CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT,
    license_plate VARCHAR(50) UNIQUE,
    FOREIGN KEY (resident_id) REFERENCES residents(id)
);

CREATE TABLE guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT,
    face_data_ref VARCHAR(255),
    license_plate VARCHAR(50),
    invitation_start DATETIME,
    arrival_time DATETIME,
    status ENUM('pending', 'arrived', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (resident_id) REFERENCES residents(id)
);

CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_type VARCHAR(50),
    details JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);