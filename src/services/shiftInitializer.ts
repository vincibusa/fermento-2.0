import { initializeShiftsForDate, getShiftsForDate } from "./Reservation";
import { addDays, format } from "date-fns";

/**
 * Verifica e inizializza gli shift per i prossimi 30 giorni
 * Da chiamare all'avvio dell'applicazione
 */
export const ensureShiftsInitialized = async (): Promise<void> => {
  console.log("Verifica dell'inizializzazione degli shift per i prossimi 30 giorni...");
  const today = new Date();
  
  let totalCreated = 0;
  let totalSkipped = 0;
  
  // Inizializza gli shift per i prossimi 30 giorni
  for (let i = 0; i < 30; i++) {
    const date = addDays(today, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    
    try {
      // Verifica se esistono già shift per questa data
      const existingShifts = await getShiftsForDate(formattedDate);
      
      // Se non ci sono shift o l'array è vuoto, inizializza per questa data
      if (!existingShifts || existingShifts.length === 0) {
        await initializeShiftsForDate(formattedDate);
        totalCreated++;
      } else {
        totalSkipped++;
      }
    } catch (error) {
      console.error(`Errore nella verifica/inizializzazione degli shift per ${formattedDate}:`, error);
      // Se si verifica un errore durante la verifica, prova a inizializzare comunque
      await initializeShiftsForDate(formattedDate);
      totalCreated++;
    }
  }
  
  console.log(`Inizializzazione completata: ${totalCreated} date inizializzate, ${totalSkipped} date già presenti.`);
}; 