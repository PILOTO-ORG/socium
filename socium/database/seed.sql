-- SQL commands to seed initial data into the database

-- Insert sample leads
INSERT INTO leads (name, email, phone, status) VALUES
('John Doe', 'john.doe@example.com', '123-456-7890', 'new'),
('Jane Smith', 'jane.smith@example.com', '098-765-4321', 'contacted'),
('Alice Johnson', 'alice.johnson@example.com', '555-555-5555', 'qualified');

-- Insert sample messages
INSERT INTO messages (lead_id, content, created_at) VALUES
(1, 'Interested in your services.', NOW()),
(1, 'Can you provide more details?', NOW()),
(2, 'Looking for a quote.', NOW()),
(3, 'I would like to schedule a meeting.', NOW());