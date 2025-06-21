const { Group, Branch, GroupModuleFormateur, Module , GroupsNeedChangeTimetable} = require("./../models");
const { transform } = require("./../helpers/transformers/groupTransformer.js");
const {
  transformGroupwithModules,
} = require("./../helpers/transformers/groupWithModulesTransformer.js");


const index = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [{ model: Branch, as: "branch" }],
    });

    const data = groups.map((group) => transform(group));

    return res.json(data);
  } catch (err) {
    console.log(err);
  }
};

// this show one details one groupe with the modules
const show = async (req, res) => {
  const { id } = req.params;
  const group = await Group.findOne({
    where: {
      id: id,
    },
    include: [
      {
        model: GroupModuleFormateur,
        include: [{ model: Module, as: "module" }],
      },
    ],
  });

  const data = transformGroupwithModules(group);
  return res.json(data);
};

// this for update state module for group
const updateStateModule = async (req, res) => {
  const { groupId, moduleId } = req.params;
  const { is_started } = req.body;

  if (!groupId || !moduleId) {
    return res.status(422).json({
      errors: "should by send in request groupId and moduleId and is_started!!",
    });
  }


  try {

    const  groupModuleFormateurs = await GroupModuleFormateur.findAll({ 
      where : { is_started : true ,  groupId: groupId }
    })
    let total = 0 ; 
    groupModuleFormateurs.forEach(item => {
        total += Number(item.nbr_hours_presential_in_week)
    })
  
    if( is_started == true ){
      const groupModuleFormateurWantEditSate = await GroupModuleFormateur.findOne(
        {
          where: {
            groupId: groupId,
            moduleId: moduleId,
          },
        }
      );
  
      total += Number(groupModuleFormateurWantEditSate.nbr_hours_presential_in_week)

      if(total > 35 && groupModuleFormateurWantEditSate.is_started == false ){
        return res.status(422).json({"errors" : "max hours presentail in week is 35 !!"})
      }
    }

    const groupModuleFormateur =await GroupModuleFormateur.update(
      { is_started: is_started },
      {
        where: {
          groupId: groupId,
          moduleId: moduleId,
        },
      }
    );

   
    await GroupsNeedChangeTimetable.upsert({
      groupId : groupId
    })

  } catch (err) {
    console.log(err);
    return res.status(422).json({"errors" : 'Error'+err })
  }

  return res.json({ message: "seccès modifer state module en groupe" });
};


// update nbr hours presential in module for group
const updateNbrHoursPresentailInWeek = async (req, res) => {
  const { groupId, moduleId } = req.params;
  const { nbr_hours_presential_in_week } = req.body;

  if (!nbr_hours_presential_in_week) {
    return res.status(422).json({
      errors:
        "should by send in request groupId and moduleId and nbr_hours_presential_in_week!!",
    });
  }
  try {
    
    const groupModuleFormateur = await GroupModuleFormateur.update(
      { nbr_hours_presential_in_week: nbr_hours_presential_in_week },
      {
        where: {
          groupId: groupId,
          moduleId: moduleId,
        },
      }
    );

    await GroupsNeedChangeTimetable.upsert({
      groupId : groupId
    })

  } catch (err) {
    console.log(err);
  }

  return res.json({
    message: "seccès modifer nbr_hours_presential_in_week module en groupe",
  });
};



module.exports = {
  index,
  show,
  updateStateModule,
  updateNbrHoursPresentailInWeek,
};
