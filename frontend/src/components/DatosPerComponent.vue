<template>
  <form @submit.prevent="enviarFormulario">
    <div class="section">
      <div class="section-title">
        <span class="section-number">1</span> DATOS PERSONALES
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="apellido1">PRIMER APELLIDO</label>
          <input
            type="text"
            v-model="apellido1"
            id="apellido1"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="apellido2">SEGUNDO APELLIDO (O DE CASADA)</label>
          <input
            type="text"
            v-model="apellido2"
            id="apellido2"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="nombres">NOMBRES</label>
          <input
            v-model="nombres"
            type="text"
            id="nombres"
            class="form-control"
          />
        </div>
      </div>
      <!-- Resto del formulario igual que antes -->
      <div class="form-row">
        <!-- Documento de Identidad -->
        <div class="form-group col-3">
          <label for="tipoDocumento">DOCUMENTO DE IDENTIFICACIÓN</label>
          <div style="display: flex; flex-wrap: wrap; gap: 10px">
            <div class="checkbox-group">
              <input
                type="radio"
                id="cedula"
                name="tipoDocumento"
                value="C.C"
                v-model="tipoDocumento"
              />
              <label for="cedula">C.C</label>
            </div>
            <div class="checkbox-group">
              <input
                type="radio"
                id="cedulExt"
                name="tipoDocumento"
                value="C.E"
                v-model="tipoDocumento"
              />
              <label for="cedulExt">C.E</label>
            </div>
            <div class="checkbox-group">
              <input
                type="radio"
                id="pasaporte"
                name="tipoDocumento"
                value="PAS"
                v-model="tipoDocumento"
              />
              <label for="pasaporte">PAS</label>
            </div>
          </div>
        </div>

        <!-- Número de documento -->
        <div class="form-group col-2">
          <label for="numDocumento">NÚMERO</label>
          <input
            v-model="numDocumento"
            type="text"
            id="numDocumento"
            class="form-control"
            placeholder="No. de documento"
          />
        </div>

        <!-- Sexo -->
        <div class="form-group col-2">
          <label>SEXO</label>
          <div style="display: flex; gap: 10px">
            <div class="checkbox-group">
              <input
                type="radio"
                id="sexoF"
                name="sexo"
                value="Femenino"
                v-model="sexoF"
              />
              <label for="sexoF">F</label>
            </div>
            <div class="checkbox-group">
              <input
                type="radio"
                id="sexoM"
                name="sexo"
                value="Masculino"
                v-model="sexoM"
              />
              <label for="sexoM">M</label>
            </div>
          </div>
        </div>

        <!-- Nacionalidad -->
        <div class="form-group col-2">
          <label>NACIONALIDAD</label>
          <div style="display: flex; gap: 10px">
            <div class="checkbox-group">
              <input
                type="radio"
                id="nacCol"
                name="nacionalidad"
                value="Colombiano"
                v-model="nacCol"
              />
              <label for="nacCol">COL.</label>
            </div>
            <div class="checkbox-group">
              <input
                type="radio"
                id="nacExt"
                name="nacionalidad"
                value="Extranjero"
                v-model="nacExt"
              />
              <label for="nacExt">EXT.</label>
            </div>
          </div>
        </div>

        <!-- País -->
        <div class="form-group col-2">
          <label for="pais">PAÍS</label>
          <input v-model="pais" type="text" id="pais" class="form-control" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group col-3">
          <label>LIBRETA MILITAR</label>
          <div style="display: flex; margin-top: 3px">
            <div class="checkbox-group">
              <input
                type="radio"
                id="primera"
                value="primera"
                v-model="libretaMilitar"
              />
              <label for="primera">PRIMERA CLASE</label>
            </div>
            <div class="checkbox-group">
              <input
                type="radio"
                id="segunda"
                value="segunda"
                v-model="libretaMilitar"
              />
              <label for="segunda">SEGUNDA CLASE</label>
            </div>
          </div>
        </div>

        <div class="form-group col-2">
          <label for="numero-libreta">NÚMERO</label>
          <input
            type="text"
            id="numero-libreta"
            class="form-control2"
            placeholder="No."
            v-model="numeroLibreta"
          />
        </div>

        <div class="form-group col-4">
          <label for="dm">D.M</label>
          <input type="text" id="dm" class="form-control2" 
            v-model="dm" 
            placeholder="Distrito Militar"/>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group col-2">
          <label>FECHA Y LUGAR DE NACIMIENTO</label>
          <div style="display: flex; flex-wrap: wrap">
            <div class="form-group col-4">
              <label for="dia-nac">DÍA</label>
              <input
                type="text"
                id="dia-nac"
                class="form-control"
                v-model="diaNac"
              />
            </div>
            <div class="form-group col-4">
              <label for="mes-nac">MES</label>
              <input
                type="text"
                id="mes-nac"
                class="form-control"
                v-model="mesNac"
              />
            </div>
            <div class="form-group col-4" >
              <label for="ano-nac">AÑO</label>
              <input
                type="text"
                id="ano-nac"
                class="form-control"
                v-model="anoNac"
              />
            </div>
          </div>

          <div class="form-group col-2">
            <label for="pais-nac">PAÍS</label>
            <input
              type="text"
              id="pais-nac"
              class="form-control"
              v-model="paisNac"
            />
          </div>

          <div class="form-group col-2">
            <label for="depto-nac">DEPTO</label>
            <input
              type="text"
              id="depto-nac"
              class="form-control"
              v-model="deptoNac"
            />
          </div>

          <div class="form-group col-2">
            <label for="municipio-nac">MUNICIPIO</label>
            <input
              type="text"
              id="municipio-nac"
              class="form-control"
              v-model="municipioNac"
            />
          </div>
        </div>
       
        <div class="form-group col-2">
          <label>DIRECCIÓN DE CORRESPONDENCIA</label>
          <div style="display: flex; margin-top: 3px" >
            <div class="form-group col-3">
              <label for="pais-corr">PAÍS</label>
              <input
                type="text"
                id="pais-corr"
                class="form-control"
                v-model="paisCorr"
              />
            </div>

            <div class="form-group col-3">
              <label for="depto-corr">DEPTO</label>
              <input
                type="text"
                id="depto-corr"
                class="form-control"
                v-model="deptoCorr"
              />
            </div>

            <div class="form-group col-3">
              <label for="municipio-corr">MUNICIPIO</label>
              <input
                type="text"
                id="municipio-corr"
                class="form-control"
                v-model="municipioCorr"
              />
            </div>
          </div>

          <div class="form-group col-2">
            <label for="direccion-corr">DIRECCIÓN</label>
            <input
              type="text"
              id="direccion-corr"
              class="form-control"
              v-model="direccionCorr"
            />
          </div>

          <div class="form-group col-2">
            <label for="telefono">TELÉFONO</label>
            <input
              type="text"
              id="telefono"
              class="form-control"
              v-model="telefono"
            />
          </div>

          <div class="form-group col-2">
            <label for="email">EMAIL</label>
            <input
              type="email"
              id="email"
              class="form-control"
              v-model="email"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-group no-imprimir" style="margin-top: 20px">
      <button
        v-if="!datosExisten"
        type="submit"
        class="boton-guardar no-imprimir"
        style="margin-left: 10px; background-color: #28a745;"
        :disabled="cargando"
      >
        {{ cargando ? "Guardando..." : "Guardar datos personales" }}
      </button>
      
      <button
        v-if="datosExisten"
        type="button"
        class="no-imprimir boton-actualizar" 
        @click="actualizarDatos"
        :disabled="cargando"
      >
        {{ cargando ? "Actualizando..." : "Actualizar datos personales" }}
      </button>
    </div>

    <p v-if="envioExitoso" class="mensaje-ok">Datos guardados con éxito</p>
    <p v-if="errorEnvio" class="mensaje-error">{{ errorEnvio }}</p>
  </form>
</template>

<script>
import { showSuccess, showError } from "../utils/showMessage";
import api from "../api/axios";
import { actualizarDatosPersonales } from "../api/datosAPI";

export default {
  props: {
    datos: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      apellido1: "",
      apellido2: "",
      nombres: "",
      tipoDocumento: "",
      numDocumento: "",
      cedulExt: "",
      pasaporte: "",
      sexoF: "",
      sexoM: "",
      nacCol: "",
      nacExt: "",
      pais: "",
      libretaMilitar: "",
      numeroLibreta: "",
      dm: "",
      diaNac: "",
      mesNac: "",
      anoNac: "",
      paisNac: "",
      deptoNac: "",
      municipioNac: "",
      paisCorr: "",
      deptoCorr: "",
      municipioCorr: "",
      direccionCorr: "",
      telefono: "",
      email: "",

      datosExisten: false, // Cambio: usar una lógica más clara
      datosInicializados: false, // Para controlar la inicialización

      // feedback visual
      envioExitoso: false,
      errorEnvio: null,
      cargando: false,
    };
  },
  
  watch: {
    // Vigilar cambios en la prop datos
    datos: {
      handler(newDatos) {
        console.log('🔄 Datos recibidos en props:', newDatos);
        this.inicializarDatos(newDatos);
      },
      immediate: true,
      deep: true
    }
  },

  mounted() {
    console.log('📋 DatosPersonales mounted. Datos props:', this.datos);
    this.inicializarDatos(this.datos);
  },

  methods: {
    inicializarDatos(datos) {
      // Evitar reinicialización múltiple con los mismos datos
      if (this.datosInicializados && JSON.stringify(datos) === JSON.stringify(this.ultimosDatos)) {
        return;
      }

      console.log('🔄 Inicializando datos personales:', datos);
      
      // Verificar si realmente hay datos válidos del usuario actual
      const hayDatosValidos = datos && typeof datos === 'object' && 
        (datos.apellido1 || datos.nombres || datos.numDocumento);
      
      if (hayDatosValidos) {
        console.log('✅ Cargando datos existentes');
        this.cargarDatosExistentes(datos);
        this.datosExisten = true;
      } else {
        console.log('➕ Usuario nuevo o sin datos - iniciando formulario limpio');
        this.limpiarFormulario();
        this.datosExisten = false;
      }

      this.datosInicializados = true;
      this.ultimosDatos = { ...datos };
    },

    cargarDatosExistentes(datos) {
      // Datos básicos
      this.apellido1 = datos.apellido1 || "";
      this.apellido2 = datos.apellido2 || "";
      this.nombres = datos.nombres || "";
      this.tipoDocumento = datos.tipoDocumento || "";
      this.numDocumento = datos.numDocumento || "";

      // Campos de radio buttons para sexo
      if (datos.sexo === "Femenino") {
        this.sexoF = "Femenino";
        this.sexoM = "";
      } else if (datos.sexo === "Masculino") {
        this.sexoM = "Masculino";
        this.sexoF = "";
      } else {
        this.sexoF = "";
        this.sexoM = "";
      }

      // Campos de radio buttons para nacionalidad
      if (datos.nacionalidad === "Colombiano") {
        this.nacCol = "Colombiano";
        this.nacExt = "";
      } else if (datos.nacionalidad === "Extranjero") {
        this.nacExt = "Extranjero";
        this.nacCol = "";
      } else {
        this.nacCol = "";
        this.nacExt = "";
      }

      this.pais = datos.pais || "";
      this.libretaMilitar = datos.libretaMilitar || "";
      this.numeroLibreta = datos.numeroLibreta || "";
      this.dm = datos.dm || "";

      // Fecha y lugar de nacimiento
      if (datos.fechaNacimiento) {
        this.diaNac = datos.fechaNacimiento.dia || "";
        this.mesNac = datos.fechaNacimiento.mes || "";
        this.anoNac = datos.fechaNacimiento.anio || "";
        this.paisNac = datos.fechaNacimiento.pais || "";
        this.deptoNac = datos.fechaNacimiento.depto || "";
        this.municipioNac = datos.fechaNacimiento.municipio || "";
      }

      // Dirección de correspondencia
      if (datos.direccionCorrespondencia) {
        this.paisCorr = datos.direccionCorrespondencia.pais || "";
        this.deptoCorr = datos.direccionCorrespondencia.depto || "";
        this.municipioCorr = datos.direccionCorrespondencia.municipio || "";
        this.direccionCorr = datos.direccionCorrespondencia.direccion || "";
        this.telefono = datos.direccionCorrespondencia.telefono || "";
        this.email = datos.direccionCorrespondencia.email || "";
      }
    },

    limpiarFormulario() {
      // Limpiar todos los campos
      this.apellido1 = "";
      this.apellido2 = "";
      this.nombres = "";
      this.tipoDocumento = "";
      this.numDocumento = "";
      this.sexoF = "";
      this.sexoM = "";
      this.nacCol = "";
      this.nacExt = "";
      this.pais = "";
      this.libretaMilitar = "";
      this.numeroLibreta = "";
      this.dm = "";
      this.diaNac = "";
      this.mesNac = "";
      this.anoNac = "";
      this.paisNac = "";
      this.deptoNac = "";
      this.municipioNac = "";
      this.paisCorr = "";
      this.deptoCorr = "";
      this.municipioCorr = "";
      this.direccionCorr = "";
      this.telefono = "";
      this.email = "";
    },

    async enviarFormulario() {
      this.cargando = true;
      this.errorEnvio = null;
      this.envioExitoso = false;
      
      const payload = this.generarPayload();
      
      try {
        console.log('📤 Enviando datos personales:', payload);
        const res = await api.post("/datos-personales", payload);
        
        console.log('✅ Respuesta del servidor:', res.data);
        showSuccess("✅ ¡Datos personales guardados correctamente!");
        this.envioExitoso = true;
        this.datosExisten = true; // Ahora ya existen datos

        // Emitir evento para notificar al componente padre
        this.$emit("datosActualizados", res.data);
      } catch (e) {
        console.error('❌ Error al guardar datos personales:', e);
        showError("❌ Error al guardar los datos personales.");
        this.errorEnvio = e.response?.data?.error || e.message;
      } finally {
        this.cargando = false;
      }
    },

    async actualizarDatos() {
      this.cargando = true;
      this.errorEnvio = null;
      this.envioExitoso = false;
      
      const payload = this.generarPayload();
      
      try {
        console.log('📤 Actualizando datos personales:', payload);
        await actualizarDatosPersonales(payload);
        
        showSuccess("✅ ¡Datos personales actualizados correctamente!");
        this.envioExitoso = true;

        // Emitir evento para notificar al componente padre
        this.$emit("datosActualizados", payload);
      } catch (e) {
        console.error('❌ Error al actualizar datos personales:', e);
        showError("❌ Error al actualizar los datos personales.");
        this.errorEnvio = e.response?.data?.error || e.message;
      } finally {
        this.cargando = false;
      }
    },

    generarPayload() {
      return {
        apellido1: this.apellido1.trim(),
        apellido2: this.apellido2.trim(),
        nombres: this.nombres.trim(),
        tipoDocumento: this.tipoDocumento,
        numDocumento: this.numDocumento.trim(),
        sexo: this.sexoF || this.sexoM,
        nacionalidad: this.nacCol || this.nacExt,
        pais: this.pais.trim(),
        libretaMilitar: this.libretaMilitar,
        numeroLibreta: this.numeroLibreta.trim(),
        dm: this.dm.trim(),
        fechaNacimiento: {
          dia: this.diaNac.trim(),
          mes: this.mesNac.trim(),
          anio: this.anoNac.trim(),
          pais: this.paisNac.trim(),
          depto: this.deptoNac.trim(),
          municipio: this.municipioNac.trim(),
        },
        direccionCorrespondencia: {
          pais: this.paisCorr.trim(),
          depto: this.deptoCorr.trim(),
          municipio: this.municipioCorr.trim(),
          direccion: this.direccionCorr.trim(),
          telefono: this.telefono.trim(),
          email: this.email.trim(),
        },
      };
    },
  },
};
</script>

<style scoped>
/* estilos */
.mensaje-ok {
  color: green;
  font-weight: bold;
  margin-top: 10px;
}

.mensaje-error {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}

.boton-guardar, .boton-actualizar {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.boton-guardar {
  background-color: #28a745;
  color: white;
}

.boton-actualizar {
  background-color: #007bff;
  color: white;
  margin-left: 10px;
}

.boton-guardar:disabled, .boton-actualizar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>