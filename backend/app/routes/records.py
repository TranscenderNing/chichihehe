from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Record, Category, Tag, Photo, record_tags
from app import db
from datetime import datetime

records_bp = Blueprint('records', __name__)


def response(code=200, message='success', data=None):
    return jsonify({'code': code, 'message': message, 'data': data}), code


@records_bp.route('', methods=['GET'])
@jwt_required()
def get_records():
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category_name = request.args.get('category', '')
    sub_type = request.args.get('sub_type', '')
    keyword = request.args.get('keyword', '')
    tag = request.args.get('tag', '')
    is_favorite = request.args.get('is_favorite', '')
    sort = request.args.get('sort', 'created_at')
    order = request.args.get('order', 'desc')

    query = Record.query.filter_by(user_id=user_id)

    if category_name:
        query = query.join(Category).filter(Category.name == category_name)

    if sub_type:
        query = query.join(Category).filter(Category.sub_type == sub_type)

    if keyword:
        query = query.filter(
            Record.title.ilike(f'%{keyword}%') |
            Record.content.ilike(f'%{keyword}%')
        )

    if tag:
        query = query.join(record_tags).join(Tag).filter(Tag.name == tag)

    if is_favorite == 'true':
        query = query.filter_by(is_favorite=True)

    # 排序 - 使用白名单验证
    allowed_sort_fields = {'created_at', 'rating', 'price', 'record_date'}
    allowed_orders = {'asc', 'desc'}

    if sort not in allowed_sort_fields:
        sort = 'created_at'
    if order not in allowed_orders:
        order = 'desc'

    sort_column = getattr(Record, sort)
    if order == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return response(200, 'success', {
        'items': [r.to_brief_dict() for r in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages,
    })


@records_bp.route('/<int:record_id>', methods=['GET'])
@jwt_required()
def get_record(record_id):
    user_id = int(get_jwt_identity())
    record = Record.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return response(404, '记录不存在')
    return response(200, 'success', record.to_dict())


@records_bp.route('', methods=['POST'])
@jwt_required()
def create_record():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    title = data.get('title', '').strip()
    if not title:
        return response(400, '标题不能为空')

    category_id = data.get('category_id')
    if not category_id:
        return response(400, '请选择分类')

    category = Category.query.get(category_id)
    if not category:
        return response(400, '分类不存在')

    record = Record(
        user_id=user_id,
        category_id=category_id,
        title=title,
        content=data.get('content', ''),
        rating=data.get('rating', 0),
        price=data.get('price', 0),
        address=data.get('address', ''),
        city=data.get('city', ''),
        artist=data.get('artist', ''),
        is_favorite=data.get('is_favorite', False),
    )

    record_date = data.get('record_date')
    if record_date:
        try:
            record.record_date = datetime.strptime(record_date, '%Y-%m-%d').date()
        except ValueError:
            pass

    # 处理标签
    tag_names = data.get('tags', [])
    for tag_name in tag_names:
        tag_name = tag_name.strip()
        if not tag_name:
            continue
        tag = Tag.query.filter_by(name=tag_name, user_id=user_id).first()
        if not tag:
            tag = Tag(name=tag_name, user_id=user_id)
            db.session.add(tag)
        record.tags.append(tag)

    # 处理图片
    photo_urls = data.get('photos', [])
    for url in photo_urls:
        if url:
            photo = Photo(url=url)
            record.photos.append(photo)

    db.session.add(record)
    db.session.commit()

    return response(200, '创建成功', record.to_dict())


@records_bp.route('/<int:record_id>', methods=['PUT'])
@jwt_required()
def update_record(record_id):
    user_id = int(get_jwt_identity())
    record = Record.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return response(404, '记录不存在')

    data = request.get_json()

    if 'title' in data:
        record.title = data['title']
    if 'content' in data:
        record.content = data['content']
    if 'rating' in data:
        record.rating = data['rating']
    if 'price' in data:
        record.price = data['price']
    if 'address' in data:
        record.address = data['address']
    if 'city' in data:
        record.city = data['city']
    if 'artist' in data:
        record.artist = data['artist']
    if 'is_favorite' in data:
        record.is_favorite = data['is_favorite']
    if 'category_id' in data:
        record.category_id = data['category_id']

    if 'record_date' in data:
        try:
            record.record_date = datetime.strptime(data['record_date'], '%Y-%m-%d').date()
        except (ValueError, TypeError):
            pass

    # 更新标签
    if 'tags' in data:
        record.tags = []
        for tag_name in data['tags']:
            tag_name = tag_name.strip()
            if not tag_name:
                continue
            tag = Tag.query.filter_by(name=tag_name, user_id=user_id).first()
            if not tag:
                tag = Tag(name=tag_name, user_id=user_id)
                db.session.add(tag)
            record.tags.append(tag)

    # 更新图片
    if 'photos' in data:
        Photo.query.filter_by(record_id=record.id).delete()
        for url in data['photos']:
            if url:
                photo = Photo(url=url, record_id=record.id)
                db.session.add(photo)

    db.session.commit()
    return response(200, '更新成功', record.to_dict())


@records_bp.route('/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    user_id = int(get_jwt_identity())
    record = Record.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return response(404, '记录不存在')

    db.session.delete(record)
    db.session.commit()
    return response(200, '删除成功')


@records_bp.route('/<int:record_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(record_id):
    user_id = int(get_jwt_identity())
    record = Record.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return response(404, '记录不存在')

    record.is_favorite = not record.is_favorite
    db.session.commit()
    return response(200, 'success', {'is_favorite': record.is_favorite})


@records_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = Category.query.all()
    return response(200, 'success', [c.to_dict() for c in categories])


@records_bp.route('/tags', methods=['GET'])
@jwt_required()
def get_tags():
    user_id = int(get_jwt_identity())
    tags = Tag.query.filter_by(user_id=user_id).all()
    return response(200, 'success', [t.to_dict() for t in tags])
