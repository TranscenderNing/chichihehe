# Skill 13 — 部署检查清单

## 目标
确保项目在部署前完成所有必要配置，避免常见上线问题。

## 部署前检查清单

### 🔐 安全配置

- [ ] 修改 `SECRET_KEY` 为随机强密码（`python -c "import secrets; print(secrets.token_hex(32))"`）
- [ ] 修改 `JWT_SECRET_KEY` 为独立的随机强密码
- [ ] 设置 `FLASK_DEBUG=0`（关闭调试模式）
- [ ] CORS 限制 `origins` 为具体域名，不要用 `"*"`
- [ ] 确保 `.env` 文件不提交到 Git（加入 `.gitignore`）

### 🗄️ 数据库

- [ ] SQLite 文件路径配置正确，挂载到 Docker Volume
- [ ] 首次启动自动建表（`db.create_all()`）
- [ ] 默认分类数据已初始化（`init_default_data()`）
- [ ] 数据库文件有读写权限

### 📁 文件上传

- [ ] `uploads/` 目录已创建并有写权限
- [ ] Docker Volume 挂载 `/app/uploads`
- [ ] Flask `MAX_CONTENT_LENGTH` 与 Nginx `client_max_body_size` 一致（如 16m）
- [ ] 文件名使用 UUID 避免冲突

### 🌐 Nginx 配置

- [ ] `try_files $uri $uri/ /index.html` 配置正确（SPA 路由回退）
- [ ] `/api/` 反向代理指向 `backend:8000`
- [ ] `proxy_set_header` 传递真实 IP
- [ ] `client_max_body_size` 匹配后端上传限制
- [ ] Gzip 压缩已启用（可选优化）

### 🐳 Docker

- [ ] 前端多阶段构建，最终镜像只有 Nginx + 静态文件
- [ ] `depends_on` + `healthcheck` 确保启动顺序
- [ ] `restart: unless-stopped` 自动恢复
- [ ] 端口映射正确（生产只暴露 80）
- [ ] `.env` 文件已创建

### 🔌 前端构建

- [ ] `vite.config.js` 中 `base: './'`（相对路径，避免子目录问题）
- [ ] 生产构建：`npm run build` 无报错
- [ ] `dist/` 目录包含 `index.html` 和静态资源
- [ ] API 请求路径使用相对路径 `/api/*`（不硬编码 `localhost`）

### 🧪 上线验证

```bash
# 1. 构建并启动
docker-compose up -d --build

# 2. 检查容器状态
docker-compose ps
# 两个容器都应该是 "Up" 状态

# 3. 检查后端健康
curl http://localhost/api/health
# 应返回 {"code": 200, "message": "OK"}

# 4. 检查前端页面
curl -I http://localhost/
# 应返回 200 OK

# 5. 检查 API 代理
curl http://localhost/api/auth/register \
  -X POST -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'

# 6. 查看日志
docker-compose logs -f --tail=50
```

### 🔧 常见问题排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 前端白屏 | `base` 配置错误 | 设置 `base: './'` |
| 502 Bad Gateway | 后端未启动 | 检查 backend 容器日志 |
| 404 刷新页面 | SPA 路由未回退 | Nginx 配置 `try_files` |
| 413 Request Entity Too Large | 上传超限 | 同步 Flask + Nginx 大小限制 |
| CORS 错误 | 代理未生效 | 检查 Nginx location 规则 |
| Token 过期频繁 | JWT 配置过短 | 调整 ACCESS_TOKEN_EXPIRES |
| 数据丢失 | Volume 未挂载 | 检查 docker-compose volumes |
| 容器重启循环 | 启动依赖未满足 | 添加 healthcheck |