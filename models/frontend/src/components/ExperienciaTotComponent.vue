<template>
  <div class="section declaration">
   
      <div class="section-title">
        <span class="section-number">4</span> TIEMPO TOTAL DE EXPERIENCIA
      </div>
      <p>
        INDIQUE EL TIEMPO TOTAL DE SU EXPERIENCIA LABORAL EN NÚMERO DE AÑOS Y
        MESES.
      </p>

      <table class="experience-table">
        <thead>
          <tr>
            <th>OCUPACIÓN</th>
            <th>TIEMPO DE EXPERIENCIA</th>
          </tr>
          <tr>
            <th></th>
            <th>AÑOS</th>
            <th>MESES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>SERVIDOR PÚBLICO</td>
            <td>
              <input
                type="number"
                :value="publico.anios"
                readonly
                min="0"
                max="99"
              />
            </td>
            <td>
              <input
                type="number"
                :value="publico.meses"
                readonly
                min="0"
                max="11"
              />
            </td>
          </tr>
          <tr>
            <td>EMPLEADO DEL SECTOR PRIVADO</td>
            <td>
              <input
                type="number"
                :value="privado.anios"
                readonly
                min="0"
                max="99"
              />
            </td>
            <td>
              <input
                type="number"
                :value="privado.meses"
                readonly
                min="0"
                max="11"
              />
            </td>
          </tr>
          <tr>
            <td>TRABAJADOR INDEPENDIENTE</td>
            <td>
              <input
                type="number"
                :value="independiente.anios"
                readonly
                min="0"
                max="99"
              />
            </td>
            <td>
              <input
                type="number"
                :value="independiente.meses"
                readonly
                min="0"
                max="11"
              />
            </td>
          </tr>
          <tr>
            <td><strong>TOTAL TIEMPO EXPERIENCIA</strong></td>
            <td><input type="number" :value="totalAnios" readonly /></td>
            <td><input type="number" :value="totalMeses" readonly /></td>
          </tr>
        </tbody>
      </table>
    
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  publico: Object,
  privado: Object,
  independiente: Object,
  totalAnios: Number,
  totalMeses: Number,
});
</script>

<style scoped>
/* Estilos opcionales */
</style>
