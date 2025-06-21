const dayOrder = {
    "Lundi" : 1 , 
    "Mardi" : 2 , 
    "Mercredi" : 3  , 
    "Jeudi" : 4 , 
    "Vendredi" : 5 ,
    "Samedi" : 6
}


module.exports = {
   
    transform: (groups) => {
      

        const classroomInfo = groups[0]?.Sessions[0]?.classroom;
        const daysMap = {};
        groups.forEach(group => {
            group.Sessions.forEach(session => {
                const day = session.day;
                if (!daysMap[day]) {
                    daysMap[day] = [];
                }
                
                daysMap[day].push({
                    id: session.id,
                    module: session.module.label,
                    type: session.type === 'presential' ? 'presential' : 'à distance',
                    timeshot: session.timeshot,
                    color: session.module.color, 
                    day: day,
                    formateur: session.formateur.name,
                    salle : session.type === 'presential' ? session.classroom?.label  : 'Teams',
                    group: session.group.code_group
                });
            });
        });
        
        const timetable = Object.keys(dayOrder).map(day => {
            return daysMap[day] ? { [day]: daysMap[day] } : { [day] : []};
        })


        return {
            id: classroomInfo?.id,
            valid_form: groups[0]?.valid_form.toLocaleDateString() , 
            status: 'active', 
            nbr_hours_in_week: calculateWeeklyHours(daysMap), 
            salle: classroomInfo?.label,
            timetable: timetable
        };
    }
};

function calculateWeeklyHours(daysMap) {
    let totalHours = 0;
    Object.values(daysMap).forEach(sessions => {
        sessions.forEach(session => {
            const [start, end] = session.timeshot.split('-');
            const startTime = new Date(`2000-01-01T${start}:00`);
            const endTime = new Date(`2000-01-01T${end}:00`);
            totalHours += (endTime - startTime) / (1000 * 60 * 60);
        });
    });
    return totalHours.toFixed(1);
}

