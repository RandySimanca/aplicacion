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
              <span class="limit-number">{{ descargasUsadas }}</span>
              <span class="limit-text">descargas utilizadas</span>
            </div>
          </div>
          
          <p class="main-message">Has alcanzado el límite máximo de descargas de tu hoja de vida en PDF.</p>
          
          <!-- Información de identificación del usuario -->
          <div class="device-info">
            <h4>👤 Información del usuario</h4>
            <div class="device-details">
              <div class="device-item">
                <span class="device-label">Nombre de usuario:</span>
                <span class="device-value">{{ nombre }}</span>
              </div>
              <div class="device-item">
                <span class="device-label">ID único del usuario:</span>
                <code class="device-value">{{ usuarioId }}</code>
              </div>
              <div class="device-item">
                <span class="device-label">Navegador:</span>
                <span class="device-value">{{ navegadorInfo }}</span>
              </div>
            </div>
          </div>
          
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
            <p>Para obtener un código de desbloqueo, contacta al administrador proporcionando tu ID de usuario:</p>
            
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
            <p class="note">💡 Menciona tu ID de usuario y nombre al contactar al administrador para recibir un código específico.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary">Cerrar</button>
          <button @click="copiarInfoCompleta" class="btn-primary">
            {{ textoCopiado ? '✅ Copiado' : '📋 Copiar info completa' }}
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
      <div class="usuario-actual">
        <span class="usuario-text">Usuario: {{ nombre }}</span>
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
import { useRoute } from 'vue-router';
import { useUsuarioStore } from '../stores/usuarios';
import api from '../api/axios';

const documento = ref(null);
const generando = ref(false);
const nombre = ref('Invitado');
const route = useRoute();
const usuarioStore = useUsuarioStore();

// Sistema de contador de descargas por usuario
const limiteDescargas = ref(1);
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const textoCopiado = ref(false);
const codigoDesbloqueo = ref('');
const mensajeVerificacion = ref('');
const esError = ref(false);
const verificandoCodigo = ref(false);
const usuarioId = ref('');
const navegadorInfo = ref('');

// Computed properties
const descargasRestantes = computed(() => limiteDescargas.value - descargasUsadas.value);
const limiteAlcanzado = computed(() => descargasUsadas.value >= limiteDescargas.value);

// Persistencia reforzada: IndexedDB para que el bloqueo perdure tras cerrar sesión
let idbInstance = null;

function abrirBD() {
  return new Promise((resolve, reject) => {
    if (idbInstance) {
      resolve(idbInstance);
      return;
    }
    const request = window.indexedDB.open('pdfLimiterDB', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('userCounters')) {
        db.createObjectStore('userCounters', { keyPath: 'usuarioId' });
      }
      if (!db.objectStoreNames.contains('usersRegistry')) {
        db.createObjectStore('usersRegistry', { keyPath: 'usuarioId' });
      }
    };
    request.onsuccess = (event) => {
      idbInstance = event.target.result;
      resolve(idbInstance);
    };
    request.onerror = () => reject(request.error);
  });
}

async function idbObtenerContador(usuarioIdClave) {
  try {
    const db = await abrirBD();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('userCounters', 'readonly');
      const store = tx.objectStore('userCounters');
      const getReq = store.get(usuarioIdClave);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (e) {
    console.warn('IndexedDB no disponible para obtener contador:', e);
    return null;
  }
}

async function idbGuardarContador(info) {
  try {
    const db = await abrirBD();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('userCounters', 'readwrite');
      const store = tx.objectStore('userCounters');
      const putReq = store.put(info);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (e) {
    console.warn('IndexedDB no disponible para guardar contador:', e);
  }
}

async function idbRegistrarUsuario(registro) {
  try {
    const db = await abrirBD();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('usersRegistry', 'readwrite');
      const store = tx.objectStore('usersRegistry');
      const putReq = store.put(registro);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (e) {
    console.warn('IndexedDB no disponible para registrar usuario:', e);
  }
}

onMounted(async () => {
  await inicializarSistema();
});

// Watcher para cambios en el nombre del usuario
watch(nombre, async (nuevoNombre, nombreAnterior) => {
  if (nuevoNombre !== nombreAnterior && nuevoNombre !== 'Invitado') {
    await actualizarSistemaUsuario();
  }
});

async function inicializarSistema() {
  // Cargar datos del usuario desde localStorage
  const datos = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (datos?.nombre) {
    nombre.value = datos.nombre;
  }
  
  // Generar información del navegador
  generarInfoNavegador();
  
  // Generar ID único para el usuario actual - MODIFICADO PARA USAR ID PERSISTENTE
  await generarUsuarioId();
  
  // Cargar contador de descargas específico del usuario
  await cargarContadorUsuario();
}

async function actualizarSistemaUsuario() {
  // Regenerar el ID de usuario cuando cambia el nombre (mantener persistencia)
  const nombreAnterior = usuarioId.value;
  await generarUsuarioId();
  
  // Si el ID cambió, migrar datos del ID anterior
  if (nombreAnterior && nombreAnterior !== usuarioId.value) {
    try {
      const claveAnterior = `pdf_user_${nombreAnterior}`;
      const datosAnteriores = localStorage.getItem(claveAnterior);
      if (datosAnteriores) {
        const info = JSON.parse(datosAnteriores);
        descargasUsadas.value = info.usadas || 0;
        limiteDescargas.value = info.limite || 1;
        console.log(`Datos migrados de ID anterior: ${nombreAnterior} -> ${usuarioId.value}`);
        
        // Limpiar datos antiguos
        localStorage.removeItem(claveAnterior);
      }
    } catch (error) {
      console.error('Error migrando datos del ID anterior:', error);
    }
  }
  
  await cargarContadorUsuario();
}

function generarInfoNavegador() {
  try {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Extraer información básica del navegador
    let browserName = 'Unknown';
    if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Safari')) browserName = 'Safari';
    else if (userAgent.includes('Edge')) browserName = 'Edge';
    
    navegadorInfo.value = `${platform} - ${browserName}`;
  } catch (error) {
    navegadorInfo.value = 'Navegador desconocido';
  }
}

async function generarUsuarioId() {
  try {
    // MODIFICADO: Usar el ID del store de usuario si está disponible
    // Esto asegura que el ID persista entre sesiones
    if (usuarioStore.user && usuarioStore.user.id) {
      usuarioId.value = `user_${usuarioStore.user.id}`;
      return;
    }
    
    // Fallback: Crear un ID único basado en información persistente
    const datosUsuario = {
      nombre: nombre.value.toLowerCase().trim(),
      // Usamos información que persiste entre sesiones
      userAgent: navigator.userAgent.substring(0, 50),
      language: navigator.language,
      // No usar timestamp para que sea consistente entre sesiones
    };
    
    const cadenaUsuario = JSON.stringify(datosUsuario);
    usuarioId.value = await generarHashUsuario(cadenaUsuario);
    
  } catch (error) {
    console.error('Error generando ID de usuario:', error);
    // Fallback simple - sin timestamp para persistencia
    usuarioId.value = await generarHashUsuario(nombre.value);
  }
}

async function generarHashUsuario(texto) {
  // Generar un hash determinístico pero único para el usuario
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    const char = texto.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  
  // Agregar el nombre como prefijo para hacer más legible el ID
  const nombreLimpio = nombre.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const hashStr = Math.abs(hash).toString(36).toUpperCase().padStart(6, '0');
  
  return `${nombreLimpio.substring(0, 4)}_${hashStr}`;
}

function obtenerClavesUsuario() {
  const nombreSeguro = nombre.value.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  return {
    principal: `pdf_user_${usuarioId.value}`,
    backup: `pdf_backup_${usuarioId.value}`,
    legacy: `pdf_legacy_${nombreSeguro}`,
    global: `pdf_users_registry`
  };
}

async function cargarContadorUsuario() {
  if (!usuarioId.value || !nombre.value || nombre.value === 'Invitado') {
    // Si no hay usuario válido, usar valores por defecto
    descargasUsadas.value = 0;
    limiteDescargas.value = 1;
    return;
  }
  
  const claves = obtenerClavesUsuario();
  let contadorCargado = false;
  
  // 1) Intentar cargar desde IndexedDB (persistente tras logout)
  try {
    const infoIdb = await idbObtenerContador(usuarioId.value);
    if (infoIdb && infoIdb.usuarioId === usuarioId.value) {
      // Validar aislamiento por usuario
      descargasUsadas.value = Math.max(0, infoIdb.usadas || 0);
      limiteDescargas.value = Math.max(1, infoIdb.limite || 1);
      contadorCargado = true;
      console.log(`Contador (IDB) cargado para usuario: ${nombre.value} (${usuarioId.value})`);
    }
  } catch (e) {
    console.warn('Fallo carga desde IndexedDB, probando localStorage...');
  }
  
  // Intentar cargar desde la clave principal del usuario
  if (!contadorCargado) {
    try {
      const datos = localStorage.getItem(claves.principal);
      if (datos) {
        const info = JSON.parse(datos);
        if (info.usuarioId === usuarioId.value && info.nombre === nombre.value) {
          descargasUsadas.value = Math.max(0, info.usadas || 0);
          limiteDescargas.value = Math.max(1, info.limite || 1);
          contadorCargado = true;
          console.log(`Contador (LS) cargado para usuario: ${nombre.value} (${usuarioId.value})`);
          // Sincronizar a IndexedDB para persistencia robusta
          await idbGuardarContador({ ...info });
        }
      }
    } catch (error) {
      console.error('Error cargando contador principal:', error);
    }
  }
  
  // Si no se pudo cargar, intentar con backup
  if (!contadorCargado) {
    try {
      const datosBackup = localStorage.getItem(claves.backup);
      if (datosBackup) {
        const info = JSON.parse(datosBackup);
        if (info.usuarioId === usuarioId.value) {
          descargasUsadas.value = Math.max(0, info.usadas || 0);
          limiteDescargas.value = Math.max(1, info.limite || 1);
          contadorCargado = true;
          console.log(`Contador cargado desde backup para: ${nombre.value}`);
          // Sincronizar a IndexedDB para persistencia robusta
          await idbGuardarContador({ ...info });
        }
      }
    } catch (error) {
      console.error('Error cargando backup:', error);
    }
  }
  
  // Si es la primera vez para este usuario, inicializar
  if (!contadorCargado) {
    descargasUsadas.value = 0;
    limiteDescargas.value = 1;
    await guardarContadorUsuario();
    await registrarUsuario();
    console.log(`Nuevo usuario inicializado: ${nombre.value} (${usuarioId.value})`);
  }
  
  // Validar límites
  if (descargasUsadas.value > limiteDescargas.value) {
    descargasUsadas.value = limiteDescargas.value;
    await guardarContadorUsuario();
  }
}

async function guardarContadorUsuario() {
  if (!usuarioId.value || !nombre.value || nombre.value === 'Invitado') {
    return;
  }
  
  const info = {
    usuarioId: usuarioId.value,
    nombre: nombre.value,
    usadas: descargasUsadas.value,
    limite: limiteDescargas.value,
    ultimaDescarga: new Date().toISOString(),
    fechaCreacion: new Date().toISOString(),
    navegadorInfo: navegadorInfo.value,
    version: '3.0' // Nueva versión para sistema por usuarios
  };
  
  const claves = obtenerClavesUsuario();
  
  // Guardar en clave principal y backup
  try {
    localStorage.setItem(claves.principal, JSON.stringify(info));
    localStorage.setItem(claves.backup, JSON.stringify(info));
    await idbGuardarContador(info);
    
    console.log(`Contador guardado para usuario: ${nombre.value} (${descargasUsadas.value}/${limiteDescargas.value})`);
  } catch (error) {
    console.error('Error guardando contador de usuario:', error);
  }
}

async function registrarUsuario() {
  // Mantener un registro de todos los usuarios para administración
  try {
    const claves = obtenerClavesUsuario();
    const registro = JSON.parse(localStorage.getItem(claves.global) || '{}');
    
    registro[usuarioId.value] = {
      nombre: nombre.value,
      usuarioId: usuarioId.value,
      fechaRegistro: new Date().toISOString(),
      ultimaActividad: new Date().toISOString(),
      navegadorInfo: navegadorInfo.value
    };
    
    localStorage.setItem(claves.global, JSON.stringify(registro));
    await idbRegistrarUsuario(registro[usuarioId.value]);
  } catch (error) {
    console.error('Error registrando usuario:', error);
  }
}

function manejarClickBoton() {
  if (limiteAlcanzado.value) {
    mostrarModalLimite.value = true;
  } else {
    generarPDF();
  }
}

async function generarPDF() {
  // Verificar que tenemos un usuario válido
  if (!nombre.value || nombre.value === 'Invitado') {
    alert('Por favor, asegúrate de que tu nombre de usuario esté configurado correctamente.');
    return;
  }
  
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
      
    // Incrementar contador DESPUÉS de descarga exitosa
    descargasUsadas.value++;
    await guardarContadorUsuario();
    
    console.log(`PDF generado exitosamente para ${nombre.value}. Descargas: ${descargasUsadas.value}/${limiteDescargas.value}`);
    
    // Si alcanzó el límite, mostrar modal
    if (limiteAlcanzado.value) {
      setTimeout(() => {
        mostrarModalLimite.value = true;
      }, 1500);
    }
      
  } catch (error) {
    console.error('Error al generar PDF:', error);
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

async function copiarInfoCompleta() {
  try {
    const infoCompleta = `
Solicitud de desbloqueo de PDF - Usuario Individual
================================================
Nombre del usuario: ${nombre.value}
ID único del usuario: ${usuarioId.value}
Navegador: ${navegadorInfo.value}
Descargas usadas: ${descargasUsadas.value}/${limiteDescargas.value}

Contacto del administrador:
Randy Simanca
+57 314 519 3285
randysimancamercado@gmail.com

Por favor, proporciona un código de desbloqueo específico para este usuario.
    `.trim();
    
    await navigator.clipboard.writeText(infoCompleta);
    textoCopiado.value = true;
    setTimeout(() => {
      textoCopiado.value = false;
    }, 3000);
  } catch (error) {
    console.error('Error al copiar:', error);
    // Fallback
    const textoFallback = `Usuario: ${nombre.value} - ID: ${usuarioId.value} - Randy: +57 314 519 3285`;
    try {
      const textArea = document.createElement('textarea');
      textArea.value = textoFallback;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      textoCopiado.value = true;
      setTimeout(() => textoCopiado.value = false, 3000);
    } catch (fallbackError) {
      alert(`Usuario: ${nombre.value}\nID: ${usuarioId.value}\nTeléfono: +57 314 519 3285`);
    }
  }
}

async function verificarCodigo() {
  if (!codigoDesbloqueo.value.trim()) {
    mostrarMensajeVerificacion('Por favor ingrese un código de desbloqueo', true);
    return;
  }
  
  verificandoCodigo.value = true;
  mensajeVerificacion.value = '';
  
  try {
    const payload = {
      codigo: codigoDesbloqueo.value.trim(),
      usuarioId: usuarioId.value,
      nombre: nombre.value
    };
    const { data } = await api.post('/pdf/verificar-codigo', payload);
    if (data?.valido) {
      descargasUsadas.value = 0;
      await guardarContadorUsuario();
      console.log(`Desbloqueo exitoso (server) para usuario: ${nombre.value} (${usuarioId.value})`);
      mostrarMensajeVerificacion(`¡Código válido! Se han restablecido las descargas para ${nombre.value}.`, false);
      setTimeout(() => {
        cerrarModal();
      }, 2000);
    } else {
      mostrarMensajeVerificacion(data?.mensaje || `Código inválido para el usuario ${nombre.value}.`, true);
    }
  } catch (error) {
    console.error('Error al verificar código:', error);
    mostrarMensajeVerificacion('No se pudo verificar el código. Intenta de nuevo.', true);
  } finally {
    verificandoCodigo.value = false;
    codigoDesbloqueo.value = '';
  }
}

function mostrarMensajeVerificacion(mensaje, error) {
  mensajeVerificacion.value = mensaje;
  esError.value = error;
  
  if (error) {
    setTimeout(() => {
      mensajeVerificacion.value = '';
    }, 8000);
  }
}

// Funciones para desarrollo/testing
function resetearContadorUsuario() {
  if (import.meta.env.DEV) {
    descargasUsadas.value = 0;
    guardarContadorUsuario();
    console.log(`Contador reseteado para usuario: ${nombre.value} (${usuarioId.value})`);
  }
}

function verTodosLosUsuarios() {
  if (import.meta.env.DEV) {
    const usuarios = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pdf_user_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          usuarios[key] = data;
        } catch (e) {
          usuarios[key] = localStorage.getItem(key);
        }
      }
    }
    console.log('Usuarios registrados:', usuarios);
    
    // También mostrar el registro global
    try {
      const registro = JSON.parse(localStorage.getItem('pdf_users_registry') || '{}');
      console.log('Registro global:', registro);
    } catch (e) {
      console.log('Sin registro global');
    }
  }
}

function limpiarDatosDesarrollo() {
  if (import.meta.env.DEV) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('pdf_')) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
    console.log('Datos de PDF limpiados:', keys);
    location.reload();
  }
}

// Exponer funciones para desarrollo
if (import.meta.env.DEV) {
  window.resetearContadorUsuarioPDF = resetearContadorUsuario;
  window.verTodosLosUsuariosPDF = verTodosLosUsuarios;
  window.limpiarDatosPDF = limpiarDatosDesarrollo;
  window.usuarioActual = () => ({ nombre: nombre.value, id: usuarioId.value });
  window.generarCodigoUsuario = () => `UNLOCK_${usuarioId.value}_2024`;
}

// Sistema de protección mejorado para múltiples usuarios
if (typeof window !== 'undefined') {
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;
  
  localStorage.setItem = function(key, value) {
    // Permitir que cada usuario tenga sus propias claves
    if (key.includes('pdf_user_') && !key.includes(usuarioId.value)) {
      // Permitir que otros usuarios tengan sus propios contadores
      return originalSetItem.call(this, key, value);
    }
    if (key.includes('pdf_') && !key.includes('user_') && !key.includes('users_registry')) {
      console.warn('Intento de manipulación de datos PDF detectado');
      return;
    }
    return originalSetItem.call(this, key, value);
  };
  
  localStorage.removeItem = function(key) {
    if (key.includes('pdf_') && !key.includes(usuarioId.value)) {
      console.warn('Intento de eliminación de datos de otros usuarios detectado');
      return;
    }
    return originalRemoveItem.call(this, key);
  };
  
  localStorage.clear = function() {
    console.warn('Intento de limpieza completa detectado');
    const resultado = originalClear.call(this);
    setTimeout(() => {
      // Recargar solo el usuario actual, no afectar a otros
      if (usuarioId.value && nombre.value) {
        descargasUsadas.value = limiteDescargas.value; // Bloquear por seguridad
        guardarContadorUsuario();
      }
    }, 100);
    return resultado;
  };
}
</script>

<style>
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

.btn-icon { 
  font-size: 18px; 
  line-height: 1; 
}

.btn-text { 
  font-size: 14px; 
}

.contador-info {
  position: fixed;
  right: 24px;
  bottom: 90px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
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
  margin-bottom: 8px;
}

.contador-progreso {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.usuario-actual {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #f3f4f6;
}

.usuario-text {
  font-size: 11px;
  color: #6b7280;
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 5px;
  border-radius: 5px;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 25px;
  line-height: 1.6;
}

.limit-info {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.limit-badge {
  background: #fef2f2;
  color: #dc2626;
  padding: 15px 25px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #fecaca;
}

.limit-number {
  font-size: 2rem;
  font-weight: 700;
  display: block;
  line-height: 1;
}

.limit-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.main-message {
  text-align: center;
  color: #374151;
  margin: 20px 0;
  font-size: 1.05rem;
  line-height: 1.5;
}

.device-info, .unlock-section, .contact-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
}

.device-info h4, .unlock-section h4, .contact-section h4 {
  margin: 0 0 15px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-details {
  display: grid;
  gap: 10px;
}

.device-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
}

.device-label {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.9rem;
}

.device-value {
  font-family: monospace;
  background: #f3f4f6;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.codigo-desbloqueo {
  margin-top: 15px;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.codigo-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.codigo-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.btn-verificar {
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-verificar:hover:not(:disabled) {
  background: #2563eb;
}

.btn-verificar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.mensaje-verificacion {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 10px;
}

.mensaje-verificacion.success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.mensaje-verificacion.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.contact-info {
  display: grid;
  gap: 12px;
  margin-top: 15px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 8px;
}

.contact-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.note-section {
  background: #eff6ff;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.note {
  margin: 0;
  color: #1e40af;
  font-size: 0.95rem;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary, .btn-primary {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background: #2563eb;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease infinite;
}

.generando-pdf .no-imprimir {
  display: none !important;
}

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
  
  .device-item {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}
</style>