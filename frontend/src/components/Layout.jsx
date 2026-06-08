import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, BarChart3, User, PlusCircle, Camera } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/gallery', icon: Camera, label: '图片墙' },
    { path: '/search', icon: Search, label: '搜索' },
    { path: '/stats', icon: BarChart3, label: '回忆统计' },
    { path: '/profile', icon: User, label: '我们' },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-primary-100 flex-col z-40 shadow-soft">
        <div className="p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-300 to-accent-300 text-white shadow-card mb-4">
            <HeartLogo />
          </div>
          <h1 className="text-2xl font-bold text-love-ink">ning&&bobo</h1>
          <p className="text-sm text-primary-500 mt-1">我们的恋爱记忆册</p>
        </div>
        <nav className="flex-1 px-4">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 transition-all duration-200 cursor-pointer ${
                  isActive ? 'bg-primary-100 text-primary-600 font-medium shadow-card' : 'text-love-ink/70 hover:bg-white hover:text-primary-500'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <button
            onClick={() => navigate('/records/new')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-400 to-accent-400 text-white py-3 rounded-2xl hover:shadow-soft transition-all duration-200 cursor-pointer"
          >
            <PlusCircle size={20} />
            <span>记录新回忆</span>
          </button>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-primary-100 flex justify-around items-center h-16 z-40 shadow-soft">
        {navItems.slice(0, 4).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-2 transition-colors cursor-pointer ${
                isActive ? 'text-primary-500' : 'text-love-ink/45'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => navigate('/records/new')}
          className="flex flex-col items-center gap-1 py-2 px-2 text-primary-500 cursor-pointer"
        >
          <PlusCircle size={20} />
          <span className="text-xs">记录</span>
        </button>
      </nav>
    </div>
  )
}

function HeartLogo() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path
        d="M12 20.2s-7.2-4.5-9.3-9A5.2 5.2 0 0 1 12 5.7a5.2 5.2 0 0 1 9.3 5.5c-2.1 4.5-9.3 9-9.3 9Z"
        fill="currentColor"
      />
    </svg>
  )
}
