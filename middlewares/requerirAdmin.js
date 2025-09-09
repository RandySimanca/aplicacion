// backend/middlewares/requerirAdmin.js
import jwt from "jsonwebtoken";

// Requiere que verificarJWT haya puesto req.user
const requerirAdmin = (req, res, next) => {
  try {
    const roles = req.user?.roles || [];
    if (Array.isArray(roles) && roles.includes("admin")) {
      return next();
    }
    return res.status(403).json({ mensaje: "Acceso restringido a administradores" });
  } catch (error) {
    return res.status(403).json({ mensaje: "Acceso restringido a administradores" });
  }
};

export default requerirAdmin;

