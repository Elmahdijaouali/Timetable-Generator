export const handleNotification = (title : string , body : string) => {
   
     Notification.requestPermission().then(() => {
       new Notification( title ,
         { 
           body : body ,
           icon : '/logo.png',
         
         }
        )
     })
   }