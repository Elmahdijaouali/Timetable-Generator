import { NavLink } from "react-router-dom";
import Button from "../../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faHouse,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import PopupSuccess from "../../../components/PopupSuccess";
import PopupError from "../../../components/PopupError";
import api from "../../../api/apiConfig";

interface Salle {
  id: number;
  label: string;
  formateur1: string;
  formateur2: string;
}

export default function Salles() {
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState("");
  const [afficherPopupSuccess, setAfficherPopupSuccess] = useState(false);
  const [afficherPopupError, setAfficherPopupError] = useState(false);
  const [fileKey, setFileKey] = useState(Date.now());
  const fileinputRef = useRef<HTMLInputElement>(null);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [sallesFilter, setSallesFilter] = useState<Salle[]>([]);
  const [valueInputSearch, setValueInputSearch] = useState("");

  const handleImportFileExcelDataClassrooms = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (e.target.files) {
        formData.append("file", e.target.files[0]);
      }

      const res = await api.post("/import-data-classroom", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res && res.data && res.data.message) {
        setLoading(false);
        setAfficherPopupSuccess(true);
        setMessageSuccess("succès la importation des données les salles ");
      }
    } catch (err) {
      if ((err as any).response && (err as any).response.data && (err as any).response.data.errors) {
        setErrors((err as any).response.data.errors);
        setAfficherPopupError(true);
      }
      setLoading(false);
    } finally {
      if (fileinputRef.current) {
        fileinputRef.current.value = "";
      }
      setFileKey(Date.now());
    }
  };

  // handle fetch les salles
  const fetchSalles = async () => {
    try {
      const res = await api.get("/classrooms");
      if (res && res.data) {
        setSalles(res.data);
        setSallesFilter(res.data);
      }
    } catch (err) {
      // console.log("Error", err);
    }
  };

  // handle search les salle by label salle
  const handleSearchSalle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    setValueInputSearch(label);
    const sallesAfterFilter = salles.filter((salle) =>
      salle.label.toLowerCase().includes(label.toLowerCase())
    );
    setSallesFilter(sallesAfterFilter);
    if (label.trim() == "") {
      setSallesFilter(salles);
    }
  };

  useEffect(() => {
    if (afficherPopupSuccess) {
      setTimeout(() => {
        setAfficherPopupSuccess(false);
      }, 3000);
    }
    if (afficherPopupError) {
      setTimeout(() => {
        setAfficherPopupError(false);
      }, 3000);
    }

    fetchSalles();
  }, [afficherPopupSuccess, afficherPopupError]);
  return (
    <div className="lg:w-[96%] h-full p-10 ">
      <div className="flex justify-between items-center">
        <h1 className="lg:text-3xl flex items-center  font-bold">
          <FontAwesomeIcon className="text-blue-500 mr-2" icon={faHouse} />
          Salles
        </h1>
        <div className=" ">
          <label
            htmlFor="file"
            className="mx-2 lg:px-8 px-3 lg:py-3 py-2 font-bold hover:cursor-pointer rounded-md bg-blue-500 !text-white shadow-xl"
          >
            {loading ? (
              <FontAwesomeIcon
                className=" lg:text-xl  mr-2 "
                icon={faSpinner}
                spin
              />
            ) : (
              <FontAwesomeIcon
                className=" lg:text-xl  mr-2 "
                icon={faCloudArrowUp}
              />
            )}
            Importation
            <input
              className="hidden"
              accept=".xlsx,.xls"
              ref={fileinputRef}
              onChange={handleImportFileExcelDataClassrooms}
              type="file"
              key={fileKey}
              name="file"
              id="file"
            />
          </label>
          <NavLink
            className={
              "mx-2 lg:px-5 px-3 lg:py-3 py-2 font-bold rounded-md bg-green-500 text-white shadow-xl"
            }
            to={"/administrateur/ajouter-salle"}
          >
            <FontAwesomeIcon
              className=" lg:text-xl font-bold  mr-3 "
              icon={faPlus}
            />
            Ajouter
          </NavLink>
        </div>
      </div>
      <div>
        <input
          type="search"
          placeholder="Enter label salle..."
          className="bg-gray-100 px-5 py-2  lg:w-[30%] mt-5 shadow-xl"
          onChange={handleSearchSalle}
          value={valueInputSearch}
        />
        <Button
          label="chercher"
          onClick={() => {}}
          className="bg-blue-500 text-white px-4"
        />
      </div>
      <table className="w-full my-5">
        <thead>
          <tr className=" bg-gray-300 ">
            <th className=" lg:py-3 py-2 px-4 font-bold border">ID</th>
            <th className=" lg:py-3 py-2 px-4 font-bold border">label salle</th>
            <th className=" lg:py-3 py-2 px-4 font-bold border">Formateur 1</th>
            <th className=" lg:py-3 py-2 px-4 font-bold border">Formateur 2</th>
            <th className=" lg:py-3 py-2 px-4 font-bold border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sallesFilter &&
            sallesFilter.map((salle) => {
              return (
                <tr key={salle.id}>
                  <td className=" lg:py-3 py-2 px-4 font-bold border">
                    {salle.id}
                  </td>
                  <td className=" lg:py-3 py-2 px-4 font-bold border">
                    {salle.label}
                  </td>
                  <td className=" lg:py-3 py-2 px-4 font-bold border">
                    {salle.formateur1}
                  </td>
                  <td className=" lg:py-3 py-2 px-4 font-bold border">
                    {salle.formateur2}
                  </td>
                  <td className=" lg:py-3 py-2 px-4 font-bold border">
                    Actions
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <PopupSuccess
        afficherPopupSuccess={afficherPopupSuccess}
        messageSuccess={messageSuccess}
        setAfficherPopupSuccess={setAfficherPopupSuccess}
        setAfficherPopupError={setAfficherPopupError}
      />
      <PopupError afficherPopupError={afficherPopupError} errors={errors} setAfficherPopupError={setAfficherPopupError} />
      <div className="h-[20vh]"></div>
    </div>
  );
}
