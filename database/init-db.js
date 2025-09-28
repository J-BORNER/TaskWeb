// Script para inicializar la base de datos en Render
const { Pool } = require('pg');
require('dotenv').config();

async function initDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Conectando a la base de datos...');
    
    // Ejecutar script SQL
    const sqlScript = `
      -- Tabla de usuarios
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de tareas
      CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla intermedia para relación usuarios-tareas
      CREATE TABLE IF NOT EXISTS user_tasks (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          task_id INT NOT NULL,
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          UNIQUE(user_id, task_id)
      );

      -- Insertar datos de ejemplo
      INSERT INTO users (name, email, password) VALUES 
      ('Juan Pérez', 'juan@example.com', '$2a$10$rQ9b5bV5b5b5b5b5b5b5bO'),
      ('María García', 'maria@example.com', '$2a$10$rQ9b5bV5b5b5b5b5b5b5bO')
      ON CONFLICT (email) DO NOTHING;

      INSERT INTO tasks (title, description, status) VALUES 
      ('Aprender Node.js', 'Completar el curso de backend', 'in_progress'),
      ('Diseñar base de datos', 'Modelar las tablas para el proyecto', 'pending')
      ON CONFLICT DO NOTHING;

      INSERT INTO user_tasks (user_id, task_id) VALUES 
      (1, 1),
      (1, 2),
      (2, 1)
      ON CONFLICT DO NOTHING;
    `;

    await pool.query(sqlScript);
    console.log('✅ Base de datos inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar si es el módulo principal
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;