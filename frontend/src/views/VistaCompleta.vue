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
      @click="generarPDF"
      :title="limiteAlcanzado ? 'Click para ver opciones de contacto' : 'Generar PDF'"
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
          <h3>🔒 Descargas en modo gratis alcanzado</h3>
          <button @click="cerrarModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Has alcanzado el límite máximo de <strong>{{ limiteDescargas }} descargas</strong> de tu hoja de vida en PDF en el modo gratuito.</p>
          <p>Para continuar descargando, contacta al administrador del sistema:</p>
          
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
              @keyup.enter="verificarCodigo"
            />
            <button @click="verificarCodigo" class="btn-verificar" :disabled="!codigoDesbloqueo.trim()">
              Verificar
            </button>
          </div>
          
          <p class="note">El administrador podrá restablecer tu contador de descargas o proporcionarte un código de desbloqueo.</p>
          
          <!-- Información de debug (solo en desarrollo) -->
          <div v-if="mostrarDebugInfo" class="debug-info">
            <p><strong>Info de Debug:</strong></p>
            <p>Huella: {{ browserFingerprint.substring(0, 16) }}...</p>
            <p>Descargas: {{ descargasUsadas }}/{{ limiteDescargas }}</p>
            <p>Estado: {{ estadoBloqueo }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary">Cerrar</button>
          <button @click="copiarContacto" class="btn-primary">
            {{ textoCopiado ? '✓ Copiado' : 'Copiar numero de contacto' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Contador visual -->
    <div class="contador-info" v-if="!limiteAlcanzado">
      <span class="contador-text">Descargas disponibles: {{ descargasRestantes }}</span>
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
import { ref, nextTick, computed, onMounted, watch } from 'vue';
import html2pdf from 'html2pdf.js';
import Hoja1 from './Hoja1.vue';
import Hoja2 from './Hoja2.vue';
import Hoja3 from './Hoja3.vue';
import { useRoute, useRouter } from 'vue-router';
import { useUsuarioStore } from '../stores/usuarios';

const documento = ref(null);
const generando = ref(false);
const nombre = ref('Invitado');
const route = useRoute();
const router = useRouter();
const usuarioStore = useUsuarioStore();

// Sistema de contador persistente usando SOLO cookies y fingerprinting
const limiteDescargas = ref(1);
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const textoCopiado = ref(false);
const codigoDesbloqueo = ref('');
const browserFingerprint = ref('');
const estadoBloqueo = ref('desbloqueado');
const mostrarDebugInfo = ref(false);

// Computed properties
const descargasRestantes = computed(() => limiteDescargas.value - descargasUsadas.value);
const limiteAlcanzado = computed(() => descargasUsadas.value >= limiteDescargas.value);

onMounted(async () => {
  const datos = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (datos?.nombre) nombre.value = datos.nombre;
  
  // Generar huella única del navegador
  await generarBrowserFingerprint();
  
  // Cargar estado desde cookies (NO desde localStorage)
  cargarEstadoDesCookies();

  // Mostrar info debug en desarrollo
  if (import.meta.env.DEV) {
    mostrarDebugInfo.value = true;
  }
});

// No observar cambios de usuario - el bloqueo es independiente de la sesión
// watch(() => usuarioStore.usuario, () => {
//   // NO hacer nada - mantener bloqueo independiente de usuario
// });

// Generar fingerprint único y robusto del navegador
async function generarBrowserFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('PDF Download Lock', 2, 2);
    
    // Recolectar información única del navegador/dispositivo
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.languages ? navigator.languages.join(',') : '',
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      screen.pixelDepth,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.hardwareConcurrency || 0,
      navigator.deviceMemory || 0,
      canvas.toDataURL(),
      navigator.cookieEnabled,
      navigator.doNotTrack || '',
      window.history.length,
      // Añadir más componentes únicos
      navigator.maxTouchPoints || 0,
      window.devicePixelRatio || 1,
      window.screen.orientation?.type || '',
    ];
    
    // Crear hash único
    let hash = 0;
    const combined = components.join('|');
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    browserFingerprint.value = 'bfp_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36).substring(-4);
    
  } catch (error) {
    console.warn('Error generando fingerprint:', error);
    // Fallback si hay error
    browserFingerprint.value = 'bfp_fallback_' + Math.random().toString(36).substring(2, 10);
  }
}

// Funciones de manejo de cookies para persistencia máxima
function setCookiePersistente(name, value, days = 365) {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Crear múltiples cookies con diferentes configuraciones para máxima persistencia
    const configs = [
      `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`,
      `${name}_bk1=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`,
      `${name}_bk2=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`
    ];
    
    configs.forEach(config => {
      document.cookie = config;
    });
    
    return true;
  } catch (error) {
    console.warn('Error estableciendo cookie:', error);
    return false;
  }
}

function getCookiePersistente(name) {
  try {
    // Buscar cookie principal primero
    let value = getCookie(name);
    if (value) return value;
    
    // Buscar en cookies de respaldo
    value = getCookie(name + '_bk1');
    if (value) {
      // Restaurar cookie principal
      setCookiePersistente(name, value);
      return value;
    }
    
    value = getCookie(name + '_bk2');
    if (value) {
      // Restaurar cookies
      setCookiePersistente(name, value);
      return value;
    }
    
    return null;
  } catch (error) {
    console.warn('Error leyendo cookie:', error);
    return null;
  }
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

function deleteCookiePersistente(name) {
  try {
    const pastDate = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = `${name}=; ${pastDate}; path=/`;
    document.cookie = `${name}_bk1=; ${pastDate}; path=/`;
    document.cookie = `${name}_bk2=; ${pastDate}; path=/`;
  } catch (error) {
    console.warn('Error eliminando cookies:', error);
  }
}

// Cargar estado desde cookies usando la huella del navegador
function cargarEstadoDesCookies() {
  if (!browserFingerprint.value) return;
  
  const cookieName = `pdf_lock_${browserFingerprint.value}`;
  const estadoStr = getCookiePersistente(cookieName);
  
  if (estadoStr) {
    try {
      const estado = JSON.parse(estadoStr);
      descargasUsadas.value = estado.usadas || 0;
      limiteDescargas.value = estado.limite || 1;
      estadoBloqueo.value = estado.bloqueado ? 'bloqueado' : 'desbloqueado';
      
      console.log(`Estado cargado desde cookies: ${descargasUsadas.value}/${limiteDescargas.value} - ${estadoBloqueo.value}`);
    } catch (error) {
      console.warn('Error parseando estado desde cookies:', error);
    }
  } else {
    console.log('No se encontró estado previo en cookies - primera visita');
  }
}

// Guardar estado en cookies
function guardarEstadoEnCookies() {
  if (!browserFingerprint.value) return;
  
  const estado = {
    usadas: descargasUsadas.value,
    limite: limiteDescargas.value,
    bloqueado: descargasUsadas.value >= limiteDescargas.value,
    ultimaDescarga: new Date().toISOString(),
    fingerprint: browserFingerprint.value,
    version: '4.0'
  };
  
  const cookieName = `pdf_lock_${browserFingerprint.value}`;
  const success = setCookiePersistente(cookieName, JSON.stringify(estado));
  
  estadoBloqueo.value = estado.bloqueado ? 'bloqueado' : 'desbloqueado';
  
  console.log(`Estado guardado en cookies: ${descargasUsadas.value}/${limiteDescargas.value} - ${estadoBloqueo.value} [Success: ${success}]`);
}

async function generarPDF() {
  // Verificar límite antes de proceder
  if (limiteAlcanzado.value) {
    mostrarModalLimite.value = true;
    return;
  }

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
      
    // Incrementar contador y guardar en cookies (PERSISTENTE)
    descargasUsadas.value++;
    guardarEstadoEnCookies();
    
    console.log('PDF generado. Contador persistente actualizado en cookies.');
    
    // Mostrar modal si se alcanzó el límite
    if (limiteAlcanzado.value) {
      setTimeout(() => {
        mostrarModalLimite.value = true;
      }, 1000);
    }
      
  } catch (error) {
    console.error('Error al generar PDF:', error);
  } finally {
    generando.value = false;
  }
}

function cerrarModal() {
  mostrarModalLimite.value = false;
  textoCopiado.value = false;
  codigoDesbloqueo.value = '';
}

async function copiarContacto() {
  try {
    await navigator.clipboard.writeText('3145193285');
    textoCopiado.value = true;
    setTimeout(() => {
      textoCopiado.value = false;
    }, 2000);
  } catch (error) {
    console.error('Error al copiar:', error);
  }
}

// Verificar código de desbloqueo
async function verificarCodigo() {
  const codigo = codigoDesbloqueo.value.trim();
  if (codigo === '') {
    alert('Por favor ingrese un código de desbloqueo');
    return;
  }

  const codigosValidos = [
    'ADMIN123', 
    'UNLOCK2024', 
    'RANDY123',
    'RESET2024',
    'PREMIUM2024',
    'MASTERKEY2024',
    'RANDY1324'
  ];
  
  if (codigosValidos.includes(codigo.toUpperCase())) {
    // Resetear contador
    descargasUsadas.value = 0;
    
    // LIMPIAR COMPLETAMENTE las cookies persistentes
    const cookieName = `pdf_lock_${browserFingerprint.value}`;
    deleteCookiePersistente(cookieName);
    
    // También limpiar posibles cookies con fingerprints similares
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const cookieKey = cookie.split('=')[0].trim();
      if (cookieKey.includes('pdf_lock_')) {
        deleteCookiePersistente(cookieKey);
      }
    });
    
    // Regenerar fingerprint para evitar rastros
    await generarBrowserFingerprint();
    
    // Guardar estado limpio
    guardarEstadoEnCookies();
    
    alert('¡Código válido! Se han restablecido tus descargas de forma permanente.');
    cerrarModal();
    
    console.log('RESETEO COMPLETO: Cookies eliminadas y fingerprint regenerado');
  } else {
    alert('Código inválido. Contacte al administrador.');
  }
  
  codigoDesbloqueo.value = '';
}

// Función administrativa (solo desarrollo)
function resetearCompleto() {
  // Limpiar TODAS las cookies relacionadas
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const cookieKey = cookie.split('=')[0].trim();
    if (cookieKey.includes('pdf_lock_') || cookieKey.includes('bfp_')) {
      deleteCookiePersistente(cookieKey);
    }
  });
  
  descargasUsadas.value = 0;
  estadoBloqueo.value = 'desbloqueado';
  
  console.log('RESETEO ADMINISTRATIVO: Todas las cookies de bloqueo eliminadas');
}

// Mostrar información de cookies (debug)
function mostrarInfoCookies() {
  const cookies = document.cookie.split(';')
    .filter(cookie => cookie.includes('pdf_lock_'))
    .map(cookie => {
      const [key, value] = cookie.split('=');
      return {
        key: key.trim(),
        value: value ? decodeURIComponent(value) : ''
      };
    });
    
  console.table(cookies);
  return cookies;
}

// Exponer funciones para desarrollo
if (import.meta.env.DEV) {
  window.resetearTodoPDF = resetearCompleto;
  window.mostrarCookiesBloqueo = mostrarInfoCookies;
  window.regenerarFingerprint = generarBrowserFingerprint;
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
  z-index: 999;
}

.contador-text {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.contador-barra {
  width: 120px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.contador-progreso {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
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
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  animation: slideIn 0.3s ease;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
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
  padding: 0;
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
  line-height: 1.6;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #374151;
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

.contact-icon {
  font-size: 1rem;
}

.note {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
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
  transition: border-color 0.2s ease;
  box-sizing: border-box;
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

.btn-verificar:hover:not(:disabled) {
  background: #059669;
}

.btn-verificar:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.debug-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 6px;
  border: 1px solid #f59e0b;
  font-size: 0.75rem;
}

.debug-info p {
  margin: 0.25rem 0;
  font-family: monospace;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: #f9fafb;
}

.btn-primary, .btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
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
  from { transform: translateY(-20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.generando-pdf .no-imprimir { display: none !important; }

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-footer {
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
}
</style>