# 吃吃喝喝看看听听记录评分 - 产品设计文档

## 1. 产品架构设计

### 产品模块图

```
┌─────────────────────────────────────────────────────┐
│                  吃吃喝喝看看听听                       │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ 用户模块  │ 记录模块  │ 统计模块  │ 搜索模块  │ 社交模块 │
├──────────┼──────────┼──────────┼──────────┼─────────┤
│ 注册登录  │ 吃(餐厅)  │ 月度统计  │ 关键词搜索│ 分享    │
│ 个人主页  │ 喝(饮品)  │ 年度统计  │ 标签搜索  │ 点赞    │
│ 用户设置  │ 看(影视)  │ 评分分布  │ 分类筛选  │ 评论    │
│          │ 听(音乐)  │ 消费统计  │          │ 关注    │
└──────────┴──────────┴──────────┴──────────┴─────────┘
```

### 功能架构图

```
Frontend (React)
    ├── 页面层 (Pages)
    │   ├── LoginPage
    │   ├── HomePage
    │   ├── RecordListPage
    │   ├── NewRecordPage
    │   ├── DetailPage
    │   ├── SearchPage
    │   ├── StatsPage
    │   └── ProfilePage
    ├── 组件层 (Components)
    │   ├── RecordCard
    │   ├── RatingStars
    │   ├── TagList
    │   ├── ImageUploader
    │   ├── StatsChart
    │   └── Navigation
    └── 服务层 (Services)
        ├── AuthService
        ├── RecordService
        ├── StatsService
        └── UploadService

Backend (Flask)
    ├── API层 (Routes)
    │   ├── auth_routes
    │   ├── record_routes
    │   ├── stats_routes
    │   └── upload_routes
    ├── 业务层 (Services)
    │   ├── UserService
    │   ├── RecordService
    │   ├── StatsService
    │   └── FileService
    └── 数据层 (Models)
        ├── User
        ├── Record
        ├── Category
        ├── Tag
        ├── Rating
        └── Photo

Database (SQLite)
    ├── users
    ├── records
    ├── categories
    ├── tags
    ├── record_tags
    ├── ratings
    ├── photos
    └── comments
```

### 用户流程图

```
注册/登录 → 首页(四宫格入口) → 选择分类 → 新建记录
                ↓                              ↓
           浏览记录列表 ← ← ← ← ← ← ← 保存成功
                ↓
           查看详情 → 编辑/删除
                ↓
           统计分析 → 年度报告
```

## 2. 前端设计

### 页面列表与布局

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录页 | /login | 登录注册 |
| 首页 | / | 四宫格入口+最近记录 |
| 记录列表 | /records/:category | 分类记录列表 |
| 新建记录 | /records/new | 表单页 |
| 详情页 | /records/:id | 记录详情 |
| 搜索页 | /search | 全局搜索 |
| 统计页 | /stats | 数据可视化 |
| 用户中心 | /profile | 个人信息 |

### UI设计建议

- 风格：豆瓣+Notion简约风，大量留白，卡片式布局
- 配色：主色 #FF6B6B（暖红），辅色 #4ECDC4（青绿），背景 #FAFAFA
- 字体：系统默认字体栈，标题加粗
- 响应式：移动端底部Tab导航，桌面端侧边栏

## 3. 后端接口设计

### 用户模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| GET | /api/auth/profile | 获取用户信息 |
| PUT | /api/auth/profile | 更新用户信息 |

### 记录模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/records | 获取记录列表（支持分页、筛选） |
| POST | /api/records | 创建记录 |
| GET | /api/records/:id | 获取记录详情 |
| PUT | /api/records/:id | 更新记录 |
| DELETE | /api/records/:id | 删除记录 |

### 统计模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/stats/overview | 总览统计 |
| GET | /api/stats/monthly | 月度统计 |
| GET | /api/stats/yearly | 年度统计 |

### 上传模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/upload | 上传图片 |

### 错误码设计

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 返回结构

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 4. 数据库设计

### ER图

```
users 1──N records N──M tags
  │         │
  │         ├── 1──N photos
  │         │
  │         └── 1──1 ratings
  │
  └── 1──N comments
```

### 数据表结构

见 backend/migrations/ 中的建表SQL。

## 5. 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端 | React + Vite | 组件化开发，生态成熟，Vite构建快 |
| 后端 | Flask | 轻量Python框架，适合中小项目 |
| 数据库 | SQLite | 零配置，单文件部署，适合个人项目 |
| 认证 | JWT | 无状态认证，前后端分离友好 |
| 图表 | Recharts | React原生图表库 |
| 样式 | TailwindCSS | 原子化CSS，快速开发 |

## 6. 前后端交互方案

- **认证**：JWT Token，存储在localStorage
- **Token刷新**：Access Token 2小时过期，Refresh Token 7天
- **文件上传**：multipart/form-data，存储在本地 uploads/ 目录
- **分页**：page + per_page 参数，返回 total 和 items
- **搜索**：关键词 + 标签 + 分类组合搜索

## 7. 部署方案

- Docker Compose 一键部署
- Nginx 反向代理 + HTTPS (Let's Encrypt)
- 日志：Python logging → 文件
- 备份：SQLite 数据库文件定时 cp 备份
- 监控：健康检查接口 /api/health
