import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

export default function ButtonNavigateBack() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };
  return (
    <button
      className=" bg-gray-500 px-5 py-2 rounded shadow text-white hover:cursor-pointer"
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
      Routern
    </button>
  );
}
