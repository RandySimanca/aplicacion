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
    
   
  
    <div class="form-group no-imprimir" style="margin-top: 20px">
      <button
        type="submit"
        class="boton-guardar no-imprimir"
        style="margin-left: 10px; background-color: #28a745;"
        :disabled="cargando || datosPrecargados"
      >
        {{ cargando ? "Guardando..." : "Guardar datos personales" }}
        
      </button>
      <button
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

    </div>
  </form>
</template>

<script>
import { showSuccess, showError } from "../utils/showMessage";
import api from "../api/axios";
import { actualizarDatosPersonales } from "../api/datosAPI";

export default {
  props: {
    datos: Object,
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

      datosPrecargados: !!this.datos?._id, // true si los datos vienen precargados

      // feedback visual
      envioExitoso: false,
      errorEnvio: null,
      cargando: false,
    };
  },
  mounted() {
    if (this.datos.tipoDocumento) {
      this.tipoDocumento = this.datos.tipoDocumento;
    }

    if (this.datos) {
      this.apellido1 = this.datos.apellido1 || "";
      this.apellido2 = this.datos.apellido2 || "";
      this.nombres = this.datos.nombres || "";
      this.tipoDocumento = this.datos.tipoDocumento || "";
      this.numDocumento = this.datos.numDocumento || "";

      // Seleccionar automáticamente el documento correspondiente

      // Asignación de valores para los campos de sexo y nacionalidad
      this.sexoF = this.datos.sexo === "Femenino" ? this.datos.sexo : "";
      this.sexoM = this.datos.sexo === "Masculino" ? this.datos.sexo : "";

      this.nacCol =
        this.datos.nacionalidad === "Colombiano" ? this.datos.nacionalidad : "";
      this.nacExt =
        this.datos.nacionalidad === "Extranjero" ? this.datos.nacionalidad : "";
      this.pais = this.datos.pais || "";

      this.libretaMilitar = this.datos.libretaMilitar || "";
      this.numeroLibreta = this.datos.numeroLibreta || "";
      this.dm = this.datos.dm || "";

      this.diaNac = this.datos.fechaNacimiento?.dia || "";
      this.mesNac = this.datos.fechaNacimiento?.mes || "";
      this.anoNac = this.datos.fechaNacimiento?.anio || "";
      this.paisNac = this.datos.fechaNacimiento?.pais || "";
      this.deptoNac = this.datos.fechaNacimiento?.depto || "";
      this.municipioNac = this.datos.fechaNacimiento?.municipio || "";

      this.paisCorr = this.datos.direccionCorrespondencia?.pais || "";
      this.deptoCorr = this.datos.direccionCorrespondencia?.depto || "";
      this.municipioCorr = this.datos.direccionCorrespondencia?.municipio || "";
      this.direccionCorr = this.datos.direccionCorrespondencia?.direccion || "";
      this.telefono = this.datos.direccionCorrespondencia?.telefono || "";
      this.email = this.datos.direccionCorrespondencia?.email || "";
      // ...asigna el resto de campos que recibes desde `this.datos`
    }
  },
  methods: {
    async enviarFormulario() {
      this.cargando = true;
      const payload = this.generarPayload();
      try {
        const res = await api.post("/datos-personales", payload);
        showSuccess("✅ ¡Datos personales guardados correctamente!");
        this.envioExitoso = true;

        // Desactiva el botón de guardar
        this.datosPrecargados = true;

        // Opcional: simular que datos._id fue asignado (por si usas esto en otra parte)
        this.$emit("datosActualizados", res.data); // para notificar al padre si lo deseas
      } catch (e) {
        showError("❌ Error al guardar los datos personales.");
        this.errorEnvio = e.message;
      } finally {
        this.cargando = false;
      }
    },

    async actualizarDatos() {
      this.cargando = true;
      const payload = this.generarPayload();
      try {
        await actualizarDatosPersonales(payload);
        showSuccess("✅ ¡Datos personales actualizados correctamente!");
      } catch (e) {
        showError("❌ Error al actualizar los datos personales.");
        this.errorEnvio = e.message;
      } finally {
        this.cargando = false;
      }
    },
    generarPayload() {
      return {
        apellido1: this.apellido1,
        apellido2: this.apellido2,
        nombres: this.nombres,
        tipoDocumento: this.tipoDocumento,
        numDocumento: this.numDocumento,

        sexo: this.sexoF || this.sexoM,
        nacionalidad: this.nacCol || this.nacExt,

        pais: this.pais,
        libretaMilitar: this.libretaMilitar,
        numeroLibreta: this.numeroLibreta,
        dm: this.dm,
        fechaNacimiento: {
          dia: this.diaNac,
          mes: this.mesNac,
          anio: this.anoNac,
          pais: this.paisNac,
          depto: this.deptoNac,
          municipio: this.municipioNac,
        },
        direccionCorrespondencia: {
          pais: this.paisCorr,
          depto: this.deptoCorr,
          municipio: this.municipioCorr,
          direccion: this.direccionCorr,
          telefono: this.telefono,
          email: this.email,
        },
      };
    },
  },
};
</script>

<style scoped>
/* estilos */
  #municipio-corr {
  width: 100%;
  padding: 4px 8px;
  box-sizing: border-box;
  font-size: 14px;
  white-space: nowrap;
  overflow-x: auto;
  text-overflow: ellipsis;
  height: auto;
}


</style>
