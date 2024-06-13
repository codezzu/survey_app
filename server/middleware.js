const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Token gerekli' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Bu sayfaya erişim izniniz yok' });
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyAdminToken;
