import { Link } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import { filieresContext } from "../../../contextApi/filieresContext";
import api from "../../../api/apiConfig";

interface Group {
  id: number;
  code_group: string;
  branch: string;
}

interface Filiere {
  id: number;
  code_branch: string;
  label: string;
}

export default function ListeDesGroupesPourPersenaliserLesNombresHeuresParSemaine() {
  const [groupes, setGroupes] = useState<Group[]>([]);
  const [groupesFilter, setGroupesFilter] = useState<Group[]>([]);
  const [valueInputSearch, setValueInputSearch] = useState("");
  const { filiers }: { filiers: Filiere[] } = useContext(filieresContext);

  const fetchData = async () => {
    try {
      const res = await api.get("/groups");

      if (res && res.data) {
        setGroupes(res.data);
        setGroupesFilter(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = (code_groupe: string) => {
    const groupesAfterFilter = groupes.filter((groupe) =>
      groupe.code_group.toLowerCase().includes(code_groupe.toLowerCase())
    );
    setGroupesFilter(groupesAfterFilter);
  };

  const handleFilterByFilier = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code_branch = e.target.value;

    if (code_branch == "") {
      setGroupesFilter(groupes);
    } else {
      const groupesAfterFilter = groupes.filter(
        (groupe) => groupe.branch == code_branch
      );

      setGroupesFilter(groupesAfterFilter);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="lg:w-[93%] mx-auto  h-full lg:px-10 lg:py-5  p-5 ">
      <ButtonNavigateBack />
      <h2 className="text-xl mt-5 font-bold mb-5">
        <FontAwesomeIcon
          className="mr-3 text-blue-500 text-3xl"
          icon={faClock}
        />
        les nombres d'heures par semaine{" "}
      </h2>
      <div className="flex items-center">
        <Input
          placeholder="Enter le code groupe..."
          className="!w-[500px]"
          value={valueInputSearch}
          onChange={(e) => {
            setValueInputSearch(e.target.value);
            handleSearch(e.target.value);
          }}
          type="text"
          name="search"
          id="search"
        />
        <Button
          label="Chercher"
          onClick={() => {}}
          className="bg-blue-500 text-white px-4"
        />
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
                  <option value={filier.code_branch} key={filier.id}>
                    {filier.label}
                  </option>
                );
              })}
          </select>
        </div>
      </div>
      <div className="my-5 ">
        {groupesFilter &&
          groupesFilter.map((groupe) => {
            return (
              <div className="flex justify-between p-5 rounded-2xl bg-gray-400 my-3 lg:px-20 ">
                <p className="min-w-[300px] text-center py-2 rounded text-xl bg-white">
                  {groupe.code_group}
                </p>
                <div className="flex items-center">
                  <Link
                    to={`/administrateur/parameters/persenaliser-les-nomber-d-heures/${groupe.id}`}
                    className=" bg-blue-500 px-8 mx-5 py-2 hover:cursor-pointer text-xl rounded text-white"
                  >
                    Persenaliser
                  </Link>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
