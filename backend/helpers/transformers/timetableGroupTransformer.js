const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const getTimetable = (Sessions) => {
  
  const sessions = Sessions.map((session) => {
    return {
      id: session.id,
      module: session.module.label,
      type: session.type,
      timeshot: session.timeshot,
      color: session.module.color,
      day: session.day,
      formateur: session.formateur.name,
      salle: session.classroom ? session.classroom.label : "Teams",
    };
  })

  return DAYS.map((day) => ({
    [day]: sessions
      .filter((session) => session.day === day)
      .sort((a, b) => a.timeshot.localeCompare(b.timeshot)),
  }));
};

module.exports = {
  transformTimetableGroup: (timetable) => {
    const valid_form = new Date(timetable.valid_form)
    return {
      id: timetable.id,
      valid_form: valid_form?.toLocaleDateString(),
      status: timetable.status,
      nbr_hours_in_week : timetable.nbr_hours_in_week ,
      groupe: timetable.group.code_group,
      niveau: timetable.group.niveau,
      code_branch: timetable.group.branch.code_branch,
      label_branch: timetable.group.branch.label,
      timetable :getTimetable(timetable.Sessions)
    };
  },
};
