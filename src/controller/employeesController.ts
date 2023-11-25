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


              // Validate cohort format (assuming it's a positive integer)
            //  if (!cohort || !Number.isInteger(cohort) || cohort <= 0) {
            //    return res.status(400).json({
            //      error: 'Invalid cohort number. Cohort must be a positive integer.',
            //    });
            //  }

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
        .execute('registerEmployee');


        return res.status(200).json({
            message: 'Member registered successfully'
        })
        
    } catch (error: any) { 
        return res.status(500).json({
            error: error .message || 'Internal Server Error'
        });
    }
}


export const loginEmployee = async(req:Request, res: Response) =>{
  try {
      const {email, password} = req.body

      const {error} = loginUserSchema.validate(req.body)

      if(error){
          return res.status(422).json({error: error.message})
      }

      const pool = await mssql.connect(sqlConfig)

      let user = await (await pool.request().input("email", email).input("password", password).execute('loginEmployee')).recordset

      console.log(user);
      
      
      if(user[0]?.email  == email){
          const CorrectPwd = await bcrypt.compare(password, user[0]?.password)

          if(!CorrectPwd){
              return res.status(401).json({
                  error: "Incorrect password"
              })
          }

          const LoginCredentials = user.map(records =>{
              const {phone_no, id_no, KRA_PIN, password, NSSF_NO, NHIF_NO, welcomed, ...rest}=records

              return rest
          })

          // console.log(LoginCredentials);

          // dotenv.config()
          const token = jwt.sign(LoginCredentials[0], process.env.SECRET as string, {
              expiresIn: '24h'
          }) 

          return res.status(200).json({
              message: "Logged in successfully", token
          })
          
      }else{
          return res.json({
              error: "Email not found"
          })
      }

  } catch (error) {
      return res.json({
          error: "Internal server error"
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

    const employee_id = req.params.id; // Assuming you get the employee ID from the request parameters

    const hashedPwd = password ? await bcrypt.hash(password, 5) : undefined;

    const pool = await mssql.connect(sqlConfig);

       // Check if the employee with the specified employee_id exists
       const checkEmployee = await pool
       .request()
       .input('employee_id', mssql.VarChar, employee_id)
       .query('SELECT TOP 1 1 AS employeeExists FROM Employees WHERE employee_id = @employee_id');
 
     if (!checkEmployee.recordset[0]?.employeeExists) {
       return res.status(404).json({
         error: 'Employee not found',
       });
     }
 

    await pool
      .request()
      .input('employee_id', mssql.VarChar, employee_id)
      .input('fname', mssql.VarChar, fname)
      .input('lname', mssql.VarChar, lname)
      .input('email', mssql.VarChar, email)
      .input('cohort', mssql.VarChar, cohort)
      .input('phone_no', mssql.VarChar, phone_no)
      .input('password', mssql.VarChar, hashedPwd)
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
    if (pool) {
      try {
        await pool.close();
      } catch (closeError: any) {
        console.error('Error closing MSSQL connection:', closeError.message);
      }
    }
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
      if (pool) {
        try {
          await pool.close();
        } catch (closeError: any) {
          console.error('Error closing MSSQL connection:', closeError.message);
        }
      }
    }
  };

  export const getAllEmployees = async(req:Request, res:Response)=>{
    try {

        const pool = await mssql.connect(sqlConfig)

        let employees = (await pool.request().execute('fetchAllEmployees')).recordset
        // let employees = (await pool.request().query('SELECT * FROM Employees')).recordset

        return res.status(200).json({
            employees: employees
        })
        
    } catch (error) {
        return res.json({
            error: error
        })
    }
}



  export const checkUserDetails = async (req:ExtendedEmployee, res:Response)=>{
    
    if(req.info){

        return res.json({
            info: req.info 
        }) 
    }
    
}
  


