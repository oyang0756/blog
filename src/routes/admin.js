const express = require('express');
const { User, Post, Comment } = require('../database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', requireAdmin, async (req, res) => {
    const userCount = await User.count();
    const postCount = await Post.count();
    const commentCount = await Comment.countAll();
    res.render('admin/dashboard', {
        user: req.user,
        userCount,
        postCount,
        commentCount
    });
});

router.get('/admin/users', requireAdmin, async (req, res) => {
    const users = await User.findAll();
    res.render('admin/users', { user: req.user, users });
});

router.post('/admin/users/:id/role', requireAdmin, async (req, res) => {
    const { role } = req.body;
    if (role === 'admin' || role === 'user') {
        await User.updateRole(req.params.id, role);
    }
    res.redirect('/admin/users');
});

router.post('/admin/users/:id/delete', requireAdmin, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user && user.id !== req.user.id) {
        await User.delete(user.id);
    }
    res.redirect('/admin/users');
});

router.get('/admin/posts', requireAdmin, async (req, res) => {
    const posts = await Post.findAllAdmin();
    res.render('admin/posts', { user: req.user, posts });
});

router.post('/admin/posts/:id/delete', requireAdmin, async (req, res) => {
    await Post.delete(req.params.id);
    res.redirect('/admin/posts');
});

router.get('/admin/comments', requireAdmin, async (req, res) => {
    const comments = await Comment.findAll();
    res.render('admin/comments', { user: req.user, comments });
});

router.post('/admin/comments/:id/delete', requireAdmin, async (req, res) => {
    await Comment.delete(req.params.id);
    res.redirect('/admin/comments');
});

module.exports = router;