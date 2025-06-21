const { Classroom, Formateur } = require("./../models");
const {
  transform,
} = require("./../helpers/transformers/classroomTransformer.js");

const index = async (req, res) => {
  const classrooms = await Classroom.findAll({
    include: [{ model: Formateur, as: "formateurs" }],
  });

  const data = classrooms
    .filter((classroom) => classroom.label != "UnKnown")
    .map((classroom) => transform(classroom));
  return res.json(data);
};

const addClassroom = async (req , res ) => {
  const {label , formateur1 ,  formateur2} = req.body

  if(!label || !formateur1 || !formateur2){
      return res.status(422).json({ "errors" : 'the fields label , formateur1 and formateur2 is required !!'})
  }
   try{
   const classroom =   await Classroom.create({
       label : label , 
       is_available : true 
    })

    await Formateur.update({
      classroomId : classroom.id 
    } , {
      where : {
        id : formateur1
      }
    })

    await Formateur.update({
      classroomId : classroom.id 
    } , {
      where : {
        id : formateur2
      }
    })
    

    return res.json({"message" : 'seccès created classroom '})


   }catch(err){
    console;log(err)
    return res.status(400).json({"errors" : 'Error ' + err})
   }
}

const classroomsDisponible = async (req , res) => {
  try{
     const classrooms = await Classroom.findAll({
      where : {
        is_available : true
      }
     })

     return res.json(classrooms)
  }catch(err){
    console;log(err)
    return res.status(400).json({"errors" : 'Error ' + err})
  }
}


const classroomsNonDisponible = async (req , res) => {
  try{
     const classrooms = await Classroom.findAll({
      where : {
        is_available : false
      }
     })

     return res.json(classrooms)
  }catch(err){
    console;log(err)
    return res.status(400).json({"errors" : 'Error ' + err})
  }
}

const updateAvailableClassroom = async (req , res) => {
   const { classroomId } = req.params 
   const {is_available } = req.body

   if(!classroomId){
      return res.status(422).json({"errors" : 'Error classroomId is required !!'})
   }
   try{
      await Classroom.update({
        is_available : is_available 
      } , {
        where : {
          id : classroomId
        }
      })

      return res.json({"message" : 'seccès update available classroom'})

   }catch(err){
      console.log(err)
      return res.json({'errors' : 'Error '+err})
   }
}


module.exports = { index , addClassroom , classroomsNonDisponible , updateAvailableClassroom , classroomsDisponible };
