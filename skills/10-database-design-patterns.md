# Skill 10 — 数据库设计模式

## 目标
使用 SQLAlchemy ORM 设计实体关系模型，实现多对多关联和双层序列化。

## ER 关系图

```
users 1──N records N──M tags
  │         │
  │         ├── 1──N photos
  │         │
  │         └── N──1 categories
  │
  └── 1──N comments
```

## 核心模型定义

```python
# backend/app/models.py
from app import db
from datetime import datetime

# ── 用户表 ──
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    avatar = db.Column(db.String(256), default='')
    bio = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    records = db.relationship('Record', backref='user', lazy='dynamic')
    comments = db.relationship('Comment', backref='user', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar': self.avatar,
            'bio': self.bio,
            'created_at': self.created_at.isoformat()
        }

# ── 分类表（吃/喝/看/听 + 子类型）──
class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)        # 吃/喝/看/听
    sub_type = db.Column(db.String(50), nullable=False)    # 餐厅/电影/...
    icon = db.Column(db.String(50), default='')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'sub_type': self.sub_type,
            'icon': self.icon
        }

# ── 记录表（核心）──
class Record(db.Model):
    __tablename__ = 'records'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, default='')
    rating = db.Column(db.Float, default=0)
    price = db.Column(db.Float, default=0)
    city = db.Column(db.String(100), default='')
    record_date = db.Column(db.Date)
    is_favorite = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = db.relationship('Category', backref='records')
    tags = db.relationship('Tag', secondary='record_tags', backref='records')
    photos = db.relationship('Photo', backref='record', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='record', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        """详情页完整数据"""
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
        """列表页精简数据，减少传输量"""
        first_photo = self.photos.first()
        return {
            'id': self.id,
            'title': self.title,
            'rating': self.rating,
            'price': self.price,
            'city': self.city,
            'cover': first_photo.to_dict() if first_photo else None,
            'created_at': self.created_at.isoformat()
        }

# ── 标签表 ──
class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'name': self.name}

# ── 多对多关联表 ──
record_tags = db.Table('record_tags',
    db.Column('record_id', db.Integer, db.ForeignKey('records.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

# ── 照片表 ──
class Photo(db.Model):
    __tablename__ = 'photos'
    id = db.Column(db.Integer, primary_key=True)
    record_id = db.Column(db.Integer, db.ForeignKey('records.id'), nullable=False)
    url = db.Column(db.String(256), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'url': self.url}

# ── 评论表 ──
class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    record_id = db.Column(db.Integer, db.ForeignKey('records.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'user': self.user.to_dict(),
            'created_at': self.created_at.isoformat()
        }
```

## 关键设计模式

| 模式 | 说明 |
|------|------|
| 多对多关联 | `db.Table` 中间表 + `relationship(secondary=...)` |
| 级联删除 | `cascade='all, delete-orphan'` 删除记录时自动删除关联照片 |
| 双层序列化 | `to_dict()` 完整数据用于详情页，`to_brief_dict()` 精简数据用于列表页 |
| 索引设计 | 外键字段、created_at 添加 index=True 加速查询 |
| 关系策略 | `lazy='dynamic'` 返回查询对象，支持链式筛选 |

## 初始化默认数据

```python
# backend/run.py
def init_default_data():
    """初始化默认分类数据"""
    if Category.query.count() == 0:
        categories = [
            ('吃', '餐厅'), ('吃', '小吃'), ('吃', '外卖'), ('吃', '酒吧'),
            ('喝', '咖啡馆'), ('喝', '奶茶店'), ('喝', '酒馆'), ('喝', '茶馆'),
            ('看', '电影'), ('看', '电视剧'), ('看', '纪录片'), ('看', '话剧'), ('看', '展览'),
            ('听', '歌曲'), ('听', '专辑'), ('听', '音乐会'), ('听', '演唱会'), ('听', '播客'),
        ]
        for name, sub_type in categories:
            db.session.add(Category(name=name, sub_type=sub_type))
        db.session.commit()