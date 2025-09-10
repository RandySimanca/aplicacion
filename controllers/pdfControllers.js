// backend/controllers/pdfControllers.js
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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
