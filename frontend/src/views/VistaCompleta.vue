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
          
          <p class="main-message">Has alcanzado el límite máximo de descargas de tu hoja de vida en PDF.</p>
          
          <!-- Información de identificación del dispositivo -->
          <div class="device-info">
            <h4>🔍 Información del dispositivo</h4>
            <div class="device-details">
              <div class="device-item">
                <span class="device-label">ID del dispositivo:</span>
                <code class="device-value">{{ dispositivoId }}</code>
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
            <p>Para obtener un código de desbloqueo, contacta al administrador proporcionando tu ID de dispositivo:</p>
            
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
            <p class="note">💡 Menciona tu ID de usuario al contactar al administrador para recibir un código específico.</p>
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

// Sistema robusto de contador de descargas
const limiteDescargas = ref(3); // Reducido para mayor control
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const textoCopiado = ref(false);
const codigoDesbloqueo = ref('');
const mensajeVerificacion = ref('');
const esError = ref(false);
const verificandoCodigo = ref(false);
const dispositivoId = ref('');
const navegadorInfo = ref('');

// Computed properties
const descargasRestantes = computed(() => limiteDescargas.value - descargasUsadas.value);
const limiteAlcanzado = computed(() => descargasUsadas.value >= limiteDescargas.value);

onMounted(async () => {
  const datos = JSON.parse(localStorage.getItem('usuario'));
  if (datos?.nombre) nombre.value = datos.nombre;
  
  // Generar información del dispositivo
  await generarInfoDispositivo();
  
  // Cargar contador de descargas
  await cargarContadorDescargas();
});

// Función para generar un fingerprint único del dispositivo
async function generarInfoDispositivo() {
  try {
    // Obtener información del navegador y sistema
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fingerprint test', 2, 2);
    const canvasFingerprint = canvas.toDataURL();
    
    const navegador = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
    
    const pantalla = {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    };
    
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Crear un hash único del dispositivo
    const deviceData = JSON.stringify({
      navegador,
      pantalla,
      timezone,
      canvasFingerprint: canvasFingerprint.slice(0, 50), // Solo una parte del canvas
      timestamp: Math.floor(Date.now() / (1000 * 60 * 60 * 24)) // Día actual
    });
    
    // Generar hash simple pero efectivo
    dispositivoId.value = await generarHash(deviceData);
    navegadorInfo.value = `${navegador.platform} - ${navegador.userAgent.split(' ').slice(-2).join(' ')}`;
    
  } catch (error) {
    console.error('Error generando info del dispositivo:', error);
    // Fallback con información básica
    dispositivoId.value = await generarHash(navigator.userAgent + screen.width + screen.height);
    navegadorInfo.value = navigator.platform;
  }
}

// Función para generar hash simple
async function generarHash(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    const char = texto.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(8, '0');
}

// Sistema de almacenamiento múltiple y persistente
function obtenerClavesPersistencia() {
  return [
    `pdf_counter_${dispositivoId.value}`, // Clave principal basada en dispositivo
    `pdf_backup_${dispositivoId.value}`, // Respaldo
    `pdf_legacy_${dispositivoId.value}`, // Legacy para compatibilidad
    'pdf_global_counter', // Contador global como último recurso
  ];
}

async function cargarContadorDescargas() {
  if (!dispositivoId.value) return;
  
  const claves = obtenerClavesPersistencia();
  let contadorCargado = false;
  
  // Intentar cargar desde diferentes fuentes
  for (const clave of claves) {
    try {
      const datos = localStorage.getItem(clave);
      if (datos) {
        const info = JSON.parse(datos);
        if (info.dispositivoId === dispositivoId.value || clave.includes('global')) {
          descargasUsadas.value = Math.max(0, info.usadas || 0);
          limiteDescargas.value = Math.max(1, info.limite || 3);
          contadorCargado = true;
          console.log(`Contador cargado desde: ${clave}`);
          break;
        }
      }
    } catch (error) {
      console.error(`Error cargando desde ${clave}:`, error);
      continue;
    }
  }
  
  if (!contadorCargado) {
    // Primera vez - verificar si hay indicios de uso previo
    const indiciosUso = verificarIndiciosUsoPrevio();
    if (indiciosUso.detectado) {
      descargasUsadas.value = limiteDescargas.value; // Bloquear por defecto
      console.log('Indicios de uso previo detectados - aplicando bloqueo preventivo');
    } else {
      descargasUsadas.value = 0;
    }
    await guardarContadorDescargas();
  }
  
  // Validar límites
  if (descargasUsadas.value > limiteDescargas.value) {
    descargasUsadas.value = limiteDescargas.value;
    await guardarContadorDescargas();
  }
}

function verificarIndiciosUsoPrevio() {
  try {
    // Buscar cualquier clave relacionada con PDF en localStorage
    const clavesRelacionadas = [];
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (clave && (clave.includes('pdf') || clave.includes('download'))) {
        clavesRelacionadas.push(clave);
      }
    }
    
    // Si hay muchas claves relacionadas, posible intento de bypass
    if (clavesRelacionadas.length > 3) {
      return { detectado: true, razon: 'Múltiples claves PDF detectadas' };
    }
    
    // Verificar patrones sospechosos en el historial
    if (window.history && window.history.length > 50) {
      return { detectado: true, razon: 'Historial extenso detectado' };
    }
    
    return { detectado: false };
    
  } catch (error) {
    // En caso de error, ser conservador
    return { detectado: true, razon: 'Error en verificación' };
  }
}

async function guardarContadorDescargas() {
  if (!dispositivoId.value) return;
  
  const info = {
    dispositivoId: dispositivoId.value,
    usadas: descargasUsadas.value,
    limite: limiteDescargas.value,
    ultimaDescarga: new Date().toISOString(),
    fechaCreacion: new Date().toISOString(),
    navegadorInfo: navegadorInfo.value,
    version: '2.0' // Para futuras migraciones
  };
  
  const claves = obtenerClavesPersistencia();
  
  // Guardar en múltiples ubicaciones
  for (const clave of claves) {
    try {
      localStorage.setItem(clave, JSON.stringify(info));
    } catch (error) {
      console.error(`Error guardando en ${clave}:`, error);
    }
  }
  
  // También intentar guardar en sessionStorage como respaldo
  try {
    sessionStorage.setItem(`pdf_session_${dispositivoId.value}`, JSON.stringify(info));
  } catch (error) {
    console.error('Error guardando en sessionStorage:', error);
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
    await guardarContadorDescargas();
    
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
Solicitud de desbloqueo de PDF
==============================
Nombre: ${nombre.value}
ID del dispositivo: ${dispositivoId.value}
Navegador: ${navegadorInfo.value}
Descargas usadas: ${descargasUsadas.value}/${limiteDescargas.value}

Contacto del administrador:
Randy Simanca
+57 314 519 3285
randysimancamercado@gmail.com

Por favor, proporciona un código de desbloqueo para este dispositivo.
    `.trim();
    
    await navigator.clipboard.writeText(infoCompleta);
    textoCopiado.value = true;
    setTimeout(() => {
      textoCopiado.value = false;
    }, 3000);
  } catch (error) {
    console.error('Error al copiar:', error);
    // Fallback
    const textoFallback = `ID: ${dispositivoId.value} - Randy Simanca: +57 314 519 3285`;
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
      alert(`ID del dispositivo: ${dispositivoId.value}\nTeléfono: +57 314 519 3285`);
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
  
  await new Promise(r => setTimeout(r, 800));
  
  const codigoIngresado = codigoDesbloqueo.value.trim().toUpperCase();
  
  // Códigos específicos por dispositivo (más seguros)
  const codigoEspecifico = `UNLOCK_${dispositivoId.value}_2024`;
  const codigosGlobales = [
    'RANDYADMIN1208',
    'MASTER_RESET_2024',
    'EMERGENCY_UNLOCK',
    codigoEspecifico
  ];
  
  if (codigosGlobales.includes(codigoIngresado)) {
    // Código válido - resetear contador
    descargasUsadas.value = 0;
    await guardarContadorDescargas();
    
    // Log del desbloqueo para auditoria
    console.log(`Desbloqueo exitoso: ${codigoIngresado} para dispositivo ${dispositivoId.value}`);
    
    mostrarMensajeVerificacion('¡Código válido! Se han restablecido tus descargas disponibles.', false);
    
    setTimeout(() => {
      cerrarModal();
    }, 2000);
  } else {
    mostrarMensajeVerificacion(`Código inválido. Tu ID de dispositivo es: ${dispositivoId.value}`, true);
  }
  
  verificandoCodigo.value = false;
  codigoDesbloqueo.value = '';
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

// Función para desarrollo/testing
function resetearContador() {
  if (import.meta.env.DEV) {
    descargasUsadas.value = 0;
    guardarContadorDescargas();
    console.log('Contador reseteado para dispositivo:', dispositivoId.value);
  }
}

function verContadores() {
  if (import.meta.env.DEV) {
    const contadores = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('pdf')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          contadores[key] = data;
        } catch (e) {
          contadores[key] = localStorage.getItem(key);
        }
      }
    }
    console.log('Contadores:', contadores);
    console.log('Dispositivo actual:', dispositivoId.value);
  }
}

// Exponer funciones para desarrollo
if (import.meta.env.DEV) {
  window.resetearContadorPDF = resetearContador;
  window.verContadoresPDF = verContadores;
  window.dispositivoActual = () => dispositivoId.value;
  window.generarCodigoDesbloqueo = () => `UNLOCK_${dispositivoId.value}_2024`;
}

// Interceptar intentos de manipulación del localStorage
if (typeof window !== 'undefined') {
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;
  
  localStorage.setItem = function(key, value) {
    if (key.includes('pdf') && !key.includes(dispositivoId.value)) {
      console.warn('Intento de manipulación detectado');
      return;
    }
    return originalSetItem.call(this, key, value);
  };
  
  localStorage.removeItem = function(key) {
    if (key.includes('pdf')) {
      console.warn('Intento de eliminación detectado');
      return;
    }
    return originalRemoveItem.call(this, key);
  };
  
  localStorage.clear = function() {
    console.warn('Intento de limpieza completa detectado');
    // Permitir clear pero recargar inmediatamente los contadores
    const resultado = originalClear.call(this);
    setTimeout(() => {
      if (dispositivoId.value) {
        descargasUsadas.value = limiteDescargas.value; // Bloquear por seguridad
        guardarContadorDescargas();
      }
    }, 100);
    return resultado;
  };
}
</script>

<style>
/* Estilos base mantenidos igual que el original */
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

/* Contador visual */
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

/* Sección de información del dispositivo */
.device-info {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 1px solid #0ea5e9;
}

.device-info h4 {
  margin: 0 0 1rem 0;
  color: #0369a1;
  font-size: 1.1rem;
  font-weight: 600;
}

.device-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.device-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.device-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0369a1;
}

.device-value {
  font-size: 0.875rem;
  color: #1e293b;
  background: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  word-break: break-all;
}

code.device-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  background: #1e293b;
  color: #10b981;
  border-color: #374151;
}

/* Modal estilos mantenidos iguales */
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
  max-width: 600px;
  width: 95%;
  max-height: 90vh;
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
  max-height: 65vh;
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
    max-width: none;
  }
  
  .modal-header {
    padding: 1.25rem 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
    max-height: 70vh;
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
  
  .unlock-section, .contact-section, .device-info {
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
  
  .device-details {
    gap: 0.5rem;
  }
  
  .device-value {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
}</style>