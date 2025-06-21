import { faClockRotateLeft, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { Link } from "react-router-dom";

export default function HistoriqueEmploisDuTempsDesFormateurs() {
  return (
    <div className="lg:w-[93%] mx-auto  h-full lg:px-10 lg:py-5  p-5 ">
      <h1 className="lg:text-3xl font-bold">
        <FontAwesomeIcon
          className="mr-3 text-blue-500"
          icon={faClockRotateLeft}
        />
        Historique des emplois du temps des formateurs
      </h1>
      <div className="flex my-8">
        <Input
          placeholder="Enter le formateur..."
          className="!w-[500px] bg-gray-200"
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
            className=" bg-gray-200 px-5 py-2 rounded text-xl mx-3"
          >
            <option value="">Filter par Valide a partir de </option>
          </select>
        </div>
      </div>

      <div>
        <table className="w-full my-5">
          <thead>
            <tr className=" bg-gray-300 ">
              <th className=" lg:py-3 py-2 px-4 font-bold border">ID</th>
              <th className=" lg:py-3 py-2 px-4 font-bold border">
                Mle formateur
              </th>
              <th className=" lg:py-3 py-2 px-4 font-bold border">
                Prénom et nom
              </th>
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
            <tr>
              <td className=" lg:py-3 py-2 px-4 font-bold border">1</td>
              <td className=" lg:py-3 py-2 px-4 font-bold border">5678</td>
              <td className=" lg:py-3 py-2 px-4 font-bold border">
                Ahmed Naim
              </td>
              <td className=" lg:py-3 py-2 px-4 font-bold border">
                2025/04/27
              </td>
              <td className=" lg:py-3 py-2 px-4 font-bold border">20</td>
              <td className=" lg:py-3 py-2 px-4 font-bold border">
                <Link
                  to={
                    "/administrateur/afficher/afficher-emploi-du-temps-de-formateur"
                  }
                  className="px-3 py-2 bg-blue-500 rounded text-white"
                >
                  <FontAwesomeIcon className="mr-2" icon={faEye} />
                  Afficher
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
