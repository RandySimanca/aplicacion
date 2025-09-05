//backend/controllers/hojaVidaController.js
import FormacionAcademica from "../models/FormacionAcademica.js";
import DatosPersonales from "../models/DatosPersonales.js";
import Experiencia from "../models/Experiencia.js";

export const obtenerHojaCompleta = async (req, res) => {
  try {
    const userId = req.user.uid; // o req.usuario.uid si usas ese formato
    console.log("Token recibido y decodificado:", req.user);


    const datosPersonales = await DatosPersonales.findOne({ user: userId });
    const formacionAcademica = await FormacionAcademica.findOne({ user: userId });
    const experiencia = await Experiencia.find({ user: userId });
    console.log("Datos personales:", datosPersonales);

    if (!datosPersonales && !formacionAcademica && !experiencia.length === 0) {
      return res.status(404).json({ mensaje: "No se encontró información de hoja de vida." });
      
    }

    res.json({
      datosPersonales,
      formacionAcademica,
      Experiencia,

    });

  } catch (error) {
    console.error({
      mensaje: '❌ Error en obtenerHojaCompleta',
      endpoint: '/api/hoja-vida',
      userId,
      stack: error?.stack || 'Sin stack trace',
      timestamp: new Date().toISOString()
    });
    
    console.error("❌ Error al obtener la hoja de vida:", error);
    res.status(500).json({ mensaje: "Error al consultar hoja de vida." });
  }
};
