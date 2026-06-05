# Skill 06 — 端口规划与代理配置

## 目标
合理规划开发/生产环境的端口分配，配置代理实现前后端通信。

## 端口分配方案

| 端口 | 服务 | 环境 | 说明 |
|------|------|------|------|
| 80 | Nginx | 生产 | 对外 Web 入口，托管静态文件 + 反向代理 |
| 3000 | Vite Dev Server | 开发 | 前端开发服务器，HMR 热更新 |
| 8000 | Flask | 开发&生产 | 后端 API 服务 |

## 开发环境：Vite Proxy 代理

```javascript
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',    // 允许外部访问
    port: 3000,          // 前端端口
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // 后端地址
        changeOrigin: true,               // 修改 Origin 头
        // rewrite: (path) => path,       // 如需路径重写可取消注释
      }
    }
  }
})
```

**工作原理：**
```
浏览器 → http://localhost:3000/api/records
    ↓ Vite 拦截 /api 前缀请求
    ↓ 转发到 http://localhost:8000/api/records
    ↓ 浏览器认为请求发往 localhost:3000（同源）→ 无跨域
```

## 生产环境：Nginx 反向代理

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;  # SPA 路由回退
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:8000;     # Docker 服务名解析
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 16m;           # 文件上传大小限制
    }
}
```

**工作原理：**
```
浏览器 → http://server-ip:80/
    ├── / (静态页面) → Nginx 直接返回 index.html
    └── /api/* → Nginx 转发到 backend 容器:8000
        → 对外只暴露 80 端口 → 无跨域
```

## 后端端口配置

```python
# backend/run.py
import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))  # 环境变量可覆盖
    app.run(host='0.0.0.0', port=port, debug=True)
```

```dockerfile
# backend/Dockerfile
ENV PORT=8000
EXPOSE $PORT
CMD ["python", "run.py"]
```

## Docker Compose 端口映射

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"    # 可选：调试时暴露后端端口

  frontend:
    build: ./frontend
    ports:
      - "80:80"        # 生产只暴露 80
    depends_on:
      - backend
```

## 端口选择原则

- **前端开发端口**：3000/5173（Vite 默认），易于识别
- **后端端口**：8000/5000，避开常用端口冲突
- **生产对外端口**：80（HTTP）/ 443（HTTPS），标准 Web 端口
- **Docker 内部**：使用服务名（`backend`）而非 `localhost` 进行容器间通信