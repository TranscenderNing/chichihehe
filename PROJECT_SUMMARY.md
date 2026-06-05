# 吃吃喝喝看看听听 - 项目架构总结与部署指南

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈全景](#2-技术栈全景)
3. [项目架构详解](#3-项目架构详解)
4. [前后端通信机制](#4-前后端通信机制)
5. [端口规划与利用](#5-端口规划与利用)
6. [跨域问题与解决方案](#6-跨域问题与解决方案)
7. [开发环境部署](#7-开发环境部署)
8. [生产环境部署（Docker）](#8-生产环境部署docker)
9. [数据库设计](#9-数据库设计)
10. [认证与安全机制](#10-认证与安全机制)
11. [API 接口文档](#11-api-接口文档)
12. [前端路由与页面结构](#12-前端路由与页面结构)
13. [核心代码解读](#13-核心代码解读)
14. [常见问题与排错](#14-常见问题与排错)

---

## 1. 项目概述

**吃吃喝喝看看听听** 是一个个人生活记录与评分平台，用于记录用户体验过的餐厅、饮品、电影、音乐等内容，形成个人生活档案。

### 核心功能

| 功能 | 说明 |
|------|------|
| 🍽️ 吃 | 记录餐厅、小吃、外卖、酒吧体验 |
| ☕ 喝 | 记录咖啡馆、奶茶店、酒馆、茶馆体验 |
| 🎬 看 | 记录电影、电视剧、纪录片、话剧、展览 |
| 🎵 听 | 记录歌曲、专辑、音乐会、演唱会、播客 |
| 📊 统计 | 月度/年度统计、评分分布、城市分布、消费分析 |
| 🔍 搜索 | 关键词搜索、分类筛选、标签管理 |
| ❤️ 收藏 | 标记喜爱的体验 |

---

## 2. 技术栈全景

| 层级 | 技术 | 版本 | 作用 |
|------|------|------|------|
| **前端框架** | React | 18.2 | 组件化 UI 开发 |
| **构建工具** | Vite | 5.0 | 快速开发服务器与构建 |
| **CSS 框架** | TailwindCSS | 3.3 | 原子化 CSS 快速开发 |
| **HTTP 客户端** | Axios | 1.6 | 前端 API 请求 |
| **图表库** | Recharts | 2.10 | 数据可视化 |
| **路由** | React Router DOM | 6.20 | 前端单页路由 |
| **图标** | Lucide React | 0.294 | 矢量图标库 |
| **日期处理** | date-fns | 2.30 | 日期格式化 |
| **后端框架** | Flask | 3.0 | 轻量级 Python Web 框架 |
| **ORM** | SQLAlchemy | 3.1 | 数据库对象关系映射 |
| **认证** | Flask-JWT-Extended | 4.6 | JWT 令牌认证 |
| **跨域** | Flask-CORS | 4.0 | 处理跨域请求 |
| **数据库** | SQLite | - | 轻量级文件数据库 |
| **容器化** | Docker + Docker Compose | - | 一键部署 |
| **Web 服务器** | Nginx | Alpine | 反向代理 + 静态资源服务 |

---

## 3. 项目架构详解

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                              │
│                    http://localhost (80)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Nginx (前端容器)                             │
│              端口 80 / 静态文件 + 反向代理                       │
│                                                               │
│  ┌─────────────────┐    ┌─────────────────────────────────┐  │
│  │ 静态文件服务       │    │ /api/* 反向代理                    │  │
│  │ /usr/share/       │    │ proxy_pass → backend:8000       │  │
│  │ nginx/html        │    │                                 │  │
│  └─────────────────┘    └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ /api/* 请求转发
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Flask 后端容器                               │
│                   端口 8000                                    │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ auth     │ │ records  │ │ stats    │ │ upload   │        │
│  │ /api/    │ │ /api/    │ │ /api/    │ │ /api/    │        │
│  │ auth/*   │ │ records/*│ │ stats/*  │ │ upload/* │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                        │                                      │
│                        ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  SQLAlchemy ORM                           │ │
│  │              SQLite (/app/data/app.db)                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 前端架构分层

```
frontend/src/
├── main.jsx              # 入口文件，挂载 React 根组件
├── App.jsx               # 路由配置，PrivateRoute 鉴权
├── index.css             # 全局样式（TailwindCSS 导入）
├── components/           # 通用可复用组件
│   ├── Layout.jsx        # 主布局（侧边栏 + 底部导航 + Outlet）
│   ├── RecordCard.jsx    # 记录卡片组件
│   ├── RatingStars.jsx   # 评分星级组件
│   └── ImageUploader.jsx # 图片上传组件
├── contexts/             # React Context 状态管理
│   └── AuthContext.jsx   # 认证上下文（user, login, register, logout）
├── pages/                # 页面组件（路由对应）
│   ├── LoginPage.jsx     # 登录/注册页
│   ├── HomePage.jsx      # 首页（四宫格入口 + 最近记录）
│   ├── RecordListPage.jsx # 记录列表页（按分类）
│   ├── NewRecordPage.jsx # 新建记录页
│   ├── RecordDetailPage.jsx # 记录详情页
│   ├── EditRecordPage.jsx # 编辑记录页
│   ├── SearchPage.jsx    # 搜索页
│   ├── StatsPage.jsx     # 统计页
│   └── ProfilePage.jsx   # 个人中心页
└── services/             # API 服务层
    └── api.js            # Axios 实例 + 拦截器（Token 注入 + 401 刷新）
```

### 3.3 后端架构分层

```
backend/
├── run.py                # 启动入口（初始化分类 + app.run()）
├── config.py             # 配置类（数据库URI、JWT密钥、上传路径等）
├── requirements.txt      # Python 依赖清单
├── Dockerfile            # 后端容器构建文件
├── app/
│   ├── __init__.py       # 应用工厂函数 create_app()
│   ├── models.py         # 数据模型（User, Record, Category, Tag, Photo, Comment）
│   └── routes/           # API 路由蓝图
│       ├── auth.py       # 认证路由（注册、登录、Token刷新、个人信息）
│       ├── records.py    # 记录路由（CRUD、收藏、分类、标签）
│       ├── stats.py      # 统计路由（总览、月度、年度）
│       └── upload.py     # 上传路由（图片上传、文件访问）
```

---

## 4. 前后端通信机制

### 4.1 通信总览

前端和后端通过 **HTTP RESTful API** 进行通信，所有数据以 **JSON** 格式传输。

```
前端 (React)  ──── HTTP/JSON ────→  后端 (Flask)
                                      │
                                      ├── GET/POST/PUT/DELETE
                                      ├── Authorization: Bearer <JWT>
                                      └── Content-Type: application/json
```

### 4.2 API 客户端配置（Axios）

前端使用 Axios 库封装了统一的 API 客户端 `src/services/api.js`：

```javascript
import axios from 'axios'

// 创建 Axios 实例，baseURL 设置为 /api（相对路径）
const api = axios.create({
  baseURL: '/api',        // 所有请求自动加 /api 前缀
  timeout: 30000,         // 30秒超时
})

// 请求拦截器：自动注入 JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：自动处理 401 并刷新 Token
api.interceptors.response.use(
  (response) => response.data,  // 直接返回 data 层
  async (error) => {
    if (error.response?.status === 401) {
      // 尝试用 refresh_token 获取新的 access_token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken && !error.config._retry) {
        error.config._retry = true
        const res = await axios.post('/api/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        })
        const newToken = res.data.data.access_token
        localStorage.setItem('access_token', newToken)
        error.config.headers.Authorization = `Bearer ${newToken}`
        return api(error.config)  // 重试原请求
      }
      // Token 失效，跳转登录页
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default api
```

### 4.3 请求流程图

```
用户操作 → React 组件
    │
    ▼
调用 api.get('/records') 或 api.post('/auth/login', data)
    │
    ▼
请求拦截器：从 localStorage 读取 access_token
    │              注入到 Authorization header
    ▼
发送 HTTP 请求 → GET/POST /api/xxx
    │
    ├─ 开发环境：Vite proxy 拦截 /api → localhost:8000
    ├─ 生产环境：Nginx 拦截 /api → backend:8000
    │
    ▼
Flask 路由处理请求
    │
    ├─ @jwt_required() 验证 Token
    ├─ 业务逻辑处理
    ├─ SQLAlchemy 查询数据库
    │
    ▼
返回 JSON 响应 { code, message, data }
    │
    ▼
响应拦截器：
    ├─ 成功：返回 response.data（脱壳）
    ├─ 401：尝试刷新 Token → 重试 → 失败则跳转登录
    │
    ▼
组件获取数据，更新 UI 状态
```

### 4.4 统一响应格式

后端所有 API 返回统一的 JSON 结构：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

| code | 含义 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 / Token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 5. 端口规划与利用

### 5.1 端口分配表

| 端口 | 服务 | 环境 | 说明 |
|------|------|------|------|
| **80** | Nginx（前端） | 生产环境 | 对外提供 Web 服务，用户直接访问 |
| **3000** | Vite Dev Server | 开发环境 | 前端开发服务器（HMR 热更新） |
| **8000** | Flask 后端 | 开发 & 生产 | 后端 API 服务端口 |
| **5000** | Flask 后端（开发备选） | 开发环境 | Flask 默认端口（本项目未使用） |

### 5.2 端口利用详解

#### 开发环境端口流向

```
浏览器 → http://localhost:3000 (Vite Dev Server)
              │
              ├── / (前端页面) → Vite 直接返回（HMR）
              │
              └── /api/* → Vite Proxy → http://localhost:8000 (Flask)
                                              │
                                              └── SQLite (文件数据库)
```

- **端口 3000**：Vite 开发服务器，提供前端页面和模块热替换（HMR）
- **端口 8000**：Flask 后端，只监听 API 请求
- 两个端口通过 Vite 的 `server.proxy` 配置桥接

#### 生产环境端口流向

```
浏览器 → http://localhost:80 (Nginx)
              │
              ├── / (静态文件) → Nginx 直接返回 index.html
              │
              └── /api/* → Nginx Proxy → http://backend:8000 (Flask Docker)
                                              │
                                              └── SQLite (挂载卷)
```

- **端口 80**：Nginx 对外服务，处理所有用户请求
- **端口 8000**：Flask 容器内部端口，仅通过 Docker 网络暴露给 Nginx

### 5.3 端口配置文件对照

| 配置文件 | 端口设置 |
|----------|----------|
| `frontend/vite.config.js` | `server.port: 3000`，proxy 目标 `http://localhost:8000` |
| `backend/run.py` | `app.run(port=8000)`，可通过环境变量 `PORT` 修改 |
| `frontend/nginx.conf` | `listen 80`，proxy 目标 `http://backend:8000` |
| `docker-compose.yml` | 前端映射 `80:80`，后端映射 `8000:8000` |

---

## 6. 跨域问题与解决方案

### 6.1 什么是跨域（CORS）

跨域（Cross-Origin Resource Sharing）是指浏览器的**同源策略**限制：当一个网页请求的 URL 的 **协议、域名、端口** 三者中任意一个与当前页面不同，就构成跨域。

在本项目中：
- 开发环境：前端 `http://localhost:3000` 请求后端 `http://localhost:8000` → **端口不同，产生跨域**
- 生产环境：用户访问 `http://localhost:80`，API 转发到后端容器 → **Nginx 同域代理，无跨域**

### 6.2 本项目的跨域解决方案

本项目采用了 **双重方案** 来解决跨域问题，覆盖开发和生产两种环境：

#### 方案一：开发环境 - Vite Proxy 代理

**原理**：利用 Vite 开发服务器的代理功能，将 `/api` 请求代理到后端。对浏览器而言，所有请求都发往 `localhost:3000`（同源），不存在跨域问题。

**配置位置**：`frontend/vite.config.js`

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // 后端地址
        changeOrigin: true,               // 修改请求头的 Origin
      }
    }
  }
})
```

**工作流程**：
```
浏览器 → GET http://localhost:3000/api/records
              │
              ▼ Vite Proxy 拦截 /api 前缀
              │
              ▼ 转发到 http://localhost:8000/api/records
              │
              ▼ Flask 处理并返回 JSON
              │
              ▼ Vite 将响应返回给浏览器（浏览器认为响应来自 localhost:3000）
```

> `changeOrigin: true` 的作用：修改代理请求头中的 `Host` 和 `Origin` 为目标地址，确保后端接收到正确的请求来源。

#### 方案二：生产环境 - Nginx 反向代理

**原理**：Nginx 同时托管前端静态文件和后端 API 代理，对外只暴露一个端口（80）。对浏览器而言，所有请求都发往同一个域名和端口，不存在跨域。

**配置位置**：`frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;  # SPA 路由回退
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:8000;     # 转发到后端容器
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        client_max_body_size 16m;          # 限制上传文件大小
    }
}
```

**工作流程**：
```
浏览器 → GET http://localhost/api/records
              │
              ▼ Nginx 匹配 /api/ 前缀
              │
              ▼ proxy_pass 转发到 http://backend:8000/api/records
              │
              ▼ Flask 处理并返回 JSON
              │
              ▼ Nginx 将响应返回给浏览器
```

#### 方案三：后端 CORS 中间件（兜底）

**原理**：即使有代理方案，后端仍然配置了 Flask-CORS 作为兜底，允许任何来源访问 `/api/*` 路径。

**配置位置**：`backend/app/__init__.py`

```python
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    # ...
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    # ...
```

**作用**：在响应头中添加 CORS 相关字段：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

> 这层 CORS 配置确保即使代理未生效（如直接访问后端端口），API 也不会被浏览器拦截。

### 6.3 三种方案对比

| 特性 | Vite Proxy | Nginx Proxy | Flask-CORS |
|------|-----------|-------------|------------|
| 适用环境 | 开发 | 生产 | 兜底/任何 |
| 是否需要配置 | 是 | 是 | 是 |
| 对浏览器透明 | ✅ | ✅ | ❌（需设置响应头） |
| 是否暴露后端端口 | 否 | 否 | 是（直接访问时） |
| 性能影响 | 低 | 低 | 无 |
| 安全性 | 高（同源） | 高（同源） | 中（需限制 origins） |

---

## 7. 开发环境部署

### 7.1 后端启动

```bash
# 进入后端目录
cd backend

# 创建 Python 虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动后端服务（默认端口 8000）
python run.py
```

**启动后自动执行**：
1. 创建 `data/` 目录（存放 SQLite 数据库）
2. 创建 `uploads/` 目录（存放上传图片）
3. 初始化数据库表（`db.create_all()`）
4. 初始化默认分类数据（18个子分类）
5. 监听 `0.0.0.0:8000`

**验证**：访问 `http://localhost:8000/api/health` 应返回 `{"code": 200, "message": "ok"}`

### 7.2 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**启动后**：
1. Vite 开发服务器启动在 `http://localhost:3000`
2. `/api/*` 请求自动代理到 `http://localhost:8000`
3. 支持 HMR 热模块替换

**验证**：浏览器打开 `http://localhost:3000` 即可看到登录页面

### 7.3 开发环境网络拓扑

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   浏览器      │ ──3000──│  Vite Server │ ──8000──│  Flask 后端   │
│  localhost    │         │  (前端开发)    │  proxy  │  (API服务)    │
└──────────────┘         └──────────────┘         └──────┬───────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │   SQLite     │
                                                  │  data/app.db │
                                                  └──────────────┘
```

---

## 8. 生产环境部署（Docker）

### 8.1 Docker Compose 配置解读

```yaml
version: '3.8'

services:
  backend:
    build: ./backend                          # 用 backend/Dockerfile 构建
    container_name: chichihehe-backend
    environment:
      - SECRET_KEY=your-production-secret-key-here
      - JWT_SECRET_KEY=your-jwt-secret-key-here
      - PORT=8000
      - FLASK_DEBUG=0                         # 关闭调试模式
    volumes:
      - backend-uploads:/app/uploads          # 持久化上传文件
      - backend-db:/app/data                  # 持久化数据库
    ports:
      - "8000:8000"                           # 后端端口映射
    restart: unless-stopped
    healthcheck:                              # 健康检查
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s

  frontend:
    build: ./frontend                         # 用 frontend/Dockerfile 构建
    container_name: chichihehe-frontend
    ports:
      - "80:80"                               # 前端端口映射
    depends_on:
      backend:
        condition: service_healthy            # 等后端健康后再启动
    restart: unless-stopped

volumes:
  backend-uploads:                            # 命名卷：上传文件
  backend-db:                                 # 命名卷：数据库文件
```

### 8.2 后端 Dockerfile 解读

```dockerfile
FROM python:3.11-slim          # 基础镜像：Python 3.11 精简版

WORKDIR /app                   # 工作目录

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
                               # 安装 curl（用于健康检查）

COPY requirements.txt .        # 先复制依赖文件（利用 Docker 缓存层）
RUN pip install --no-cache-dir -r requirements.txt
                               # 安装 Python 依赖

COPY . .                       # 复制全部源代码

RUN mkdir -p uploads data      # 创建必要目录

EXPOSE 8000                    # 声明端口

CMD ["python", "run.py"]       # 启动命令
```

### 8.3 前端 Dockerfile 解读（多阶段构建）

```dockerfile
# === 第一阶段：构建 ===
FROM node:18-alpine AS build

WORKDIR /app
COPY package.json ./
RUN npm install                # 安装依赖
COPY . .
RUN npm run build              # 构建生产版本 → /app/dist

# === 第二阶段：部署 ===
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
                               # 从第一阶段复制构建产物
COPY nginx.conf /etc/nginx/conf.d/default.conf
                               # 复制 Nginx 配置

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**多阶段构建的好处**：
- 最终镜像不包含 Node.js 和 node_modules，体积更小
- 只包含 Nginx + 静态文件，安全且高效

### 8.4 一键部署命令

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 8.5 生产环境网络拓扑

```
┌──────────────┐
│   用户浏览器   │
│  http://IP:80 │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  Docker Network: chichihehe_default           │
│                                                │
│  ┌─────────────────┐   ┌──────────────────┐   │
│  │ chichihehe-      │   │ chichihehe-      │   │
│  │ frontend (Nginx) │   │ backend (Flask)  │   │
│  │                  │   │                  │   │
│  │ :80 (映射到宿主机)│   │ :8000 (映射)     │   │
│  │                  │   │                  │   │
│  │ 静态文件:         │   │ 数据:             │   │
│  │ /usr/share/      │   │ /app/data/app.db │   │
│  │ nginx/html       │   │ (backend-db卷)   │   │
│  │                  │   │                  │   │
│  │ /api/ → 代理     │──→│ /api/* 路由       │   │
│  │ 到 backend:8000  │   │                  │   │
│  └─────────────────┘   └──────────────────┘   │
│                                                │
│  Volumes:                                      │
│  ├── backend-uploads → /app/uploads (图片)      │
│  └── backend-db → /app/data (SQLite数据库)      │
└──────────────────────────────────────────────┘
```

---

## 9. 数据库设计

### 9.1 ER 关系图

```
┌──────────┐     1    N    ┌──────────┐     N    M    ┌──────────┐
│  users   │──────────────│ records  │──────────────│   tags   │
│          │              │          │              │          │
│ id       │              │ id       │              │ id       │
│ username │              │ user_id  │              │ name     │
│ email    │              │ category │              │ user_id  │
│ password │              │ _id      │              └──────────┘
│ _hash    │              │ title    │
│ avatar   │              │ content  │     1    N    ┌──────────┐
│ bio      │              │ rating   │──────────────│  photos  │
│          │              │ price    │              │          │
└──────────┘              │ city     │              │ id       │
       │                  │ ...      │              │ record_id│
       │ 1                └──────────┘              │ url      │
       │ N                        │                 └──────────┘
       ▼                          │
┌──────────┐                      │ 1    N    ┌──────────┐
│comments  │                      │──────────────│          │
│          │                      │              │categories│
│ id       │                      │              │          │
│ record_id│                      │              │ id       │
│ user_id  │                      │              │ name     │
│ content  │                      │              │ sub_type │
└──────────┘                      │              │ icon     │
                                  │              └──────────┘
                                  │
                              (多对多关联表: record_tags)
```

### 9.2 数据表说明

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户表 | username, email, password_hash, avatar, bio |
| `records` | 记录表 | user_id, category_id, title, content, rating, price, city |
| `categories` | 分类表 | name(吃/喝/看/听), sub_type(餐厅/电影/...) |
| `tags` | 标签表 | name, user_id |
| `record_tags` | 记录-标签多对多关联 | record_id, tag_id |
| `photos` | 照片表 | record_id, url |
| `comments` | 评论表 | record_id, user_id, content |

---

## 10. 认证与安全机制

### 10.1 JWT 认证流程

```
┌──────────┐                              ┌──────────┐
│  前端     │                              │  后端     │
└────┬─────┘                              └────┬─────┘
     │                                         │
     │  POST /api/auth/login                    │
     │  { username, password }                  │
     │─────────────────────────────────────────→│
     │                                         │ 验证密码
     │  { access_token, refresh_token }         │ 生成 JWT
     │←─────────────────────────────────────────│
     │                                         │
     │  存储到 localStorage                     │
     │                                         │
     │  GET /api/records                        │
     │  Authorization: Bearer <access_token>    │
     │─────────────────────────────────────────→│
     │                                         │ 验证 Token
     │  { code: 200, data: [...] }              │ 解析 user_id
     │←─────────────────────────────────────────│
     │                                         │
     │  (access_token 过期后)                    │
     │  POST /api/auth/refresh                  │
     │  Authorization: Bearer <refresh_token>   │
     │─────────────────────────────────────────→│
     │  { new_access_token }                    │
     │←─────────────────────────────────────────│
```

### 10.2 Token 生命周期

| Token | 有效期 | 用途 |
|-------|--------|------|
| Access Token | 2 小时 | 访问受保护的 API |
| Refresh Token | 7 天 | 刷新 Access Token |

### 10.3 安全措施

- **密码加密**：使用 Werkzeug 的 `generate_password_hash` 进行哈希加密
- **JWT 无状态**：服务端不存储 Token，适合分布式部署
- **请求拦截器**：前端自动注入 Token，自动刷新过期 Token
- **路由守卫**：前端 `PrivateRoute` 组件保护需登录页面
- **后端装饰器**：`@jwt_required()` 保护需认证的 API

---

## 11. API 接口文档

### 11.1 认证模块 `/api/auth`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| POST | `/api/auth/refresh` | 刷新 Token | Refresh Token |
| GET | `/api/auth/profile` | 获取用户信息 | ✅ |
| PUT | `/api/auth/profile` | 更新用户信息 | ✅ |

### 11.2 记录模块 `/api/records`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/records` | 获取记录列表 | ✅ |
| POST | `/api/records` | 创建记录 | ✅ |
| GET | `/api/records/:id` | 获取记录详情 | ✅ |
| PUT | `/api/records/:id` | 更新记录 | ✅ |
| DELETE | `/api/records/:id` | 删除记录 | ✅ |
| POST | `/api/records/:id/favorite` | 切换收藏 | ✅ |
| GET | `/api/records/categories` | 获取分类列表 | ✅ |
| GET | `/api/records/tags` | 获取标签列表 | ✅ |

**查询参数（GET /api/records）**：

| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码，默认 1 |
| per_page | int | 每页数量，默认 20 |
| category | string | 分类名（吃/喝/看/听） |
| sub_type | string | 子类型 |
| keyword | string | 关键词搜索 |
| tag | string | 标签名 |
| is_favorite | string | "true" 筛选收藏 |
| sort | string | 排序字段（created_at/rating/price/record_date） |
| order | string | 排序方向（asc/desc） |

### 11.3 统计模块 `/api/stats`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/stats/overview` | 总览统计 | ✅ |
| GET | `/api/stats/monthly` | 月度统计 | ✅ |
| GET | `/api/stats/yearly` | 年度统计 | ✅ |

### 11.4 上传模块 `/api/upload`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/upload` | 上传图片（multipart/form-data） | ✅ |
| GET | `/api/upload/files/:filename` | 获取图片 | ❌ |

### 11.5 健康检查

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/health` | 健康检查 | ❌ |

---

## 12. 前端路由与页面结构

### 12.1 路由表

| 路径 | 页面组件 | 认证要求 | 说明 |
|------|----------|----------|------|
| `/login` | LoginPage | ❌ | 登录/注册页 |
| `/` | HomePage (Layout) | ✅ | 首页四宫格入口 |
| `/records/:category` | RecordListPage (Layout) | ✅ | 分类记录列表 |
| `/records/new` | NewRecordPage (Layout) | ✅ | 新建记录表单 |
| `/record/:id` | RecordDetailPage (Layout) | ✅ | 记录详情 |
| `/records/edit/:id` | EditRecordPage (Layout) | ✅ | 编辑记录 |
| `/search` | SearchPage (Layout) | ✅ | 全局搜索 |
| `/stats` | StatsPage (Layout) | ✅ | 数据统计 |
| `/profile` | ProfilePage (Layout) | ✅ | 个人中心 |

### 12.2 布局结构

```
<Layout>
├── <aside>            # 桌面端：左侧固定侧边栏（264px）
│   ├── Logo           # 应用标题
│   ├── <nav>          # 导航菜单（首页/搜索/统计/我的）
│   └── <button>       # 新建记录按钮
│
├── <main>             # 主内容区（Outlet 渲染子路由）
│   └── <Outlet />
│
└── <nav>              # 移动端：底部固定导航栏
    ├── 首页
    ├── 搜索
    ├── 统计
    ├── 我的
    └── 记录
```

---

## 13. 核心代码解读

### 13.1 应用工厂模式 (`app/__init__.py`)

```python
def create_app():
    app = Flask(__name__)
    
    # 加载配置
    from config import Config
    app.config.from_object(Config)
    
    # 初始化 CORS（允许所有 /api/* 请求的跨域）
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # 初始化数据库和 JWT
    db.init_app(app)
    jwt.init_app(app)
    
    # 创建上传目录
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # 注册路由蓝图
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(records_bp, url_prefix='/api/records')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    
    # 健康检查端点
    @app.route('/api/health')
    def health():
        return {'code': 200, 'message': 'ok'}
    
    # 初始化数据库表
    with app.app_context():
        db.create_all()
    
    return app
```

**设计亮点**：
- 使用工厂模式，便于测试和配置切换
- Blueprint 蓝图模式组织路由，模块化清晰
- CORS 配置精确到 `/api/*` 路径

### 13.2 认证中间件 (`services/api.js`)

前端 API 客户端的核心设计是**请求/响应拦截器**：

- **请求拦截器**：每次请求自动从 `localStorage` 读取 Token 并注入到 `Authorization` 头
- **响应拦截器**：收到 401 响应时自动尝试用 Refresh Token 获取新的 Access Token，然后重试原请求

这种设计使得业务代码无需关心 Token 管理，所有认证逻辑集中在 API 服务层。

### 13.3 数据模型设计 (`models.py`)

```python
class Record(db.Model):
    # 使用 to_dict() 方法将 ORM 对象序列化为字典
    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category.to_dict(),  # 嵌套序列化关联对象
            'tags': [t.to_dict() for t in self.tags],  # 列表序列化
            'photos': [p.to_dict() for p in self.photos],
            ...
        }
    
    # 使用 to_brief_dict() 提供精简版数据（列表页使用）
    def to_brief_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'rating': self.rating,
            'cover': self.photos.first().to_dict() if self.photos.first() else None,
            ...
        }
```

---

## 14. 常见问题与排错

### Q1: 前端请求 404
**原因**：后端未启动或端口不匹配
**解决**：确认后端运行在 8000 端口，检查 `vite.config.js` 的 proxy 配置

### Q2: CORS 错误
**原因**：直接访问后端端口且 CORS 未正确配置
**解决**：开发环境使用 Vite proxy（不要直接请求 `localhost:8000`），确保 `flask-cors` 已安装

### Q3: Token 过期后页面卡住
**原因**：Refresh Token 也过期了
**解决**：前端会自动跳转到登录页，重新登录即可

### Q4: Docker 部署后前端白屏
**原因**：Nginx 配置缺少 SPA 路由回退
**解决**：确保 `nginx.conf` 中有 `try_files $uri $uri/ /index.html`

### Q5: 数据库文件在哪
**开发环境**：`backend/data/app.db`
**Docker 环境**：Docker 命名卷 `backend-db` 中

### Q6: 如何修改端口
- 后端：修改环境变量 `PORT` 或 `run.py` 中的默认值
- 前端开发：修改 `vite.config.js` 中的 `server.port`
- Nginx：修改 `nginx.conf` 中的 `listen` 和 `docker-compose.yml` 中的端口映射

---

## 附录：项目依赖清单

### 后端 Python 依赖 (`requirements.txt`)

```
Flask>=3.0
Flask-SQLAlchemy>=3.1
Flask-JWT-Extended>=4.6
Flask-CORS>=4.0
Werkzeug>=3.0
```

### 前端 npm 依赖 (`package.json`)

```
生产依赖：
├── react@18.2           # UI 框架
├── react-dom@18.2       # React DOM
├── react-router-dom@6.20 # 路由
├── axios@1.6            # HTTP 客户端
├── recharts@2.10        # 图表
├── lucide-react@0.294   # 图标
└── date-fns@2.30        # 日期工具

开发依赖：
├── @vitejs/plugin-react@4.2 # Vite React 插件
├── vite@5.0              # 构建工具
├── tailwindcss@3.3       # CSS 框架
├── autoprefixer@10.4     # CSS 前缀
└── postcss@8.4           # CSS 处理