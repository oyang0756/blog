const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { Post, Comment, Tag, generateSlug, CATEGORIES } = require('../database');
const { requireAuth, requireAdmin, requireVip, optionalAuth } = require('../middleware/auth');

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

function parseTags(input) {
    if (!input) return [];
    return input
        .split(/[,，\s]+/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .slice(0, 10);
}

function buildPageList(current, totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const candidates = new Set([
        1, totalPages,
        current - 2, current - 1, current, current + 1, current + 2
    ]);
    const sorted = [...candidates]
        .filter(p => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);
    const result = [];
    let prev = 0;
    for (const p of sorted) {
        if (p - prev > 1) result.push(null);
        result.push(p);
        prev = p;
    }
    return result;
}

router.get('/', optionalAuth, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;
    const category = req.query.category || null;
    const posts = await Post.findAll(limit, offset, category);
    const total = await Post.count(category);
    const totalPages = Math.ceil(total / limit);
    const pageList = buildPageList(page, totalPages);

    res.render('index', {
        user: req.user || null,
        posts,
        total,
        categories: CATEGORIES,
        activeCategory: category,
        pagination: { page, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
        pageList
    });
});

router.get('/search', optionalAuth, async (req, res) => {
    const query = req.query.q;
    if (!query || query.trim() === '') {
        return res.redirect('/');
    }
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;
    const category = req.query.category || null;
    const posts = await Post.search(query.trim(), limit, offset, category);
    const total = await Post.countSearch(query.trim(), category);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageList = buildPageList(page, totalPages);

    res.render('index', {
        user: req.user || null,
        posts,
        total,
        searchQuery: query.trim(),
        categories: CATEGORIES,
        activeCategory: category,
        pagination: { page, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
        pageList
    });
});

router.get('/tag/:slug', optionalAuth, async (req, res) => {
    const tag = await Post.getTagBySlug(req.params.slug);
    if (!tag) return res.status(404).render('404', { user: req.user || null });

    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        Post.findByTag(req.params.slug, limit, offset),
        Post.countByTag(req.params.slug)
    ]);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageList = buildPageList(page, totalPages);

    res.render('index', {
        user: req.user || null,
        posts,
        total,
        tagName: tag.name,
        categories: CATEGORIES,
        activeCategory: null,
        activeTag: tag.slug,
        pagination: { page, totalPages, hasPrev: page > 1, hasNext: page < totalPages },
        pageList
    });
});

router.get('/post/:slug', optionalAuth, async (req, res) => {
    const post = await Post.findBySlug(req.params.slug);
    if (!post) return res.status(404).render('404', { user: req.user || null });

    // 草稿仅作者和管理员可见
    if (post.status === 'draft' && (!req.user || (req.user.id !== post.author_id && req.user.role !== 'admin'))) {
        return res.status(404).render('404', { user: req.user || null });
    }

    await Post.incrementViewCount(post.id);
    const comments = await Comment.findByPost(post.id);

    let backUrl = '/';
    let backLabel = '返回首页';
    const referer = req.headers.referer || '';
    if (referer) {
        try {
            const url = new URL(referer);
            if (url.host === req.get('host')) {
                const cat = url.searchParams.get('category');
                if (cat && CATEGORIES.find(c => c.slug === cat)) {
                    const found = CATEGORIES.find(c => c.slug === cat);
                    backUrl = `/?category=${found.slug}`;
                    backLabel = `返回「${found.name}」`;
                } else if (url.pathname === '/search' || url.searchParams.has('q')) {
                    const q = url.searchParams.get('q') || '';
                    backUrl = url.pathname + url.search;
                    backLabel = q ? `返回搜索「${q}」` : '返回搜索';
                } else if (url.pathname === '/' && !url.search) {
                    backUrl = '/';
                    backLabel = '返回首页';
                }
            }
        } catch (e) { /* 解析失败用默认 */ }
    }

    res.render('post', {
        user: req.user || null,
        post,
        comments,
        categories: CATEGORIES,
        backUrl,
        backLabel
    });
});

router.get('/editor', requireVip, (req, res) => {
    res.render('editor', {
        user: req.user,
        post: null,
        error: null,
        categories: CATEGORIES,
        tagsString: ''
    });
});

router.get('/editor/:id', requireVip, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post || (post.author_id !== req.user.id && req.user.role !== 'admin')) {
        return res.redirect('/editor');
    }
    const tagsString = (post.tags || []).map(t => t.name).join(', ');
    res.render('editor', {
        user: req.user,
        post,
        error: null,
        categories: CATEGORIES,
        tagsString
    });
});

router.post('/posts',
    requireVip,
    upload.single('image'),
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('标题不能为空且不超过200字'),
    body('content').trim().isLength({ min: 1 }).withMessage('内容不能为空'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('editor', {
                user: req.user, post: null,
                error: errors.array()[0].msg,
                categories: CATEGORIES,
                tagsString: req.body.tags || ''
            });
        }

        let { title, content, status, category, tags } = req.body;
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            content += `\n\n<img src="${imageUrl}" alt="图片">`;
        }
        const slug = generateSlug(title);
        const validCategory = CATEGORIES.find(c => c.slug === category) ? category : 'uncategorized';

        const post = await Post.create(title, slug, content, req.user.id, status || 'published', validCategory);
        await Post.setTags(post.id, parseTags(tags));
        res.redirect(`/post/${post.slug}`);
    }
);

router.post('/posts/:id',
    requireVip,
    upload.single('image'),
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('标题不能为空'),
    body('content').trim().isLength({ min: 1 }).withMessage('内容不能为空'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('editor', {
                user: req.user, post: null,
                error: errors.array()[0].msg,
                categories: CATEGORIES,
                tagsString: req.body.tags || ''
            });
        }

        const post = await Post.findById(req.params.id);
        if (!post || (post.author_id !== req.user.id && req.user.role !== 'admin')) {
            return res.redirect('/editor');
        }

        let { title, content, status, category, tags } = req.body;
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            content += `\n\n<img src="${imageUrl}" alt="图片">`;
        }
        const slug = post.slug;
        const validCategory = CATEGORIES.find(c => c.slug === category) ? category : 'uncategorized';
        await Post.update(post.id, title, slug, content, status || 'published', validCategory);
        await Post.setTags(post.id, parseTags(tags));
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