<!--src/FirmaServidorComponent.vue-->
<template>
  <div class="section">
    <div class="section-title">
      <span class="section-number">5</span> FIRMA DEL SERVIDOR PÚBLICO O
      CONTRATISTA
    </div>

    <div class="declaration">
      <p>
        MANIFIESTO BAJO LA GRAVEDAD DEL JURAMENTO QUE SI NO ME ENCUENTRO DENTRO
        DE LAS CAUSALES DE INHABILIDAD E INCOMPATIBILIDAD DEL ORDEN
        CONSTITUCIONAL O LEGAL, PARA EJERCER CARGOS EMPLEOS PÚBLICOS O PARA
        CELEBRAR CONTRATOS DE PRESTACIÓN DE SERVICIOS CON LA ADMINISTRACIÓN
        PÚBLICA.
      </p>
      <p>
        PARA TODOS LOS EFECTOS LEGALES, CERTIFICO QUE LOS DATOS POR MI ANOTADOS
        EN EL PRESENTE FORMATO ÚNICO DE HOJA DE VIDA, SON VERACES (ARTÍCULO 5o.
        DE LA LEY 190/95).
      </p>
    </div>

    <div class="form-group">
      <label for="signing-city">Ciudad:</label>
      <input
        type="text"
        id="signing-city"
        placeholder="Ej: Bogotá"
        v-model="ciudadDiligenciamiento"
      />
    </div>

    <div class="form-group">
      <label for="signing-date">Fecha de diligenciamiento:</label>
      <input type="date" id="signing-date" v-model="fechaDiligenciamiento" />
    </div>

    <div class="signature-area">
      <input
        type="file"
        id="firma"
        accept=".jpg,.jpeg,.png"
        @change="mostrarFirma"
      />
      <div v-if="firmaUrl">
        <img
          :src="firmaUrl"
          alt="Firma cargada"
          style="margin-top: 10px; max-width: 200px; height: auto"
        />
      </div>
      <div class="firma-header">
        <label for="firma">FIRMA DEL SERVIDOR PÚBLICO O CONTRATISTA</label>
        <button @click="guardarFirma" class="no-imprimir">
          Guardar diligenciamiento
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { showSuccess, showError } from "../utils/showMessage"; // mensajes
import { ref, onMounted } from "vue";
import api from "../api/axios";

const ciudadDiligenciamiento = ref("");
const fechaDiligenciamiento = ref("");
const firmaUrl = ref(null);

onMounted(async () => {
  try {
    const response = await api.get("/firma-servidor");
    const data = response.data;
    if (data) {
      ciudadDiligenciamiento.value = data.ciudadDiligenciamiento || "";
      fechaDiligenciamiento.value =
        data.fechaDiligenciamiento?.substring(0, 10) || "";
      firmaUrl.value = data.firmaServidor || null;
    }
  } catch (error) {
    console.error(
      "No se pudo cargar la firma existente:",
      error.response?.data || error.message
    );
  }
});

// Convertir la imagen a base64
const mostrarFirma = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 250;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      firmaUrl.value = canvas.toDataURL("image/png");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Guardar la información al backend
const guardarFirma = async () => {
  try {
    const payload = {
      ciudadDiligenciamiento: ciudadDiligenciamiento.value,
      fechaDiligenciamiento: fechaDiligenciamiento.value,
      firmaServidor: firmaUrl.value,
    };

    const response = await api.post("/firma-servidor", payload); // <-- CORREGIDO
    console.log("✅ Guardado:", response.data);
    showSuccess(
      "✅ Firma y datos de diligenciamiento guardados correctamente."
    );
  } catch (error) {
    console.error(
      "❌ Error al guardar:",
      error.response?.data || error.message
    );
    showError("❌ Ocurrió un error al guardar los datos.");
  }
};
</script>

<style scoped></style>
