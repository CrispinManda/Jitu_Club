import mssql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // Import v4 as uuidv4 for better clarity
import { loginEmployee, registerEmployee, updateEmployee } from './employeesController';
import { Request, Response } from 'express';
import { any } from 'joi';

describe('Member Registration', () => {
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('successfully registers a member', async () => {
    const req = {
      body: {
        fname: 'Test',
        lname: 'Test',
        email: 'test.test@thejitu.com',
        phone_no: '07857646576', // Corrected phone number format
        password: 'HashedPass@word123',
      },
    };

    jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('HashedPass@word123' as never);

    const mockedInput = jest.fn().mockReturnThis();

    const mockedExecute = jest.fn().mockResolvedValue({ rowsAffected: [1] });

    const mockedRequest = {
      input: mockedInput,
      execute: mockedExecute,
    };

    const mockedPool = {
      request: jest.fn().mockReturnValue(mockedRequest),
    };

    jest.spyOn(mssql, 'connect').mockResolvedValue(mockedPool as never);

    await registerEmployee(req as Request, res as any);

    // Assertions

    expect(res.json).toHaveBeenCalledWith({ message: 'Member registered successfully' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockedInput).toHaveBeenCalledWith('password', mssql.VarChar, 'HashedPass@word123');
    expect(mockedInput).toHaveBeenCalledWith('fname', mssql.VarChar, 'Test');
    expect(mockedInput).toHaveBeenCalledWith('lname', mssql.VarChar, 'Test');
    expect(mockedInput).toHaveBeenCalledWith('email', mssql.VarChar, 'test.test@thejitu.com');
    expect(mockedInput).toHaveBeenCalledWith('phone_no', mssql.VarChar, '07857646576');
  });
});






// login employeee

describe('Employee Login', () => {
    let res: any;
  
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });
  
    it('successfully logs in an employee', async () => {
      const req = {
        body: {
          email: 'test.test@thejitu.com',
          password: 'HashedPass@word123',
        },
      };
  
      const mockedInput = jest.fn().mockReturnThis();
  
      const mockedExecute = jest.fn().mockResolvedValue({
        recordset: [
          {
            email: 'test.test@thejitu.com',
            password: await bcrypt.hash('12345', 5),
           fname: 'Test',
           lname: 'TestTwo',
           phone_no:'07857646576',
          

          },
        ],
      });
  
      const mockedRequest = {
        input: mockedInput,
        execute: mockedExecute,
      };
  
      const mockedPool = {
        request: jest.fn().mockReturnValue(mockedRequest ),
      };
  
      jest.spyOn(mssql, 'connect').mockResolvedValue(mockedPool as never);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false))
  
      const jwtSignSpy = jest.spyOn(jwt, 'sign');
  
      await loginEmployee(req as Request, res as any);
  
      // Assertions
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged in successfully',
        token: expect.any(String),
      });
  
      expect(jwtSignSpy).toHaveBeenCalledWith(
        {     fname: 'Test',
        lname: 'User', },
        process.env.SECRET as string,
        { expiresIn: '24h' }
      );
    });
  
    it('handles incorrect password', async () => {
      const req = {
        body: {
          email: 'test.test@thejitu.com',
          password: 'IncorrectPassword',
        },
      };
  
      const mockedInput = jest.fn().mockReturnThis();
  
      const mockedExecute = jest.fn().mockResolvedValue({
        recordset: [
          {
            email: 'test.test@thejitu.com',
            password: await bcrypt.hash('12345', 5),
          },
        ],
      });
  
      const mockedRequest = {
        input: mockedInput,
        execute: mockedExecute,
      };
  
      const mockedPool = {
        request: jest.fn().mockReturnValue(mockedRequest),
      };
  
      jest.spyOn(mssql, 'connect').mockResolvedValue(mockedPool as never);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true))
  
      await loginEmployee(req as Request, res as any);
  
      // Assertions
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Incorrect password',
      });
    });
  
    it('handles email not found', async () => {
      const req = {
        body: {
          email: 'nonexistent.email@thejitu.com',
          password: 'SomePassword',
        },
      };
  
      const mockedInput = jest.fn().mockReturnThis();
  
      const mockedExecute = jest.fn().mockResolvedValue({
        recordset: [],
      });
  
      const mockedRequest = {
        input: mockedInput,
        execute: mockedExecute,
      };
  
      const mockedPool = {
        request: jest.fn().mockReturnValue(mockedRequest),
      };
  
      jest.spyOn(mssql, 'connect').mockResolvedValue(mockedPool as never);
  
      await loginEmployee(req as Request, res as any);
  
      // Assertions
  
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email not found',
      });
    });
  
    it('handles internal server error', async () => {
      const req = {
        body: {
          email: 'test.test@thejitu.com',
          password: 'SomePassword',
        },
      };
  
      jest.spyOn(mssql, 'connect').mockRejectedValueOnce(new Error('Connection error') as never);

  
      await loginEmployee(req as Request, res as any);
  
      // Assertions
  
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });
  });



  // update employee

  describe('Update Employee', () => {
    let res: any;
  
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });
  
    it('successfully updates an employee', async () => {
      const req = {
        params: {
          id: '7bc912f5-4e2e-49ae-b85e-cf5b96d43d7d', // Provide an existing employee_id for testing
        },
        body: {
          fname: 'UpdatedFirstName',
          lname: 'UpdatedLastName',
          email: 'updated.email@thejitu.com',
          phone_no: '0776543210',
          cohort: '18',
          password: 'NewHashedPassword',
        },
      };
  
      const mockedExecute = jest.fn().mockResolvedValue({
        rowsAffected: [1],
      });
  
      const mockedRequest = {
        input: jest.fn().mockReturnThis(),
        execute: mockedExecute,
      };
  
      const mockedPool = {
        request: jest.fn().mockReturnValue(mockedRequest),
        close: jest.fn(),
      };
  
      jest.spyOn(mssql, 'connect').mockResolvedValue(mockedPool as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('NewHashedPassword' as never);
  
      await updateEmployee(req as unknown as Request, res as any);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Employee updated successfully',
      });
      expect(mockedRequest.input).toHaveBeenCalledWith('employee_id', mssql.VarChar, '7bc912f5-4e2e-49ae-b85e-cf5b96d43d7d');
      // Add more assertions based on the input data and expected behavior of your function
    });
  
    it('handles non-existing employee', async () => {
      const req = {
        params: {
          id: '7bc912f5-4e2e-49ae-b85e-cf5b96d43d', // Provide a non-existing employee_id for testing
        },
        body: {
            fname: 'UpdatedToNonExisting',
            lname: 'LastNameNonExisting',
            email: 'updated.email@thejitu.com',
            phone_no: '0776543210',
            cohort: '18',
            password: 'NewHashedPassword',
          },
      };
  
      const mockedExecute = jest.fn().mockResolvedValue({
        rowsAffected: [0],
      });
  
      const mockedRequest = {
        input: jest.fn().mockReturnThis(),
        execute: mockedExecute,
      };
  
      const mockedPool = {
        request: jest.fn().mockReturnValue(mockedRequest),
        close: jest.fn(),
      };
  
      jest.spyOn(mssql, 'connect').mockResolvedValue(mockedPool as never);
  
      await updateEmployee(req as unknown as Request, res as any);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Employee not found',
      });
    });
  
    it('handles internal server error', async () => {
      const req = {
        params: {
          id: 'bc912f5-4e2e-49ae-b85e-cf5b96d43d7d',
        },
        body: {
            fname: 'UpdatedFirstName',
            lname: 'UpdatedLastName',
            email: 'updated.email@thejitu.com',
            phone_no: '9876543210',
            cohort: '18',
            password: 'NewHashedPassword',
          },
        };
  
      const mockedExecute = jest.fn().mockRejectedValueOnce(new Error('Connection error'));
  
      const mockedRequest = {
        input: jest.fn().mockReturnThis(),
        execute: mockedExecute,
      };
  
      const mockedPool = {
        request: jest.fn().mockReturnValue(mockedRequest),
        close: jest.fn(),
      };
  
      jest.spyOn(mssql, 'connect').mockResolvedValue(mockedPool as never);
  
      await updateEmployee(req as unknown as Request, res as any);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal Server Error. Unable to update employee.',
        details: 'Connection error',
      });
    });
  });