import axios from "axios";
import api from "../api/axios";

export const login = async (email, password) => {
  try {
    const response = await api.post("http://localhost:3000/api/login", {
        email: email, // el backend espera "correo"
        password,
      });
      
    
    return response.data;
  } catch (err) {
    throw err.response?.data?.error || "Error de conexión";
  }
};

const email = ref("");
const password = ref("");
const error = ref("");






const handleLogin = async () => {
  error.value = "";
  loading.value = true;

  try {
    const { token, usuario } = await login(email.value, password.value);

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    router.push("/panel/Hoja2");
  } catch (e) {
    error.value = typeof e === "string" ? e : e.message || "Error inesperados";
    console.error("Login fallido:", e);
  } finally {
    loading.value = false;
  }
};
