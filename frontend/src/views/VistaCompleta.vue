<template>
  <div>
    <div id="documento-pdf" ref="documento" class="pdf-root" :class="{ 'generando-pdf': generando }">
      <Hoja1 />
      <Hoja2 />
      <Hoja3 />
    </div>

    <!-- Botón de generar PDF -->
    <button
      class="pdf-button"
      :disabled="generando"
      :class="{ 'limite-alcanzado': limiteAlcanzado }"
      :aria-busy="generando ? 'true' : 'false'"
      @click="manejarClickBoton"
      :title="limiteAlcanzado ? 'Click para ver opciones de desbloqueo' : 'Generar PDF'"
    >
      <span v-if="!generando && !limiteAlcanzado" class="btn-icon" aria-hidden="true">📄</span>
      <span v-else-if="limiteAlcanzado" class="btn-icon" aria-hidden="true">🔒</span>
      <span v-else class="spinner" aria-hidden="true"></span>
      <span class="btn-text">
        {{ 
          limiteAlcanzado 
            ? 'Generar PDF (Límite alcanzado)' 
            : generando 
              ? 'Generando...' 
              : `Generar PDF (${descargasRestantes}/${limiteDescargas})`
        }}
      </span>
    </button>

    <!-- Modal de límite alcanzado -->
    <div v-if="mostrarModalLimite" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🔒 Límite de descargas alcanzado</h3>
          <button @click="cerrarModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="limit-info">
            <div class="limit-badge">
              <span class="limit-number">{{ limiteDescargas }}</span>
              <span class="limit-text">descargas utilizadas</span>
            </div>
          </div>
          
          <p class="main-message">Has alcanzado el límite máximo de descargas de tu hoja de vida en PDF en el modo gratuito.</p>
          
          <div class="unlock-section">
            <h4>🔓 Desbloquear descargas</h4>
            <p>Ingresa el código de desbloqueo proporcionado por el administrador:</p>
            
            <div class="codigo-desbloqueo">
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="codigo-input" 
                  v-model="codigoDesbloqueo" 
                  placeholder="Código de desbloqueo" 
                  class="codigo-input"
                  @keyup.enter="verificarCodigo"
                />
                <button @click="verificarCodigo" class="btn-verificar" :disabled="!codigoDesbloqueo.trim()">
                  <span v-if="verificandoCodigo" class="spinner-small"></span>
                  <span v-else>Verificar</span>
                </button>
              </div>
              <div v-if="mensajeVerificacion" class="mensaje-verificacion" :class="{ 'error': esError, 'success': !esError }">
                {{ mensajeVerificacion }}
              </div>
            </div>
          </div>
          
          <div class="contact-section">
            <h4>📞 Contactar administrador</h4>
            <p>Para obtener un código de desbloqueo, contacta al administrador:</p>
            
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-icon">👤</span>
                <span>Randy Simanca</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📱</span>
                <span>+57 314 519 3285</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">✉️</span>
                <span>randysimancamercado@gmail.com</span>
              </div>
            </div>
          </div>
          
          <div class="note-section">
            <p class="note">💡 El administrador podrá proporcionarte un código de desbloqueo para continuar con las descargas.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary">Cerrar</button>
          <button @click="copiarContacto" class="btn-primary">
            {{ textoCopiado ? '✅ Copiado' : '📋 Copiar contacto' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Contador visual -->
    <div class="contador-info" v-if="!limiteAlcanzado">
      <div class="contador-header">
        <span class="contador-text">Descargas disponibles</span>
        <span class="contador-numeros">{{ descargasRestantes }}/{{ limiteDescargas }}</span>
      </div>
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
import { ref, nextTick, computed, onMounted } from 'vue';
import html2pdf from 'html2pdf.js';
import Hoja1 from './Hoja1.vue';
import Hoja2 from './Hoja2.vue';
import Hoja3 from './Hoja3.vue';
import { useRoute } from 'vue-router';
import { useUsuarioStore } from '../stores/usuarios';

const documento = ref(null);
const generando = ref(false);
const nombre = ref('Invitado');
const route = useRoute();
const usuarioStore = useUsuarioStore();

// Sistema de contador de descargas
const limiteDescargas = ref(5);
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const textoCopiado = ref(false);
const codigoDesbloqueo = ref('');
const mensajeVerificacion = ref('');
const esError = ref(false);
const verificandoCodigo = ref(false);

// Computed properties
const descargasRestantes = computed(() => limiteDescargas.value - descargasUsadas.value);
const limiteAlcanzado = computed(() => descargasUsadas.value >= limiteDescargas.value);

onMounted(() => {
  const datos = JSON.parse(localStorage.getItem('usuario'));
  if (datos?.nombre) nombre.value = datos.nombre;
  
  // Migrar contadores antiguos si existen
  migrarContadores();
  
  // Cargar contador de descargas
  cargarContadorDescargas();
});

function obtenerUsuarioId() {
  // Obtener ID único del usuario actual
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  
  // Si el usuario tiene ID, usarlo; si no, crear uno basado en email o nombre
  if (usuario?.id) {
    return usuario.id;
  } else if (usuario?.email) {
    return `email_${usuario.email}`;
  } else if (usuario?.nombre) {
    return `nombre_${usuario.nombre}`;
  } else {
    // Si no hay usuario logueado, usar un ID genérico
    return 'usuario_anonimo';
  }
}

function cargarContadorDescargas() {
  const userId = obtenerUsuarioId();
  const key = `pdf_downloads_${userId}`;
  
  const datos = localStorage.getItem(key);
  if (datos) {
    try {
      const info = JSON.parse(datos);
      descargasUsadas.value = info.usadas || 0;
      limiteDescargas.value = info.limite || 5;
      
      // Verificar si los datos son válidos
      if (descargasUsadas.value < 0) descargasUsadas.value = 0;
      if (limiteDescargas.value < 1) limiteDescargas.value = 5;
    } catch (error) {
      console.error('Error al cargar contador:', error);
      // Valores por defecto en caso de error
      descargasUsadas.value = 0;
      limiteDescargas.value = 5;
    }
  } else {
    // Primera vez del usuario - inicializar
    descargasUsadas.value = 0;
    limiteDescargas.value = 5;
    guardarContadorDescargas();
  }
}

function guardarContadorDescargas() {
  const userId = obtenerUsuarioId();
  const key = `pdf_downloads_${userId}`;
  
  const info = {
    userId: userId,
    usadas: descargasUsadas.value,
    limite: limiteDescargas.value,
    ultimaDescarga: new Date().toISOString(),
    fechaCreacion: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(info));
  } catch (error) {
    console.error('Error al guardar contador:', error);
  }
}

// Nueva función para manejar el click del botón
function manejarClickBoton() {
  if (limiteAlcanzado.value) {
    // Si está bloqueado, mostrar modal
    mostrarModalLimite.value = true;
  } else {
    // Si no está bloqueado, generar PDF
    generarPDF();
  }
}

async function generarPDF() {
  // Verificación de seguridad adicional
  if (limiteAlcanzado.value) {
    mostrarModalLimite.value = true;
    return;
  }

  // Asegurar que el DOM y recursos estén listos
  await nextTick();
  await new Promise(r => setTimeout(r, 150));
  generando.value = true;
  
  const opciones = {
    margin: 0,
    filename: 'hoja-de-vida.pdf',
    image: { type: 'pdf', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  
  try {
    const nombreUsuario = nombre.value?.trim() || 'usuario';
    const nombreArchivo = `hoja de vida ${nombreUsuario}.pdf`;
    
    await html2pdf()
      .set(opciones)
      .from(documento.value)
      .save(nombreArchivo);
      
    // Incrementar contador y guardar DESPUÉS de la descarga exitosa
    descargasUsadas.value++;
    guardarContadorDescargas();
    
    // Si se alcanzó el límite, mostrar modal después de un momento
    if (limiteAlcanzado.value) {
      setTimeout(() => {
        mostrarModalLimite.value = true;
      }, 1500);
    }
      
  } catch (error) {
    console.error('Error al generar PDF:', error);
    // En caso de error, no incrementar el contador
    alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
  } finally {
    generando.value = false;
  }
}

function cerrarModal() {
  mostrarModalLimite.value = false;
  textoCopiado.value = false;
  codigoDesbloqueo.value = '';
  mensajeVerificacion.value = '';
  esError.value = false;
}

async function copiarContacto() {
  try {
    const contactoCompleto = 'Randy Simanca - +57 314 519 3285 - randysimancamercado@gmail.com';
    await navigator.clipboard.writeText(contactoCompleto);
    textoCopiado.value = true;
    setTimeout(() => {
      textoCopiado.value = false;
    }, 3000);
  } catch (error) {
    console.error('Error al copiar:', error);
    // Fallback para navegadores que no soportan clipboard API
    try {
      const textArea = document.createElement('textarea');
      textArea.value = '+57 314 519 3285';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      textoCopiado.value = true;
      setTimeout(() => {
        textoCopiado.value = false;
      }, 3000);
    } catch (fallbackError) {
      alert('No se pudo copiar automáticamente. Número: +57 314 519 3285');
    }
  }
}

// Función para verificar el código de desbloqueo
async function verificarCodigo() {
  if (!codigoDesbloqueo.value.trim()) {
    mostrarMensajeVerificacion('Por favor ingrese un código de desbloqueo', true);
    return;
  }
  
  verificandoCodigo.value = true;
  mensajeVerificacion.value = '';
  
  // Simular delay de verificación
  await new Promise(r => setTimeout(r, 800));
  
  // Lista de códigos válidos
  const codigosValidos = [
    'RANDYADMIN1208',
    'HOJA2023', 
    'DESBLOQUEAR', 
    'PDF2023',
    'UNLOCK2024',
    'RESET_DOWNLOADS'
  ];
  
  const codigoIngresado = codigoDesbloqueo.value.trim().toUpperCase();
  
  if (codigosValidos.includes(codigoIngresado)) {
    // Código válido - resetear contador
    descargasUsadas.value = 0;
    guardarContadorDescargas();
    mostrarMensajeVerificacion('¡Código válido! Se han restablecido tus descargas disponibles.', false);
    
    setTimeout(() => {
      cerrarModal();
    }, 2000);
  } else {
    // Código inválido
    mostrarMensajeVerificacion('Código inválido. Contacta al administrador para obtener un código válido.', true);
  }
  
  verificandoCodigo.value = false;
  codigoDesbloqueo.value = '';
}

function mostrarMensajeVerificacion(mensaje, error) {
  mensajeVerificacion.value = mensaje;
  esError.value = error;
  
  // Limpiar mensaje después de un tiempo
  setTimeout(() => {
    if (!error) return; // No limpiar mensajes de éxito automáticamente
    mensajeVerificacion.value = '';
  }, 5000);
}

// Función para desarrollo/testing
function resetearContador() {
  descargasUsadas.value = 0;
  guardarContadorDescargas();
  console.log('Contador reseteado para el usuario:', obtenerUsuarioId());
}

// Función para ver todos los contadores (desarrollo)
function verContadores() {
  const contadores = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('pdf_downloads_')) {
      const data = JSON.parse(localStorage.getItem(key));
      contadores[key] = data;
    }
  }
  console.log('Contadores de descarga:', contadores);
}

// Exponer funciones para desarrollo
if (import.meta.env.DEV) {
  window.resetearContadorPDF = resetearContador;
  window.verContadoresPDF = verContadores;
}
</script>

<style>
.pdf-root { background: #fff; padding: 0.3in; }

.carta { page-break-after: always; }
.carta:last-child { page-break-after: auto; }

.pdf-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  padding: 12px 18px;
  min-width: 180px;
  border-radius: 12px;
  border: none;
  outline: none;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  z-index: 1000;
}

.pdf-button:hover:not(:disabled) { 
  transform: translateY(-2px); 
  box-shadow: 0 12px 24px rgba(0,0,0,0.25); 
}

.pdf-button:disabled { 
  opacity: 0.75; 
  cursor: not-allowed; 
  transform: none; 
  box-shadow: 0 8px 20px rgba(0,0,0,0.15); 
}

.pdf-button.limite-alcanzado {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  cursor: pointer;
  opacity: 1;
}

.pdf-button.limite-alcanzado:hover {
  transform: translateY(-2px); 
  box-shadow: 0 12px 24px rgba(239, 68, 68, 0.4);
}

.btn-icon { font-size: 18px; line-height: 1; }
.btn-text { font-size: 14px; }

/* Contador visual mejorado */
.contador-info {
  position: fixed;
  right: 24px;
  bottom: 90px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  font-size: 12px;
  color: #666;
  z-index: 999;
  border: 1px solid rgba(255,255,255,0.2);
}

.contador-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.contador-text {
  font-weight: 500;
  color: #374151;
}

.contador-numeros {
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.contador-barra {
  width: 140px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.contador-progreso {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
  border-radius: 3px;
}

/* Modal moderno mejorado */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 520px;
  width: 95%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.4);
  animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255,255,255,0.1);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.modal-header h3 {
  margin: 0;
  color: #dc2626;
  font-size: 1.3rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #374151;
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
  line-height: 1.6;
  max-height: 60vh;
  overflow-y: auto;
}

.limit-info {
  text-align: center;
  margin-bottom: 1.5rem;
}

.limit-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 2px solid #fecaca;
}

.limit-number {
  font-size: 2rem;
  font-weight: 700;
  color: #dc2626;
  line-height: 1;
}

.limit-text {
  font-size: 0.875rem;
  color: #991b1b;
  font-weight: 500;
  margin-top: 0.25rem;
}

.main-message {
  text-align: center;
  font-size: 1.1rem;
  color: #374151;
  margin-bottom: 2rem;
  font-weight: 500;
}

.unlock-section, .contact-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.unlock-section h4, .contact-section h4 {
  margin: 0 0 0.75rem 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
}

.unlock-section p, .contact-section p {
  margin-bottom: 1rem;
  color: #475569;
}

.codigo-desbloqueo {
  margin-top: 1rem;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.codigo-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.codigo-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-verificar {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-verificar:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
}

.btn-verificar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.mensaje-verificacion {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.mensaje-verificacion.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.mensaje-verificacion.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.contact-info {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.contact-item:hover {
  background: #f8fafc;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-icon {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}

.note-section {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #fef7ff 0%, #faf5ff 100%);
  border-radius: 8px;
  border: 1px solid #e9d5ff;
}

.note {
  font-size: 0.875rem;
  color: #7c3aed;
  font-weight: 500;
  margin: 0;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: #f8fafc;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-secondary:hover {
  background: #475569;
  transform: translateY(-1px);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 
  from { transform: rotate(0deg); } 
  to { transform: rotate(360deg); } 
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    transform: translateY(-30px) scale(0.9); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0) scale(1); 
    opacity: 1; 
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.generando-pdf .no-imprimir { display: none !important; }

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 1.25rem 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    flex-direction: column;
    padding: 1.25rem 1.5rem;
  }
  
  .input-wrapper {
    flex-direction: column;
  }
  
  .contador-info {
    right: 16px;
    bottom: 80px;
  }
  
  .pdf-button {
    right: 16px;
    bottom: 16px;
    min-width: 160px;
  }
  
  .unlock-section, .contact-section {
    padding: 1.25rem;
  }
  
  .limit-badge {
    padding: 0.75rem 1.25rem;
  }
  
  .limit-number {
    font-size: 1.75rem;
  }
  
  .main-message {
    font-size: 1rem;
  }
}
</style>