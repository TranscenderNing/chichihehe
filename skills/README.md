# 🎯 全栈项目架构技能包

基于 **Flask + React + Docker** 的全栈 Web 应用开发技能包，涵盖从项目搭建到生产部署的完整流程。

## 📋 技能索引

| 序号 | 技能文件 | 主题 | 核心内容 |
|:----:|---------|------|---------|
| 01 | [项目脚手架搭建](./01-project-scaffolding.md) | 项目初始化 | 目录结构、前后端初始化、依赖配置 |
| 02 | [Flask 后端架构](./02-flask-backend-architecture.md) | 后端架构 | 应用工厂、Blueprint、中间件、配置管理 |
| 03 | [React 前端架构](./03-react-frontend-architecture.md) | 前端架构 | Vite 配置、组件拆分、路由设计、API 封装 |
| 04 | [JWT 认证系统](./04-jwt-authentication.md) | 用户认证 | 双令牌、拦截器、路由守卫、Token 刷新 |
| 05 | [RESTful API 设计](./05-restful-api-design.md) | API 设计 | 统一响应、分页筛选、CRUD 模板 |
| 06 | [端口规划与代理配置](./06-port-planning-and-proxy.md) | 端口代理 | 开发/生产端口分配、Vite Proxy、Nginx 反向代理 |
| 07 | [跨域解决方案](./07-cors-solutions.md) | 跨域处理 | Vite Proxy、Nginx Proxy、Flask-CORS 三方案 |
| 08 | [Docker 容器化部署](./08-docker-deployment.md) | 容器部署 | Dockerfile、多阶段构建、Docker Compose 编排 |
| 09 | [文件上传系统](./09-file-upload-system.md) | 文件处理 | 上传 API、前端组件、存储设计、Docker 持久化 |
| 10 | [数据库设计模式](./10-database-design-patterns.md) | 数据库 | ORM 模型、多对多关联、双层序列化、索引设计 |
| 11 | [前端状态管理](./11-state-management.md) | 状态管理 | Context + useState、登录态、路由守卫 |
| 12 | [Tailwind CSS UI 组件](./12-tailwind-ui-components.md) | UI 组件 | 导航栏、卡片、侧边栏、模态框、工具类速查 |
| 13 | [部署检查清单](./13-deployment-checklist.md) | 上线部署 | 安全配置、环境检查、验证流程、常见问题排查 |

## 🏗️ 架构全景

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                             │
│                  http://your-domain.com                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx:80  │  ← 生产入口
                    │  静态文件 +  │
                    │  反向代理    │
                    └──┬───────┬──┘
                       │       │
              静态文件  │       │ /api/*
                       │       │
          ┌────────────▼─┐   ┌─▼────────────┐
          │  React SPA   │   │ Flask 后端    │
          │  (dist/)     │   │ :8000         │
          │              │   │               │
          │  • Vite 构建 │   │ • Blueprint   │
          │  • 路由守卫  │   │ • JWT 认证    │
          │  • Axios     │   │ • SQLAlchemy  │
          │  • Context   │   │ • SQLite/PG   │
          └──────────────┘   └───────┬───────┘
                                     │
                              ┌──────▼──────┐
                              │   数据存储    │
                              │  SQLite DB   │
                              │  uploads/    │
                              └─────────────┘
```

## 🔧 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18+ |
| 构建工具 | Vite | 5+ |
| 样式方案 | Tailwind CSS | 4+ |
| HTTP 客户端 | Axios | 1+ |
| 路由 | React Router | 6+ |
| 后端框架 | Flask | 2+ |
| ORM | SQLAlchemy | 2+ |
| 认证 | Flask-JWT-Extended | 4+ |
| 跨域 | Flask-CORS | 3+ |
| 容器化 | Docker + Compose | latest |
| Web 服务器 | Nginx | alpine |

## 🚀 快速开始

```bash
# 1. 安装后端依赖
cd backend && pip install -r requirements.txt

# 2. 启动后端
python run.py  # http://localhost:8000

# 3. 安装前端依赖
cd ../frontend && npm install

# 4. 启动前端
npm run dev   # http://localhost:3000

# 5. Docker 一键部署
cd .. && docker-compose up -d --build
# 访问 http://localhost
```

## 📌 使用建议

1. **按顺序阅读**：01 → 02 → 03 是基础，建议先掌握
2. **按需深入**：04 → 13 是专项技能，可根据需要跳读
3. **参考代码**：每个 skill 文件都包含可直接复用的代码模板
4. **部署参考**：13 号部署检查清单是上线前的必读文档