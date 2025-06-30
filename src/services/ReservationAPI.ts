// Nuovo servizio prenotazioni che utilizza il back-end API
import { apiService, type ApiReservation, type ApiShift } from './apiService';

// Manteniamo le interfacce esistenti per compatibilità
export interface Reservation {
  id?: string;
  fullName: string;
  phone: string;
  date: string;   // formato "YYYY-MM-DD"
  time: string;   // formato "HH:mm" (es. "19:00", "19:30", ecc.)
  seats: number;
  specialRequests?: string;
  status: 'pending' | 'accepted' | 'rejected';
  email: string;
}

export interface Shift {
  time: string;           // Es. "19:00", "20:00", ecc.
  enabled: boolean;       // Indica se il turno è attivo (sbloccato) oppure no
  maxReservations: number; // Numero massimo di posti prenotabili
}

// Array costante con tutti gli orari desiderati
export const allTimes = [
  "19:00", "19:15", "19:30", "19:45", 
  "20:00", "20:15", "20:30", "20:45", 
  "21:00", "21:15", "21:30"
];

/**
 * Inizializza gli shift di default per una data specifica.
 */
export const initializeShiftsForDate = async (date: string): Promise<void> => {
  try {
    await apiService.initializeShiftsForDate(date);
  } catch (error) {
    console.error('Errore durante l\'inizializzazione degli shift:', error);
    throw error;
  }
};

/**
 * Aggiorna le impostazioni di un turno per una data specifica.
 */
export const updateShift = async (
  date: string,
  time: string,
  shift: Partial<Shift>
): Promise<void> => {
  try {
    await apiService.updateShift(date, time, {
      enabled: shift.enabled,
      maxReservations: shift.maxReservations
    });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del turno:', error);
    throw error;
  }
};

/**
 * Recupera tutti gli shift per una data specifica.
 */
export const getShiftsForDate = async (date: string): Promise<Shift[]> => {
  try {
    const apiShifts = await apiService.getShiftsForDate(date);
    return apiShifts.map(shift => ({
      time: shift.time,
      enabled: shift.enabled,
      maxReservations: shift.maxReservations
    }));
  } catch (error) {
    console.error('Errore durante il recupero degli shift:', error);
    throw error;
  }
};

/**
 * Aggiunge una prenotazione.
 */
export const addReservation = async (reservation: Reservation): Promise<string | null> => {
  try {
    const id = await apiService.createReservation({
      fullName: reservation.fullName,
      phone: reservation.phone,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      seats: reservation.seats,
      specialRequests: reservation.specialRequests || '',
      status: reservation.status || 'pending'
    });
    return id;
  } catch (error) {
    console.error('Errore durante l\'aggiunta della prenotazione:', error);
    throw error;
  }
};

/**
 * Sottoscrizione in tempo reale alle prenotazioni.
 */
export const subscribeToReservations = (
  callback: (reservations: Reservation[]) => void
): (() => void) => {
  // Utilizziamo la data di oggi come default per la sottoscrizione
  const today = new Date().toISOString().split('T')[0];
  
  return apiService.subscribeToReservations(today, (apiReservations) => {
    callback(apiReservations as Reservation[]);
  });
};

/**
 * Sottoscrizione in tempo reale alle prenotazioni per una data specifica.
 */
export const subscribeToReservationsForDate = (
  date: string,
  callback: (reservations: Reservation[]) => void
): (() => void) => {
  return apiService.subscribeToReservations(date, (apiReservations) => {
    callback(apiReservations as Reservation[]);
  });
};

/**
 * Recupera tutte le prenotazioni con filtri opzionali.
 */
export const getReservations = async (filters?: {
  date?: string;
  status?: string;
  limit?: number;
}): Promise<Reservation[]> => {
  try {
    const apiReservations = await apiService.getReservations(filters);
    return apiReservations as Reservation[];
  } catch (error) {
    console.error('Errore durante il recupero delle prenotazioni:', error);
    throw error;
  }
};

/**
 * Aggiorna una prenotazione esistente.
 */
export const updateReservation = async (key: string, reservation: Reservation): Promise<void> => {
  try {
    await apiService.updateReservation(key, {
      fullName: reservation.fullName,
      phone: reservation.phone,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      seats: reservation.seats,
      specialRequests: reservation.specialRequests || '',
      status: reservation.status || 'pending'
    });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della prenotazione:', error);
    throw error;
  }
};

/**
 * Elimina una prenotazione dato il suo key.
 */
export const deleteReservation = async (key: string): Promise<void> => {
  try {
    await apiService.deleteReservation(key);
  } catch (error) {
    console.error('Errore durante l\'eliminazione della prenotazione:', error);
    throw error;
  }
};

/**
 * Accetta una prenotazione e invia email di conferma
 */
export const acceptReservation = async (key: string, reservation: Reservation): Promise<void> => {
  try {
    await apiService.acceptReservation(key);
  } catch (error) {
    console.error('Errore durante l\'accettazione della prenotazione:', error);
    throw error;
  }
};

/**
 * Rifiuta una prenotazione
 */
export const rejectReservation = async (key: string, reservation: Reservation): Promise<void> => {
  try {
    await apiService.rejectReservation(key);
  } catch (error) {
    console.error('Errore durante il rifiuto della prenotazione:', error);
    throw error;
  }
};

/**
 * Verifica la disponibilità di un turno
 */
export const checkShiftAvailability = async (date: string, time: string, requestedSeats: number): Promise<boolean> => {
  try {
    const shift = await apiService.getShift(date, time);
    if (!shift || !shift.enabled) {
      return false;
    }

    const reservations = await apiService.getReservations({ date });
    const shiftReservations = reservations.filter(r => r.time === time && r.status !== 'rejected');
    const totalSeats = shiftReservations.reduce((sum, r) => sum + r.seats, 0);

    return (totalSeats + requestedSeats) <= shift.maxReservations;
  } catch (error) {
    console.error('Errore durante la verifica della disponibilità:', error);
    return false;
  }
};

/**
 * Recupera le statistiche per una data
 */
export const getReservationStats = async (date: string) => {
  try {
    return await apiService.getReservationStats(date);
  } catch (error) {
    console.error('Errore durante il recupero delle statistiche:', error);
    throw error;
  }
};

/**
 * Verifica la connessione al server
 */
export const checkServerConnection = async (): Promise<boolean> => {
  try {
    return await apiService.healthCheck();
  } catch (error) {
    console.error('Errore durante la verifica della connessione:', error);
    return false;
  }
};

// Esporta anche il servizio API per usi avanzati
export { apiService }; 