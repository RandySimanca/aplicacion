import { body } from 'express-validator';

const validarIdiomas = [
  body('idiomas')
    .isArray({ min: 1 })
    .withMessage('Debe proporcionar al menos un idioma')
    .custom((idiomas) => {
      if (idiomas.length > 10) {
        throw new Error('No se pueden agregar más de 10 idiomas');
      }
      return true;
    }),
  
  body('idiomas.*.nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre del idioma es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre del idioma debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-]+$/)
    .withMessage('El nombre del idioma solo puede contener letras, espacios y guiones'),
    
  body('idiomas.*.habla')
    .optional()
    .isIn(['R', 'B', 'MB', ''])
    .withMessage('El nivel de habla debe ser R, B, MB o vacío'),
    
  body('idiomas.*.lee')
    .optional()
    .isIn(['R', 'B', 'MB', ''])
    .withMessage('El nivel de lectura debe ser R, B, MB o vacío'),
    
  body('idiomas.*.escribe')
    .optional()
    .isIn(['R', 'B', 'MB', ''])
    .withMessage('El nivel de escritura debe ser R, B, MB o vacío')
];

export { validarIdiomas };