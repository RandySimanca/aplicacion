<!-- src/views/Hoja1.vue -->
<template>
  <!-- Sección del encabezado -->
  <div class="section-general contenido-pagina carta carta-compacta">
    <div class="header-section">
      <HeaderComponent />
    </div>
    <form @submit.prevent="enviarFormulario" class="form-principal">
      <!-- Sección de datos cargados -->
      <div
        v-if="hojaStore.cargado"
        class="datos-formacion-wrap compact contenido-pagina contenido-compacto"
      >
        <div class="componente-seccion">
          <DatosPerComponent :datos="hojaStore.datosPersonales || {}" />
        </div>

        <div class="componente-seccion">
          <FormacionAcadComponent
            :formacion="hojaStore.formacionAcademica || {}"
          />
        </div>

        <div class="componente-seccion">
          <IdiomasComponent />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
/** ─────── 🔧 Imports ─────── **/
import { onMounted, ref } from "vue";
import { useHojaVidaStore } from "../stores/hojaVida";
import { useDatosStore } from "../stores/datos";
import { useUsuarioStore } from "../stores/usuarios";
import api from "../api/axios.js";
import html2pdf from "html2pdf.js";

/** ─────── 🧠 Componentes ─────── **/
import HeaderComponent from "../components/HeaderComponent.vue";
import DatosPerComponent from "../components/DatosPerComponent.vue";
import FormacionAcadComponent from "../components/FormacionAcadComponent.vue";
import FooterComponent from "../components/FooterComponent.vue";
import IdiomasComponent from "../components/IdiomasComponent.vue";

/** ─────── 🗂️ Instancias de stores ─────── **/
const hojaStore = useHojaVidaStore();
const datosStore = useDatosStore();
const usuarioStore = useUsuarioStore();

/** ─────── 🔐 Cargar datos si hay token ─────── **/
const token = localStorage.getItem("token");

onMounted(async () => {
  if (!token) {
    console.error("❌ Token no encontrado");
  } else {
    console.log("✅ Token válido:", token);
    console.log("🔄 Iniciando carga de datos...");

    await hojaStore.cargarHojaDeVida();

    console.log("🔍 Estado final del store:", {
      datosPersonales: hojaStore.datosPersonales,
      formacionAcademica: hojaStore.formacionAcademica,
      idiomas: hojaStore.idiomas,
      cargado: hojaStore.cargado,
    });
  }
});

/** ─────── 📤 Envío de formulario (solo si deseas guardar) ─────── **/
const safeValue = (val) => (val !== undefined ? val : ""); // Protección básica

const enviarFormulario = async () => {
  const datosPersonales = {
    apellido1: safeValue(apellido1?.value),
    apellido2: safeValue(apellido2?.value),
    nombres: safeValue(nombres?.value),
    tipoDocumento: cedula?.value
      ? "C.C."
      : cedulExt?.value
      ? "C.E."
      : pasaporte?.value
      ? "PAS."
      : "",
    sexo: sexoF?.value ? "F" : sexoM?.value ? "M" : "",
    nacionalidad: nacionalidad?.value
      ? "Colombiana"
      : nacExt?.value
      ? "Extranjera"
      : "",
    pais: safeValue(pais?.value),
    libretaMilitar: safeValue(libretaMilitar?.value),
    numeroLibreta: safeValue(numeroLibreta?.value),
    dm: safeValue(dm?.value),
    fechaNacimiento: {
      dia: safeValue(diaNac?.value),
      mes: safeValue(mesNac?.value),
      ano: safeValue(anoNac?.value),
    },
    lugarNacimiento: {
      pais: safeValue(paisNac?.value),
      depto: safeValue(deptoNac?.value),
      municipio: safeValue(municipioNac?.value),
    },
    direccion: {
      pais: safeValue(paisCorr?.value),
      depto: safeValue(deptoCorr?.value),
      municipio: safeValue(municipioCorr?.value),
      direccion: safeValue(direccionCorr?.value),
      telefono: safeValue(telefono?.value),
      email: safeValue(email?.value),
    },
    formacionAcademica: [
      {
        modalidad: safeValue(modalidad1?.value),
        semestres: safeValue(semestres1?.value),
        graduado: safeValue(graduado1?.value),
        titulo: safeValue(titulo1?.value),
        mes: safeValue(mes1?.value),
        ano: safeValue(ano1?.value),
        tarjeta: safeValue(tarjeta1?.value),
      },
      {
        modalidad: safeValue(modalidad2?.value),
        semestres: safeValue(semestres2?.value),
        graduado: safeValue(graduado2?.value),
        titulo: safeValue(titulo2?.value),
        mes: safeValue(mes2?.value),
        ano: safeValue(ano2?.value),
        tarjeta: safeValue(tarjeta2?.value),
      },
      {
        modalidad: safeValue(modalidad3?.value),
        semestres: safeValue(semestres3?.value),
        graduado: safeValue(graduado3?.value),
        titulo: safeValue(titulo3?.value),
        mes: safeValue(mes3?.value),
        ano: safeValue(ano3?.value),
        tarjeta: safeValue(tarjeta3?.value),
      },
    ],
  };

  try {
    const respuesta = await api.post("/datos-personales", datosPersonales, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Datos enviados con éxito:", respuesta.data);
  } catch (error) {
    console.error(
      "❌ Error al enviar datos:",
      error.response?.data || error.message
    );
  }
};

const hojaRef = ref(null);

function generarPDF() {
  if (!hojaRef.value) {
    console.error("❌ No se encontró el elemento hojaDeVidaPDF");
    return;
  }

  const opciones = {
    margin: 0.2,
    filename: "hoja-de-vida.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  html2pdf().set(opciones).from(elemento).save();
}
</script>

<style scoped>

</style>

<style scoped>
/* ===== ESTILOS OPTIMIZADOS PARA UNA SOLA PÁGINA ===== */
.section {
  padding: 1rem; /* Reducido de 2rem */
}

/* Carta compacta - optimizada para una página */
.carta-compacta {
  min-height: auto !important;
  max-height: none !important;
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Espacio mínimo entre secciones */
}

/* Header compacto */
.header-section {
  flex-shrink: 0;
  margin-bottom: 0.5rem;
}

/* Formulario principal sin espacios excesivos */
.form-principal {
  flex: 1;
  margin-bottom: 0;
}

/* Contenedor de datos compacto */
.contenido-compacto {
  display: flex;
  flex-direction: column;
  gap: 0.3rem; /* Espacio muy reducido entre componentes */
  margin: 0;
  padding: 0;
}

/* Secciones de componentes compactas */
.componente-seccion {
  margin: 0;
  padding: 0;
}

/* Optimización específica para el componente de idiomas */
.componente-idiomas {
  margin-top: 0.2rem;
}

/* Override para elementos internos de los componentes */
.componente-seccion .section {
  padding: 0.5rem; /* Padding reducido para secciones internas */
  margin-bottom: 0.3rem;
}

/* Optimización para tablas */
.componente-seccion .table {
  margin-bottom: 0.5rem;
  font-size: 11px; /* Texto más pequeño para aprovechar espacio */
}

/* Optimización para form-groups */
.componente-seccion .form-group {
  margin-bottom: 0.3rem;
}

.componente-seccion .form-row {
  margin: 0.2rem;
}

/* Reducir espaciado en párrafos explicativos */
.componente-seccion .p {
  font-size: 10px;
  margin-bottom: 0.2rem;
  line-height: 1.2;
}

/* Optimización para títulos de sección */
.componente-seccion .section-title {
  margin-bottom: 0.3rem;
  padding: 1px;
}

/* Ocultar botones al generar PDF */
.generando-pdf .no-imprimir {
  display: none !important;
}
</style>

<style>
/* ESTILOS GLOBALES OPTIMIZADOS */
button {
  padding: 8px 16px; /* Reducido de 10px 20px */
  background-color: #4caf50;
  border: none;
  color: white;
  font-size: 14px; /* Reducido de 16px */
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.boton-guardar {
  background-color: #28a745;
  color: white;
  padding: 8px 16px; /* Reducido */
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
}

.boton-actualizar {
  background-color: #1e90ff;
  color: white;
  padding: 8px 16px; /* Reducido */
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 20px; /* Reducido de 30px */
  font-size: 13px;
}

.boton-guardar:hover {
  background-color: #2980b9;
}

.h1 {
  font-size: 18px; /* Reducido de 20px */
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
  color: #ffffff;
  letter-spacing: 1px;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
}

.main-content {
  flex-grow: 1;
  padding: 20px; /* Reducido de 24px */
  height: 100%;
  overflow-y: auto;
}

.header {
  background-color: #24292e;
  color: #fff;
  padding: 12px; /* Reducido de 16px */
  margin-bottom: 16px; /* Reducido de 24px */
  border-radius: 12px;
  text-align: center;
}

.h1 {
  color: #f10c0c;
  text-align: center;
  margin-bottom: 16px; /* Reducido de 24px */
}

.boton-cerrar {
  background-color: #ef4444;
  color: white;
  padding: 6px 12px; /* Reducido */
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.boton-cerrar:hover {
  background-color: #dc2626;
}

.saludo {
  font-family: "Poppins", sans-serif;
  font-size: 1rem; /* Reducido */
  color: #2c3e50;
  padding: 0.5rem 0.8rem; /* Reducido */
  background-color: #f8f9fa;
  border-left: 4px solid #34495e;
  border-radius: 6px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
}

.saludo strong {
  color: #1a1a1a;
  font-weight: 600;
}

.saludo {
  text-align: center;
  margin-bottom: 16px; /* Reducido */
}

.saludo {
  display: block;
  margin-bottom: 16px; /* Reducido */
}

.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar {
  width: 240px;
  background: linear-gradient(135deg, #1d1f27, #2c2f36);
  color: #f1f1f1;
  padding: 20px;
  height: 100%;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  font-family: "Segoe UI", sans-serif;
}

.sidebar-menu li {
  margin-bottom: 12px; /* Reducido */
}

.sidebar-menu a {
  display: block;
  padding: 10px 14px; /* Reducido */
  color: #e0e0e0;
  background-color: transparent;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.sidebar-menu a:hover,
.sidebar-menu a.router-link-exact-active {
  background-color: #00d8ff22;
  color: #00d8ff;
  font-weight: 600;
  border-left: 4px solid #00d8ff;
}

.sidebar {
  width: 220px;
  background-color: #1d2024;
  color: white;
  padding: 20px;
  height: 100%;
}
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 12px; /* Reducido */
}

.sidebar-menu a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.sidebar-menu a:hover {
  color: #00d8ff;
}

.section-scrol {
  flex: 1;
  overflow-y: auto;
  padding: 16px; /* Reducido */
  scroll-behavior: smooth;
}

.section {
  border: 2px solid rgb(0, 204, 255);
  padding: 8px; /* Reducido de 10px */
  gap: 8px; /* Reducido */
  display: block;
  border-radius: 18px;
  flex-direction: row;
  gap: 1px;
  align-items: flex-start;
  margin-top: 0;
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 1);
  box-sizing: border-box;
}

.section-general {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0;
  margin-bottom: 16px; /* Muy reducido de 40px */
  margin-top: 8px; /* Reducido */
}

.contenido-pagina {
  flex: 1;
  overflow: hidden;
}

.section-title {
  background-color: rgb(10, 10, 10);
  padding: 2px;
  margin-bottom: 3px; /* Reducido */
  font-weight: bold;
  color: #ccc;
  max-width: fit-content;
  border-radius: 5px;
}

.section-number {
  display: inline-block;
  width: 18px; /* Reducido */
  height: 18px; /* Reducido */
  background-color: #b4b4b4;
  color: rgb(255, 255, 255);
  text-align: center;
  border-radius: 50%;
  margin-right: 8px; /* Reducido */
}

.container1 {
  border: 5px solid rgb(0, 204, 255);
  border-radius: 18px;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1px;
  border: 2px solid rgb(0, 204, 255);
  border-radius: 18px;
  flex-direction: row;
  gap: 80px; /* Reducido de 100px */
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 1);
}

.image-column,
.form-group {
  flex: 1;
}

.declaration p {
  font-size: 11px; /* Reducido */
  color: #333;
  margin: 0;
  font-weight: bold;
}

.declaration td {
  font-size: 11px; /* Reducido */
  color: #333;
  margin: 0;
  font-weight: bold;
}

header {
  text-align: center;
}

.main-section {
  display: flex;
}

.header h2,
.header h3,
.header p {
  margin: 3px 0; /* Reducido */
  color: #f8f6f6;
}

.header {
  margin-top: 0;
  align-items: center;
  background-color: #117de9;
  color: rgb(253, 252, 252);
  padding: 12px 24px; /* Reducido */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  font-family: "Segoe UI", sans-serif;
  padding-top: 0;
  display: flex;
  justify-content: center;
  text-align: center;
}

form {
  margin-bottom: 3px; /* Reducido */
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 1px; /* Reducido */
  font-size: 10px; /* Reducido */
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin: 3px; /* Reducido */
  outline: 2px solid #808080;
}

.form-group {
  margin-right: 3px; /* Reducido */
  margin-bottom: 1px; /* Reducido */
  flex: 1;
}

.form-control {
  width: 70%;
  padding: 0px;
  box-sizing: border-box;
  height: 22px; /* Reducido */
}

.form-control1 {
  width: 100%;
  padding: 3px; /* Reducido */
  border: 1px solid #ccc;
  box-sizing: border-box;
}

  .form-control11 {
  width: 100%;
  padding: 3px; /* Reducido */
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.form-control2 {
  width: 50%;
  padding: 3px; /* Reducido */
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.form-control3 {
  width: 30%;
  padding: 3px; /* Reducido */
  box-sizing: border-box;
  height: 26px; /* Reducido */
}

.checkbox-group {
  display: flex;
  align-items: left;
  margin-right: 3px; /* Reducido */
}

.checkbox-group input {
  margin-left: 0px;
}

.imagen {
  width: 90px; /* Reducido */
  height: 108px; /* Reducido */
  border: 1px solid #ccc;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 6px; /* Reducido */
}

.table th,
.table td {
  border: 1px solid #ccc;
  padding: 1px;
  text-align: center;
  font-size: 10px; /* Reducido */
}

.table th {
  background-color: #f0f0f0;
}

.btn btn-danger {
  line-height: 1;
  padding: 0.3rem 0.6rem; /* Reducido */
}

.compacto h3,
.compacto h2,
.compacto p {
  margin-top: 0;
  margin-bottom: 2px; /* Reducido */
  text-align: center;
}

.col-2 {
  flex: 10 0 10%;
}
.col-3 {
  flex: 0 0 30%;
}
.col-4 {
  flex: 0 0 23%;
}

.p {
  font-size: 10px; /* Reducido */
}

.datos-formacion-wrap.compact {
  display: flex;
  flex-direction: column;
  gap: 4px; /* Reducido */
  margin-top: 0;
}

.datos-formacion-wrap.compact > * {
  margin-top: 0;
  margin-bottom: 0;
}

/* Tamaño carta en impresión - OPTIMIZADO */
@media print {
  .carta {
    width: 8.5in !important;
    height: 11in !important;
    padding: 0.3in !important; /* Margen reducido para aprovechar más espacio */
    page-break-after: always !important;
    box-sizing: border-box;
  }
  
  .carta-compacta {
    height: 10.4in !important; /* Altura máxima aprovechable */
    overflow: hidden !important;
  }
  
  .carta:last-child {
    page-break-after: auto;
  }
  
  /* Optimizaciones adicionales para impresión */
  .section {
    padding: 0.2rem !important;
  }
  
  .table th,
  .table td {
    font-size: 9px !important;
    padding: 1px !important;
  }
  
  .form-group label {
    font-size: 9px !important;
  }
  
  /* Ocultar solo al imprimir */
  .no-imprimir {
    display: none !important;
  }
}

.no-experiencias-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem; /* Reducido */
}

.no-experiencias-message {
  background: #fff;
  border-radius: 15px;
  padding: 1.5rem; /* Reducido */
  max-width: 450px; /* Reducido */
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.no-experiencias-message:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.icon-large {
  font-size: 2.5rem; /* Reducido */
  color: #6b7280;
  margin-bottom: 0.8rem; /* Reducido */
}

.no-experiencias-message h3 {
  color: #111827;
  font-size: 1.2rem; /* Reducido */
  font-weight: 600;
  margin-bottom: 0.6rem; /* Reducido */
}

.no-experiencias-message p {
  color: #4b5563;
  font-size: 0.9rem; /* Reducido */
  line-height: 1.4; /* Reducido */
  margin-bottom: 1.2rem; /* Reducido */
}

.btn-recordatorio {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #fff;
  font-weight: 600;
  padding: 0.6rem 1.2rem; /* Reducido */
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.btn-recordatorio:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  transform: translateY(-2px);
}

.compoFirma {
  height: 300px; /* Reducido */
}
</style>
