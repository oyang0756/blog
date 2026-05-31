const express = require('express');
const { User, Post, Comment } = require('../database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 管理后台首页
router.get('/admin', requireAdmin, (req, res) => {
    const userCount = User.count();
    const postCount = Post.count();
    const commentCount = Comment.countAll();
    res.render('admin/dashboard', {
        user: req.user,
        userCount,
        postCount,
        commentCount
    });
});

// 用户管理
router.get('/admin/users', requireAdmin, (req, res) => {
    const users = User.findAll();
    res.render('admin/users', { user: req.user, users });
});

router.post('/admin/users/:id/role', requireAdmin, (req, res) => {
    const { role } = req.body;
    if (role === 'admin' || role === 'user') {
        User.updateRole(req.params.id, role);
    }
    res.redirect('/admin/users');
});

router.post('/admin/users/:id/delete', requireAdmin, (req, res) => {
    const user = User.findById(req.params.id);
    if (user && user.id !== req.user.id) {
        User.delete(user.id);
    }
    res.redirect('/admin/users');
});

// 文章管理
router.get('/admin/posts', requireAdmin, (req, res) => {
    const posts = Post.findAllAdmin();
    res.render('admin/posts', { user: req.user, posts });
});

router.post('/admin/posts/:id/delete', requireAdmin, (req, res) => {
    Post.delete(req.params.id);
    res.redirect('/admin/posts');
});

// 评论管理
router.get('/admin/comments', requireAdmin, (req, res) => {
    const comments = Comment.findAll();
    res.render('admin/comments', { user: req.user, comments });
});

router.post('/admin/comments/:id/delete', requireAdmin, (req, res) => {
    Comment.delete(req.params.id);
    res.redirect('/admin/comments');
});

module.exports = router;