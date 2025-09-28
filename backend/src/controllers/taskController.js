const Task = require('../models/Task');

// Crear nueva tarea
const createTask = async (req, res) => {
  try {
    const { title, description, user_id } = req.body;

    // Validaciones
    if (!title || !user_id) {
      return res.status(400).json({ error: 'Título y user_id son requeridos' });
    }

    if (title.length < 3) {
      return res.status(400).json({ error: 'El título debe tener al menos 3 caracteres' });
    }

    // Crear tarea
    const newTask = await Task.create({
      title,
      description: description || '',
      user_id
    });

    res.status(201).json({
      message: 'Tarea creada exitosamente',
      task: newTask
    });

  } catch (error) {
    console.error('Error creando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tareas del usuario
const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validar que el userId sea numérico
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const tasks = await Task.findByUserId(parseInt(userId));

    res.json({
      tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar estado de una tarea
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId; // Del token JWT

    // Validaciones
    if (!status) {
      return res.status(400).json({ error: 'El nuevo estado es requerido' });
    }

    const validStatuses = ['pending', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Verificar que la tarea pertenezca al usuario
    const isOwned = await Task.isTaskOwnedByUser(parseInt(taskId), userId);
    if (!isOwned) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta tarea' });
    }

    // Actualizar estado
    const updatedTask = await Task.updateStatus(parseInt(taskId), status);

    res.json({
      message: 'Estado de tarea actualizado exitosamente',
      task: updatedTask
    });

  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar tarea (EXTRA - por si la necesitas)
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    // Verificar propiedad
    const isOwned = await Task.isTaskOwnedByUser(parseInt(taskId), userId);
    if (!isOwned) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
    }

    // Eliminar de la tabla intermedia primero (por CASCADE se elimina de tasks también)
    const query = 'DELETE FROM user_tasks WHERE task_id = $1 AND user_id = $2';
    await pool.query(query, [taskId, userId]);

    res.json({ message: 'Tarea eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createTask,
  getUserTasks,
  updateTaskStatus,
  deleteTask
};