const { FormateurTimetable, Formateur } = require("../../models");
const {
  getRandomDay,
  getRandomDayWithoutSamedi,
  getRandomTimeShot,
  getRandomTimeShotInSamedi,
  getNextTimeShot,
} = require("./randoms.js");

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const timeShots = ["08:30-11:00", "11:00-13:30", "13:30-16:00", "16:00-18:30"];
const timeShotsFormateur = ["08:30-13:30", "13:30-18:30"];





const canAddSessionToDay = (timetable, indexDay, moduleSession) => {
    const currentDay = timetable[indexDay][DAYS[indexDay]];
    const labels = currentDay.map(s => s.module_label);
  
    return currentDay.length < 4 && !labels.includes(moduleSession.module_label);
};


const canAddSessionToDaySamedi = (timetable, indexDay, session = {}) => {
  return (
    indexDay === 5 &&
    timetable[indexDay][DAYS[indexDay]].length < 2 &&
    ["08:30-11:00", "11:00-13:30"].includes(session.timeShot)
  );
};



const checkIfTimeshotTakenInDayEdit = (day, timeShot) => {
    const taken = day.map(s => s.timeShot);
  
    if (taken.includes(timeShot)) {
      const availableTimeShots = timeShots.filter(t => !taken.includes(t));
      if (availableTimeShots.length > 0) {
        return availableTimeShots[Math.floor(Math.random() * availableTimeShots.length)];
      }
    }
    return timeShot;
  };

const isTimeshotTaken = (day, timeShot) => {
  const taken = day.map(s => s.timeShot);
  if (taken.includes(timeShot)) {
   return true
  }
  return false;
}


const checkIfHaveSessionRemoteInDay = (daySessions, session) => {
    const types = daySessions.map(s => s.type);
    const sessionIndex = timeShots.indexOf(session.timeShot);

    if (types.includes("à distance") && session.type !== "à distance") {
        const remoteSessions = daySessions.filter(s => s.type === "à distance");
        let newIndex = sessionIndex;

        
        remoteSessions.forEach(remoteSession => {
            const remoteIndex = timeShots.indexOf(remoteSession.timeShot);

            if (remoteIndex === 0 && sessionIndex === 1) {
                newIndex = 3; 
            } else if (remoteIndex === 3 && sessionIndex === 2) {
                newIndex = 1; 
            } else if (remoteIndex === 1 && sessionIndex === 0) {
                newIndex = 2; 
            } else if (remoteIndex === 2 && sessionIndex === 3) {
                newIndex = 1; 
            }
        });

        const adjustedTimeShot = timeShots[newIndex];
        return {
            ...session,
            timeShot: checkIfTimeshotTakenInDayEdit(daySessions, adjustedTimeShot),
        };
    }
    return session;
};


const checkIfSessionWithFormateurTakenByGroup = (groupsTimetables, session, dayName) => {
  // console.log('groupes timetables :' , groupsTimetables)

  for (const group of groupsTimetables) {
    for (let i = 0; i < group.timetable.length; i++) {
      const currentDay = DAYS[i];
      if (currentDay !== dayName) continue;

      const sessions = group.timetable[i][currentDay];
      for (const s of sessions) {
        if (
          s.label === session.label &&
          s.timeShot === session.timeShot &&
          s.formateur === session.formateur
        ) {
          return false;
        }
      }
    }
  }
  return true;
};


const isTimeSlotWithin = (groupTimeShot, formateurTimeShot) => {
    const [gStart, gEnd] = groupTimeShot.split('-').map(t => t.trim());
    const [fStart, fEnd] = formateurTimeShot.split('-').map(t => t.trim());
  
    return gStart >= fStart && gEnd <= fEnd;
  };
  
  const checkFormateurAvailabilityForGroup = async (formateurId, groupTimeShot, dayName) => {
    try {
      const formateurTimetable = await FormateurTimetable.findAll({
        where: {
          formateurId,
          year: '2025',
        },
      });
  
     
      const formateurDay = formateurTimetable.find(session => session.day === dayName);
 
      if (!formateurDay) return false;
  
      console.log('formateur day' , formateurDay )
      
      return isTimeSlotWithin(groupTimeShot, formateurDay.timeshot);
       
    } catch (err) {
      console.error("Error checking formateur availability:", err);
      return false;
    }
  };
  ;


const getValidTimeShotsForFormateurDay = async (formateurId, dayName) => {
    const availability = await FormateurTimetable.findAll({
      where: {
        formateurId,
        day: dayName,
        year: '2025',
      }
    });
  
    if (!availability || availability.length === 0) return [];
  
    const validSlots = [];
  
    for (const { timeshot } of availability) {
    
      if (timeshot === "08:30-13:30") {
        validSlots.push("08:30-11:00", "11:00-13:30");
      } else if (timeshot === "13:30-18:30") {
        validSlots.push("13:30-16:00", "16:00-18:30");
      }
    }
  
    return validSlots;
  };
  
 

const checkIfTimeshotsTwoSessionTakenInDayEdit = (day, timeshot1, timeshot2) => {
  const taken = day.map(s => s.timeShot);

  
  if (!taken.includes(timeshot1) && !taken.includes(timeshot2)) {
    return { timeshot1, timeshot2 };
  }

 
  const availableTimeShots = TIME_SHOTS.filter(t => !taken.includes(t));
  
  for (let i = 0; i < availableTimeShots.length - 1; i++) {
    const t1 = availableTimeShots[i];
    const t2 = availableTimeShots[i + 1];

    if (getNextTimeShot(t1) === t2) {
      return {
        timeshot1: t1,
        timeshot2: t2
      };
    }
  }


  return null;
};

  
module.exports = {
  canAddSessionToDay,
  canAddSessionToDaySamedi,
  checkIfTimeshotTakenInDayEdit,
  checkIfHaveSessionRemoteInDay,
  checkIfSessionWithFormateurTakenByGroup,
  checkFormateurAvailabilityForGroup ,
  getValidTimeShotsForFormateurDay , 
  checkIfTimeshotsTwoSessionTakenInDayEdit,
  isTimeshotTaken

};
