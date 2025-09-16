<template>
  <div class="login-wrapper">
    <!-- Panel de información de contacto -->
    <div class="contact-panel">
      <div class="contact-header">
        <div class="logo">
          <div class="logo-icon">💼</div>
          <h1>Hoja de Vida en Formato Unico</h1>
        </div>
        <p class="tagline">Construye tu futuro profesional</p>
      </div>
      
      <div class="contact-info">
        <h3>¿Necesitas ayuda?</h3>
        <div class="contact-item">
          <span class="icon">📧</span>
          <div>
            <strong>Email</strong>
            <p>randysimancamercado@gmail.com</p>
          </div>
        </div>
        <!--<div class="contact-item">
          <span class="icon">📱</span>
          <div>
            <strong>Teléfono</strong>
            <p>+57 (1) 234-5678</p>
          </div>
        </div>-->
        <div class="contact-item">
          <span class="icon">💬</span>
          <div>
            <strong>WhatsApp</strong>
            <p>+57 314 519 3285</p>
          </div>
        </div>
       <!-- <div class="contact-item">
          <span class="icon">🌐</span>
         <div>
            <strong>Sitio Web</strong>
            <p>www.cvbuilder.com</p>
          </div>
        </div>-->
      </div>

     <!-- <div class="features">
        <h3>¿Por qué elegirnos?</h3>
        <ul>
          <li>✨ Plantillas profesionales</li>
          <li>🔒 Datos 100% seguros</li>
          <li>📊 Estadísticas en tiempo real</li>
          <li>🎯 Optimizado para ATS</li>
        </ul>
      </div>-->
    </div> 

    <!-- Formulario de login -->
    <div class="login-card">
      <div class="form-header">
        <h2>{{ modoRegistro ? "Crear cuenta" : "¡Bienvenido de vuelta!" }}</h2>
        <p>
          {{
            modoRegistro
              ? "Únete a miles de profesionales que confían en nosotros"
              : "Inicia sesión para acceder a tu panel profesional"
          }}
        </p>
      </div>

      <form @submit.prevent="modoRegistro ? handleRegister() : handleLogin()">
        <div class="input-group">
          <label for="email">Correo electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="input-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="modoRegistro" class="input-group">
          <label for="nombre">Nombre completo</label>
          <input
            id="nombre"
            v-model="nombre"
            type="text"
            placeholder="Juan Pérez"
            autocomplete="name"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          <span v-if="loading" class="spinner"></span>
          {{
            loading
              ? modoRegistro
                ? "Creando cuenta..."
                : "Ingresando..."
              : modoRegistro
              ? "Crear mi cuenta"
              : "Iniciar sesión"
          }}
        </button>

        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>
      </form>

      <div class="form-footer">
        <p>
          {{ modoRegistro ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?" }}
          <button @click="modoRegistro = !modoRegistro" class="toggle-btn">
            {{ modoRegistro ? "Iniciar sesión" : "Crear cuenta gratis" }}
          </button>
        </p>
      </div>

      <!-- Enlaces adicionales -->
      <div class="additional-links">
        <a href="#" class="link">¿Olvidaste tu contraseña?</a>
        <span class="separator">•</span>
        <a href="#" class="link">Términos y condiciones</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../api/axios"; 
import { useHojaVidaStore } from "../stores/hojaVida";

const email = ref("");
const password = ref("");
const nombre = ref("");
const error = ref("");
const loading = ref(false);
const modoRegistro = ref(false);
const router = useRouter();

const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  return window.location.origin;
};

const handleLogin = async () => {
  error.value = "";
  if (!email.value || !password.value) {
    error.value = "Por favor completa todos los campos";
    return;
  }

  loading.value = true;
  try {
    const res = await axios.post(`${getApiUrl()}/api/login`, {
      email: email.value,
      password: password.value,
    });

    const { token, usuario } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    const hojaStore = useHojaVidaStore();
    await hojaStore.cargarHojaDeVida();

    router.push(usuario.roles.includes("admin") ? "/admin" : "/panel/Hoja1");
  } catch (e) {
    console.error('Error de login:', e);
    error.value = e.response?.data?.mensaje || "Error de conexión. Verifica tus credenciales.";
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  error.value = "";
  if (!email.value || !password.value || !nombre.value) {
    error.value = "Por favor completa todos los campos para continuar";
    return;
  }

  loading.value = true;
  try {
    await axios.post(`${getApiUrl()}/api/usuarios`, {
      email: email.value,
      password: password.value,
      nombre: nombre.value,
      roles: ["usuario"],
    });

    modoRegistro.value = false;
    error.value = "🎉 ¡Registro exitoso! Ahora puedes iniciar sesión.";
  } catch (e) {
    console.error('Error de registro:', e);
    error.value = e.response?.data?.mensaje || "Error al crear la cuenta. Intenta nuevamente.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-wrapper {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Panel de contacto */
.contact-panel {
  flex: 1;
  max-width: 500px;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.contact-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.logo h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.contact-info {
  margin-bottom: 2rem;
}

.contact-info h3,
.features h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #fff;
  text-align: center;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.contact-item .icon {
  font-size: 1.5rem;
  min-width: 2rem;
}

.contact-item div strong {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.contact-item div p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Formulario de login */
.login-card {
  flex: 1;
  max-width: 500px;
  background: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #1a202c;
  font-weight: 700;
}

.form-header p {
  color: #718096;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.input-group input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f7fafc;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #feb2b2;
}

.error-icon {
  font-size: 1.1rem;
}

.form-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.form-footer p {
  color: #718096;
  margin: 0;
}

.toggle-btn {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.toggle-btn:hover {
  color: #764ba2;
}

.additional-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

.link {
  color: #718096;
  text-decoration: none;
  transition: color 0.3s ease;
}

.link:hover {
  color: #667eea;
  text-decoration: underline;
}

.separator {
  color: #cbd5e0;
}

/* Responsive */
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
  }
  
  .contact-panel {
    max-width: none;
    padding: 2rem;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .login-card {
    max-width: none;
    padding: 2rem;
  }
  
  .logo {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .logo h1 {
    font-size: 2rem;
  }
  
  .form-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .contact-panel,
  .login-card {
    padding: 1.5rem;
  }
  
  .additional-links {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .separator {
    display: none;
  }
}
</style>


