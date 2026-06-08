import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Heart, ImageOff, Search } from 'lucide-react'
import api from '../services/api'

export default function GalleryPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [activePhoto, setActivePhoto] = useState(null)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const res = await api.get('/records', { params: { per_page: 100, sort: 'record_date', order: 'desc' } })
      setRecords(res.data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const photos = useMemo(() => {
    return records
      .filter(record => !keyword.trim() || record.title?.includes(keyword.trim()) || record.tags?.some(tag => tag.name.includes(keyword.trim())))
      .flatMap(record => {
        const cover = record.cover ? [record.cover] : []
        return cover.map(photo => ({
          id: `${record.id}-${photo.id}`,
          url: photo.url,
          title: record.title,
          recordId: record.id,
          date: record.record_date,
          rating: record.rating,
          tags: record.tags || [],
          category: record.category,
        }))
      })
  }, [records, keyword])

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white/75 backdrop-blur-xl border border-white shadow-soft p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-200/60 blur-2xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 mb-4">
            <Camera size={16} />
            Photo Wall
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-love-ink">我们的图片墙</h2>
          <p className="text-love-ink/60 mt-3 max-w-2xl">
            把一起走过的地方、吃过的甜点和所有可爱的瞬间，拼成一面只属于 ning 和 bobo 的照片墙。
          </p>
        </div>
      </section>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300" />
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="w-full rounded-2xl border border-primary-100 bg-white/80 py-3 pl-11 pr-4 text-love-ink placeholder:text-love-ink/35 focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="按标题或标签搜索照片"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-love-ink/45">正在整理照片...</div>
      ) : photos.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-[1.5rem] bg-white/80 border border-white shadow-card hover:shadow-soft transition-all duration-200 cursor-pointer text-left"
            >
              <div className="relative overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.title}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${index % 3 === 0 ? 'h-64' : index % 3 === 1 ? 'h-48' : 'h-56'}`}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-love-ink/60 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="font-medium truncate">{photo.title}</div>
                  {photo.date && <div className="text-xs opacity-85 mt-1">{photo.date}</div>}
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-love-ink">
                  <Heart size={15} className="text-primary-400 fill-primary-300" />
                  <span className="truncate">{photo.title}</span>
                </div>
                {photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {photo.tags.slice(0, 2).map(tag => (
                      <span key={tag.id} className="text-xs text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] bg-white/70 border border-white py-16 text-center text-love-ink/50">
          <ImageOff size={44} className="mx-auto mb-4 text-primary-200" />
          <p>还没有可以展示的照片</p>
          <button
            onClick={() => navigate('/records/new')}
            className="mt-4 rounded-2xl bg-primary-400 px-5 py-2.5 text-white hover:bg-primary-500 transition-colors cursor-pointer"
          >
            上传第一张照片
          </button>
        </div>
      )}

      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-love-ink/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div className="max-w-3xl w-full rounded-[1.75rem] bg-white overflow-hidden shadow-soft" onClick={e => e.stopPropagation()}>
            <img src={activePhoto.url} alt={activePhoto.title} className="w-full max-h-[70vh] object-contain bg-love-ink" />
            <div className="p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-love-ink">{activePhoto.title}</h3>
                <p className="text-sm text-love-ink/50 mt-1">{activePhoto.date || '未记录日期'}</p>
              </div>
              <button
                onClick={() => navigate(`/record/${activePhoto.recordId}`)}
                className="rounded-2xl bg-primary-50 px-4 py-2 text-primary-600 hover:bg-primary-100 transition-colors cursor-pointer"
              >
                查看记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
