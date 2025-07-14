const { Group, Branch, GroupModuleFormateur, Module , GroupsNeedChangeTimetable, Setting} = require("./../models");
const { transform } = require("./../helpers/transformers/groupTransformer.js");
const {
  transformGroupwithModules,
} = require("./../helpers/transformers/groupWithModulesTransformer.js");
const FormateurAvailabilityValidator = require("../services/formateurAvailabilityValidator.js");


const index = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [{ model: Branch, as: "branch" }],
    });

    const data = groups.map((group) => transform(group));

    return res.json(data);
  } catch (err) {
    // Removed console.log statements for production
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
    // Only update is_started, no strict validation here
    const groupModuleFormateur = await GroupModuleFormateur.update(
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
    });

    return res.json({ 
      message: "seccès modifer state module en groupe"
    });

  } catch (err) {
    // Removed console.log statements for production
    return res.status(422).json({"errors" : 'Error'+err });
  }
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
    // Get the current GroupModuleFormateur record to get formateurId and current hours
    const currentRecord = await GroupModuleFormateur.findOne({
      where: {
        groupId: groupId,
        moduleId: moduleId,
      },
    });

    if (!currentRecord) {
      return res.status(404).json({
        errors: "GroupModuleFormateur record not found",
      });
    }

    const currentHours = Number(currentRecord.nbr_hours_presential_in_week) || 0;
    const requestedHours = Number(nbr_hours_presential_in_week);

    // Validate formateur availability before updating
    const validationResult = await FormateurAvailabilityValidator.validateFormateurAvailability(
      currentRecord.formateurId,
      groupId,
      moduleId,
      requestedHours,
      'presential',
      currentHours
    );

    if (!validationResult.isValid) {
      return res.status(422).json({
        errors: validationResult.message,
        details: validationResult.details
      });
    }

    // If validation passes, update the record
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
    });

    return res.json({
      message: "seccès modifer nbr_hours_presential_in_week module en groupe",
      validation: validationResult
    });

  } catch (err) {
    // Removed console.log statements for production
    return res.status(500).json({
      errors: "Internal server error",
      details: err.message
    });
  }
};



module.exports = {
  index,
  show,
  updateStateModule,
  updateNbrHoursPresentailInWeek,
};
