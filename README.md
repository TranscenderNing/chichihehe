# 吃吃喝喝看看听听 - 记录评分

一个个人生活记录与评分平台，用于记录你体验过的餐厅、饮品、电影、音乐等内容，形成个人生活档案。

## 功能特色

- 🍽️ **吃** - 记录餐厅、小吃、外卖、酒吧体验
- ☕ **喝** - 记录咖啡馆、奶茶店、酒馆、茶馆体验
- 🎬 **看** - 记录电影、电视剧、纪录片、话剧、展览
- 🎵 **听** - 记录歌曲、专辑、音乐会、演唱会、播客
- 📊 **统计** - 月度/年度统计、评分分布、城市分布、消费分析
- 🔍 **搜索** - 关键词搜索、分类筛选、标签管理
- ❤️ **收藏** - 标记喜爱的体验

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + TailwindCSS + Recharts |
| 后端 | Flask + Flask-JWT-Extended + SQLAlchemy |
| 数据库 | SQLite |
| 部署 | Docker + Nginx |

## 快速开始

### 开发环境

#### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

后端运行在 http://localhost:5000

#### 前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:3000，API 请求自动代理到后端。

### Docker 部署

```bash
# 一键构建并启动
docker-compose up -d --build

# 访问
# 前端: http://localhost
# 后端API: http://localhost:5000
```

## 项目结构

```
chichihehe/
├── backend/                # Flask 后端
│   ├── app/
│   │   ├── __init__.py     # 应用工厂
│   │   ├── models.py       # 数据模型
│   │   └── routes/         # API 路由
│   │       ├── auth.py     # 认证接口
│   │       ├── records.py  # 记录CRUD
│   │       ├── stats.py    # 统计接口
│   │       └── upload.py   # 文件上传
│   ├── config.py           # 配置
│   ├── run.py              # 启动入口
│   ├── requirements.txt    # Python依赖
│   └── Dockerfile
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── contexts/       # React Context
│   │   ├── pages/          # 页面组件
│   │   └── services/       # API 服务
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── DESIGN.md               # 产品设计文档
└── README.md
```

## API 文档

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/refresh` - 刷新Token
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息

### 记录
- `GET /api/records` - 获取记录列表（支持分页、排序、筛选）
- `POST /api/records` - 创建记录
- `GET /api/records/:id` - 获取记录详情
- `PUT /api/records/:id` - 更新记录
- `DELETE /api/records/:id` - 删除记录
- `POST /api/records/:id/favorite` - 切换收藏
- `GET /api/records/categories` - 获取分类列表
- `GET /api/records/tags` - 获取标签列表

### 统计
- `GET /api/stats/overview` - 总览统计
- `GET /api/stats/monthly` - 月度统计
- `GET /api/stats/yearly` - 年度统计

### 上传
- `POST /api/upload` - 上传图片
- `GET /api/upload/files/:filename` - 获取图片

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| SECRET_KEY | Flask密钥 | dev-secret-key |
| JWT_SECRET_KEY | JWT密钥 | jwt-secret-key |

> ⚠️ 生产环境请务必修改密钥！

## License

MIT
