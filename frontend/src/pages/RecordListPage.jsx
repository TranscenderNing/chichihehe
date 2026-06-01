import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Filter, Plus } from 'lucide-react'
import api from '../services/api'
import RecordCard from '../components/RecordCard'

export default function RecordListPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState('desc')

  useEffect(() => {
    loadRecords()
  }, [category, page, sort, order])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const res = await api.get('/records', {
        params: { category, page, per_page: 20, sort, order }
      })
      setRecords(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categoryLabels = { '吃': '🍽️ 吃', '喝': '☕ 喝', '看': '🎬 看', '听': '🎵 听' }

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          {categoryLabels[category] || category} <span className="text-sm font-normal text-gray-400">({total})</span>
        </h2>
        <button
          onClick={() => navigate('/records/new')}
          className="flex items-center gap-1 text-primary-400 hover:text-primary-500"
        >
          <Plus size={18} />
          <span className="text-sm">新增</span>
        </button>
      </div>

      {/* 排序筛选 */}
      <div className="flex items-center gap-3">
        <Filter size={16} className="text-gray-400" />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-200"
        >
          <option value="created_at">创建时间</option>
          <option value="rating">评分</option>
          <option value="price">价格</option>
          <option value="record_date">记录日期</option>
        </select>
        <select
          value={order}
          onChange={e => setOrder(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-200"
        >
          <option value="desc">降序</option>
          <option value="asc">升序</option>
        </select>
      </div>

      {/* 记录列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : records.length > 0 ? (
        <div className="space-y-3">
          {records.map(record => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>暂无记录</p>
          <button
            onClick={() => navigate('/records/new')}
            className="mt-3 text-primary-400"
          >
            添加一条 →
          </button>
        </div>
      )}

      {/* 分页 */}
      {total > 20 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">第 {page} 页</span>
          <button
            disabled={records.length < 20}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
