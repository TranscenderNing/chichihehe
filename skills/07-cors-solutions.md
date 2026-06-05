# Skill 07 — 跨域解决方案

## 目标
理解跨域问题的产生原因，掌握开发和生产环境的三种解决方案。

## 什么是跨域

浏览器**同源策略**限制：当请求的 **协议、域名、端口** 任一不同时，即为跨域。

```
前端: http://localhost:3000  ←→  后端: http://localhost:8000
       ↑ 端口不同 → 跨域！
```

## 方案一：Vite Proxy（开发环境推荐）

```javascript
// frontend/vite.config.js
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

**原理**：Vite 服务器代理请求，浏览器只与 localhost:3000 通信（同源）。
**优点**：零配置跨域，对前端代码透明。
**适用**：本地开发环境。

## 方案二：Nginx 反向代理（生产环境推荐）

```nginx
# frontend/nginx.conf
server {
    listen 80;

    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**原理**：Nginx 同时服务前端静态文件和后端 API，对外只暴露一个端口。
**优点**：无跨域问题，安全，隐藏后端端口。
**适用**：生产环境 Docker 部署。

## 方案三：Flask-CORS 中间件（兜底方案）

```python
# backend/app/__init__.py
from flask_cors import CORS

# 允许所有来源访问 /api/* 路径
CORS(app, resources={r"/api/*": {"origins": "*"}})

# 生产环境建议限制来源
CORS(app, resources={r"/api/*": {
    "origins": ["https://yourdomain.com", "http://localhost:3000"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})
```

**原理**：后端响应添加 `Access-Control-Allow-Origin` 等响应头。
**优点**：简单直接，即使直接访问后端端口也能跨域。
**缺点**：暴露后端端口，安全性较低。
**适用**：作为兜底方案，或需要第三方调用 API 时。

## 三种方案对比

| 特性 | Vite Proxy | Nginx Proxy | Flask-CORS |
|------|-----------|-------------|-----------|
| 适用环境 | 开发 | 生产 | 任何 |
| 跨域消除方式 | 服务端代理 | 服务端代理 | 响应头放行 |
| 浏览器感知跨域 | 否 | 否 | 是 |
| 暴露后端端口 | 否 | 否 | 是 |
| 安全性 | 高 | 高 | 中 |
| 配置位置 | vite.config.js | nginx.conf | Flask 代码 |

## 最佳实践

```
开发环境：Vite Proxy（方案一）+ Flask-CORS（方案三兜底）
生产环境：Nginx Proxy（方案二）+ Flask-CORS（方案三兜底）
```

三层防护确保任何场景下都不会出现跨域问题。