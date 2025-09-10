// backend/controllers/pdfControllers.js - Versión corregida
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import Usuario from '../models/Usuario.js';
import DownloadLog from '../models/DownloadLog.js';

export const generarPDF = async (req, res) => {
  try {
    console.log('🧾 Datos recibidos:', req.body);
    const { datosPersonales, formacionAcademica, experiencia, experienciaTot } = req.body;

    // Verificar si el usuario está bloqueado
    let usuarioBloqueado = false;
    let mensajeBloqueo = 'Usuario bloqueado. Contacta al administrador para obtener un código de desbloqueo.';
    
    try {
      if (req.user?.uid) {
        const usuario = await Usuario.findById(req.user.uid).select('bloqueado descargasRealizadas');
        if (usuario?.bloqueado) {
          usuarioBloqueado = true;
          // Incluir información del usuario en la respuesta para el modal
          const userInfo = {
            usuarioId: req.user.uid,
            nombre: usuario.nombre || 'Usuario',
            descargasRealizadas: usuario.descargasRealizadas || 0
          };
          
          return res.status(423).json({ 
            error: mensajeBloqueo,
            blocked: true,
            userInfo,
            showUnlockModal: true 
          });
        }
      }
    } catch (dbError) {
      console.warn('Error verificando estado de usuario en BD:', dbError.message);
      // Continuar sin bloqueo si hay error de BD
    }

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
      await DownloadLog.create({ 
        usuarioId: req.user?.uid, 
        ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress, 
        userAgent: req.headers['user-agent'], 
        success: false, 
        reason: error?.message 
      });
    } catch {}
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
};
