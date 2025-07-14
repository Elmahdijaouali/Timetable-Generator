import { faCircleCheck, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PopupSuccess({
  afficherPopupSuccess,
  messageSuccess = "",
  setAfficherPopupSuccess,
}: {
  afficherPopupSuccess: boolean;
  messageSuccess: string;
  setAfficherPopupSuccess: (value: boolean) => void;
}) {
  if (!afficherPopupSuccess) {
    return null;
  }

  return (
    <div className="absolute left-0 bg-black/50 top-0 w-full h-full flex justify-between items-center z-50" onClick={() => setAfficherPopupSuccess(false)}>
      <div className="p-10 rounded-xl shadow-2xl shadow-green-500/50 mx-auto w-[500px] h-fit bg-white border border-gray-200">
        <div className="flex justify-end">
          <FontAwesomeIcon
            className="ml-auto hover:cursor-pointer text-2xl text-gray-500 hover:text-gray-700 transition-colors"
            icon={faClose}
            onClick={() => setAfficherPopupSuccess(false)}
          />
        </div>
        <div className="flex justify-center">
          <FontAwesomeIcon
            className="text-7xl block mx-auto w-fit text-center text-green-600"
            icon={faCircleCheck}
          />
        </div>
        <h1 className="text-center text-5xl font-bold mb-8 text-green-600">
          Succès
        </h1>

        {messageSuccess && (
          <div className="text-center text-gray-700 whitespace-pre-line max-h-96 overflow-y-auto">
            {messageSuccess}
          </div>
        )}
      </div>
    </div>
  );
}
