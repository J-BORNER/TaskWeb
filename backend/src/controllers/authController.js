const User = require('../models/User');
const jwt = require('jsonwebtoken');

console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ Faltante');

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
};

// Registrar nuevo usuario
const register = async (req, res) => {
  console.log('📝 Iniciando registro...');
  console.log('📦 Body recibido:', req.body);
  
  try {
    const { name, email, password } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      console.log('❌ Campos faltantes');
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    console.log('🔍 Buscando usuario existente...');
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('❌ Usuario ya existe');
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    console.log('👤 Creando nuevo usuario...');
    
    // Crear nuevo usuario
    const newUser = await User.create({ name, email, password });
    console.log('✅ Usuario creado:', newUser);
    
    // Generar token
    const token = generateToken(newUser.id);
    console.log('🔑 Token generado');

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });

  } catch (error) {
    console.error('💥 ERROR EN REGISTRO:', error);
    console.error('💥 Stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Contacta al administrador'
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login
};