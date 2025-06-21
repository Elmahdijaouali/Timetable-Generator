import {
  faArrowLeft,
  faArrowRight,
  faClockRotateLeft,
  faEye,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/apiConfig";

interface Timetable {
  id: number;
  groupe: string;
  label_branch: string;
  valid_form: string;
  nbr_hours_in_week: number;
}

export default function HistoriqueEmploisDuTempsDesGroups() {
  const [historicTimetablesGroups, setHistoricTimetablesGroups] = useState<
    Timetable[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [datesValidFrom, setDatesValidFrom] = useState<string[]>([]);

  const fetchData = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/historic-timetables/groups?page=${page}&limit=${limit}`
      );
      if (res && res.data) {
        setLoading(false);
        setHistoricTimetablesGroups(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const fetchDataDatesValidFrom = async () => {
    try {
      const res = await api.get("get-all-unique-valid-from-dates");
      if (res && res.data) {
        setDatesValidFrom(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData(page, limit);
    fetchDataDatesValidFrom();
  }, [page, limit]);

  return (
    <div className="lg:w-[93%] mx-auto  h-full lg:px-10 lg:py-5  p-5 ">
      <h1 className="lg:text-3xl font-bold">
        <FontAwesomeIcon
          className="mr-3 text-blue-500"
          icon={faClockRotateLeft}
        />
        Historique des emplois du temps des groupes
      </h1>

      <div className="flex  my-8">
        <Input
          placeholder="Enter code groupe..."
          className="!w-[500px] bg-gray-200"
          type="text"
          name="search"
          id="search"
          value=""
          onChange={() => {}}
        />
        <Button label="Chercher" />
        <div className="ml-auto flex">
          <select
            name=""
            id=""
            className=" bg-gray-200 px-5 py-2 rounded text-xl mx-3"
          >
            <option value="">Filter Valide a partir de </option>
            {datesValidFrom &&
              datesValidFrom.map((date, index) => {
                return (
                  <option value={date} key={index}>
                    {/* {new Date(date).toLocaleDateString()}  */}
                    {date}
                  </option>
                );
              })}
          </select>
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
            {historicTimetablesGroups &&
              historicTimetablesGroups.map((timetable) => {
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
                        to={`/administrateur/historique-emplois-du-temps-des-groups/${timetable.id}`}
                        className="px-3 py-2 bg-blue-500 rounded hover:cursor-pointer text-white"
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
        {totalPages > 1 && (
          <div className="ml-auto flex w-fit items-center">
            <button
              onClick={handlePrev}
              className=" bg-blue-500 hover:cursor-pointer mr-2 text-white px-5 py-2 rounded"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
              Prev
            </button>

            <span>
              {" "}
              Page {page} of {totalPages}{" "}
            </span>

            <button
              onClick={handleNext}
              className=" bg-blue-500 hover:cursor-pointer ml-2 text-white px-5 py-2 rounded"
            >
              Next
              <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
            </button>
          </div>
        )}

        {loading && (
          <div className="!w-[100%]  flex justify-center ">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-8xl    my-20  text-blue-500 "
              spin
            />
          </div>
        )}

        {historicTimetablesGroups.length === 0 && (
          <img
            src="/../images/empty.jpg"
            className=" w-[400px] mx-auto mt-20"
            alt="image empty"
          />
        )}
      </div>
    </div>
  );
}
