import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../services/api'
import RatingStars from '../components/RatingStars'
import ImageUploader from '../components/ImageUploader'

export default function NewRecordPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    content: '',
    rating: 0,
    price: '',
    address: '',
    city: '',
    artist: '',
    record_date: '',
    tags: '',
    photos: [],
  })

  useEffect(() => {
    api.get('/records/categories').then(res => {
      setCategories(res.data)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        category_id: parseInt(form.category_id),
        price: form.price ? parseFloat(form.price) : 0,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      await api.post('/records', payload)
      navigate(-1)
    } catch (err) {
      alert(err.message || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.name]) acc[cat.name] = []
    acc[cat.name].push(cat)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">新建记录</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
        {/* 分类选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
          <select
            value={form.category_id}
            onChange={e => setForm({ ...form, category_id: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">请选择分类</option>
            {Object.entries(groupedCategories).map(([name, cats]) => (
              <optgroup key={name} label={name}>
                {cats.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.sub_type}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标题 *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="给这次体验起个名字"
          />
        </div>

        {/* 评分 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
          <RatingStars rating={form.rating} onChange={r => setForm({ ...form, rating: r })} />
        </div>

        {/* 图片上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">图片</label>
          <ImageUploader
            images={form.photos}
            onChange={photos => setForm({ ...form, photos })}
          />
        </div>

        {/* 价格 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">价格 (元)</label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="人均消费"
            min="0"
            step="0.01"
          />
        </div>

        {/* 地址 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">地址</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="店铺/场所地址"
          />
        </div>

        {/* 城市 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
          <input
            type="text"
            value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="所在城市"
          />
        </div>

        {/* 艺术家/导演 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">艺术家/导演</label>
          <input
            type="text"
            value={form.artist}
            onChange={e => setForm({ ...form, artist: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="适用于看/听分类"
          />
        </div>

        {/* 日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
          <input
            type="date"
            value={form.record_date}
            onChange={e => setForm({ ...form, record_date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="用逗号分隔，如：日料,精致,约会"
          />
        </div>

        {/* 评价 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">评价</label>
          <textarea
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
            placeholder="写下你的感受..."
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-400 text-white py-3 rounded-lg font-medium hover:bg-primary-500 disabled:opacity-50 transition-colors"
        >
          {loading ? '保存中...' : '保存记录'}
        </button>
      </form>
    </div>
  )
}
