// Configurazione degli ambienti per l'applicazione Fermento

export interface Environment {
  name: string;
  apiUrl: string;
  isProduction: boolean;
  features: {
    realTimeUpdates: boolean;
    emailNotifications: boolean;
    analytics: boolean;
  };
}

export const environments: Record<string, Environment> = {
  development: {
    name: 'Development',
    apiUrl: 'https://fermento-backend--fermento-pizzeria.europe-west4.hosted.app/api',
    isProduction: false,
    features: {
      realTimeUpdates: true,
      emailNotifications: false,
      analytics: false,
    },
  },
  production: {
    name: 'Production',
    apiUrl: 'https://fermento-backend--fermento-pizzeria.europe-west4.hosted.app/api',
    isProduction: true,
    features: {
      realTimeUpdates: true,
      emailNotifications: true,
      analytics: true,
    },
  },
  staging: {
    name: 'Staging',
    apiUrl: 'https://fermento-backend--fermento-pizzeria.europe-west4.hosted.app/api',
    isProduction: false,
    features: {
      realTimeUpdates: true,
      emailNotifications: true,
      analytics: false,
    },
  },
};

// Determina l'ambiente corrente
const getCurrentEnvironment = (): Environment => {
  // Priorità: variabile d'ambiente VITE_ENV, poi import.meta.env.MODE
  const envName = import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';
  
  // Se è specificato un URL API personalizzato, usa quello
  const customApiUrl = import.meta.env.VITE_API_URL;
  
  const baseEnv = environments[envName] || environments.development;
  
  return {
    ...baseEnv,
    ...(customApiUrl && { apiUrl: customApiUrl }),
  };
};

export const currentEnvironment = getCurrentEnvironment();

// Utility per il debug
export const logEnvironmentInfo = () => {
  console.group('🌍 Environment Configuration');
  console.log('Environment:', currentEnvironment.name);
  console.log('API URL:', currentEnvironment.apiUrl);
  console.log('Production:', currentEnvironment.isProduction);
  console.log('Features:', currentEnvironment.features);
  console.log('Vite Mode:', import.meta.env.MODE);
  console.log('Custom API URL:', import.meta.env.VITE_API_URL);
  console.groupEnd();
};

// Esporta l'ambiente corrente come default
export default currentEnvironment; 