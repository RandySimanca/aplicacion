//models/usuario
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: { type: [String], default: ["usuario"] },
  bloqueado: { type: Boolean, default: false },
  descargasRealizadas: { type: Number, default: 0 },
  fechaCreacion: { type: Date, default: Date.now },
  ultimoAcceso: Date,
});

// Middleware de encriptación
usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


usuarioSchema.methods.validarPassword = function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password); // returns Promise<boolean>
};



export default mongoose.model("Usuario", usuarioSchema);




