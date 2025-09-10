//src/api.js
import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const baseURL = isProduction 
  ? 'https://hojadevida-app-815f199946f8.herokuapp.com/api' 
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

export default api;

/**import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

export default api;*/



