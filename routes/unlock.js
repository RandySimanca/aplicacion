// backend/routes/unlock.js
import express from 'express';
import { verifyUnlock } from '../controllers/unlockController.js';

const router = express.Router();

// Permitir verificación de códigos sin requerir JWT,
// de modo que usuarios bloqueados puedan desbloquearse.
router.post('/verify', verifyUnlock);

export default router;

