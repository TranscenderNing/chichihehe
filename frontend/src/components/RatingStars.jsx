import { Star } from 'lucide-react'

export default function RatingStars({ rating = 0, onChange, size = 20, readonly = false }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center gap-1">
      {stars.map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            size={size}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-500">{rating}.0</span>
      )}
    </div>
  )
}
