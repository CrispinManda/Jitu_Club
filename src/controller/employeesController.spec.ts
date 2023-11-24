import mssql from 'mssql'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {v4} from 'uuid'
import {  registerEmployee } from './employeesController'
import { Request, Response } from 'express'

describe ("Member Registration", ()=>{
 
    let res:any;

    beforeEach(()=>{
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    })

    it("successfully registers an member", async()=>{
        const req = {
            body: {
                fname: "Test ", 
                lname: "Test" ,
                email:"test.test@thejitu.com", 
                phone_no: "07857646576", 
                password: "HashedPass@word123"
            }
        }

  

        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce("HashedPass@word123" as never)

        const mockedInput = jest.fn().mockReturnThis() 

        const mockedExecute = jest.fn().mockResolvedValue({rowsAffected: [1]})

        const mockedRequest = {
            input: mockedInput,
            execute: mockedExecute
        }

        const mockedPool = { 
            request: jest.fn().mockReturnValue(mockedRequest)
        }



        jest.spyOn(mssql, 'connect').mockResolvedValue(mockedPool as never)

        await registerEmployee(req as Request, res as any)

        // Assertions

        expect(res.json).toHaveBeenCalledWith({message: 'Member registered successfully'})
        expect(res.status).toHaveBeenCalledWith(200)
        expect(mockedInput).toHaveBeenCalledWith('password',  mssql.VarChar, 'HashedPass@word123')
        expect(mockedInput).toHaveBeenCalledWith('fname',  mssql.VarChar, 'Test ')
        expect(mockedInput).toHaveBeenCalledWith('lname',  mssql.VarChar, 'Test ')
        expect(mockedInput).toHaveBeenCalledWith('email',  mssql.VarChar, 'test.test@thejitu.com')
        expect(mockedInput).toHaveBeenCalledWith('phone_no',  mssql.Int, '0723344889')
    })

})


