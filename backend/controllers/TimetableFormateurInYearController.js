const { FormateurTimetable, Formateur } = require("./../models");
const {transform} = require('./../helpers/transformers/timetableFormateursTransformer.js');
const {transformFormateur } = require('./../helpers/transformers/timetableFormateurTransformer.js');

const index = async (req, res) => {
  const formateurs = await Formateur.findAll({
    include: [{ model: FormateurTimetable }],
  });
  
  const data = formateurs.map(formateur => transform(formateur))
   if(data[0].nbr_hours_in_week  == -1 ){
     return res.status(422).json({"errors" : 'repeat generate les emplois du temps des formateurs en année !'})
   }
   
  return res.json(data);
};


const show =async (req , res ) => {
     const { mle_formateur } = req.params 

     if(!mle_formateur){
        return res.status(422).json({"errors" : "mle_formateur required for get emploi du temps de formateur en année!"})
     }

     const formateur = await Formateur.findOne({
       where : {
          mle_formateur : mle_formateur
       }, 
       include : [
        { model : FormateurTimetable }
       ]
     })

     const data = transformFormateur(formateur)

     return res.json(data)
}

module.exports = { index , show };
