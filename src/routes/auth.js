const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../database');

const router = express.Router();

router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('login', { user: null, error: null });
});

router.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('register', { user: null, error: null });
});

router.post('/login',
    body('username').trim().notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('login', { user: null, error: errors.array()[0].msg });
        }

        const { username, password } = req.body;
        const user = await User.findByUsername(username);

        if (!user || !User.verifyPassword(password, user.password_hash)) {
            return res.render('login', { user: null, error: '用户名或密码错误' });
        }

        req.session.userId = user.id;
        res.redirect('/');
    }
);

router.post('/register',
    body('username').trim().isLength({ min: 3, max: 20 }).withMessage('用户名需3-20个字符'),
    body('email').isEmail().withMessage('请输入有效邮箱'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('两次密码不一致'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register', { user: null, error: errors.array()[0].msg });
        }

        const { username, email, password } = req.body;

        if (await User.findByUsername(username)) {
            return res.render('register', { user: null, error: '用户名已存在' });
        }

        if (await User.findByEmail(email)) {
            return res.render('register', { user: null, error: '邮箱已被注册' });
        }

        const user = await User.create(username, email, password);
        req.session.userId = user.id;
        res.redirect('/');
    }
);

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

router.get('/settings', (req, res) => {
    res.render('settings', { user: req.user, error: null, success: null });
});

router.post('/settings/password',
    body('oldPassword').notEmpty().withMessage('请输入原密码'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位'),
    body('confirmPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('两次密码不一致'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('settings', { user: req.user, error: errors.array()[0].msg, success: null });
        }

        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.session.userId);

        if (!User.verifyPassword(oldPassword, user.password_hash)) {
            return res.render('settings', { user: req.user, error: '原密码错误', success: null });
        }

        await User.updatePassword(req.session.userId, newPassword);
        res.render('settings', { user: req.user, error: null, success: '密码修改成功' });
    }
);

module.exports = router;