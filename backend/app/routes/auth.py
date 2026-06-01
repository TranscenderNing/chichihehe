from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from app.models import User
from app import db

auth_bp = Blueprint('auth', __name__)


def response(code=200, message='success', data=None):
    return jsonify({'code': code, 'message': message, 'data': data}), code


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not username or not email or not password:
        return response(400, '用户名、邮箱和密码不能为空')

    if len(password) < 6:
        return response(400, '密码长度至少6位')

    if User.query.filter_by(username=username).first():
        return response(400, '用户名已存在')

    if User.query.filter_by(email=email).first():
        return response(400, '邮箱已被注册')

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return response(200, '注册成功', {
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
    })


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return response(400, '用户名和密码不能为空')

    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()

    if not user or not user.check_password(password):
        return response(401, '用户名或密码错误')

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return response(200, '登录成功', {
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return response(200, 'success', {'access_token': access_token})


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return response(404, '用户不存在')
    return response(200, 'success', user.to_dict())


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return response(404, '用户不存在')

    data = request.get_json()
    if 'avatar' in data:
        user.avatar = data['avatar']
    if 'bio' in data:
        user.bio = data['bio']

    db.session.commit()
    return response(200, '更新成功', user.to_dict())
