import jwt from 'jsonwebtoken';

/**
 * Middleware: Authenticates JWT token passed in Authorization HTTP Header.
 * Expects header format: "Authorization: Bearer <token>"
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: Missing Authorization Bearer token'
    });
  }

  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_mushroom_seal_key_2026_super_secure';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach payload (e.g., { phoneNumber, sellerId, role })
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token Expired: Please authenticate again'
      });
    }
    return res.status(403).json({
      success: false,
      error: 'Invalid Token: Signature verification failed'
    });
  }
};

/**
 * Middleware Generator: Role-Based Access Control (RBAC).
 * Enforces allowed roles (e.g., 'CUSTOMER' or 'SELLER') based on req.user.role payload.
 * 
 * Usage:
 * router.get('/protected', authenticateToken, requireRole('SELLER'), handler);
 * router.get('/admin-or-seller', authenticateToken, requireRole('SELLER', 'ADMIN'), handler);
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Unspecified user role'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Insufficient privileges. Required role: [${allowedRoles.join(', ')}], Current role: ${req.user.role}`
      });
    }

    next();
  };
};
