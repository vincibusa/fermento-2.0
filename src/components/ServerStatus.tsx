import React, { useState, useEffect } from 'react';
import { checkServerConnection } from '../services/ReservationAPI';

interface ServerStatusProps {
  showDetails?: boolean;
  className?: string;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ 
  showDetails = false, 
  className = "" 
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await checkServerConnection();
      setIsConnected(connected);
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Controllo iniziale
    checkConnection();

    // Controllo periodico ogni 30 secondi
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-500';
    if (isConnected === null) return 'text-gray-500';
    return isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = () => {
    if (isChecking) return '🔄';
    if (isConnected === null) return '❓';
    return isConnected ? '✅' : '❌';
  };

  const getStatusText = () => {
    if (isChecking) return 'Verificando...';
    if (isConnected === null) return 'Sconosciuto';
    return isConnected ? 'Connesso' : 'Disconnesso';
  };

  const formatLastCheck = () => {
    if (!lastCheck) return '';
    return lastCheck.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!showDetails) {
    // Versione compatta - solo icona
    return (
      <div 
        className={`inline-flex items-center ${className}`}
        title={`Server: ${getStatusText()}${lastCheck ? ` (${formatLastCheck()})` : ''}`}
      >
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusIcon()}
        </span>
      </div>
    );
  }

  // Versione dettagliata
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusIcon()}
      </span>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          Server: {getStatusText()}
        </span>
        {lastCheck && (
          <span className="text-xs text-gray-500">
            Ultimo controllo: {formatLastCheck()}
          </span>
        )}
      </div>
      {!isChecking && (
        <button
          onClick={checkConnection}
          className="text-xs text-blue-500 hover:text-blue-700 underline"
          title="Ricontrolla connessione"
        >
          Ricontrolla
        </button>
      )}
    </div>
  );
};

export default ServerStatus; 