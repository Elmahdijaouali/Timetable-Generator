import {
  faCalendar,
  faCircleExclamation,
  faClock,
  faGear,
  faList,
  faSpinner,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
// import Input from "../../../components/Input";
// import Button from "../../../components/Button";
import PopupError from "../../../components/PopupError";
import PopupSuccess from "../../../components/PopupSuccess";
import { useEffect, useState } from "react";
import api from "../../../api/apiConfig";

export default function Parameter() {
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState("");
  const [afficherPopupSuccess, setAfficherPopupSuccess] = useState(false);
  const [afficherPopupError, setAfficherPopupError] = useState(false);

  const handleGenererLesEmploisDuTempsDesFormateur = async () => {
    try {
      setLoading(true);
      const res = await api.post("/generate-timetable-formateurs");

      if (res && res.data && res.data.message) {
        setAfficherPopupSuccess(true);
        setMessageSuccess(res.data.message);
        handleNotification("Générer les emplois du temps", res.data.message);
      }
    } catch (err: any) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.errors) {
        setAfficherPopupError(true);
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotification = (title: string, body: string) => {
    // alert('test')
    Notification.requestPermission().then(() => {
      new Notification(title, {
        body: body,
        icon: "/logo.png",
      });
    });
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
  }, [afficherPopupSuccess, afficherPopupError]);
  return (
    <div className="lg:w-[93%] mx-auto  h-full lg:px-10 lg:py-5  p-5 ">
      <h1 className="lg:text-3xl font-bold">
        <FontAwesomeIcon className="mr-3 text-blue-500" icon={faGear} />
        Les Parameters
      </h1>

      <div className="bg-gray-300  p-5 rounded m-5">
        <h2 className="text-xl font-bold mb-5">
          <FontAwesomeIcon
            className="mr-3 text-blue-500 text-3xl"
            icon={faCircleExclamation}
          />
          Les contrantes
        </h2>
        <p className="px-4 mx-5 py-3 ">
          Pour créer un emploi du temps, il faut tenir compte de plusieurs
          contraintes. Certains groupes sont en stage à certaines périodes, donc
          ils ne sont pas disponibles. Il y a aussi des salles occupées ou non
          disponibles, ce qui limite les choix. Enfin, certains formateurs ne
          sont pas disponibles à certains moments.
        </p>
        <Link
          to={"/administrateur/parameters/groupes-en-stage"}
          className=" block w-[300px] bg-blue-500 text-white  px-5 py-3 my-2 ml-10 rounded text-xl hover:cursor-pointer"
        >
          Les groupes en stage
        </Link>
        <Link
          to={"/administrateur/parameters/formateurs-no-disponible"}
          className=" block w-[300px] bg-blue-500 text-white  px-5 py-3 my-2 ml-10 rounded text-xl hover:cursor-pointer "
        >
          Les formateur no disponible
        </Link>
        <Link
          to={"/administrateur/parameters/salles-no-disponible"}
          className=" block w-[300px] bg-blue-500 text-white  px-5 py-3 my-2 ml-10 rounded text-xl hover:cursor-pointer "
        >
          Les salle no disponible
        </Link>
      </div>

      <div className="bg-gray-300  p-10 rounded m-5">
        <h2 className="text-xl font-bold mb-5">
          <FontAwesomeIcon
            className="mr-3 text-blue-500 text-3xl"
            icon={faClock}
          />
          Le nombre d'heures par module, par semaine et par groupe
        </h2>
        <p className="px-4 mx-5 py-3 ">
          Le nombre d'heures par semaine peut varier en fonction des besoins
          spécifiques de chaque groupe. Il est important de respecter ces durées
          pour garantir une répartition équitable du temps de formation. Ces
          horaires peuvent être ajustés selon les priorités et les exigences de
          votre organisation.
        </p>
        <Link
          to={
            "/administrateur/parameters/liste-des-groupes-pour-persenaliser-nombers-heures-par-semaine"
          }
          className="block w-fit my-3 hover:cursor-pointer bg-blue-500 px-4 mx-5 py-3  text-xl rounded text-white"
        >
          <div className="flex items-center">
            <div>
              <FontAwesomeIcon className="mr-3 text-2xl" icon={faList} />
            </div>
            <div>
              <p>
                la liste des groupes pour persenaliser les nombres heures par
                semaine
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-gray-300  p-10 rounded m-5">
        <h2 className="text-xl font-bold mb-5">
          <FontAwesomeIcon
            className="mr-3 text-blue-500 text-3xl"
            icon={faClock}
          />
          les nombres d'heures par module par semaine par fuision , les séance à
          distance{" "}
        </h2>
        <p className="px-4 mx-5 py-3 ">
          Le nombre d'heures par semaine peut varier en fonction des besoins
          spécifiques de chaque groupe. Il est important de suivre ces heures
          pour garantir une répartition équitable du temps de travail . Vous
          pouvez ajuster ces horaires en fonction des priorités et des exigences
          de votre organisation.
        </p>
        <Link
          to={
            "/administrateur/parameters/liste-des-groupes-pour-persenaliser-nombers-heures-par-semaine-par-fuision"
          }
          className="block w-fit my-3 hover:cursor-pointer bg-blue-500 px-4 mx-5 py-3  text-xl rounded text-white"
        >
          <div className="flex items-center">
            <div>
              <FontAwesomeIcon className="mr-3 text-2xl" icon={faList} />
            </div>
            <div>
              <p>
                la liste des fuisions pour persenaliser les nombres heures par
                semaine
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-gray-300  p-10 rounded m-5">
        <h2 className="text-xl font-bold mb-5">
          <FontAwesomeIcon
            className="mr-3 text-blue-500 text-3xl"
            icon={faCalendar}
          />
          Générer les emplois du temps les formateurs sans groupes
        </h2>
        <p className="px-4 mx-5 py-3 ">
          Cette fonctionnalité vous permet de générer les emplois du temps des
          formateurs pour l'année
        </p>
        <div>
          <button
            onClick={handleGenererLesEmploisDuTempsDesFormateur}
            className="block  w-[410px] text-start my-3 hover:cursor-pointer bg-blue-500 px-4 mx-5 py-3  text-xl rounded text-white"
          >
            {loading ? (
              <FontAwesomeIcon className=" mr-3" icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon className=" mr-3" icon={faWandMagicSparkles} />
            )}
            Générer les emplois du temps
          </button>

          <Link
            to={
              "/administrateur/parameters/liste-des-emplois-du-temps-en-année"
            }
            className="block w-[410px] my-3 hover:cursor-pointer bg-blue-500 px-4 mx-5 py-3  text-xl rounded text-white"
          >
            <FontAwesomeIcon className="mr-3" icon={faList} />
            la liste des emplois du temps en année
          </Link>
        </div>
      </div>
      <div className="h-44"></div>

      <PopupSuccess
        afficherPopupSuccess={afficherPopupSuccess}
        messageSuccess={messageSuccess}
      />
      <PopupError afficherPopupError={afficherPopupError} errors={errors} />
    </div>
  );
}
