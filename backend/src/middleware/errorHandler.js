// Middleware para manejo centralizado de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Error de validación de PostgreSQL
  if (err.code === '23505') { // Violación de unique constraint
    return res.status(400).json({ error: 'El email ya está registrado' });
  }
  
  // Error de foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referencia inválida' });
  }
  
  // Error general del servidor
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};

module.exports = errorHandler;