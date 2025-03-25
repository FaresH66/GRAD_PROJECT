use gatekeeping_db;

--dummy data 
-- Gatekeeper: fares@admin.com, password=password123
INSERT INTO users (role, name, email, password_hash) 
VALUES ('admin', 'Admin User', 'fares@admin.com', '$2b$12$o21h5IGExviS4ptHKAzy7uQQyDQfDI6qofL2z8bhf0zmVq1RhrHpq');

-- Gatekeeper: email=fares@keeper.com, password=password123
INSERT INTO users (role, name, email, password_hash) 
VALUES ('gatekeeper', 'Gatekeeper User', 'fares@keeper.com', '$2b$12$o21h5IGExviS4ptHKAzy7uQQyDQfDI6qofL2z8bhf0zmVq1RhrHpq');

-- Resident: email=fares@resident.com, password=password123
INSERT INTO users (role, name, email, password_hash) 
VALUES ('resident', 'Resident User', 'fares@resident.com', '$2b$12$o21h5IGExviS4ptHKAzy7uQQyDQfDI6qofL2z8bhf0zmVq1RhrHpq');

-- Link resident to residents table
INSERT INTO residents (user_id, face_data_ref) 
VALUES (2, NULL);  -- user_id=3 corresponds to resident@example.com

-- Add a car for the resident
INSERT INTO cars (resident_id, license_plate) 
VALUES (2, 'ABC123');  -- resident_id=1 corresponds to the resident entry