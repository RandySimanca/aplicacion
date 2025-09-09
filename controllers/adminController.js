// backend/controllers/adminController.js
import UnlockCode from "../models/UnlockCode.js";
import Usuario from "../models/Usuario.js";
import DownloadLog from "../models/DownloadLog.js";

export const createUnlockCode = async (req, res) => {
  try {
    const { code, description, isMaster, usageLimit, validFrom, validUntil, active } = req.body || {};
    if (!code) return res.status(400).json({ mensaje: "Código requerido" });
    const exists = await UnlockCode.findOne({ code: code.toUpperCase() });
    if (exists) return res.status(409).json({ mensaje: "Código ya existe" });
    const doc = await UnlockCode.create({
      code: code.toUpperCase(),
      description,
      isMaster: !!isMaster,
      usageLimit: Number(usageLimit) || 0,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      active: active !== undefined ? !!active : true,
      createdBy: req.user?.uid,
    });
    return res.status(201).json(doc);
  } catch (error) {
    console.error("createUnlockCode error", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

export const listUnlockCodes = async (_req, res) => {
  try {
    const docs = await UnlockCode.find().sort({ createdAt: -1 }).lean();
    return res.json(docs);
  } catch (error) {
    console.error("listUnlockCodes error", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

export const updateUnlockCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, isMaster, usageLimit, validFrom, validUntil, active } = req.body || {};
    const update = {
      updatedBy: req.user?.uid,
    };
    if (description !== undefined) update.description = description;
    if (isMaster !== undefined) update.isMaster = !!isMaster;
    if (usageLimit !== undefined) update.usageLimit = Number(usageLimit) || 0;
    if (validFrom !== undefined) update.validFrom = validFrom ? new Date(validFrom) : undefined;
    if (validUntil !== undefined) update.validUntil = validUntil ? new Date(validUntil) : undefined;
    if (active !== undefined) update.active = !!active;

    const doc = await UnlockCode.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ mensaje: "No encontrado" });
    return res.json(doc);
  } catch (error) {
    console.error("updateUnlockCode error", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

export const deleteUnlockCode = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await UnlockCode.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ mensaje: "No encontrado" });
    return res.json({ ok: true });
  } catch (error) {
    console.error("deleteUnlockCode error", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

export const dashboardMetrics = async (req, res) => {
  try {
    const minDownloads = Number(req.query.minDownloads) || 0;
    const totalUsuarios = await Usuario.countDocuments();
    const usuariosBloqueados = await Usuario.countDocuments({ bloqueado: true });
    const topDescargas = await Usuario.find({}).sort({ descargasRealizadas: -1 }).limit(10).select("nombre email descargasRealizadas").lean();
    const descargasPorDia = await DownloadLog.aggregate([
      { $match: { success: true } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const usuariosConNDescargas = minDownloads > 0
      ? await Usuario.countDocuments({ descargasRealizadas: { $gte: minDownloads } })
      : undefined;
    return res.json({ totalUsuarios, usuariosBloqueados, topDescargas, descargasPorDia, usuariosConNDescargas, minDownloads });
  } catch (error) {
    console.error("dashboardMetrics error", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

export const setUsuarioBloqueado = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloqueado } = req.body || {};
    const doc = await Usuario.findByIdAndUpdate(id, { bloqueado: !!bloqueado }, { new: true });
    if (!doc) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    return res.json(doc);
  } catch (error) {
    console.error("setUsuarioBloqueado error", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

export const listUsers = async (_req, res) => {
  try {
    const users = await Usuario.find({}).sort({ createdAt: -1 }).select("nombre email roles bloqueado descargasRealizadas").lean();
    return res.json(users);
  } catch (error) {
    console.error("listUsers error", error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
};

