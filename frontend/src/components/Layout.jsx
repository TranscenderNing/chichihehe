import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, BarChart3, User, PlusCircle } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/search', icon: Search, label: '搜索' },
    { path: '/stats', icon: BarChart3, label: '统计' },
    { path: '/profile', icon: User, label: '我的' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pl-64">
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex-col z-40">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">🍽️ 吃吃喝喝</h1>
          <p className="text-sm text-gray-400 mt-1">看看听听记录评分</p>
        </div>
        <nav className="flex-1 px-4">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-400 font-medium' : 'text-gray-600 hover:bg-gray-50'
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
            className="w-full flex items-center justify-center gap-2 bg-primary-400 text-white py-3 rounded-lg hover:bg-primary-500 transition-colors"
          >
            <PlusCircle size={20} />
            <span>新建记录</span>
          </button>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 z-40">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-3 ${
                isActive ? 'text-primary-400' : 'text-gray-400'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => navigate('/records/new')}
          className="flex flex-col items-center gap-1 py-2 px-3 text-primary-400"
        >
          <PlusCircle size={20} />
          <span className="text-xs">记录</span>
        </button>
      </nav>
    </div>
  )
}
