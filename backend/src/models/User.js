const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Registrar nuevo usuario
  static async create(userData) {
    console.log('📦 Creando usuario con datos:', userData);
    
    const { name, email, password } = userData;
    
    try {
      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('🔐 Contraseña hasheada');
      
      const query = `
        INSERT INTO users (name, email, password) 
        VALUES ($1, $2, $3) 
        RETURNING id, name, email, created_at
      `;
      
      const values = [name, email, hashedPassword];
      console.log('🚀 Ejecutando query:', query);
      console.log('📊 Valores:', values);
      
      const result = await pool.query(query, values);
      console.log('✅ Usuario insertado en BD');
      
      return result.rows[0];
      
    } catch (error) {
      console.error('💥 ERROR en User.create:', error);
      console.error('💥 Código error:', error.code);
      throw error;
    }
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;