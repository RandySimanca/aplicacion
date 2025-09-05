//src/api.js
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  withCredentials: true,
});

/**import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

export default api;*/

