// backend/controllers/datosPersonalesControllers.js
import DatosPersonales from "../models/DatosPersonales.js";

export const crearDatosPersonales = async (req, res) => {
  try {
    const userId = req.user.uid; // Usar uid consistentemente
    console.log('📝 Creando datos personales para usuario:', userId);
    
    // Verificar si ya existen datos para este usuario
    const datosExistentes = await DatosPersonales.findOne({ user: userId });
    if (datosExistentes) {
      console.log('⚠️ El usuario ya tiene datos personales registrados');
      return res.status(409).json({ 
        error: 'Ya existen datos personales para este usuario. Use PUT para actualizar.' 
      });
    }

    const payload = {
      ...req.body,
      user: userId // Usar field 'user' consistentemente
    };
    
    console.log('💾 Guardando payload:', { user: userId, campos: Object.keys(req.body) });
    
    const nuevoRegistro = await DatosPersonales.create(payload);
    
    console.log('✅ Datos personales creados exitosamente:', nuevoRegistro._id);
    
    return res.status(201).json({ 
      mensaje: 'Datos personales guardados correctamente', 
      data: nuevoRegistro 
    });
  } catch (error) {
    console.error('❌ Error al guardar datos personales:', error);
    return res.status(500).json({ 
      error: 'Error interno al guardar datos personales',
      detalle: error.message 
    });
  }
};

export const obtenerDatosPersonales = async (req, res) => {
  try {
    const userId = req.user.uid; // ✅ CORRECCIÓN: Usar uid en lugar de _id
    console.log('🔍 Buscando datos personales para usuario:', userId);
    
    // ✅ CORRECCIÓN: Buscar por 'user' en lugar de 'usuario'
    const datos = await DatosPersonales.findOne({ user: userId });
    
    if (!datos) {
      console.log('📭 No se encontraron datos personales para el usuario:', userId);
      return res.status(404).json({ 
        mensaje: "No hay datos personales registrados para este usuario" 
      });
    }
    
    console.log('✅ Datos personales encontrados:', datos._id);
    res.json(datos);
  } catch (error) {
    console.error('❌ Error al obtener datos personales:', error);
    res.status(500).json({ 
      mensaje: "Error al obtener datos personales", 
      detalle: error.message 
    });
  }
};

export const actualizarDatosPersonales = async (req, res) => {
  try {
    const userId = req.user.uid; // ✅ CORRECCIÓN: Usar uid consistentemente
    console.log('🔄 Actualizando datos personales para usuario:', userId);
    
    const datosActualizados = await DatosPersonales.findOneAndUpdate(
      { user: userId }, // ✅ CORRECCIÓN: Usar 'user' consistentemente
      req.body,
      { new: true, runValidators: true } // Agregado runValidators
    );

    if (!datosActualizados) {
      console.log('❌ No se encontraron datos personales para actualizar:', userId);
      return res.status(404).json({ 
        mensaje: "Datos personales no encontrados para este usuario" 
      });
    }

    console.log('✅ Datos personales actualizados exitosamente:', datosActualizados._id);
    
    res.status(200).json({
      mensaje: "Datos personales actualizados correctamente",
      data: datosActualizados
    });
  } catch (error) {
    console.error('❌ Error al actualizar datos personales:', error);
    res.status(500).json({ 
      mensaje: "Error al actualizar datos personales", 
      error: error.message 
    });
  }
};