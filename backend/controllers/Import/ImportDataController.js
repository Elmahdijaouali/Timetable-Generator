const XLSX = require("xlsx");
const multer = require("multer");
const {
  Branch,
  Formateur,
  Group,
  Module,
  Classroom,
  GroupModuleFormateur,
  GroupMerge,
  Merge,
  ModuleRemoteSession,
} = require("../../models");

const importData = async (req, res) => {
  if (!req.file) {
    return res.json({ errors: "file excel is required  !" });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    if (
      !rows[0]["Code Filière"] &&
      !rows[0]["Groupe"] &&
      !rows[0]["Code Module"] &&
      !rows[0]["Module"]
    ) {
      return res.status(422).json({ errors: "choice crrect file !" });
    }

    // return res.json(rows[0])

    // insert classroom unknown for handle adminisrtor try import info formateur before classroom

    //  await Classroom.upsert({
    //      label: "Teams",
    //      is_available: true,
    //    } );
    await Classroom.upsert({
      label: "UnKnown",
      is_available: true,
    });
    const classroomDefault = await Classroom.findOne({
      where: { label: "UnKnown" },
    });
    //  const classroomRemote = await Classroom.findOne({ where : { label : "Teams"}})

    // data_json.forEach(async (row) => {

    for (let row of rows) {
     
      // =================== insert the branches =================
      await Branch.upsert({
        code_branch: row["Code Filière"],
        label: row["filière"],
      });

      // =================== insert the merge =================
      let merge = null;
      if (row["FusionGroupe"]) {
        await Merge.upsert({
          groups: row["FusionGroupe"],
        });

        merge = await Merge.findOne({
          where: { groups: row["FusionGroupe"] },
        });
      }

      // =================== insert the groups =================
      const branch = await Branch.findOne({
        where: { code_branch: row["Code Filière"] },
      });

      await Group.upsert({
        code_group: row["Groupe"],
        effective: row["Effectif Groupe"],
        year_of_formation: row["Année de formation"],
        branchId: branch.id,
        niveau :  row["Niveau"]
      });

      const group = await Group.findOne({
        where: { code_group: row["Groupe"] },
      });

      // =================== insert the groupmerge =================
      if (merge && group) {
        await merge.addGroup(group.id);
        // await GroupMerge.upsert({
        //   groupId : group.id ,
        //   mergeId : merge.id
        // })
      }

      // =================== insert the modules =================
      //   await Module.findOrCreate({
      //     code_module: row["Code Module"],
      //     label: row["Module"],
      //     is_regionnal: row["Régional"] == "O" ? true : false,
      //     mhp_s1: row["MHP S1 DRIF"],
      //     mhsyn_s1: row["MHSYN S1 DRIF"],
      //     mhp_s2: row["MHP S2 DRIF"],
      //     mhsyn_s2: row["MHSYN S2 DRIF"],

      //   },

      // );

      await Module.findOrCreate({
        where: {
          code_module: row["Code Module"],
          label: row["Module"],
        },
        defaults: {
          is_regionnal: row["Régional"] === "O",
          mhp_s1: row["MHP S1 DRIF"],
          mhsyn_s1: row["MHSYN S1 DRIF"],
          mhp_s2: row["MHP S2 DRIF"],
          mhsyn_s2: row["MHSYN S2 DRIF"],
          color : getRandomColor()
        },
      });

      // =================== insert the branchmodule =================
      let module;
      module = await Module.findOne({
        where: { code_module: row["Code Module"], label: row["Module"] },
      });

      await branch.addModule(module.id);

      //===================== insert the formateur ===================

      if (row["Mle Affecté Présentiel Actif"]) {
        const formateur = await Formateur.findOne({
          where: { mle_formateur: row["Mle Affecté Présentiel Actif"] },
        });
        await Formateur.upsert({
          mle_formateur: row["Mle Affecté Présentiel Actif"],
          name: row["Formateur Affecté Présentiel Actif"],
          is_available: true,
          classroomId: formateur ? formateur.classroomId : classroomDefault.id,
        });
      }

      if (row["Mle Affecté Syn Actif"]) {
        const formateur = await Formateur.findOne({
          where: { mle_formateur: row["Mle Affecté Syn Actif"] },
        });
        await Formateur.upsert({
          mle_formateur: row["Mle Affecté Syn Actif"],
          name: row["Formateur Affecté Syn Actif"],
          is_available: true,
          classroomId: formateur ? formateur.classroomId : classroomDefault.id,
        });
      }

      //===================== insert the GroupModuleFormateur ===================
      let formateur_syn, formateur_presential;
      if (row["Mle Affecté Présentiel Actif"] && row["Mle Affecté Syn Actif"]) {
        formateur_presential = await Formateur.findOne({
          where: { mle_formateur: row["Mle Affecté Présentiel Actif"] },
        });
        formateur_syn = await Formateur.findOne({
          where: { mle_formateur: row["Mle Affecté Syn Actif"] },
        });
        const group = await Group.findOne({
          where: { code_group: row["Groupe"] },
        });

        if (
          formateur_presential != null &&
          formateur_syn != null &&
          group != null
        ) {
          if (formateur_presential.id == formateur_syn.id) {
            await GroupModuleFormateur.findOrCreate({
                where:{
                  formateurId: formateur_presential.id,
                  moduleId: module.id,
                  groupId: group.id,
                },
                defaults : {
                  formateurId: formateur_presential.id,
                  moduleId: module.id,
                  groupId: group.id,
                  mhp_realise: row["MH Réalisée Présentiel"],
                  mhsyn_realise: row["MH Réalisée Sync"],
                  nbr_hours_presential_in_week:
                    getNumberHoursModulePresentailInWeek(module),
                  nbr_hours_remote_in_week:
                    getNumberHoursModuleRemoteInWeek(module),
                  is_started: checkModuleWithGroupIsStarted(module),
                  nbr_cc: row["NB CC"],
                  validate_efm: row["Validation EFM"] == "oui" ? true : false,
                }
  
            });
          } else {
            await GroupModuleFormateur.findOrCreate({
              where:{
                formateurId: formateur_presential.id,
                moduleId: module.id,
                groupId: group.id,
              },
              defaults : {
                formateurId: formateur_presential.id,
                moduleId: module.id,
                groupId: group.id,
                mhp_realise: row["MH Réalisée Présentiel"],
                mhsyn_realise: row["MH Réalisée Sync"],
                nbr_hours_presential_in_week:
                  getNumberHoursModulePresentailInWeek(module),
                nbr_hours_remote_in_week:
                  getNumberHoursModuleRemoteInWeek(module),
                is_started: checkModuleWithGroupIsStarted(module),
                nbr_cc: row["NB CC"],
                validate_efm: row["Validation EFM"] == "oui" ? true : false,
              }
            
            });

            await GroupModuleFormateur.findOrCreate({
              where:{
                formateurId: formateur_presential.id,
                moduleId: module.id,
                groupId: group.id,
              },
              defaults : {
                formateurId: formateur_syn.id,
                moduleId: module.id,
                groupId: group.id,
                mhp_realise: row["MH Réalisée Présentiel"],
                mhsyn_realise: row["MH Réalisée Sync"],
                nbr_hours_presential_in_week:
                  getNumberHoursModulePresentailInWeek(module),
                nbr_hours_remote_in_week:
                  getNumberHoursModuleRemoteInWeek(module),
                is_started: checkModuleWithGroupIsStarted(module),
                nbr_cc: row["NB CC"],
                validate_efm: row["Validation EFM"] == "oui" ? true : false,
              }
             
            });
          }
        }
      }

      // =================== insert the moduleremotesession =================
      module = await Module.findOne({
        where: { code_module: row["Code Module"], label: row["Module"] },
      });

      formateur_syn = await Formateur.findOne({
        where: { mle_formateur: row["Mle Affecté Syn Actif"] },
      });

      if (formateur_syn && module && merge) {
        await ModuleRemoteSession.upsert(
          {
            formateurId: formateur_syn.id,
            moduleId: module.id,
            mergeId: merge.id,
            nbr_hours_remote_session_in_week:
              getNumberHoursModuleRemoteInWeek(module),
            is_started: checkModuleIsStartedRemoteSessionWithMergeGroup(module),
          },
          {
            conflictFields: ["mergeId", "moduleId", "formateurId"],
          }
        );
      }
    }

    // );
  } catch (err) {
    console.log("Error file not read :", err);
    return res.status(422).json({ errors: " file not read " });
  }

  return res.json({ message: "sucess importation " });
};




const getNumberHoursModulePresentailInWeek = (module) => {
  const totalHoursInModulePresentail = module.mhp_s1 + module.mhp_s2;

  if (totalHoursInModulePresentail <= 30) {
    return 2.5;
  } else if (totalHoursInModulePresentail <= 90) {
    return 10;
  } else {
    return 15;
  }
};

const getNumberHoursModuleRemoteInWeek = (module) => {
  const totalHoursInModuleRemote = module.mhsyn_s1 + module.mhsyn_s2;
  if (totalHoursInModuleRemote > 10) {
    return 5;
  } else if (totalHoursInModuleRemote <= 10 && totalHoursInModuleRemote != 0) {
    return 2.5;
  }

  return 0;
};

const checkModuleWithGroupIsStarted = (module) => {
  if (
    module.mhp_realise + module.mhsyn_realise > 0 &&
    module.mhp_realise + module.mhsyn_realise !=
      module.mhp_s1 + module.mhp_s2 + module.mhsyn_s1 + module.mhsyn_s2 &&
    module.validate_efm == false
  ) {
    return true;
  }
  return false;
};

const checkModuleIsStartedRemoteSessionWithMergeGroup = (module) => {
  if (
    module.mhsyn_realise > 0 &&
    module.mhsyn_realise != module.mhsyn_s1 + module.mhsyn_s2 &&
    module.validate_efm == false
  ) {
    return true;
  }
  return false;
};


const getRandomColor = () => {
   const str = '123456789ABCDEF'
   let color = '#'
   for(let i = 0 ; i < 6 ; i++ ){
      color += str[Math.floor(Math.random() * str.length )]
   }

   return color
}

module.exports = { importData };
