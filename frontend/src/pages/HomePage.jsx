import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import api from '../services/api'
import RecordCard from '../components/RecordCard'

const CATEGORIES = [
  { name: '吃', icon: '🍽️', color: 'bg-red-50 text-red-500 border-red-100' },
  { name: '喝', icon: '☕', color: 'bg-amber-50 text-amber-500 border-amber-100' },
  { name: '看', icon: '🎬', color: 'bg-blue-50 text-blue-500 border-blue-100' },
  { name: '听', icon: '🎵', color: 'bg-purple-50 text-purple-500 border-purple-100' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [recentRecords, setRecentRecords] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [recordsRes, statsRes] = await Promise.all([
        api.get('/records', { params: { per_page: 5 } }),
        api.get('/stats/overview'),
      ])
      setRecentRecords(recordsRes.data.items)
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      {/* 欢迎头部 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">探索生活的美好 ✨</h2>
        <p className="text-gray-500 mt-1">记录每一次体验</p>
      </div>

      {/* 四宫格入口 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => navigate(`/records/${cat.name}`)}
            className={`${cat.color} border rounded-2xl p-6 text-center hover:shadow-md transition-shadow`}
          >
            <div className="text-4xl mb-2">{cat.icon}</div>
            <div className="font-medium text-lg">{cat.name}</div>
            {stats?.category_stats?.[cat.name] && (
              <div className="text-sm opacity-70 mt-1">
                {stats.category_stats[cat.name]} 条记录
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 统计摘要 */}
      {stats && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-accent-400" />
            <h3 className="font-medium text-gray-800">数据总览</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total_records}</div>
              <div className="text-sm text-gray-400">总记录</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.avg_rating}</div>
              <div className="text-sm text-gray-400">平均评分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">¥{stats.total_spent.toFixed(0)}</div>
              <div className="text-sm text-gray-400">总消费</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.favorites}</div>
              <div className="text-sm text-gray-400">收藏</div>
            </div>
          </div>
        </div>
      )}

      {/* 最近记录 */}
      <div>
        <h3 className="font-medium text-gray-800 mb-4">最近记录</h3>
        {recentRecords.length > 0 ? (
          <div className="space-y-3">
            {recentRecords.map(record => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>还没有任何记录</p>
            <button
              onClick={() => navigate('/records/new')}
              className="mt-3 text-primary-400 hover:text-primary-500"
            >
              创建第一条记录 →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
