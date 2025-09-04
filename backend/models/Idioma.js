//backend/models/idioma

import mongoose from 'mongoose';

const idiomaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del idioma es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre del idioma no puede exceder 50 caracteres']
  },
  habla: {
    type: String,
    enum: ['R', 'B', 'MB', ''],
    default: ''
  },
  lee: {
    type: String,
    enum: ['R', 'B', 'MB', ''],
    default: ''
  },
  escribe: {
    type: String,
    enum: ['R', 'B', 'MB', ''],
    default: ''
  }
}, {
  _id: false // Los idiomas individuales no necesitan _id propio
});

const idiomasDocumentoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },
  idiomas: {
    type: [idiomaSchema],
    validate: {
      validator: function(idiomas) {
        return idiomas.length <= 10; // Máximo 10 idiomas por usuario
      },
      message: 'No se pueden agregar más de 10 idiomas'
    }
  }
}, {
  timestamps: true,
  collection: 'idiomas'
});

// Índice compuesto para búsquedas eficientes
idiomasDocumentoSchema.index({ usuario: 1, createdAt: -1 });

// Método para limpiar idiomas vacíos antes de guardar
idiomasDocumentoSchema.pre('save', function(next) {
  this.idiomas = this.idiomas.filter(idioma => 
    idioma.nombre && idioma.nombre.trim() !== ''
  );
  next();
});

export default mongoose.model('IdiomasDocumento', idiomasDocumentoSchema);