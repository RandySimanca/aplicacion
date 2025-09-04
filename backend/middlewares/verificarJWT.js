//backend/middlewares/verificarJWT.js

import jwt from "jsonwebtoken";

const verificarJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ mensaje: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { uid: decoded.uid, roles: decoded.roles };
    console.log("🔐 req.usuario set to:", req.user);
    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Token inválido" });
  }
};

export default verificarJWT;
