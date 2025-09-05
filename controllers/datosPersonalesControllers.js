// backend/controllers/datosPersonalesControllers.js
import DatosPersonales from "../models/DatosPersonales.js";

export const crearDatosPersonales = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      user: req.user.uid
    };
    const nuevoRegistro = await DatosPersonales.create(payload);
    return res.status(201).json({ mensaje: 'Guardado OK', data: nuevoRegistro });
  } catch (error) {
    console.error('❌ Error al guardar en MongoDB:', error);
    return res.status(500).json({ error: 'Error interno al guardar datos personales' });
  }
};

export const obtenerDatosPersonales = async (req, res) => {
  try {
    const datos = await DatosPersonales.findOne({ usuario: req.user._id });
    if (!datos) return res.status(404).json({ mensaje: "No hay datos personales" });
    res.json(datos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener datos personales", detalle: error.message });
  }
};

// ✅ NUEVO: actualizar datos personales
export const actualizarDatosPersonales = async (req, res) => {
  try {
    const datosActualizados = await DatosPersonales.findOneAndUpdate(
      { user: req.user.uid },
      req.body,
      { new: true }
    );

    if (!datosActualizados) {
      return res.status(404).json({ mensaje: "Datos personales no encontrados" });
    }

    res.status(200).json({
      mensaje: "Datos personales actualizados correctamente",
      data: datosActualizados
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar", error });
  }
};
