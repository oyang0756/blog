const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { renderMarkdown } = require('./utils/markdown');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

let db;

async function initDb() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            avatar TEXT,
            bio TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            content TEXT NOT NULL,
            excerpt TEXT,
            author_id INTEGER NOT NULL,
            status TEXT DEFAULT 'published',
            view_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            author_id INTEGER NOT NULL,
            parent_id INTEGER,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (author_id) REFERENCES users(id),
            FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
        );
    `);

    // Migration: Add updated_at column to comments if it doesn't exist
    try {
        const columnsResult = db.exec("PRAGMA table_info(comments)");
        const columns = columnsResult[0].values.map(row => row[1]);
        if (!columns.includes('updated_at')) {
            db.run('ALTER TABLE comments ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
            saveDb();
        }
    } catch (e) {
        // Column might already exist, ignore error
    }

    saveDb();
    return db;
}

function saveDb() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

const User = {
    create(username, email, password) {
        const password_hash = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, password_hash]);
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        saveDb();
        return this.findById(id);
    },

    findById(id) {
        const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        const row = result[0].values[0];
        const cols = result[0].columns;
        return Object.fromEntries(cols.map((c, i) => [c, row[i]]));
    },

    findByUsername(username) {
        const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        const row = result[0].values[0];
        const cols = result[0].columns;
        return Object.fromEntries(cols.map((c, i) => [c, row[i]]));
    },

    findByEmail(email) {
        const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        const row = result[0].values[0];
        const cols = result[0].columns;
        return Object.fromEntries(cols.map((c, i) => [c, row[i]]));
    },

    verifyPassword(password, hash) {
        return bcrypt.compareSync(password, hash);
    },

    findAll() {
        const result = db.exec('SELECT * FROM users ORDER BY created_at DESC');
        if (result.length === 0) return [];
        const cols = result[0].columns;
        return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
    },

    count() {
        const result = db.exec('SELECT COUNT(*) as count FROM users');
        return result[0].values[0][0];
    },

    updateRole(id, role) {
        db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        saveDb();
    },

    delete(id) {
        // 先删除用户的文章和评论
        db.run('DELETE FROM comments WHERE author_id = ?', [id]);
        db.run('DELETE FROM posts WHERE author_id = ?', [id]);
        db.run('DELETE FROM users WHERE id = ?', [id]);
        saveDb();
    }
};

const Post = {
    create(title, slug, content, authorId, status = 'published') {
        const excerpt = content.replace(/<[^>]+>/g, '').slice(0, 200).replace(/[#*`>\-\[\]]/g, '') + '...';
        db.run('INSERT INTO posts (title, slug, content, excerpt, author_id, status) VALUES (?, ?, ?, ?, ?, ?)',
            [title, slug, content, excerpt, authorId, status]);
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        saveDb();
        return this.findById(id);
    },

    findById(id) {
        const result = db.exec(`
            SELECT posts.*, users.username as author_username
            FROM posts
            JOIN users ON posts.author_id = users.id
            WHERE posts.id = ?
        `, [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        const row = result[0].values[0];
        const cols = result[0].columns;
        const post = Object.fromEntries(cols.map((c, i) => [c, row[i]]));
        post.html = renderMarkdown(post.content);
        return post;
    },

    findBySlug(slug) {
        const result = db.exec(`
            SELECT posts.*, users.username as author_username
            FROM posts
            JOIN users ON posts.author_id = users.id
            WHERE posts.slug = ?
        `, [slug]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        const row = result[0].values[0];
        const cols = result[0].columns;
        const post = Object.fromEntries(cols.map((c, i) => [c, row[i]]));
        post.html = renderMarkdown(post.content);
        return post;
    },

    findAll(limit = 20, offset = 0) {
        const result = db.exec(`
            SELECT posts.*, users.username as author_username
            FROM posts
            JOIN users ON posts.author_id = users.id
            WHERE status = 'published'
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        if (result.length === 0) return [];
        const cols = result[0].columns;
        return result[0].values.map(row => {
            const post = Object.fromEntries(cols.map((c, i) => [c, row[i]]));
            post.html = renderMarkdown(post.content);
            return post;
        });
    },

    findByAuthor(authorId) {
        const result = db.exec(`
            SELECT posts.*, users.username as author_username
            FROM posts
            JOIN users ON posts.author_id = users.id
            WHERE author_id = ?
            ORDER BY created_at DESC
        `, [authorId]);
        if (result.length === 0) return [];
        const cols = result[0].columns;
        return result[0].values.map(row => {
            const post = Object.fromEntries(cols.map((c, i) => [c, row[i]]));
            post.html = renderMarkdown(post.content);
            return post;
        });
    },

    update(id, title, slug, content, status) {
        const excerpt = content.replace(/<[^>]+>/g, '').slice(0, 200).replace(/[#*`>\-\[\]]/g, '') + '...';
        db.run(`
            UPDATE posts
            SET title = ?, slug = ?, content = ?, excerpt = ?, status = ?, updated_at = datetime('now')
            WHERE id = ?
        `, [title, slug, content, excerpt, status, id]);
        saveDb();
        return this.findById(id);
    },

    delete(id) {
        db.run('DELETE FROM posts WHERE id = ?', [id]);
        saveDb();
    },

    incrementViewCount(id) {
        db.run('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [id]);
        saveDb();
    },

    count() {
        const result = db.exec("SELECT COUNT(*) as count FROM posts WHERE status = 'published'");
        return result[0].values[0][0];
    },

    search(query, limit = 20, offset = 0) {
        const result = db.exec(`
            SELECT posts.*, users.username as author_username
            FROM posts
            JOIN users ON posts.author_id = users.id
            WHERE status = 'published'
            AND (title LIKE ? OR content LIKE ?)
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [`%${query}%`, `%${query}%`, limit, offset]);
        if (result.length === 0) return [];
        const cols = result[0].columns;
        return result[0].values.map(row => {
            const post = Object.fromEntries(cols.map((c, i) => [c, row[i]]));
            post.html = renderMarkdown(post.content);
            return post;
        });
    },

    findAllAdmin() {
        const result = db.exec(`
            SELECT posts.*, users.username as author_username
            FROM posts
            JOIN users ON posts.author_id = users.id
            ORDER BY created_at DESC
        `);
        if (result.length === 0) return [];
        const cols = result[0].columns;
        return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
    }
};

const Comment = {
    create(postId, authorId, content, parentId = null) {
        db.run('INSERT INTO comments (post_id, author_id, content, parent_id) VALUES (?, ?, ?, ?)',
            [postId, authorId, content, parentId]);
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        saveDb();
        return this.findById(id);
    },

    findById(id) {
        const result = db.exec(`
            SELECT comments.*, users.username as author_username
            FROM comments
            JOIN users ON comments.author_id = users.id
            WHERE comments.id = ?
        `, [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        const row = result[0].values[0];
        const cols = result[0].columns;
        return Object.fromEntries(cols.map((c, i) => [c, row[i]]));
    },

    findByPost(postId) {
        const result = db.exec(`
            SELECT comments.*, users.username as author_username
            FROM comments
            JOIN users ON comments.author_id = users.id
            WHERE post_id = ?
            ORDER BY created_at ASC
        `, [postId]);
        if (result.length === 0) return [];
        const cols = result[0].columns;
        return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
    },

    delete(id) {
        db.run('DELETE FROM comments WHERE id = ?', [id]);
        saveDb();
    },

    update(id, content) {
        db.run('UPDATE comments SET content = ?, updated_at = ? WHERE id = ?', [content, new Date().toISOString(), id]);
        saveDb();
    },

    findAll() {
        const result = db.exec(`
            SELECT comments.*, users.username as author_username, posts.title as post_title, posts.slug as post_slug
            FROM comments
            JOIN users ON comments.author_id = users.id
            JOIN posts ON comments.post_id = posts.id
            ORDER BY comments.created_at DESC
        `);
        if (result.length === 0) return [];
        const cols = result[0].columns;
        return result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
    },

    countAll() {
        const result = db.exec('SELECT COUNT(*) as count FROM comments');
        return result[0].values[0][0];
    }
};

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9一-龥]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now().toString(36);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    // 时间戳已包含时区信息，但需要确保显示北京时间
    // 加上8小时偏移量（数据库存储的是UTC时间）
    const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    return `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')} ${String(beijingTime.getHours()).padStart(2, '0')}:${String(beijingTime.getMinutes()).padStart(2, '0')}`;
}

module.exports = { initDb, User, Post, Comment, generateSlug, formatDate, getDb: () => db, saveDb };