// src/api/pdfAPI.js
import api from "../helpers/axiosInstance";

export async function descargarPDF(datos) {
  const response = await api.post("/pdf/generar-pdf", datos, {
    responseType: 'blob', // importante para PDF
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url); // o usa un link para descargar
}
