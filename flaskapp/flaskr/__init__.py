import os

from flask import Flask


def create_app():
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY='dev'
    )

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    @app.route('/')
    def index():
        return 'This is the starting line';
    
    @app.route('/welcome')
    def welcome():
        return 'Welcome to the Flask App!';

    from . import arcapp
    app.register_blueprint(arcapp.bp)

    return app;