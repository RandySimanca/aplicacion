<template>
    <div>
      <!-- Selector de modo de generación -->
      <div class="modo-selector">
        <h4>Tipo de PDF</h4>
        <label>
          <input type="radio" v-model="modoGeneracion" value="html" />
          <span>Diseño personalizado</span>
        </label>
        <label>
          <input type="radio" v-model="modoGeneracion" value="oficial" />
          <span>Formato oficial gobierno</span>
        </label>
      </div>
  
      <!-- Vista previa del diseño personalizado -->
      <div
        id="documento-pdf"
        ref="documento"
        class="pdf-root"
        :class="{ 'generando-pdf': generando }"
        v-show="modoGeneracion === 'html'"
      >
        <Hoja1 />
        <Hoja2 />
        <Hoja3 />
      </div>

      <!-- ✅ NUEVA: Vista previa del formato oficial -->
      <div v-show="modoGeneracion === 'oficial'" class="vista-previa-oficial">
        <div class="controles-vista-previa">
          <button 
            @click="generarVistaPrevia" 
            class="btn-previa"
            :disabled="cargandoPrevia"
          >
            <span v-if="!cargandoPrevia">🔄 {{ urlPrevia ? 'Actualizar' : 'Generar' }} Vista Previa</span>
            <span v-else>⏳ Generando...</span>
          </button>
          <button 
            v-if="urlPrevia" 
            @click="cerrarVistaPrevia" 
            class="btn-cerrar-previa"
          >
            ❌ Cerrar Vista Previa
          </button>
        </div>

        <div v-if="urlPrevia" class="contenedor-iframe">
          <iframe 
            :src="urlPrevia" 
            class="iframe-pdf"
            title="Vista previa del PDF oficial"
          ></iframe>
        </div>

        <div v-else class="mensaje-sin-previa">
          <div class="icono-documento">📄</div>
          <h3>Vista previa del formato oficial</h3>
          <p>Haz clic en "Generar Vista Previa" para ver cómo se verá tu hoja de vida en el formato oficial del gobierno.</p>
          <p class="nota-info">💡 La vista previa no consume tus descargas disponibles</p>
        </div>
      </div>
  
      <!-- Botón de generar/descargar PDF -->
      <button
        class="pdf-button"
        :disabled="generando"
        :class="{ 'limite-alcanzado': limiteAlcanzado }"
        :aria-busy="generando ? 'true' : 'false'"
        @click="generarPDF"
        :title="
          limiteAlcanzado ? 'Click para ver opciones de contacto' : 'Generar PDF'
        "
      >
        <span
          v-if="!generando && !limiteAlcanzado"
          class="btn-icon"
          aria-hidden="true"
          >📄</span
        >
        <span v-else-if="limiteAlcanzado" class="btn-icon" aria-hidden="true"
          >🔒</span
        >
        <span v-else class="spinner" aria-hidden="true"></span>
        <span class="btn-text">
          {{
            limiteAlcanzado
              ? "Generar PDF (Límite alcanzado)"
              : generando
              ? "Generando..."
              : `Descargar PDF (${descargasRestantes}/${limiteDescargas})`
          }}
        </span>
      </button>
  
      <!-- Modal de límite alcanzado -->
      <div v-if="mostrarModalLimite" class="modal-overlay" @click="cerrarModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>🔒 Descargas en modo gratis alcanzado</h3>
            <button @click="cerrarModal" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <p>
              Has alcanzado el límite máximo de
              <strong>{{ limiteDescargas }} descargas</strong> de tu hoja de vida
              en PDF en el modo gratuito.
            </p>
            <p>
              Para continuar descargando, contacta al administrador del sistema:
            </p>
  
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-icon">🙋</span>
                <span>Randy Simanca</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span>+57 314 519 3285</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📧</span>
                <span>randysimancamercado@gmail.com</span>
              </div>
            </div>
  
            <div class="codigo-desbloqueo">
              <label for="codigo-input">Código de desbloqueo:</label>
              <input
                type="text"
                id="codigo-input"
                v-model="codigoDesbloqueo"
                placeholder="Ingrese el código proporcionado"
                class="codigo-input"
              />
              <button @click="verificarCodigo" class="btn-verificar">
                Verificar
              </button>
            </div>
  
            <p class="note">
              El administrador podrá restablecer tu contador de descargas o
              proporcionarte un código de desbloqueo.
            </p>
          </div>
          <div class="modal-footer">
            <button @click="cerrarModal" class="btn-secondary">Cerrar</button>
            <button @click="copiarContacto" class="btn-primary">
              {{ textoCopiado ? "✓ Copiado" : "Copiar numero de contacto" }}
            </button>
          </div>
        </div>
      </div>
  
      <!-- Contador visual -->
      <div class="contador-info" v-if="!limiteAlcanzado">
        <span class="contador-text"
          >Descargas disponibles: {{ descargasRestantes }}</span
        >
        <div class="contador-barra">
          <div
            class="contador-progreso"
            :style="{ width: `${(descargasUsadas / limiteDescargas) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, nextTick, computed, onMounted, onBeforeUnmount } from "vue";
  import html2pdf from "html2pdf.js";
  import { useFormatoOficialHV } from "../composables/useFormatoOficialHV";
  import Hoja1 from "./Hoja1.vue";
  import Hoja2 from "./Hoja2.vue";
  import Hoja3 from "./Hoja3.vue";
  import { useRoute } from "vue-router";
  import { useUsuarioStore } from "../stores/usuarios";
  import api from "../api/axios";
  
  const documento = ref(null);
  const generando = ref(false);
  const nombre = ref("Invitado");
  const route = useRoute();
  const usuarioStore = useUsuarioStore();
  const modoGeneracion = ref("oficial");
  
  // ✅ NUEVAS: Variables para vista previa
  const urlPrevia = ref(null);
  const cargandoPrevia = ref(false);
  
  const { llenarFormatoOficial, descargarPDF, mapearDatosUsuario } = useFormatoOficialHV();
  
  // =========================
  // 🔢 SISTEMA DE DESCARGAS
  // =========================
  const limiteDescargas = ref(10);
  const descargasUsadas = ref(0);
  const mostrarModalLimite = ref(false);
  const textoCopiado = ref(false);
  const codigoDesbloqueo = ref("");
  
  const descargasRestantes = computed(
    () => limiteDescargas.value - descargasUsadas.value
  );
  const limiteAlcanzado = computed(
    () => descargasUsadas.value >= limiteDescargas.value
  );
  
  onMounted(() => {
    const datos = JSON.parse(localStorage.getItem("usuario"));
    if (datos?.nombre) nombre.value = datos.nombre;
    cargarContadorDescargas();
  });

  // ✅ LIMPIAR URL al desmontar componente
  onBeforeUnmount(() => {
    if (urlPrevia.value) {
      URL.revokeObjectURL(urlPrevia.value);
    }
  });
  
  // =========================
  // 🧮 CONTADOR LOCAL
  // =========================
  function cargarContadorDescargas() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const userId = usuario?.id || "anonimo";
    const key = `descargas_pdf_${userId}`;
    const datos = localStorage.getItem(key);
    if (datos) {
      const info = JSON.parse(datos);
      descargasUsadas.value = info.usadas || 0;
      limiteDescargas.value = info.limite || 10;
    }
  }
  
  function guardarContadorDescargas() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const userId = usuario?.id || "anonimo";
    const key = `descargas_pdf_${userId}`;
    const info = {
      usadas: descargasUsadas.value,
      limite: limiteDescargas.value,
      ultimaDescarga: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(info));
  }
  
  // =========================
  // 📥 OBTENER DATOS COMPLETOS
  // =========================
  async function obtenerDatosCompletos() {
    try {
      console.log("📥 Obteniendo todos los datos desde la API...");
  
      const [resDatos, resFormacion, resIdiomas, resExperiencia] = await Promise.all([
        api.get("/datos-personales").catch(() => ({ data: {} })),
        api.get("/formacion-academica").catch(() => ({ data: {} })),
        api.get("/idiomas").catch(() => ({ data: { idiomas: [] } })),
        api.get("/experiencia").catch(() => ({ data: [] }))
      ]);
  
      console.log("✅ Datos personales:", resDatos.data);
      console.log("✅ Formación:", resFormacion.data);
      console.log("✅ Idiomas:", resIdiomas.data);
      console.log("✅ Experiencia:", resExperiencia.data);
  
      console.log("🎯 gradoBasica desde API:", resFormacion.data?.gradoBasica);
      console.log("🎯 Tipo de gradoBasica:", typeof resFormacion.data?.gradoBasica);
  
      const datosCompletos = {
        ...resDatos.data,
        gradoBasica: resFormacion.data?.gradoBasica,
        tituloBachiller: resFormacion.data?.tituloBachiller || "Bachiller",
        mesGrado: resFormacion.data?.mesGrado || "",
        anioGrado: resFormacion.data?.anioGrado || "",
        formacionesSuperior: resFormacion.data?.formacionesSuperior || [],
        idiomas: resIdiomas.data?.idiomas || [],
        experienciaLaboral: Array.isArray(resExperiencia.data)
          ? resExperiencia.data
          : (resExperiencia.data?.experiencia || []),
      };
  
      console.log("📦 Datos combinados:", datosCompletos);
      console.log("🎯 gradoBasica en datos combinados:", datosCompletos.gradoBasica);
      
      return datosCompletos;
    } catch (error) {
      console.error("❌ Error obteniendo datos:", error);
      throw new Error("No se pudieron cargar los datos de la base de datos");
    }
  }

  // =========================
  // 👁️ NUEVA: GENERAR VISTA PREVIA
  // =========================
  async function generarVistaPrevia() {
    cargandoPrevia.value = true;
    try {
      console.log("👁️ Generando vista previa del PDF oficial...");
      
      // Limpiar URL anterior si existe
      if (urlPrevia.value) {
        URL.revokeObjectURL(urlPrevia.value);
      }

      const datosCompletos = await obtenerDatosCompletos();
      const datosFormateados = mapearDatosUsuario(datosCompletos);
      const pdfDoc = await llenarFormatoOficial(datosFormateados);
      
      // Generar el PDF como Blob
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      
      // Crear URL para el iframe
      urlPrevia.value = URL.createObjectURL(blob);
      
      console.log("✅ Vista previa generada correctamente");
    } catch (error) {
      console.error("❌ Error generando vista previa:", error);
      alert("Error al generar la vista previa. Por favor intente nuevamente.");
    } finally {
      cargandoPrevia.value = false;
    }
  }

  function cerrarVistaPrevia() {
    if (urlPrevia.value) {
      URL.revokeObjectURL(urlPrevia.value);
      urlPrevia.value = null;
    }
  }
  
  // =========================
  // 🧾 GENERAR PDF (DESCARGA)
  // =========================
  async function generarPDF() {
    if (limiteAlcanzado.value) {
      mostrarModalLimite.value = true;
      return;
    }
    generando.value = true;
    try {
      if (modoGeneracion.value === "oficial") {
        await generarPDFOficial();
      } else {
        await generarPDFHTML();
      }
      descargasUsadas.value++;
      guardarContadorDescargas();
      if (limiteAlcanzado.value) {
        setTimeout(() => (mostrarModalLimite.value = true), 1000);
      }
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Por favor intente nuevamente.");
    } finally {
      generando.value = false;
    }
  }
  
  async function generarPDFHTML() {
    await nextTick();
    await new Promise((r) => setTimeout(r, 150));
    const opciones = {
      margin: 0,
      filename: "hoja-de-vida.pdf",
      image: { type: "pdf", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };
    const nombreUsuario = nombre.value?.trim() || "usuario";
    const nombreArchivo = `hoja de vida ${nombreUsuario}.pdf`;
    await html2pdf().set(opciones).from(documento.value).save(nombreArchivo);
  }
  
  async function generarPDFOficial() {
    try {
      console.log("🚀 Iniciando generación de PDF oficial...");
      const datosCompletos = await obtenerDatosCompletos();
      const datosFormateados = mapearDatosUsuario(datosCompletos);
      console.log("📋 Datos formateados para PDF:", datosFormateados);
      const pdfDoc = await llenarFormatoOficial(datosFormateados);
      const nombreUsuario = datosFormateados.nombres?.trim() || "usuario";
      const apellido = datosFormateados.apellido1?.trim() || "";
      const nombreArchivo = `Hoja_Vida_${nombreUsuario}_${apellido}.pdf`.replace(/\s+/g, "_");
      await descargarPDF(pdfDoc, nombreArchivo);
      console.log("✅ PDF generado y descargado exitosamente");
    } catch (error) {
      console.error("❌ Error generando PDF oficial:", error);
      throw error;
    }
  }
  
  // =========================
  // 🔐 FUNCIONES MODAL
  // =========================
  function cerrarModal() {
    mostrarModalLimite.value = false;
    textoCopiado.value = false;
  }
  
  async function copiarContacto() {
    try {
      await navigator.clipboard.writeText("3145193285");
      textoCopiado.value = true;
      setTimeout(() => (textoCopiado.value = false), 2000);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  }
  
  async function verificarCodigo() {
    if (codigoDesbloqueo.value.trim() === "") {
      alert("Por favor ingrese un código de desbloqueo");
      return;
    }
    try {
      const response = await fetch("/api/codigo-desbloqueo/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoDesbloqueo.value.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        descargasUsadas.value = 0;
        guardarContadorDescargas();
        alert("¡Código válido! Se han restablecido tus descargas disponibles.");
        cerrarModal();
      } else {
        alert(data.mensaje || "Código inválido. Intente nuevamente.");
      }
    } catch (error) {
      console.error("Error al verificar código:", error);
      alert("Error al verificar el código. Intente nuevamente.");
    }
    codigoDesbloqueo.value = "";
  }
  </script>
  
  <style scoped>
  /* ========================================
     ESTILOS EXISTENTES
     ======================================== */
  
  .modo-selector {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .modo-selector h4 {
    margin-bottom: 10px;
    color: #333;
  }
  
  .modo-selector label {
    display: flex;
    align-items: center;
    margin: 8px 0;
    cursor: pointer;
  }
  
  .modo-selector input[type="radio"] {
    margin-right: 8px;
  }
  
  .pdf-root {
    margin-bottom: 20px;
  }

  /* ========================================
     ✅ NUEVOS ESTILOS PARA VISTA PREVIA
     ======================================== */

  .vista-previa-oficial {
    margin-bottom: 20px;
  }

  .controles-vista-previa {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    justify-content: center;
  }

  .btn-previa,
  .btn-cerrar-previa {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-previa {
    background: #17a2b8;
    color: white;
  }

  .btn-previa:hover:not(:disabled) {
    background: #138496;
    transform: translateY(-2px);
  }

  .btn-previa:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-cerrar-previa {
    background: #dc3545;
    color: white;
  }

  .btn-cerrar-previa:hover {
    background: #c82333;
  }

  .contenedor-iframe {
    width: 100%;
    height: 800px;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .iframe-pdf {
    width: 100%;
    height: 100%;
    border: none;
  }

  .mensaje-sin-previa {
    text-align: center;
    padding: 60px 20px;
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
  }

  .icono-documento {
    font-size: 80px;
    margin-bottom: 20px;
  }

  .mensaje-sin-previa h3 {
    color: #333;
    margin-bottom: 15px;
  }

  .mensaje-sin-previa p {
    color: #6c757d;
    margin-bottom: 10px;
    font-size: 16px;
  }

  .nota-info {
    color: #17a2b8 !important;
    font-weight: 600;
    margin-top: 20px;
  }
  
  .pdf-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .pdf-button:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .pdf-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .pdf-button.limite-alcanzado {
    background: #dc3545;
  }
  
  .pdf-button.limite-alcanzado:hover {
    background: #c82333;
  }
  
  .btn-icon {
    font-size: 20px;
  }
  
  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
  }
  
  .modal-header h3 {
    margin: 0;
    color: #333;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #6c757d;
    line-height: 1;
  }
  
  .close-btn:hover {
    color: #dc3545;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-body p {
    margin-bottom: 15px;
    color: #555;
  }
  
  .contact-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin: 15px 0;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0;
  }
  
  .contact-icon {
    font-size: 20px;
  }
  
  .codigo-desbloqueo {
    margin: 20px 0;
  }
  
  .codigo-desbloqueo label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }
  
  .codigo-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .btn-verificar {
    width: 100%;
    padding: 10px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }
  
  .btn-verificar:hover {
    background: #218838;
  }
  
  .note {
    font-size: 14px;
    color: #6c757d;
    font-style: italic;
  }
  
  .modal-footer {
    display: flex;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #e9ecef;
  }
  
  .btn-secondary,
  .btn-primary {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }
  
  .btn-secondary {
    background: #6c757d;
    color: white;
  }
  
  .btn-secondary:hover {
    background: #5a6268;
  }
  
  .btn-primary {
    background: #007bff;
    color: white;
  }
  
  .btn-primary:hover {
    background: #0056b3;
  }
  
  /* Contador */
  .contador-info {
    margin-top: 20px;
    text-align: center;
  }
  
  .contador-text {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 600;
  }
  
  .contador-barra {
    width: 100%;
    max-width: 400px;
    height: 10px;
    background: #e9ecef;
    border-radius: 5px;
    overflow: hidden;
    margin: 0 auto;
  }
  
  .contador-progreso {
    height: 100%;
    background: linear-gradient(90deg, #28a745, #ffc107, #dc3545);
    transition: width 0.3s ease;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .contenedor-iframe {
      height: 600px;
    }

    .controles-vista-previa {
      flex-direction: column;
    }

    .btn-previa,
    .btn-cerrar-previa {
      width: 100%;
    }
  }
  </style>
