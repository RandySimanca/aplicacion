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
            <p>ID Dispositivo: {{ dispositivoId.substring(0, 12) }}...</p>
            <p>Descargas: {{ descargasUsadas }}/{{ limiteDescargas }}</p>
            <p>Estado: {{ estadoBloqueo }}</p>
            <p>Métodos activos: {{ metodosActivos }}</p>
            <p>Último guardado: {{ ultimoGuardado }}</p>
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
import { ref, nextTick, computed, onMounted, onUnmounted } from 'vue';
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

// Sistema de bloqueo ULTRA PERSISTENTE
const limiteDescargas = ref(1);
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const textoCopiado = ref(false);
const codigoDesbloqueo = ref('');
const dispositivoId = ref('');
const estadoBloqueo = ref('desbloqueado');
const mostrarDebugInfo = ref(false);
const metodosActivos = ref('');
const ultimoGuardado = ref('');

let intervaloPersistencia = null;

// Computed properties
const descargasRestantes = computed(() => limiteDescargas.value - descargasUsadas.value);
const limiteAlcanzado = computed(() => descargasUsadas.value >= limiteDescargas.value);

onMounted(async () => {
  const datos = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (datos?.nombre) nombre.value = datos.nombre;
  
  // Inicializar sistema de persistencia ULTRA ROBUSTO
  await inicializarSistemaPersistencia();
  
  // Verificar y cargar estado de TODOS los métodos
  await cargarEstadoCompleto();
  
  // Iniciar verificación periódica cada 10 segundos
  intervaloPersistencia = setInterval(verificarYMantenerPersistencia, 10000);

  // Mostrar info debug en desarrollo
  if (import.meta.env.DEV) {
    mostrarDebugInfo.value = true;
    console.log('🔧 Sistema de persistencia ultra robusto activado');
  }
});

onUnmounted(() => {
  if (intervaloPersistencia) {
    clearInterval(intervaloPersistencia);
  }
});

// ================================
// SISTEMA DE PERSISTENCIA MULTIPLE
// ================================

async function inicializarSistemaPersistencia() {
  // Generar ID único del dispositivo usando MÚLTIPLES técnicas
  dispositivoId.value = await generarIdDispositivo();
  
  console.log('🆔 ID del dispositivo generado:', dispositivoId.value);
}

async function generarIdDispositivo() {
  const componentes = [];
  
  try {
    // 1. Hardware y navegador
    componentes.push(navigator.userAgent);
    componentes.push(navigator.platform);
    componentes.push(navigator.language);
    componentes.push(screen.width + 'x' + screen.height + 'x' + screen.colorDepth);
    componentes.push(new Date().getTimezoneOffset().toString());
    
    // 2. Canvas fingerprinting FIJO
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.rect(20, 20, 150, 100);
    ctx.fill();
    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.font = '11pt Arial';
    ctx.fillText('PDF-BLOCK-2024', 22, 50);
    componentes.push(canvas.toDataURL());
    
    // 3. WebGL fingerprinting
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      componentes.push(gl.getParameter(gl.RENDERER) || '');
      componentes.push(gl.getParameter(gl.VENDOR) || '');
    }
    
    // 4. Características del navegador
    componentes.push(navigator.hardwareConcurrency || '0');
    componentes.push(navigator.deviceMemory || '0');
    componentes.push(navigator.maxTouchPoints || '0');
    componentes.push(window.devicePixelRatio || '1');
    
    // 5. Información de red (si está disponible)
    if ('connection' in navigator) {
      componentes.push(navigator.connection.effectiveType || '');
    }
    
  } catch (error) {
    console.warn('Error generando componentes del dispositivo:', error);
  }
  
  // Crear hash consistente y único
  let hash = 0;
  const texto = componentes.join('|');
  for (let i = 0; i < texto.length; i++) {
    const char = texto.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // ID final con prefijo fijo
  return `PDF_DEVICE_${Math.abs(hash).toString(36).toUpperCase()}`;
}

// ================================
// MÉTODOS DE PERSISTENCIA MÚLTIPLES
// ================================

// 1. COOKIES ULTRA PERSISTENTES
function guardarEnCookies(data) {
  const metodosGuardado = [];
  const expires = new Date();
  expires.setTime(expires.getTime() + (365 * 10 * 24 * 60 * 60 * 1000)); // 10 años
  
  const configuraciones = [
    // Configuraciones principales
    `pdf_lock_main=${encodeURIComponent(data)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`,
    `pdf_lock_backup1=${encodeURIComponent(data)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`,
    `pdf_lock_backup2=${encodeURIComponent(data)}; expires=${expires.toUTCString()}; path=/`,
    
    // Con ID del dispositivo
    `pdf_${dispositivoId.value}=${encodeURIComponent(data)}; expires=${expires.toUTCString()}; path=/`,
    
    // Encoded y cifrado simple
    `pdf_enc=${btoa(encodeURIComponent(data))}; expires=${expires.toUTCString()}; path=/`,
    `pdf_rot13=${rot13(data)}; expires=${expires.toUTCString()}; path=/`,
    
    // Con dominio específico
    `pdf_domain=${encodeURIComponent(data)}; expires=${expires.toUTCString()}; path=/; domain=${window.location.hostname}`,
  ];
  
  configuraciones.forEach((config, index) => {
    try {
      document.cookie = config;
      metodosGuardado.push(`cookie_${index}`);
    } catch (e) {
      console.warn(`Error guardando cookie ${index}:`, e);
    }
  });
  
  return metodosGuardado;
}

function cargarDesdeCookies() {
  const nombresACookies = [
    'pdf_lock_main',
    'pdf_lock_backup1', 
    'pdf_lock_backup2',
    `pdf_${dispositivoId.value}`,
    'pdf_enc',
    'pdf_rot13',
    'pdf_domain'
  ];
  
  for (const nombre of nombresACookies) {
    let valor = getCookie(nombre);
    if (valor) {
      try {
        // Decodificar según el tipo
        if (nombre.includes('enc')) {
          valor = decodeURIComponent(atob(valor));
        } else if (nombre.includes('rot13')) {
          valor = rot13(valor);
        } else {
          valor = decodeURIComponent(valor);
        }
        
        const estado = JSON.parse(valor);
        if (estado && typeof estado.usadas === 'number') {
          console.log(`🍪 Estado cargado desde cookie: ${nombre}`);
          return estado;
        }
      } catch (e) {
        console.warn(`Error parseando cookie ${nombre}:`, e);
      }
    }
  }
  
  return null;
}

// 2. LOCALSTORAGE CON MÚLTIPLES CLAVES
function guardarEnLocalStorage(data) {
  const metodosGuardado = [];
  const claves = [
    'pdf_download_lock',
    `pdf_lock_${dispositivoId.value}`,
    'pdf_system_state',
    btoa('pdf_hidden_state'),
    'app_pdf_counter',
    rot13('pdf_secret_state')
  ];
  
  claves.forEach((clave, index) => {
    try {
      let valorAGuardar = data;
      
      // Aplicar encoding según la clave
      if (clave.includes(btoa('pdf_hidden_state'))) {
        valorAGuardar = btoa(data);
      } else if (clave === rot13('pdf_secret_state')) {
        valorAGuardar = rot13(data);
      }
      
      localStorage.setItem(clave, valorAGuardar);
      metodosGuardado.push(`ls_${index}`);
    } catch (e) {
      console.warn(`Error guardando en localStorage ${clave}:`, e);
    }
  });
  
  return metodosGuardado;
}

function cargarDesdeLocalStorage() {
  const claves = [
    'pdf_download_lock',
    `pdf_lock_${dispositivoId.value}`,
    'pdf_system_state',
    btoa('pdf_hidden_state'),
    'app_pdf_counter',
    rot13('pdf_secret_state')
  ];
  
  for (const clave of claves) {
    try {
      let valor = localStorage.getItem(clave);
      if (valor) {
        // Decodificar según la clave
        if (clave.includes(btoa('pdf_hidden_state'))) {
          valor = atob(valor);
        } else if (clave === rot13('pdf_secret_state')) {
          valor = rot13(valor);
        }
        
        const estado = JSON.parse(valor);
        if (estado && typeof estado.usadas === 'number') {
          console.log(`💾 Estado cargado desde localStorage: ${clave}`);
          return estado;
        }
      }
    } catch (e) {
      console.warn(`Error cargando desde localStorage ${clave}:`, e);
    }
  }
  
  return null;
}

// 3. INDEXEDDB PARA PERSISTENCIA AVANZADA
function guardarEnIndexedDB(data) {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('PDFLockDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('locks')) {
          db.createObjectStore('locks', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['locks'], 'readwrite');
        const store = transaction.objectStore('locks');
        
        const registros = [
          { id: 'main', data: data },
          { id: dispositivoId.value, data: data },
          { id: 'backup_' + Date.now(), data: data }
        ];
        
        let guardados = 0;
        registros.forEach(registro => {
          store.put(registro).onsuccess = () => {
            guardados++;
            if (guardados === registros.length) {
              console.log('🗄️ Estado guardado en IndexedDB');
              resolve(['indexeddb_main', 'indexeddb_device', 'indexeddb_backup']);
            }
          };
        });
      };
      
      request.onerror = () => {
        console.warn('Error guardando en IndexedDB');
        resolve([]);
      };
    } catch (e) {
      console.warn('IndexedDB no disponible:', e);
      resolve([]);
    }
  });
}

function cargarDesdeIndexedDB() {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('PDFLockDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['locks'], 'readonly');
        const store = transaction.objectStore('locks');
        
        // Intentar cargar en orden de prioridad
        const claves = ['main', dispositivoId.value];
        
        function intentarClave(index) {
          if (index >= claves.length) {
            resolve(null);
            return;
          }
          
          const request = store.get(claves[index]);
          request.onsuccess = () => {
            if (request.result && request.result.data) {
              console.log(`🗄️ Estado cargado desde IndexedDB: ${claves[index]}`);
              resolve(JSON.parse(request.result.data));
            } else {
              intentarClave(index + 1);
            }
          };
          request.onerror = () => intentarClave(index + 1);
        }
        
        intentarClave(0);
      };
      
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

// ================================
// FUNCIONES AUXILIARES
// ================================

function rot13(str) {
  return str.replace(/[a-zA-Z]/g, char => {
    const start = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
  });
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

// ================================
// GESTIÓN DE ESTADO PRINCIPAL
// ================================

async function cargarEstadoCompleto() {
  console.log('🔍 Iniciando carga de estado desde todos los métodos...');
  
  let estadoEncontrado = null;
  let metodoUsado = '';
  
  // 1. Intentar cargar desde IndexedDB
  if (!estadoEncontrado) {
    estadoEncontrado = await cargarDesdeIndexedDB();
    if (estadoEncontrado) metodoUsado += 'IndexedDB ';
  }
  
  // 2. Intentar cargar desde cookies
  if (!estadoEncontrado) {
    estadoEncontrado = cargarDesdeCookies();
    if (estadoEncontrado) metodoUsado += 'Cookies ';
  }
  
  // 3. Intentar cargar desde localStorage
  if (!estadoEncontrado) {
    estadoEncontrado = cargarDesdeLocalStorage();
    if (estadoEncontrado) metodoUsado += 'localStorage ';
  }
  
  if (estadoEncontrado) {
    descargasUsadas.value = Math.max(0, estadoEncontrado.usadas || 0);
    limiteDescargas.value = Math.max(1, estadoEncontrado.limite || 1);
    estadoBloqueo.value = descargasUsadas.value >= limiteDescargas.value ? 'bloqueado' : 'desbloqueado';
    metodosActivos.value = metodoUsado.trim();
    
    console.log(`✅ Estado cargado: ${descargasUsadas.value}/${limiteDescargas.value} desde ${metodoUsado}`);
    
    // Asegurar que el estado esté guardado en todos los métodos
    await guardarEstadoCompleto();
  } else {
    console.log('ℹ️ No se encontró estado previo - primera visita');
    metodosActivos.value = 'Nuevo';
  }
}

async function guardarEstadoCompleto() {
  const estado = {
    usadas: descargasUsadas.value,
    limite: limiteDescargas.value,
    dispositivoId: dispositivoId.value,
    timestamp: Date.now(),
    version: '6.0-ultra',
    domain: window.location.hostname
  };
  
  const estadoJson = JSON.stringify(estado);
  const metodosExitosos = [];
  
  // Guardar en todos los métodos disponibles
  try {
    // 1. Cookies
    const cookiesGuardadas = guardarEnCookies(estadoJson);
    metodosExitosos.push(...cookiesGuardadas);
    
    // 2. localStorage
    const lsGuardado = guardarEnLocalStorage(estadoJson);
    metodosExitosos.push(...lsGuardado);
    
    // 3. IndexedDB
    const idbGuardado = await guardarEnIndexedDB(estadoJson);
    metodosExitosos.push(...idbGuardado);
    
  } catch (error) {
    console.error('❌ Error guardando estado:', error);
  }
  
  ultimoGuardado.value = new Date().toLocaleTimeString();
  metodosActivos.value = `${metodosExitosos.length} métodos activos`;
  
  console.log(`💾 Estado guardado en ${metodosExitosos.length} ubicaciones:`, metodosExitosos);
  
  return metodosExitosos.length > 0;
}

async function verificarYMantenerPersistencia() {
  // Verificar si el estado sigue disponible en al menos un método
  const estadoCookies = cargarDesdeCookies();
  const estadoLS = cargarDesdeLocalStorage();
  const estadoIDB = await cargarDesdeIndexedDB();
  
  const estadosEncontrados = [estadoCookies, estadoLS, estadoIDB].filter(Boolean);
  
  if (estadosEncontrados.length === 0 && (descargasUsadas.value > 0 || estadoBloqueo.value === 'bloqueado')) {
    console.warn('⚠️ Estado perdido, restaurando desde memoria...');
    await guardarEstadoCompleto();
  } else if (estadosEncontrados.length < 3) {
    // Si faltan métodos, restaurar
    console.log(`🔧 Restaurando métodos faltantes (${estadosEncontrados.length}/3)...`);
    await guardarEstadoCompleto();
  }
}

// ================================
// FUNCIONES PRINCIPALES
// ================================

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
      
    // Incrementar contador INMEDIATAMENTE y guardar en TODOS los métodos
    descargasUsadas.value++;
    const guardado = await guardarEstadoCompleto();
    
    if (!guardado) {
      console.error('❌ CRITICAL: No se pudo guardar el estado');
    }
    
    console.log('📄 PDF generado. Estado ultra-persistente actualizado.');
    
    // Mostrar modal si se alcanzó el límite
    if (limiteAlcanzado.value) {
      setTimeout(() => {
        mostrarModalLimite.value = true;
      }, 1000);
    }
      
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    // NO revertir contador - mantener la descarga contada por seguridad
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
    console.error('❌ Error al copiar:', error);
  }
}

async function verificarCodigo() {
  const codigo = codigoDesbloqueo.value.trim().toUpperCase();
  if (!codigo) {
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
    'RANDY1324',
    'FULLRESET2024',
    'ULTRACLEAN2024'
  ];
  
  if (codigosValidos.includes(codigo)) {
    console.log('🔓 Código válido, iniciando LIMPIEZA TOTAL...');
    
    // LIMPIEZA TOTAL DE TODOS LOS MÉTODOS
    await limpiezaCompleta();
    
    alert('¡Código válido! Sistema completamente limpio y restablecido.');
    cerrarModal();
    
    console.log('✅ LIMPIEZA TOTAL completada');
  } else {
    alert('Código inválido. Contacte al administrador.');
  }
  
  codigoDesbloqueo.value = '';
}

async function limpiezaCompleta() {
  console.log('🧹 Iniciando limpieza completa del sistema...');
  
  // 1. Limpiar TODAS las cookies
  const allCookies = document.cookie.split(';');
  const pdfCookies = allCookies
    .map(cookie => cookie.split('=')[0].trim())
    .filter(name => name.toLowerCase().includes('pdf'));
  
  pdfCookies.forEach(cookieName => {
    const pastDate = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = `${cookieName}=; ${pastDate}; path=/`;
    document.cookie = `${cookieName}=; ${pastDate}; path=/; domain=${window.location.hostname}`;
  });
  
  // 2. Limpiar localStorage
  const lsKeys = Object.keys(localStorage).filter(key => 
    key.toLowerCase().includes('pdf') || key.includes('lock')
  );
  lsKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error eliminando ${key}:`, e);
    }
  });
  
  // 3. Limpiar IndexedDB
  try {
    const deleteRequest = indexedDB.deleteDatabase('PDFLockDB');
    deleteRequest.onsuccess = () => console.log('🗄️ IndexedDB eliminada');
  } catch (e) {
    console.warn('Error eliminando IndexedDB:', e);
  }
  
  // 4. Resetear estado
  descargasUsadas.value = 0;
  estadoBloqueo.value = 'desbloqueado';
  metodosActivos.value = 'Limpio';
  
  // 5. Regenerar ID del dispositivo
  dispositivoId.value = await generarIdDispositivo();
  
  console.log('🧹 Limpieza completa finalizada');
}

// Funciones de desarrollo
if (import.meta.env.DEV) {
  window.resetearTodoPDF = limpiezaCompleta;
  window.mostrarEstadoActual = () => {
    console.log('📊 Estado actual del sistema:');
    console.log('ID Dispositivo:', dispositivoId.value);
    console.log('Descargas:', descargasUsadas.value);
    console.log('Estado:', estadoBloqueo.value);
    console.log('Métodos activos:', metodosActivos.value);
  };
  window.forzarGuardado = guardarEstadoCompleto;
  window.verificarPersistencia = verificarYMantenerPersistencia;
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