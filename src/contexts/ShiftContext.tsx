import React, { createContext, useContext, useEffect, useState } from 'react';
import { ensureShiftsInitialized } from '../services/shiftInitializer';

interface ShiftContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  initializationError: string | null;
}

const ShiftContext = createContext<ShiftContextType>({
  isInitialized: false,
  isInitializing: false,
  initializationError: null
});

export const useShift = () => useContext(ShiftContext);

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeShifts = async () => {
      setIsInitializing(true);
      setInitializationError(null);
      
      try {
        await ensureShiftsInitialized();
        setIsInitialized(true);
      } catch (error) {
        console.error('Errore durante l\'inizializzazione degli shift:', error);
        setInitializationError('Si è verificato un errore durante l\'inizializzazione degli shift');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeShifts();
  }, []);

  return (
    <ShiftContext.Provider
      value={{
        isInitialized,
        isInitializing,
        initializationError
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}; 