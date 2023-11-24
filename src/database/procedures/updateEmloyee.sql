-- Stored Procedure: updateEmployee
CREATE PROCEDURE updateEmployee
    @employee_id VARCHAR(255),
    @fname VARCHAR(255),
    @lname VARCHAR(255),
    @email VARCHAR(255),
    @cohort VARCHAR(255),
    @phone_no VARCHAR(255),
    @password VARCHAR(255)
AS
BEGIN
    UPDATE Employees
    SET 
        fname = @fname,
        lname = @lname,
        email = @email,
        cohort = @cohort,
        phone_no = @phone_no,
        password = @password
    WHERE employee_id = @employee_id;
END;

