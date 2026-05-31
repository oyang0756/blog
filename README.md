# Personal Blog

一个简洁的个人博客系统，基于 Node.js + Express 构建，支持 Markdown 文章撰写、用户注册登录、评论互动。

## 技术栈

| 类别 | 技术 |
|------|------|
| 后端 | Node.js + Express 5 |
| 模板引擎 | Handlebars |
| 数据库 | SQLite（sql.js） |
| 认证 | bcryptjs + express-session |
| Markdown | marked + highlight.js |
| 演示文稿 | pptxgenjs（内置功能） |

## 功能

- ✅ 文章管理（Markdown 撰写 / 编辑 / 删除）
- ✅ 用户系统（注册 / 登录 / 权限管理）
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
npm install
npm run dev    # 开发模式（热重载）
npm start      # 生产模式
```

访问 http://localhost:3000

### 初始化

首次运行会自动创建 SQLite 数据库和管理员账户：

- **管理员账号**：`admin` / `admin123`
- **普通账号**：注册后自动创建

> 建议首次登录后立即修改管理员密码。

## 目录结构

```
blog/
├── src/
│   ├── app.js           # 主入口
│   ├── database.js      # 数据库操作
│   ├── middleware/      # 中间件（认证、权限）
│   ├── routes/         # 路由（auth/posts/comments/admin）
│   └── utils/          # 工具函数（Markdown 渲染等）
├── views/              # Handlebars 模板
├── public/             # 静态资源（CSS/JS/图片上传）
├── database.sqlite     # 数据库文件（自动生成）
└── package.json
```

## 部署

### Railway（推荐）

1. 注册 [Railway](https://railway.app)（GitHub 登录，无需电话验证）
2. 创建 Project → 从 GitHub 导入 `amainoyo/blog`
3. Railway 自动检测 Node.js，直接部署
4. 获取公开域名，完事

**环境变量**（可选）：
```
PORT=3000
NODE_ENV=production
```

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
| GET | `/admin` | 管理后台 |
| POST | `/admin/new` | 创建文章 |
| POST | `/admin/ppt` | 生成 PPT |

## License

MIT