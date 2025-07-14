const { Administrator } = require('./../../models')
const bcrypt = require('bcryptjs')

const updateInfo = async (req , res ) => {
    const { id , name , email } = req.body 

    if(!id || !name || !email){
       return res.json({ "errors" : 'name and email is required!'})
    }
    
    try{
       const administrator = await Administrator.update(
        {
            name : name , 
            email : email 
        } , {
        where : {
            id : id , 
        } 
       } )
        
        const administratorInfo = {
             id : id , 
             name : name , 
             email : email
        }

        return res.json({ "administrator" : administratorInfo })

    }catch(err){
       console.log(err)
       return res.status(400).json({ 'errors' : 'Error ' + err })
    }
}

const updatePassword = async (req , res ) => {
    const  {email ,  password ,  newPassword , confiremationPassword } = req.body 
    if(!email || !password || !newPassword || !confiremationPassword ){
        return res.status(422).json({ "errors" : 'the fields password , newPassword and confiremationPassword is required!'}) 
    }

    try{
        console.log('log' , password)

       if( newPassword != confiremationPassword ){
           return res.status(400).json({ "errors" : 'should be new password same confiremation password!'})
       }
  
       const administrator = await Administrator.findOne({where : { "email" : email}})  
      console.log('log 2 ' , administrator?.password )  

       const isPasswordValid =await bcrypt.compare( password , administrator.password )
    
       if(!isPasswordValid){
            return res.status(400).json({'errors' : "password not correct!" })
        }
   
        const hashPassword =await bcrypt.hash(password , 10 )
        
        console.log('password : ' , hashPassword )
        await Administrator.update(
        {
            password: hashPassword 
        } , {
        where : {
            email : email , 
        } 
       } )

        
        return res.json({ "message" : "succès modifier password " })

     }catch(err){
       console.log(err)
       return res.status(400).json({ 'errors' : 'Error ' + err })
     }
}


const deleteAccount = async (req , res ) => {
   const { email } = req.params 
   
   try{
    if(!email){
        return res.status(422).json({ "errors" : 'email is required !'})
    }

    await Administrator.destroy({
         where : {
             email : email  
         }
    })

    res.json({ "message" : 'successfuly deleted account !'})

   }catch(err){
     console.log(err)

   }
}

// Count administrators
const countAdministrators = async (req, res) => {
  try {
    const count = await Administrator.count();
    res.json({ count });
  } catch (error) {
    console.error('Error counting administrators:', error);
    res.status(500).json({ error: 'Failed to count administrators' });
  }
};

module.exports = { updateInfo , updatePassword , deleteAccount , countAdministrators };