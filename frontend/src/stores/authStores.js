// frontend/stores/authStore.ts
export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "",
    userData: null,
  }),
  actions: {
    async login(credentials) {
      const { data } = await axios.post("/api/login", credentials);
      this.token = data.token;
      this.userData = data.user; // ya con la hoja de vida completa
    },
  },
});


import { useUsuariosStore } from './usuarios';

async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  localStorage.setItem('token', data.token);
  const usuariosStore = useUsuariosStore();
  usuariosStore.uid = data.uid;
  await usuariosStore.cargarPerfil(data.uid); // ✅
}