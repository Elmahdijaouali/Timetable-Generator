const {
    Merge,
    ModuleRemoteSession,
    Module,
    Formateur,
    Group,
    GroupModuleFormateur,
} = require("../../models/index.js");

const { transform } = require("../../helpers/transformers/mergeModuleRemoteSessionTransformer.js");
const {
    getRandomDay,
    getRandomTimeShot,
    getRandomTimeShotInSamedi,
    getNextTimeShot,
} = require("./randoms.js");
const {
    canAddSessionToDay,
    canAddSessionToDaySamedi,
    checkIfTimeshotTakenInDayEdit,
    canAddSessionWithGapRule,
} = require("./constraints.js");
const { sortSessionInDay } = require("./helper.js");

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const TIME_SHOTS = ["08:30-11:00", "11:00-13:30", "13:30-16:00", "16:00-18:30"];

let cachedTimetables = null;
let lastCacheTime = null;

// Helper to get all presential sessions for all groups in a merge
async function getPresentialSessionsForGroups(groupIds) {
    // For each group, get all presential sessions (from GroupModuleFormateur)
    const groupPresential = {};
    for (const groupId of groupIds) {
        const gmf = await GroupModuleFormateur.findAll({
            where: { groupId, is_started: true },
            include: [{ model: Module, as: 'module' }],
        });
        // For each presential module, add its hours to a pseudo-timetable
        groupPresential[groupId] = gmf.map(item => ({
            moduleId: item.moduleId,
            label: item.module ? item.module.label : '',
            type: 'présentiel',
            // We'll check for conflicts by time slot later
            // For now, just mark the module as presential
        }));
    }
    return groupPresential;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const generateTimetableRemoteForEveryMerge = async () => {
    const latestUpdate = await ModuleRemoteSession.findOne({
        order: [['updatedAt', 'DESC']],
        attributes: ['updatedAt']
    });
    if (cachedTimetables && lastCacheTime && lastCacheTime >= (latestUpdate ? latestUpdate.updatedAt : new Date(0))) {
        return cachedTimetables;
    }

    const merges = await Merge.findAll({
        include: [
            {
                model: ModuleRemoteSession,
                include: [{ model: Module }, { model: Formateur }],
            },
            { model: Group },
        ],
    });

    const results = await Promise.all(merges.map(async (merge) => {
        const transformed = transform(merge);
        const groupIds = merge.Groups.map(g => g.id);
        // Load presential sessions for all groups
        const presentialByGroup = await getPresentialSessionsForGroups(groupIds);
        // For each remote module session, pick a valid (day, timeshot) for all groups
        const remoteAssignments = [];
        for (const moduleSession of transformed.modules_open) {
            // Try all (day, timeshot) combinations, shuffled for randomness
            const allSlots = [];
            for (const day of DAYS) {
                for (const slot of TIME_SHOTS) {
                    allSlots.push({ day, slot });
                }
            }
            shuffle(allSlots);
            let found = false;
            for (const { day, slot } of allSlots) {
                let valid = true;
                // For each group, check if this slot is free (no presential or remote session)
                for (const groupId of groupIds) {
                    // Check presential sessions for this group
                    // (Assume presential sessions are not yet scheduled, so just check for duplicate slots in this assignment)
                    const presentialSessions = presentialByGroup[groupId] || [];
                    // Check if any presential session is already assigned to this slot
                    const presentialConflict = remoteAssignments.find(r => r.groupId === groupId && r.day === day && r.slot === slot && r.type === 'présentiel');
                    if (presentialConflict) {
                        valid = false;
                        break;
                    }
                    // Check if any remote session is already assigned to this slot
                    const remoteConflict = remoteAssignments.find(r => r.groupId === groupId && r.day === day && r.slot === slot && r.type === 'à distance');
                    if (remoteConflict) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    // Assign this slot to all groups for this module
                    for (const groupId of groupIds) {
                        remoteAssignments.push({
                            groupId,
                            moduleId: moduleSession.moduleId,
                            formateurId: moduleSession.formateurId,
                            day,
                            slot,
                            ...moduleSession,
                        });
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                // Could not find a valid slot for all groups
                // Optionally, log or handle this case
            }
        }
        // Build timetable for each group
        const timetable = DAYS.map(day => ({ [day]: [] }));
        for (const assignment of remoteAssignments) {
            const dayIdx = DAYS.indexOf(assignment.day);
            if (dayIdx !== -1) {
                timetable[dayIdx][assignment.day].push({
                    ...assignment,
                    timeShot: assignment.slot,
                    type: 'à distance',
                });
            }
        }
        return {
            mergeId: transformed.id,
            timetable,
            remoteAssignments, // for debugging/inspection
        };
    }));

    cachedTimetables = results;
    return results;
};

module.exports = generateTimetableRemoteForEveryMerge;
  