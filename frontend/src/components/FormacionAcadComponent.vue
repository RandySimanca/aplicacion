<template>
  <form @submit.prevent="enviarFormulario">
    <div class="section">
      <div class="section-title">
        <span class="section-number">2</span> FORMACIÓN ACADÉMICA
      </div>

      <div class="form-group">
        <label>EDUCACIÓN BÁSICA Y MEDIA</label>
        <p class="p">
          MARQUE CON UNA X EL ÚLTIMO GRADO APROBADO (LOS GRADOS DE 1o. A 6o. DE
          BACHILLERATO EQUIVALEN A LOS GRADOS 6o. A 11o. DE EDUCACIÓN BÁSICA
          SECUNDARIA Y MEDIA)
        </p>
      </div>

      <div class="form-row">
        <div class="form-group col-3">
          <label>EDUCACIÓN BÁSICA</label>
          <div style="display: flex; margin-top: 5px">
            <div class="form-group col-2">
              <label for="primaria">PRIMARIA</label>
              <div style="display: flex; margin-top: 5px">
                <div class="checkbox-group" v-for="n in 5" :key="n">
                  <input
                    type="checkbox"
                    :id="`grado-${n}`"
                    name="grado"
                    :checked="selectedGrado === n"
                    @change="selectGrado(n)"
                  />
                  <label :for="`grado-${n}`">{{ n }}o.</label>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group col-2">
            <label for="secundaria">SECUNDARIA</label>
          </div>
          <div style="display: flex; margin-top: 5px">
            <div
              class="checkbox-group"
              v-for="n in [6, 7, 8, 9, 10, 11]"
              :key="n"
            >
              <input
                type="checkbox"
                :id="`grado-${n}`"
                name="grado"
                :checked="selectedGrado === n"
                @change="selectGrado(n)"
              />
              <label :for="`grado-${n}`">{{ n }}o.</label>
            </div>
          </div>
        </div>

        <div class="form-group col-2">
          <label for="titulo-bachiller">TÍTULO OBTENIDO:</label>
          <h2></h2>
          <input
            type="text"
            id="titulo-bachiller"
            class="form-control"
            v-model="tituloBachiller"
          />
        </div>

        <div class="form-group col-2">
          <label>FECHA DE GRADO</label>
          <div style="display: flex; margin-top: 5px">
            <div
              class="form-group col-2"
              style="width: 60px; margin-right: 5px"
            >
              <label for="mes-grado">MES</label>
              <select id="mes-grado" class="form-control" v-model="mesGrado">
                <option disabled value="">Selecciona un mes</option>
                <option value="01">Enero</option>
                <option value="02">Febrero</option>
                <option value="03">Marzo</option>
                <option value="04">Abril</option>
                <option value="05">Mayo</option>
                <option value="06">Junio</option>
                <option value="07">Julio</option>
                <option value="08">Agosto</option>
                <option value="09">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>
            <div class="form-group col-2" style="width: 60px">
              <label for="ano-grado">AÑO</label>
              <input
                type="text"
                id="ano-grado"
                class="form-control"
                v-model="anioGrado"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>EDUCACION SUPERIOR (PREGRADO Y POSTGRADO)</label>
        <p class="p">
          DILIGENCIE ESTE PUNTO EN ESTRICTO ORDEN CRONOLÓGICO, EN MODALIDAD
          ACADÉMICA ESCRIBA: TC (TÉCNICA), TL (TECNOLÓGICA), TE (TECNOLÓGICA
          ESPECIALIZADA), UN (UNIVERSITARIA), ES (ESPECIALIZACIÓN), MG (MAESTRÍA
          O MAGISTER), DOC (DOCTORADO O PHD), RELACIONE AL FRENTE EL NÚMERO DE
          LA TARJETA PROFESIONAL (SI ÉSTA HA SIDO PREVISTA EN UNA LEY).
        </p>
      </div>
      <div v-if="formacionesSuperior.length > 0" class="tabla-container">
      <table class="table">
        <thead>
          <tr>
              <th class="col-modalidad">MODALIDAD ACADÉMICA</th>
              <th class="col-modalidad">No. SEMESTRES APROBADOS</th>
              <th colspan="2">GRADUADO</th>
              <th class="col-titulo">
                NOMBRE DE LOS ESTUDIOS O TÍTULO OBTENIDO
              </th>
              <th class="col-modalidad" colspan="2">FECHA DE TERMINACIÓN</th>
              <th class="col-modalidad">No. DE TARJETA PROFESIONAL</th>
              <th class="col-modalidad">ACCIONES</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th class="col-modalidad">SI</th>
              <th class="col-modalidad">NO</th>
              <th></th>
              <th class="col-modalidad">MES</th>
              <th class="col-modalidad">AÑO</th>
              <th></th>
              <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(formacion, index) in formacionesSuperior" :key="index">
              <td class="col-modalidad">
                <select class="form-control" v-model="formacion.modalidad">
                  <option disabled value="">Seleccione modalidad</option>
                  <option value="TC">TC</option>
                  <option value="TL">TL</option>
                  <option value="TE">TE</option>
                  <option value="UN">UN</option>
                  <option value="ES">ES</option>
                  <option value="MG">MG</option>
                  <option value="DOC">DOC</option>
                </select>
              </td>

              <td class="col-semestre">
                <input class="form-control11" v-model="formacion.semestres" />
              </td>

              <td>
                <input
                  type="radio"
                  :value="'SI'"
                  v-model="formacion.graduado"
                  :name="'graduado-' + index"
                />
              </td>
              <td>
                <input
                  type="radio"
                  :value="'NO'"
                  v-model="formacion.graduado"
                  :name="'graduado-' + index"
                />
              </td>
              <td class="col-modalidad">
                <input class="form-control11" v-model="formacion.titulo" />
              </td>

              <td class="col-mes">
                <input
                  class="form-control11"
                  v-model="formacion.mesTermino"
                  placeholder="mm"
                />
              </td>
              <td class="col-anio">
                <input
                  class="form-control11"
                  v-model="formacion.anioTermino"
                  placeholder="aaaa"
                />
              </td>
              <td class="col-modalidad">
                <input class="form-control11" v-model="formacion.tarjeta" />
              </td>

              <td>
                <button
                  class="btn btn-danger btn-sm no-imprimir"
                  @click.prevent="removeFormacion(index)"
                  title="Eliminar formación"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
      </table>
      </div>

      <button
        type="button"
        class="boton-guardar no-imprimir"
        @click="addFormacion"
      >
        Agregar otra formación
      </button>

      <button
        type="submit"
        class="boton-guardar no-imprimir"
        style="margin-left: 10px"
      >
        {{
          modoEdicion
            ? "Actualizar formacion academica"
            : "Guardar formacion academica"
        }}
      </button>
    </div>
  </form>
</template>

<script>
import api from "../api/axios";
import {
  showSuccess,
  showError,
  showWarning,
  showConfirm,
} from "../utils/showMessage.js";
import { eliminarFormacionSuperior } from "../api/datosAPI"; // ✅ Import estático

export default {
  name: "FormacionAcadComponent",
  props: {
    formacion: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      selectedGrado: null,
      tituloBachiller: "",
      mesGrado: "",
      anioGrado: "",

      // Fila inicial + dinámicas
      formacionesSuperior: [
        {
          modalidad: "",
          semestres: "",
          graduado: "",
          titulo: "",
          mesTermino: "",
          anioTermino: "",
          tarjeta: "",
        },
      ],

      envioExitoso: false,
      errorEnvio: null,
      cargando: false,
      modoEdicion: false,
      formacionId: null,
    };
  },
  mounted() {
    if (this.formacion && Object.keys(this.formacion).length > 0) {
      this.cargarDatosDesdeProps();
    } else {
      this.cargarDatos();
    }
  },
  methods: {
    selectGrado(n) {
      this.selectedGrado = this.selectedGrado === n ? null : n;
    },

    addFormacion() {
      this.formacionesSuperior.push({
        modalidad: "",
        semestres: "",
        graduado: "",
        titulo: "",
        mesTermino: "",
        anioTermino: "",
        tarjeta: "",
      });
    },

    cargarDatosDesdeProps() {
      this.selectedGrado = this.formacion.gradoBasica || null;
      this.tituloBachiller = this.formacion.tituloBachiller || "";
      this.mesGrado = this.formacion.mesGrado || "";
      this.anioGrado = this.formacion.anioGrado || "";
      this.formacionesSuperior = this.formacion.formacionesSuperior || [
        {
          modalidad: "",
          semestres: "",
          graduado: "",
          titulo: "",
          mesTermino: "",
          anioTermino: "",
          tarjeta: "",
        },
      ];
      this.modoEdicion = true;
      this.formacionId = this.formacion._id;
    },

    async cargarDatos() {
      try {
        const response = await api.get("/formacion-academica");
        const datos = response.data;

        if (datos) {
          this.selectedGrado = datos.gradoBasica || null;
          this.tituloBachiller = datos.tituloBachiller || "";
          this.mesGrado = datos.mesGrado || "";
          this.anioGrado = datos.anioGrado || "";
          this.formacionesSuperior = datos.formacionesSuperior || [
            {
              modalidad: "",
              semestres: "",
              graduado: "",
              titulo: "",
              mesTermino: "",
              anioTermino: "",
              tarjeta: "",
            },
          ];
          this.modoEdicion = true;
          this.formacionId = datos._id;
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error al cargar datos:", error);
        }
      }
    },

    async enviarFormulario() {
      this.envioExitoso = false;
      this.errorEnvio = null;
      this.cargando = true;

      if (
        !this.selectedGrado ||
        !this.tituloBachiller ||
        !this.mesGrado ||
        !this.anioGrado
      ) {
        showError("❌ Faltan campos obligatorios.");
        this.cargando = false;
        return;
      }

      const formacion = {
        gradoBasica: this.selectedGrado,
        tituloBachiller: this.tituloBachiller,
        mesGrado: this.mesGrado,
        anioGrado: this.anioGrado,
        formacionesSuperior: this.formacionesSuperior,
      };

      try {
        let response;

        if (this.modoEdicion) {
          response = await api.put("/formacion-academica", formacion);
          showSuccess("✅ ¡Formación académica actualizada correctamente!");
        } else {
          response = await api.post("/formacion-academica", formacion);
          showSuccess("✅ ¡Formación académica guardada correctamente!");

          this.modoEdicion = true;
          this.formacionId = response.data.data._id;
        }

        const result = response.data;
        console.log("✅ Datos procesados:", result);
        this.envioExitoso = true;
      } catch (error) {
        console.error(
          "Error al procesar la formación académica:",
          error.response?.data || error.message
        );

        if (error.response?.status === 404 && this.modoEdicion) {
          showError(
            "❌ No se encontraron datos para actualizar. Creando nuevo registro..."
          );
          this.modoEdicion = false;
          this.enviarFormulario();
          return;
        }

        showError(
          this.modoEdicion
            ? "❌ Ocurrió un error al actualizar la formación académica."
            : "❌ Ocurrió un error al guardar la formación académica."
        );
      } finally {
        this.cargando = false;
      }
    },

    // ✅ MÉTODO CORREGIDO - usando import estático
    // Método actualizado que siempre deja al menos una fila vacía:
    // Método corregido para removeFormacion
    async removeFormacion(index) {
      const formacion = this.formacionesSuperior[index];

      // Si es la única fila, verificar si está vacía
      if (this.formacionesSuperior.length === 1) {
        if (this.esFormacionVacia(formacion)) {
          showError(
            "⚠️ Debe mantener al menos una fila para agregar formaciones"
          );
          return;
        } else {
          // Si la única fila tiene datos, mostrar confirmación especial (Sí/No)
          const confirmacion = await showConfirm({
            title: "Eliminar formación",
            text: "¿Deseas eliminar esta formación? Se creará una nueva fila vacía.",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "No",
          });
          if (!confirmacion) return;
        }
      } else {
        // Si hay múltiples filas, confirmación con modal (Sí/No)
        const confirmacion = await showConfirm({
          title: "Eliminar formación",
          text: "¿Estás seguro de que deseas eliminar esta formación?",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "No",
        });
        if (!confirmacion) return;
      }

      try {
        // Si la formación tiene un ID (ya está en MongoDB) y tenemos el ID del documento
        if (formacion._id && this.formacionId) {
          console.log("🗑️ Eliminando formación de MongoDB:", {
            docId: this.formacionId,
            subId: formacion._id,
          });

          await eliminarFormacionSuperior(this.formacionId, formacion._id);
          showSuccess(
            "✅ Formación eliminada correctamente de la base de datos"
          );
          showWarning(
            "⚠️No olvides actualizar la formacion academica para eliminar completamente la formación."
          );
        }

        // Eliminar del array local
        this.formacionesSuperior.splice(index, 1);

        // CRÍTICO: Asegurar que siempre hay al menos una fila vacía
        this.asegurarFilaVaciaDisponible();

        if (!formacion._id) {
          showSuccess("✅ Formación eliminada del formulario");
        }
      } catch (error) {
        console.error("❌ Error al eliminar:", error);

        if (error.message === "FORMACION_NO_ENCONTRADA") {
          // La formación no existe en MongoDB, solo la quitamos localmente
          this.formacionesSuperior.splice(index, 1);
          this.asegurarFilaVaciaDisponible();
          showSuccess(
            "✅ Formación eliminada. Guarda el formulario para confirmar los cambios."
          );
        } else {
          showError("❌ No se pudo eliminar la formación. Intenta nuevamente.");
        }
      }
    },

    // Método auxiliar mejorado para verificar si una formación está vacía
    esFormacionVacia(formacion) {
      return (
        !formacion.modalidad?.trim() &&
        !formacion.semestres?.trim() &&
        !formacion.graduado?.trim() &&
        !formacion.titulo?.trim() &&
        !formacion.mesTermino?.trim() &&
        !formacion.anioTermino?.trim() &&
        !formacion.tarjeta?.trim()
      );
    },

    // Método auxiliar para asegurar que siempre hay una fila vacía disponible
    asegurarFilaVaciaDisponible() {
      // Si no hay filas, crear una
      if (this.formacionesSuperior.length === 0) {
        this.addFormacion();
        return;
      }

      // Verificar si hay al menos una fila vacía
      const hayFilaVacia = this.formacionesSuperior.some((formacion) =>
        this.esFormacionVacia(formacion)
      );

      // Si no hay ninguna fila vacía, agregar una nueva
      if (!hayFilaVacia) {
        this.addFormacion();
        console.log("✅ Se agregó una nueva fila vacía automáticamente");
      }
    },

    // Método addFormacion mejorado (opcional)
    addFormacion() {
      const nuevaFormacion = {
        modalidad: "",
        semestres: "",
        graduado: "",
        titulo: "",
        mesTermino: "",
        anioTermino: "",
        tarjeta: "",
      };

      this.formacionesSuperior.push(nuevaFormacion);

      // Scroll suave hacia la nueva fila (opcional)
      this.$nextTick(() => {
        const tabla = document.querySelector(".table tbody");
        if (tabla) {
          const ultimaFila = tabla.lastElementChild;
          if (ultimaFila) {
            ultimaFila.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
    },
  },
};
</script>

<style scoped>
/* Estilos adicionales para el nuevo diseño */
.tabla-container {
  margin: 1rem 0;
}

.sin-formaciones-mensaje {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 0.25rem;
  margin: 1rem 0;
}

.texto-sin-datos {
  color: #6c757d;
  font-style: italic;
  margin: 0;
}

.botones-accion {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.boton-agregar {
  background-color: #17a2b8 !important;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.boton-agregar:hover {
  background-color: #138496 !important;
}

.boton-guardar-formacion {
  background-color: #28a745 !important;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.boton-guardar-formacion:hover {
  background-color: #218838 !important;
}

/* Ajuste general para inputs */

@media print {
  .col-modalidad-academica,
  .col-semestres {
    width: 70px !important;
  }

  .col-titulo {
    width: 300px !important;
  }

  select,
  input {
    font-size: 9px !important;
    padding: 1px !important;
    height: auto !important;
    vertical-align: top !important;
  }
}

.form-control11 {
  width: 100%;
  padding: 3px; /* Reducido */
  border: 1px;
  box-sizing: border-box;
}


/* Columnas angostas */
.col-modalidad,
.col-semestres {
  width: 20px;
  max-width: 100px;


}

/* Columna más ancha para título */
.col-titulo {
  width: 280px;
  max-width: 100%;
}

/* Ajuste para inputs internos */
.col-modalidad select,
.col-semestres input,
.col-titulo input {
  width: 100%;
  font-size: 12px;
  padding: 2px 4px;
  box-sizing: border-box;
}



</style>

