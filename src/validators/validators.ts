import joi from 'joi'

export const registerUserSchema = joi.object({
        fname: joi.string(),
        lname: joi.string(),
        email : joi.string().email(),
        phone_no: joi.string().min(10),
        password: joi.string(),
        cohort: joi.number().integer().positive().required(),

})

export const loginUserSchema = joi.object({
       email: joi.string().email().required(), 
       password: joi.string().required()
})