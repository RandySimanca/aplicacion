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

// POST principal
router.post("/datos-personales", verificarJWT, crearDatosPersonales);
router.get("/datos-personales", verificarJWT, obtenerDatosPersonales);
router.put("/datos-personales", verificarJWT, actualizarDatosPersonales);


export default router;
