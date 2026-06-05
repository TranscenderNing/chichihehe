# Skill 11 — 前端状态管理

## 目标
管理登录态、全局用户信息、主题等全局状态。

## 方案：Context + useReducer

```jsx
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 初始化：检查本地 Token 是否有效
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, refresh_token, user: userData } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser(userData)
    return res
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

## 在 App 中使用

```jsx
// src/App.jsx
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>加载中...</div>
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Home />} />
            <Route path="records" element={<Records />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

## 页面中获取状态

```jsx
// 任何组件中
import { useAuth } from '../contexts/AuthContext'

function Profile() {
  const { user, logout, setUser } = useAuth()

  return (
    <div>
      <h1>{user.username}</h1>
      <button onClick={logout}>退出登录</button>
    </div>
  )
}
```

## 状态管理方案对比

| 方案 | 适用场景 | 复杂度 | 本项目 |
|------|---------|--------|--------|
| useState | 组件内局部状态 | 低 | ✅ 表单、弹窗 |
| Context + useState | 跨组件共享（用户、主题） | 中 | ✅ 全局状态 |
| Redux / Zustand | 大型应用、复杂状态流 | 高 | ❌ 过度设计 |
| React Query / SWR | 服务端状态缓存 | 中 | 可选升级 |

## 关键设计原则

- **服务端状态缓存在组件内**：列表、详情等数据请求后缓存在 useState，不放入全局
- **只把真正全局的状态放入 Context**：登录态、用户信息
- **localStorage 做持久化**：Token 存 localStorage，刷新页面不丢失登录态
- **初始化时验证 Token**：App 加载时调用 `/auth/me` 检查 Token 是否过期