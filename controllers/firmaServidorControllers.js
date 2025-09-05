// backend/controllers/firmaServidorControllers.js
import FirmaServidor from '../models/FirmaServidor.js';

export const guardarFirmaServidor = async (req, res) => {
  try {
    const { ciudadDiligenciamiento, fechaDiligenciamiento, firmaServidor } = req.body;

    const data = await FirmaServidor.findOneAndUpdate(
      { user: req.user.id },
      { ciudadDiligenciamiento, fechaDiligenciamiento, firmaServidor, user: req.user.id },
      { upsert: true, new: true }
    );

    res.status(200).json({ mensaje: 'Firma guardada correctamente', data });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar firma', error });
  }
};

export const obtenerFirmaServidor = async (req, res) => {
  try {
    const data = await FirmaServidor.findOne({ user: req.user.id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener firma', error });
  }
};
