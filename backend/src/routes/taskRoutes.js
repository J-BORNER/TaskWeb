const express = require('express');
const { 
  createTask, 
  getUserTasks, 
  updateTaskStatus, 
  deleteTask 
} = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// POST /api/tasks - Crear nueva tarea
router.post('/', createTask);

// GET /api/tasks/user/:userId - Obtener tareas del usuario
router.get('/user/:userId', getUserTasks);

// PUT /api/tasks/:taskId/status - Actualizar estado de tarea
router.put('/:taskId/status', updateTaskStatus);

// DELETE /api/tasks/:taskId - Eliminar tarea (extra)
router.delete('/:taskId', deleteTask);

module.exports = router;