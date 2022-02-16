from unittest.mock import Mock, MagicMock

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

import tyko.routes
import tyko.database
import tyko.views.project_object
from tyko import data_provider

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


class TestNewItem:
    def test_add_item_called(self):
        app = Flask(__name__, template_folder="../tyko/templates")
        data_connector = Mock(spec=data_provider.ObjectDataConnector)

        user_view = \
            tyko.routes.NewItem.as_view("api", data_connector=data_connector)

        app.add_url_rule(
            "/project/<int:project_id>/object/<int:object_id>/newItem",
            view_func=user_view,
            methods=["POST"]
        )

        with app.test_client() as client:
            client.post('/project/1/object/1/newItem', data={
                "name": "dummy"
            })

        assert data_connector.add_item.called is True


class TestObjectItemNewNotes:
    def test_add_item_called(self):
        app = Flask(__name__, template_folder="../tyko/templates")
        data_connector = Mock(spec=data_provider.ItemDataConnector)

        user_view = \
            tyko.routes.ObjectItemNewNotes.as_view(
                "api",
                data_connector=data_connector
            )

        app.add_url_rule(
            "/project/<int:project_id>/object/<int:object_id>"
            "/item/<int:item_id>/addNote",
            view_func=user_view,
            methods=["POST"]
        )

        with app.test_client() as client:
            client.post('/project/1/object/1/item/1/addNote', data={
                "text": "dummy",
                "note_type_id": "1"
            })
        data_connector.add_note.assert_called()


class TestProjectNewNote:
    def test_add_item_called(self):
        app = Flask(__name__, template_folder="../tyko/templates")
        data_connector = Mock(spec=data_provider.ProjectDataConnector)

        user_view = \
            tyko.routes.ProjectNewNote.as_view(
                "api",
                data_connector=data_connector
            )

        app.add_url_rule(
            "/project/<int:project_id>/addNote",
            view_func=user_view,
            methods=["POST"]
        )

        with app.test_client() as client:
            client.post('/project/1/addNote', data={
                "text": "dummy",
                "note_type_id": "1"
            })
        data_connector.add_note.assert_called()


class TestObjectUpdateNotes:
    def test_update_note_called(self):
        app = Flask(__name__, template_folder="../tyko/templates")
        data_connector = Mock(spec=data_provider.ObjectDataConnector)

        user_view = \
            tyko.routes.ObjectUpdateNotes.as_view(
                "api",
                data_connector=data_connector
            )

        app.add_url_rule(
            "/project/<int:project_id>/object/<int:object_id>/updateNote",
            view_func=user_view,
            methods=["POST"]
        )

        with app.test_client() as client:
            client.post('/project/1/object/1/updateNote', data={
                "text": "dummy",
                "note_type_id": 1,
                "noteId": 1
            })
        data_connector.update_note.assert_called()


class TestProjectNoteUpdate:
    def test_update_note_called(self):
        app = Flask(__name__, template_folder="../tyko/templates")
        data_connector = Mock(spec=data_provider.ProjectDataConnector)

        user_view = \
            tyko.routes.ProjectNoteUpdate.as_view(
                "api",
                data_connector=data_connector
            )

        app.add_url_rule(
            "/project/<int:project_id>/updateNote",
            view_func=user_view,
            methods=["POST"]
        )

        with app.test_client() as client:
            client.post('/project/1/updateNote', data={
                "text": "dummy",
                "note_type_id": 1,
                "noteId": 1
            })
        data_connector.update_note.assert_called()
