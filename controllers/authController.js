//backend/controllers/authController.js
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
/**
 * Controlador para manejar el registro y login de usuarios.
 * Utiliza JWT para autenticación.
 */

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, roles } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ mensaje: "Todos los campos son obligatorio." });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(409).json({ mensaje: "El correo ya está registrado." });
    }

    const nuevoUsuario = new Usuario({ nombre, email, password, roles });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: "Usuario registrado exitosamente." });
  } catch (err) {
    console.error("Error en registro:", err.message);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ mensaje: "Correo y contraseña son obligatorios." });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado." });

    const esValido = await usuario.validarPassword(password);
    if (!esValido)
      return res.status(401).json({ mensaje: "Contraseña incorrecta." });

    // Token JWT real
    const token = jwt.sign(
      { uid: usuario._id, roles: usuario.roles },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      usuario: {
        uid: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        roles: usuario.roles,
      },
    });
  } catch (err) {
    console.error("Error en login:", err.message);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};