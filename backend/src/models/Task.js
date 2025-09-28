const pool = require('../config/database');

class Task {
  // Crear nueva tarea
  static async create(taskData) {
    const { title, description, user_id } = taskData;
    
    // Iniciar transacción
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Insertar en tabla tasks
      const taskQuery = `
        INSERT INTO tasks (title, description) 
        VALUES ($1, $2) 
        RETURNING *
      `;
      const taskResult = await client.query(taskQuery, [title, description]);
      
      // 2. Insertar en tabla intermedia user_tasks
      const userTaskQuery = `
        INSERT INTO user_tasks (user_id, task_id) 
        VALUES ($1, $2) 
        RETURNING *
      `;
      await client.query(userTaskQuery, [user_id, taskResult.rows[0].id]);
      
      await client.query('COMMIT');
      return taskResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener todas las tareas de un usuario
  static async findByUserId(userId) {
    const query = `
      SELECT t.*, ut.assigned_at 
      FROM tasks t
      INNER JOIN user_tasks ut ON t.id = ut.task_id
      WHERE ut.user_id = $1
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Actualizar estado de una tarea
  static async updateStatus(taskId, newStatus) {
    const validStatuses = ['pending', 'in_progress', 'done'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Estado inválido');
    }
    
    const query = `
      UPDATE tasks 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [newStatus, taskId]);
    return result.rows[0];
  }

  // Verificar si la tarea pertenece al usuario
  static async isTaskOwnedByUser(taskId, userId) {
    const query = `
      SELECT 1 FROM user_tasks 
      WHERE task_id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [taskId, userId]);
    return result.rows.length > 0;
  }
}

module.exports = Task;