from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Record, Category
from app import db
from sqlalchemy import func, extract
from datetime import datetime

stats_bp = Blueprint('stats', __name__)


def response(code=200, message='success', data=None):
    return jsonify({'code': code, 'message': message, 'data': data}), code


@stats_bp.route('/overview', methods=['GET'])
@jwt_required()
def overview():
    user_id = int(get_jwt_identity())

    total = Record.query.filter_by(user_id=user_id).count()

    # 各分类统计
    category_stats = db.session.query(
        Category.name, func.count(Record.id)
    ).join(Record).filter(
        Record.user_id == user_id
    ).group_by(Category.name).all()

    # 平均评分
    avg_rating = db.session.query(
        func.avg(Record.rating)
    ).filter(Record.user_id == user_id, Record.rating > 0).scalar() or 0

    # 总消费
    total_spent = db.session.query(
        func.sum(Record.price)
    ).filter(Record.user_id == user_id).scalar() or 0

    # 收藏数
    favorites = Record.query.filter_by(user_id=user_id, is_favorite=True).count()

    return response(200, 'success', {
        'total_records': total,
        'category_stats': {name: count for name, count in category_stats},
        'avg_rating': round(float(avg_rating), 1),
        'total_spent': float(total_spent),
        'favorites': favorites,
    })


@stats_bp.route('/monthly', methods=['GET'])
@jwt_required()
def monthly():
    user_id = int(get_jwt_identity())
    year = request.args.get('year', datetime.now().year, type=int)
    month = request.args.get('month', datetime.now().month, type=int)

    records = Record.query.filter(
        Record.user_id == user_id,
        Record.record_date.isnot(None),
        extract('year', Record.record_date) == year,
        extract('month', Record.record_date) == month,
    ).all()

    # 分类统计
    category_count = {}
    total_spent = 0
    ratings = []
    for r in records:
        cat_name = r.category.name if r.category else '未知'
        category_count[cat_name] = category_count.get(cat_name, 0) + 1
        total_spent += r.price or 0
        if r.rating > 0:
            ratings.append(r.rating)

    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    return response(200, 'success', {
        'year': year,
        'month': month,
        'total_records': len(records),
        'category_count': category_count,
        'total_spent': total_spent,
        'avg_rating': round(avg_rating, 1),
    })


@stats_bp.route('/yearly', methods=['GET'])
@jwt_required()
def yearly():
    user_id = int(get_jwt_identity())
    year = request.args.get('year', datetime.now().year, type=int)

    # 使用 record_date 统计，若无 record_date 则回退到 created_at
    date_field = func.coalesce(Record.record_date, Record.created_at)

    # 每月记录数
    monthly_data = db.session.query(
        extract('month', date_field).label('month'),
        func.count(Record.id)
    ).filter(
        Record.user_id == user_id,
        extract('year', date_field) == year,
    ).group_by('month').all()

    # 分类统计
    category_data = db.session.query(
        Category.name, func.count(Record.id)
    ).join(Record).filter(
        Record.user_id == user_id,
        extract('year', date_field) == year,
    ).group_by(Category.name).all()

    # 评分分布
    rating_dist = db.session.query(
        func.round(Record.rating).label('r'),
        func.count(Record.id)
    ).filter(
        Record.user_id == user_id,
        Record.rating > 0,
        extract('year', date_field) == year,
    ).group_by('r').all()

    # 城市分布
    city_dist = db.session.query(
        Record.city, func.count(Record.id)
    ).filter(
        Record.user_id == user_id,
        Record.city != '',
        extract('year', date_field) == year,
    ).group_by(Record.city).order_by(func.count(Record.id).desc()).limit(10).all()

    # 年度总消费
    total_spent = db.session.query(
        func.sum(Record.price)
    ).filter(
        Record.user_id == user_id,
        extract('year', date_field) == year,
    ).scalar() or 0

    return response(200, 'success', {
        'year': year,
        'monthly_data': {int(m): c for m, c in monthly_data},
        'category_data': {name: count for name, count in category_data},
        'rating_distribution': {int(r): c for r, c in rating_dist},
        'city_distribution': {city: count for city, count in city_dist},
        'total_spent': float(total_spent),
    })
