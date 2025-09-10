//backend/models/Experiencia.js
import mongoose from "mongoose";

const experienciaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  empresa: { type: String, required: true },
  tipoEntidad: { type: String, enum: ["Publica", "Privada"], required: true },
  pais: { type: String },
  departamento: { type: String },
  municipio: { type: String },
  correoEntidad: { type: String },
  telefonos: { type: String },

  // ✅ Cambiado a tipo Date
  fechaIngreso: { type: Date },
  fechaRetiro: { type: Date },

  cargo: { type: String },
  dependencia: { type: String },
  direccion: { type: String },
}, { timestamps: true });

const Experiencia = mongoose.model("Experiencia", experienciaSchema);

export default Experiencia;


