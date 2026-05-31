const { User } = require('../database');

async function requireAuth(req, res, next) {
    if (!req.session.userId) {
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } });
        }
        return res.redirect('/login');
    }
    req.user = await User.findById(req.session.userId);
    next();
}

async function requireAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    req.user = await User.findById(req.session.userId);
    if (!req.user || req.user.role !== 'admin') {
        return res.redirect('/');
    }
    next();
}

async function optionalAuth(req, res, next) {
    if (req.session.userId) {
        req.user = await User.findById(req.session.userId);
    }
    next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth };