//backend/middlewares/validateFormacion.js
import { body, validationResult } from 'express-validator';

const validateFormacion = [
  body('gradoBasica')
    .isInt({ min: 1, max: 11 }).withMessage('Grado básico debe ser 1–11'),
  body('tituloBachiller')
    .notEmpty().withMessage('Título de bachiller es obligatorio'),
    body('mesGrado')
    .isLength({ min: 1 }).withMessage('Mes de grado requerido'),
  body('anioGrado')
    .isLength({ min: 4 }).withMessage('Anio de grado requerido'),  
  body('formacionesSuperior')
    .isArray({ min: 1 }).withMessage('Al menos una formación superior'),
  body('formacionesSuperior.*.modalidad').notEmpty(),
  body('formacionesSuperior.*.semestres').notEmpty(),
  body('formacionesSuperior.*.graduado').isIn(['SI','NO']),
  body('formacionesSuperior.*.titulo').notEmpty(),
  body('formacionesSuperior.*.mesTermino').notEmpty(),
  body('formacionesSuperior.*.anioTermino').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export default validateFormacion;
