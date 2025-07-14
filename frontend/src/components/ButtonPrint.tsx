import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function ButtonPrint({ timetableRef }: { timetableRef: React.RefObject<HTMLDivElement> | null }) {

  const handlePrint = () => {
    window.print()
    return
    
    // if(!timetableRef?.current){
    //     window.print()
    //     return
    // }

    // let printWindow = window.open('', '', 'height=600,width=800'); 
   
    // printWindow?.document.write("<html><head><title>Emploi du temps | Ista Cité de l'air</title>");
    // printWindow?.document.write('<link rel="stylesheet" href="styles.css">'); 
    // printWindow?.document.write('<link href="/path/to/tailwind.css" rel="stylesheet">');
    // printWindow?.document.write('</head><body>');
    // printWindow?.document.write(timetableRef.current.innerHTML)
    // printWindow?.document.write('</body></html>');

    // printWindow?.document.close()
    // printWindow?.print()

  }
 
  return (
    <button
      onClick={handlePrint}
      className="mr-5 bg-blue-500 px-4 py-2 rounded text-white hover:cursor-pointer text-xl "
    >
      <FontAwesomeIcon className="mr-3" icon={faPrint} />
      Imprimer
    </button>
  );
}
