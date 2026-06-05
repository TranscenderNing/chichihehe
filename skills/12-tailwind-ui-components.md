# Skill 12 — Tailwind CSS UI 组件

## 目标
使用 Tailwind CSS 构建移动端优先的响应式 UI 组件库。

## 安装配置

```bash
# 安装
npm install -D tailwindcss @tailwindcss/vite
```

```javascript
// vite.config.js
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()]
})
```

```css
/* src/index.css */
@import "tailwindcss";

/* 自定义主色调 */
:root {
  --color-primary: #ec4899;  /* 粉色主题 */
  --color-primary-hover: #db2777;
}
```

## 核心组件模板

### 导航栏（Header）

```jsx
function Header({ onMenuToggle }) {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={onMenuToggle} className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">吃吃喝喝</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{user?.username}</span>
        </div>
      </div>
    </header>
  )
}
```

### 记录卡片

```jsx
function RecordCard({ record, onClick }) {
  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer
                 hover:shadow-md transition-shadow">
      {/* 封面图 */}
      <div className="aspect-[4/3] bg-gray-100">
        {record.cover ? (
          <img src={record.cover.url} alt={record.title}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            📷 暂无图片
          </div>
        )}
      </div>

      {/* 信息区 */}
      <div className="p-3">
        <h3 className="font-medium text-gray-800 truncate">{record.title}</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm">{record.rating || '-'}</span>
          </div>
          {record.price > 0 && (
            <span className="text-sm text-pink-500 font-medium">
              ¥{record.price}
            </span>
          )}
          {record.city && (
            <span className="text-xs text-gray-400">{record.city}</span>
          )}
        </div>
      </div>
    </div>
  )
}
```

### 侧边栏（Drawer）

```jsx
function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      {/* 抽屉 */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white z-50
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <SidebarItem icon="🏠" label="首页" to="/" />
            <SidebarItem icon="🍜" label="吃吃" to="/eat" />
            <SidebarItem icon="☕" label="喝喝" to="/drink" />
            <SidebarItem icon="👀" label="看看" to="/watch" />
            <SidebarItem icon="🎵" label="听听" to="/listen" />
          </nav>
        </div>

        <button onClick={logout}
          className="absolute bottom-4 left-4 right-4 py-2 text-red-500
                     border border-red-200 rounded-lg hover:bg-red-50">
          退出登录
        </button>
      </aside>
    </>
  )
}
```

### 模态框（Modal）

```jsx
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh]
                      overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
```

## Tailwind CSS 常用工具类速查

| 类别 | 工具类示例 | 说明 |
|------|-----------|------|
| 布局 | `flex`, `grid`, `gap-4` | Flex/Grid 布局 |
| 间距 | `p-4`, `m-2`, `px-6` | padding/margin |
| 圆角 | `rounded-lg`, `rounded-2xl`, `rounded-full` | 圆角大小 |
| 阴影 | `shadow-sm`, `shadow-md`, `shadow-lg` | 阴影层级 |
| 响应式 | `sm:`, `md:`, `lg:` | 断点前缀 |
| 动画 | `transition-all`, `duration-300`, `hover:scale-105` | 过渡动画 |
| 截断 | `truncate`, `line-clamp-3` | 文本溢出处理 |