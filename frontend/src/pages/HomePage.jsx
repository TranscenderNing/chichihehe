import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Sparkles, Camera, CalendarDays } from 'lucide-react'
import api from '../services/api'
import RecordCard from '../components/RecordCard'

const CATEGORIES = [
  { name: '吃', title: '一起吃饭', desc: '每一顿饭都有偏爱', color: 'from-rose-100 to-orange-100 text-rose-600 border-rose-100' },
  { name: '喝', title: '一起喝点', desc: '咖啡、奶茶和聊天', color: 'from-orange-100 to-amber-100 text-orange-600 border-orange-100' },
  { name: '看', title: '一起看见', desc: '电影、展览和风景', color: 'from-pink-100 to-purple-100 text-pink-600 border-pink-100' },
  { name: '听', title: '一起听歌', desc: '把心动存进旋律', color: 'from-purple-100 to-rose-100 text-purple-600 border-purple-100' },
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
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white/75 backdrop-blur-xl border border-white shadow-soft p-6 md:p-10">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary-200/60 blur-2xl" />
        <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-accent-200/50 blur-2xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 mb-5">
            <Sparkles size={16} />
            属于 ning 和 bobo 的小宇宙
          </div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight text-love-ink">
            把每一次心动，
            <span className="text-primary-500">都认真收藏</span>
          </h2>
          <p className="text-love-ink/65 mt-4 text-base md:text-lg leading-relaxed">
            记录一起吃过的饭、喝过的饮品、看过的风景和听过的歌，也把照片、日期和小心情留在这里。
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => navigate('/records/new')}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-accent-400 px-5 py-3 text-white font-medium shadow-card hover:shadow-soft transition-all duration-200 cursor-pointer"
            >
              <Heart size={18} />
              记录新回忆
            </button>
            <button
              onClick={() => navigate('/gallery')}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-primary-600 font-medium border border-primary-100 hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
            >
              <Camera size={18} />
              查看图片墙
            </button>
          </div>
        </div>
      </section>

      {/* 分类入口 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => navigate(`/records/${cat.name}`)}
            className={`bg-gradient-to-br ${cat.color} border rounded-[1.5rem] p-5 text-left hover:-translate-y-0.5 hover:shadow-card transition-all duration-200 cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-11 w-11 rounded-2xl bg-white/70 flex items-center justify-center">
                <Heart size={20} className="fill-current" />
              </div>
              {stats?.category_stats?.[cat.name] && (
                <span className="text-xs bg-white/70 px-2 py-1 rounded-full">
                  {stats.category_stats[cat.name]} 条
                </span>
              )}
            </div>
            <div className="font-bold text-lg">{cat.title}</div>
            <div className="text-sm opacity-75 mt-1">{cat.desc}</div>
          </button>
        ))}
      </div>

      {/* 统计摘要 */}
      {stats && (
        <div className="bg-white/75 backdrop-blur-xl rounded-[1.75rem] p-6 border border-white shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays size={20} className="text-primary-500" />
            <h3 className="font-bold text-love-ink">我们的回忆数据</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem value={stats.total_records} label="回忆总数" />
            <StatItem value={stats.avg_rating} label="平均心动值" />
            <StatItem value={`¥${stats.total_spent.toFixed(0)}`} label="一起花费" />
            <StatItem value={stats.favorites} label="特别收藏" />
          </div>
        </div>
      )}

      {/* 最近记录 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-love-ink">最近的小日子</h3>
          <button
            onClick={() => navigate('/search')}
            className="text-sm text-primary-500 hover:text-primary-600 cursor-pointer"
          >
            去搜索
          </button>
        </div>
        {recentRecords.length > 0 ? (
          <div className="space-y-3">
            {recentRecords.map(record => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/60 rounded-[1.75rem] border border-white text-love-ink/50">
            <p>还没有任何回忆</p>
            <button
              onClick={() => navigate('/records/new')}
              className="mt-3 text-primary-500 hover:text-primary-600 cursor-pointer"
            >
              写下第一条属于我们的记录 →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatItem({ value, label }) {
  return (
    <div className="text-center rounded-2xl bg-white/70 p-4 border border-primary-50">
      <div className="text-2xl font-bold text-love-ink">{value}</div>
      <div className="text-sm text-love-ink/45 mt-1">{label}</div>
    </div>
  )
}
