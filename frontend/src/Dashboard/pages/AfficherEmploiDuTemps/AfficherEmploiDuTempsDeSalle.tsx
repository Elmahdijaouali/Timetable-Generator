import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import { useEffect, useRef, useState } from "react";
import PopupDeTelechargement from "../../../components/PopupDeTelechargement";
import { useParams } from "react-router-dom";
import api from "../../../api/apiConfig";
import TimetableSalle from "../../../components/TimetableSalle";
import { handleDownloadTimetableSallePng } from "../../../utils/telechargementPng";
import ButtonPrint from "../../../components/ButtonPrint";

interface TimetableSalleData {
  salle: string;
  timetable: any[];
  valid_form: string;
  nbr_hours_in_week: number;
}

export default function AfficherEmploiDuTempsDeSalle() {
  const [afficherPopup, setAfficherPopup] = useState(false);
  const [valuePopup, setValuePopup] = useState("png");
  const [handleLogicTelechargement, setHandleLogicTelechargement] = useState(
    () => () => {}
  );
  const { salleId } = useParams();
  const [timetableSalle, setTimetableSalle] =
    useState<TimetableSalleData | null>(null);
  const timetableRef = useRef<HTMLDivElement>(null);

  const handleTelechargementEmploiDuTempsDeSalle = () => {
    setAfficherPopup(true);
    setHandleLogicTelechargement(() => () => {
      if (valuePopup == "png") {
        if (timetableSalle) {
          handleDownloadTimetableSallePng(timetableSalle, timetableRef);
        }
      }
    });
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/classrooms-timetable/" + salleId);

      if (res && res.data) {
        setTimetableSalle(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [salleId]);
  return (
    <div className="lg:w-[93%] mx-auto  h-full lg:px-10 lg:py-5  p-5 ">
      <div className="flex justify-between">
        <ButtonNavigateBack />

        <div className="flex ">
          <ButtonPrint timetableRef={timetableRef} />
          <button
            className="bg-green-500 block px-5 ml-auto py-2 hover:cursor-pointer text-xl text-white rounded shadow "
            onClick={handleTelechargementEmploiDuTempsDeSalle}
          >
            <FontAwesomeIcon className="mr-2" icon={faDownload} />
            Télécharger
          </button>
        </div>
      </div>
      <TimetableSalle
        timetableSalle={timetableSalle}
        timetableRef={timetableRef}
      />
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

const RenderTimeShot = ({ session, mergeSession }) => {
  if (!session) {
    return <td className="lg:px-5 py-2 px-3 text-center border w-[12%]"></td>;
  }

  return (
    <td
      colSpan={mergeSession ? 2 : 1}
      className="lg:px-5 py-2 px-3 text-center border w-[12%]"
      style={{ background: session.color }}
    >
      <span className="font-semibold">{session.module}</span> <br />
      <span className=" font-semibold  ">
        {session.formateur.slice(session.formateur.indexOf(" "))}
      </span>{" "}
      <br />
      <span className="font-semibold">{session.salle}</span> <br />
    </td>
  );
};
