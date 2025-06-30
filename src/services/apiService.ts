// API Service per connettere il frontend al back-end Node.js
import currentEnvironment from '../config/environment';
export interface ApiReservation {
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

export interface ApiShift {
  time: string;
  date: string;
  enabled: boolean;
  maxReservations: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ReservationStats {
  date: string;
  totalReservations: number;
  totalSeats: number;
  pendingReservations: number;
  acceptedReservations: number;
  rejectedReservations: number;
  shiftStats: Array<{
    time: string;
    reservations: number;
    seats: number;
    available: boolean;
  }>;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // Configura l'URL del back-end in base all'ambiente
    this.baseUrl = currentEnvironment.apiUrl;
    
    // Log della configurazione in development
    if (!currentEnvironment.isProduction) {
      console.log('🔗 API Service initialized with URL:', this.baseUrl);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Metodi per le prenotazioni
  
  async getReservations(filters?: {
    date?: string;
    status?: string;
    limit?: number;
  }): Promise<ApiReservation[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request<ApiReservation[]>(`/reservations${query}`);
    return response.data || [];
  }

  async getReservationById(id: string): Promise<ApiReservation | null> {
    try {
      const response = await this.request<ApiReservation>(`/reservations/${id}`);
      return response.data || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async createReservation(reservation: Omit<ApiReservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const response = await this.request<ApiReservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
    return response.data?.id || '';
  }

  async updateReservation(id: string, updates: Partial<ApiReservation>): Promise<void> {
    await this.request(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteReservation(id: string): Promise<void> {
    await this.request(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  async acceptReservation(id: string): Promise<void> {
    await this.request(`/reservations/${id}/accept`, {
      method: 'POST',
    });
  }

  async rejectReservation(id: string, reason?: string): Promise<void> {
    await this.request(`/reservations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Metodi per i turni

  async getShiftsForDate(date: string): Promise<ApiShift[]> {
    const response = await this.request<ApiShift[]>(`/shifts/${date}`);
    return response.data || [];
  }

  async getShift(date: string, time: string): Promise<ApiShift | null> {
    try {
      const response = await this.request<ApiShift>(`/shifts/${date}/${time}`);
      return response.data || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async updateShift(date: string, time: string, updates: Partial<ApiShift>): Promise<void> {
    await this.request(`/shifts/${date}/${time}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async initializeShiftsForDate(date: string): Promise<void> {
    await this.request(`/shifts/${date}/initialize`, {
      method: 'POST',
    });
  }

  async getReservationStats(date: string): Promise<ReservationStats> {
    const response = await this.request<ReservationStats>(`/shifts/${date}/stats`);
    return response.data || {} as ReservationStats;
  }

  async getAvailableTimes(): Promise<string[]> {
    const response = await this.request<string[]>('/shifts/times/available');
    return response.data || [];
  }

  // Real-time updates con Server-Sent Events
  subscribeToReservations(
    date: string,
    callback: (reservations: ApiReservation[]) => void
  ): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/reservations/stream/${date}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'reservations') {
          callback(data.data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    // Restituisci funzione per chiudere la connessione
    return () => {
      eventSource.close();
    };
  }

  // Metodo di utilità per verificare la connessione al server
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Esporta un'istanza singleton
export const apiService = new ApiService();



export default apiService; 