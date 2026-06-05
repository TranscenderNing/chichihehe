# Skill 04 — JWT 认证系统

## 目标
实现 Access Token + Refresh Token 双令牌认证机制，含前端拦截器和路由守卫。

## 认证流程

```
用户登录 → 后端验证密码 → 生成 Access Token (2h) + Refresh Token (7d)
    ↓
前端存储到 localStorage
    ↓
每次请求：拦截器自动注入 Authorization: Bearer <token>
    ↓
后端 @jwt_required() 装饰器验证 Token
    ↓
Access Token 过期 → 自动用 Refresh Token 刷新 → 重新发起请求
    ↓
Refresh Token 过期 → 跳转登录页
```

## 后端：JWT 配置与路由

```python
# backend/app/__init__.py 中 JWT 配置
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 7200      # Access Token 2小时
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 604800    # Refresh Token 7天
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'
```

```python
# backend/app/routes/auth.py — 登录接口
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not check_password_hash(user.password_hash, data.get('password')):
        return jsonify({'code': 401, 'message': '邮箱或密码错误'}), 401
    
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'code': 200,
        'message': '登录成功',
        'data': {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }
    })

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """使用 Refresh Token 刷新 Access Token"""
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=user_id)
    return jsonify({
        'code': 200,
        'data': {'access_token': new_access_token}
    })
```

## 前端：Axios 拦截器（核心）

```javascript
// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截器：自动注入 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：自动刷新过期 Token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    // 401 且未重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 防止多个请求同时刷新
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const res = await axios.post('/api/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        })
        const newToken = res.data.data.access_token
        localStorage.setItem('access_token', newToken)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Token 完全失效，清除并跳转登录
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default api
```

## 前端：路由守卫（PrivateRoute）

```jsx
// src/App.jsx
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">加载中...</div>
  return user ? children : <Navigate to="/login" replace />
}
```

## 安全要点

| 措施 | 实现方式 |
|------|---------|
| 密码加密 | `werkzeug.security.generate_password_hash()` 哈希存储 |
| Token 无状态 | 服务端不存储 Token，适合分布式 |
| 自动注入 | 请求拦截器，业务代码无感知 |
| 自动刷新 | 响应拦截器，401 时静默刷新 |
| 防并发刷新 | isRefreshing 队列，避免多请求同时刷新 |
| 路由保护 | 前端 PrivateRoute + 后端 @jwt_required() 双重防护 |