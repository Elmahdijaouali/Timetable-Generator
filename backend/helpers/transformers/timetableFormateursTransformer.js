module.exports = {
  transform: (formateur) => {
    // Calculate total hours based on actual timeshot durations
    let totalHours = 0;
    
    formateur.FormateurTimetables.forEach(timetable => {
      const timeshot = timetable.timeshot;
      
      // Calculate hours based on timeshot
      if (timeshot === "08:30-11:00" || timeshot === "11:00-13:30") {
        // 2.5 hours for Saturday slots
        totalHours += 2.5;
      } else if (timeshot === "08:30-13:30" || timeshot === "13:30-18:30") {
        // 5 hours for regular day slots
        totalHours += 5;
      }
    });

    return {
      id: formateur.id,
      mle_formateur: formateur.mle_formateur,
      formateur: formateur.name,
      nbr_hours_in_week: totalHours
    };
  }
};
