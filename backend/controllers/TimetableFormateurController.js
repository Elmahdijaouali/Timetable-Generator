const {Timetable , Formateur  , Session , Group , Classroom  , Module } = require('./../models')
const {transform } = require('./../helpers/transformers/timetableActiveFormateurTransformer.js')
const index = async (req , res ) => {
 

  try{
   
    const formateurs = await Formateur.findAll({})

    return res.json(formateurs)

  }catch(err){
     console.log(err)
  }
}


const show = async (req , res ) => {
  const { mleFormateur } = req.params
 
  if(!mleFormateur){
     return res.status(422).json({'errors' : 'mle formateur is required!!'})
  }

  try{
    const timetablesGroups = await Timetable.findAll({
        where : {
            status : 'active'
        } , 
        include : [
          { model : Session , 
            required: true,
            include : [
              { model : Formateur , as : 'formateur' ,    required: true, where : { mle_formateur : mleFormateur }} , 
              {model : Group , as : "group" } , 
              {model : Classroom , as : 'classroom'} , 
              {model : Module , as : "module"}
            ]
           }
        ]
    })

    return res.json(transform(timetablesGroups))

  }catch(err){
     console.log(err)
  }
}


module.exports = {index , show}