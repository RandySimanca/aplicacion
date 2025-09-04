// models/FormacionAcademica.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const FormacionAcademicaSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gradoBasica: { type: Number, min: 1, max: 11, required: true },
    tituloBachiller: { type: String, trim: true, required: true },
    mesGrado: { type: String, trim: true },
    anioGrado: { type: String, trim: true },

    formacionesSuperior: [
      {
        modalidad: { type: String, trim: true },
        semestres: { type: String, trim: true },
        graduado: { type: String, enum: ["SI", "NO", ""], trim: true },
        titulo: { type: String, trim: true },
        mesTermino: { type: String, trim: true },
        anioTermino: { type: String, trim: true },
        tarjeta: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

export default model("FormacionAcademica", FormacionAcademicaSchema);
