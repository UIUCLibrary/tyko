import json

import pytest
from flask import Flask, url_for
import tyko.database
import tyko.data_provider
from tyko.api import api
from tyko.exceptions import DataError
from tyko.site import site
from tyko import run


@pytest.fixture()
def app():
    testing_app = Flask(__name__, template_folder="../tyko/templates")
    testing_app.config["TESTING"] = True
    testing_app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///:memory:'
    testing_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    testing_app.register_blueprint(site)
    testing_app.register_blueprint(api)
    testing_app.register_error_handler(DataError, run.handle_error)
    tyko.database.db.init_app(testing_app)
    engine = tyko.database.db.get_engine(testing_app)
    tyko.database.init_database(engine)
    return testing_app


@pytest.fixture()
def server_with_project():
    testing_app = Flask(__name__, template_folder="../tyko/templates")
    testing_app.config["TESTING"] = True
    testing_app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///:memory:'
    testing_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    testing_app.register_blueprint(site)
    testing_app.register_blueprint(api)
    tyko.database.db.init_app(testing_app)
    tyko.database.init_database(tyko.database.db.get_engine(testing_app))
    # db = SQLAlchemy(testing_app)
    # tyko.create_app(testing_app, verify_db=False)
    # tyko.database.init_database(db.engine)
    with testing_app.test_client() as server:
        server.get('/')
        assert server.post(
            url_for("api.add_project"),
            data=json.dumps(
                {
                    "title": "my dumb project",
                },
            ),
            content_type='application/json'
        ).status_code == 200
        yield server


@pytest.fixture()
def server_with_object():
    testing_app = Flask(__name__, template_folder="../tyko/templates")
    testing_app.config["TESTING"] = True
    testing_app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///:memory:'
    testing_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    testing_app.register_blueprint(site)
    testing_app.register_blueprint(api)
    tyko.database.db.init_app(testing_app)
    tyko.database.init_database(tyko.database.db.get_engine(testing_app))
    with testing_app.test_client() as server:
        server.get('/')
        new_collection_response = server.post(
            url_for('api.add_collection'),
            data=json.dumps(
                {
                    "collection_name": "My dummy collection",
                    "department": "preservation",
                }
            ),
            content_type='application/json'
        )

        assert new_collection_response.status_code == 200
        new_collection_data = json.loads(new_collection_response.data)
        new_collection_id = new_collection_data['id']

        new_project_response = server.post(
            url_for('api.add_project'),
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        )
        assert new_project_response.status_code == 200
        new_project_data = json.loads(new_project_response.data)
        new_project_id = new_project_data['id']
        new_object_url = url_for("api.project_add_object",
                                 project_id=new_project_id)

        post_new_object_project_resp = server.post(
            new_object_url,
            data=json.dumps({
                "name": "My dummy object",
                "barcode": "12345",
                "collectionId": new_collection_id
            }),
            content_type='application/json'
        )
        assert post_new_object_project_resp.status_code == 200
        formats_response = server.get(url_for('api.formats'))
        assert formats_response.status_code == 200, formats_response.status

        format_types = {
            format_type["name"]: format_type
            for format_type in json.loads(formats_response.data)
        }

        data = {
            "collection": new_collection_data,
            "project": new_project_data,
            "object": json.loads(post_new_object_project_resp.data)['object'],
            "format_types": format_types,
        }
        yield server, data


@pytest.fixture()
def server_with_object_and_item():
    testing_app = Flask(__name__, template_folder="../tyko/templates")
    testing_app.config["TESTING"] = True
    testing_app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///:memory:'
    testing_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    testing_app.register_blueprint(site)
    testing_app.register_blueprint(api)
    tyko.database.db.init_app(testing_app)
    tyko.database.init_database(tyko.database.db.get_engine(testing_app))
    # db = SQLAlchemy(testing_app)
    # tyko.create_app(testing_app, verify_db=False)
    # tyko.database.init_database(db.engine)
    with testing_app.test_client() as server:
        server.get("/")
        new_collection_response = server.post(
            url_for("api.add_collection"),
            data=json.dumps(
                {
                    "collection_name": "My dummy collection",
                    "department": "preservation",
                }
            ),
            content_type='application/json'
        )

        assert new_collection_response.status_code == 200
        new_collection_id = json.loads(new_collection_response.data)['id']

        new_project_response = server.post(
            url_for('api.add_project'),
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        )
        assert new_project_response.status_code == 200
        new_project_id = json.loads(new_project_response.data)['id']
        new_object_url = url_for("api.project_add_object",
                                 project_id=new_project_id)

        post_new_object_project_resp = server.post(
            new_object_url,
            data=json.dumps({
                "name": "My dummy object",
                "barcode": "12345",
                "collectionId": new_collection_id
            }),
            content_type='application/json'
        )
        new_object_id = json.loads(
            post_new_object_project_resp.data
        )['object']["object_id"]

        assert post_new_object_project_resp.status_code == 200
        new_item_url = url_for("api.object_item",
                               project_id=new_project_id,
                               object_id=new_object_id
                               )
        post_new_item = server.post(
            new_item_url,
            data=json.dumps({
                "name": "dummy object",
                "format_id": 4
            }),
            content_type='application/json'
        )
        assert post_new_item.status_code == 200
        yield server


@pytest.fixture()
def server_with_object_item_file(server_with_object_and_item):
    server = server_with_object_and_item

    projects = json.loads(
        server.get(url_for("api.projects")).data
    )["projects"]
    project_id = projects[0]['project_id']

    project = json.loads(
        server.get(url_for("api.project", project_id=project_id)).data)['project']

    object_id = project['objects'][0]["object_id"]
    item_id = project['objects'][0]["items"][0]["item_id"]

    new_file_url = url_for("api.project_object_item_add_file",
                           project_id=project_id,
                           object_id=object_id,
                           item_id=item_id)
    file_res = json.loads(server.post(
        new_file_url,
        data=json.dumps({
            "file_name": "my_dumb_audio.wav",
        }),
        content_type='application/json'
    ).data)
    file_id = file_res['id']
    data = {
        "project_id": project_id,
        "item_id": item_id,
        "object_id": object_id,
        "file_id": file_id
    }
    yield server, data


@pytest.fixture()
def server_with_file_note(server_with_object_item_file):
    server, data = server_with_object_item_file
    file_id = data['file_id']

    file_notes_url = url_for("api.file_notes", file_id=file_id)
    new_note = json.loads(
        server.post(
            file_notes_url,
            data=json.dumps(
                {
                    "message": "This file is silly"
                }
            ),
            content_type='application/json'
        ).data
    )
    data['note_id'] = new_note['note']['id']
    yield server, data


@pytest.fixture()
def server_with_cassette(server_with_enums):
    server, data = server_with_enums

    object_add_url = url_for(
        "api.object_item",
        project_id=data['project']['id'],
        object_id=data['object']['object_id']
    )

    new_item_resp = server.post(
        object_add_url,
        data=json.dumps({
            "name": "dummy",
            "format_id":
                data['format_types']['audio cassette']["id"],
            "format_details": {
                "format_type_id":
                    data['cassette_tape_formats']['compact cassette']['id'],
                "date_of_cassette": "11/26/1993",
            },
            "inspection_date": "12/10/2019",
        }),
        content_type='application/json'
    )
    assert new_item_resp.status_code == 200, new_item_resp.status
    new_item_data = json.loads(new_item_resp.data)
    new_item_data['item']['routes'] = new_item_data['routes']
    data['item'] = new_item_data['item']
    yield server, data


@pytest.fixture()
def server_with_enums(server_with_object):
    server, data = server_with_object

    # ===================== cassette_tape_tape_thickness ======================
    tape_thickness_values = [
        ({"unit": "mm", "value": "0.5"}),
        ({"unit": "mm", "value": "1.0"}),
        ({"unit": "mm", "value": "1.5"}),
        ({"unit": None, "value": "unknown"})
    ]
    tape_thickness_api_url = url_for("api.cassette_tape_tape_thickness")

    for tape_thickness in tape_thickness_values:
        resp = server.post(tape_thickness_api_url,
                           data=json.dumps(tape_thickness),
                           content_type='application/json'
                           )
        assert resp.status_code == 200, resp.status
    data["tape_thicknesses"] = json.loads(
        server.get(tape_thickness_api_url).data)

    # ====================== cassette_tape_format_types =======================
    formats = [
        "compact cassette",
        "DAT",
        "ADAT",
        "Other"

    ]
    cassette_tape_format_types_url = url_for("api.cassette_tape_format_types")
    for f in formats:
        new_cassette_type_resp = server.post(
            cassette_tape_format_types_url,
            data=json.dumps({
                "name": f
            }),
            content_type='application/json'
        )
        assert new_cassette_type_resp.status_code == 200, \
            new_cassette_type_resp.status
    cassette_tape_formats = {
        i['name']: i for i in json.loads(
            server.get(cassette_tape_format_types_url).data
        )
    }
    data["cassette_tape_formats"] = cassette_tape_formats

    # ========================= cassette_tape_tape_types ======================

    tape_tape_type_api_url = url_for("api.cassette_tape_tape_types")
    for value in ["I", "II", "IV"]:
        resp = server.post(tape_tape_type_api_url,
                           data=json.dumps({"name": value}),
                           content_type='application/json'
                           )
        assert resp.status_code == 200, resp.status

    data["cassette_tape_tape_types"] = json.loads(
        server.get(tape_tape_type_api_url).data)
    yield server, data
