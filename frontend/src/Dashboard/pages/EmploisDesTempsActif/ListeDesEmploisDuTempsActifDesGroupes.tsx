import { faDownload, faEye, faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { Link } from "react-router-dom";
import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import { useContext, useEffect, useRef, useState } from "react";
import PopupDeTelechargement from "../../../components/PopupDeTelechargement";
import { filieresContext } from "../../../contextApi/filieresContext";
import { telechargeToutLesEmploisActifDesGroupesPngSurZip } from "../../../utils/telechargeToutLesEmploisActifDesGroupesPngSurZip";
import { handleNotification } from "../../../utils/notification";
import api from "../../../api/apiConfig";

export default function ListeDesEmploisDuTempsActifDesGroupes() {
  const [timetablesActiveForGroups, setTimetableActiveForGroups] = useState([]);
  const [timetablesActiveForGroupsFilter, setTimetableActiveForGroupsFilter] =
    useState([]);
  const [afficherPopup, setAfficherPopup] = useState(false);
  const [valuePopup, setValuePopup] = useState("png");
  const [handleLogicTelechargement, setHandleLogicTelechargement] = useState(
    () => () => {}
  );
  const [valueInputSearch, setValueInputSearch] = useState("");
  const { filiers } = useContext(filieresContext);

  const handleSearch = (e) => {
    const code_groupe = e.target.value;
    const groupesAfterFilter = timetablesActiveForGroups.filter((groupe) =>
      groupe.groupe.toLowerCase().includes(code_groupe.toLowerCase())
    );

    setTimetableActiveForGroupsFilter(groupesAfterFilter);
  };

  const handleFilterByFilier = (e) => {
    const code_branch = e.target.value;
    if (code_branch == "") {
      setTimetableActiveForGroupsFilter(timetablesActiveForGroups);
    } else {
      const groupesAfterFilter = timetablesActiveForGroups.filter(
        (groupe) => groupe.code_branch == code_branch
      );

      setTimetableActiveForGroupsFilter(groupesAfterFilter);
    }
  };

  const handleTelechargementListeEmploisDuTempsActifDesGroupes = () => {
    setAfficherPopup(true);
    setHandleLogicTelechargement(() => () => {
      if (valuePopup == "png") {
        telechargeToutLesEmploisActifDesGroupesPngSurZip(
          timetablesActiveForGroups
        );
        handleNotification(
          "Téléchargment des emplois du temps",
          "téléchargment des emplois du temps actif des groups dans dossier seccès "
        );
      }
    });
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/timetables/groups");
      if (res && res.data) {
        setTimetableActiveForGroups(res.data);
        setTimetableActiveForGroupsFilter(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="lg:w-[93%] mx-auto  h-full lg:px-10 lg:py-5  p-5 ">
      <ButtonNavigateBack />
      <div className="flex mt-3 justify-between items-center">
        <h1 className="lg:text-3xl font-bold">
          <FontAwesomeIcon className="text-blue-500 mr-3 " icon={faList} />
          Les emplois du temps des groupes
        </h1>
        <button
          className="bg-green-500 px-5 py-2 text-xl hover:cursor-pointer text-white rounded shadow "
          onClick={handleTelechargementListeEmploisDuTempsActifDesGroupes}
        >
          <FontAwesomeIcon className="mr-2" icon={faDownload} />
          Télécharger
        </button>
      </div>
      <div className="my-10">
        <div className="flex">
          <Input
            placeholder="Enter le code groupe..."
            className="!w-[500px] bg-gray-200"
            value={valueInputSearch}
            type="search"
            onChange={(e) => {
              setValueInputSearch(e.target.value);
              handleSearch(e);
            }}
          />
          <Button label="Chercher" />
          <div className="ml-auto">
            <select
              name=""
              id=""
              className=" bg-gray-200 px-10 py-2 rounded text-xl mx-3"
              onChange={handleFilterByFilier}
            >
              <option value="">Filiter par filiére</option>

              {filiers &&
                filiers.map((filier) => {
                  return (
                    <option
                      onKeyDown={filier.id}
                      value={filier.code_branch}
                      key={filier.id}
                    >
                      {filier.label}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>
      </div>
      <div>
        <table className="w-full my-5">
          <thead>
            <tr className=" bg-gray-300 ">
              <th className=" lg:py-3 py-2 px-4 font-bold border">ID</th>
              <th className=" lg:py-3 py-2 px-4 font-bold border">
                Code groupe
              </th>
              <th className=" lg:py-3 py-2 px-4 font-bold border">Filiére</th>
              <th className=" lg:py-3 py-2 px-4 font-bold border">
                Valide a partir de
              </th>
              <th className=" lg:py-3 py-2 px-4 font-bold border">
                Nombre d'heures
              </th>

              <th className=" lg:py-3 py-2 px-4 font-bold border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timetablesActiveForGroupsFilter &&
              timetablesActiveForGroupsFilter.map((timetable) => {
                return (
                  <tr key={timetable.id}>
                    <td className=" lg:py-3 py-2 px-4 font-bold border">
                      {timetable.id}
                    </td>
                    <td className=" lg:py-3 py-2 px-4 font-bold border">
                      {timetable.groupe}
                    </td>
                    <td className=" lg:py-3 py-2 px-4 font-bold border">
                      {timetable.label_branch}
                    </td>
                    <td className=" lg:py-3 py-2 px-4 font-bold border">
                      {timetable.valid_form}
                    </td>
                    <td className=" lg:py-3 py-2 px-4 font-bold border">
                      {timetable.nbr_hours_in_week}
                    </td>
                    <td className=" lg:py-3 py-2 px-4 font-bold border">
                      <Link
                        to={`/administrateur/afficher/afficher-emploi-du-temps-de-groupe/${timetable.id}`}
                        className="px-3 py-2 bg-blue-500 rounded text-white"
                      >
                        <FontAwesomeIcon className="mr-2" icon={faEye} />
                        Afficher
                      </Link>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <PopupDeTelechargement
        afficherPopup={afficherPopup}
        setAfficherPopup={setAfficherPopup}
        valuePopup={valuePopup}
        setValuePopup={setValuePopup}
        handleLogicTelechargement={handleLogicTelechargement}
      />
      <div className="h-[20vh]"></div>
    </div>
  );
}
