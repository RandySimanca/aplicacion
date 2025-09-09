// backend/routes/admin.js
import express from "express";
import verificarJWT from "../middlewares/verificarJWT.js";
import requerirAdmin from "../middlewares/requerirAdmin.js";
import {
  createUnlockCode,
  listUnlockCodes,
  updateUnlockCode,
  deleteUnlockCode,
  dashboardMetrics,
  setUsuarioBloqueado,
  listUsers,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(verificarJWT, requerirAdmin);

// Unlock codes CRUD
router.get("/unlock-codes", listUnlockCodes);
router.post("/unlock-codes", createUnlockCode);
router.patch("/unlock-codes/:id", updateUnlockCode);
router.delete("/unlock-codes/:id", deleteUnlockCode);

// Metrics
router.get("/metrics", dashboardMetrics);
router.get("/usuarios", listUsers);

// Usuarios bloqueo
router.patch("/usuarios/:id/bloqueo", setUsuarioBloqueado);

export default router;

