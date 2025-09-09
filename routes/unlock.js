// backend/routes/unlock.js
import express from 'express';
import { verifyUnlock } from '../controllers/unlockController.js';
import verificarJWT from '../middlewares/verificarJWT.js';

const router = express.Router();

router.post('/verify', verificarJWT, verifyUnlock);

export default router;

