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
          <p>Has alcanzado el límite máximo de <strong>{{ limiteDescargas }} descargas</strong> de tu hoja de vida en PDF para el usuario <strong>{{ nombre }}</strong>.</p>
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
            <label for="codigo-input">Código de desbloqueo para {{ nombre }}:</label>
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
          
          <p class="note">El administrador podrá restablecer tu contador de descargas para este usuario específicamente.</p>
          
          <!-- Información de debug (solo en desarrollo) -->
          <div v-if="mostrarDebugInfo" class="debug-info">
            <p><strong>Info de Debug:</strong></p>
            <p>Usuario: {{ nombre }}</p>
            <p>ID Usuario: {{ usuarioId.substring(0, 12) }}...</p>
            <p>ID Dispositivo: {{ dispositivoId.substring(0, 12) }}...</p>
            <p>Descargas: {{ descargasUsadas }}/{{ limiteDescargas }}</p>
            <p>Estado: {{ estadoBloqueo }}</p>
            <p>Métodos activos: {{ metodosActivos }}</p>
            <p>Último guardado: {{ ultimoGuardado }}</p>
            <p>Código específico: UNLOCK_{{ usuarioId.substring(5, 13) }}</p>
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
      <span class="contador-text">{{ nombre }}: {{ descargasRestantes }} disponibles</span>
      <div class="contador-barra">
        <div 
          class="contador-progreso" 
          :style="{ width: `${(descargasUsadas / limiteDescargas) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Panel de administración (solo en desarrollo) -->
    <div v-if="mostrarDebugInfo" class="admin-panel">
      <h4>🛠️ Panel de Administración</h4>
      <div class="admin-controls">
        <button @click="mostrarEstadoCompleto" class="debug-btn">Ver Estado</button>
        <button @click="forzarGuardado" class="debug-btn">Forzar Guardado</button>
        <button @click="verificarPersistencia" class="debug-btn">Verificar Persistencia</button>
        <button @click="limpiarUsuarioActual" class="debug-btn danger">Limpiar Usuario</button>
      </div>
      <div class="debug-input">
        <input v-model="nuevoNombreUsuario" placeholder="Cambiar usuario..." />
        <button @click="cambiarUsuarioActual" class="debug-btn">Cambiar</button>
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

// Sistema de bloqueo ESPECÍFICO POR USUARIO
const limiteDescargas = ref(1);
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const textoCopiado = ref(false);
const codigoDesbloqueo = ref('');
const usuarioId = ref(''); // ID específico del usuario
const dispositivoId = ref(''); // ID del dispositivo
const estadoBloqueo = ref('desbloqueado');
const mostrarDebugInfo = ref(false);
const metodosActivos = ref('');
const ultimoGuardado = ref('');
const nuevoNombreUsuario = ref('');

let intervaloPersistencia = null;

// Computed properties
const descargasRestantes = computed(() => limiteDescargas.value - descargasUsadas.value);
const limiteAlcanzado = computed(() => descargasUsadas.value >= limiteDescargas.value);

onMounted(async () => {
  // Cargar información del usuario
  const datos = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (datos?.nombre) {
    nombre.value = datos.nombre.trim();
  }
  
  // Inicializar sistema de identificación DUAL (dispositivo + usuario)
  await inicializarSistemaIdentificacion();
  
  // Verificar y cargar estado específico del usuario
  await cargarEstadoUsuarioEspecifico();
  
  // Iniciar verificación periódica cada 15 segundos
  intervaloPersistencia = setInterval(verificarYMantenerPersistencia, 15000);

  // Mostrar info debug en desarrollo
  if (import.meta.env.DEV) {
    mostrarDebugInfo.value = true;
    console.log('🔧 Sistema de bloqueo por usuario específico activado');
  }
});

onUnmounted(() => {
  if (intervaloPersistencia) {
    clearInterval(intervaloPersistencia);
  }
});

// ================================
// SISTEMA DE IDENTIFICACIÓN DUAL
// ================================

async function inicializarSistemaIdentificacion() {
  console.log('🆔 Inicializando identificación dual (dispositivo + usuario)...');
  
  // 1. Generar ID único del dispositivo (compartido entre usuarios)
  dispositivoId.value = await generarIdDispositivo();
  
  // 2. Generar ID específico del usuario (único para cada usuario en el dispositivo)
  usuarioId.value = await generarIdUsuario(nombre.value, dispositivoId.value);
  
  console.log('🆔 IDs generados:');
  console.log('  Dispositivo:', dispositivoId.value);
  console.log('  Usuario:', usuarioId.value);
  console.log('  Para:', nombre.value);
}

async function generarIdDispositivo() {
  // ID del dispositivo - IGUAL para todos los usuarios del mismo dispositivo
  const componentesDispositivo = [];
  
  try {
    componentesDispositivo.push(navigator.userAgent);
    componentesDispositivo.push(navigator.platform);
    componentesDispositivo.push(screen.width + 'x' + screen.height + 'x' + screen.colorDepth);
    componentesDispositivo.push(new Date().getTimezoneOffset().toString());
    
    // Canvas fingerprinting para dispositivo
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.rect(20, 20, 150, 100);
    ctx.fill();
    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.font = '11pt Arial';
    ctx.fillText('DEVICE-ID-2024', 22, 50);
    componentesDispositivo.push(canvas.toDataURL());
    
    // WebGL fingerprinting
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      componentesDispositivo.push(gl.getParameter(gl.RENDERER) || '');
      componentesDispositivo.push(gl.getParameter(gl.VENDOR) || '');
    }
    
    componentesDispositivo.push(navigator.hardwareConcurrency || '0');
    componentesDispositivo.push(navigator.deviceMemory || '0');
    componentesDispositivo.push(window.devicePixelRatio || '1');
    
  } catch (error) {
    console.warn('Error generando componentes del dispositivo:', error);
    // Fallback básico
    componentesDispositivo.push('fallback-device-id');
  }
  
  const hash = await hashString(componentesDispositivo.join('|'));
  return `DEVICE_${hash.substring(0, 16).toUpperCase()}`;
}

async function generarIdUsuario(nombreUsuario, idDispositivo) {
  // ID específico del usuario - ÚNICO para cada usuario en cada dispositivo
  const componentesUsuario = [];
  
  try {
    // Información específica del usuario
    componentesUsuario.push(nombreUsuario || 'anonimo');
    componentesUsuario.push(idDispositivo); // Vincular al dispositivo
    
    // Timestamp de primera visita del usuario (específico por usuario)
    componentesUsuario.push(getOrCreateUserTimestamp(nombreUsuario));
    
    // Información adicional para hacer más único
    componentesUsuario.push(navigator.language);
    componentesUsuario.push('USER_SPECIFIC');
    
    // Hash adicional basado en el nombre del usuario
    const nombreHash = await hashString(nombreUsuario || 'default');
    componentesUsuario.push(nombreHash);
    
  } catch (error) {
    console.warn('Error generando componentes del usuario:', error);
    componentesUsuario.push(`fallback-user-${nombreUsuario || 'anonimo'}`);
  }
  
  const hash = await hashString(componentesUsuario.join('|'));
  return `USER_${hash.substring(0, 16).toUpperCase()}`;
}

function getOrCreateUserTimestamp(nombreUsuario) {
  // Crear clave específica para cada usuario
  const key = `user_first_visit_${hashStringSynch(nombreUsuario || 'anonimo')}`;
  let timestamp = localStorage.getItem(key);
  
  if (!timestamp) {
    timestamp = Date.now().toString();
    try {
      localStorage.setItem(key, timestamp);
    } catch (e) {
      timestamp = Date.now().toString();
    }
  }
  
  return timestamp;
}

async function hashString(str) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return hashStringSynch(str);
  }
}

function hashStringSynch(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// ================================
// MÉTODOS DE PERSISTENCIA POR USUARIO
// ================================

function obtenerClavesUsuario() {
  // Generar claves específicas SOLO para este usuario
  const baseKey = usuarioId.value;
  
  return {
    // LocalStorage - múltiples claves por usuario
    localStorage: [
      `pdf_lock_${baseKey}`,
      `pdf_downloads_${baseKey}`,
      `pdf_state_${baseKey}`,
      `lock_${hashStringSynch(baseKey)}`,
      btoa(`pdf_user_${baseKey}`).replace(/=/g, ''),
    ],
    
    // Cookies - múltiples cookies por usuario
    cookies: [
      `pdf_user_${baseKey}`,
      `downloads_${baseKey}`,
      `state_${hashStringSynch(baseKey)}`,
      `lock_${baseKey.substring(0, 10)}`,
    ],
    
    // IndexedDB - registros por usuario
    indexedDB: [
      `user_${baseKey}`,
      `downloads_${baseKey}`,
      `state_${hashStringSynch(baseKey)}`,
    ]
  };
}

// 1. LOCALSTORAGE ESPECÍFICO POR USUARIO
function guardarEnLocalStorageUsuario(data) {
  const claves = obtenerClavesUsuario().localStorage;
  const metodosGuardado = [];
  
  claves.forEach((clave, index) => {
    try {
      let valorAGuardar = data;
      
      // Aplicar encoding variado
      if (index === 1) {
        valorAGuardar = btoa(data);
      } else if (index === 2) {
        valorAGuardar = rot13(data);
      }
      
      localStorage.setItem(clave, valorAGuardar);
      metodosGuardado.push(`ls_user_${index}`);
    } catch (e) {
      console.warn(`Error guardando en localStorage ${clave}:`, e);
    }
  });
  
  return metodosGuardado;
}

function cargarDesdeLocalStorageUsuario() {
  const claves = obtenerClavesUsuario().localStorage;
  
  for (let index = 0; index < claves.length; index++) {
    const clave = claves[index];
    try {
      let valor = localStorage.getItem(clave);
      if (valor) {
        // Decodificar según el índice
        if (index === 1) {
          valor = atob(valor);
        } else if (index === 2) {
          valor = rot13(valor);
        }
        
        const estado = JSON.parse(valor);
        if (estado && typeof estado.usadas === 'number') {
          console.log(`💾 Estado del usuario cargado desde localStorage: ${clave}`);
          return estado;
        }
      }
    } catch (e) {
      console.warn(`Error cargando desde localStorage ${clave}:`, e);
    }
  }
  
  return null;
}

// 2. COOKIES ESPECÍFICAS POR USUARIO
function guardarEnCookiesUsuario(data) {
  const claves = obtenerClavesUsuario().cookies;
  const metodosGuardado = [];
  const expires = new Date();
  expires.setTime(expires.getTime() + (365 * 10 * 24 * 60 * 60 * 1000)); // 10 años
  
  claves.forEach((clave, index) => {
    try {
      let valorAGuardar = encodeURIComponent(data);
      
      // Aplicar encoding variado
      if (index === 1) {
        valorAGuardar = btoa(encodeURIComponent(data));
      } else if (index === 2) {
        valorAGuardar = encodeURIComponent(rot13(data));
      }
      
      const cookieString = `${clave}=${valorAGuardar}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
      document.cookie = cookieString;
      metodosGuardado.push(`cookie_user_${index}`);
    } catch (e) {
      console.warn(`Error guardando cookie ${clave}:`, e);
    }
  });
  
  return metodosGuardado;
}

function cargarDesdeCookiesUsuario() {
  const claves = obtenerClavesUsuario().cookies;
  
  for (let index = 0; index < claves.length; index++) {
    const clave = claves[index];
    let valor = getCookie(clave);
    if (valor) {
      try {
        // Decodificar según el índice
        if (index === 1) {
          valor = decodeURIComponent(atob(valor));
        } else if (index === 2) {
          valor = rot13(decodeURIComponent(valor));
        } else {
          valor = decodeURIComponent(valor);
        }
        
        const estado = JSON.parse(valor);
        if (estado && typeof estado.usadas === 'number') {
          console.log(`🍪 Estado del usuario cargado desde cookie: ${clave}`);
          return estado;
        }
      } catch (e) {
        console.warn(`Error parseando cookie ${clave}:`, e);
      }
    }
  }
  
  return null;
}

// 3. INDEXEDDB ESPECÍFICO POR USUARIO
function guardarEnIndexedDBUsuario(data) {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('PDFUserLockDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('userLocks')) {
          db.createObjectStore('userLocks', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['userLocks'], 'readwrite');
        const store = transaction.objectStore('userLocks');
        
        const claves = obtenerClavesUsuario().indexedDB;
        const registros = claves.map(clave => ({
          id: clave,
          data: data,
          usuario: usuarioId.value,
          timestamp: Date.now()
        }));
        
        let guardados = 0;
        registros.forEach(registro => {
          store.put(registro).onsuccess = () => {
            guardados++;
            if (guardados === registros.length) {
              console.log(`🗄️ Estado del usuario guardado en IndexedDB (${guardados} registros)`);
              resolve(registros.map((_, i) => `idb_user_${i}`));
            }
          };
        });
      };
      
      request.onerror = () => {
        console.warn('Error guardando en IndexedDB del usuario');
        resolve([]);
      };
    } catch (e) {
      console.warn('IndexedDB no disponible:', e);
      resolve([]);
    }
  });
}

function cargarDesdeIndexedDBUsuario() {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('PDFUserLockDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['userLocks'], 'readonly');
        const store = transaction.objectStore('userLocks');
        
        const claves = obtenerClavesUsuario().indexedDB;
        
        function intentarClave(index) {
          if (index >= claves.length) {
            resolve(null);
            return;
          }
          
          const request = store.get(claves[index]);
          request.onsuccess = () => {
            if (request.result && request.result.data) {
              try {
                const estado = JSON.parse(request.result.data);
                if (estado && typeof estado.usadas === 'number') {
                  console.log(`🗄️ Estado del usuario cargado desde IndexedDB: ${claves[index]}`);
                  resolve(estado);
                  return;
                }
              } catch (e) {
                console.warn(`Error parseando IndexedDB ${claves[index]}:`, e);
              }
            }
            intentarClave(index + 1);
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
// GESTIÓN DE ESTADO POR USUARIO
// ================================

async function cargarEstadoUsuarioEspecifico() {
  if (!usuarioId.value) {
    console.error('❌ ID de usuario no disponible');
    return;
  }
  
  console.log(`🔍 Cargando estado específico para usuario: ${nombre.value}`);
  
  let estadoEncontrado = null;
  let metodoUsado = '';
  
  // 1. Intentar cargar desde IndexedDB del usuario
  if (!estadoEncontrado) {
    estadoEncontrado = await cargarDesdeIndexedDBUsuario();
    if (estadoEncontrado) metodoUsado += 'IndexedDB-User ';
  }
  
  // 2. Intentar cargar desde cookies del usuario
  if (!estadoEncontrado) {
    estadoEncontrado = cargarDesdeCookiesUsuario();
    if (estadoEncontrado) metodoUsado += 'Cookies-User ';
  }
  
  // 3. Intentar cargar desde localStorage del usuario
  if (!estadoEncontrado) {
    estadoEncontrado = cargarDesdeLocalStorageUsuario();
    if (estadoEncontrado) metodoUsado += 'LocalStorage-User ';
  }
  
  if (estadoEncontrado) {
    descargasUsadas.value = Math.max(0, estadoEncontrado.usadas || 0);
    limiteDescargas.value = Math.max(1, estadoEncontrado.limite || 1);
    estadoBloqueo.value = descargasUsadas.value >= limiteDescargas.value ? 'bloqueado' : 'desbloqueado';
    metodosActivos.value = metodoUsado.trim();
    
    console.log(`✅ Estado del usuario ${nombre.value} cargado: ${descargasUsadas.value}/${limiteDescargas.value} desde ${metodoUsado}`);
    
    // Asegurar que el estado esté guardado en todos los métodos
    await guardarEstadoUsuarioCompleto();
  } else {
    console.log(`ℹ️ Sin estado previo para usuario ${nombre.value} - primera visita`);
    metodosActivos.value = 'Nuevo usuario';
  }
}

async function guardarEstadoUsuarioCompleto() {
  if (!usuarioId.value) {
    console.error('❌ No se puede guardar: ID de usuario no disponible');
    return false;
  }
  
  const estado = {
    usadas: descargasUsadas.value,
    limite: limiteDescargas.value,
    usuarioId: usuarioId.value,
    dispositivoId: dispositivoId.value,
    nombreUsuario: nombre.value,
    timestamp: Date.now(),
    version: '7.0-user-specific',
    domain: window.location.hostname
  };
  
  const estadoJson = JSON.stringify(estado);
  const metodosExitosos = [];
  
  try {
    // 1. Guardar en cookies específicas del usuario
    const cookiesGuardadas = guardarEnCookiesUsuario(estadoJson);
    metodosExitosos.push(...cookiesGuardadas);
    
    // 2. Guardar en localStorage específico del usuario
    const lsGuardado = guardarEnLocalStorageUsuario(estadoJson);
    metodosExitosos.push(...lsGuardado);
    
    // 3. Guardar en IndexedDB específico del usuario
    const idbGuardado = await guardarEnIndexedDBUsuario(estadoJson);
    metodosExitosos.push(...idbGuardado);
    
  } catch (error) {
    console.error('❌ Error guardando estado del usuario:', error);
  }
  
  ultimoGuardado.value = new Date().toLocaleTimeString();
  metodosActivos.value = `${metodosExitosos.length} métodos de usuario`;
  
  console.log(`💾 Estado del usuario ${nombre.value} guardado en ${metodosExitosos.length} ubicaciones`);
  
  return metodosExitosos.length > 0;
}

async function verificarYMantenerPersistencia() {
  if (!usuarioId.value) return;
  
  // Verificar si el estado del usuario sigue disponible
  const estadoCookies = cargarDesdeCookiesUsuario();
  const estadoLS = cargarDesdeLocalStorageUsuario();
  const estadoIDB = await cargarDesdeIndexedDBUsuario();
  
  const estadosEncontrados = [estadoCookies, estadoLS, estadoIDB].filter(Boolean);
  
  if (estadosEncontrados.length === 0 && (descargasUsadas.value > 0 || estadoBloqueo.value === 'bloqueado')) {
    console.warn(`⚠️ Estado del usuario ${nombre.value} perdido, restaurando...`);
    await guardarEstadoUsuarioCompleto();
  } else if (estadosEncontrados.length < 3) {
    console.log(`🔧 Restaurando métodos faltantes para ${nombre.value} (${estadosEncontrados.length}/3)...`);
    await guardarEstadoUsuarioCompleto();
  }
}

// ================================
// FUNCIONES PRINCIPALES
// ================================

async function generarPDF() {
  // Verificar que el usuario esté inicializado
  if (!usuarioId.value) {
    console.error('❌ Usuario no inicializado');
    alert('Error: Usuario no inicializado. Recarga la página.');
    return;
  }
  
  // Verificar límite específico del usuario
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
      
    // Incrementar contador ESPECÍFICO DEL USUARIO
    descargasUsadas.value++;
    const guardado = await guardarEstadoUsuarioCompleto();
    
    if (!guardado) {
      console.error('❌ CRITICAL: No se pudo guardar el estado del usuario');
    }
    
    console.log(`📄 PDF generado para ${nombreUsuario}. Estado específico actualizado.`);
    
    // Mostrar modal si este usuario alcanzó el límite
    if (limiteAlcanzado.value) {
      setTimeout(() => {
        mostrarModalLimite.value = true;
      }, 1000);
    }
      
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    // Mantener contador - política de seguridad
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

  const codigosGlobales = [
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
  
  // Código específico para este usuario
  const codigoUsuarioEspecifico = `UNLOCK_${usuarioId.value.substring(5, 13).toUpperCase()}`;
  
  const codigosValidos = [...codigosGlobales, codigoUsuarioEspecifico];
  
  if (codigosValidos.includes(codigo)) {
    console.log(`🔓 Código válido para usuario ${nombre.value}, iniciando limpieza...`);
    
    // LIMPIEZA ESPECÍFICA DEL USUARIO (no afecta otros usuarios)
    await limpiarUsuarioEspecifico();
    
    alert(`✅ Código válido! Límite de descargas restablecido para ${nombre.value}.`);
    cerrarModal();
    
    console.log(`✅ Limpieza específica completada para ${nombre.value}`);
  } else {
    alert('❌ Código inválido. Contacte al administrador.');
    if (mostrarDebugInfo.value) {
      console.log(`💡 Código específico para ${nombre.value}: ${codigoUsuarioEspecifico}`);
    }
  }
  
  codigoDesbloqueo.value = '';
}

async function limpiarUsuarioEspecifico() {
  if (!usuarioId.value) {
    console.error('❌ No se puede limpiar: ID de usuario no disponible');
    return;
  }
  
  console.log(`🧹 Limpiando datos específicos del usuario: ${nombre.value}`);
  
  const claves = obtenerClavesUsuario();
  
  // 1. Limpiar localStorage específico del usuario
  claves.localStorage.forEach(clave => {
    try {
      localStorage.removeItem(clave);
      console.log(`✅ Eliminado localStorage: ${clave}`);
    } catch (e) {
      console.warn(`Error eliminando localStorage ${clave}:`, e);
    }
  });
  
  // 2. Limpiar cookies específicas del usuario
  claves.cookies.forEach(cookieName => {
    try {
      const pastDate = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
      document.cookie = `${cookieName}=; ${pastDate}; path=/`;
      document.cookie = `${cookieName}=; ${pastDate}; path=/; domain=${window.location.hostname}`;
      console.log(`✅ Eliminada cookie: ${cookieName}`);
    } catch (e) {
      console.warn(`Error eliminando cookie ${cookieName}:`, e);
    }
  });
  
  // 3. Limpiar IndexedDB específico del usuario
  try {
    const request = indexedDB.open('PDFUserLockDB', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['userLocks'], 'readwrite');
      const store = transaction.objectStore('userLocks');
      
      claves.indexedDB.forEach(clave => {
        store.delete(clave).onsuccess = () => {
          console.log(`✅ Eliminado IndexedDB: ${clave}`);
        };
      });
    };
  } catch (e) {
    console.warn('Error limpiando IndexedDB:', e);
  }
  
  // 4. Resetear estado del usuario actual
  descargasUsadas.value = 0;
  estadoBloqueo.value = 'desbloqueado';
  metodosActivos.value = 'Usuario limpio';
  ultimoGuardado.value = '';
  
  console.log(`🧹 Limpieza específica completada para usuario: ${nombre.value}`);
}

// ================================
// FUNCIONES DE DEBUG Y ADMINISTRACIÓN
// ================================

function mostrarEstadoCompleto() {
  console.log('📊 Estado completo del usuario actual:');
  console.log('Nombre:', nombre.value);
  console.log('ID Usuario:', usuarioId.value);
  console.log('ID Dispositivo:', dispositivoId.value);
  console.log('Descargas:', descargasUsadas.value);
  console.log('Límite:', limiteDescargas.value);
  console.log('Estado:', estadoBloqueo.value);
  console.log('Métodos activos:', metodosActivos.value);
  console.log('Último guardado:', ultimoGuardado.value);
  console.log('Código específico:', `UNLOCK_${usuarioId.value.substring(5, 13).toUpperCase()}`);
  
  // Mostrar claves específicas del usuario
  console.log('🔑 Claves específicas del usuario:');
  const claves = obtenerClavesUsuario();
  console.log('LocalStorage:', claves.localStorage);
  console.log('Cookies:', claves.cookies);
  console.log('IndexedDB:', claves.indexedDB);
}

async function forzarGuardado() {
  console.log('💾 Forzando guardado del estado del usuario...');
  const exito = await guardarEstadoUsuarioCompleto();
  console.log(exito ? '✅ Guardado exitoso' : '❌ Error en guardado');
}

async function verificarPersistencia() {
  console.log('🔍 Verificando persistencia del usuario...');
  await verificarYMantenerPersistencia();
  console.log('✅ Verificación completada');
}

async function limpiarUsuarioActual() {
  if (confirm(`¿Estás seguro de limpiar todos los datos del usuario "${nombre.value}"?`)) {
    await limpiarUsuarioEspecifico();
    console.log('🧹 Usuario limpiado');
  }
}

function cambiarUsuarioActual() {
  const nuevoNombre = nuevoNombreUsuario.value.trim();
  if (!nuevoNombre) {
    alert('Por favor ingrese un nombre de usuario válido');
    return;
  }
  
  localStorage.setItem('usuario', JSON.stringify({ nombre: nuevoNombre }));
  console.log(`🔄 Usuario cambiado a: ${nuevoNombre}. Recargando página...`);
  location.reload();
}

function listarUsuariosBloqueados() {
  console.log('🗂️ Buscando usuarios bloqueados en este dispositivo...');
  
  // Buscar en localStorage
  console.log('📁 LocalStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('pdf_lock_USER_') || key.includes('pdf_downloads_USER_'))) {
      try {
        const valor = localStorage.getItem(key);
        const estado = JSON.parse(valor);
        if (estado.usadas > 0) {
          console.log(`  ${key}: ${estado.nombreUsuario || 'Sin nombre'} - ${estado.usadas}/${estado.limite}`);
        }
      } catch (e) {
        console.log(`  ${key}: (error parsing)`);
      }
    }
  }
  
  // Buscar en cookies
  console.log('🍪 Cookies:');
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name && name.includes('pdf_user_USER_')) {
      console.log(`  ${name}: (cookie encontrada)`);
    }
  });
}

// Funciones de desarrollo y debug
if (import.meta.env.DEV) {
  window.resetearUsuarioActual = limpiarUsuarioEspecifico;
  window.mostrarEstadoUsuario = mostrarEstadoCompleto;
  window.forzarGuardadoUsuario = guardarEstadoUsuarioCompleto;
  window.verificarPersistenciaUsuario = verificarYMantenerPersistencia;
  window.cambiarUsuario = (nuevoNombre) => {
    localStorage.setItem('usuario', JSON.stringify({ nombre: nuevoNombre }));
    console.log(`🔄 Usuario cambiado a: ${nuevoNombre}. Recarga la página para aplicar.`);
    location.reload();
  };
  window.listarUsuariosBloqueados = listarUsuariosBloqueados;
}
</script>

<style scoped>
/* ================================
   ESTILOS PRINCIPALES
   ================================ */

.pdf-root {
  background: white;
  width: 100%;
  max-width: 8.5in;
  margin: 0 auto;
  position: relative;
  transition: all 0.3s ease;
}

.pdf-root.generando-pdf {
  opacity: 0.7;
  pointer-events: none;
}

/* ================================
   BOTÓN DE GENERAR PDF
   ================================ */

.pdf-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.pdf-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.pdf-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.pdf-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.pdf-button.limite-alcanzado {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  animation: pulse-warning 2s infinite;
}

.pdf-button.limite-alcanzado:hover {
  background: linear-gradient(135deg, #ff5252 0%, #d63031 100%);
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.6);
}

@keyframes pulse-warning {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ================================
   CONTADOR VISUAL
   ================================ */

.contador-info {
  position: fixed;
  bottom: 100px;
  right: 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 15px;
  padding: 12px 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transition: all 0.3s ease;
}

.contador-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.contador-text {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  display: block;
  margin-bottom: 8px;
}

.contador-barra {
  width: 150px;
  height: 6px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.contador-progreso {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* ================================
   MODAL DE LÍMITE ALCANZADO
   ================================ */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 25px 25px 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.modal-body {
  padding: 25px;
}

.modal-body p {
  margin: 0 0 15px;
  color: #666;
  line-height: 1.6;
}

/* ================================
   INFORMACIÓN DE CONTACTO
   ================================ */

.contact-info {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

/* ================================
   CÓDIGO DE DESBLOQUEO
   ================================ */

.codigo-desbloqueo {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #667eea;
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
}

.codigo-desbloqueo label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  font-size: 14px;
}

.codigo-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  background: white;
}

.codigo-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-verificar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-verificar:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-verificar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ================================
   DEBUG INFO
   ================================ */

.debug-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.debug-info p {
  margin: 5px 0 !important;
  color: #495057 !important;
}

.debug-info strong {
  color: #333;
}

.note {
  font-size: 13px;
  color: #999;
  font-style: italic;
  margin-top: 15px;
}

/* ================================
   FOOTER DEL MODAL
   ================================ */

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
}

/* ================================
   PANEL DE ADMINISTRACIÓN
   ================================ */

.admin-panel {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 999;
  max-width: 300px;
}

.admin-panel h4 {
  margin: 0 0 15px;
  color: #333;
  font-size: 16px;
}

.admin-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.debug-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e9ecef;
}

.debug-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.debug-btn.danger {
  background: #ff6b6b;
  color: white;
  border-color: #ff5252;
}

.debug-btn.danger:hover {
  background: #ff5252;
}

.debug-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.debug-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
}

.debug-input input:focus {
  outline: none;
  border-color: #667eea;
}

/* ================================
   RESPONSIVO
   ================================ */

@media (max-width: 768px) {
  .pdf-button {
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    font-size: 14px;
  }
  
  .contador-info {
    bottom: 80px;
    right: 20px;
    padding: 10px 15px;
  }
  
  .contador-text {
    font-size: 12px;
  }
  
  .contador-barra {
    width: 120px;
  }
  
  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
  
  .admin-panel {
    top: 10px;
    left: 10px;
    right: 10px;
    max-width: none;
    position: relative;
    margin-bottom: 20px;
  }
}

/* ================================
   ANIMACIONES ADICIONALES
   ================================ */

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.pdf-button.limite-alcanzado .btn-icon {
  animation: bounce 2s infinite;
}

/* ================================
   ESTADOS DE LOADING
   ================================ */

.generando-pdf::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.6; }
}

/* ================================
   EFECTOS DE GLASSMORPHISM
   ================================ */

.modal-overlay {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.pdf-button,
.contador-info,
.admin-panel {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>