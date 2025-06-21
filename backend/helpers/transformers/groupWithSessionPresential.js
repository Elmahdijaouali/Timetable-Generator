
module.exports = {
    transformGroupwithModules : (group) => {
        const modules =  [] 
        
        group.GroupModuleFormateurs
        .filter(module => module.is_started === true )
        .forEach(gmf => {
             const module = gmf.module  
             const formateur = gmf.formateur 
             const classroom = formateur?.classroom 

             const totalHours = parseFloat(gmf.nbr_hours_presential_in_week)

             let remainingHours = totalHours 

             while(remainingHours > 0){
                 let chunk = remainingHours >= 5 ? 5 : 2.5

                 modules.push({
                    moduleId  : module.id ,
                    code_module : module.code_module , 
                    module_label :  module.label ,
                    nbr_hours_presential_in_week : chunk  ,
                    is_started : gmf.is_started , 
                    type :'presential' ,
                    formateurId : formateur.id ,
                    formateur: formateur.name ,
                    classroom : classroom.label , 
                    classroomId : classroom.id ,
                    classroom_is_available : classroom.is_available ,
                    formateur_is_available : formateur.is_available ,
                 })

                 remainingHours -= chunk
             }

        })

        return modules

        //  return {
        //      id : group.id , 
        //      code_group : group.code_group  , 
        //      modules : group.GroupModuleFormateurs
        //      .filter(module => module.is_started === true )
        //      .map(module => {
        //         return {
        //             id :module.module.id ,
        //             code_module : module.module.code_module , 
        //             module_label : module.module.label ,
        //             nbr_hours_presential_in_week : module.nbr_hours_presential_in_week ,
        //             is_started : module.is_started , 
        //             formateur:module.formateur.name ,
        //             classroom : module.formateur.classroom.label , 
        //             classroom_available :  module.formateur.classroom.is_available ,
        //             formateur_available : module.formateur.is_available ,
        //         }
        //      })
        //  }
    }
}