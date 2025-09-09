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

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const usernameInput = document.getElementById('username');
    const userRoleSelect = document.getElementById('userRole');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const userStatusElement = document.getElementById('userStatus');
    const downloadCountElement = document.getElementById('downloadCount');
    const userStatusCard = document.getElementById('userStatusCard');
    const usersContainer = document.getElementById('usersContainer');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const unlockAllBtn = document.getElementById('unlockAllBtn');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const notification = document.getElementById('notification');
    
    // Estado de la aplicación
    let currentUser = null;
    const MAX_DOWNLOADS = 3;
    
    // Inicializar almacenamiento
    initializeStorage();
    
    // Mostrar usuarios
    renderUsers();
    updateUI();
    
    // Event Listeners
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    downloadBtn.addEventListener('click', attemptDownload);
    resetAllBtn.addEventListener('click', resetAllLocks);
    unlockAllBtn.addEventListener('click', unlockAllUsers);
    viewAllBtn.addEventListener('click', viewAllStatus);
    
    // Funciones
    function initializeStorage() {
        if (!localStorage.getItem('users')) {
            // Usuarios predeterminados
            const defaultUsers = {
                'usuario1': { downloads: 0, locked: false, role: 'user' },
                'usuario2': { downloads: 0, locked: true, role: 'user' },
                'admin': { downloads: 0, locked: false, role: 'admin' }
            };
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
    }
    
    function getUsers() {
        return JSON.parse(localStorage.getItem('users') || '{}');
    }
    
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    function login() {
        const username = usernameInput.value.trim();
        const role = userRoleSelect.value;
        
        if (!username) {
            showNotification('Por favor ingresa un nombre de usuario', true);
            return;
        }
        
        const users = getUsers();
        
        // Si el usuario no existe, crearlo
        if (!users[username]) {
            users[username] = { 
                downloads: 0, 
                locked: false, 
                role: role 
            };
            saveUsers(users);
            showNotification(`Usuario ${username} creado correctamente`);
        }
        
        // Actualizar rol si es necesario
        if (users[username].role !== role) {
            users[username].role = role;
            saveUsers(users);
        }
        
        currentUser = username;
        updateUI();
        renderUsers();
        
        showNotification(`Sesión iniciada como ${username}`);
    }
    
    function logout() {
        currentUser = null;
        updateUI();
        showNotification('Sesión cerrada');
    }
    
    function attemptDownload() {
        if (!currentUser) {
            showNotification('Debes iniciar sesión primero', true);
            return;
        }
        
        const users = getUsers();
        const user = users[currentUser];
        
        if (user.locked) {
            showNotification('Tu cuenta está bloqueada para descargas', true);
            return;
        }
        
        // Incrementar contador de descargas
        user.downloads += 1;
        
        // Bloquear si alcanzó el límite
        if (user.downloads >= MAX_DOWNLOADS) {
            user.locked = true;
            showNotification(`Límite de descargas alcanzado. Cuenta bloqueada.`, true);
        } else {
            showNotification(`Descarga exitosa. Te quedan ${MAX_DOWNLOADS - user.downloads} descargas.`);
        }
        
        // Guardar cambios
        users[currentUser] = user;
        saveUsers(users);
        
        // Actualizar UI
        updateUI();
        renderUsers();
    }
    
    function updateUI() {
        if (currentUser) {
            const users = getUsers();
            const user = users[currentUser];
            
            // Actualizar información de usuario
            userStatusElement.textContent = user.locked ? 'BLOQUEADO' : 'DESBLOQUEADO';
            downloadCountElement.textContent = `${user.downloads}/${MAX_DOWNLOADS}`;
            
            // Estilo según estado
            if (user.locked) {
                userStatusCard.classList.add('locked');
                userStatusElement.style.color = '#e74c3c';
            } else {
                userStatusCard.classList.remove('locked');
                userStatusElement.style.color = '#27ae60';
            }
            
            // Estado del botón de descarga
            downloadBtn.disabled = user.locked;
            downloadBtn.classList.toggle('locked', user.locked);
            
            // Actualizar texto del botón
            if (user.locked) {
                downloadBtn.innerHTML = '<span>🔒</span> Descargas Bloqueadas';
            } else {
                downloadBtn.innerHTML = '<span>⬇️</span> Descargar Documento';
            }
            
            // Mostrar/ocultar botones según rol
            const isAdmin = user.role === 'admin';
            resetAllBtn.style.display = isAdmin ? 'block' : 'none';
            unlockAllBtn.style.display = isAdmin ? 'block' : 'none';
            viewAllBtn.style.display = isAdmin ? 'block' : 'none';
            
        } else {
            // Estado cuando no hay usuario autenticado
            userStatusElement.textContent = 'No autenticado';
            downloadCountElement.textContent = '0';
            userStatusCard.classList.remove('locked');
            userStatusElement.style.color = '#2c3e50';
            
            downloadBtn.disabled = true;
            downloadBtn.classList.remove('locked');
            downloadBtn.innerHTML = '<span>⬇️</span> Inicia sesión para descargar';
            
            // Ocultar botones de admin
            resetAllBtn.style.display = 'none';
            unlockAllBtn.style.display = 'none';
            viewAllBtn.style.display = 'none';
        }
    }
    
    function renderUsers() {
        const users = getUsers();
        usersContainer.innerHTML = '';
        
        Object.entries(users).forEach(([username, data]) => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            
            userElement.innerHTML = `
                <div class="user-info">
                    <span class="user-name">${username}</span>
                    <span class="user-status">${data.role} • ${data.downloads} descargas</span>
                </div>
                <div class="user-status ${data.locked ? 'locked-status' : 'unlocked-status'}">
                    ${data.locked ? 'BLOQUEADO' : 'DESBLOQUEADO'}
                </div>
            `;
            
            // Resaltar usuario actual
            if (username === currentUser) {
                userElement.style.backgroundColor = '#e3f2fd';
                userElement.style.border = '2px solid #3498db';
            }
            
            usersContainer.appendChild(userElement);
        });
    }
    
    function resetAllLocks() {
        if (!confirm('¿Estás seguro de que quieres resetear todos los contadores de descargas?')) return;
        
        const users = getUsers();
        Object.keys(users).forEach(username => {
            users[username].downloads = 0;
            users[username].locked = false;
        });
        
        saveUsers(users);
        updateUI();
        renderUsers();
        showNotification('Todos los contadores han sido reseteados');
    }
    
    function unlockAllUsers() {
        if (!confirm('¿Estás seguro de que quieres desbloquear todos los usuarios?')) return;
        
        const users = getUsers();
        Object.keys(users).forEach(username => {
            users[username].locked = false;
        });
        
        saveUsers(users);
        updateUI();
        renderUsers();
        showNotification('Todos los usuarios han sido desbloqueados');
    }
    
    function viewAllStatus() {
        const users = getUsers();
        let statusMessage = "Estado actual de todos los usuarios:\n\n";
        
        Object.entries(users).forEach(([username, data]) => {
            statusMessage += `${username} (${data.role}): ${data.downloads} descargas - ${data.locked ? 'BLOQUEADO' : 'DESBLOQUEADO'}\n`;
        });
        
        alert(statusMessage);
    }
    
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = 'notification show';
        if (isError) {
            notification.classList.add('error');
        } else {
            notification.classList.remove('error');
        }
        
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }
});
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