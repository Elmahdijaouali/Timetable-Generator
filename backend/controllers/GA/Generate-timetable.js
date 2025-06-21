const generateTimetableRemoteForEveryMerge = require("./Generate-remote-timetable.js");
const {
  Group,
  Merge,
  GroupModuleFormateur,
  Branch,
  Module,
  Formateur,
  Classroom,
  FormateurTimetable ,
  Session  , 
  Timetable , 
  GroupsNeedChangeTimetable
} = require("../../models/index.js");

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
  checkIfHaveSessionRemoteInDay,
  checkIfSessionWithFormateurTakenByGroup,
  checkFormateurAvailabilityForGroup ,
  getValidTimeShotsForFormateurDay , 
  isTimeshotTaken
} = require("./constraints.js");

const { sortSessionInDay } = require("./helper.js");
const { transformGroupwithModules } = require("../../helpers/transformers/groupWithSessionPresential.js");
const db = require('../../models');


const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const TIME_SHOTS = ["08:30-11:00", "11:00-13:30", "13:30-16:00", "16:00-18:30"];


const createEmptyTimetable = () => DAYS.map(day => ({ [day]: [] }));



const pushSessionToDay = (daySessions, session) => {
    session.timeShot = checkIfTimeshotTakenInDayEdit(daySessions, session.timeShot);
    daySessions.push(session);
};
  
const MORNING = ["08:30-11:00", "11:00-13:30"];
const AFTERNOON = ["13:30-16:00", "16:00-18:30"];

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// const findAvailablePair = (sessions, availability, period) => {
//   const [availStartMin, availEndMin] = availability;
//   const periodSlots = period === "morning" ? MORNING : AFTERNOON;

//   for (let i = 0; i < periodSlots.length - 1; i++) {
//     const slot1 = periodSlots[i];
//     const slot2 = periodSlots[i + 1];

//     const [s1Start, s1End] = slot1.split("-").map(toMinutes);
//     const [s2Start, s2End] = slot2.split("-").map(toMinutes);

//     if (
//       s1Start >= availStartMin && s2End <= availEndMin &&
//       !isTimeshotTaken(sessions, slot1) &&
//       !isTimeshotTaken(sessions, slot2)
//     ) {
//       return [slot1, slot2];
//     }
//   }

//   return null;
// };

const placeSessionWithValidation = async (timetable, groupsTimetables, moduleSession) => {
    let attemptCount = 0;
    let placed = false;
    

    while (!placed && attemptCount < 10000 ) {
      const randomDay = getRandomDay();
      const indexDay = DAYS.indexOf(randomDay);
      const dayKey = DAYS[indexDay];
      
      
      if (indexDay === -1 || !timetable[indexDay] || !timetable[indexDay][dayKey]) {
        attemptCount++;
        continue;
      }
  
      const timeShot = indexDay === 5 ? getRandomTimeShotInSamedi() : getRandomTimeShot();
      const timeshotAfterCheck =  checkIfTimeshotTakenInDayEdit(timetable[indexDay][dayKey], timeShot)
      const session = {
        ...moduleSession,
        timeShot:timeshotAfterCheck
      };
  
      const validatedSession = checkIfHaveSessionRemoteInDay(timetable[indexDay][dayKey], session);
  
  
      const timetableFormateur = await FormateurTimetable.findOne({
        where: {
          formateurId: validatedSession.formateurId,
          day: randomDay
        }
      });
      
      if (!timetableFormateur) {
        console.warn('Formateur has no timetable for this day');
        continue;
      }
     
      const [availStart, availEnd] = timetableFormateur.timeshot.split('-').map(t => t.trim());
      const [sessionStart, sessionEnd] = validatedSession.timeShot.split('-').map(t => t.trim());
      
      const toMinutes = (t) => {
        const [h, m] = t.split(':')
        return h * 60 + Number(m);
      };
      
      const sessionStartMin = toMinutes(sessionStart);
      const sessionEndMin = toMinutes(sessionEnd);
      const availStartMin = toMinutes(availStart);
      const availEndMin = toMinutes(availEnd);
   
      const isAvailable = sessionStartMin >= availStartMin && sessionEndMin <= availEndMin;

      if(!isAvailable){
         continue
      }

      if (

        isAvailable && 
        canAddSessionToDay(timetable, indexDay, moduleSession) &&
        checkIfSessionWithFormateurTakenByGroup(groupsTimetables, session, randomDay)  &&
        (indexDay !== 5 || canAddSessionToDaySamedi(timetable, indexDay, validatedSession)) 
        
      ) {

        if (moduleSession.nbr_hours_presential_in_week === 5) {
          const nextTime = getNextTimeShot(timeShot);
          if(nextTime == null){
             console.log('not have session in day for add next session!')
          }

          const [sessionNextStart, sessionNextEnd] = nextTime.split('-').map(t => t.trim());
          const sessionNextStartMin = toMinutes(sessionNextStart);
          const sessionNextEndMin = toMinutes(sessionNextEnd);

          const isAvailableNextSession = sessionNextStartMin >= availStartMin && sessionNextEndMin <= availEndMin;


          if(isTimeshotTaken(timetable[indexDay][dayKey], nextTime) || !isAvailableNextSession){
            return await placeSessionWithValidation(timetable, groupsTimetables, moduleSession)
          }
          
          const sessionTwo = {
            ...moduleSession,
            timeShot: checkIfTimeshotTakenInDayEdit(timetable[indexDay][dayKey], nextTime),
          };
           
             
          // const finalSessionTwo = checkIfHaveSessionRemoteInDay(timetable[indexDay][dayKey], sessionTwo);
          while(true){
             
            if(checkIfSessionWithFormateurTakenByGroup(groupsTimetables, sessionTwo, randomDay) ){
              pushSessionToDay(timetable[indexDay][dayKey], sessionTwo);
              break
            }
            
            return await placeSessionWithValidation(timetable, groupsTimetables, moduleSession)
          }
          
          // pushSessionToDay(timetable[indexDay][dayKey], sessionTwo);
          
        }
  
        pushSessionToDay(timetable[indexDay][dayKey], validatedSession);
        placed = true;
     
      }
  
      attemptCount++;
    }
  
    if (!placed) {
      console.log(`Error session ${moduleSession.label} !!`);
    }
  };




const getTimetableFromMerge = (mergeId, allRemoteTimetables) => {
  const found = allRemoteTimetables.find(m => m.mergeId === mergeId);
  return found ? JSON.parse(JSON.stringify(found.timetable)) : createEmptyTimetable();
};


const buildMergedGroupRemoteTimetable = async (merges, remoteTimetables) => {
  const merged = createEmptyTimetable();
  let conflictDetected = false;

  for (const merge of merges) {
    const timetable = await getTimetableFromMerge(merge.id, remoteTimetables);

    timetable.forEach(day => {
      const dayKey = Object.keys(day)[0];
      const sessions = day[dayKey];

      const groupDay = merged.find(d => Object.keys(d)[0] === dayKey);
      if (groupDay) {
        for (const session of sessions) {
          const exists = groupDay[dayKey].some(s => s.timeShot === session.timeShot);
          if (!exists) {
            groupDay[dayKey].push(session);
          } else {
            conflictDetected = true;
            console.warn(`Conflict detected in merge ${merge.id} on ${dayKey} at ${session.timeShot}. Will reassign.`);

           
            if (!merge.conflicts) merge.conflicts = [];
            merge.conflicts.push({ ...session, day: dayKey });
          }
        }
      }
    });
  }


  return { merged, conflictDetected };
};



const getPresentialSessions = async (group) => {
  const groupData = await Group.findOne({
    where: { id: group.id },
    include: [{
      model: GroupModuleFormateur,
      include: [
        { model: Module, as: "module" },
        {
          model: Formateur,
          as: "formateur",
          include: [{ model: Classroom, as: "classroom" }],
        },
      ],
    }],
  });

  return transformGroupwithModules(groupData);
};



const storeTimetableToDB = async (groupCode, timetableData , valide_a_partir_de) => {
  try {
    
    const group = await Group.findOne({ where: { code_group: groupCode } });
    if (!group) throw new Error(`Group ${groupCode} not found`);

    // update status all timetables group to archived
    const timetablesGroup = await Timetable.findAll({ where : {  groupId: group.id }})
    if(timetablesGroup.length > 0){
         await Timetable.update({ status: 'archived'} , {
           where : {  groupId: group.id } , 
         })
    }

    const timetable = await Timetable.create({
      groupId: group.id,
      valid_form: valide_a_partir_de ,
      status: 'active'
    } ,
   
    );
     
    let nbr_hours_in_week = 0 ;

    for (const dayObj of timetableData) {
      const dayName = Object.keys(dayObj)[0];
      const sessions = dayObj[dayName];

      for (const session of sessions) {
        await Session.create({
          timetableId: timetable.id,
          groupId: group.id,
          moduleId: session.moduleId,
          formateurId: session.formateurId,
          classroomId: session.classroomId,
          timeshot: session.timeShot,
          type: session.type,
          day: dayName
        } ,

        );


        nbr_hours_in_week += 2.5 

      }
    }
    
    await Timetable.update({ nbr_hours_in_week : nbr_hours_in_week } , {
      where : {
        groupId: group.id,
        status: 'active'
       } , 
    })

    console.log(`Timetable stored for group ${groupCode}`);
    
  } catch (err) {
    console.error(`Error saving timetable:`, err);
   
  }
};




const first_generate = async (valide_a_partir_de) => {
  try {
    let remoteTimetables = await generateTimetableRemoteForEveryMerge();

    const branches = await Branch.findAll({
      include: [{ model: Group, include: [Merge] }],
    });
    
    const groupsTimetables = [];
    for (const branch of branches) {
      await Promise.all(branch.Groups.map(async (group) => {
        let mergeResult = await buildMergedGroupRemoteTimetable(group.Merges, remoteTimetables);

        if (mergeResult.conflictDetected) {
          
          for (const merge of group.Merges) {
            const originalTimetable = remoteTimetables.find(m => m.mergeId === merge.id);
            if (merge.conflicts && originalTimetable) {
              for (const conflict of merge.conflicts) {
          

                const indexDay = originalTimetable.timetable.findIndex(day => Object.keys(day)[0] === conflict.day);
                if (indexDay >= 0) {
                  originalTimetable.timetable[indexDay][conflict.day] = originalTimetable.timetable[indexDay][conflict.day].filter(
                    s => !(s.timeShot === conflict.timeShot && s.moduleId === conflict.moduleId)
                  );
                }

                let reassigned = false;
                for (let i = 0; i < DAYS.length; i++) {
                  const day = DAYS[i];
                  const sessionsOfDay = originalTimetable.timetable[i][day];
                  const timeShot = i === 5 ? getRandomTimeShotInSamedi() : getRandomTimeShot();

                  const exists = sessionsOfDay.some(s => s.timeShot === timeShot);
                  if (!exists) {
                    sessionsOfDay.push({ ...conflict, timeShot, day });
                    reassigned = true;
                    break;
                  }
                }

                if (!reassigned) {
                  console.warn(`Could not reassign session:`, conflict);
                }
              }
            }
          }

          return await first_generate(valide_a_partir_de);
        }

        const presentialSessions = await getPresentialSessions(group);
        const timetable = mergeResult.merged;
  

        for (const moduleSession of presentialSessions) {
          await placeSessionWithValidation(timetable, groupsTimetables, moduleSession);
        }

        await storeTimetableToDB(group.code_group, timetable, valide_a_partir_de);

        groupsTimetables.push({
          code_group: group.code_group,
          timetable,
        });
      }))
    }

    return true;
  } catch (error) {
    console.error("Error first generating:", error);
  }
};



const generate =async (valide_a_partir_de) => {
    

    try {
      
      let remoteTimetables = await generateTimetableRemoteForEveryMerge();
      const groups = await GroupsNeedChangeTimetable.findAll({ 
        include : [
          { model : Group ,  include : [ { model : Merge }] }
        ]
      })
    
      const groupsTimetables = [];
      
        for (const group of groups) {

          let mergeResult = await buildMergedGroupRemoteTimetable(group.Group.Merges, remoteTimetables);
  
          if (mergeResult.conflictDetected) {
           
            for (const merge of group.Merges) {
              const originalTimetable = remoteTimetables.find(m => m.mergeId === merge.id);
              if (merge.conflicts && originalTimetable) {
                for (const conflict of merge.conflicts) {
                  
                  
                  const indexDay = originalTimetable.timetable.findIndex(day => Object.keys(day)[0] === conflict.day);
                  if (indexDay >= 0) {
                    originalTimetable.timetable[indexDay][conflict.day] = originalTimetable.timetable[indexDay][conflict.day].filter(
                      s => !(s.timeShot === conflict.timeShot && s.moduleId === conflict.moduleId)
                    );
                  }
  
                  
                  let reassigned = false;
                  for (let i = 0; i < DAYS.length; i++) {
                    const day = DAYS[i];
                    const sessionsOfDay = originalTimetable.timetable[i][day];
                    const timeShot = i === 5 ? getRandomTimeShotInSamedi() : getRandomTimeShot();
  
                    const exists = sessionsOfDay.some(s => s.timeShot === timeShot);
                    if (!exists) {
                      sessionsOfDay.push({ ...conflict, timeShot, day });
                      reassigned = true;
                      break;
                    }
                  }
  
                  if (!reassigned) {
                    console.warn(`Could not reassign session:`, conflict);
                  }
                }
              }
            }
  
           
            return await generate(valide_a_partir_de);
          }
  
          const presentialSessions = await getPresentialSessions(group.Group);
          const timetable = mergeResult.merged;
    
  
          for (const moduleSession of presentialSessions) {
            await placeSessionWithValidation(timetable, groupsTimetables, moduleSession);
          }
  
          await storeTimetableToDB(group.Group.code_group, timetable, valide_a_partir_de);
  
          groupsTimetables.push({
            code_group: group.code_group,
            timetable,
          });
        }
      
  
      return true;
    } catch (error) {
      console.error("Error first generating:", error);
    }
}


const generate_timetables = async (req , res) => {
 
 
    const { valide_a_partir_de } = req.body;

    if (!valide_a_partir_de) {
      return res.status(400).json({ errors: 'valide_a_partir_de is required.' });
    }
    
    const timetablesFormateur = await FormateurTimetable.findOne()
    if(!timetablesFormateur){
       return res.status(422).json({"errors" : 'before generate timetable group , must generate timetables formateurs !!'})
    }

    const parsedDate = new Date(valide_a_partir_de);
    const now = new Date();
    
   
    if (isNaN(parsedDate.getTime()) || parsedDate < now) {
      return res.status(400).json({ errors: 'valide_a_partir_de must be a valid future date.' });
    }

   try{
        
      let timetables 
      const timetablesDB = await Timetable.findAll({})

      if( timetablesDB.length > 0){
         timetables = await generate(valide_a_partir_de)
      }else{
         timetables = await first_generate(valide_a_partir_de)
      }

      await GroupsNeedChangeTimetable.destroy({ truncate : true})

      return res.json({ "message" : 'seccéss generate timetable' , "data" : timetables} )

   }catch(err){
     console.log('Error generate timetables' , err)
     res.json(err)
   }
}



//  const groups_in_traning = await Traning.findAll({ attributes : ['id'] })
//    const  ids_groups_in_traning = groups_in_traning.map(group => group.id)
//   let groups = await GroupsNeedChangeTimetable.findAll({ 
//         include : [
//           { model : Group , where : { id : { [Op.notIn] : ids_groups_in_traning }  }  ,  include : [ { model : Merge }] }
//         ]
//       })

//  return  res.json(groups)



module.exports = { generate_timetables };
