//backend/routes/hojaVidaRoutes.js

import express from "express";
import { obtenerHojaCompleta } from "../controllers/hojaVidaController.js";
import verificarToken from "../middlewares/verificarJWT.js";


const router = express.Router();

router.get("/hoja-de-vida", verificarToken, obtenerHojaCompleta);

export default router;
