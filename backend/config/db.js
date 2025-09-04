// backend/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Validación previa del URI
  if (!uri) {
    console.error(`[${new Date().toISOString()}] ❌ URI de MongoDB no definida. Verifica tu archivo .env`);
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ MongoDB conectado con éxito`);
  } catch (err) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Error al conectar MongoDB: ${err.message}`);
    process.exit(1); // Opcional: detener ejecución si falla la conexión
  }

  // Manejo de errores en tiempo real
  mongoose.connection.on('error', err => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Error en la conexión de MongoDB: ${err.message}`);
  });
};

export default connectDB;


//local con atlas

/**import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://randysimancamercado2:Valeria1324@clustermiapp.z0bbfnk.mongodb.net/baseDeDatosHV?retryWrites=true&w=majority');
    console.log('Servidor corriendo en el puerto 3000 con exito //db.js');
    console.log('✅ MongoDB Atlas conectado');
  } catch (err) {
    console.error('❌ Error al conectar MongoDB Atlas:', err.message);
  }
};

export default connectDB;*/



/**import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Validación previa del URI
  if (!uri) {
    console.error(`[${new Date().toISOString()}] ❌ URI de MongoDB no definida. Verifica tu archivo .env`);
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ MongoDB conectado con éxito`);
  } catch (err) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Error al conectar MongoDB: ${err.message}`);
    process.exit(1); // Opcional: detener ejecución si falla la conexión
  }

  // Manejo de errores en tiempo real
  mongoose.connection.on('error', err => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Error en la conexión de MongoDB: ${err.message}`);
  });
};

export default connectDB;*/


/**
 *para uso local
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/baseDeDatosHV');
    console.log('Servidor corriendo en el puerto 3000 con exito //db.js');
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Error al conectar MongoDB:', err.message);
  }
};

export default connectDB;*/
