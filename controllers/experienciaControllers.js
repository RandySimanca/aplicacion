// backend/controllers/experienciaController.js
import Experiencia from '../models/Experiencia.js';

export const guardarExperiencia = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      user: req.user.id,
      fechaIngreso: req.body.fechaIngreso ? new Date(req.body.fechaIngreso) : null,
      fechaRetiro: req.body.fechaRetiro ? new Date(req.body.fechaRetiro) : null,
    };

    console.log('🛠 Payload a guardar:', payload);

    const experienciaGuardada = await Experiencia.create(payload);
    return res.status(201).json({
      mensaje: 'Guardado OK',
      data: experienciaGuardada
    });

  } catch (error) {
    console.error('❌ Error al guardar en MongoDB:', error);
    console.error('📄 Stack trace:', error.stack);
    return res
      .status(500)
      .json({ error: 'Error interno al guardar datos de experiencia' });
  }
};

export const obtenerExperiencias = async (req, res) => {
  try {
    const experiencias = await Experiencia.find({ user: req.user.id });
    return res.status(200).json(experiencias);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener experiencias' });
  }
};

// Nueva función para eliminar experiencia
export const eliminarExperiencia = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Intentando eliminar experiencia:', id, 'para usuario:', userId);

    // Verificar que la experiencia exista y pertenezca al usuario
    const experiencia = await Experiencia.findOne({ _id: id, user: userId });
    
    if (!experiencia) {
      return res.status(404).json({ 
        error: 'Experiencia no encontrada o no autorizada' 
      });
    }

    // Eliminar la experiencia
    await Experiencia.findByIdAndDelete(id);
    
    console.log('✅ Experiencia eliminada exitosamente:', id);

    return res.status(200).json({
      mensaje: 'Experiencia eliminada correctamente',
      id: id
    });

  } catch (error) {
    console.error('❌ Error al eliminar experiencia:', error);
    return res.status(500).json({ 
      error: 'Error interno al eliminar experiencia',
      detalle: error.message 
    });
  }
};

// Función para actualizar experiencia (opcional)
export const actualizarExperiencia = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payload = {
      ...req.body,
      user: userId,
      fechaIngreso: req.body.fechaIngreso ? new Date(req.body.fechaIngreso) : null,
      fechaRetiro: req.body.fechaRetiro ? new Date(req.body.fechaRetiro) : null,
    };

    console.log('🔄 Actualizando experiencia:', id, payload);

    // Actualizar solo si pertenece al usuario
    const experienciaActualizada = await Experiencia.findOneAndUpdate(
      { _id: id, user: userId },
      payload,
      { new: true, runValidators: true }
    );

    if (!experienciaActualizada) {
      return res.status(404).json({ 
        error: 'Experiencia no encontrada o no autorizada' 
      });
    }

    return res.status(200).json({
      mensaje: 'Experiencia actualizada correctamente',
      data: experienciaActualizada
    });

  } catch (error) {
    console.error('❌ Error al actualizar experiencia:', error);
    return res.status(500).json({ 
      error: 'Error interno al actualizar experiencia',
      detalle: error.message 
    });
  }
};