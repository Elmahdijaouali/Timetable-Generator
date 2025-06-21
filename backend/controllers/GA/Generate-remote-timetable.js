const {
    Merge,
    ModuleRemoteSession,
    Module,
    Formateur , 
    Group ,
  } = require("../../models/index.js");
  
  const { transform } = require("../../helpers/transformers/mergeModuleRemoteSessionTransformer.js");
  const {
    getRandomDay,
    getRandomDayWithoutSamedi,
    getRandomTimeShot,
    getRandomTimeShotInSamedi,
    getNextTimeShot,
  } = require("./randoms.js");
  
  const {
    canAddSessionToDay,
    canAddSessionToDaySamedi,
    checkIfTimeshotTakenInDayEdit,
    checkIfTimeshotsTwoSessionTakenInDayEdit
  } = require("./constraints.js");
  
  const { sortSessionInDay } = require("./helper.js");
  
  const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const TIME_SHOTS = ["08:30-11:00", "11:00-13:30", "13:30-16:00", "16:00-18:30"];
  
  let cachedTimetables = null;
  let lastCacheTime = null;

  const pushSessionToDay = (daySessions, session) => {
    session.timeShot = checkIfTimeshotTakenInDayEdit(daySessions, session.timeShot);
    daySessions.push(session);
  };
  
  
  const getValidRandomTimeShot = (dayIndex) => {
    return dayIndex === 5 ? getRandomTimeShotInSamedi() : getRandomTimeShot();
  };
  
  const isTimeshotTakenInDay = (day, timeShot) => {
    return day.some(s => s.timeShot === timeShot);
  };

  const tryPlacingSession = (timetable, moduleSession) => {
    let randomDay = getRandomDay().trim();
  //  console.log('test')
  //  console.log('module session ' ,  moduleSession )
    let randomDayIndex = DAYS.findIndex(day => day.trim() === randomDay);
  
    let timeShot = getValidRandomTimeShot(randomDayIndex);
    let daySessions = timetable[randomDayIndex][DAYS[randomDayIndex]];
    // console.log('day session' , daySessions )
    let session = { ...moduleSession, timeShot };
  
    // console.log('module session test : ' , moduleSession)
    if (moduleSession.nbr_hours_remote_session_in_week === 5) {
      let additionalTimeSlot = getNextTimeShot(timeShot);
  
      const t1 = checkIfTimeshotTakenInDayEdit(daySessions, timeShot );
      const t2 = checkIfTimeshotTakenInDayEdit(daySessions, additionalTimeSlot );
   

      if (
        t1 && t2 &&
        canAddSessionToDay(timetable, randomDayIndex, moduleSession) &&
        (randomDayIndex !== 5 || canAddSessionToDaySamedi(timetable, randomDayIndex, session))
      ) {
      
        pushSessionToDay(daySessions, { ...moduleSession, timeShot : t1 });
        pushSessionToDay(daySessions, { ...moduleSession, timeShot: t2 });
        sortSessionInDay(daySessions);
        return;

      }else{
         console.log('not find place for add session')
      }

    }
  
   let timeshotAfterCheck =  checkIfTimeshotTakenInDayEdit(daySessions, timeShot ) 
   if(timeshotAfterCheck == null ){
    while(true){
       randomDay = getRandomDay().trim();
       randomDayIndex = DAYS.findIndex(day => day.trim() === randomDay);
       timeShot = getValidRandomTimeShot(randomDayIndex);
       daySessions = timetable[randomDayIndex][DAYS[randomDayIndex]];

       timeshotAfterCheck =  checkIfTimeshotTakenInDayEdit(daySessions, timeShot ) 

       if( timeshotAfterCheck != null){
           break
       }
    }
   }
    if (
     
      // !checkIfTimeshotTakenInDayEdit(daySessions, timeShot ) &&
      canAddSessionToDay(timetable, randomDayIndex, moduleSession) &&
      (randomDayIndex !== 5 || canAddSessionToDaySamedi(timetable, randomDayIndex, session))
    ) {
      pushSessionToDay(daySessions, session);
      sortSessionInDay(daySessions);
      return;
    }

    placeSessionOnAlternativeDay(timetable, session, moduleSession);
  };
 

  const placeSessionOnAlternativeDay = (timetable, session, moduleSession) => {
    let randomDayIndex;
    while (true) {

      const randomDay = getRandomDay();
      randomDayIndex = DAYS.findIndex(day => day === randomDay);
      const daySessions = timetable[randomDayIndex][DAYS[randomDayIndex]];
  
      if (
        canAddSessionToDay(timetable, randomDayIndex, moduleSession) &&
        (randomDayIndex !== 5 || canAddSessionToDaySamedi(timetable, randomDayIndex, session))
      ) {

        if ( moduleSession.nbr_hours_in_week_syn === 5 ||
          moduleSession.nbr_hours_remote_session_in_week === 5) {
            const additionalTimeSlot = getNextTimeShot(session.timeShot);
            const additionalSession = {
              ...moduleSession,
              timeShot: checkIfTimeshotTakenInDayEdit(daySessions, additionalTimeSlot),
            };
            pushSessionToDay(daySessions, additionalSession);
        }
  

        pushSessionToDay(daySessions, session);
        sortSessionInDay(daySessions);
        break;
      }
    }
  };
  
  const getLastModuleRemoteSessionUpdateTime = async () => {
    const latestSession = await ModuleRemoteSession.findOne({
      order: [['updatedAt', 'DESC']],
      attributes: ['updatedAt']
    });
  
    return latestSession ? latestSession.updatedAt : new Date(0); 
  }

  // const determineNextSlot = (timeShot) => {
  //   const index = TIME_SHOTS.findIndex(t => t === timeShot);
  //   const isMorning = index <= 1;
  //   const preferredIndex = isMorning ? 1 : 3;
  
  //   return TIME_SHOTS[preferredIndex];
  // };
  
  const generateTimetableRemoteForEveryMerge = async () => {
   
    const latestUpdate = await getLastModuleRemoteSessionUpdateTime();
  
    if (cachedTimetables && lastCacheTime && lastCacheTime >= latestUpdate) {
      return cachedTimetables;
    }
    
    const merges = await Merge.findAll({
      include: [
        {
          model: ModuleRemoteSession,
          include: [{ model: Module }, { model: Formateur }],
        },
      ],
    });
  
    const results = merges.map( (merge) => {
      const transformed = transform(merge);

      const timetable = DAYS.map(day => ({ [day]: [] }));
  
      transformed.modules_open.forEach(moduleSession =>
        tryPlacingSession(timetable, moduleSession)
      );


      return {
        mergeId: transformed.id,
        timetable,
      };

    });
  
    cachedTimetables = results;
    return results;
  };



  module.exports = generateTimetableRemoteForEveryMerge;
  