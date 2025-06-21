const {Administrator} = require('../../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ;

/*================ login ====================*/ 
const Login =async (req , res ) => {
    const {email , password } = req.body 
    
    if(!email || !password ) {
       return res.status(422).json({'errors' : "the fields email , password is required!"})
    } 

    const administrator =await Administrator.findOne({where : { "email" : email}})
    
    if(!administrator){
      return res.status(422).json({"errors" : 'email not match any Administrator!'})
    }

    const isPasswordValid = bcrypt.compare(password , administrator.password )
    
    if(!isPasswordValid){
       res.json({'errors' : "password not correct!" })
    }

    const token = jwt.sign({
         id : administrator.id ,
         email : administrator.email
        } , 
        ACCESS_TOKEN_SECRET
    )
    const administratorInfo = {
      id : administrator.id , 
      name : administrator.name , 
      email : administrator.email
   }
    
    res.json({"message" : ' login Administrator seccussfuly !' , "token" : token   , "administrator" : administratorInfo })
    
}

/*================ register ====================*/ 
const Register =async (req , res ) => {
    const {name , email , password , passwordConfirmation } = req.body 

    if(!name || !email || !password || !passwordConfirmation ) {
       return res.status(422).json({'errors' : "the fields name , email and password , passwordConfirmation is required!"})
    } 

    if(passwordConfirmation != password){
       return res.status(422).json({ "errors" : "should be password same password confiremation !"})
    }
   
    const exestingAdministrator =await Administrator.findOne({where : { email}})
    
    if(exestingAdministrator){
     return res.status(422).json({"errors" : 'email already use !'})
    }
    
   const hashPassword =await bcrypt.hash(password , 10)

   const administrator = await  Administrator.create({
        name : name , 
        email : email , 
        password : hashPassword
    })

    const token = jwt.sign({
        id : administrator.id ,
        email : administrator.email
       } , 
       ACCESS_TOKEN_SECRET
   )

   const administratorInfo = {
      id : administrator.id , 
      name : administrator.name , 
      email : administrator.email
   }
   
   res.json({"message" : 'register Administrator successfuly !' , "token" : token , "administrator" : administratorInfo })
   
}

const Logout = (req , res) => {
     const token = req.headers('Autherization').replace("Bearer " , "")

}

module.exports = {Login , Register}

