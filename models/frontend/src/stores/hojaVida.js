// src/stores/hojaVida.js
import { defineStore } from "pinia";
import api from "../api/axios";
import { obtenerFirmaServidor, guardarFirmaServidor } from '../api/datosAPI';

export const useHojaVidaStore = defineStore("hojaVida", {
  state: () => ({
    datosPersonales: null,
    formacionAcademica: null,
    experiencia: [],
    idiomas: [],
    firmaServidor: null,
    cargado: false,
  }),
  actions: {
    async cargarHojaDeVida() {
      try {
        console.log("🔄 Iniciando carga de hoja de vida...");
        
        // Cargar cada sección por separado
        await Promise.allSettled([
          this.cargarDatosPersonales(),
          this.cargarFormacionAcademica(), 
          this.cargarIdiomas(),
          this.cargarExperiencia()
        ]);

        console.log("✅ Datos cargados en el store:", {
          datosPersonales: !!this.datosPersonales,
          formacionAcademica: !!this.formacionAcademica,
          idiomas: this.idiomas.length,
          experiencia: this.experiencia.length
        });
        
      } catch (error) {
        console.error("❌ Error general al cargar hoja de vida:", error);
      } finally {
        this.cargado = true;
        console.log("🏁 Carga completada. Store cargado:", this.cargado);
      }
    },

    async cargarDatosPersonales() {
      try {
        const response = await api.get('/datos-personales');
        this.datosPersonales = response.data;
        console.log("✅ Datos personales cargados");
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("ℹ️ No hay datos personales guardados (404)");
          this.datosPersonales = {};
        } else {
          console.error("❌ Error al cargar datos personales:", error);
          this.datosPersonales = {};
        }
      }
    },

    async cargarFormacionAcademica() {
      try {
        const response = await api.get('/formacion-academica');
        this.formacionAcademica = response.data;
        console.log("✅ Formación académica cargada");
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("ℹ️ No hay formación académica guardada (404)");
          this.formacionAcademica = {};
        } else {
          console.error("❌ Error al cargar formación académica:", error);
          this.formacionAcademica = {};
        }
      }
    },

    async cargarIdiomas() {
      try {
        const response = await api.get('/idiomas');
        this.idiomas = response.data.idiomas || [];
        console.log(`✅ Idiomas cargados: ${this.idiomas.length}`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("ℹ️ No hay idiomas guardados (404)");
          this.idiomas = [];
        } else {
          console.error("❌ Error al cargar idiomas:", error);
          this.idiomas = [];
        }
      }
    },

    async cargarExperiencia() {
      try {
        const response = await api.get('/experiencia');
        this.experiencia = response.data.experiencias || response.data || [];
        console.log(`✅ Experiencia cargada: ${this.experiencia.length}`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("ℹ️ No hay experiencia guardada (404)");
          this.experiencia = [];
        } else {
          console.error("❌ Error al cargar experiencia:", error);
          this.experiencia = [];
        }
      }
    },

    // Método para refrescar datos después de guardar
    async refrescarDatos() {
      console.log("🔄 Refrescando datos del store...");
      this.cargado = false;
      await this.cargarHojaDeVida();
    },

    async cargarFirmaServidor() {
      try {
        const { data } = await obtenerFirmaServidor();
        this.firmaServidor = data;
      } catch (error) {
        console.error("Error al cargar firma:", error);
      }
    },

    async guardarFirmaServidor(payload) {
      try {
        const { data } = await guardarFirmaServidor(payload);
        this.firmaServidor = data.data;
      } catch (error) {
        console.error("Error al guardar firma:", error);
      }
    }
  },
});