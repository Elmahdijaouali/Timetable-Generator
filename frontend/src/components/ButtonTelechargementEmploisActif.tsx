import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ButtonTelechargementEmploisActif({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="w-[33%] flex items-center  hover:shadow-2xl hover:cursor-pointer hover:bg-green-700  bg-green-600 text-white lg:p-10 p-5 rounded-2xl"
      onClick={onClick}
    >
      <FontAwesomeIcon
        className="text-center lg:text-4xl text-2xl mx-auto "
        icon={faDownload}
      />

      <p className="lg:text-xl font-semibold text-center">{label}</p>
    </button>
  );
}
