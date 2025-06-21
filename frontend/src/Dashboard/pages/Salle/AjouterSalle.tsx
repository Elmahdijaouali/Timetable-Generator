import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Input from "../../../components/Input";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import { useEffect, useState } from "react";
import api from "../../../api/apiConfig";
import { useNavigate } from "react-router-dom";

interface Formateur {
  id: number;
  name: string;
}

export default function AjouterSalle() {
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [formData, setFormData] = useState({
    label: "",
    formateur1: "",
    formateur2: "",
  });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get("/formateurs");

      if (res && res.data) {
        setFormateurs(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addSalle = async () => {
    try {
      const res = await api.post("/add-classroom", formData);

      if (res && res.data) {
        navigate("/administrateur/salles");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="lg:w-[96%] h-full p-10 ">
      <ButtonNavigateBack />
      <form
        action=""
        className="bg-gray-100  rounded-xl shadow-2xl shadow-gray-400 lg:my-10 my-6  lg:w-[50%] mx-auto lg:p-10"
      >
        <h1 className="text-bold text-blue-500 text-center text-4xl font-bold  my-10">
          Ajouter un salle
        </h1>

        <div className="lg:my-3">
          <label htmlFor="nomComplet">Neméro salle</label> <br />
          <Input
            placeholder="Enter le neméro salle"
            className="w-full bg-white"
            name="label"
            onChange={handleChange}
            value={formData.label}
          />
        </div>
        <div className="lg:my-3">
          <label htmlFor="formateur1">Formateur 1</label> <br />
          <select
            onChange={handleChange}
            name="formateur1"
            value={formData.formateur1}
            id=""
            className=" bg-white py-2 w-full rounded px-2 text-xl"
          >
            <option value="">Choix le formateur 1</option>
            {formateurs &&
              formateurs.map((formateur) => {
                return (
                  <option key={formateur.id} value={formateur.id}>
                    {formateur.name}
                  </option>
                );
              })}
          </select>
        </div>
        <div className="lg:my-3">
          <label htmlFor="formateur2">Formateur 2</label> <br />
          <select
            onChange={handleChange}
            name="formateur2"
            id=""
            value={formData.formateur2}
            className=" bg-white py-2 w-full rounded px-2 text-xl"
          >
            <option value="">Choix le formateur 2</option>
            {formateurs &&
              formateurs.map((formateur) => {
                return (
                  <option key={formateur.id} value={formateur.id}>
                    {formateur.name}
                  </option>
                );
              })}
          </select>
        </div>

        <button
          onClick={addSalle}
          className=" bg-green-500 hover:cursor-pointer px-6 text-xl py-2 rounded text-white my-5"
        >
          <FontAwesomeIcon className="mr-2 " icon={faPlus} />
          Ajouter
        </button>
      </form>
    </div>
  );
}
