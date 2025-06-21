import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import {
  faList,
  faPlus,
  faSquarePlus,
  faUsersLine,
} from "@fortawesome/free-solid-svg-icons";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { useEffect, useState } from "react";
import api from "../../../api/apiConfig";

interface Formateur {
  id: number;
  name: string;
}

export default function FormateursNoDisponbile() {
  const [formateursNonDisponible, setFormateursNonDisponible] = useState<
    Formateur[]
  >([]);
  const [valueInputSearch, setValueInputSearch] = useState("");
  const [
    formateursNonDisponibleAfterFilter,
    setFormateursNonDisponibleAfterFilter,
  ] = useState<Formateur[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [formateur, setFormateur] = useState({
    formateurId: "",
  });

  const fetchListDesFormateur = async () => {
    try {
      const res = await api.get("/formateurs-disponible");
      if (res && res.data) {
        setFormateurs(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchData = async () => {
    try {
      const res = await api.get("/formateurs-non-disponible");
      if (res && res.data) {
        setFormateursNonDisponible(res.data);
        setFormateursNonDisponibleAfterFilter(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleAddFormateurTolistFormateurNoAvailable = async () => {
    if (!formateur.formateurId) {
      console.log("error , formateur id is required!!");
      return;
    }
    try {
      const res = await api.patch(
        `/formateurs-non-disponible/${formateur.formateurId}`,
        { is_available: false }
      );
      fetchData();
      fetchListDesFormateur();
      setFormateur({ ...formateur });
    } catch (err) {
      console.log(err);
    }
  };
  const handleUpdateDisponiblteFormateur = async (formateurId: number) => {
    try {
      await api.patch(`/formateurs-non-disponible/${formateurId}`, {
        is_available: true,
      });
      fetchData();
      fetchListDesFormateur();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value == "") {
      setFormateursNonDisponibleAfterFilter(formateursNonDisponible);
    }
    setValueInputSearch(value);
    const arrayFormateursNonDisponibleAfterFilter =
      formateursNonDisponible.filter((formateur) =>
        formateur.name.toLowerCase().includes(value.toLowerCase())
      );
    setFormateursNonDisponibleAfterFilter(
      arrayFormateursNonDisponibleAfterFilter
    );
  };
  useEffect(() => {
    fetchData();
    fetchListDesFormateur();
  }, []);
  return (
    <div className="lg:w-[93%] mx-auto relative h-full lg:px-10 lg:py-5  p-5 ">
      <ButtonNavigateBack />
      <h1 className="lg:text-3xl font-bold my-5">
        <FontAwesomeIcon className="text-blue-500 mr-3" icon={faUsersLine} />
        Les formateur non disponible
      </h1>

      <div className="bg-gray-200 lg:w-[50%] w-full rounded shadow p-5 my-5">
        <h2 className="text-xl font-bold">
          <FontAwesomeIcon
            className="text-blue-500 text-2xl mr-3"
            icon={faSquarePlus}
          />
          Ajouter un formateur dans la liste des formateurs non disponible
        </h2>
        <div className="ml-10 my-5">
          <label htmlFor="formateurId" className=" font-bold text-xl">
            Formateur :
          </label>
          <select
            name="formateurId"
            id=""
            className="bg-gray-50 px-10 ml-10 py-2 rounded "
            onChange={(e) =>
              setFormateur({ ...formateur, formateurId: e.target.value })
            }
            value={formateur.formateurId}
          >
            <option value="">Choix le formateur</option>

            {formateurs &&
              formateurs.map((formateur) => {
                return <option value={formateur.id}>{formateur.name}</option>;
              })}
          </select>
        </div>
        <button
          className=" bg-green-500 hover:cursor-pointer  font-bold text-white rounded px-5 py-2"
          onClick={handleAddFormateurTolistFormateurNoAvailable}
        >
          <FontAwesomeIcon className="mr-2" icon={faPlus} />
          Ajouter
        </button>
      </div>
      <div className="bg-gray-200  rounded shadow p-5 my-5">
        <h2 className="text-xl font-bold my-2">
          <FontAwesomeIcon className="text-blue-500 mr-3 " icon={faList} />
          La liste des formateurs non disponible
        </h2>
        <div className="flex">
          <Input
            placeholder="Enter le nom de formateur ..."
            className="!w-[500px] bg-white"
            value={valueInputSearch}
            onChange={handleSearch}
            type="text"
            name="search"
            id="search"
          />
          <Button
            label="Chercher"
            onClick={() => {}}
            className="bg-blue-500 text-white px-4"
          />
        </div>
        <div>
          {formateursNonDisponibleAfterFilter &&
            formateursNonDisponibleAfterFilter.map((formateur) => {
              return (
                <div className="flex justify-between items-center p-5 rounded-2xl bg-gray-400 my-3 lg:px-20 ">
                  <p className="min-w-[300px] text-center py-2 rounded text-xl bg-white">
                    {formateur.name}
                  </p>
                  <button
                    className=" bg-blue-500 hover:cursor-pointer px-8 mx-5 py-2  text-xl rounded text-white"
                    onClick={() =>
                      handleUpdateDisponiblteFormateur(formateur.id)
                    }
                  >
                    Disponible
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
