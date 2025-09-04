// backend/models/DatosPersonales.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const FechaNacimientoSchema = new Schema(
  {
    dia: String,
    mes: String,
    anio: String,
    pais: String,
    depto: String,
    municipio: String,
  },
  { _id: false }
);

const DireccionCorrespondenciaSchema = new Schema(
  {
    pais: String,
    depto: String,
    municipio: String,
    direccion: String,
    telefono: String,
    email: String,
  },
  { _id: false }
);

const DatosPersonalesSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    apellido1: { type: String, required: true },
    apellido2: String,
    nombres: { type: String, required: true },

    tipoDocumento: String,
    numDocumento: { type: String, required: true },

    sexo: String,
    nacionalidad: String,
    pais: String,

    libretaMilitar: String,
    numeroLibreta: String,
    dm: String,

    fechaNacimiento: {
      type: FechaNacimientoSchema,
      required: true,
    },

    direccionCorrespondencia: {
      type: DireccionCorrespondenciaSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("DatosPersonales", DatosPersonalesSchema);
