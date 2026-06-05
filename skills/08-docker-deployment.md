# Skill 08 — Docker 容器化部署

## 目标
使用 Docker + Docker Compose 实现一键构建、部署前后端应用。

## 后端 Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝代码
COPY . .

# 创建数据目录
RUN mkdir -p data uploads

# 暴露端口
ENV PORT=8000
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s \
  CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["python", "run.py"]
```

## 前端 Dockerfile（多阶段构建）

```dockerfile
# frontend/Dockerfile
# ── 第一阶段：构建 ──
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build    # 输出到 dist/

# ── 第二阶段：部署 ──
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**多阶段构建优点**：
- 最终镜像只有 Nginx + 静态文件，体积从 ~500MB 降到 ~25MB
- 源码、node_modules 不进入生产镜像

## Docker Compose 编排

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: app-backend
    environment:
      - SECRET_KEY=${SECRET_KEY:-change-me}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY:-change-me}
      - PORT=8000
      - FLASK_DEBUG=0
    volumes:
      - backend-uploads:/app/uploads    # 持久化上传文件
      - backend-db:/app/data             # 持久化数据库
    ports:
      - "8000:8000"  # 调试用，生产可删除
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: app-frontend
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

volumes:
  backend-uploads:
  backend-db:
```

## 部署命令

```bash
# 构建并启动（后台运行）
docker-compose up -d --build

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止服务
docker-compose down

# 停止并删除数据卷（慎用！会删除数据库和上传文件）
docker-compose down -v

# 重新构建单个服务
docker-compose up -d --build backend
```

## 环境变量管理

```bash
# .env 文件（不提交到 Git）
SECRET_KEY=your-production-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

## 部署流程

```
1. 克隆代码到服务器
2. 创建 .env 文件配置密钥
3. docker-compose up -d --build
4. 等待构建完成 + 健康检查通过
5. 访问 http://server-ip 即可
```

## 关键设计要点

| 要点 | 说明 |
|------|------|
| 多阶段构建 | 前端只保留 Nginx + 静态文件，镜像极小 |
| Volume 持久化 | 数据库和上传文件挂载到 Docker Volume，重建容器不丢失 |
| depends_on + healthcheck | 前端等待后端健康后才启动，避免 502 |
| restart: unless-stopped | 服务器重启后自动恢复容器 |
| 环境变量 | 敏感配置通过 .env 注入，不硬编码 |