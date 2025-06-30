// src/pages/ReservationPage.tsx
import React, { useState, useCallback, useEffect, ChangeEvent } from "react";
import { FiEdit2, FiTrash2, FiCalendar, FiClock, FiUsers, FiCheck, FiX } from "react-icons/fi";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Reservation,
  Shift,
  subscribeToReservationsForDate,
  updateReservation,
  deleteReservation,
  getShiftsForDate,
  updateShift,
  initializeShiftsForDate,
  allTimes,
  acceptReservation,
  rejectReservation
} from "../services/ReservationAPI";
import ReservationModalEdit from "../components/ReservationModalEdit";

const ReservationPage: React.FC = () => {
  // Stati per le prenotazioni, la data selezionata e i turni
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>(allTimes[0]);

  // Stati per modale edit e delete
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);



  // Sottoscrizione in tempo reale alle prenotazioni per la data selezionata
  useEffect(() => {
    const unsubscribe = subscribeToReservationsForDate(selectedDate, (reservationsData: Reservation[]) => {
      setReservations(reservationsData);
    });
    return () => unsubscribe();
  }, [selectedDate]);

  // Carica i turni per la data selezionata
  useEffect(() => {
    const loadShifts = async () => {
      try {
        let shiftsData = await getShiftsForDate(selectedDate);
        if (shiftsData.length === 0) {
          await initializeShiftsForDate(selectedDate);
          shiftsData = await getShiftsForDate(selectedDate);
        }
        setShifts(shiftsData);
        if (!shiftsData.find((s) => s.time === selectedShift)) {
          setSelectedShift(allTimes[0]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadShifts();
  }, [selectedDate]);

  // Filtra le prenotazioni in base alla data selezionata
  const filteredReservations = reservations.filter(
    (reservation) => reservation.date === selectedDate
  );

  // Gestione della modifica: apre la modale con i dati della prenotazione da modificare
  const handleEdit = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsEditModalOpen(true);
  }, []);

  // Gestione della cancellazione: apre la modale di conferma
  const handleDelete = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedReservation && selectedReservation.id) {
      try {
        await deleteReservation(selectedReservation.id);
        toast.success("Prenotazione eliminata con successo");
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error("Errore nella cancellazione della prenotazione");
      }
    } else {
      toast.error("ID prenotazione non definito");
    }
  }, [selectedReservation]);

  // Gestione della modifica della data e del turno
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleShiftChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedShift(e.target.value);
  };

  const toggleShiftStatus = async () => {
    try {
      const currentShift = shifts.find((s) => s.time === selectedShift);
      const shiftToUpdate = currentShift || { time: selectedShift, enabled: false, maxReservations: 15 };
      await updateShift(selectedDate, selectedShift, { enabled: !shiftToUpdate.enabled });
      const updatedShifts = await getShiftsForDate(selectedDate);
      setShifts(updatedShifts);
      toast.success(`Turno ${selectedShift} ${!shiftToUpdate.enabled ? "attivato" : "bloccato"}`);
    } catch (error) {
      toast.error("Errore nell'aggiornamento dello stato del turno");
    }
  };

  const handleAccept = useCallback(async (reservation: Reservation) => {
    try {
      await acceptReservation(reservation.id!, reservation);
      toast.success("Prenotazione accettata");
    } catch (error) {
      toast.error("Errore nell'accettazione della prenotazione");
      console.error(error);
    }
  }, []);

  const handleReject = useCallback(async (reservation: Reservation) => {
    try {
      await rejectReservation(reservation.id!, reservation);
      toast.success("Prenotazione rifiutata");
    } catch (error) {
      toast.error("Errore nel rifiuto della prenotazione");
      console.error(error);
    }
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header: titolo, selezione data e gestione dei turni */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Prenotazioni
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Selettore della data */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
              />
            </div>

            {/* Select per il turno */}
            <div className="relative">
              <select
                value={selectedShift}
                onChange={handleShiftChange}
                className="w-full sm:w-auto appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
              >
                {allTimes.map((time) => {
                  const shift = shifts.find((s) => s.time === time);
                  const enabled = shift ? shift.enabled : false;
                  return (
                    <option 
                      key={time} 
                      value={time}
                      className="py-2"
                    >
                      {time} {enabled ? "(Attivo)" : "(Bloccato)"}
                    </option>
                  );
                })}
              </select>
              {/* Icona freccia custom */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Bottone per alternare lo stato del turno */}
            <button
              onClick={toggleShiftStatus}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                active:bg-blue-800 transition-colors duration-200 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {shifts.find((s) => s.time === selectedShift)?.enabled ? "Blocca" : "Sblocca"}
            </button>
          </div>
        </div>

        {/* Lista delle prenotazioni per la data selezionata */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {reservation.fullName}
                    </h3>
                    <p className="text-gray-600">{reservation.phone}</p>
                    <p className="text-gray-600">{reservation.email}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                      reservation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation.status === 'accepted' ? 'Accettata' :
                       reservation.status === 'rejected' ? 'Rifiutata' :
                       'In attesa'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {(!reservation.status || reservation.status === 'pending') && (
                      <>
                        <button
                          onClick={() => handleAccept(reservation)}
                          className="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-full transition-all duration-200"
                          title="Accetta prenotazione"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(reservation)}
                          className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition-all duration-200"
                          title="Rifiuta prenotazione"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(reservation)}
                      className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full transition-all duration-200"
                      title="Modifica prenotazione"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(reservation)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition-all duration-200"
                      title="Elimina prenotazione"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Dettagli della prenotazione */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="mr-2" />
                    <span>{format(new Date(reservation.date), "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiClock className="mr-2" />
                    <span>{reservation.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiUsers className="mr-2" />
                    <span>{reservation.seats} {reservation.seats === 1 ? 'persona' : 'persone'}</span>
                  </div>
                  {reservation.specialRequests && (
                    <div className="mt-2 text-gray-600 bg-gray-50 p-2 rounded-md">
                      <span className="block font-medium">Note speciali:</span>
                      <span>{reservation.specialRequests}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3 text-center py-16 text-gray-500">
              Non ci sono prenotazioni per questa data.
            </div>
          )}
        </div>

        {/* Modal per modifica, usando ReservationModal */}
        {isEditModalOpen && selectedReservation && (
          <ReservationModalEdit
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            reservation={selectedReservation}
            onSubmit={async (updatedReservation) => {
              if (selectedReservation.id) {
                await updateReservation(selectedReservation.id, updatedReservation);
                toast.success("Prenotazione aggiornata con successo");
              }
              setIsEditModalOpen(false);
            }}
          />
        )}

        {/* Modal per conferma eliminazione */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Conferma eliminazione</h2>
              <p className="text-gray-600 mb-6">
                Sei sicuro di voler eliminare questa prenotazione?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-center" />
      </div>
    </div>
  );
};

export default ReservationPage;