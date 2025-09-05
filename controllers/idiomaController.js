import IdiomasDocumento from '../models/Idioma.js';
import { validationResult } from 'express-validator';

class IdiomasController {
  // Obtener idiomas del usuario autenticado
  static async obtenerIdiomas(req, res) {
    try {
      const usuarioId = req.user.uid;
      
      const documento = await IdiomasDocumento.findOne({ usuario: usuarioId })
        .populate('usuario', 'nombre email');
      
      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron datos de idiomas para este usuario',
          data: null
        });
      }

      res.status(200).json({
        success: true,
        message: 'Idiomas obtenidos correctamente',
        data: documento,
        idiomas: documento.idiomas,
        _id: documento._id,
        totalIdiomas: documento.idiomas.length
      });

    } catch (error) {
      console.error('Error al obtener idiomas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Crear nuevo documento de idiomas
  static async crearIdiomas(req, res) {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const usuarioId = req.user.uid;
      const { idiomas } = req.body;

      // Verificar si ya existe un documento para este usuario
      const documentoExistente = await IdiomasDocumento.findOne({ usuario: usuarioId });
      if (documentoExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un documento de idiomas para este usuario. Use PUT para actualizar.',
          data: null
        });
      }

      // Validar y limpiar idiomas
      const idiomasLimpios = idiomas
        .filter(idioma => idioma.nombre && idioma.nombre.trim() !== '')
        .map(idioma => ({
          nombre: idioma.nombre.trim(),
          habla: idioma.habla || '',
          lee: idioma.lee || '',
          escribe: idioma.escribe || ''
        }));

      if (idiomasLimpios.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos un idioma válido',
          data: null
        });
      }

      // Crear nuevo documento
      const nuevoDocumento = new IdiomasDocumento({
        usuario: usuarioId,
        idiomas: idiomasLimpios
      });

      const documentoGuardado = await nuevoDocumento.save();

      res.status(201).json({
        success: true,
        message: `Documento de idiomas creado correctamente con ${documentoGuardado.idiomas.length} idioma(s)`,
        data: documentoGuardado,
        totalIdiomas: documentoGuardado.idiomas.length
      });

    } catch (error) {
      console.error('Error al crear idiomas:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar idiomas existentes
  static async actualizarIdiomas(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const usuarioId = req.user.uid;
      const documentoId = req.params.id;
      const { idiomas } = req.body;

      // Buscar el documento y verificar propiedad
      const documento = await IdiomasDocumento.findOne({ 
        _id: documentoId, 
        usuario: usuarioId 
      });

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento de idiomas no encontrado o no pertenece al usuario',
          data: null
        });
      }

      // Validar y limpiar idiomas
      const idiomasLimpios = idiomas
        .filter(idioma => idioma.nombre && idioma.nombre.trim() !== '')
        .map(idioma => ({
          nombre: idioma.nombre.trim(),
          habla: idioma.habla || '',
          lee: idioma.lee || '',
          escribe: idioma.escribe || ''
        }));

      // Actualizar el documento
      documento.idiomas = idiomasLimpios;
      const documentoActualizado = await documento.save();

      res.status(200).json({
        success: true,
        message: `Idiomas actualizados correctamente. Total: ${documentoActualizado.idiomas.length} idioma(s)`,
        data: documentoActualizado,
        totalIdiomas: documentoActualizado.idiomas.length
      });

    } catch (error) {
      console.error('Error al actualizar idiomas:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de documento inválido',
          data: null
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Eliminar documento completo de idiomas
  static async eliminarIdiomas(req, res) {
    try {
      const usuarioId = req.user.uid;
      const documentoId = req.params.id;

      const documentoEliminado = await IdiomasDocumento.findOneAndDelete({
        _id: documentoId,
        usuario: usuarioId
      });

      if (!documentoEliminado) {
        return res.status(404).json({
          success: false,
          message: 'Documento de idiomas no encontrado o no pertenece al usuario',
          data: null
        });
      }

      res.status(200).json({
        success: true,
        message: 'Documento de idiomas eliminado correctamente',
        data: documentoEliminado
      });

    } catch (error) {
      console.error('Error al eliminar idiomas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Método adicional para obtener estadísticas de idiomas
  static async obtenerEstadisticas(req, res) {
    try {
      const usuarioId = req.user.uid;

      const documento = await IdiomasDocumento.findOne({ usuario: usuarioId });
      
      if (!documento) {
        return res.status(200).json({
          success: true,
          message: 'No hay datos de idiomas',
          estadisticas: {
            totalIdiomas: 0,
            idiomasConNivel: 0,
            nivelesDistribucion: { R: 0, B: 0, MB: 0 }
          }
        });
      }

      const estadisticas = {
        totalIdiomas: documento.idiomas.length,
        idiomasConNivel: documento.idiomas.filter(i => i.habla || i.lee || i.escribe).length,
        nivelesDistribucion: {
          R: documento.idiomas.filter(i => i.habla === 'R' || i.lee === 'R' || i.escribe === 'R').length,
          B: documento.idiomas.filter(i => i.habla === 'B' || i.lee === 'B' || i.escribe === 'B').length,
          MB: documento.idiomas.filter(i => i.habla === 'MB' || i.lee === 'MB' || i.escribe === 'MB').length
        }
      };

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas correctamente',
        estadisticas
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default IdiomasController;