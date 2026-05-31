# Personal Blog

🔗 **在线地址**：https://blog-production-6776.up.railway.app

一个简洁的个人博客系统，基于 Node.js + Express 构建，支持 Markdown 文章撰写、用户注册登录、评论互动。

## 技术栈

| 类别 | 技术 |
|------|------|
| 后端 | Node.js + Express 5 |
| 模板引擎 | Handlebars |
| 数据库 | PostgreSQL（Railway） |
| 认证 | bcryptjs + express-session |
| Markdown | marked + highlight.js |
| 演示文稿 | pptxgenjs（内置功能） |

## 功能

- ✅ 文章管理（Markdown 撰写 / 编辑 / 删除）
- ✅ 用户系统（注册 / 登录 / 权限管理 / 修改密码）
- ✅ 评论系统
- ✅ 搜索功能
- ✅ 标签与分类
- ✅ 响应式设计
- ✅ 代码高亮
- ✅ 图片上传
- ✅ PPT 生成（/admin/ppt 功能）

## 快速开始

### 本地运行

```bash
# 需要先安装 PostgreSQL，并配置 DATABASE_URL 环境变量
npm install
npm run dev    # 开发模式（热重载）
npm start      # 生产模式
```

访问 http://localhost:3000

**本地 PostgreSQL 配置**：
```bash
export DATABASE_URL="postgresql://用户名:密码@localhost:5432/数据库名"
```

### 初始化

首次运行会自动创建数据库表和管理员账户：

- **管理员账号**：`admin` / `admin123`
- **普通账号**：注册后自动创建

> 首次登录后请前往「设置」修改管理员密码。

## 目录结构

```
blog/
├── src/
│   ├── app.js           # 主入口
│   ├── database.js      # 数据库操作（PostgreSQL）
│   ├── middleware/      # 中间件（认证、权限）
│   ├── routes/         # 路由（auth/posts/comments/admin）
│   └── utils/          # 工具函数（Markdown 渲染等）
├── views/              # Handlebars 模板
├── public/             # 静态资源（CSS/JS/图片上传）
└── package.json
```

## 部署

### Railway（推荐）

1. 注册 [Railway](https://railway.app)（GitHub 登录，无需电话验证）
2. 创建 Project → **Provision PostgreSQL**（自动创建数据库）
3. 再创建 Project → **Deploy from GitHub** → 选择 `amainoyo/blog`
4. Railway 会自动从 GitHub 部署，无需手动配置

> PostgreSQL 的 `DATABASE_URL` 会由 Railway 自动注入。

### 其他平台

需要支持 **Node.js 服务端** 的平台：
- Render（需配置启动命令 `node src/app.js`）
- Fly.io
- 任意支持 Docker 的平台

> **注意**：Netlify、Vercel（静态）不适合此项目，因为它需要运行 Express 服务端。

## 接口路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 首页（文章列表） |
| GET | `/post/:slug` | 文章详情 |
| GET | `/login` | 登录页 |
| POST | `/login` | 登录 |
| GET | `/register` | 注册页 |
| POST | `/register` | 注册 |
| POST | `/logout` | 登出 |
| GET | `/settings` | 修改密码 |
| POST | `/settings/password` | 提交新密码 |
| GET | `/admin` | 管理后台 |
| POST | `/admin/new` | 创建文章 |
| POST | `/admin/ppt` | 生成 PPT |

## License

MIT