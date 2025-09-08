//backend/routes/datosPersonales.js
import express from "express";
import { crearDatosPersonales } from "../controllers/datosPersonalesControllers.js";
import { obtenerDatosPersonales } from "../controllers/datosPersonalesControllers.js";
import { actualizarDatosPersonales } from "../controllers/datosPersonalesControllers.js";
import auth from "../middlewares/auth.js";
import verificarJWT from "../middlewares/verificarJWT.js";

const router = express.Router();

// Ruta de test (¡útil para verificar que se monte bien!)
router.get("/test", (req, res) => {
  res.send("🚀 Ruta de datos-personales activa");
});

// ✅ CORRECCIÓN: Usar "/" en lugar de "/datos-personales"
// Porque ya tienes "/api/datos-personales" en app.js
router.post("/", verificarJWT, crearDatosPersonales);    // POST /api/datos-personales/
router.get("/", verificarJWT, obtenerDatosPersonales);   // GET /api/datos-personales/
router.put("/", verificarJWT, actualizarDatosPersonales); // PUT /api/datos-personales/

export default router;
