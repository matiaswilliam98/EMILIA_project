/**
 * Configuración centralizada para la aplicación EMILIA
 * Gestiona variables de entorno y configuraciones comunes
 */

// Configuración de AI/LLM
export const AI_CONFIG = {
  // Configuración del proveedor (openai o openrouter)
  PROVIDER: import.meta.env.VITE_AI_PROVIDER || 'openai',
  
  // Modelo a utilizar
  MODEL: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
  
  // OpenAI API Key
  API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  
  // Temperatura (randomness) para la generación de texto
  TEMPERATURE: 0.7,
  
  // Configuración de OpenRouter
  OPENROUTER: {
    API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
    BASE_URL: 'https://openrouter.ai/api/v1',
    SITE_URL: import.meta.env.VITE_SITE_URL || window.location.origin,
    SITE_NAME: import.meta.env.VITE_SITE_NAME || 'EMILIA Therapeutic Assistant',
    MODEL: import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemini-2.0-flash-001'
  }
};

// Configuración de la API Backend
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
};

// Otras configuraciones de la aplicación
export const APP_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  DEBUG_MODE: import.meta.env.DEV || false,
};

// Función para validar la configuración
export const validateConfig = () => {
  // Verifica que las variables críticas estén definidas
  if (AI_CONFIG.PROVIDER === 'openai' && !AI_CONFIG.API_KEY) {
    console.error('⚠️ VITE_OPENAI_API_KEY no está definida en el archivo .env');
    return false;
  }
  
  if (AI_CONFIG.PROVIDER === 'openrouter' && !AI_CONFIG.OPENROUTER.API_KEY) {
    console.error('⚠️ VITE_OPENROUTER_API_KEY no está definida en el archivo .env');
    return false;
  }
  
  if (AI_CONFIG.PROVIDER === 'openai' && !AI_CONFIG.MODEL) {
    console.warn('⚠️ VITE_OPENAI_MODEL no está definida, usando gpt-4o-mini por defecto');
  }
  
  return true;
};

// Objeto de configuración completo
export default {
  AI: AI_CONFIG,
  API: API_CONFIG,
  APP: APP_CONFIG,
}; 