//backend/middlewares/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, acceso denegado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.uid }; // ✅ aquí corregimos
    console.log("👤 Usuario extraído del token:", req.user);
    next();
    
  } catch (err) {
    res.status(401).json({ message: 'Token no válido' });
  }
};


export default auth;
