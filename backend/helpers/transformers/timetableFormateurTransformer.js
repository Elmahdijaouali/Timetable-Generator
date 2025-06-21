
const dayOrder = {
    "Lundi" : 1 , 
    "Mardi" : 2 , 
    "Mercredi" : 3  , 
    "Jeudi" : 4 , 
    "Vendredi" : 5 ,
    "Samedi" : 6
}
module.exports = {
    transformFormateur : (formateur) => {
        return {
            id : formateur.id , 
            mle_formateur : formateur.mle_formateur , 
            formateur : formateur.name,
            nbr_hours_in_week : formateur.FormateurTimetables.length * 5 - 1 ,
            timetable : formateur.FormateurTimetables.sort((a , b) => dayOrder[a.day] - dayOrder[b.day])
        }
    }
}