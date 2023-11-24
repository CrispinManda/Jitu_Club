import { Request, Response } from 'express'
import mssql, { pool } from 'mssql'
import {v4} from 'uuid'
import bcrypt from 'bcrypt'
import { sqlConfig } from '../config/sqlConfig'
import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
//import { LoginEmployee } from '../interfaces/employee'
import { ExtendedEmployee } from '../middleware/verifyToken'
import Connection from '../dbhelpers/dbhelpers'
import { loginUserSchema, registerUserSchema } from '../validators/validators'
import { isEmpty } from 'lodash'
import { any } from 'joi'

const dbhelper = new Connection 
 
export const registerEmployee = async(req:Request, res: Response) =>{
    try {
        let { 
             fname,
             lname,
             email, 
             phone_no, 
             cohort,
             password } = req.body;

             if (!/^[\w-]+(\.[\w-]+)*@thejitu\.com$/.test(email)) {
                return res.status(400).json({
                  error: 'Invalid email format. Email must be in the format: fname.lname@thejitu.com',
                });
              }

        let employee_id = v4()

        const hashedPwd = await bcrypt.hash(password, 5)

        const pool = await mssql.connect(sqlConfig)

        console.log("here");
        
        let result = await pool.request()

        .input("employee_id", mssql.VarChar, employee_id) 
        .input("fname", mssql.VarChar, fname)
        .input("lname", mssql.VarChar, lname)
        .input("email", mssql.VarChar, email)
        .input("cohort", mssql.VarChar, cohort)
        .input("phone_no", mssql.VarChar, phone_no)
        .input("password", mssql.VarChar, hashedPwd)
        .execute('registerEmployee')


        return res.status(200).json({
            message: 'Member registered successfully'
        })
        
    } catch (error) { 
        return res.json({
            error: error
        })
    }
}


export const getOneEmployees = async(req:Request, res:Response)=>{
    try {

        let id = req.params.id 

        const pool = await mssql.connect(sqlConfig)

        let employee = (await pool.request().input('employee_id',id).execute('fetchOneEmployee')).recordset
        // let employees = (await pool.request().query('SELECT * FROM Employees')).recordset

        return res.status(200).json({
            employee: employee
        })
        
    } catch (error) {
        return res.json({
            error: error
        })
    }
}

export const updateEmployee = async (req: Request, res: Response) => {
    try {
      const {
        fname,
        lname,
        email,
        phone_no,
        cohort,
        password,
      } = req.body;
  
      const employee_id = req.params.id; 
  
      const hashedPwd = password ? await bcrypt.hash(password, 5) : undefined;
  
      const pool = await mssql.connect(sqlConfig);
  
      await pool
        .request()
        .input("employee_id", mssql.VarChar, employee_id)
        .input("fname", mssql.VarChar, fname)
        .input("lname", mssql.VarChar, lname)
        .input("email", mssql.VarChar, email)
        .input("cohort", mssql.VarChar, cohort)
        .input("phone_no", mssql.VarChar, phone_no)
        .input("password", mssql.VarChar, hashedPwd)
        .execute('updateEmployee');
  
      return res.status(200).json({
        message: 'Employee updated successfully',
      });
  
    } catch (error: any) {
      return res.status(500).json({
        error: 'Internal Server Error. Unable to update employee.',
        details: error.message,
      });
  
    } finally {
      await pool.close();
    }
  };
  


  export const deleteEmployee = async (req: Request, res: Response) => {
    try {
      const employee_id = req.params.id; // Assuming you get the employee ID from the request parameters
  
      const pool = await mssql.connect(sqlConfig);
  
      await pool
        .request()
        .input("employee_id", mssql.VarChar, employee_id)
        .execute('deleteEmployee');
  
      return res.status(200).json({
        message: 'Employee deleted successfully',
      });
  
    } catch (error: any) {
      return res.status(500).json({
        error: 'Internal Server Error. Unable to delete employee.',
        details: error.message,
      });
  
    } finally {
      await pool.close();
    }
  };
  
  

