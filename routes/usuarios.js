// routes/usuarios.js
import express from 'express';
import { registrarUsuario }  from '../controllers/authController.js';

const router = express.Router();

router.post('/', registrarUsuario);

export default router;