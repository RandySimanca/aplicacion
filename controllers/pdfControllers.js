// backend/controllers/pdfControllers.js
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import Usuario from '../models/Usuario.js';
import DownloadLog from '../models/DownloadLog.js';

export const generarPDF = async (req, res) => {
  try {
    console.log('🧾 Datos recibidos:', req.body);
    const { datosPersonales, formacionAcademica, experiencia, experienciaTot } = req.body;

    // Si el usuario está bloqueado, denegar
    try {
      if (req.user?.uid) {
        const u = await Usuario.findById(req.user.uid).select('bloqueado');
        if (u?.bloqueado) {
          return res.status(423).json({ error: 'Usuario bloqueado. Ingrese un código de desbloqueo.' });
        }
      }
    } catch {}

    const doc = new PDFDocument();
    const stream = new Readable().wrap(doc);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=hoja-de-vida.pdf');

    // Título principal
    doc.fontSize(16).text('HOJA DE VIDA', { align: 'center' }).moveDown();

    // Datos personales
    if (datosPersonales) {
      doc.fontSize(12).text(`Nombre: ${datosPersonales.nombres || ''}`);
      doc.text(`Documento: ${datosPersonales.numeroDocumento || ''}`).moveDown();
    }

    // Formación académica
    if (Array.isArray(formacionAcademica) && formacionAcademica.length > 0) {
      doc.fontSize(14).text('Formación Académica:', { underline: true });
      formacionAcademica.forEach(f => {
        doc.fontSize(12).text(`${f.titulo || ''} - ${f.institucion || ''} (${f.anioGraduacion || ''})`);
      });
      doc.moveDown();
    }

    // Experiencia laboral
    if (Array.isArray(experiencia) && experiencia.length > 0) {
      doc.fontSize(14).text('Experiencia Laboral:', { underline: true });
      experiencia.forEach(e => {
        doc.fontSize(12).text(`${e.entidad || ''} - ${e.cargo || ''} (${e.fechaIngreso || ''} a ${e.fechaRetiro || ''})`);
      });
      doc.moveDown();
    }

    // Experiencia total (resumen)
    if (Array.isArray(experienciaTot) && experienciaTot.length > 0) {
      doc.fontSize(14).text('Experiencia Total:', { underline: true });
      experienciaTot.forEach(e => {
        doc.fontSize(12).text(`${e.entidad || ''} - ${e.cargo || ''} (${e.fechaIngreso || ''} a ${e.fechaRetiro || ''})`);
      });
      doc.moveDown();
    }

    // Log y contador de descargas
    const usuarioId = req.user?.uid;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    try {
      if (usuarioId) {
        await Usuario.findByIdAndUpdate(usuarioId, { $inc: { descargasRealizadas: 1 } });
      }
      await DownloadLog.create({ usuarioId, ip, userAgent, success: true });
    } catch (e) {
      console.error('No se pudo registrar la descarga:', e?.message);
    }

    doc.end();
    stream.pipe(res);

  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    try {
      await DownloadLog.create({ usuarioId: req.user?.uid, ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress, userAgent: req.headers['user-agent'], success: false, reason: error?.message });
    } catch {}
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
};
