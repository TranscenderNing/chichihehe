import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Mail, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">个人中心</h2>

      {/* 用户信息卡片 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-300 to-accent-300 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{user.username}</h3>
            <p className="text-sm text-gray-400">{user.bio || '这个人很懒，还没有写简介'}</p>
          </div>
        </div>
      </div>

      {/* 信息列表 */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        <div className="flex items-center gap-3 px-6 py-4">
          <User size={18} className="text-gray-400" />
          <span className="text-sm text-gray-500">用户名</span>
          <span className="ml-auto text-sm text-gray-700">{user.username}</span>
        </div>
        <div className="flex items-center gap-3 px-6 py-4">
          <Mail size={18} className="text-gray-400" />
          <span className="text-sm text-gray-500">邮箱</span>
          <span className="ml-auto text-sm text-gray-700">{user.email}</span>
        </div>
        <div className="flex items-center gap-3 px-6 py-4">
          <Calendar size={18} className="text-gray-400" />
          <span className="text-sm text-gray-500">注册时间</span>
          <span className="ml-auto text-sm text-gray-700">
            {new Date(user.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>

      {/* 退出登录 */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-400 py-3 rounded-xl hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} />
        <span>退出登录</span>
      </button>
    </div>
  )
}
