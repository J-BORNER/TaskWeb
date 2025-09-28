const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Importar middleware de errores
const errorHandler = require('./middleware/errorHandler');

// Crear aplicación Express
const app = express();

// Middlewares básicos
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-frontend.render.com'] // Cambiar por tu URL de frontend
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (para producción)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend')));
}

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Ruta de bienvenida
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Bienvenido a la API de Student Tasks',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      tasks: {
        create: 'POST /api/tasks',
        getUserTasks: 'GET /api/tasks/user/:userId',
        updateStatus: 'PUT /api/tasks/:taskId/status'
      }
    }
  });
});

// Ruta para servir el frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
  });
}

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware de manejo de errores (DEBE SER EL ÚLTIMO)
app.use(errorHandler);

// Configurar puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 API disponible en: http://localhost:${PORT}/api`);
});

// Inicializar base de datos en producción
if (process.env.NODE_ENV === 'production') {
  const initDatabase = require('../../database/init-db');
  initDatabase().catch(console.error);
}

// Manejar cierre graceful del servidor
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Servidor terminado por Render...');
  process.exit(0);
});

module.exports = app;