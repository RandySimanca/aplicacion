//backend/routes/pdf.js
import express from 'express';
import { generarPDF } from '../controllers/pdfControllers.js';
import verificarJWT from '../middlewares/verificarJWT.js';

const router = express.Router();

router.post('/generar-pdf', verificarJWT, generarPDF);

export default router;

