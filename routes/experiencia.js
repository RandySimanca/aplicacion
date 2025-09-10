//backend/routes/experiencia.js
import express from 'express';
import { 
  guardarExperiencia,
  obtenerExperiencias,
  eliminarExperiencia,
  actualizarExperiencia
} from '../controllers/experienciaControllers.js';
import auth from '../middlewares/auth.js';
import verificarJWT from '../middlewares/verificarJWT.js';

const router = express.Router();

// CRUD completo para experiencias
router.post('/', auth, guardarExperiencia);           // Crear
router.get('/', auth, obtenerExperiencias);           // Leer
router.put('/:id', auth, actualizarExperiencia);      // Actualizar
router.delete('/:id', auth, eliminarExperiencia);     // Eliminar

export default router;