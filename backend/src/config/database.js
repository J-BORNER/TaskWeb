const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ✅ CONFIGURACIÓN SSL OBLIGATORIA PARA RENDER
  ssl: {
    rejectUnauthorized: false // Esto permite conexiones SSL
  }
});

// Verificar conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL en Render');
    release();
  }
});

// Manejar errores de conexión
pool.on('error', (err, client) => {
  console.error('Error inesperado en la base de datos:', err);
});

module.exports = pool;