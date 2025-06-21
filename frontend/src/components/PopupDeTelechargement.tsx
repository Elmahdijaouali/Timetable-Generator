import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faDownload } from "@fortawesome/free-solid-svg-icons";

interface Props {
  afficherPopup: boolean;
  setAfficherPopup: (value: boolean) => void;
  valuePopup: string;
  setValuePopup: (value: string) => void;
  handleLogicTelechargement: () => void;
}

export default function PopupDeTelechargement({
  afficherPopup,
  setAfficherPopup,
  valuePopup,
  setValuePopup,
  handleLogicTelechargement,
}: Props) {
  const handleClick = () => {
    handleLogicTelechargement();
    setAfficherPopup(false);
  };

  if (!afficherPopup) {
    return null;
  }
  return (
    <div className=" fixed left-0 top-0 w-full bg-blue-500/45   h-full z-10  flex justify-between items-center ">
      <div className=" w-[500px] mx-auto p-5 shadow-2xl bg-gray-100 h-[300px] rounded   ">
        <div className="flex justify-between my-4">
          <h1 className="text-2xl font-bold ">Télécharger</h1>
          <FontAwesomeIcon
            icon={faClose}
            className="text-2xl hover:cursor-pointer "
            onClick={() => setAfficherPopup(false)}
          />
        </div>
        <hr />
        <div className="my-5">
          <label htmlFor="">Type de téléchargement</label>
          <select
            name=""
            id=""
            className="w-full bg-white my-5 p-2 rounded "
            value={valuePopup}
            onChange={(e) => setValuePopup(e.target.value)}
          >
            <option className="px-4 py-3 text-lg  " value="png">
              png
            </option>
            {/* <option className="px-4 py-3 text-lg  " value="pdf">pdf</option>
              <option  className="px-4 py-3 text-lg  " value="excel">excel</option> */}
          </select>
        </div>

        <button
          className="bg-green-600 px-5 py-2 hover:cursor-pointer text-xl text-white rounded shadow "
          onClick={handleClick}
        >
          <FontAwesomeIcon className="mr-2" icon={faDownload} />
          Télécharger
        </button>
      </div>
    </div>
  );
}
