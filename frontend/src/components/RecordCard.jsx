import { useNavigate } from 'react-router-dom'
import { Heart, MapPin } from 'lucide-react'
import RatingStars from './RatingStars'

export default function RecordCard({ record }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/record/${record.id}`)}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-50"
    >
      <div className="flex gap-4">
        {/* 封面图 */}
        {record.cover && (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={record.cover.url}
              alt={record.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-800 truncate">{record.title}</h3>
            {record.is_favorite && (
              <Heart size={16} className="fill-red-400 text-red-400 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {record.category && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {record.category.icon} {record.category.sub_type}
              </span>
            )}
            {record.city && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <MapPin size={12} />{record.city}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <RatingStars rating={record.rating} size={14} readonly />
            {record.price > 0 && (
              <span className="text-sm text-gray-500">¥{record.price}</span>
            )}
          </div>

          {record.tags && record.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {record.tags.slice(0, 3).map(tag => (
                <span key={tag.id} className="text-xs text-accent-500 bg-accent-50 px-2 py-0.5 rounded">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
