// backend/app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// --- Importar rutas API ---
import formacionAcademicaRoutes from "./routes/formacionAcademica.js";
import experienciaRoutes from "./routes/experiencia.js";
import hojaRoutes from "./routes/hojaVidaRoutes.js";
// import firmaServidorRoutes from "./routes/firmaServidor.js"; // Descomenta si la usas
import usuariosRoute from "./routes/usuarios.js";
import loginRoute from "./routes/login.js";
import datosPersonalesRoute from "./routes/datosPersonales.js";
import experienciaTotRoutes from "./routes/experienciaTot.js";
import pdfRoutes from "./routes/pdf.js";
import idiomasRoutes from "./routes/idiomas.js";


dotenv.config();
const app = express();

// --- Middleware global ---
app.use(express.json());

// --- Conexión MongoDB ---
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error en MongoDB:", err));

// --- Rutas API ---
app.use("/api/formacion-academica", formacionAcademicaRoutes);
app.use("/api/experiencia", experienciaRoutes);
app.use("/api/experiencia-tot", experienciaTotRoutes);
app.use("/api/usuarios", usuariosRoute);
app.use("/api/login", loginRoute);
app.use("/api/datos-personales", datosPersonalesRoute);
app.use("/api/pdf", pdfRoutes);
app.use("/api", hojaRoutes); 
app.use("/api/idiomas", idiomasRoutes);
// rutas de hoja de vida
// app.use("/api/firma-servidor", firmaServidorRoutes); // descomenta si la usas

// --- Configuración de frontend ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

// Servir archivos estáticos del frontend (carpeta, no archivo)
app.use(express.static(frontendDistPath));

// Redirigir todas las rutas que no sean /api a index.html (para Vue Router)
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  }
});

// --- Configurar puerto ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log("🌐 Modo: API + Frontend");
});

export default app;




