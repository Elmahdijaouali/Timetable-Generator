const {Branch} = require('./../models')

const index = async (req  , res ) => {
     try{
       const branches =await Branch.findAll({})

       return res.json(branches)

     }catch(err){
        console.log(err)
     }
}


module.exports = {index }