<template>
  <div class="section">
    <Header2Component />

    <Experiencia2Component :experiencia="experienciaNueva" />

    <FooterComponent />
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Header2Component from "../components/Header2Component.vue";
import FooterComponent from "../components/FooterComponent.vue";
import Experiencia2Component from "../components/Experiencia2Component.vue";
import api from "../api/axios.js";
import { showSuccess, showError } from "../utils/showMessage.js";
import { useHojaVidaStore } from "../stores/hojaVida"; // ✅ Agregado

const hojaStore = useHojaVidaStore(); // ✅ Declarado




const router = useRouter();
const token = localStorage.getItem("token");

onMounted(async () => {

  if (!token) {
    console.error("❌ Token no encontrado. Redirigiendo o mostrando fallback...");
    // Puedes redirigir al login si usas vue-router
  } else {
    hojaStore.cargarHojaDeVida(); // ✅ Acción del store
    console.log("✅ Token válido:", token);
  }

});



const experienciaNueva = ref({
  tipo: "",
  ingreso: { dia: "", mes: "", anio: "" },
  retiro: { dia: "", mes: "", anio: "" },
  empresa: "",
  pais: "",
  departamento: "",
  municipio: "",
  correo: "",
  telefonos: "",
  cargo: "",
  dependencia: "",
  direccion: "",
});

function construirFecha(fecha) {
  const { dia, mes, anio } = fecha;
  return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

async function guardarExperiencia() {
  try {
    const payload = {
      ...experienciaNueva.value,
      fechaIngreso: construirFecha(experienciaNueva.value.ingreso),
      fechaRetiro: construirFecha(experienciaNueva.value.retiro),
    };
    delete payload.ingreso;
    delete payload.retiro;

    await api.post("/experiencia", payload);
    showSuccess("✅ Experiencia guardada con éxito");

    experienciaNueva.value = {
      tipo: "",
      ingreso: { dia: "", mes: "", anio: "" },
      retiro: { dia: "", mes: "", anio: "" },
      empresa: "",
      pais: "",
      departamento: "",
      municipio: "",
      correo: "",
      telefonos: "",
      cargo: "",
      dependencia: "",
      direccion: "",
    };
  } catch (error) {
    console.error("❌ Error al guardar experiencia:", error);
    showError("❌ Error al guardar experiencia");
  }
}
</script>

<style scoped>
/* Puedes mantener tu estilo si ya tienes botones o clases definidas */
</style>
