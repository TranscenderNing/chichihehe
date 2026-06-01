from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    avatar = db.Column(db.String(256), default='')
    bio = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    records = db.relationship('Record', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar': self.avatar,
            'bio': self.bio,
            'created_at': self.created_at.isoformat(),
        }


# 记录-标签 多对多关联表
record_tags = db.Table('record_tags',
    db.Column('record_id', db.Integer, db.ForeignKey('records.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)  # 吃/喝/看/听
    sub_type = db.Column(db.String(50), nullable=False)  # 餐厅/咖啡馆/电影/歌曲等
    icon = db.Column(db.String(50), default='')

    records = db.relationship('Record', backref='category', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'sub_type': self.sub_type,
            'icon': self.icon,
        }


class Tag(db.Model):
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }


class Record(db.Model):
    __tablename__ = 'records'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, default='')
    rating = db.Column(db.Float, default=0)
    price = db.Column(db.Float, default=0)
    address = db.Column(db.String(500), default='')
    city = db.Column(db.String(100), default='')
    artist = db.Column(db.String(200), default='')  # 艺术家/导演
    record_date = db.Column(db.Date, nullable=True)
    is_favorite = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tags = db.relationship('Tag', secondary=record_tags, lazy='subquery',
                           backref=db.backref('records', lazy='dynamic'))
    photos = db.relationship('Photo', backref='record', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='record', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category': self.category.to_dict() if self.category else None,
            'title': self.title,
            'content': self.content,
            'rating': self.rating,
            'price': self.price,
            'address': self.address,
            'city': self.city,
            'artist': self.artist,
            'record_date': self.record_date.isoformat() if self.record_date else None,
            'is_favorite': self.is_favorite,
            'tags': [t.to_dict() for t in self.tags],
            'photos': [p.to_dict() for p in self.photos],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }

    def to_brief_dict(self):
        return {
            'id': self.id,
            'category': self.category.to_dict() if self.category else None,
            'title': self.title,
            'rating': self.rating,
            'price': self.price,
            'city': self.city,
            'record_date': self.record_date.isoformat() if self.record_date else None,
            'is_favorite': self.is_favorite,
            'cover': self.photos.first().to_dict() if self.photos.first() else None,
            'tags': [t.to_dict() for t in self.tags],
            'created_at': self.created_at.isoformat(),
        }


class Photo(db.Model):
    __tablename__ = 'photos'

    id = db.Column(db.Integer, primary_key=True)
    record_id = db.Column(db.Integer, db.ForeignKey('records.id'), nullable=False, index=True)
    url = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
        }


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    record_id = db.Column(db.Integer, db.ForeignKey('records.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='comments')

    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.to_dict() if self.user else None,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
        }
