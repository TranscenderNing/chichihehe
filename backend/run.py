import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models import Category

app = create_app()


def init_categories():
    """初始化默认分类数据"""
    categories = [
        # 吃
        {'name': '吃', 'sub_type': '餐厅', 'icon': '🍽️'},
        {'name': '吃', 'sub_type': '小吃', 'icon': '🍜'},
        {'name': '吃', 'sub_type': '外卖', 'icon': '📦'},
        {'name': '吃', 'sub_type': '酒吧', 'icon': '🍸'},
        # 喝
        {'name': '喝', 'sub_type': '咖啡馆', 'icon': '☕'},
        {'name': '喝', 'sub_type': '奶茶店', 'icon': '🧋'},
        {'name': '喝', 'sub_type': '酒馆', 'icon': '🍺'},
        {'name': '喝', 'sub_type': '茶馆', 'icon': '🍵'},
        # 看
        {'name': '看', 'sub_type': '电影', 'icon': '🎬'},
        {'name': '看', 'sub_type': '电视剧', 'icon': '📺'},
        {'name': '看', 'sub_type': '纪录片', 'icon': '🎞️'},
        {'name': '看', 'sub_type': '话剧', 'icon': '🎭'},
        {'name': '看', 'sub_type': '展览', 'icon': '🖼️'},
        # 听
        {'name': '听', 'sub_type': '歌曲', 'icon': '🎵'},
        {'name': '听', 'sub_type': '专辑', 'icon': '💿'},
        {'name': '听', 'sub_type': '音乐会', 'icon': '🎻'},
        {'name': '听', 'sub_type': '演唱会', 'icon': '🎤'},
        {'name': '听', 'sub_type': '播客', 'icon': '🎙️'},
    ]

    with app.app_context():
        if Category.query.count() == 0:
            for cat in categories:
                db.session.add(Category(**cat))
            db.session.commit()
            print("✅ 分类数据初始化完成")
        else:
            print("ℹ️ 分类数据已存在，跳过初始化")


if __name__ == '__main__':
    init_categories()
    port = int(os.environ.get('PORT', 8000))
    app.run(debug=os.environ.get('FLASK_DEBUG', '1') == '1', host='0.0.0.0', port=port)
