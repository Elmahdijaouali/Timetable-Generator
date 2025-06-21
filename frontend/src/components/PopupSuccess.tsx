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
    <div className=" absolute left-0 bg-green-500/30 top-0 w-full h-full flex justify-between items-center " onClick={() => setAfficherPopupSuccess(false)}>
      <div className="p-10 rounded-xl shadow-2xl shadow-green-500 mx-auto w-[500px] h-fit bg-white">
        <div className="flex justify-end">
          <FontAwesomeIcon
            className="ml-auto hover:cursor-pointer  text-2xl"
            icon={faClose}
            onClick={() => setAfficherPopupSuccess(false)}
          />
        </div>
        <div className="flex  justify-center">
          <FontAwesomeIcon
            className="text-7xl block mx-auto w-fit text-center text-green-600"
            icon={faCircleCheck}
          />
        </div>
        <h1 className="text-center text-5xl font-bold  mb-8 text-green-600">
          Succès
        </h1>

        {messageSuccess && <p className="text-center">{messageSuccess}</p>}
      </div>
    </div>
  );
}
