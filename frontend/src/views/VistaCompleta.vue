<template>
  <div>
    <div id="documento-pdf" ref="documento" class="pdf-root" :class="{ 'generando-pdf': generando }">
      <Hoja1 />
      <Hoja2 />
      <Hoja3 />
    </div>

    <!-- Botón de generar PDF (oculto durante generación) -->
    <button
      v-show="!generando"
      class="pdf-button"
      :disabled="generando"
      :class="{ 'limite-alcanzado': limiteAlcanzado }"
      @click="generarPDF"
    >
      <span v-if="!generando && !limiteAlcanzado" class="btn-icon">📄</span>
      <span v-else-if="limiteAlcanzado" class="btn-icon">🔒</span>
      <span v-else class="spinner"></span>
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
          <h3>🔒 Descargas agotadas</h3>
          <button @click="cerrarModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Has alcanzado el límite de <strong>{{ limiteDescargas }} descarga</strong> gratuita.</p>
          
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
            <label>Código de desbloqueo:</label>
            <input 
              v-model="codigoDesbloqueo" 
              placeholder="Ingrese el código" 
              class="codigo-input"
              @keyup.enter="verificarCodigo"
            />
            <button @click="verificarCodigo" class="btn-verificar">
              Verificar
            </button>
          </div>
          
          <!-- Debug info -->
          <div v-if="showDebug" class="debug-info">
            <p>Método: {{ metodoBloqueo }}</p>
            <p>Estado: {{ bloqueoStatus }}</p>
            <p>Usuario ID: {{ usuarioId }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Contador (oculto durante generación) -->
    <div v-show="!generando" class="contador-info" v-if="!limiteAlcanzado">
      <span>Descargas: {{ descargasRestantes }}/{{ limiteDescargas }}</span>
    </div>

    <!-- Overlay de carga durante generación -->
    <div v-if="generando" class="generando-overlay">
      <div class="generando-contenido">
        <div class="spinner-grande"></div>
        <p>Generando PDF, por favor espere...</p>
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

const documento = ref(null);
const generando = ref(false);
const nombre = ref('Invitado');

// Sistema de bloqueo por usuario
const limiteDescargas = ref(1);
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const codigoDesbloqueo = ref('');
const metodoBloqueo = ref('');
const bloqueoStatus = ref('');
const showDebug = ref(false);
const usuarioId = ref(''); // Identificador único por usuario

// Computed
const descargasRestantes = computed(() => limiteDescargas.value - descargasUsadas.value);
const limiteAlcanzado = computed(() => descargasUsadas.value >= limiteDescargas.value);

// Generar un ID único para el usuario
const generarIdUsuario = () => {
  // Si ya existe un ID en localStorage, usarlo
  let id = localStorage.getItem('usuario_id');
  
  // Si no existe, crear uno nuevo
  if (!id) {
    // Usar una combinación de timestamp y número aleatorio
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('usuario_id', id);
  }
  
  return id;
};

onMounted(async () => {
  // Cargar usuario
  const datos = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (datos?.nombre) nombre.value = datos.nombre;
  
  // Generar o obtener ID de usuario
  usuarioId.value = generarIdUsuario();
  
  // Debug en desarrollo
  if (import.meta.env.DEV) {
    showDebug.value = true;
  }
  
  // Cargar estado de bloqueo para este usuario
  cargarEstadoBloqueo();
});

// ===================================
// SISTEMA DE BLOQUEO POR USUARIO
// ===================================

function cargarEstadoBloqueo() {
  console.log('🔍 Cargando estado de bloqueo para usuario:', usuarioId.value);
  
  let bloqueado = false;
  let metodo = '';
  
  // Método 1: localStorage con clave por usuario
  try {
    const estado1 = localStorage.getItem(`pdf_download_${usuarioId.value}`);
    if (estado1 === 'USED') {
      bloqueado = true;
      metodo = 'localStorage';
    }
  } catch (e) {}
  
  // Método 2: Cookie con clave por usuario
  try {
    const estado2 = getCookie(`pdf_download_${usuarioId.value}`);
    if (estado2 === 'USED') {
      bloqueado = true;
      metodo = metodo ? metodo + '+cookie' : 'cookie';
    }
  } catch (e) {}
  
  // Método 3: sessionStorage (bonus)
  try {
    const estado3 = sessionStorage.getItem(`pdf_download_${usuarioId.value}`);
    if (estado3 === 'USED') {
      bloqueado = true;
      metodo = metodo ? metodo + '+session' : 'session';
    }
  } catch (e) {}
  
  // Aplicar estado
  if (bloqueado) {
    descargasUsadas.value = 1;
    bloqueoStatus.value = 'BLOQUEADO';
    console.log(`🔒 Estado bloqueado encontrado via: ${metodo}`);
  } else {
    descargasUsadas.value = 0;
    bloqueoStatus.value = 'LIBRE';
    console.log('✅ Sin bloqueos encontrados');
  }
  
  metodoBloqueo.value = metodo || 'ninguno';
}

function marcarComoUsado() {
  console.log('🚫 Marcando como usado para usuario:', usuarioId.value);
  
  // Método 1: localStorage (permanente hasta que se borre manualmente)
  try {
    localStorage.setItem(`pdf_download_${usuarioId.value}`, 'USED');
    console.log('✅ Marcado en localStorage');
  } catch (e) {
    console.error('❌ Error localStorage:', e);
  }
  
  // Método 2: Cookie ultra persistente (10 años)
  try {
    const fechaExpira = new Date();
    fechaExpira.setFullYear(fechaExpira.getFullYear() + 10);
    document.cookie = `pdf_download_${usuarioId.value}=USED; expires=${fechaExpira.toUTCString()}; path=/; SameSite=Strict`;
    console.log('✅ Marcado en Cookie');
  } catch (e) {
    console.error('❌ Error Cookie:', e);
  }
  
  // Método 3: sessionStorage (backup para esta sesión)
  try {
    sessionStorage.setItem(`pdf_download_${usuarioId.value}`, 'USED');
    console.log('✅ Marcado en sessionStorage');
  } catch (e) {
    console.error('❌ Error sessionStorage:', e);
  }
  
  // Actualizar estado local
  descargasUsadas.value = 1;
  bloqueoStatus.value = 'BLOQUEADO';
  metodoBloqueo.value = 'todos';
}

function limpiarBloqueo() {
  console.log('🧹 Limpiando bloqueos para usuario:', usuarioId.value);
  
  // Limpiar localStorage
  try {
    localStorage.removeItem(`pdf_download_${usuarioId.value}`);
    console.log('✅ localStorage limpio');
  } catch (e) {}
  
  // Limpiar cookie
  try {
    document.cookie = `pdf_download_${usuarioId.value}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    console.log('✅ Cookie limpia');
  } catch (e) {}
  
  // Limpiar sessionStorage
  try {
    sessionStorage.removeItem(`pdf_download_${usuarioId.value}`);
    console.log('✅ sessionStorage limpio');
  } catch (e) {}
  
  // Resetear estado
  descargasUsadas.value = 0;
  bloqueoStatus.value = 'LIBRE';
  metodoBloqueo.value = 'limpio';
}

function getCookie(nombre) {
  const nombreIgual = nombre + "=";
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nombreIgual) === 0) {
      return cookie.substring(nombreIgual.length, cookie.length);
    }
  }
  return null;
}

// ===================================
// FUNCIONES PRINCIPALES
// ===================================

async function generarPDF() {
  // Verificar límite
  if (limiteAlcanzado.value) {
    mostrarModalLimite.value = true;
    return;
  }

  await nextTick();
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
    
    // Generar PDF
    await html2pdf()
      .set(opciones)
      .from(documento.value)
      .save(nombreArchivo);
    
    // MARCAR INMEDIATAMENTE como usado para este usuario
    marcarComoUsado();
    
    console.log('📄 PDF generado y bloqueo activado para usuario:', usuarioId.value);
    
    // Mostrar modal después de un momento
    setTimeout(() => {
      if (limiteAlcanzado.value) {
        mostrarModalLimite.value = true;
      }
    }, 1500);
      
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
  } finally {
    generando.value = false;
  }
}

function verificarCodigo() {
  const codigo = codigoDesbloqueo.value.trim().toUpperCase();
  
  const codigosValidos = [
    'ADMIN123',
    'RESET2024', 
    'RANDY123',
    'UNLOCK'
  ];
  
  if (codigosValidos.includes(codigo)) {
    limpiarBloqueo();
    alert('✅ Código válido. Bloqueo eliminado.');
    cerrarModal();
    console.log('🔓 Bloqueo eliminado con código para usuario:', usuarioId.value);
  } else {
    alert('❌ Código inválido');
  }
  
  codigoDesbloqueo.value = '';
}

function cerrarModal() {
  mostrarModalLimite.value = false;
  codigoDesbloqueo.value = '';
}

// Funciones de desarrollo
if (import.meta.env.DEV) {
  // Exponer funciones globales para testing
  window.limpiarBloqueo = limpiarBloqueo;
  window.marcarUsado = marcarComoUsado;
  window.verificarEstado = () => {
    console.log('📊 Estado actual para usuario:', usuarioId.value);
    console.log('localStorage:', localStorage.getItem(`pdf_download_${usuarioId.value}`));
    console.log('cookie:', getCookie(`pdf_download_${usuarioId.value}`));
    console.log('sessionStorage:', sessionStorage.getItem(`pdf_download_${usuarioId.value}`));
    console.log('descargasUsadas:', descargasUsadas.value);
    console.log('limiteAlcanzado:', limiteAlcanzado.value);
  };
}
</script>

<style scoped>
.pdf-root { 
  background: #fff; 
  padding: 0.3in; 
}

.carta { 
  page-break-after: always; 
}

.carta:last-child { 
  page-break-after: auto; 
}

.pdf-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  padding: 12px 18px;
  min-width: 180px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
  z-index: 1000;
}

.pdf-button:hover:not(:disabled) { 
  transform: translateY(-2px); 
  box-shadow: 0 12px 24px rgba(0,0,0,0.25); 
}

.pdf-button:disabled { 
  opacity: 0.7; 
  cursor: not-allowed; 
}

.pdf-button.limite-alcanzado {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  cursor: pointer;
  opacity: 1;
}

.btn-icon { 
  font-size: 18px; 
}

.btn-text { 
  font-size: 14px; 
}

.contador-info {
  position: fixed;
  right: 24px;
  bottom: 90px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #ef4444;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #374151;
  line-height: 1.6;
}

.contact-info {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.codigo-desbloqueo {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.codigo-desbloqueo label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.codigo-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.codigo-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-verificar {
  width: 100%;
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-verificar:hover {
  background: #059669;
}

.debug-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: monospace;
}

.debug-info p {
  margin: 0.25rem 0;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: #6b7280;
  color: white;
  transition: background 0.2s ease;
}

.btn-secondary:hover {
  background: #4b5563;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.generando-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.generando-contenido {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.spinner-grande {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.generando-contenido p {
  font-size: 1.1rem;
  color: #374151;
  font-weight: 500;
}

@keyframes spin { 
  from { transform: rotate(0deg); } 
  to { transform: rotate(360deg); } 
}

@media (max-width: 768px) {
  .pdf-button {
    right: 16px;
    bottom: 16px;
    min-width: 160px;
  }
  
  .contador-info {
    right: 16px;
    bottom: 80px;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>