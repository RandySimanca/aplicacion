// backend/models/FirmaServidor.js
import mongoose from "mongoose";

const FirmaServidorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    unique: true,
  },
  ciudadDiligenciamiento: String,
  fechaDiligenciamiento: Date,
  firmaServidor: String, // base64
});

export default mongoose.model("FirmaServidor", FirmaServidorSchema);
