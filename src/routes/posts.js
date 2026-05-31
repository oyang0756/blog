const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { Post, Comment, generateSlug } = require('../database');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + Math.random().toString(36).slice(2) + ext;
        cb(null, name);
    }
});
const upload = multer({ storage });

router.get('/', optionalAuth, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;
    const posts = await Post.findAll(limit, offset);
    const total = await Post.count();
    const totalPages = Math.ceil(total / limit);

    res.render('index', {
        user: req.user || null,
        posts,
        total,
        pagination: { page, totalPages, hasPrev: page > 1, hasNext: page < totalPages }
    });
});

router.get('/search', optionalAuth, async (req, res) => {
    const query = req.query.q;
    if (!query || query.trim() === '') {
        return res.redirect('/');
    }
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;
    const posts = await Post.search(query.trim(), limit, offset);
    const total = posts.length;

    res.render('index', {
        user: req.user || null,
        posts,
        total,
        searchQuery: query.trim(),
        pagination: { page, totalPages: 1, hasPrev: false, hasNext: false }
    });
});

router.get('/post/:slug', optionalAuth, async (req, res) => {
    const post = await Post.findBySlug(req.params.slug);
    if (!post) return res.status(404).render('404', { user: req.user || null });
    await Post.incrementViewCount(post.id);
    const comments = await Comment.findByPost(post.id);
    res.render('post', { user: req.user || null, post, comments });
});

router.get('/editor', requireAuth, (req, res) => {
    res.render('editor', { user: req.user, post: null, error: null });
});

router.get('/editor/:id', requireAuth, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post || (post.author_id !== req.user.id && req.user.role !== 'admin')) {
        return res.redirect('/editor');
    }
    res.render('editor', { user: req.user, post, error: null });
});

router.post('/posts',
    requireAuth,
    upload.single('image'),
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('标题不能为空且不超过200字'),
    body('content').trim().isLength({ min: 1 }).withMessage('内容不能为空'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('editor', { user: req.user, post: null, error: errors.array()[0].msg });
        }

        let { title, content, status } = req.body;
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            content += `\n\n<img src="${imageUrl}" alt="图片">`;
        }
        const slug = generateSlug(title);

        const post = await Post.create(title, slug, content, req.user.id, status || 'published');
        res.redirect(`/post/${post.slug}`);
    }
);

router.post('/posts/:id',
    requireAuth,
    upload.single('image'),
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('标题不能为空'),
    body('content').trim().isLength({ min: 1 }).withMessage('内容不能为空'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('editor', { user: req.user, post: null, error: errors.array()[0].msg });
        }

        const post = await Post.findById(req.params.id);
        if (!post || (post.author_id !== req.user.id && req.user.role !== 'admin')) {
            return res.redirect('/editor');
        }

        let { title, content, status } = req.body;
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            content += `\n\n<img src="${imageUrl}" alt="图片">`;
        }
        const slug = post.slug;
        await Post.update(post.id, title, slug, content, status || 'published');
        res.redirect(`/post/${slug}`);
    }
);

router.post('/posts/:id/delete', requireAuth, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post && (post.author_id === req.user.id || req.user.role === 'admin')) {
        await Post.delete(post.id);
    }
    res.redirect('/');
});

module.exports = router;