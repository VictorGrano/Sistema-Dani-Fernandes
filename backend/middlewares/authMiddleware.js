const jwt = require('jsonwebtoken');
const secretKey = 'chaveSecretaD@niFernandes2024';

exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).json({ error: "Nenhum token fornecido" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido" });
    }
    
    req.userId = decoded.id;
    next();
  });
};
