from flask import Flask, make_response
from tyko import routes, database
from tyko.data_provider import DataProvider, DataError
import sys

def create_app(app=None, init_db=False):
    if app is None:
        app = Flask(__name__)

    app.config.from_object("tyko.config")
    app.config.from_envvar("TYKO_SETTINGS", True)
    db_src = app.config["DB_ENGINE"]

    app.register_error_handler(DataError, handle_error)

    data_provider = DataProvider(db_src)
    app_routes = routes.Routes(data_provider, app)
    if init_db:
        database.init_database(data_provider.db_engine)

    app_routes.init_api_routes()
    app_routes.init_website_routes()
    return app


def main() -> None:
    """Run as a local program and not for production"""

    my_app = create_app()
    my_app.run()

def handle_error(error):
    return make_response(error.message, error.status_code)