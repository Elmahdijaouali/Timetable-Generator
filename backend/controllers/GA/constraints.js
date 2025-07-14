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

// Time slot definitions with start and end times in minutes
const TIME_SLOT_DEFINITIONS = {
  "08:30-11:00": { start: 8 * 60 + 30, end: 11 * 60, index: 0 },
  "11:00-13:30": { start: 11 * 60, end: 13 * 60 + 30, index: 1 },
  "13:30-16:00": { start: 13 * 60 + 30, end: 16 * 60, index: 2 },
  "16:00-18:30": { start: 16 * 60, end: 18 * 60 + 30, index: 3 }
};

// Gap requirement in minutes (2.5 hours = 150 minutes)
const REQUIRED_GAP_MINUTES = 150;

/**
 * Check if there's a sufficient gap between two time slots
 * @param {string} slot1 - First time slot (e.g., "08:30-11:00")
 * @param {string} slot2 - Second time slot (e.g., "13:30-16:00")
 * @returns {boolean} - True if there's at least 2.5 hours gap
 */
const hasSufficientGap = (slot1, slot2) => {
  const def1 = TIME_SLOT_DEFINITIONS[slot1];
  const def2 = TIME_SLOT_DEFINITIONS[slot2];
  
  if (!def1 || !def2) return false;
  
  // Calculate gap between slots
  // If slot2 comes after slot1: gap = slot2.start - slot1.end
  // If slot1 comes after slot2: gap = slot1.start - slot2.end
  let gap;
  if (def2.start > def1.end) {
    gap = def2.start - def1.end;
  } else if (def1.start > def2.end) {
    gap = def1.start - def2.end;
  } else {
    // Slots overlap or are adjacent (no gap)
    gap = 0;
  }
  
  return gap >= REQUIRED_GAP_MINUTES;
};

/**
 * Get all time slots that have sufficient gap from a given slot
 * @param {string} referenceSlot - The reference time slot
 * @returns {string[]} - Array of time slots with sufficient gap
 */
const getValidSlotsWithGap = (referenceSlot) => {
  const validSlots = [];
  
  for (const slot of timeShots) {
    if (slot !== referenceSlot && hasSufficientGap(referenceSlot, slot)) {
      validSlots.push(slot);
    }
  }
  
  return validSlots;
};

/**
 * Check if a new session can be added without violating the 2.5-hour gap rule
 * @param {Array} daySessions - Array of existing sessions for the day
 * @param {Object} newSession - The new session to be added
 * @returns {boolean} - True if the session can be added
 */
const canAddSessionWithGapRule = (daySessions, newSession) => {
  const newSessionType = newSession.type;
  const newSessionSlot = newSession.timeShot;
  
  // Check against existing sessions
  for (const existingSession of daySessions) {
    const existingSessionType = existingSession.type;
    const existingSessionSlot = existingSession.timeShot;
    
    // If one is remote and the other is presential, check gap
    if (newSessionType !== existingSessionType) {
      if (!hasSufficientGap(newSessionSlot, existingSessionSlot)) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Find the best alternative time slot for a session that violates the gap rule
 * @param {Array} daySessions - Array of existing sessions for the day
 * @param {Object} session - The session that needs a new time slot
 * @returns {string|null} - The best alternative time slot or null if none available
 */
const findAlternativeTimeSlot = (daySessions, session) => {
  const sessionType = session.type;
  const takenSlots = daySessions.map(s => s.timeShot);
  
  // Get all remote sessions to check against
  const remoteSessions = daySessions.filter(s => s.type === "à distance");
  const presentialSessions = daySessions.filter(s => s.type !== "à distance");
  
  // Find all available slots (not taken by any session)
  const availableSlots = timeShots.filter(slot => !takenSlots.includes(slot));
  
  // For each available slot, check if it respects the gap rule
  for (const slot of availableSlots) {
    let isValid = true;
    
    // Check against remote sessions if this is a presential session
    if (sessionType !== "à distance") {
      for (const remoteSession of remoteSessions) {
        if (!hasSufficientGap(slot, remoteSession.timeShot)) {
          isValid = false;
          break;
        }
      }
    }
    
    // Check against presential sessions if this is a remote session
    if (sessionType === "à distance") {
      for (const presentialSession of presentialSessions) {
        if (!hasSufficientGap(slot, presentialSession.timeShot)) {
          isValid = false;
          break;
        }
      }
    }
    
    if (isValid) {
      return slot;
    }
  }
  
  return null;
};


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

    // Check if there are remote sessions and this is not a remote session
    if (types.includes("à distance") && session.type !== "à distance") {
        const remoteSessions = daySessions.filter(s => s.type === "à distance");
        
        // Check if the current time slot violates the gap rule
        if (!canAddSessionWithGapRule(daySessions, session)) {
            // Find an alternative time slot that respects the gap rule
            const alternativeSlot = findAlternativeTimeSlot(daySessions, session);
            
            if (alternativeSlot) {
                return {
                    ...session,
                    timeShot: alternativeSlot,
                };
            } else {
                // If no alternative found, try to find any available slot
                const takenSlots = daySessions.map(s => s.timeShot);
                const availableSlots = timeShots.filter(slot => !takenSlots.includes(slot));
                
                if (availableSlots.length > 0) {
                    return {
                        ...session,
                        timeShot: availableSlots[Math.floor(Math.random() * availableSlots.length)],
                    };
                }
            }
        }
    }
    
    // Check if this session would violate the gap rule against existing sessions
    if (!canAddSessionWithGapRule(daySessions, session)) {
        const alternativeSlot = findAlternativeTimeSlot(daySessions, session);
        
        if (alternativeSlot) {
            return {
                ...session,
                timeShot: alternativeSlot,
            };
        }
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
      if (dayName === "Samedi") {
        if (timeshot === "08:30-11:00" || timeshot === "11:00-13:30") {
          validSlots.push(timeshot);
        }
      } else {
        if (timeshot === "08:30-13:30") {
          validSlots.push("08:30-11:00", "11:00-13:30");
        } else if (timeshot === "13:30-18:30") {
          validSlots.push("13:30-16:00", "16:00-18:30");
        }
      }
    }
  
    return validSlots;
  };
  
 

const checkIfTimeshotsTwoSessionTakenInDayEdit = (day, timeshot1, timeshot2) => {
  const taken = day.map(s => s.timeShot);

  
  if (!taken.includes(timeshot1) && !taken.includes(timeshot2)) {
    return { timeshot1, timeshot2 };
  }

 
  const availableTimeShots = timeShots.filter(t => !taken.includes(t));
  
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
  isTimeshotTaken,
  // New functions for 2.5-hour gap rule
  hasSufficientGap,
  getValidSlotsWithGap,
  canAddSessionWithGapRule,
  findAlternativeTimeSlot
};
