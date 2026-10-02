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
 
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluator_id INT,
    evaluatee_id INT,
    evaluatee_name VARCHAR(100),
    department VARCHAR(100),
    period VARCHAR(100),
    status VARCHAR(30)
);
INSERT INTO assignments
(evaluator_id, employee_id, period_id, status)
VALUES
(2, 5, 1, 'รอประเมิน');