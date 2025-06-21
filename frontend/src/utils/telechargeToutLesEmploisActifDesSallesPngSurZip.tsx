import ReactDOM from "react-dom/client";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import api from "../api/apiConfig";
import TimetableSalle from "../components/TimetableSalle";
import { handleNotification } from "./notification";

interface TimetableActive {
  id: number;
}

interface TimetableSalleData {
  salle: string;
  timetable: any[];
  valid_form: string;
  nbr_hours_in_week: number;
}

export const telechargeToutLesEmploisActifDesSallesPngSurZip = async (
  timetablesActiveForSalles: TimetableActive[]
) => {
  const zip = new JSZip();

  // Create a hidden container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-10000px";
  container.style.left = "-10000px";
  container.style.width = "210mm";
  container.style.background = "white";
  document.body.appendChild(container);

  const randStr = Math.random().toString(36).substr(2, 9);
  for (const salle of timetablesActiveForSalles) {
    // Get full data
    const { data: timetableSalle }: { data: TimetableSalleData } =
      await api.get(`/classrooms-timetable/${salle.id}`);

    // Create a wrapper div for each timetable
    const wrapper = document.createElement("div");
    container.appendChild(wrapper);
    container.style.width = "100vw";
    wrapper.style.width = "100%";

    const root = ReactDOM.createRoot(wrapper);

    // Render the React component
    await new Promise<void>((resolve) => {
      root.render(
        <TimetableSalle timetableSalle={timetableSalle} timetableRef={null} />
      );
      setTimeout(resolve, 1000); // Wait for layout
    });

    // Screenshot the rendered timetable
    const canvas = await html2canvas(wrapper, {
      useCORS: true,
      scale: 2, // for high-res PNG
    });

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    if (blob) {
      zip.file(
        `les-emplois-des-temps-actif-des-salles--${randStr}/${timetableSalle.salle}.png`,
        blob
      );
    }

    // Clean up
    root.unmount();
    container.removeChild(wrapper);
  }

  document.body.removeChild(container); // remove the main container

  // Download ZIP
  const zipBlob = await zip.generateAsync({ type: "blob" });

  saveAs(
    zipBlob,
    `emplois-du-temps-des-salles${
      new Date().toISOString().split("T")[0]
    }--${Math.random().toString(36).substr(2, 9)}.zip`
  );

  handleNotification(
    "Téléchargement",
    "seccès téléchargement des emlpois du temps des salles!"
  );
};
