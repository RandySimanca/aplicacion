// frontend/src/api/unlockAPI.js
import axios from 'axios';

// Crear una instancia específica para unlock que NO use el token JWT
const unlockAPI = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const verifyUnlockCode = async (payload) => {
  try {
    const response = await unlockAPI.post('/unlock/verify', payload);
    return response.data;
  } catch (error) {
    console.error('Error verificando código de desbloqueo:', error);
    throw error;
  }
};
