-- Stored Procedure: fetchOneEmployee
CREATE PROCEDURE fetchOneEmployee
    @employee_id VARCHAR(255)
AS
BEGIN
    SELECT * FROM Employees
    WHERE employee_id = @employee_id;
END;
