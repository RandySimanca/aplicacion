<template>
  <form @submit.prevent="guardarExperiencia">
    <div class="section">
     
      <div class="form-group">
        <label>EMPLEO ACTUAL O CONTRATO ANTERIOR</label>

        <div class="form-row">
          <div class="form-group col-amplio">
            <label>EMPRESA O ENTIDAD.</label>
            <input type="text" v-model="experienciaLocal.empresa" class="form-control correo-input solo-pantalla" />
            <div class="texto-impresion solo-impresion">{{ experienciaLocal.empresa }}</div>
          </div>

          <div class="checkbox-group col-pequeno">
            <label>PUBLICA</label>
            <input type="radio" value="Publica" v-model="experienciaLocal.tipoEntidad" />
          </div>

          <div class="checkbox-group col-pequeno">
            <label>PRIVADA</label>
            <input type="radio" value="Privada" v-model="experienciaLocal.tipoEntidad" />
          </div>

          <div class="form-group col-medio">
            <label>PAÍS</label>
            <input type="text" v-model="experienciaLocal.pais" class="form-control" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-3">
            <label>DEPARTAMENTO</label>
            <input type="text" v-model="experienciaLocal.departamento" class="form-control" />
          </div>

          <div class="form-group col-3">
            <label>MUNICIPIO</label>
            <input type="text" v-model="experienciaLocal.municipio" class="form-control" />
          </div>

          <div class="form-group col-3">
            <label>CORREO ELECTRÓNICO ENTIDAD</label>
            <input type="email" v-model="experienciaLocal.correoEntidad" class="form-control correo-input" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-3">
            <label>TELÉFONOS</label>
            <input type="text" v-model="experienciaLocal.telefonos" class="form-control" />
          </div>

          <div class="form-group col-3">
            <label>FECHA DE INGRESO</label>
            <div style="display: flex">
              <div class="form-group" style="width: 30px; margin-right: 5px">
                <label>DÍA</label>
                <input type="text" v-model="experienciaLocal.fechaIngreso.dia" class="form-control" placeholder="dd" />
              </div>
              <div class="form-group" style="width: 30px; margin-right: 5px">
                <label>MES</label>
                <input type="text" v-model="experienciaLocal.fechaIngreso.mes" class="form-control" placeholder="mm" />
              </div>
              <div class="form-group" style="width: 60px">
                <label>AÑO</label>
                <input type="text" v-model="experienciaLocal.fechaIngreso.anio" class="form-control" placeholder="aaaa" />
              </div>
            </div>
          </div>

          <div class="form-group col-3">
            <label>FECHA DE RETIRO</label>
            <div style="display: flex">
              <div class="form-group" style="width: 30px; margin-right: 5px">
                <label>DÍA</label>
                <input type="text" v-model="experienciaLocal.fechaRetiro.dia" class="form-control" placeholder="dd" />
              </div>
              <div class="form-group" style="width: 30px; margin-right: 5px">
                <label>MES</label>
                <input type="text" v-model="experienciaLocal.fechaRetiro.mes" class="form-control" placeholder="mm" />
              </div>
              <div class="form-group" style="width: 60px">
                <label>AÑO</label>
                <input type="text" v-model="experienciaLocal.fechaRetiro.anio" class="form-control" placeholder="aaaa" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-3">
            <label>CARGO O CONTRATO ACTUAL</label>
            <input type="text" v-model="experienciaLocal.cargo" class="form-control" />
          </div>

          <div class="form-group col-3">
            <label>DEPENDENCIA</label>
            <input type="text" v-model="experienciaLocal.dependencia" class="form-control" />
          </div>

          <div class="form-group col-3">
            <label>DIRECCIÓN</label>
            <input type="text" v-model="experienciaLocal.direccion" class="form-control" />
          </div>
        </div>

        <div class="form-group" style="margin-top: 20px">
          <button type="submit" class="boton-guardar no-imprimir" :disabled="cargando">
            {{ modoEdicion ? 'Actualizar experiencia' : 'Guardar experiencia' }}
          </button>
          
          <!-- Botón eliminar (solo se muestra si hay un ID, es decir, experiencia existente) -->
          <button 
            v-if="experienciaLocal._id" 
            type="button" 
            class="boton-guardar no-imprimir"
            style="margin-left: 10px; background-color: #dc3545;"
            @click="confirmarEliminacion"
            :disabled="cargando"
          >
            🗑️ Eliminar experiencia
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { showSuccess, showError, showConfirm, showWarning } from "../utils/showMessage.js";
import api from "../api/axios";

export default {
  name: "ExperienciaComponent",
  props: {
    experiencia: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['experiencia-eliminada'],
  data() {
    return {
      experienciaLocal: {
        _id: null,
        empresa: "",
        tipoEntidad: "",
        pais: "",
        departamento: "",
        municipio: "",
        correoEntidad: "",
        telefonos: "",
        fechaIngreso: { dia: "", mes: "", anio: "" },
        fechaRetiro: { dia: "", mes: "", anio: "" },
        cargo: "",
        dependencia: "",
        direccion: "",
        datosPrecargados: false,
      },
      envioExitoso: false,
      errorEnvio: null,
      cargando: false,
      modoEdicion: false,
    };
  },
  mounted() {
    this.sincronizarExperiencia(this.experiencia);
  },
  watch: {
    experiencia: {
      handler(nuevaExp) {
        this.sincronizarExperiencia(nuevaExp);
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    esNumeroEnRango(valor, min, max) {
      const n = parseInt(valor, 10);
      return Number.isFinite(n) && n >= min && n <= max;
    },

    validarFechasCampos(f) {
      if (!f) return { ok: false, msg: "Fechas incompletas" };
      const { dia, mes, anio } = f;
      if (!this.esNumeroEnRango(dia, 1, 31)) return { ok: false, msg: "El día debe estar entre 1 y 31" };
      if (!this.esNumeroEnRango(mes, 1, 12)) return { ok: false, msg: "El mes debe estar entre 1 y 12" };
      if (!Number.isFinite(parseInt(anio, 10))) return { ok: false, msg: "El año es requerido" };
      return { ok: true };
    },

    construirDate({ dia, mes, anio }) {
      const d = parseInt(dia, 10), m = parseInt(mes, 10), y = parseInt(anio, 10);
      return new Date(y, m - 1, d);
    },
    
    normalizarFecha(fecha) {
      if (!fecha) return { dia: '', mes: '', anio: '' };
      if (typeof fecha === 'string' || fecha instanceof Date) {
        const f = new Date(fecha);
        return {
          dia: String(f.getDate()).padStart(2, '0'),
          mes: String(f.getMonth() + 1).padStart(2, '0'),
          anio: String(f.getFullYear())
        };
      }
      return {
        dia: fecha.dia ?? '',
        mes: fecha.mes ?? '',
        anio: fecha.anio ?? ''
      };
    },
    
    sincronizarExperiencia(exp) {
      if (!exp || this.experienciaLocal.datosPrecargados) return;

      this.experienciaLocal = {
        ...this.experienciaLocal,
        ...exp,
        _id: exp._id || null,
        fechaIngreso: this.normalizarFecha(exp.fechaIngreso),
        fechaRetiro: this.normalizarFecha(exp.fechaRetiro),
        datosPrecargados: true
      };

      this.modoEdicion = !!exp._id;
    },

    convertirFecha({ dia, mes, anio }) {
      if (!dia || !mes || !anio) return null;
      const d = parseInt(dia),
        m = parseInt(mes),
        y = parseInt(anio);
      return new Date(y, m - 1, d);
    },

    async guardarExperiencia() {
      this.cargando = true;
      try {
        const valIng = this.validarFechasCampos(this.experienciaLocal.fechaIngreso);
        if (!valIng.ok) {
          showError(`❌ Fecha de ingreso inválida: ${valIng.msg}`);
          return;
        }
        const valRet = this.validarFechasCampos(this.experienciaLocal.fechaRetiro);
        if (!valRet.ok) {
          showError(`❌ Fecha de retiro inválida: ${valRet.msg}`);
          return;
        }

        const dIng = this.construirDate(this.experienciaLocal.fechaIngreso);
        const dRet = this.construirDate(this.experienciaLocal.fechaRetiro);
        if (dIng > dRet) {
          showError("❌ La fecha de ingreso no puede ser mayor que la fecha de retiro.");
          return;
        }

        const experienciaFormateada = {
          ...this.experienciaLocal,
          fechaIngreso: this.convertirFecha(this.experienciaLocal.fechaIngreso),
          fechaRetiro: this.convertirFecha(this.experienciaLocal.fechaRetiro),
        };

        let response;
        
        if (this.modoEdicion && this.experienciaLocal._id) {
          response = await api.put(`/experiencia/${this.experienciaLocal._id}`, experienciaFormateada);
          showSuccess("✅ ¡Experiencia laboral actualizada correctamente.!");
        } else {
          response = await api.post("/experiencia", experienciaFormateada);
          showSuccess("✅ ¡Experiencia laboral guardada correctamente.!");
          
          this.experienciaLocal._id = response.data.data._id;
          this.modoEdicion = true;
        }

        console.log("✅ Experiencia procesada:", response.data);
        
      } catch (error) {
        console.error("❌ Error al procesar experiencia:", error.response?.data || error.message);
        showError("❌ Ocurrió un error al procesar los datos.");
      } finally {
        this.cargando = false;
      }
    },

    async confirmarEliminacion() {
      const empresa = this.experienciaLocal.empresa || 'esta experiencia';
      const confirmacion = await showConfirm({
        title: 'Eliminar experiencia',
        text: `¿Estás seguro de que deseas eliminar la experiencia en "${empresa}"? Esta acción no se puede deshacer.`,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No'
      });
      if (confirmacion) {
        this.eliminarExperiencia();
      }
    },

    async eliminarExperiencia() {
      if (!this.experienciaLocal._id) {
        showError("❌ No se puede eliminar una experiencia sin ID.");
        return;
      }

      this.cargando = true;
      try {
        await api.delete(`/experiencia/${this.experienciaLocal._id}`);
        
        showSuccess("✅ Experiencia eliminada correctamente");
        
        this.$emit('experiencia-eliminada', this.experienciaLocal._id);
        
        console.log("✅ Experiencia eliminada:", this.experienciaLocal._id);
        
      } catch (error) {
        console.error("❌ Error al eliminar experiencia:", error.response?.data || error.message);
        
        if (error.response?.status === 404) {
          showError("❌ La experiencia ya no existe o no tienes permisos para eliminarla.");
        } else {
          showError("❌ Ocurrió un error al eliminar la experiencia.");
        }
      } finally {
        this.cargando = false;
      }
    }
  }
};
</script>

<style scoped>
.correo-input {
  width: 100%;
}

/* Clases de columnas para pantalla normal */
.col-amplio {
  flex: 0 0 40%;
  max-width: 40%;
}

.col-pequeno {
  flex: 0 0 10%;
  max-width: 10%;
}

.col-medio {
  flex: 0 0 20%;
  max-width: 20%;
}

.col-3 {
  flex: 0 0 32%;
  max-width: 32%;
}

/* Ocultar texto de impresión en pantalla */
.solo-impresion {
  display: none;
}

/* Estilos específicos para impresión */
@media print {
  /* Ocultar inputs en impresión solo para el campo empresa */
  .solo-pantalla {
    display: none !important;
  }
  
  /* Mostrar texto plano en impresión */
  .solo-impresion {
    display: block !important;
    width: 100% !important;
    padding: 2px 4px !important;
    border: 1px solid #333 !important;
    border-radius: 2px !important;
    font-size: 10px !important;
    min-height: 20px !important;
    box-sizing: border-box !important;
    word-wrap: break-word !important;
    white-space: normal !important;
    line-height: 1.4 !important;
    background-color: white !important;
  }
  
  .form-control {
    border: 1px solid #333 !important;
    font-size: 9px !important;
    padding: 2px 3px !important;
  }
  
  /* Mantener las proporciones en impresión */
  .col-amplio {
    flex: 0 0 40% !important;
    max-width: 40% !important;
  }
  
  .col-pequeno {
    flex: 0 0 10% !important;
    max-width: 10% !important;
  }
  
  .col-medio {
    flex: 0 0 20% !important;
    max-width: 20% !important;
  }
  
  .col-3 {
    flex: 0 0 32% !important;
    max-width: 32% !important;
  }
  
  .form-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 2px !important;
    page-break-inside: avoid !important;
  }
  
  .form-group {
    page-break-inside: avoid !important;
  }
}
</style>
