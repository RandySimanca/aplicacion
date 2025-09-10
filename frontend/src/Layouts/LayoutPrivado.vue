<template>
  <div class="layout">
    <MenuComponent />
    <div class="contenido">
      
    </div>
  </div>
 
</template>

<script setup>


import MenuComponent from '../components/MenuComponents.vue';
import axios from 'axios';
import api from '../api/axios';


const guardarExperiencia = async () => {
  try {
    await api.post('/api/experiencia', {
     
      //aqui se cargan los datos que se van a enviar
    });
    console.log('Enviado exitosamente');
  } catch (error) {
    console.error('Error al guardar:', error);
  }
};



</script>


<style>
.lateral {
  background-color: rgb(108, 108, 109);
}
.menu {
  width: 200px;
  background-color: rgb(2, 3, 68);
  padding: 20px;
  border-radius: 20px;
}

.menu ul {
  list-style: none;
  padding: 0;
}

.menu li {
  margin: 10px 0;
  list-style-type: none;
  padding-left: 0;
}

.menu a {
  text-decoration: none;
  color: rgb(249, 250, 250);
  background: rgb(100, 100, 100);
  padding: 10px;
  display: block;
  border-radius: 5px;
  transition: 0.5s;
}

.menu a:hover {
  background: rgb(6, 121, 167);
}

h1 {
  color: rgb(250, 250, 249);
  text-align: center;
}


.layout{
  display: flex;
}


</style>
