import pytest
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

import tyko.routes
import tyko.database

from tyko.data_provider import DataProvider

def test_get_api():
    testing_app = Flask(__name__, template_folder="../tyko/templates")
    testing_app.config["TESTING"] = True
    testing_app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///:memory:'
    testing_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db = SQLAlchemy(testing_app)
    tyko.create_app(testing_app, verify_db=False)
    tyko.database.init_database(db.engine)
    data_provider = DataProvider(db.engine)

    routes = tyko.routes.Routes(data_provider, testing_app)
    for r in routes.get_api_routes():
        assert isinstance(r, tyko.routes.UrlRule)