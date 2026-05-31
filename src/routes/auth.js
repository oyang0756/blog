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
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('login', { user: null, error: errors.array()[0].msg });
        }

        const { username, password } = req.body;
        const user = User.findByUsername(username);

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
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register', { user: null, error: errors.array()[0].msg });
        }

        const { username, email, password } = req.body;

        if (User.findByUsername(username)) {
            return res.render('register', { user: null, error: '用户名已存在' });
        }

        if (User.findByEmail(email)) {
            return res.render('register', { user: null, error: '邮箱已被注册' });
        }

        const user = User.create(username, email, password);
        req.session.userId = user.id;
        res.redirect('/');
    }
);

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;