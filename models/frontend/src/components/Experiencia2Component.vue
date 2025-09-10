<!-- src/componentes/Experiencia2Component.vue -->
<template>
  <form @submit.prevent="guardarExperiencia">
    <div class="section">
      <div class="form-group">
        <label>EMPLEO ACTUAL O CONTRATO ANTERIOR</label>

        <div style="display: flex; margin-top: 3px">
          <div class="form-group col-2">
            <label>EMPRESA O ENTIDAD.</label>
            <input type="text" v-model="experiencia.empresa" class="form-control" />
          </div>

          <div class="checkbox-group">
            <label>PUBLICA</label>
            <input type="radio" value="Publica" v-model="experiencia.tipoEntidad" />
          </div>

          <div class="checkbox-group">
            <label>PRIVADA</label>
            <input type="radio" value="Privada" v-model="experiencia.tipoEntidad" />
          </div>

          <div class="form-group col-2">
            <label>PAÍS</label>
            <input type="text" v-model="experiencia.pais" class="form-control" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-2">
            <label>DEPARTAMENTO</label>
            <input type="text" v-model="experiencia.departamento" class="form-control" />
          </div>

          <div class="form-group col-2">
            <label>MUNICIPIO</label>
            <input type="text" v-model="experiencia.municipio" class="form-control" />
          </div>

          <div class="form-group col-2">
            <label>CORREO ELECTRÓNICO ENTIDA</label>
            <input type="email" v-model="experiencia.correoEntidad" class="form-control" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-2">
            <label>TELÉFONOS</label>
            <input type="text" v-model="experiencia.telefonos" class="form-control" />
          </div>

          <div class="form-group col-2">
            <label>FECHA DE INGRESO</label>
            <div style="display: flex">
              <div class="form-group" style="width: 30px; margin-right: 5px">
                <label>DÍA</label>
                <input type="text" v-model="experiencia.fechaIngreso.dia" class="form-control" placeholder="dd" />
              </div>
              <div class="form-group" style="width: 30px; margin-right: 5px">
                <label>MES</label>
                <input type="text" v-model="experiencia.fechaIngreso.mes" class="form-control" placeholder="mm"/>
              </div>
              <div class="form-group" style="width: 60px">
                <label>AÑO</label>
                <input type="text" v-model="experiencia.fechaIngreso.anio" class="form-control" placeholder="aaaa"/>
              </div>
            </div>
          </div>

          <div class="form-group col-2">
            <label>FECHA DE RETIRO</label>
            <div style="display: flex">
              <div class="form-group" style="width: 30px; margin-right: 5px">
                <label>DÍA</label>
                <input type="text" v-model="experiencia.fechaRetiro.dia" class="form-control" placeholder="dd" />
              </div>
              <div class="form-group" style="width: 30px; margin-right: 5px">
                <label>MES</label>
                <input type="text" v-model="experiencia.fechaRetiro.mes" class="form-control" placeholder="mm"/>
              </div>
              <div class="form-group" style="width: 60px">
                <label>AÑO</label>
                <input type="text" v-model="experiencia.fechaRetiro.anio" class="form-control" placeholder="aaaa" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-2">
            <label>CARGO O CONTRATO ACTUAL</label>
            <input type="text" v-model="experiencia.cargo" class="form-control" />
          </div>

          <div class="form-group col-2">
            <label>DEPENDENCIA</label>
            <input type="text" v-model="experiencia.dependencia" class="form-control" />
          </div>

          <div class="form-group col-2">
            <label>DIRECCIÓN</label>
            <input type="text" v-model="experiencia.direccion" class="form-control" />
          </div>
        </div>

        <div class="form-group" style="margin-top: 20px">
          <button type="submit" class="boton-guardar no-imprimir">
            Guardar experiencia.
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<!-- src/components/ExperienciaComponent.vue -->
<script>
import { showSuccess, showError } from "../utils/showMessage.js";
import api from "../api/axios.js";

export default {
  name: "ExperienciaComponent",
  props: {
    experienciaLocal: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
     experiencia: {
        empresa: '',
        tipoEntidad: '',
        pais: '',
        departamento: '',
        municipio: '',
        correoEntidad: '',
        telefonos: '',
        fechaIngreso: {  dia: '', mes: '', anio: '' },
        fechaRetiro: { dia: '', mes: '', anio: '' },
        cargo: '',
        dependencia: '',
        direccion: '',

        datosPrecargados: false,

// feedback visual
envioExitoso: false,
errorEnvio: null,
cargando: false,

      }
    };
  },


  mounted() {
    if (this.experiencia) {
      this.experiencia = {...this.experiencia };
    }

    if (this.experiencia) {
      this.empresa = this.experiencia.empresa || '';
      this.tipoEntidad = this.experiencia.tipoEntidad || '';
      this.pais = this.experiencia.pais || '';
      this.departamento = this.experiencia.departamento || '';
      this.municipio = this.experiencia.municipio || '';
      this.correoEntidad = this.experiencia.correoEntidad || '';
      this.telefonos = this.experiencia.telefonos || '';
      this.fechaIngreso = {
        dia: this.experiencia.fechaIngreso?.dia || '',
        mes: this.experiencia.fechaIngreso?.mes || '',
        año: this.experiencia.fechaIngreso?.anio || ''
      };
      this.fechaRetiro = {
        dia: this.experiencia.fechaRetiro?.dia || '',
        mes: this.experiencia.fechaRetiro?.mes || '',
        año: this.experiencia.fechaRetiro?.anio || ''
      };
      this.cargo = this.experiencia.cargo || '';
      this.dependencia = this.experiencia.dependencia || '';
      this.direccion = this.experiencia.direccion || '';
      this.datosPrecargados = true;
    }

  },
  methods: {
    esNumeroEnRango(valor, min, max) {
      const n = parseInt(valor, 10);
      return Number.isFinite(n) && n >= min && n <= max;
    },
    validarFechasCampos(f) {
      if (!f) return { ok: false, msg: 'Fechas incompletas' };
      const { dia, mes, anio } = f;
      if (!this.esNumeroEnRango(dia, 1, 31)) return { ok: false, msg: 'El día debe estar entre 1 y 31' };
      if (!this.esNumeroEnRango(mes, 1, 12)) return { ok: false, msg: 'El mes debe estar entre 1 y 12' };
      if (!Number.isFinite(parseInt(anio, 10))) return { ok: false, msg: 'El año es requerido' };
      return { ok: true };
    },
    construirDate({ dia, mes, anio }) {
      const d = parseInt(dia, 10), m = parseInt(mes, 10), y = parseInt(anio, 10);
      return new Date(y, m - 1, d);
    },
    convertirFecha({ dia, mes, anio }) {
      if (!dia || !mes || !anio) return null;
      const d = parseInt(dia), m = parseInt(mes), y = parseInt(anio);
      return new Date(y, m - 1, d);
    },
    async guardarExperiencia() {
      try {
        const valIng = this.validarFechasCampos(this.experiencia.fechaIngreso);
        if (!valIng.ok) { showError(`❌ Fecha de ingreso inválida: ${valIng.msg}`); return; }
        const valRet = this.validarFechasCampos(this.experiencia.fechaRetiro);
        if (!valRet.ok) { showError(`❌ Fecha de retiro inválida: ${valRet.msg}`); return; }
        const dIng = this.construirDate(this.experiencia.fechaIngreso);
        const dRet = this.construirDate(this.experiencia.fechaRetiro);
        if (dIng > dRet) { showError('❌ La fecha de ingreso no puede ser mayor que la fecha de retiro.'); return; }

        const experienciaFormateada = {
          ...this.experiencia,
          fechaIngreso: this.convertirFecha(this.experiencia.fechaIngreso),
          fechaRetiro: this.convertirFecha(this.experiencia.fechaRetiro),
        };
        const res = await api.post("/experiencia", experienciaFormateada);
        console.log("✅ Experiencia enviada correctamente:", res.data);
        showSuccess("✅ ¡Experiencia laboral guardada correctamente!");
      } catch (error) {
        console.error("❌ Error al guardar experiencia:", error.response?.data || error.message);
        showError("❌ Ocurrió un error al guardar los datos.");
      }
    }
  }
};
</script>


<style scoped>
/* Tu CSS personalizado */
</style>
