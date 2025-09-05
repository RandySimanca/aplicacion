// backend/index.js

import './app.js';

console.log('🚀 Servidor iniciado desde index.js');

/**import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import usuariosRoute from "./routes/usuarios.js";
import loginRoute from "./routes/login.js";
import datosPersonalesRoute from "./routes/datosPersonales.js";
import formacionAcademicaRoute from "./routes/formacionAcademica.js";
import hojaVidaRoute from "./routes/hojaVidaRoutes.js"; // Asegúrate de que la ruta sea correcta
import experienciaRoutes from "./routes/experiencia.js"; // Asegúrate de que la ruta sea correcta
import experienciaTotRoutes from "./routes/experienciaTot.js"; // Asegúrate de que la ruta sea correcta
import firmaServidorRoutes from "./routes/firmaServidor.js"; // Asegúrate de que la ruta sea correcta
import pdfRoutes from './routes/pdf.js';

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Registramos rutas con guión para coincidir con el front
app.use("/api/usuarios", usuariosRoute);
app.use("/api/login", loginRoute);
app.use("/api", datosPersonalesRoute);
app.use("/api/formacion-academica", formacionAcademicaRoute);
app.use("/api", hojaVidaRoute); // Asegúrate de que la ruta sea correcta
app.use("/api/experiencia", experienciaRoutes); // Asegúrate de que la ruta sea correcta
app.use("/api/experiencia-Tot", experienciaTotRoutes); // Asegúrate de que la ruta sea correcta
app.use("/api/firma-servidor", firmaServidorRoutes); // Asegúrate de que la ruta sea correcta
app.use('/api/pdf', pdfRoutes);


app.listen(3000, () => {
  console.log("✅ Servidor corriendo en puerto 3000");
});
*/