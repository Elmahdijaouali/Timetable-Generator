import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faDashboard } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import PopupDeTelechargement from "../components/PopupDeTelechargement";
import { useEffect, useState } from "react";
import ButtonTelechargementEmploisActif from "../components/ButtonTelechargementEmploisActif";
import { telechargeToutLesEmploisActifDesGroupesPngSurZip } from "../utils/telechargeToutLesEmploisActifDesGroupesPngSurZip";
import api from "../api/apiConfig";
import { telechargeToutLesEmploisActifDesFormateursPngSurZip } from "../utils/telechargeToutLesEmploisActifDesFormateursPngSurZip";
import { telechargeToutLesEmploisActifDesSallesPngSurZip } from "../utils/telechargeToutLesEmploisActifDesSallesPngSurZip";

export default function Dashboard() {
  const [afficherPopup, setAfficherPopup] = useState(false);
  const [valuePopup, setValuePopup] = useState("png");
  const [handleLogicTelechargement, setHandleLogicTelechargement] = useState(
    () => () => {}
  );
  const [timetablesActiveForGroups, setTimetableActiveForGroups] = useState([]);
  const [timetableActiveFormateurs , setTimetableActiveFormateurs ] = useState([])
  const [timetableActiveSalles , setTimetableActiveSalles ] = useState([])
 
  const handleTelechargementDesEmploisDuTempsActifDesGroupes = () => {
    setAfficherPopup(true);
    setHandleLogicTelechargement(() => () => {
      if (valuePopup == "png") {
        telechargeToutLesEmploisActifDesGroupesPngSurZip(timetablesActiveForGroups )
      }
    });
  };

  const handleTelechargementDesEmploisDuTempsActifDesFormateurs = () => {
    setAfficherPopup(true);
    setHandleLogicTelechargement(() => () => {
       if( valuePopup == 'png'){
          telechargeToutLesEmploisActifDesFormateursPngSurZip(timetableActiveFormateurs)
       }
    });
  };

  const handleTelechargementDesEmploisDuTempsActifDesSalles = () => {
    setAfficherPopup(true);
    setHandleLogicTelechargement(() => () => {
       if( valuePopup == 'png'){
          telechargeToutLesEmploisActifDesSallesPngSurZip(timetableActiveSalles)
       }
    });
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/timetables/groups");
      if (res && res.data) {
        setTimetableActiveForGroups(res.data);
      }

      const res2 = await api.get('/timetables/active/formateurs')
      if(res2 && res2.data){
        setTimetableActiveFormateurs(res2.data)
      }

      const res3 = await api.get('/classrooms-timetable')
      if(res3 && res3.data){
        setTimetableActiveSalles(res3.data)
      }

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(timetableActiveFormateurs)

  return (
    <div className="lg:w-[98%] h-full px-10 py-5">
      <h1 className="lg:text-3xl font-bold">
        <FontAwesomeIcon className="mr-2 text-blue-500" icon={faDashboard} />
        Tableau de bord
      </h1>
      <div className="py-5 xl:w-[78] lg:w-[83%] flex gap-10 justify-between">
        <NavLink
          to={"/administrateur/dashboard/emplois-du-temps-actif/groupes"}
          className="w-[33%] flex hover:shadow-2xl hover:cursor-pointer hover:bg-gray-400  bg-gray-300 text-black lg:p-10 p-5 rounded-2xl"
        >
          <FontAwesomeIcon
            className="text-center lg:text-4xl text-2xl mx-auto "
            icon={faCalendarDays}
          />
          <p className="lg:text-xl font-semibold text-center">
            Les emplois du temps des groupes actif
          </p>
        </NavLink>
        <NavLink
          to={"/administrateur/dashboard/emplois-du-temps-actif/formateurs"}
          className="w-[33%]  flex hover:shadow-2xl hover:cursor-pointer hover:bg-gray-400  bg-gray-300 text-black lg:p-10 p-5 rounded-2xl"
        >
          <FontAwesomeIcon
            className="text-center lg:text-4xl text-2xl mx-auto "
            icon={faCalendarDays}
          />
          <p className="lg:text-xl  font-semibold text-center">
            Les emplois du temps des formateurs actif
          </p>
        </NavLink>
        <NavLink
          to={"/administrateur/dashboard/emplois-du-temps-actif/salles"}
          className="w-[33%] flex   hover:shadow-2xl hover:cursor-pointer hover:bg-gray-400  bg-gray-300 text-black lg:p-10 p-5 rounded-2xl"
        >
          <FontAwesomeIcon
            className="text-center lg:text-4xl text-2xl mx-auto "
            icon={faCalendarDays}
          />
          <p className="lg:text-xl font-semibold text-center">
            Les emplois du temps des salles actif
          </p>
        </NavLink>
      </div>

      <div className="pb-5 xl:w-[78] lg:w-[83%] flex gap-10 justify-between">
        <ButtonTelechargementEmploisActif
          label="Exporter les emplois du temps actif des groupes"
          onClick={handleTelechargementDesEmploisDuTempsActifDesGroupes}
        />
        <ButtonTelechargementEmploisActif
          label="Exporter les emplois du temps actif des formateurs"
          onClick={handleTelechargementDesEmploisDuTempsActifDesFormateurs}
        />
        <ButtonTelechargementEmploisActif
          label="Exporter les emplois du temps actif des salles"
          onClick={handleTelechargementDesEmploisDuTempsActifDesSalles}
        />
      </div>

      <PopupDeTelechargement
        afficherPopup={afficherPopup}
        setAfficherPopup={setAfficherPopup}
        valuePopup={valuePopup}
        setValuePopup={setValuePopup}
        handleLogicTelechargement={handleLogicTelechargement}
      />
    </div>
  );
}
