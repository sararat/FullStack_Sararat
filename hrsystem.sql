CREATE DATABASE hrsystem;
USE hrsystem;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM(
        'personnel',
        'evaluatee',
        'evaluator'
    ) NOT NULL,
    avatar VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20),
    name VARCHAR(100),
    position VARCHAR(100),
    department_id INT
);
INSERT INTO employees
(employee_code, name, position, department_id)
VALUES
('EMP001', 'นายสมชาย ใจดี', 'ครู', 1),
('EMP002', 'นางสาวสมหญิง ดีมาก', 'ครู', 1),
('EMP003', 'นายวิชัย เก่งงาน', 'ครูผู้ช่วย', 2),
('EMP004', 'นายอนันต์ เทคโนโลยี', 'ครู', 3),
('EMP005', 'นายประสิทธิ์ ช่างดี', 'ครู', 4);
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);
INSERT INTO departments (name)
VALUES
('เทคโนโลยีสารสนเทศ'),
('คอมพิวเตอร์ธุรกิจ'),
('อิเล็กทรอนิกส์'),
('ช่างยนต์');
CREATE TABLE evaluation_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    start_date DATE,
    end_date DATE
);
INSERT INTO evaluation_periods
(name, start_date, end_date)
VALUES
('รอบที่ 1/2569', '2026-01-01', '2026-06-30');

CREATE TABLE evaluation_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_id INT,
    name VARCHAR(200),
    description TEXT
);
INSERT INTO evaluation_topics
(period_id, name, description)
VALUES
(1, 'การจัดการเรียนการสอน', 'การจัดการเรียนการสอนของบุคลากร');
CREATE TABLE evaluation_indicators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT,
    name VARCHAR(200),
    description TEXT,
    weight INT
);
INSERT INTO evaluation_indicators
(topic_id, name, description, weight)
VALUES
(1, 'การจัดทำแผนการสอน', 'มีแผนการสอนครบถ้วน', 20);
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluator_id INT,
    employee_id INT,
    period_id INT,
    status VARCHAR(20)
);
INSERT INTO assignments
(evaluator_id, employee_id, period_id, status)
VALUES
(2, 5, 1, 'รอประเมิน');