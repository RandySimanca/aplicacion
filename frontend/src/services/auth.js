import { login } from "../services/login.js";

const iniciarSesion = async () => {
  error.value = "";
  loading.value = true;

  try {
    const { token, usuario } = await login(email.value, password.value);

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    router.push("/panel/Hoja2");
  } catch (e) {
    error.value = typeof e === "string" ? e : "Error inesperado";
  } finally {
    loading.value = false;
  }
};
