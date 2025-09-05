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
          <p>Has alcanzado el límite de <strong>{{ limiteDescargas }} descarga</strong> gratuita para tu usuario <strong>{{ nombre }}</strong>.</p>
          
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
            <label>Código de desbloqueo para {{ nombre }}:</label>
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
            <p>Usuario ID: {{ usuarioId }}</p>
            <p>Usuario Hash: {{ usuarioHash }}</p>
            <p>Método: {{ metodoBloqueo }}</p>
            <p>Estado: {{ bloqueoStatus }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Contador -->
    <div class="contador-info" v-if="!limiteAlcanzado">
      <span>{{ nombre }}: {{ descargasRestantes }}/{{ limiteDescargas }}</span>
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

// Sistema de bloqueo POR USUARIO
const limiteDescargas = ref(1);
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const codigoDesbloqueo = ref('');
const metodoBloqueo = ref('');
const bloqueoStatus = ref('');
const showDebug = ref(false);

// Identificación única del usuario
const usuarioId = ref('');
const usuarioHash = ref('');

// Computed
const descargasRestantes = computed(() => limiteDescargas.value - descargasUsadas.value);
const limiteAlcanzado = computed(() => descargasUsadas.value >= limiteDescargas.value);

onMounted(async () => {
  // Cargar e inicializar usuario
  await inicializarUsuario();
  
  // Debug en desarrollo
  if (import.meta.env.DEV) {
    showDebug.value = true;
  }
  
  // Cargar estado de bloqueo específico del usuario
  cargarEstadoBloqueo();
});

// ===================================
// SISTEMA DE IDENTIFICACIÓN DE USUARIO
// ===================================

async function inicializarUsuario() {
  console.log('👤 Inicializando usuario...');
  
  // Cargar datos del usuario desde localStorage
  const datos = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  if (datos?.nombre) {
    nombre.value = datos.nombre.trim();
  }
  
  // Generar ID único del usuario basado en múltiples factores
  usuarioId.value = await generarIdUsuario(nombre.value);
  usuarioHash.value = await hashString(usuarioId.value);
  
  console.log(`👤 Usuario inicializado: ${nombre.value} (ID: ${usuarioId.value})`);
}

async function generarIdUsuario(nombreUsuario) {
  // Combinar múltiples factores para crear un ID único y estable
  const factores = [
    nombreUsuario || 'anonimo',
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Agregar timestamp de primera visita para mayor unicidad
    getOrCreateUserTimestamp()
  ];
  
  const combinado = factores.join('|');
  return await hashString(combinado);
}

function getOrCreateUserTimestamp() {
  const key = 'user_first_visit';
  let timestamp = localStorage.getItem(key);
  
  if (!timestamp) {
    timestamp = Date.now().toString();
    try {
      localStorage.setItem(key, timestamp);
    } catch (e) {
      // Si falla localStorage, usar timestamp actual
      timestamp = Date.now().toString();
    }
  }
  
  return timestamp;
}

async function hashString(str) {
  // Crear hash usando Web Crypto API
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  } catch (e) {
    // Fallback si crypto no está disponible
    console.warn('Crypto API no disponible, usando hash simple');
    return simpleHash(str);
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 16);
}

// ===================================
// SISTEMA DE BLOQUEO POR USUARIO
// ===================================

function obtenerClaveUsuario() {
  // Crear claves específicas del usuario
  return {
    localStorage: `pdf_used_${usuarioHash.value}`,
    cookie: `pdf_used_${usuarioHash.value}`,
    sessionStorage: `pdf_used_${usuarioHash.value}`
  };
}

function cargarEstadoBloqueo() {
  if (!usuarioHash.value) {
    console.warn('⚠️ Hash de usuario no disponible');
    return;
  }
  
  console.log(`🔍 Cargando estado de bloqueo para usuario: ${nombre.value}`);
  
  const claves = obtenerClaveUsuario();
  let bloqueado = false;
  let metodo = '';
  
  // Método 1: localStorage específico del usuario
  try {
    const estado1 = localStorage.getItem(claves.localStorage);
    if (estado1 === 'USED') {
      bloqueado = true;
      metodo = 'localStorage';
    }
  } catch (e) {
    console.warn('Error accediendo localStorage:', e);
  }
  
  // Método 2: Cookie específica del usuario
  try {
    const estado2 = getCookie(claves.cookie);
    if (estado2 === 'USED') {
      bloqueado = true;
      metodo = metodo ? metodo + '+cookie' : 'cookie';
    }
  } catch (e) {
    console.warn('Error accediendo cookie:', e);
  }
  
  // Método 3: sessionStorage específico del usuario
  try {
    const estado3 = sessionStorage.getItem(claves.sessionStorage);
    if (estado3 === 'USED') {
      bloqueado = true;
      metodo = metodo ? metodo + '+session' : 'session';
    }
  } catch (e) {
    console.warn('Error accediendo sessionStorage:', e);
  }
  
  // Aplicar estado
  if (bloqueado) {
    descargasUsadas.value = 1;
    bloqueoStatus.value = 'BLOQUEADO';
    console.log(`🔒 Usuario ${nombre.value} bloqueado via: ${metodo}`);
  } else {
    descargasUsadas.value = 0;
    bloqueoStatus.value = 'LIBRE';
    console.log(`✅ Usuario ${nombre.value} sin bloqueos`);
  }
  
  metodoBloqueo.value = metodo || 'ninguno';
}

function marcarComoUsado() {
  if (!usuarioHash.value) {
    console.error('❌ No se puede marcar como usado: hash de usuario no disponible');
    return;
  }
  
  console.log(`🚫 Marcando como usado para usuario: ${nombre.value}`);
  
  const claves = obtenerClaveUsuario();
  
  // Método 1: localStorage específico del usuario
  try {
    localStorage.setItem(claves.localStorage, 'USED');
    console.log('✅ Marcado en localStorage específico');
  } catch (e) {
    console.error('❌ Error localStorage:', e);
  }
  
  // Método 2: Cookie específica del usuario (10 años)
  try {
    const fechaExpira = new Date();
    fechaExpira.setFullYear(fechaExpira.getFullYear() + 10);
    document.cookie = `${claves.cookie}=USED; expires=${fechaExpira.toUTCString()}; path=/; SameSite=Strict`;
    console.log('✅ Marcado en Cookie específica');
  } catch (e) {
    console.error('❌ Error Cookie:', e);
  }
  
  // Método 3: sessionStorage específico del usuario
  try {
    sessionStorage.setItem(claves.sessionStorage, 'USED');
    console.log('✅ Marcado en sessionStorage específico');
  } catch (e) {
    console.error('❌ Error sessionStorage:', e);
  }
  
  // Actualizar estado local
  descargasUsadas.value = 1;
  bloqueoStatus.value = 'BLOQUEADO';
  metodoBloqueo.value = 'todos';
}

function limpiarBloqueo() {
  if (!usuarioHash.value) {
    console.error('❌ No se puede limpiar: hash de usuario no disponible');
    return;
  }
  
  console.log(`🧹 Limpiando bloqueo para usuario: ${nombre.value}`);
  
  const claves = obtenerClaveUsuario();
  
  // Limpiar localStorage específico
  try {
    localStorage.removeItem(claves.localStorage);
    console.log('✅ localStorage específico limpio');
  } catch (e) {
    console.warn('Error limpiando localStorage:', e);
  }
  
  // Limpiar cookie específica
  try {
    document.cookie = `${claves.cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    console.log('✅ Cookie específica limpia');
  } catch (e) {
    console.warn('Error limpiando cookie:', e);
  }
  
  // Limpiar sessionStorage específico
  try {
    sessionStorage.removeItem(claves.sessionStorage);
    console.log('✅ sessionStorage específico limpio');
  } catch (e) {
    console.warn('Error limpiando sessionStorage:', e);
  }
  
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
  // Verificar que el usuario esté inicializado
  if (!usuarioHash.value) {
    console.error('❌ Usuario no inicializado');
    alert('Error: Usuario no inicializado. Recarga la página.');
    return;
  }
  
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
    
    // MARCAR INMEDIATAMENTE como usado para este usuario específico
    marcarComoUsado();
    
    console.log(`📄 PDF generado y bloqueo activado para ${nombreUsuario}`);
    
    // Mostrar modal después de un momento
    setTimeout(() => {
      if (limiteAlcanzado.value) {
        mostrarModalLimite.value = true;
      }
    }, 1500);
      
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    alert('Error generando PDF. Intenta de nuevo.');
  } finally {
    generando.value = false;
  }
}

function verificarCodigo() {
  const codigo = codigoDesbloqueo.value.trim().toUpperCase();
  
  // Códigos específicos por usuario (opcional)
  const codigosGlobales = [
    'ADMIN123',
    'RESET2024', 
    'RANDY123',
    'UNLOCK'
  ];
  
  // Código específico del usuario actual
  const codigoUsuarioEspecifico = `UNLOCK_${usuarioHash.value.substring(0, 8).toUpperCase()}`;
  
  const codigosValidos = [...codigosGlobales, codigoUsuarioEspecifico];
  
  if (codigosValidos.includes(codigo)) {
    limpiarBloqueo();
    alert(`✅ Código válido. Bloqueo eliminado para ${nombre.value}.`);
    cerrarModal();
    console.log(`🔓 Bloqueo eliminado con código para ${nombre.value}`);
  } else {
    alert('❌ Código inválido');
    if (showDebug.value) {
      console.log(`💡 Código específico para este usuario: ${codigoUsuarioEspecifico}`);
    }
  }
  
  codigoDesbloqueo.value = '';
}

function cerrarModal() {
  mostrarModalLimite.value = false;
  codigoDesbloqueo.value = '';
}

// ===================================
// FUNCIONES DE DESARROLLO Y DEBUG
// ===================================

if (import.meta.env.DEV) {
  // Exponer funciones globales para testing
  window.limpiarBloqueoPorUsuario = limpiarBloqueo;
  window.marcarUsadoPorUsuario = marcarComoUsado;
  window.verificarEstadoPorUsuario = () => {
    const claves = obtenerClaveUsuario();
    console.log('📊 Estado actual del usuario:');
    console.log('Usuario:', nombre.value);
    console.log('Usuario ID:', usuarioId.value);
    console.log('Usuario Hash:', usuarioHash.value);
    console.log('localStorage:', localStorage.getItem(claves.localStorage));
    console.log('cookie:', getCookie(claves.cookie));
    console.log('sessionStorage:', sessionStorage.getItem(claves.sessionStorage));
    console.log('descargasUsadas:', descargasUsadas.value);
    console.log('limiteAlcanzado:', limiteAlcanzado.value);
    console.log('Código específico usuario:', `UNLOCK_${usuarioHash.value.substring(0, 8).toUpperCase()}`);
  };
  
  window.cambiarUsuario = (nuevoNombre) => {
    localStorage.setItem('usuario', JSON.stringify({ nombre: nuevoNombre }));
    location.reload();
  };
  
  window.listarTodosLosBloqueos = () => {
    console.log('🗂️ Todos los bloqueos en localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pdf_used_')) {
        console.log(`${key}: ${localStorage.getItem(key)}`);
      }
    }
  };
}
</script>

<style scoped>
/* Mantener todos los estilos originales */
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