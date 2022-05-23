import json

import pytest
import flask
import sqlalchemy
import urllib.request
import os

from flask import url_for
from flask_sqlalchemy import SQLAlchemy
from lxml import etree

import tyko
import tyko.data_provider.data_provider
import tyko.exceptions
import tyko.database
from tyko import pbcore
from tyko.api import api
from tyko.schema.formats import format_types
from tyko.site import site

PBCORE_XSD_URL = "https://raw.githubusercontent.com/PBCore-AV-Metadata/PBCore_2.1/master/pbcore-2.1.xsd"
if os.path.exists("pbcore-2.1.xsd"):
    with open("pbcore-2.1.xsd", "r") as f:
        PBCORE_XSD = f.read()
else:
    with urllib.request.urlopen(PBCORE_XSD_URL) as f:
        assert f.code == 200
        PBCORE_XSD = str(f.read(), encoding="utf8")
        with open("pbcore-2.1.xsd", "w") as wf:
            wf.write(PBCORE_XSD)

assert PBCORE_XSD is not None
xsd = etree.XML(PBCORE_XSD)
PBCORE_SCHEMA = etree.XMLSchema(xsd)


def test_pbcore_fail_invalid_id():
    db = sqlalchemy.create_engine("sqlite:///:memory:")
    empty_data_provider = tyko.data_provider.data_provider.DataProvider(db)

    with pytest.raises(tyko.exceptions.DataError):
        pbcore.create_pbcore_from_object(
            object_id=1,
            data_provider=empty_data_provider
        )


def test_pbcore_valid_id():
    app = flask.Flask(__name__, template_folder="../tyko/"
                                                "templates")
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.register_blueprint(site)
    app.register_blueprint(api)
    tyko.database.db.init_app(app)
    tyko.database.init_database(tyko.database.db.get_engine(app))

    app.config["TESTING"] = True

    with app.test_client() as server:
        server.get("/")
        sample_collection = server.post(
            url_for('api.add_collection'),
            data=json.dumps(
                {
                    "collection_name": "My dummy collection",
                    "department": "preservation",
                }
            ),
            content_type='application/json'
        ).get_json()

        sample_project = server.post(
            flask.url_for('api.add_project'),
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        ).get_json()

        sample_object_response = server.post(
            flask.url_for(
                "api.project_add_object",
                project_id=sample_project['id']
            ),
            data=json.dumps(
                {
                    "name": "My dummy object",
                    "collectionId": sample_collection['id']
                }
            ),
            content_type='application/json'
        )
        assert sample_object_response.status_code == 200
        sample_object_response = sample_object_response.get_json()['object']

        server.post(
            flask.url_for(
                "api.object_item",
                project_id=sample_project['id'],
                object_id=sample_object_response['object_id']
            ),
            data=json.dumps(
                {
                    "name": "My dummy item",
                    "format_id": format_types['audio cassette'][0]
                }
            ),
            content_type='application/json'
        ).get_json()

        pbcore_xml = server.get(
            flask.url_for(
                "api.object_pbcore",
                object_id=sample_object_response['object_id']
            )

        ).get_data()
        doc = etree.fromstring(pbcore_xml)
        print(str(etree.tostring(doc, pretty_print=True), encoding="utf-8"))
        assert \
            PBCORE_SCHEMA.validate(doc) is True, \
            PBCORE_SCHEMA.error_log.filter_from_errors().last_error.message
