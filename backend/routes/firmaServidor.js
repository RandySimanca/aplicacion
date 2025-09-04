// backend/routes/firmaServidor.js
import express from "express";
import { guardarFirmaServidor, obtenerFirmaServidor } from "../controllers/firmaServidorControllers.js";
import auth from "../middlewares/auth.js";
import verificarJWT from "../middlewares/verificarJWT.js";

const router = express.Router();

router.use(auth, verificarJWT);

// Rutas
router.post("/", guardarFirmaServidor);
router.get("/", obtenerFirmaServidor);

export default router;
