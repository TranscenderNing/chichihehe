import { useRef } from 'react'
import { Upload, X } from 'lucide-react'
import api from '../services/api'

export default function ImageUploader({ images = [], onChange, max = 9 }) {
  const inputRef = useRef(null)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const newImages = [...images]
    for (const file of files) {
      if (newImages.length >= max) break
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        newImages.push(res.data.url)
      } catch (err) {
        console.error('上传失败', err)
      }
    }
    onChange(newImages)
    e.target.value = ''
  }

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((url, index) => (
        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden group">
          <img src={url} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ))}
      {images.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-400 transition-colors"
        >
          <Upload size={20} />
          <span className="text-xs mt-1">上传</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  )
}
