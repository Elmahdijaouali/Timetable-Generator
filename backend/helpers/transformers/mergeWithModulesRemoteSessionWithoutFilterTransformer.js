module.exports = {
    transform: (merge) => {
        return {
            id : merge.id , 
            groups : merge.groups ,
            modules: merge.ModuleRemoteSessions
            .map((item) => {
              return {
                moduleId: item.Module.id,
                module_label: item.Module.label,
                code_module: item.Module.code_module,
                is_started: item.is_started,
                nbr_hours_remote_session_in_week:
                item.nbr_hours_remote_session_in_week,
              
              };
            }),
        }
    }

}