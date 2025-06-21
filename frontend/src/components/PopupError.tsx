import {
  faClose,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PopupError({
  afficherPopupError,
  setAfficherPopupError,
  errors = "",
}: {
  afficherPopupError: boolean;
  errors: string;
  setAfficherPopupError: (value: boolean) => void;
}) {
  if (!afficherPopupError) {
    return null;
  }

  return (
    <div
      className=" absolute left-0 bg-red-500/30 top-0 w-full h-full flex justify-between items-center "
      onClick={() => setAfficherPopupError(false)}
    >
      <div className="p-10 rounded-xl shadow-2xl shadow-red-500 mx-auto w-[500px] h-fit bg-white">
        <div className="flex justify-end">
          <FontAwesomeIcon
            className="ml-auto hover:cursor-pointer  text-2xl"
            icon={faClose}
            onClick={() => setAfficherPopupError(false)}
          />
        </div>
        <div className="flex  justify-center">
          <FontAwesomeIcon
            className="text-7xl block mx-auto w-fit text-center text-red-600"
            icon={faTriangleExclamation}
          />
        </div>
        <h1 className="text-center text-5xl font-bold  mb-8 text-red-600">
          Errore
        </h1>

        {errors && <p className="text-center">{errors}</p>}
      </div>
    </div>
  );
}
