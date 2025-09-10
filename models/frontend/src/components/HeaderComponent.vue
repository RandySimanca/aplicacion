<template>
    <div class="container">
        <div class="image-column">
          <img
            src="/assets/Escudo.svg"
            alt="Logo institucional"
            class="imagen"
          />
        </div>
        <div class="compacto">
          <h3>FORMATO ÚNICO</h3>
          <h2>HOJA DE VIDA</h2>
          <p>Persona Natural</p>
          <p>(Leyes 190 de 1995, 489 y 443 de 1998)</p>
        </div>
        <div class="form-group">
          <label for="entidad">Entidad Receptora:</label>
          <input type="text" id="entidad" class="form-control3"/>
        </div>
      </div>
</template>

<script>
export default {
    name: "HeaderComponent",
    data() {
        return {
            entidad: ''
        };
    },
    
}
</script>

<style>

</style>