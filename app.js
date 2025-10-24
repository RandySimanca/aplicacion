// backend/app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors"; // ✅ Importar cors

// --- Importar rutas API ---
import formacionAcademicaRoutes from "./routes/formacionAcademica.js";
import experienciaRoutes from "./routes/experiencia.js";
import hojaRoutes from "./routes/hojaVidaRoutes.js";
import usuariosRoute from "./routes/usuarios.js";
import loginRoute from "./routes/login.js";
import datosPersonalesRoute from "./routes/datosPersonales.js";
import experienciaTotRoutes from "./routes/experienciaTot.js";
import pdfRoutes from "./routes/pdf.js";
import idiomasRoutes from "./routes/idiomas.js";
import firmaServidorRoutes from "./routes/firmaServidor.js";

dotenv.config();
const app = express();

// --- Middleware CORS (antes de rutas) ---
app.use(cors({
  origin: 'http://localhost:5173', // tu frontend local
  credentials: true
}));

// --- Middleware global ---
app.use(express.json());

// --- Conexión MongoDB Mejorada ---
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: No se encontró MONGODB_URI en las variables de entorno");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB conectado"))
    .catch((err) => console.error("❌ Error en MongoDB:", err.message));
}

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
app.use("/api/firma-servidor", firmaServidorRoutes);

// --- Configuración de frontend MEJORADA ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const possiblePaths = [
  path.resolve(__dirname, "../frontend/dist"),
  path.resolve(__dirname, "./frontend/dist"),
  path.resolve(__dirname, "../dist"),
  path.resolve(__dirname, "./dist"),
  path.resolve(process.cwd(), "frontend/dist"),
  path.resolve(process.cwd(), "dist")
];

let frontendPath = null;

// Buscar la ruta correcta
for (const possiblePath of possiblePaths) {
  try {
    if (fs.existsSync(possiblePath) && fs.existsSync(path.join(possiblePath, "index.html"))) {
      frontendPath = possiblePath;
      console.log(`✅ Frontend encontrado en: ${frontendPath}`);
      break;
    }
  } catch (error) {
    console.log(`❌ Ruta no válida: ${possiblePath}`);
  }
}

// Servir archivos estáticos si se encontró el frontend
if (frontendPath) {
  app.use(express.static(frontendPath));
  
  // Redirigir todas las rutas no API al frontend
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendPath, "index.html"));
    }
  });
} else {
  console.log("⚠️ No se encontró el directorio del frontend");
  
  app.get("/", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Hoja de Vida - Error de Configuración</title></head>
      <body>
        <h1>⚠️ Error de Configuración</h1>
        <p>El frontend no se ha encontrado, pero el backend está funcionando correctamente.</p>
      </body>
      </html>
    `);
  });
}

// --- Configurar puerto ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log("🌐 Modo: API + Frontend");
});

export default app;

/**
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// --- Importar rutas API ---
import formacionAcademicaRoutes from "./routes/formacionAcademica.js";
import experienciaRoutes from "./routes/experiencia.js";
import hojaRoutes from "./routes/hojaVidaRoutes.js";
import usuariosRoute from "./routes/usuarios.js";
import loginRoute from "./routes/login.js";
import datosPersonalesRoute from "./routes/datosPersonales.js";
import experienciaTotRoutes from "./routes/experienciaTot.js";
import pdfRoutes from "./routes/pdf.js";
import idiomasRoutes from "./routes/idiomas.js";
import firmaServidorRoutes from "./routes/firmaServidor.js";


dotenv.config();
const app = express();

// --- Middleware global ---
app.use(express.json());

// --- Conexión MongoDB Mejorada ---
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: No se encontró MONGODB_URI en las variables de entorno");
  // No detenemos la ejecución para que el frontend pueda funcionar
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB conectado"))
    .catch((err) => console.error("❌ Error en MongoDB:", err.message));
}

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
app.use("/api/firma-servidor", firmaServidorRoutes);

// --- Configuración de frontend MEJORADA ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Múltiples rutas posibles para el frontend
const possiblePaths = [
  path.resolve(__dirname, "../frontend/dist"),
  path.resolve(__dirname, "./frontend/dist"),
  path.resolve(__dirname, "../dist"),
  path.resolve(__dirname, "./dist"),
  path.resolve(process.cwd(), "frontend/dist"),
  path.resolve(process.cwd(), "dist")
];

let frontendPath = null;

// Buscar la ruta correcta
for (const possiblePath of possiblePaths) {
  try {
    if (fs.existsSync(possiblePath) && fs.existsSync(path.join(possiblePath, "index.html"))) {
      frontendPath = possiblePath;
      console.log(`✅ Frontend encontrado en: ${frontendPath}`);
      break;
    }
  } catch (error) {
    console.log(`❌ Ruta no válida: ${possiblePath}`);
  }
}

// Servir archivos estáticos si se encontró el frontend
if (frontendPath) {
  app.use(express.static(frontendPath));
  
  // Redirigir todas las rutas no API al frontend
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendPath, "index.html"));
    }
  });
} else {
  console.log("⚠️ No se encontró el directorio del frontend");
  
  // Servir una página de error/respuesta básica
  app.get("/", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hoja de Vida - Error de Configuración</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #e74c3c; }
          .status { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .endpoints { margin-top: 30px; }
          .endpoint { background: #f8f9fa; padding: 10px; margin: 5px 0; border-left: 4px solid #007bff; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Error de Configuración</h1>
          <p>El frontend no se ha encontrado, pero el backend está funcionando correctamente.</p>
          
          <div class="status">
            <strong>Estado:</strong> Backend operativo<br>
            <strong>Base de datos:</strong> ${MONGODB_URI ? "Conectado" : "No configurado"}<br>
            <strong>Frontend:</strong> No encontrado
          </div>
          
          <h3>Endpoints disponibles:</h3>
          <div class="endpoints">
            <div class="endpoint">GET /api/experiencia</div>
            <div class="endpoint">GET /api/formacion-academica</div>
            <div class="endpoint">GET /api/usuarios</div>
            <div class="endpoint">GET /api/datos-personales</div>
            <div class="endpoint">GET /api/idiomas</div>
          </div>
          
          <p style="margin-top: 30px; color: #6c757d;">
            Para resolver este error, asegúrate de que el frontend se ha construido correctamente 
            y está en la carpeta frontend/dist o dist.
          </p>
        </div>
      </body>
      </html>
    `);
  });
}

// --- Configurar puerto ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log("🌐 Modo: API + Frontend");
});

export default app;
*/


