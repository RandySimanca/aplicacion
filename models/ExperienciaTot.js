//backend/models/ExperienciaTot.js
import mongoose from 'mongoose';

const experienciaTotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  ciudadDiligenciamiento: {
    type: String,
    required: true
  },
  fechaDiligenciamiento: {
    type: Date,
    required: true
  },
  firmaServidor: {
    type: String, // base64
    required: true
  }
});

const ExperienciaTot = mongoose.model('ExperienciaTot', experienciaTotSchema);
export default ExperienciaTot;