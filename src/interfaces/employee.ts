import { Request } from "express";

export interface Employee{
    fname:string,
    lname:string,
    email: string,
    employee_id: string,
   
}

export interface LoginEmployee extends Request{
    email: string,
    password: string
}