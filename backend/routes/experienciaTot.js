// backend/routes/resumenExperiencia.js

import express from "express";
import { guardarExperienciaTot, obtenerExperienciaTot } from "../controllers/experienciaTotControllers.js";
import verificarJWT from "../middlewares/verificarJWT.js";

const router = express.Router();

router.post("/", verificarJWT, guardarExperienciaTot);
router.get("/", verificarJWT, obtenerExperienciaTot);

export default router;
