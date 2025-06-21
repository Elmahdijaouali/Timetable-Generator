const {Traning , Group } = require('./../models')

const index = async (req , res) => {
    try{
      const groupsEnStage = await Traning.findAll({
        include : [
            {model : Group , as : 'group' }
        ]
      }) 

      return res.json(groupsEnStage)

    }catch(err){
        console.log(err)
        return res.status(400).json({"errors" : 'Error ' + err})
    }
}

const store = async (req , res ) => {
    const { groupId , date_start , date_fin } = req.body 

    if(!groupId || !date_start || !date_fin){
       return res.status(422).json({"errors" : "the fields groupId , date_start and date_fin is required !!"})
    }

    if( new Date(date_start) >= new Date(date_fin)  || new Date(date_start)  < new Date() || new Date(date_fin)  < new Date() ){
        return res.status(422).json({"errors" : "problem in date start or date fin check dates is valid !!"})
    }
    try{
      await Traning.create({
          groupId : groupId , 
          date_start : date_start , 
          date_fin : date_fin
      })

      return res.json({"message" : "seccès ajouter groupe en satge "})
    }catch(err){
        console.log(err)
        return res.status(400).json({"errors" : 'Error '+err})
    }
}
module.exports = { index , store }