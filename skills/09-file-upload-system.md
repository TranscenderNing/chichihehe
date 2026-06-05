# Skill 09 — 文件上传系统

## 目标
实现图片上传、存储、访问的完整链路。

## 后端：上传 API

```python
# backend/app/routes/upload.py
import os
import uuid
from flask import Blueprint, request, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.utils.response import success, error

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/', methods=['POST'])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return error('没有文件')
    
    file = request.files['file']
    if file.filename == '':
        return error('未选择文件')
    
    if not allowed_file(file.filename):
        return error('不支持的文件格式，仅支持: ' + ', '.join(ALLOWED_EXTENSIONS))
    
    # 生成唯一文件名：UUID + 原始扩展名
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    
    # 返回可访问的 URL
    url = f"/api/upload/files/{filename}"
    return success({'url': url, 'filename': filename}, '上传成功', 201)

@upload_bp.route('/files/<filename>', methods=['GET'])
def get_file(filename):
    """公开访问，无需认证"""
    upload_folder = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_folder, filename)
```

## 前端：上传组件

```jsx
// 前端上传示例
import { useState } from 'react'
import api from '../services/api'

function ImageUploader({ onUpload }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 前端校验大小
    if (file.size > 16 * 1024 * 1024) {
      alert('文件不能超过 16MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const res = await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onUpload(res.data.url)
    } catch (err) {
      alert('上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <label className="cursor-pointer">
      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      {uploading ? '上传中...' : '📷 点击上传图片'}
    </label>
  )
}
```

## 文件存储设计

| 项目 | 说明 |
|------|------|
| 存储位置 | 后端 `uploads/` 目录 |
| 文件命名 | UUID + 扩展名，避免冲突和中文文件名问题 |
| 大小限制 | 16MB（Flask MAX_CONTENT_LENGTH + Nginx client_max_body_size） |
| 格式限制 | png/jpg/jpeg/gif/webp |
| 访问方式 | GET `/api/upload/files/{filename}`，无需认证 |
| Docker 持久化 | Volume 挂载 `/app/uploads` |

## 配置要点

```python
# config.py
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
```

```nginx
# nginx.conf 中需要匹配后端大小限制
location /api/ {
    client_max_body_size 16m;
}