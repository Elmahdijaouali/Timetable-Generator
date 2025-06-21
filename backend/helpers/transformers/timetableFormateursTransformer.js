module.exports = {
  transform: (formateur) => {
      return {
        id : formateur.id , 
        mle_formateur : formateur.mle_formateur , 
        formateur : formateur.name,
        nbr_hours_in_week : formateur.FormateurTimetables.length * 5 - 1
      }
  } 
};
