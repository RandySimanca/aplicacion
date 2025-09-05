// api/axios.js - Configuración corregida para desarrollo y producción

import axios from 'axios';

// ✅ SOLUCIÓN: URL base dinámica
const getBaseURL = () => {
  // Si estamos en desarrollo local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:4000'; // Tu puerto de desarrollo del backend
  }
  // Si estamos en producción (Heroku), usar la misma URL del frontend
  return window.location.origin;
};

// Crear instancia de axios con configuración dinámica
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor para añadir token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 Request to: ${config.baseURL}${config.url}`); // Para debugging
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from: ${response.config.url}`, response.status); // Para debugging
    return response;
  },
  (error) => {
    console.error(`❌ Error from: ${error.config?.url}`, error.message);
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
