// src/api/axios.js

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Ajusta según tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir token JWT si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;


/**import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Ajusta según tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir token JWT si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;*/
