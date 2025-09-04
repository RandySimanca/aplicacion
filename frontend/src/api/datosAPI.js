// frontend/src/api/datosAPI.js
import api from "./axios";


export async function enviarDatosPersonales(payload) {
  return await api.post("/datos-personales", payload);
}

export async function actualizarDatosPersonales(payload) {
  return await api.put("/datos-personales", payload); // ✅ nueva función
}

export async function obtenerHojaDeVida() {
  const response = await api.get("/hoja-de-vida");
  return response.data;
}

export async function obtenerExperiencias() {
  return await api.get('/experiencia');
}

export async function guardarExperiencia(payload) {
  return await api.post('/experiencia', payload);
}

export async function guardarFirmaServidor(payload) {
  return await api.post('/firma-servidor', payload);
}

export async function obtenerFirmaServidor() {
  return await api.get('/firma-servidor');
}

export async function eliminarFormacionAcademica(id) {
  return await api.delete(`/formacion-academica/${id}`);  // ✅ Ruta correcta
}

export const eliminarFormacionSuperior = async (docId, subId) => {
  try {
    const response = await api.delete(`/formacion-academica/${docId}/formacion-superior/${subId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Formación superior con ID ${subId} no encontrada en documento ${docId}`);
      throw new Error('FORMACION_NO_ENCONTRADA');
    }
    throw error;
  }
};

