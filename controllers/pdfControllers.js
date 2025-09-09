// backend/controllers/pdfControllers.js
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import crypto from 'crypto';

export const generarPDF = async (req, res) => {
  try {
    console.log('🧾 Datos recibidos:', req.body);
    const { datosPersonales, formacionAcademica, experiencia, experienciaTot } = req.body;

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

    doc.end();
    stream.pipe(res);

  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
};

// Verificación de códigos de desbloqueo en el servidor
export const verificarCodigoDesbloqueo = async (req, res) => {
  try {
    const { codigo, usuarioId, nombre } = req.body || {};
    if (!codigo || !usuarioId || !nombre) {
      return res.status(400).json({ valido: false, mensaje: 'Datos insuficientes' });
    }

    const codigoIngresado = String(codigo).trim().toUpperCase();

    // Códigos base administrados por servidor (podrían venir de DB o ENV)
    const codigosMaestros = new Set([
      (process.env.UNLOCK_CODE_MASTER || '').toUpperCase(),
      'RANDYADMIN1208',
      'MASTER_RESET_2024',
      'EMERGENCY_UNLOCK',
    ].filter(Boolean));

    // Códigos derivados por usuario
    const nombreSanitizado = String(nombre).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const codigoEspecificoUsuario = `UNLOCK_${String(usuarioId).toUpperCase()}_2024`;
    const codigoEspecificoNombre = `RESET_${nombreSanitizado}_2024`;

    // Código HMAC basado en secreto del servidor para mayor seguridad
    const secreto = process.env.UNLOCK_SECRET || 'default_secret_change_me';
    const hmac = crypto.createHmac('sha256', secreto);
    hmac.update(`${usuarioId}::${nombreSanitizado}`);
    const codigoHmac = `HMAC_${hmac.digest('hex').substring(0, 10).toUpperCase()}`;

    const esValido = codigosMaestros.has(codigoIngresado)
      || codigoIngresado === codigoEspecificoUsuario
      || codigoIngresado === codigoEspecificoNombre
      || codigoIngresado === `USER_${String(usuarioId).toUpperCase()}`
      || codigoIngresado === codigoHmac;

    if (!esValido) {
      return res.status(200).json({ valido: false, mensaje: `Código inválido para el usuario ${nombre}` });
    }

    // Opcional: aquí se podría registrar auditoría en DB
    return res.status(200).json({ valido: true, mensaje: 'Código válido' });
  } catch (error) {
    console.error('Error verificando código:', error);
    return res.status(500).json({ valido: false, mensaje: 'Error del servidor' });
  }
};
