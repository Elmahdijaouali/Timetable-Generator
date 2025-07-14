const {Branch} = require('./../models')

const index = async (req  , res ) => {
     try{
       const branches =await Branch.findAll({})

       return res.json(branches)

     }catch(err){
        // Removed console.log statements for production
     }
}


module.exports = {index }