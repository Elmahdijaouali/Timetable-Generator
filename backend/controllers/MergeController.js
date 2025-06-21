const { Merge, ModuleRemoteSession, Module  , Group , GroupsNeedChangeTimetable } = require("./../models");
const {
  transform,
} = require("./../helpers/transformers/mergeWithModulesRemoteSessionWithoutFilterTransformer.js");

const index = async (req, res) => {
  try {
    const merges = await Merge.findAll({});

    return res.json(merges);
  } catch (err) {
    console.log(err);
  }
};

// this show details merge with modules 
const show = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(422)
      .json({ errors: "should be send id merge in params!!" });
  }
  try {
    const merge = await Merge.findOne({
      where: {
        id,
      },
      include: [{ model: ModuleRemoteSession, include: [{ model: Module }] }],
    });

    return res.json(transform(merge));
  } catch (err) {
    console.log(err);
  }
};

// this for update state
const updateStateModule = async (req, res) => {
  const { mergeId, moduleId } = req.params;
  const { is_started } = req.body;

  if (!mergeId || !moduleId) {
    return res.status(422).json({
      errors: "should by send in request mergeId and moduleId and is_started!!",
    });
  }

  try {
    const  moduleRemoteSessions = await ModuleRemoteSession.findAll({ 
      where : { is_started : true ,  mergeId: mergeId }
    })
    let total = 0 ; 
    moduleRemoteSessions.forEach(item => {
        total += Number(item.nbr_hours_remote_session_in_week)
    })
  
    if( is_started == true ){
      const moduleRemoteSessionWantEditSate = await ModuleRemoteSession.findOne(
        {
          where: {
            mergeId: mergeId,
            moduleId: moduleId,
          },
        }
      );
  
      total += Number(moduleRemoteSessionWantEditSate.nbr_hours_remote_session_in_week)

      if(total > 10 && moduleRemoteSessionWantEditSate.is_started == false ){
        return res.status(422).json({"errors" : "max hours à distance in week is 10 !!"})
      }

    }
 
     await ModuleRemoteSession.update(
      { is_started: is_started },
      {
        where: {
          mergeId: mergeId,
          moduleId: moduleId,
        },
      }
    );

    const moduleRemoteSession =await ModuleRemoteSession.findOne({
      where:{
        mergeId: mergeId,
          moduleId: moduleId,
      }
    })

   const merge =  await Merge.findOne({
      where : {
        id : mergeId
      } , 
      include : [
        { model : Group }
      ]
    } )

    for(let group of merge.Groups ){
      await GroupsNeedChangeTimetable.upsert({
        groupId : group.id
      })
    }

    return res.json({ message: "seccès modifer state module en merge" ,moduleRemoteSession  });
  } catch (err) {
    console.log(err);
  }
};


// update nbr hours remote in module for merge
const updateNbrHoursRemoteInWeek = async (req, res) => {
  const { mergeId, moduleId } = req.params;
  const { nbr_hours_remote_session_in_week } = req.body;

  if (
    !nbr_hours_remote_session_in_week ||
    isNaN(nbr_hours_remote_session_in_week)
  ) {
    return res.status(422).json({
      errors:
        "should by send in request mergeId and moduleId and nbr_hours_remote_in_week!!",
    });
  }

  try {
    const moduleRemoteSession = await ModuleRemoteSession.update(
      { nbr_hours_remote_session_in_week: nbr_hours_remote_session_in_week },
      {
        where: {
          mergeId: mergeId,
          moduleId: moduleId,
        },
      }
    );


    const groups=  await Merge.findOne({
      where : {
        id : mergeId
      } , 
      include : [
        { model : Group }
      ]
    } )

    for(let group of groups ){
      await GroupsNeedChangeTimetable.upsert({
        groupId : group.id
      })
    }


  } catch (err) {
    console.log(err);
  }

  return res.json({
    message: "seccès modifer nbr_hours_remote_in_week module en merge",
  });
};

module.exports = { index, show, updateStateModule, updateNbrHoursRemoteInWeek };
