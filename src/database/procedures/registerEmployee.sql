CREATE OR ALTER PROCEDURE registerEmployee(
    @employee_id VARCHAR(100),
    @fname VARCHAR(200),
    @lname VARCHAR(200),
    @email VARCHAR(300),
    @phone_no VARCHAR(20),
    @password VARCHAR(200)
)
AS
BEGIN

    INSERT INTO Employees(employee_id, name, email, phone_no, id_no, KRA_PIN, NHIF_NO, NSSF_NO, password)
    VALUES(@employee_id, @fname,@lname, @email, @phone_no,  @password)

END