import { useState } from 'react'
import { Search } from 'lucide-react'
import api from '../services/api'
import RecordCard from '../components/RecordCard'

export default function SearchPage() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!keyword.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const res = await api.get('/records', {
        params: { keyword: keyword.trim(), per_page: 50 }
      })
      setResults(res.data.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">搜索</h2>

      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="搜索记录名称、内容..."
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
        />
      </form>

      {/* 搜索结果 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">搜索中...</div>
      ) : searched ? (
        results.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">找到 {results.length} 条结果</p>
            {results.map(record => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">没有找到相关记录</div>
        )
      ) : (
        <div className="text-center py-12 text-gray-300">
          <Search size={48} className="mx-auto mb-3" />
          <p>输入关键词搜索你的记录</p>
        </div>
      )}
    </div>
  )
}
