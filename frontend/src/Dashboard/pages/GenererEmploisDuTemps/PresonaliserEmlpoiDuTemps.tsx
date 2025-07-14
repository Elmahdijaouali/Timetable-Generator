import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { useState, useEffect } from "react";
import ButtonNavigateBack from "../../../components/ButtonNavigateBack";
import { useParams } from "react-router-dom";
import api from "../../../api/apiConfig.tsx";
import PopupError from '../../../components/PopupError';
import PopupSuccess from '../../../components/PopupSuccess';
import { useDroppable, useDraggable } from '@dnd-kit/core';

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

// Draggable session card component
function DraggableSession({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        cursor: 'grab',
        zIndex: isDragging ? 100 : 'auto',
      }}
    >
      {children}
    </div>
  );
}

// Droppable timetable cell
function DroppableCell({ id, children, onDrop }: { id: string, children: React.ReactNode, onDrop: (fromId: string, toId: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <td
      ref={setNodeRef}
      style={{ background: isOver ? '#e0e7ff' : '#f9fafb', position: 'relative' }}
      className="lg:px-2 py-2 px-1 text-center border w-[12%]"
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        const fromId = e.dataTransfer.getData('text/plain');
        onDrop(fromId, id);
      }}
    >
      {children}
    </td>
  );
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
  // PopupError state
  const [afficherPopupError, setAfficherPopupError] = useState(false);
  const [errors, setErrors] = useState('');
  const [afficherPopupSuccess, setAfficherPopupSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // dnd-kit drag end handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;
    if (!timetableGroup) return;

    // Parse ids
    const [fromDay, fromTimeshot] = active.id.toString().split('---');
    const [toDay, toTimeshot] = over.id.toString().split('---');

    // Prevent dropping outside timetable
    if (!fromDay || !fromTimeshot || !toDay || !toTimeshot) {
      setAfficherPopupError(true);
      setErrors('Déplacement en dehors du tableau non autorisé.');
      return;
    }
    // Prevent dropping on Samedi in forbidden timeslots
    if (toDay === 'Samedi' && (toTimeshot === '13:30-16:00' || toTimeshot === '16:00-18:30')) {
      setAfficherPopupError(true);
      setErrors('Impossible d’ajouter une session à Samedi après 13:30.');
      return;
    }

    // Prepare move data for backend
    const moveData = {
      timetableId,
      from: { day: fromDay, timeshot: fromTimeshot },
      to: { day: toDay, timeshot: toTimeshot }
    };
    try {
      const res = await api.post(`/timetables/update-session-position`, moveData);
      // Use the backend's grouped/ordered timetable directly
      setTimetableGroup(res.data.updatedTimetable);
      setAfficherPopupSuccess(true);
      setSuccessMessage('Session déplacée avec succès !');
      setAfficherPopupError(false);
      setErrors('');
    } catch (err: any) {
      setAfficherPopupError(true);
      setErrors(err.response?.data?.message || 'Erreur lors du déplacement');
    }
  };

  const fetchData = async () => {
    try {
      const res = await api.get(`/timetables/${timetableId}`);

      if (res && res.data) {
        setTimetableGroup(res.data);
      }
    } catch (err) {
      // console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timetableId]);

  useEffect(() => {
    if (afficherPopupSuccess) {
      const timer = setTimeout(() => {
        setAfficherPopupSuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [afficherPopupSuccess]);

  useEffect(() => {
    if (afficherPopupError) {
      const timer = setTimeout(() => {
        setAfficherPopupError(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [afficherPopupError]);

  return (
    <div className="lg:w-[93%] mx-auto  h-fit lg:px-10 lg:py-5  p-5" style={{ overflowX: 'hidden' }}>
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full " key={timetableGroup?.valid_form || Math.random()}>
            <thead>
              <tr>
                <th style={{ background: '#9ca3af', color: '#fff' }} className="lg:px-5 lg:py-2 py-1 px-3 border w-[12%]"> </th>
                {timeShots.map((timeshot) => (
                  <th style={{ background: '#9ca3af', color: '#fff' }} className="lg:px-5 lg:py-2 py-1 px-3 border w-[22%]" key={timeshot}>
                    {timeshot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timetableGroup && timetableGroup.timetable.map((day) => {
                const dayLabel = Object.keys(day)[0];
                const sessions = Array.isArray(Object.values(day)[0]) ? Object.values(day)[0] : [];
                return (
                  <tr key={dayLabel}>
                    <td style={{ background: '#6b7280', color: '#fff' }} className="lg:px-5 lg:py-7 py-5 px-3 font-bold text-center border w-[12%]">
                      {dayLabel}
                    </td>
                    {timeShots.map((timeshot) => {
                      const session = sessions.find((s: Session) => s.timeshot === timeshot);
                      const cellId = dayLabel + '---' + timeshot;
                      return (
                        <DroppableCell
                          key={cellId}
                          id={cellId}
                          onDrop={(fromId, toId) => {
                            handleDragEnd({ active: { id: fromId }, over: { id: toId } } as DragEndEvent);
                          }}
                        >
                          {session && (
                            <DraggableSession id={cellId}>
                              <div
                                style={{ background: session.color, borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '0.5rem 1rem', border: '1px solid #e5e7eb', display: 'block', minWidth: 'unset', width: '100%', zIndex: 999 }}
                              >
                                <span style={{ color: '#111827', fontWeight: 600 }}>{session.module}</span> <br />
                                <span style={{ color: '#111827', fontWeight: 600 }}>{session.formateur}</span> <br />
                                <span style={{ color: '#111827', fontWeight: 600 }}>{session.salle}</span> <br />
                              </div>
                            </DraggableSession>
                          )}
                        </DroppableCell>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DndContext>
        <div className="flex justify-between">
          <p>
            Cet emploi du temps est valable _ partir du{" "}
            <span className=" font-semibold " style={{ color: "blue" }}>
              {timetableGroup?.valid_form}
            </span>
          </p>
          <p>
            {" "}
            Nombre d'heures: {" "}
            <span className=" font-semibold " style={{ color: "blue" }}>
              {timetableGroup?.nbr_hours_in_week}
            </span>
          </p>
        </div>
        {afficherPopupError && (
          <PopupError
            afficherPopupError={afficherPopupError}
            errors={errors}
            setAfficherPopupError={setAfficherPopupError}
          />
        )}
        {afficherPopupSuccess && (
          <PopupSuccess
            afficherPopupSuccess={afficherPopupSuccess}
            messageSuccess={successMessage}
            setAfficherPopupSuccess={setAfficherPopupSuccess}
          />
        )}
      </div>
    </div>
  );
}
