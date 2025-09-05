//src/api.js
import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;


/**import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

export default api;*/


