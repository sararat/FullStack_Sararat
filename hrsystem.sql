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

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,

    employee_code VARCHAR(50) NOT NULL UNIQUE,

    name VARCHAR(255) NOT NULL,

    position VARCHAR(255) NOT NULL,

    department_id INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
INSERT INTO departments (name)
VALUES
('แผนกเทคโนโลยีสารสนเทศ'),
('แผนกคอมพิวเตอร์ธุรกิจ'),
('แผนกอิเล็กทรอนิกส์'),
('แผนกบัญชี'),
('แผนกบริหารธุรกิจ');

INSERT INTO employees
(
    employee_code,
    name,
    position,
    department_id
)
VALUES
(
    'EMP001',
    'นางสาวสมหญิง ใจดี',
    'ครู',
    1
),
(
    'EMP002',
    'นายสมชาย รักเรียน',
    'ครู',
    1
),
(
    'EMP003',
    'นางสาวสุดา พัฒนา',
    'ครู',
    2
);