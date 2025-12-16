// Middleware to check if user has required role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

// Shorthand middleware for common roles
const isCreator = checkRole('creator', 'admin');
const isAdmin = checkRole('admin');

module.exports = { checkRole, isCreator, isAdmin };
