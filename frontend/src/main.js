//frontend/src/main.js
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import axios from "axios";


const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  

