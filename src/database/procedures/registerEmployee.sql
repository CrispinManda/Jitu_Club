CREATE OR ALTER PROCEDURE registerEmployee(
    @employee_id VARCHAR(100),
    @fname VARCHAR(200),
    @lname VARCHAR(200),
    @email VARCHAR(300),
    @cohort VARCHAR(20),
    @phone_no VARCHAR(20),
    @password VARCHAR(200)
)
AS
BEGIN

    INSERT INTO Employees(employee_id, fname, lname, email, cohort, phone_no, password)
    VALUES(@employee_id, @fname,@lname, @email, ,@cohort, @phone_no,  @password )

END