# Skill 05 — RESTful API 设计

## 目标
设计统一响应格式、分页筛选机制、完整 CRUD 的 RESTful API。

## 统一响应格式

```json
// 成功
{
  "code": 200,
  "message": "success",
  "data": { ... }
}

// 带分页
{
  "code": 200,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "per_page": 20,
    "pages": 5
  }
}

// 错误
{
  "code": 400,
  "message": "参数错误",
  "errors": { "field": "错误详情" }
}
```

## 后端：统一响应工具函数

```python
# backend/app/utils/response.py
from flask import jsonify

def success(data=None, message='success', code=200):
    resp = {'code': code, 'message': message, 'data': data}
    return jsonify(resp), code

def error(message='error', code=400, errors=None):
    resp = {'code': code, 'message': message}
    if errors:
        resp['errors'] = errors
    return jsonify(resp), code

def paginate(query, page=1, per_page=20):
    """通用分页函数"""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        'items': [item.to_brief_dict() for item in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    }
```

## 后端：CRUD 路由模板

```python
# backend/app/routes/records.py
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Record, Category, Tag
from app import db
from app.utils.response import success, error, paginate

records_bp = Blueprint('records', __name__)

# ── 列表查询（支持分页、筛选、排序）──
@records_bp.route('/', methods=['GET'])
@jwt_required()
def get_records():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category_id = request.args.get('category_id', type=int)
    search = request.args.get('search', '')
    sort_by = request.args.get('sort_by', 'created_at')
    order = request.args.get('order', 'desc')
    
    query = Record.query.filter_by(user_id=user_id)
    
    # 筛选
    if category_id:
        query = query.filter_by(category_id=category_id)
    if search:
        query = query.filter(Record.title.contains(search))
    
    # 排序
    sort_column = getattr(Record, sort_by, Record.created_at)
    query = query.order_by(sort_column.desc() if order == 'desc' else sort_column.asc())
    
    data = paginate(query, page, per_page)
    return success(data)

# ── 创建记录 ──
@records_bp.route('/', methods=['POST'])
@jwt_required()
def create_record():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('title'):
        return error('标题不能为空')
    
    record = Record(
        user_id=user_id,
        category_id=data.get('category_id'),
        title=data['title'],
        content=data.get('content', ''),
        rating=data.get('rating', 0),
        price=data.get('price', 0),
        city=data.get('city', ''),
        record_date=data.get('record_date'),
        is_favorite=data.get('is_favorite', False)
    )
    
    # 处理标签
    if data.get('tags'):
        for tag_name in data['tags']:
            tag = Tag.query.filter_by(name=tag_name, user_id=user_id).first()
            if not tag:
                tag = Tag(name=tag_name, user_id=user_id)
                db.session.add(tag)
            record.tags.append(tag)
    
    db.session.add(record)
    db.session.commit()
    return success(record.to_dict(), '创建成功', 201)

# ── 获取详情 ──
@records_bp.route('/<int:record_id>', methods=['GET'])
@jwt_required()
def get_record(record_id):
    user_id = get_jwt_identity()
    record = Record.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return error('记录不存在', 404)
    return success(record.to_dict())

# ── 更新记录 ──
@records_bp.route('/<int:record_id>', methods=['PUT'])
@jwt_required()
def update_record(record_id):
    user_id = get_jwt_identity()
    record = Record.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return error('记录不存在', 404)
    
    data = request.get_json()
    for field in ['title', 'content', 'rating', 'price', 'city', 'record_date', 'is_favorite']:
        if field in data:
            setattr(record, field, data[field])
    
    db.session.commit()
    return success(record.to_dict(), '更新成功')

# ── 删除记录 ──
@records_bp.route('/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    user_id = get_jwt_identity()
    record = Record.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return error('记录不存在', 404)
    
    db.session.delete(record)
    db.session.commit()
    return success(None, '删除成功')

# ── 获取分类列表 ──
@records_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = Category.query.all()
    return success([c.to_dict() for c in categories])
```

## API 设计规范

| 规范 | 说明 | 示例 |
|------|------|------|
| URL 复数名词 | 资源用复数 | `/api/records` |
| HTTP 方法 | GET 查询/POST 创建/PUT 更新/DELETE 删除 | |
| URL 参数 | 查询参数用 ?key=value | `/api/records?page=1&category_id=2` |
| 路径参数 | 资源ID在URL中 | `/api/records/123` |
| 状态码 | 200成功/201创建/400参数错误/401未认证/404不存在 | |
| 认证 | Header 注入 Bearer Token | `Authorization: Bearer xxx` |