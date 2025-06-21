interface Session {
  timeshot: string;
  module: string;
  salle: string;
  formateur: string;
  color: string;
}

interface Day {
  [day: string]: Session[];
}

interface TimetableGroupData {
  code_branch: string;
  niveau: string;
  groupe: string;
  timetable: Day[];
  valid_form: string;
  nbr_hours_in_week: number;
}

interface Props {
  timetableRef: React.RefObject<HTMLDivElement> | null;
  timetableGroup: TimetableGroupData;
}

export default function TimetableGroup({
  timetableRef,
  timetableGroup,
}: Props) {
  const timeShots = [
    "08:30-11:00",
    "11:00-13:30",
    "13:30-16:00",
    "16:00-18:30",
  ];

  if (!timetableGroup) {
    return null;
  }
  return (
    <div ref={timetableRef} className="p-5">
      <h1 className="text-center text-2xl font-bold">EMPLOI DU TEMPS</h1>
      <div className="flex justify-between my-5">
        <div>
          <p>
            EFP :{" "}
            <span className=" uppercase font-bold" style={{ color: "blue" }}>
              ista cité de l'air
            </span>
          </p>
          <p>
            Filiére :{" "}
            <span className=" font-bold" style={{ color: "blue" }}>
              {timetableGroup?.code_branch}
            </span>
          </p>
          <p>
            Niveau :{" "}
            <span className=" font-bold" style={{ color: "blue" }}>
              {timetableGroup?.niveau}
            </span>
          </p>
        </div>
        <div>
          <p>
            Année de formation :
            <span className=" font-bold" style={{ color: "blue" }}>
              2024-2025
            </span>
          </p>
          <br />
          <p>
            Groupe :{" "}
            <span className=" font-bold" style={{ color: "blue" }}>
              {timetableGroup?.groupe}{" "}
            </span>
          </p>
        </div>
      </div>
      <div>
        <table className="w-full ">
          <thead>
            <tr>
              <th className="bg-gray-400 lg:px-5 lg:py-2 py-1 px-3 border w-[12%]"></th>
              <th className="bg-gray-400 lg:px-5 lg:py-2 py-1 px-3 border w-[22%]">
                80:30-11:00
              </th>
              <th className="bg-gray-400 lg:px-5 lg:py-2 py-1 px-3 border w-[22%]">
                11:00-13:30
              </th>
              <th className="bg-gray-400 lg:px-5 lg:py-2 py-1 px-3 border w-[22%]">
                13:30-16:00
              </th>
              <th className="bg-gray-400 lg:px-5 lg:py-2 py-1 px-3 border w-[22%]">
                16:00-18:30
              </th>
            </tr>
          </thead>
          <tbody>
            {timetableGroup.timetable &&
              timetableGroup.timetable.map((day, index) => {
                const dayLabel = Object.keys(day)[0];
                const sessions = Object.values(day)[0];

                return (() => {
                  const renderCells = [];
                  let skipNext = false;

                  for (let i = 0; i < timeShots.length; i++) {
                    if (skipNext) {
                      skipNext = false;
                      continue;
                    }

                    const timeshot = timeShots[i];
                    const currentSession = sessions?.find(
                      (s) => s.timeshot === timeshot
                    );
                    const nextSession = sessions?.find(
                      (s) => s.timeshot === timeShots[i + 1]
                    );

                    let merge = false;
                    if (
                      currentSession &&
                      nextSession &&
                      currentSession.module === nextSession.module &&
                      currentSession.salle === nextSession.salle
                    ) {
                      merge = true;
                      skipNext = true;
                    }

                    renderCells.push(
                      <RenderTimeShot
                        key={i}
                        session={currentSession}
                        mergeSession={merge}
                      />
                    );
                  }

                  return (
                    <tr key={index}>
                      <td
                        className="lg:px-5 lg:py-7 py-5 px-3 font-bold text-center border w-[12%]"
                        style={{ background: "gray" }}
                      >
                        {dayLabel}
                      </td>
                      {renderCells}
                    </tr>
                  );
                })();
              })}
          </tbody>
        </table>
        <div className="flex justify-between">
          <p>
            Cet emploi du temps est valable _ partir du{" "}
            <span className=" font-bold" style={{ color: "blue" }}>
              {timetableGroup.valid_form}
            </span>
          </p>
          <p>
            {" "}
            Nombre d'heures:{" "}
            <span className=" font-bold " style={{ color: "blue" }}>
              {timetableGroup?.nbr_hours_in_week}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const RenderTimeShot = ({
  session,
  mergeSession,
}: {
  session: Session | undefined;
  mergeSession: boolean;
}) => {
  if (!session) {
    return <td className="lg:px-5 py-2 px-3 text-center border w-[12%]"></td>;
  }

  return (
    <td
      colSpan={mergeSession ? 2 : 1}
      className="lg:px-5 py-2 px-3 text-center border w-[12%]"
      style={{ background: session.color }}
    >
      <span className="font-semibold">{session.module}</span> <br />
      <span className=" font-semibold  ">
        {session.formateur.slice(session.formateur.indexOf(" "))}
      </span>{" "}
      <br />
      <span className="font-semibold">{session.salle}</span> <br />
    </td>
  );
};
