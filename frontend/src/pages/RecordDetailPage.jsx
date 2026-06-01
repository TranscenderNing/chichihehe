import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Edit2, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react'
import api from '../services/api'
import RatingStars from '../components/RatingStars'

export default function RecordDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecord()
  }, [id])

  const loadRecord = async () => {
    try {
      const res = await api.get(`/records/${id}`)
      setRecord(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    try {
      const res = await api.post(`/records/${id}/favorite`)
      setRecord({ ...record, is_favorite: res.data.is_favorite })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定删除这条记录吗？')) return
    try {
      await api.delete(`/records/${id}`)
      navigate(-1)
    } catch (err) {
      alert('删除失败')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>
  if (!record) return <div className="text-center py-12 text-gray-400">记录不存在</div>

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <button onClick={toggleFavorite} className="text-gray-400 hover:text-red-400">
            <Heart size={20} className={record.is_favorite ? 'fill-red-400 text-red-400' : ''} />
          </button>
          <button onClick={() => navigate(`/records/edit/${id}`)} className="text-gray-400 hover:text-blue-400">
            <Edit2 size={18} />
          </button>
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* 图片展示 */}
      {record.photos && record.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {record.photos.map(photo => (
            <img
              key={photo.id}
              src={photo.url}
              alt=""
              className="w-64 h-48 object-cover rounded-xl flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* 标题和分类 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {record.category && (
            <span className="text-sm bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              {record.category.icon} {record.category.sub_type}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{record.title}</h1>
      </div>

      {/* 评分 */}
      <RatingStars rating={record.rating} readonly size={24} />

      {/* 信息卡片 */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
        {record.address && (
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span>{record.address}</span>
          </div>
        )}
        {record.city && (
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span>{record.city}</span>
          </div>
        )}
        {record.record_date && (
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span>{record.record_date}</span>
          </div>
        )}
        {record.price > 0 && (
          <div className="flex items-center gap-3 text-gray-600">
            <DollarSign size={16} className="text-gray-400" />
            <span>¥{record.price}</span>
          </div>
        )}
        {record.artist && (
          <div className="flex items-center gap-3 text-gray-600">
            <span className="text-gray-400">🎨</span>
            <span>{record.artist}</span>
          </div>
        )}
      </div>

      {/* 标签 */}
      {record.tags && record.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {record.tags.map(tag => (
            <span key={tag.id} className="text-sm text-accent-500 bg-accent-50 px-3 py-1 rounded-full">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* 评价内容 */}
      {record.content && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-medium text-gray-700 mb-3">评价</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{record.content}</p>
        </div>
      )}
    </div>
  )
}
