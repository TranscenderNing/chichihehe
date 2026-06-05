# Skill 01 — 项目脚手架搭建

## 目标
初始化一个 React + Flask 前后端分离项目的目录结构。

## 项目目录结构

```
project-root/
├── frontend/                  # 前端项目
│   ├── public/                # 静态资源
│   ├── src/
│   │   ├── components/        # 通用组件
│   │   ├── contexts/          # React Context 状态管理
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API 服务层
│   │   ├── main.jsx           # 入口文件
│   │   ├── App.jsx            # 路由配置
│   │   └── index.css          # 全局样式
│   ├── index.html             # HTML 模板
│   ├── vite.config.js         # Vite 配置（含代理）
│   ├── tailwind.config.js     # TailwindCSS 配置
│   ├── postcss.config.js      # PostCSS 配置
│   ├── nginx.conf             # Nginx 配置（生产部署）
│   ├── Dockerfile             # 前端容器构建
│   └── package.json
├── backend/                   # 后端项目
│   ├── app/
│   │   ├── __init__.py        # 应用工厂函数
│   │   ├── models.py          # 数据模型
│   │   └── routes/            # API 路由蓝图
│   │       ├── auth.py
│   │       ├── records.py
│   │       └── stats.py
│   ├── config.py              # 配置类
│   ├── run.py                 # 启动入口
│   ├── requirements.txt       # Python 依赖
│   └── Dockerfile             # 后端容器构建
├── docker-compose.yml         # Docker 编排
└── README.md
```

## 操作步骤

### 1. 初始化前端

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom axios recharts lucide-react date-fns
npm install -D tailwindcss autoprefixer postcss
npx tailwindcss init -p
```

### 2. 配置 TailwindCSS

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. 初始化后端

```bash
mkdir -p backend/app/routes
cd backend
python -m venv venv
source venv/bin/activate
```

```txt
# requirements.txt
Flask>=3.0
Flask-SQLAlchemy>=3.1
Flask-JWT-Extended>=4.6
Flask-CORS>=4.0
Werkzeug>=3.0
```

```bash
pip install -r requirements.txt
```

### 4. 创建基础配置文件

```python
# backend/config.py
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///data/app.db')
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
```

## 关键设计原则

- **前后端完全分离**：独立目录、独立构建、独立部署
- **环境配置外置**：通过环境变量或配置文件管理，不硬编码
- **目录职责单一**：components 只放组件，pages 只放页面，services 只放 API 调用