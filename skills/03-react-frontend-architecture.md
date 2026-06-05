# Skill 03 — React 前端架构设计

## 目标
构建路由驱动、Context 状态管理、API 服务层分离的 React 前端架构。

## 架构分层

```
src/
├── main.jsx              # 入口：挂载根组件
├── App.jsx               # 路由配置 + PrivateRoute
├── components/           # 通用可复用组件（Layout, RecordCard, RatingStars）
├── contexts/             # React Context（AuthContext 管理认证状态）
├── pages/                # 页面组件（每个路由对应一个页面）
└── services/
    └── api.js            # Axios 实例 + 拦截器
```

## 路由配置（App.jsx）

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'

// 路由守卫组件
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<HomePage />} />
            <Route path="records/:category" element={<RecordListPage />} />
            <Route path="records/new" element={<NewRecordPage />} />
            <Route path="record/:id" element={<RecordDetailPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

## AuthContext 状态管理

```jsx
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/auth/profile').then(res => {
        setUser(res.data)
      }).catch(() => {
        localStorage.removeItem('access_token')
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    setUser(res.data.user)
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

## Layout 布局组件

```jsx
// src/components/Layout.jsx
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Search, BarChart3, User, Plus } from 'lucide-react'

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 桌面侧边栏 */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r p-4">
        <h1 className="text-xl font-bold mb-6">🍽️ 吃吃喝喝</h1>
        <nav className="space-y-1">
          <NavLink to="/" className="nav-link"><Home /> 首页</NavLink>
          <NavLink to="/search" className="nav-link"><Search /> 搜索</NavLink>
          <NavLink to="/stats" className="nav-link"><BarChart3 /> 统计</NavLink>
          <NavLink to="/profile" className="nav-link"><User /> 我的</NavLink>
        </nav>
        <NavLink to="/records/new" className="btn-primary mt-auto">
          <Plus /> 新建记录
        </NavLink>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around py-2">
        <NavLink to="/" className="mobile-nav-item"><Home size={20} /></NavLink>
        <NavLink to="/search" className="mobile-nav-item"><Search size={20} /></NavLink>
        <NavLink to="/records/new"><Plus size={24} className="bg-red-500 text-white rounded-full p-1" /></NavLink>
        <NavLink to="/stats" className="mobile-nav-item"><BarChart3 size={20} /></NavLink>
        <NavLink to="/profile" className="mobile-nav-item"><User size={20} /></NavLink>
      </nav>
    </div>
  )
}
```

## 关键设计模式

- **PrivateRoute 路由守卫**：未登录自动跳转 /login
- **Context 全局状态**：user / login / logout 通过 Context 跨组件共享
- **Layout 嵌套路由**：`<Outlet />` 渲染子路由，侧边栏/底部导航共享
- **响应式设计**：`hidden md:flex` 桌面显示侧边栏，移动端显示底部导航