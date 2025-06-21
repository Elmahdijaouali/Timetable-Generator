import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import {
  faList,
  faPlus,
  faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { useEffect, useState } from "react";
import api from "../../../api/apiConfig";

interface Salle {
  id: number;
  label: string;
}

export default function SallesNoDisponbile() {
  const [sallesNonDisponible, setSallesNonDisponible] = useState<Salle[]>([]);
  const [sallesNonDisponibleAfterFilter, setSallesNonDisponibleAfterFilter] =
    useState<Salle[]>([]);
  const [valueInputSearch, setValueInputSearch] = useState("");
  const [salles, setSalles] = useState<Salle[]>([]);
  const [salle, setSalle] = useState({
    salleId: "",
  });

  const fetchData = async () => {
    try {
      const res = await api.get("/classrooms-non-disponible");

      if (res && res.data) {
        setSallesNonDisponible(res.data);
        setSallesNonDisponibleAfterFilter(res.data);
      }

      const res2 = await api.get("/classrooms-disponible");
      if (res2 && res2.data) {
        setSalles(res2.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addSalleToListNoAvailable = async () => {
    if (!salle.salleId) {
      return;
    }
    try {
      await api.patch(`/classrooms-non-disponible/${salle.salleId}`, {
        is_available: false,
      });
      fetchData();
      setSalle({ ...salle });
    } catch (err) {
      console.log(err);
    }
  };

  const removeSalleFromListNoAvailable = async (salleId: number) => {
    if (!salle.salleId) {
      return;
    }
    try {
      await api.patch(`/classrooms-non-disponible/${salleId}`, {
        is_available: true,
      });

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValueInputSearch(value);
    if (!value.trim()) {
      setSallesNonDisponibleAfterFilter(sallesNonDisponible);
      return;
    }
    const arraySallesNoDisponibleAfterSearch = sallesNonDisponible.filter(
      (salle) => salle.label.toLowerCase().includes(value.toLowerCase())
    );

    setSallesNonDisponibleAfterFilter(arraySallesNoDisponibleAfterSearch);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="lg:w-[93%] mx-auto relative h-full lg:px-10 lg:py-5  p-5 ">
      <ButtonNavigateBack />
      <h1 className="lg:text-3xl font-bold my-5">Les salles no disponible</h1>

      <div className="bg-gray-200 lg:w-[50%] rounded shadow p-5 my-5">
        <h2 className="text-xl font-bold">
          <FontAwesomeIcon
            className="text-blue-500 text-2xl mr-3"
            icon={faSquarePlus}
          />
          Ajouter un salle dans la liste des salles no disponible
        </h2>
        <div className="ml-10 my-5">
          <label htmlFor="" className=" font-bold">
            Salle :
          </label>
          <select
            name=""
            id=""
            onChange={(e) => setSalle({ ...salle, salleId: e.target.value })}
            value={salle.salleId}
            className="bg-gray-50 px-10 ml-10 lg:w-[50%] py-2 rounded "
          >
            <option value="">Choix la salle</option>

            {salles &&
              salles.map((salle) => {
                return (
                  <option key={salle.id} value={salle.id}>
                    {salle.label}
                  </option>
                );
              })}
          </select>
        </div>
        <button
          onClick={addSalleToListNoAvailable}
          className=" bg-green-500 hover:cursor-pointer text-white rounded px-5 py-2"
        >
          <FontAwesomeIcon className="mr-2" icon={faPlus} />
          Ajouter
        </button>
      </div>
      <div className="bg-gray-200  rounded shadow p-5 my-5">
        <h2 className="text-xl font-bold my-2">
          <FontAwesomeIcon
            className="text-blue-500 text-2xl mr-3"
            icon={faList}
          />
          La liste des salles no disponible
        </h2>
        <div className="flex">
          <Input
            placeholder="Enter label de salle..."
            className="!w-[500px] bg-white"
            value={valueInputSearch}
            onChange={handleSearch}
          />
          <Button
            label="Chercher"
            onClick={() => {}}
            className="bg-blue-500 text-white px-4"
          />
        </div>
        <div>
          {sallesNonDisponibleAfterFilter &&
            sallesNonDisponibleAfterFilter.map((salle) => {
              return (
                <div
                  key={salle.id}
                  className="flex justify-between items-center p-5 rounded-2xl bg-gray-400 my-3 lg:px-20 "
                >
                  <p className="min-w-[300px] text-center py-2 rounded text-xl bg-white">
                    {salle.label}
                  </p>
                  <button
                    onClick={() => removeSalleFromListNoAvailable(salle.id)}
                    className=" bg-blue-500 hover:cursor-pointer px-8 mx-5 py-2  text-xl rounded text-white"
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
