// src/stores/experienciaStore.js
import { defineStore } from 'pinia';
import { obtenerExperiencias } from "../api/datosAPI";




export const useExperienciaStore = defineStore('experiencia', {
  state: () => ({
    experiencias: [],
  }),
  actions: {
    async cargarExperiencia() {
      try {
        const { data } = await obtenerExperiencias();

        // 🔄 Convertir fechas a formato { dia, mes, anio }
        this.experiencias = data.map(exp => ({
          ...exp,
          fechaIngreso: this.convertirFechaAObjeto(exp.fechaIngreso),
          fechaRetiro: this.convertirFechaAObjeto(exp.fechaRetiro),
        }));
      } catch (error) {
        console.error("❌ Error al cargar experiencia:", error.response?.data || error.message);
        this.experiencias = []; // fallback vacío
      }
    },

    agregar(experiencia) {
      this.experiencias.push(experiencia);
    },

    actualizar(index, nuevaData) {
      this.experiencias[index] = nuevaData;
    },

    eliminar(index) {
      this.experiencias.splice(index, 1);
    },

    resetear() {
      this.experiencias = [];
    },

    /**
     * 🧠 Utilidad local: convierte "2023-08-04T00:00:00.000Z"
     * en { dia: "04", mes: "08", anio: "2023" }
     */
    convertirFechaAObjeto(fechaISO) {
      if (!fechaISO) return { dia: '', mes: '', anio: '' };
      const fecha = new Date(fechaISO);
      return {
        dia: String(fecha.getDate()).padStart(2, "0"),
        mes: String(fecha.getMonth() + 1).padStart(2, "0"),
        anio: String(fecha.getFullYear()),
      };
    },
    
  },
  
});

function formatearFechaParaFormulario(fecha) {
  const date = new Date(fecha);
  return {
    dia: String(date.getDate()).padStart(2, '0'),
    mes: String(date.getMonth() + 1).padStart(2, '0'),
    anio: String(date.getFullYear())
  };
}

