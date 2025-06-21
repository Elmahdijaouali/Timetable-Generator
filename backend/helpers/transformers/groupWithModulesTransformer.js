
module.exports = {
    transformGroupwithModules : (group) => {
         return {
             id : group.id , 
             code_group : group.code_group  , 
             modules : group.GroupModuleFormateurs.map(module => {
                return {
                    moduleId :module.module.id ,
                    code_module : module.module.code_module , 
                    module_label : module.module.label ,
                    nbr_hours_presential_in_week : module.nbr_hours_presential_in_week ,
                    nbr_hours_remote_in_week : module.nbr_hours_remote_in_week , 
                    is_started : module.is_started
                }
             })
         }
    }
}