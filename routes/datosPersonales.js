//backend/routes/datosPersonales.js
import express from "express";
import { crearDatosPersonales } from "../controllers/datosPersonalesControllers.js";
import { obtenerDatosPersonales } from "../controllers/datosPersonalesControllers.js";
import { actualizarDatosPersonales } from "../controllers/datosPersonalesControllers.js";
import auth from "../middlewares/auth.js";
import verificarJWT from "../middlewares/verificarJWT.js";



const router = express.Router();


// POST principal
router.post("/datos-personales", verificarJWT, crearDatosPersonales);
router.get("/datos-personales", verificarJWT, obtenerDatosPersonales);
router.put("/datos-personales", verificarJWT, actualizarDatosPersonales);


export default router;
