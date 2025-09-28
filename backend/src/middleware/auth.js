const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('🔐 Verificando autenticación...');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('📨 Token recibido:', token ? 'SÍ' : 'NO');

  if (token == null) {
    console.log('❌ Token no proporcionado');
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Token inválido:', err.message);
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    
    console.log('✅ Token válido, usuario:', user);
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };