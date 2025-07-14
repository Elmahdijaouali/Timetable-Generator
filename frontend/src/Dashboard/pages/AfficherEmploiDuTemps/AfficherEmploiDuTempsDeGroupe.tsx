import {
  faArrowLeft,
  faArrowRight,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import { useEffect, useRef, useState } from "react";
import PopupDeTelechargement from "../../../components/PopupDeTelechargement";
import { Link, useNavigate, useParams } from "react-router-dom";
import ButtonPrint from "../../../components/ButtonPrint";
import { handleDownloadPng } from "../../../utils/telechargementPng";
import TimetableGroup from "../../../components/TimetableGroup";
import api from "../../../api/apiConfig";

interface TimetableGroupData {
  groupe: string;
  valid_form: string;
  code_branch: string;
  niveau: string;
  timetable: any[];
  nbr_hours_in_week: number;
}

interface TimetableActive {
  id: number;
}

export default function AfficherEmploiDuTempsDeGroupe() {
  const [afficherPopup, setAfficherPopup] = useState(false);
  const [valuePopup, setValuePopup] = useState("png");
  const [handleLogicTelechargement, setHandleLogicTelechargement] = useState(
    () => () => {}
  );
  const { timetableId } = useParams();
  const [timetableGroup, setTimetableGroup] =
    useState<TimetableGroupData | null>(null);

  const timeShots = [
    "08:30-11:00",
    "11:00-13:30",
    "13:30-16:00",
    "16:00-18:30",
  ];
  const [timetablesActiveForGroups, setTimetableActiveForGroups] = useState<
    TimetableActive[]
  >([]);
  const timetableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleTelechargementEmploiDuTempsDeGroupe = () => {
    setAfficherPopup(true);
    setHandleLogicTelechargement(() => () => {
      if (valuePopup === "png") {
        if (timetableGroup) {
          handleDownloadPng(timetableGroup, timetableRef);
        }
      }
    });
  };

  const fetchData = async () => {
    try {
      const res = await api.get(`/timetables/${timetableId}`);

      if (res && res.data) {
        setTimetableGroup(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDataTimetableActiveGroups = async () => {
    try {
      const res = await api.get("/timetables/groups");
      if (res && res.data) {
        setTimetableActiveForGroups(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleNavigatePrev = () => {
    const firstTimetableId = timetablesActiveForGroups.sort(
      (t1, t2) => t1.id - t2.id
    )[0]?.id;
    if (Number(timetableId) != firstTimetableId) {
      navigate(
        `/administrateur/afficher/afficher-emploi-du-temps-de-groupe/${
          Number(timetableId) - 1
        }`
      );
    }
  };

  const handleNavigateNext = () => {
    const lastTimetableId = timetablesActiveForGroups.sort(
      (t1, t2) => t2.id - t1.id
    )[0]?.id;
    // console.log(lastTimetableId)
    if (Number(timetableId) != lastTimetableId) {
      navigate(
        `/administrateur/afficher/afficher-emploi-du-temps-de-groupe/${
          Number(timetableId) + 1
        }`
      );
    }
  };

  useEffect(() => {
    fetchData();
    fetchDataTimetableActiveGroups();
    // console.log(timetableGroup);
  }, [timetableId]);
  return (
    <>
      <div className="flex justify-between absolute lg:w-[80%] lg:pl-5 h-[90vh] items-center">
        <FontAwesomeIcon
          className="text-3xl hover:cursor-pointer shadow  shadow-gray-500  text-blue-500 bg-gray-200 p-3  rounded-full"
          onClick={handleNavigatePrev}
          icon={faArrowLeft}
        />
        <FontAwesomeIcon
          className="text-3xl hover:cursor-pointer text-blue-500 bg-gray-200 p-3 shadow  shadow-gray-500 rounded-full"
          onClick={handleNavigateNext}
          icon={faArrowRight}
        />
      </div>
      <div className="lg:w-[98%] mx-auto  h-full lg:px-10 lg:py-5  p-5 ">
        <div className="flex relative z-10 justify-between">
          <Link
            to={"/administrateur/dashboard/emplois-du-temps-actif/groupes"}
            className=" bg-gray-500 px-5 py-2 flex items-center  hover:cursor-pointer rounded shadow text-white "
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Routern
          </Link>

          <div className="flex  items-center">
            <ButtonPrint timetableRef={timetableRef} />
            <button
              className="bg-green-500 block px-5 ml-auto py-2 hover:cursor-pointer text-xl text-white rounded shadow "
              onClick={handleTelechargementEmploiDuTempsDeGroupe}
            >
              <FontAwesomeIcon className="mr-2" icon={faDownload} />
              Télécharger
            </button>
          </div>
        </div>
        <TimetableGroup
          timetableRef={timetableRef}
          timetableGroup={timetableGroup}
        />
        {/* <div ref={timetableRef} className="p-5">
        <h1 className="text-center text-2xl font-bold">EMPLOI DU TEMPS</h1>
        <div className="flex justify-between my-5">
          <div>
            <p>
              EFP :{" "}
              <span className=" uppercase font-bold" style={{ color: "blue" }}>
                ista cité de l'air
              </span>
            </p>
            <p>
              Filiére :{" "}
              <span className=" font-bold" style={{ color: "blue" }}>
                {timetableGroup?.code_branch}
              </span>
            </p>
            <p>
              Niveau :{" "}
              <span className=" font-bold" style={{ color: "blue" }}>
                {timetableGroup?.niveau}
              </span>
            </p>
          </div>
          <div>
            <p>
              Année de formation :
              <span className=" font-bold" style={{ color: "blue" }}>
                2024-2025
              </span>
            </p>
            <br />
            <p>
              Groupe :{" "}
              <span className=" font-bold" style={{ color: "blue" }}>
                {timetableGroup?.groupe}{" "}
              </span>
            </p>
          </div>
        </div>
        <div>
          <table className="w-full ">
            <thead>
              <tr>
                <th style={{ background: '#9ca3af', color: '#fff' }} className="lg:px-5 lg:py-2 py-1 px-3 border w-[12%]"></th>
                <th style={{ background: '#9ca3af', color: '#fff' }} className="lg:px-5 lg:py-2 py-1 px-3 border w-[22%]">08:30-11:00</th>
                <th style={{ background: '#9ca3af', color: '#fff' }} className="lg:px-5 lg:py-2 py-1 px-3 border w-[22%]">11:00-13:30</th>
                <th style={{ background: '#9ca3af', color: '#fff' }} className="lg:px-5 lg:py-2 py-1 px-3 border w-[22%]">13:30-16:00</th>
                <th style={{ background: '#9ca3af', color: '#fff' }} className="lg:px-5 lg:py-2 py-1 px-3 border w-[22%]">16:00-18:30</th>
              </tr>
            </thead>
            <tbody>
              {timetableGroup.timetable && timetableGroup.timetable.map((day, index) => {
                const dayLabel = Object.keys(day)[0];
                const sessions = Object.values(day)[0];
                return (() => {
                  const renderCells = [];
                  let skipNext = false;
                  for (let i = 0; i < timeShots.length; i++) {
                    if (skipNext) { skipNext = false; continue; }
                    const timeshot = timeShots[i];
                    const currentSession = sessions?.find((s) => s.timeshot === timeshot);
                    const nextSession = sessions?.find((s) => s.timeshot === timeShots[i + 1]);
                    let merge = false;
                    if (currentSession && nextSession && currentSession.module === nextSession.module && currentSession.salle === nextSession.salle) {
                      merge = true;
                      skipNext = true;
                    }
                    renderCells.push(
                      <RenderTimeShot key={i} session={currentSession} mergeSession={merge} />
                    );
                  }
                  return (
                    <tr key={index}>
                      <td style={{ background: '#6b7280', color: '#fff' }} className="lg:px-5 lg:py-7 py-5 px-3 font-bold text-center border w-[12%]">
                        {dayLabel}
                      </td>
                      {renderCells}
                    </tr>
                  );
                })();
              })}
            </tbody>
          </table>
          <div className="flex justify-between">
            <p>
              Cet emploi du temps est valable _ partir du{" "}
              <span className=" font-bold" style={{ color: "blue" }}>
                {timetableGroup.valid_form}
              </span>
            </p>
            <p>
              {" "}
              Nombre d'heures:{" "}
              <span className=" font-bold " style={{ color: "blue" }}>
                {timetableGroup?.nbr_hours_in_week}
              </span>
            </p>
          </div>
        </div>
      </div> */}

        <PopupDeTelechargement
          afficherPopup={afficherPopup}
          setAfficherPopup={setAfficherPopup}
          valuePopup={valuePopup}
          setValuePopup={setValuePopup}
          handleLogicTelechargement={handleLogicTelechargement}
        />
      </div>
    </>
  );
}

// const RenderTimeShot = ({ dayData, timeshot, mergeSession }) => {
//   const session = dayData.find((session) => session.timeshot == timeshot);
//   if (!session) {
//     return <td className="lg:px-5 py-2 px-3  text-center border w-[12%]"></td>;
//   }

//   return (
//     <td
//       className={`lg:px-5 py-2 px-3  text-center border w-[12%] font `}
//       colSpan={mergeSession ? 2 : 1}
//       style={{ background: session.color }}
//     >
//       <span className=" font-semibold  ">{session.module}</span> <br />
//       {/* <span className=" font-semibold  ">{session.formateur.slice(session.formateur.indexOf(" ") , )}</span> <br /> */}
//       <span className=" font-semibold  ">{session.formateur}</span> <br />
//       <span className=" font-semibold  ">{session.salle}</span> <br />
//     </td>
//   );
// };
const RenderTimeShot = ({ session, mergeSession }) => {
  if (!session) {
    return <td style={{ background: '#f9fafb' }} className="lg:px-5 py-2 px-3 text-center border w-[12%]" />;
  }
  return (
    <td colSpan={mergeSession ? 2 : 1} className="lg:px-5 py-2 px-3 text-center border w-[12%]" style={{ background: session.color }}>
      <span style={{ color: '#111827', fontWeight: 600 }}>{session.module}</span> <br />
      <span style={{ color: '#111827', fontWeight: 600 }}>{session.formateur.slice(session.formateur.indexOf(" "))}</span> <br />
      <span style={{ color: '#111827', fontWeight: 600 }}>{session.salle}</span> <br />
    </td>
  );
};
