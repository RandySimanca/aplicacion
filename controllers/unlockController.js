// backend/controllers/unlockController.js
import dotenv from 'dotenv';
import UnlockCode from '../models/UnlockCode.js';
import Usuario from '../models/Usuario.js';

dotenv.config();

function parseEnvList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.toUpperCase());
}

export const verifyUnlock = async (req, res) => {
  try {
    const { code, usuarioId, nombre } = req.body || {};
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ ok: false, message: 'Código requerido' });
    }

    const codeUpper = code.trim().toUpperCase();

    // 1) DB-managed codes
    const now = new Date();
    const dbCode = await UnlockCode.findOne({ code: codeUpper, active: true });
    if (dbCode) {
      const withinFrom = !dbCode.validFrom || now >= dbCode.validFrom;
      const withinUntil = !dbCode.validUntil || now <= dbCode.validUntil;
      const underLimit = !dbCode.usageLimit || dbCode.usedCount < dbCode.usageLimit;
      if (withinFrom && withinUntil && underLimit) {
        await UnlockCode.updateOne({ _id: dbCode._id }, { $inc: { usedCount: 1 } });
        if (usuarioId) {
          await Usuario.findByIdAndUpdate(usuarioId, { bloqueado: false, descargasRealizadas: 0 });
        }
        return res.json({ ok: true, scope: dbCode.isMaster ? 'master' : 'user', resetDownloads: true });
      }
    }

    // 2) Master codes from env (fallback)
    const masterCodes = parseEnvList(process.env.UNLOCK_MASTER_CODES);
    if (masterCodes.includes(codeUpper)) {
      if (usuarioId) {
        await Usuario.findByIdAndUpdate(usuarioId, { bloqueado: false, descargasRealizadas: 0 });
      }
      return res.json({ ok: true, scope: 'master', resetDownloads: true });
    }

    // User-specific patterns generated on server
    const safeNombre = (nombre || '')
      .toString()
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
    const safeUsuarioId = (usuarioId || '')
      .toString()
      .replace(/[^a-zA-Z0-9_\-]/g, '')
      .toUpperCase();

    const validUserCodes = new Set([
      `UNLOCK_${safeUsuarioId}_2024`,
      `RESET_${safeNombre}_2024`,
      `USER_${safeUsuarioId}`,
    ]);

    if (validUserCodes.has(codeUpper)) {
      if (usuarioId) {
        await Usuario.findByIdAndUpdate(usuarioId, { bloqueado: false, descargasRealizadas: 0 });
      }
      return res.json({ ok: true, scope: 'user', resetDownloads: true });
    }

    return res.status(401).json({ ok: false, message: 'Código inválido' });
  } catch (error) {
    console.error('Error verifying unlock code:', error);
    return res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
};

