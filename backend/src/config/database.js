const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Probar conexión inmediatamente
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ERROR CONEXIÓN BD:', err.message);
    console.error('❌ Código error:', err.code);
  } else {
    console.log('✅ Conexión PostgreSQL exitosa');
    release();
  }
});

module.exports = pool;