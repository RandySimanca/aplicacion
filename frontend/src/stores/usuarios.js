// stores/usuario.js
import { defineStore } from "pinia";

export const useUsuarioStore = defineStore("usuario", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    usuario: JSON.parse(localStorage.getItem("usuario")) || null,
  }),
  actions: {
    login(token, usuario) {
      this.token = token;
      this.usuario = usuario;
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
    },
    logout() {
      this.token = null;
      this.usuario = null;
      localStorage.clear();
    },
  },
});


// stores/usuarios.js
import api from '../helpers/axiosInstance';

export const useUsuariosStore = defineStore('usuarios', {
  state: () => ({
    uid: null,
    perfil: {},
  }),
  actions: {
    async cargarPerfil(uid) {
      const { data } = await api.get(`/usuarios/${uid}`);
      this.perfil = data;
    },
  },
});
