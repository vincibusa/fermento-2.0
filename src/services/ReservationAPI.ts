// Nuovo servizio prenotazioni che utilizza il back-end API
import { apiService } from './apiService';

// Manteniamo le interfacce esistenti per compatibilità
export interface Reservation {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  date: string;   // formato "YYYY-MM-DD"
  time: string;   // formato "HH:mm"
  seats: number;
  specialRequests?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
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
 * Recupera una prenotazione per ID.
 */
export const getReservationById = async (id: string): Promise<Reservation | null> => {
  try {
    const apiReservation = await apiService.getReservationById(id);
    if (!apiReservation) return null;
    
    return {
      id: apiReservation.id,
      fullName: apiReservation.fullName,
      phone: apiReservation.phone,
      email: apiReservation.email,
      date: apiReservation.date,
      time: apiReservation.time,
      seats: apiReservation.seats,
      specialRequests: apiReservation.specialRequests,
      status: apiReservation.status,
      createdAt: apiReservation.createdAt,
      updatedAt: apiReservation.updatedAt
    };
  } catch (error) {
    console.error('Errore durante il recupero della prenotazione:', error);
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
 * Aggiorna un shift specifico.
 */
export const updateShift = async (date: string, time: string, updates: Partial<Shift>): Promise<void> => {
  try {
    await apiService.updateShift(date, time, updates);
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dello shift:', error);
    throw error;
  }
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
    return apiReservations.map(apiReservation => ({
      id: apiReservation.id,
      fullName: apiReservation.fullName,
      phone: apiReservation.phone,
      email: apiReservation.email,
      date: apiReservation.date,
      time: apiReservation.time,
      seats: apiReservation.seats,
      specialRequests: apiReservation.specialRequests,
      status: apiReservation.status,
      createdAt: apiReservation.createdAt,
      updatedAt: apiReservation.updatedAt
    }));
  } catch (error) {
    console.error('Errore durante il recupero delle prenotazioni:', error);
    throw error;
  }
};

/**
 * Crea una nuova prenotazione.
 */
export const createReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const reservationId = await apiService.createReservation(reservation);
    return reservationId;
  } catch (error) {
    console.error('Errore durante la creazione della prenotazione:', error);
    throw error;
  }
};

/**
 * Alias per createReservation (compatibilità retroattiva)
 */
export const addReservation = async (reservation: Reservation): Promise<string | null> => {
  try {
    const reservationData = {
      fullName: reservation.fullName,
      phone: reservation.phone,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      seats: reservation.seats,
      specialRequests: reservation.specialRequests,
      status: reservation.status || 'pending' as const
    };
    const id = await createReservation(reservationData);
    return id;
  } catch (error) {
    console.error('Errore durante l\'aggiunta della prenotazione:', error);
    throw error;
  }
};

/**
 * Aggiorna una prenotazione esistente.
 */
export const updateReservation = async (id: string, updates: Partial<Reservation>): Promise<void> => {
  try {
    await apiService.updateReservation(id, updates);
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della prenotazione:', error);
    throw error;
  }
};

/**
 * Elimina una prenotazione.
 */
export const deleteReservation = async (id: string): Promise<void> => {
  try {
    await apiService.deleteReservation(id);
  } catch (error) {
    console.error('Errore durante l\'eliminazione della prenotazione:', error);
    throw error;
  }
};

/**
 * Accetta una prenotazione.
 */
export const acceptReservation = async (key: string): Promise<void> => {
  try {
    await apiService.acceptReservation(key);
  } catch (error) {
    console.error('Errore durante l\'accettazione della prenotazione:', error);
    throw error;
  }
};

/**
 * Rifiuta una prenotazione.
 */
export const rejectReservation = async (key: string): Promise<void> => {
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
 * Recupera le statistiche delle prenotazioni per una data
 */
export const getReservationStats = async (date: string) => {
  try {
    const stats = await apiService.getReservationStats(date);
    return stats;
  } catch (error) {
    console.error('Errore durante il recupero delle statistiche:', error);
    throw error;
  }
};

/**
 * Recupera tutti gli orari disponibili
 */
export const getAvailableTimes = async (): Promise<string[]> => {
  try {
    const times = await apiService.getAvailableTimes();
    return times;
  } catch (error) {
    console.error('Errore durante il recupero degli orari disponibili:', error);
    return allTimes; // Fallback agli orari hardcoded
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

/**
 * Sottoscrizione in tempo reale alle prenotazioni per una data specifica.
 */
export const subscribeToReservationsForDate = (
  date: string,
  callback: (reservations: Reservation[]) => void
): (() => void) => {
  return apiService.subscribeToReservations(date, (apiReservations) => {
    const reservations = apiReservations.map(apiReservation => ({
      id: apiReservation.id,
      fullName: apiReservation.fullName,
      phone: apiReservation.phone,
      email: apiReservation.email,
      date: apiReservation.date,
      time: apiReservation.time,
      seats: apiReservation.seats,
      specialRequests: apiReservation.specialRequests,
      status: apiReservation.status,
      createdAt: apiReservation.createdAt,
      updatedAt: apiReservation.updatedAt
    }));
    callback(reservations);
  });
};

// Esporta anche il servizio API per usi avanzati
export { apiService }; 