<!-- src/views/Hoja3.vue -->
<template>
  <div class="section-general contenido-pagina carta">
    <Header2Component />

    <div class="">
      <ExperienciaTotComponent
        :publico="publico"
        :privado="privado"
        :independiente="independiente"
        :totalAnios="totalAnios"
        :totalMeses="totalMeses"
      />

      <FirmaServidorComponent class="compoFirma" />
      <RecursosHumComponent />
    </div>

    <FooterComponent />
  </div>
</template>

<style scoped>
@media print {
  .carta {
    width: 8.5in !important;
    height: 11in !important;
    padding: 0.4in !important;
    page-break-after: always !important;
    box-sizing: border-box;
  }
}
</style>

<script setup>
import { reactive, computed, ref, onMounted } from "vue";
import Header2Component from "../components/Header2Component.vue";
import ExperienciaTotComponent from "../components/ExperienciaTotComponent.vue";
import FirmaServidorComponent from "../components/FirmaServidorComponent.vue";
import RecursosHumComponent from "../components/RecursosHumComponent.vue";
import FooterComponent from "../components/FooterComponent.vue";
import { useHojaVidaStore } from "../stores/hojaVida";
import api from "../api/axios";

// Store
const hojaStore = useHojaVidaStore();
const experiencias = ref([]);

const publico = reactive({ anios: 0, meses: 0 });
const privado = reactive({ anios: 0, meses: 0 });
const independiente = reactive({ anios: 0, meses: 0 });

const token = localStorage.getItem("token");

onMounted(async () => {
  if (!token) {
    console.error("❌ Token no encontrado");
  } else {
    await cargarExperiencias();
    await hojaStore.cargarHojaDeVida();
  }
});

async function cargarExperiencias() {
  try {
    const response = await api.get("/experiencia");
    experiencias.value = response.data;
    recalcularTotales();
  } catch (error) {
    console.error("❌ Error al cargar experiencias:", error);
  }
}

function calcularDuracion(fechaIngreso, fechaRetiro) {
  const desde = new Date(fechaIngreso);
  const hasta = new Date(fechaRetiro);

  if (isNaN(desde) || isNaN(hasta) || hasta < desde) {
    return { anios: 0, meses: 0 };
  }

  const diffTime = hasta - desde;
  const totalDias = diffTime / (1000 * 60 * 60 * 24);

  // Asumimos 30 días por mes exactos
  const totalMeses = totalDias / 30;
  const anios = Math.floor(totalMeses / 12);
  const meses = Number((totalMeses % 12).toFixed(1)); // ⚠️ Decimales reales

  return { anios, meses };
}

function acumularPorTipo(tipoEntidad, anios, meses) {
  let destino;
  switch (tipoEntidad?.toLowerCase()) {
    case "publica":
      destino = publico;
      break;
    case "privada":
      destino = privado;
      break;
    case "independiente":
      destino = independiente;
      break;
    default:
      console.warn(`⚠️ Tipo no reconocido: ${tipoEntidad}`);
      return;
  }

  // Convertir todo a meses decimales
  const totalActual = destino.anios * 12 + destino.meses;
  const nuevoTotal = anios * 12 + meses;
  const totalFinal = totalActual + nuevoTotal;

  destino.anios = Math.floor(totalFinal / 12);
  destino.meses = Number((totalFinal % 12).toFixed(2)); // Mantener precisión
}

function recalcularTotales() {
  publico.anios = publico.meses = 0;
  privado.anios = privado.meses = 0;
  independiente.anios = independiente.meses = 0;

  experiencias.value.forEach((exp) => {
    if (!exp.fechaIngreso || !exp.fechaRetiro) return;
    const { anios, meses } = calcularDuracion(exp.fechaIngreso, exp.fechaRetiro);
    acumularPorTipo(exp.tipoEntidad, anios, meses);
  });
}

const totalAnios = computed(() => {
  const totalMeses =
    publico.anios * 12 + publico.meses +
    privado.anios * 12 + privado.meses +
    independiente.anios * 12 + independiente.meses;
  return Math.floor(totalMeses / 12);
});

const totalMeses = computed(() => {
  const totalMeses =
    publico.anios * 12 + publico.meses +
    privado.anios * 12 + privado.meses +
    independiente.anios * 12 + independiente.meses;
  return Number((totalMeses % 12).toFixed(2)); // Decimales reales
});
</script>


<style scoped>
/* Agrega estilos si es necesario */
</style>