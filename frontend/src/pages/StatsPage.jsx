import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

export default function StatsPage() {
  const [overview, setOverview] = useState(null)
  const [yearly, setYearly] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadStats()
  }, [year])

  const loadStats = async () => {
    try {
      const [overviewRes, yearlyRes] = await Promise.all([
        api.get('/stats/overview'),
        api.get('/stats/yearly', { params: { year } }),
      ])
      setOverview(overviewRes.data)
      setYearly(yearlyRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  const monthlyChartData = yearly ? 
    Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}月`,
      count: yearly.monthly_data[i + 1] || 0
    })) : []

  const categoryChartData = yearly ?
    Object.entries(yearly.category_data).map(([name, value]) => ({ name, value })) : []

  const ratingChartData = yearly ?
    Object.entries(yearly.rating_distribution).map(([rating, count]) => ({
      rating: `${rating}分`,
      count
    })) : []

  const cityChartData = yearly ?
    Object.entries(yearly.city_distribution).map(([city, count]) => ({ city, count })) : []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">统计分析</h2>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
      </div>

      {/* 总览卡片 */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-primary-400">{overview.total_records}</div>
            <div className="text-sm text-gray-400 mt-1">总记录数</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-accent-400">{overview.avg_rating}</div>
            <div className="text-sm text-gray-400 mt-1">平均评分</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-400">¥{overview.total_spent.toFixed(0)}</div>
            <div className="text-sm text-gray-400 mt-1">总消费</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-yellow-500">{overview.favorites}</div>
            <div className="text-sm text-gray-400 mt-1">收藏数</div>
          </div>
        </div>
      )}

      {/* 月度趋势 */}
      {monthlyChartData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-medium text-gray-800 mb-4">月度趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 分类占比 */}
      {categoryChartData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-medium text-gray-800 mb-4">分类占比</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 评分分布 */}
      {ratingChartData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-medium text-gray-800 mb-4">评分分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 城市分布 */}
      {cityChartData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-medium text-gray-800 mb-4">城市分布 TOP 10</h3>
          <div className="space-y-2">
            {cityChartData.map((item, index) => (
              <div key={item.city} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-6">{index + 1}</span>
                <span className="text-sm text-gray-700 flex-1">{item.city}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-400 rounded-full"
                    style={{ width: `${(item.count / cityChartData[0].count) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 年度消费 */}
      {yearly && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-medium text-gray-800 mb-2">年度总消费</h3>
          <p className="text-3xl font-bold text-primary-400">¥{yearly.total_spent.toFixed(2)}</p>
        </div>
      )}
    </div>
  )
}
