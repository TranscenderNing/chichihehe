# Skill 02 — Flask 后端架构设计

## 目标
使用 Flask 工厂模式 + Blueprint 蓝图构建可扩展的后端架构。

## 核心模式：应用工厂函数

```python
# backend/app/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # 1. 加载配置
    from config import Config
    app.config.from_object(Config)
    
    # 2. 初始化扩展
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)
    
    # 3. 创建必要目录
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)
    
    # 4. 注册蓝图路由
    from app.routes.auth import auth_bp
    from app.routes.records import records_bp
    from app.routes.stats import stats_bp
    from app.routes.upload import upload_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(records_bp, url_prefix='/api/records')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    
    # 5. 公开端点
    @app.route('/api/health')
    def health():
        return {'code': 200, 'message': 'ok'}
    
    # 6. 初始化数据库
    with app.app_context():
        db.create_all()
        init_default_data()  # 初始化默认分类等数据
    
    return app
```

## Blueprint 蓝图路由模式

```python
# backend/app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # ... 注册逻辑
    return jsonify({'code': 201, 'message': '注册成功', 'data': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # ... 验证逻辑
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify({
        'code': 200,
        'message': '登录成功',
        'data': {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }
    })

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    # ... 查询用户
    return jsonify({'code': 200, 'data': user.to_dict()})
```

## 数据模型设计模式

```python
# backend/app/models.py
from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    records = db.relationship('Record', backref='user', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class Record(db.Model):
    __tablename__ = 'records'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    rating = db.Column(db.Float, default=0)
    price = db.Column(db.Float, default=0)
    city = db.Column(db.String(100))
    record_date = db.Column(db.Date)
    is_favorite = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    tags = db.relationship('Tag', secondary='record_tags', backref='records')
    photos = db.relationship('Photo', backref='record', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'rating': self.rating,
            'price': self.price,
            'city': self.city,
            'category': self.category.to_dict() if self.category else None,
            'tags': [t.to_dict() for t in self.tags],
            'photos': [p.to_dict() for p in self.photos],
            'record_date': self.record_date.isoformat() if self.record_date else None,
            'is_favorite': self.is_favorite,
            'created_at': self.created_at.isoformat()
        }

    def to_brief_dict(self):
        """列表页精简版，减少数据传输"""
        return {
            'id': self.id,
            'title': self.title,
            'rating': self.rating,
            'price': self.price,
            'city': self.city,
            'cover': self.photos.first().to_dict() if self.photos.first() else None,
            'created_at': self.created_at.isoformat()
        }

# 多对多关联表
record_tags = db.Table('record_tags',
    db.Column('record_id', db.Integer, db.ForeignKey('records.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)
```

## 启动入口

```python
# backend/run.py
import os
from app import create_app, db

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_DEBUG', '1') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
```

## 设计要点

| 模式 | 说明 | 好处 |
|------|------|------|
| 工厂模式 | create_app() 创建实例 | 便于测试、多配置切换 |
| Blueprint | 按功能模块拆分路由 | 模块化、避免单文件过大 |
| ORM 序列化 | to_dict() / to_brief_dict() | 统一数据输出格式 |
| 环境变量配置 | os.environ.get() | 敏感信息不硬编码 |