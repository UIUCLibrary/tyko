from unittest.mock import Mock, MagicMock

import pytest
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

import tyko.routes
import tyko.database
import tyko.views.project_object

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


class TestProjectObjectAPI:
    def test_get(self, monkeypatch):
        def url_for(*args, **kwargs):
            return ""

        jsonify = Mock()
        monkeypatch.setattr(tyko.views.project_object, "url_for", url_for)
        monkeypatch.setattr(tyko.views.project_object, "jsonify", jsonify)
        middle_ware = Mock()
        project = {
            "objects": [
                {
                    "items": [
                        MagicMock(name="item")
                    ],
                    "object_id": "obj"
                }
            ],
            "project_id": "dummy"
        }
        middle_ware.get_project_by_id = Mock(return_value=project)
        view = tyko.views.project_object.ProjectObjectAPI(middle_ware)
        view.get(project_id="dummy", object_id="obj")
        assert jsonify.called is True
