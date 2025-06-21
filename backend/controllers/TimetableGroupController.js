const {Timetable , Group , Branch , Session , Classroom ,Formateur  , Module } = require('./../models')
const {transform } = require('./../helpers/transformers/timetableGroupsTransformer.js')
const {transformTimetableGroup} = require('./../helpers/transformers/timetableGroupTransformer.js')


const index = async (req , res ) => {
  try{
    const timetablesActive = await Timetable.findAll({
        where : {
          status : "active"
        },
        include : [
          { model : Group , as : 'group' , 
            include : [
                {model : Branch , as : "branch"}
            ]
          }
        ]
     })
     
     const data = timetablesActive.map(timetable => transform(timetable))
     return res.json(data)
    // return res.json(timetablesActive)

  }catch(err){
    console.log(err)
    res.json(err)
  }
}


const show = async (req , res ) => {
   const {id } = req.params 

   if(!id){
      return res.status(422).json({"errors" : 'not have this timetable for this id !!'})
   }
   try{
     const timetable =await Timetable.findOne({
        where : {
            id :id
        },
        include : [
            { model : Group , as : 'group' , 
                include : [
                    {model : Branch , as : "branch"}
                ]
              },
            { 
                model: Session , 
                include : [
                    {model : Formateur , as : 'formateur' } , 
                    {model : Classroom , as : "classroom" } ,
                    {model : Module , as : "module" }
                ]
            }
        ]
     })

     return res.json(transformTimetableGroup(timetable))

   }catch(err){
      console.log(err)
   }
}


module.exports = {index , show }