import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import {
  faClose,
  faList,
  faPeopleGroup,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import { useContext, useEffect, useState } from "react";
import { filieresContext } from "../../../contextApi/filieresContext";
import api from "../../../api/apiConfig";

interface Filiere {
  id: number;
  label: string;
}

interface Group {
  id: number;
  code_group: string;
  branchId: number;
}

interface Stage {
  id: number;
  group: Group;
  date_start: string;
  date_fin: string;
}

export default function GroupesEnStage() {
  const { filiers }: { filiers: Filiere[] } = useContext(filieresContext);
  const [groupesEnStage, setGroupesEnStage] = useState<Stage[]>([]);
  const [dipslayFormAjouterGroupEnStage, setDipslayFormAjouterGroupEnStage] =
    useState(false);
  const [formAjouterGroupeEnStage, setFormAjouterGroupeEnStage] = useState({
    groupId: "",
    date_start: "",
    date_fin: "",
  });
  const [groupes, setGroupes] = useState<Group[]>([]);
  const [groupsEnStageAfterFilter, setGroupsEnStageAfterFilter] = useState<
    Stage[]
  >([]);

  const [errors, setErrors] = useState("");

  const handleFilterByFilier = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value == "") {
      setGroupsEnStageAfterFilter(groupesEnStage);
    }
    const groupsEnStageAfterFilter = groupesEnStage.filter(
      (stage) => stage.group.branchId == Number(value)
    );
    setGroupsEnStageAfterFilter(groupsEnStageAfterFilter);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setErrors("");
    setFormAjouterGroupeEnStage({
      ...formAjouterGroupeEnStage,
      [e.target.name]: e.target.value,
    });
  };

  const handleAjoouterGroupeEnStage = async () => {
    try {
      setErrors("");
      const res = await api.post("/groups-en-stage", formAjouterGroupeEnStage);

      if (res && res.data) {
        fetchData();
        setDipslayFormAjouterGroupEnStage(false);
      }
    } catch (err: any) {
      if (err.response.data.errors) {
        setErrors(err.response.data.errors);
      }
      console.log(err);
    }
  };

  const fetchDataGroups = async () => {
    try {
      const res = await api.get("/groups");

      if (res && res.data) {
        setGroupes(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchData = async () => {
    try {
      const res = await api.get("/groups-en-stage");

      if (res && res.data) {
        setGroupesEnStage(res.data);
        setGroupsEnStageAfterFilter(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDataGroups();
  }, []);

  return (
    <div className="lg:w-[93%] lg:p-10 mx-auto  h-full lg:px-10 lg:py-5  p-5 ">
      <ButtonNavigateBack />
      <div className="flex mt-3 justify-between">
        <h1 className="lg:text-3xl font-bold">
          <FontAwesomeIcon className="mr-3" icon={faPeopleGroup} />
          Les groupes en stage
        </h1>

        <button
          onClick={() => setDipslayFormAjouterGroupEnStage(true)}
          className=" bg-green-500 font-bold hover:cursor-pointer text-white py-2 px-4 rounded my-5"
        >
          <FontAwesomeIcon className="mr-2" icon={faPlus} />
          Ajouter
        </button>
      </div>

      <div className="bg-gray-300  p-10 rounded m-5">
        <h2 className="text-xl font-bold mb-5">
          <FontAwesomeIcon className="text-blue-500 mr-3 " icon={faList} />
          La liste des groupes en stage
        </h2>
        <div className="flex">
          <Input
            placeholder="Enter le code groupe..."
            className="!w-[500px] bg-white"
            type="text"
            name="search"
            id="search"
            value=""
            onChange={() => {}}
          />
          <Button label="Chercher" />
          <div className="ml-auto">
            <select
              name=""
              id=""
              className=" bg-white px-10 py-2 rounded text-xl mx-3"
              onChange={handleFilterByFilier}
            >
              <option value="">Filiter par filiére</option>

              {filiers &&
                filiers.map((filier) => {
                  return (
                    <option
                      onKeyDown={filier.id}
                      value={filier.id}
                      key={filier.id}
                    >
                      {filier.label}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>
        <div className="py-5">
          {groupsEnStageAfterFilter &&
            groupsEnStageAfterFilter.map((stage) => {
              return (
                <div
                  key={stage.id}
                  className="flex justify-between items-center p-5 rounded-2xl bg-gray-400 my-3 lg:px-20 "
                >
                  <p className="min-w-[300px] text-center py-2 rounded text-xl bg-white">
                    {stage.group.code_group}
                  </p>
                  <p className=" text-xl">
                    Date en début :{" "}
                    <span>
                      {new Date(stage.date_start).toLocaleDateString()}
                    </span>
                  </p>
                  <p className=" text-xl">
                    Date en fin :{" "}
                    <span>{new Date(stage.date_fin).toLocaleDateString()}</span>
                  </p>
                </div>
              );
            })}
        </div>
      </div>

      {dipslayFormAjouterGroupEnStage && (
        <div className=" bg-gray-500/25 w-full h-[100%] flex justify-center items-center absolute top-0 left-0">
          <div className="bg-white relative w-[700px] min-h-[45vh] rounded shadow-2xl p-10">
            <FontAwesomeIcon
              onClick={() => setDipslayFormAjouterGroupEnStage(false)}
              icon={faClose}
              className=" absolute right-10 top-10 text-3xl hover:cursor-pointer"
            />
            <h1 className="text-4xl font-bold text-blue-500 text-center my-5 ">
              Ajouter groupe en stage{" "}
            </h1>
            {errors && (
              <p className="text-center py-3 px-5 bg-red-200 rounded text-red-500">
                {errors}
              </p>
            )}
            <div>
              <label htmlFor="">Groupe</label> <br />
              <select
                name="groupId"
                id=""
                value={formAjouterGroupeEnStage.groupId}
                className="w-full text-xl !bg-gray-200  py-2 rounded "
                onChange={handleChange}
              >
                <option value="">Choix le groupe</option>
                {groupes &&
                  groupes.map((groupe) => (
                    <option value={groupe.id}>{groupe.code_group}</option>
                  ))}
              </select>
            </div>

            <label htmlFor="">Date de debut</label>
            <Input
              name="date_start"
              type="date"
              value={formAjouterGroupeEnStage.date_start}
              onChange={handleChange}
              className="!bg-gray-200 text-xl"
              id="date_start"
              placeholder=""
            />
            <label htmlFor="">Date de fin</label>
            <Input
              name="date_fin"
              type="date"
              value={formAjouterGroupeEnStage.date_fin}
              onChange={handleChange}
              className="!bg-gray-200 text-xl"
              id="date_fin"
              placeholder=""
            />

            <div className="text-center">
              <Button
                label="Ajouter"
                onClick={handleAjoouterGroupeEnStage}
                className=" bg-green-500 w-[200px] my-5 font-bold hover:cursor-pointer text-white py-2 px-4 rounded "
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
