<script setup>
import { useRouter } from 'vue-router';
import { useUsuarioStore } from '../stores/usuarios'; // ajusta la ruta según tu proyecto

const router = useRouter();
const usuarioStore = useUsuarioStore();

const cerrarSesion = () => {
  usuarioStore.$reset(); // Limpia Pinia
  localStorage.clear();  // Limpia token y datos del usuario
  router.push("/login"); // Navega al login
  location.reload();     // Recarga visual completa
};

import { ref, onMounted } from 'vue';
const nombre = ref('Invitado');

onMounted(() => {
  const datos = JSON.parse(localStorage.getItem('usuario'));
  if (datos?.nombre) nombre.value = datos.nombre;
});

</script>

<template>

    <!-- Menú lateral -->
    <aside class="sidebar">
      <h1 class="h1">Menu</h1>
      <nav>
  <span class="saludo">Bienvenido: <strong>{{ nombre }}</strong></span>
  
  <ul class="sidebar-menu">
    <li><router-link to="/panel/Hoja1">Datos Personales</router-link></li>
    <li><router-link to="/panel/Hoja2">Experiencia Laboral</router-link></li>
    <li><router-link to="/panel/Hoja2Extra">Registrar Experiencia</router-link></li>
    <li><router-link to="/panel/Hoja3">Tiempo Total de Experiencia</router-link></li>
    <li><router-link to= "/panel/vistaCompleta">Generar PDF</router-link></li>
    </ul>

  <button @click="cerrarSesion" class="boton-cerrar">Cerrar sesión</button>
</nav>

    </aside>
    <div class="main-content">
      <RouterView />
    </div>

</template>

<style>


</style>
