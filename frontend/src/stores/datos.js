import { defineStore } from "pinia";
import { ref } from "vue";

export const useDatosStore = defineStore("datos", () => {
  const datos = ref([  

   
 ]);

  return {
   datos,
  };
});
