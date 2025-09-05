//routes/login.js

// backend/routes/login.js
import express from 'express';
import { loginUsuario } from '../controllers/authController.js';

const router = express.Router();

// Monta únicamente loginUsuario
router.post('/', loginUsuario);

export default router;