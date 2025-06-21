import { useEffect, useState } from "react";
import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import { useParams } from "react-router-dom";
import api from "../../../api/apiConfig.tsx";

interface Session {
  timeshot: string;
  module: string;
  formateur: string;
  salle: string;
  color: string;
}

interface Day {
  [key: string]: Session[];
}

interface TimetableGroup {
  code_branch: string;
  niveau: string;
  groupe: string;
  timetable: Day[];
  valid_form: string;
  nbr_hours_in_week: number;
}

export default function PresonaliserEmploiDuTemps() {
  const { timetableId } = useParams();

  const timeShots = [
    "08:30-11:00",
    "11:00-13:30",
    "13:30-16:00",
    "16:00-18:30",
  ];
  const [timetableGroup, setTimetableGroup] = useState<TimetableGroup | null>(
    null
  );

  const fetchData = async () => {
    try {
      const res = await api.get(`/timetables/${timetableId}`);

      if (res && res.data) {
        setTimetableGroup(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timetableId]);

  return (
    <div className="lg:w-[93%] mx-auto  h-full lg:px-10 lg:py-5  p-5">
      <div className="flex mb-10 justify-between">
        <ButtonNavigateBack />
      </div>

      <div>
        <h1 className="text-center text-2xl font-bold">EMPLOI DU TEMPS</h1>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className=" font-semibold">
              EFP :{" "}
              <span className=" font-bold " style={{ color: "blue" }}>
                ISTA CITE DE L'AIR
              </span>
            </h2>
            <h2 className=" font-semibold">
              Filiére :{" "}
              <span className=" font-semibold " style={{ color: "blue" }}>
                {timetableGroup?.code_branch}
              </span>
            </h2>
            <h2 className=" font-semibold">
              Niveau :{" "}
              <span className=" font-semibold " style={{ color: "blue" }}>
                {timetableGroup?.niveau}
              </span>
            </h2>
          </div>
          <div>
            <h2 className=" font-semibold mb-5">
              Année de formation : 2024-2025
            </h2>
            <h2 className=" font-semibold">
              Groupe :{" "}
              <span className=" font-semibold " style={{ color: "blue" }}>
                {timetableGroup?.groupe}
              </span>{" "}
            </h2>
          </div>
        </div>
        <table className="w-full ">
          <thead>
            <tr>
              <th className="bg-gray-400 lg:px-5 lg:py-2 py-1 px-3 border w-[12%]"></th>
              {timeShots.map((timeshot) => (
                <th className="bg-gray-400 lg:px-5 lg:py-2 py-1 px-3 border w-[22%]">
                  {timeshot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetableGroup &&
              timetableGroup.timetable.map((day, index) => {
                const dayLabel = Object.keys(day)[0];
                const sessions = Object.values(day)[0];

                return (
                  <tr key={index}>
                    <td className="bg-gray-400 lg:px-5 lg:py-7 py-5 px-3 font-bold text-center border w-[12%]">
                      {dayLabel}
                    </td>
                    {timeShots.map((timeshot) => (
                      <RenderTimeShot dayData={sessions} timeshot={timeshot} />
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
        <div className="flex justify-between">
          <p>
            Cet emploi du temps est valable _ partir du{" "}
            <span className=" font-semibold " style={{ color: "blue" }}>
              {timetableGroup?.valid_form}
            </span>
          </p>
          <p>
            {" "}
            Nombre d'heures:{" "}
            <span className=" font-semibold " style={{ color: "blue" }}>
              {timetableGroup?.nbr_hours_in_week}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const RenderTimeShot = ({
  dayData,
  timeshot,
}: {
  dayData: Session[];
  timeshot: string;
}) => {
  const session = dayData.find((session) => session.timeshot == timeshot);
  if (!session) {
    return <td className="lg:px-5 py-2 px-3  text-center border w-[12%]"></td>;
  }

  return (
    <td
      className={`lg:px-5 py-2 px-3  text-center border w-[12%] font`}
      style={{ background: session?.color }}
    >
      <span>{session.module}</span> <br />
      <span>{session.formateur}</span> <br />
      <span>{session.salle}</span> <br />
    </td>
  );
};
