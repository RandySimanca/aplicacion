# Backend - Hoja de Vida

## 🚀 Despliegue en Railway

### 1. Crear cuenta en Railway
- Ve a [railway.app](https://railway.app)
- Regístrate con tu cuenta de GitHub

### 2. Crear nuevo proyecto
- Haz clic en "New Project"
- Selecciona "Deploy from GitHub repo"
- Conecta tu repositorio

### 3. Configurar variables de entorno
En Railway, ve a la pestaña "Variables" y agrega:

```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/hoja-vida
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui
NODE_ENV=production
PORT=3000
```

### 4. Desplegar
- Railway detectará automáticamente que es un proyecto Node.js
- Usará el comando `npm start` definido en package.json
- El deploy comenzará automáticamente

### 5. Obtener URL del backend
- Una vez desplegado, Railway te dará una URL como: `https://tu-proyecto.railway.app`
- Copia esta URL para configurar el frontend

## 🔧 Despliegue Manual (Alternativa)

Si prefieres no usar GitHub:

1. En Railway, selecciona "Empty project"
2. Instala Railway CLI: `npm i -g @railway/cli`
3. Ejecuta: `railway login`
4. Ejecuta: `railway init`
5. Ejecuta: `railway up`

## 📝 Notas importantes

- Asegúrate de tener MongoDB Atlas configurado
- El JWT_SECRET debe ser una cadena larga y segura
- Railway asignará automáticamente un puerto, pero puedes usar PORT=3000
