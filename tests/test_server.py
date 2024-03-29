from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import sessionmaker

import tyko
from tyko import schema, data_provider
from tyko.api import api
from tyko.run import is_correct_db_version
import tyko.database
import sqlalchemy
import pytest
import json
from flask import Flask, url_for

from tyko.site import site

TEMPLATE_FOLDER = "../tyko/templates"

SQLITE_IN_MEMORY = "sqlite:///:memory:"

static_page_routes = [
    "/",
    "/about",
]

dynamic_page_routes = [
    "site.page_collections",
    "site.page_projects",
    "site.page_formats",
    "site.page_item",
    "site.page_object",
]

api_routes = [
    "api.list_routes",
    "api.formats",
    "api.projects",
    "api.collections",
    "api.items",
    "api.objects",
]


@pytest.mark.parametrize("route", static_page_routes)
def test_static_pages(route):
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.register_blueprint(site)
    app.register_blueprint(api)
    with app.test_client() as server:
        resp = server.get(route)
        assert resp.status == "200 OK"


@pytest.mark.parametrize("route", dynamic_page_routes)
def test_dynamic_pages(route):
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.register_blueprint(site)
    app.register_blueprint(api)
    tyko.database.db.init_app(app)
    tyko.database.init_database(tyko.database.db.get_engine(app))
    with app.test_client() as server:
        server.get("/")
        resp = server.get(url_for(route))
        assert resp.status == "200 OK"


@pytest.fixture(scope="module")
def test_app():
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.register_blueprint(site)
    app.register_blueprint(api)
    tyko.database.db.init_app(app)
    tyko.database.init_database(tyko.database.db.get_engine(app))
    return app.test_client()


def test_api_formats(test_app):
    resp = test_app.get("/api/format")
    assert resp.status == "200 OK"
    tmp_data = json.loads(resp.data)

    for k, v in schema.formats.format_types.items():
        for entry in tmp_data:
            if entry["name"] == k:
                assert entry["id"] == v[0]
                break
        else:
            assert False


@pytest.mark.parametrize("route", api_routes)
def test_api_routes(route):
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.register_blueprint(site)
    app.register_blueprint(api)
    tyko.database.db.init_app(app)
    tyko.database.init_database(tyko.database.db.get_engine(app))
    # db = SQLAlchemy(app)
    # tyko.create_app(app, verify_db=False)
    # tyko.database.init_database(db.engine)
    with app.test_client() as server:
        server.get("/")
        resp = server.get(url_for(route))
        assert resp.status == "200 OK"


def test_create(test_app):
    test_app.get("/")
    resp = test_app.post(
        # url_for("api.add_project"),
        "/api/project",
        data=json.dumps(
            {
                "title": "dummy title",
                "project_code": "sample project code",
                "status": "No Work Done",
                "specs": "asdfadsf"
            }
        ),
        content_type='application/json'
    )
    assert resp.status_code == 200
    tmp_data = json.loads(resp.data)

    assert tmp_data["id"] is not None
    assert tmp_data["url"] is not None


test_data_read = [
    (
        "project", {
            "title": "dummy title",
            "project_code": "sample project code",
            "status": "No Work Done"
        }
     ),
    (
        "collection", {
            "collection_name": "Silly collection name",
            "department": "my department"
        }

    ),
    (
        "item", {
            "name": "my stupid new item",
            # "barcode": "8umb",
            "files": [
                {
                    "name": "stupid.mov"
                }
            ],
            "format_id": 4
        }
    ),
    (
        "object", {
            "name": "my stupid object"
        }
    )
]


@pytest.mark.parametrize("data_type,data_value", test_data_read)
def test_create_and_read2(data_type, data_value):

    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.register_blueprint(site)
    app.register_blueprint(api)
    tyko.database.db.init_app(app)
    tyko.database.init_database(tyko.database.db.get_engine(app))
    # db = SQLAlchemy(app)
    # tyko.create_app(app, verify_db=False)
    # tyko.database.init_database(db.engine)
    with app.test_client() as server:
        # server.get("/")
        # route = url_for(f"api.{data_type}")
        route = f"/api/{data_type}"
        create_resp = server.post(
            route,
            data=json.dumps(data_value),
            content_type='application/json'
        )

        assert \
            create_resp.status == "200 OK", \
            f"Failed to create a new entity with {route}"

        new_id = json.loads(create_resp.data)["id"]
        assert new_id is not None

        read_res = server.get(f"/api/{data_type}/{new_id}")
        assert \
            read_res.status_code == 200, \
            f"{route} failed with status {read_res.status_code}"

        read_resp_data = json.loads(read_res.data)
        data_object = read_resp_data[data_type]

        for k, v in data_value.items():
            if k == "files" and isinstance(v, list):
                continue
            assert data_object[k] == v


def test_empty_database_error():
    # Creating a server without a validate database should raise a DataError
    # exception
    db = sqlalchemy.create_engine(SQLITE_IN_MEMORY)

    with pytest.raises(tyko.exceptions.DataError):
        empty_data_provider = tyko.data_provider.data_provider.DataProvider(db)
        empty_data_provider.get_formats()


def test_get_object_pbcore():
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.register_blueprint(site)
    app.register_blueprint(api)
    tyko.database.db.init_app(app)
    tyko.database.init_database(tyko.database.db.get_engine(app))
    # db = SQLAlchemy(app)
    # tyko.create_app(app, verify_db=False)
    # tyko.database.init_database(db.engine)
    with app.test_client() as server:
        server.get("/")
        create_resp = server.post(
            # "/api/object/",
            url_for('api.add_object'),
            data=json.dumps(
                {
                    "name": "my stupid object"
                }
            ),
            content_type='application/json'
        )

        assert create_resp.status == "200 OK", "Failed to create a new object"

        new_id = json.loads(create_resp.data)["id"]
        assert new_id is not None

        pbcore_req_res = server.get(f"/api/object/{new_id}-pbcore.xml")
        assert \
            pbcore_req_res.status == "200 OK", \
            f"Failed create a PBCore record for id {new_id}"


def test_project_status_by_name_invalid():
    engine = sqlalchemy.create_engine(SQLITE_IN_MEMORY)
    tyko.database.init_database(engine)
    dummy_session = sessionmaker(bind=engine)
    project_provider = data_provider.ProjectDataConnector(dummy_session)

    with pytest.raises(tyko.exceptions.DataError):
        project_provider.get_project_status_by_name(
            "invalid status", create_if_not_exists=False)


def test_project_status_by_name_invalid_multiple_with_same_name():
    engine = sqlalchemy.create_engine(SQLITE_IN_MEMORY)
    tyko.database.init_database(engine)
    dummy_session = sessionmaker(bind=engine)
    project_provider = data_provider.ProjectDataConnector(dummy_session)
    session = dummy_session()
    session.add(schema.projects.ProjectStatus(name="double"))
    session.add(schema.projects.ProjectStatus(name="double"))
    session.commit()

    with pytest.raises(tyko.exceptions.DataError):
        project_provider.get_project_status_by_name(
            "double",
            create_if_not_exists=False
        )


def test_project_status_by_name_valid():
    engine = sqlalchemy.create_engine(SQLITE_IN_MEMORY)
    tyko.database.init_database(engine)
    dummy_session = sessionmaker(bind=engine)
    project_provider = data_provider.ProjectDataConnector(dummy_session)

    status = project_provider.get_project_status_by_name(
                "In Progress", create_if_not_exists=False)
    assert status is not None


def test_project_status_by_name_new_create():
    engine = sqlalchemy.create_engine(SQLITE_IN_MEMORY)
    tyko.database.init_database(engine)
    dummy_session = sessionmaker(bind=engine)
    project_provider = data_provider.ProjectDataConnector(dummy_session)

    status = project_provider.get_project_status_by_name(
                "new status", create_if_not_exists=True)
    assert status.name == "new status"


class TestProjectDataConnector:
    @pytest.fixture()
    def dummy_session(self):
        engine = sqlalchemy.create_engine(SQLITE_IN_MEMORY)
        tyko.database.init_database(engine)
        return sessionmaker(bind=engine)

    def test_get_note(self, dummy_session):

        project_provider = \
            data_provider.ProjectDataConnector(dummy_session)

        project_id = project_provider.create(title="dummy")

        note_created = project_provider.add_note(
            project_id,
            text="dummy",
            note_type_id=1
        )

        note_retrieved = project_provider.get_note(
            project_id, note_created['note_id'],
        )
        assert note_retrieved == note_created


class TestItemDataConnector:
    @pytest.fixture()
    def dummy_session(self):
        engine = sqlalchemy.create_engine(SQLITE_IN_MEMORY)
        tyko.database.init_database(engine)
        return sessionmaker(bind=engine)

    @pytest.fixture()
    def item_provider(self, dummy_session):

        return data_provider.ItemDataConnector(dummy_session)

    def test_get_note(self, item_provider):
        new_item_data = item_provider.create(name="dummy", format_id=4)

        item_provider.add_note(
            item_id=new_item_data['item_id'],
            note_text="spam",
            note_type_id=1
        )

        retrieved_note = \
            item_provider.get_note(new_item_data['item_id'], note_id=1)

        assert retrieved_note["text"] == "spam"

    def test_get_invalid_note(self, item_provider):
        new_item_data = item_provider.create(name="dummy", format_id=4)

        with pytest.raises(ValueError):
            # No note with id 2
            item_provider.get_note(new_item_data['item_id'], note_id=2)

    def test_add_treatment(self, item_provider, dummy_session):
        new_item_data = item_provider.create(name="dummy", format_id=4)
        item_provider.add_treatment(
            item_id=new_item_data['item_id'],
            data={
                "type": 'done',
                "message":'something',
            }
        )
        treatments = item_provider.get(
            id=new_item_data['item_id'],
            serialize=True
        )['treatment']
        assert len(treatments) > 0

    def test_add_file(self, item_provider, dummy_session):
        project_provider = \
            data_provider.ProjectDataConnector(dummy_session)

        project_provider.create(title="dummyProject")
        new_item_data = item_provider.create(name="dummy", format_id=4)
        object_provider = data_provider.ObjectDataConnector(dummy_session)
        object_id = object_provider.create(name="dummyobject")
        project_id = project_provider.create(title="dummy")

        updated_item = item_provider.add_file(
            project_id=project_id,
            object_id=object_id,
            item_id=new_item_data['item_id'],
            file_name="spam.mov",
            generation="Preservation"
        )
        file_created = updated_item['files'][0]
        assert file_created['name'] == "spam.mov"


class TestObjectDataConnector:
    @pytest.fixture()
    def dummy_session(self):
        engine = sqlalchemy.create_engine(SQLITE_IN_MEMORY)
        tyko.database.init_database(engine)
        return sessionmaker(bind=engine)

    def test_get_note(self, dummy_session):

        object_provider = data_provider.ObjectDataConnector(dummy_session)

        object_id = object_provider.create(name="dummy")

        object_provider.add_note(
            object_id,
            note_text="dummy",
            note_type_id=1
        )

        note_retrieved = object_provider.get_note(
            object_id,
            1,
            serialize=False
        )
        assert note_retrieved['text'] == "dummy"


def test_project_default_status():
    engine = sqlalchemy.create_engine(SQLITE_IN_MEMORY)
    tyko.database.init_database(engine)
    dummy_session = sessionmaker(bind=engine)
    project_provider = data_provider.ProjectDataConnector(dummy_session)
    statuses = project_provider.get_all_project_status()
    assert len(statuses) == 3


def test_db_version_test_valid():
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db = SQLAlchemy(app)
    version_table = sqlalchemy.Table(
        "alembic_version", db.metadata,
        sqlalchemy.Column("version_num",
                          sqlalchemy.String(length=32),
                          primary_key=True)
    )
    db.metadata.create_all(db.engine)
    db.session.execute(version_table.insert().values(
        version_num=schema.ALEMBIC_VERSION))
    db.session.commit()
    assert is_correct_db_version(app, db.engine) is True


def test_is_correct_db_version_no_table():
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db = SQLAlchemy(app)
    engine = db.get_engine(app)
    with pytest.raises(tyko.exceptions.NoTable):
        is_correct_db_version(app, engine)


def test_db_version_test_different():
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db = SQLAlchemy(app)
    version_table = sqlalchemy.Table(
        "alembic_version", db.metadata,
        sqlalchemy.Column("version_num",
                          sqlalchemy.String(length=32),
                          primary_key=True)
    )
    db.metadata.create_all(db.engine)
    db.session.execute(version_table.insert().values(
        version_num="notvalid"))
    db.session.commit()
    assert is_correct_db_version(app, db.engine) is False


def test_db_version_test_no_data():
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_IN_MEMORY
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db = SQLAlchemy(app)
    sqlalchemy.Table(
        "alembic_version", db.metadata,
        sqlalchemy.Column("version_num",
                          sqlalchemy.String(length=32),
                          primary_key=True)
    )
    db.metadata.create_all(db.engine)
    db.session.commit()
    assert is_correct_db_version(app, db.engine) is False


def test_create_samples_creates_a_collection():
    engine = sqlalchemy.create_engine(SQLITE_IN_MEMORY)
    tyko.database.init_database(engine)
    session_maker = sessionmaker(bind=engine)
    session = session_maker()
    assert session.query(schema.Collection).first() is None
    tyko.database.create_samples(engine)
    assert session.query(schema.Collection).first() is not None
