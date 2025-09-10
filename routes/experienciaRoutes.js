//backend/routes/experienciaRoutes.js
import express from 'express';
import { guardarExperiencia } from '../controllers/experienciaControllers.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// POST /api/experiencia
router.post('/', auth, guardarExperiencia);

export default router;
