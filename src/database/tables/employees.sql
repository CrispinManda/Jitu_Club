CREATE TABLE Employees (
    employee_id VARCHAR(100) NOT NULL ,
    fname VARCHAR(200) NOT NULL,
    lname VARCHAR(200) NOT NULL,
    email VARCHAR(300) NOT NULL UNIQUE,
    cohort VARCHAR(200) NOT NULL,
    phone_no VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    role VARCHAR(20) Default 'employee',
    welcomed BIT Default 0,
    isDeleted BIT DEFAULT 0 
)

-- DROP TABLE Employees

-- SELECT * FROM Employees

ALTER TABLE Employees ADD isDeleted BIT DEFAULT 0 

UPDATE Employees SET isDeleted = 0


SELECT * FROM EMPLOYEES WHERE EMAIL ='dan.kitheka@thejitu.com' 

UPDATE Employees SET role = 'admin' WHERE email = 'dan.kitheka@thejitu.com'