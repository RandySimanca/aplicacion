// routes/usuarios.js
import express from 'express';
import { registrarUsuario }  from '../controllers/authController.js';
import verificarJWT from '../middlewares/verificarJWT.js';
import requerirAdmin from '../middlewares/requerirAdmin.js';
import Usuario from '../models/Usuario.js';

const router = express.Router();

router.post('/', registrarUsuario);

// Solo admin puede listar usuarios
router.get('/', verificarJWT, requerirAdmin, async (_req, res) => {
  try {
    const users = await Usuario.find({}).select('nombre email roles bloqueado descargasRealizadas').lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

export default router;