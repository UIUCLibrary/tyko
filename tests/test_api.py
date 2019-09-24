import json

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import tyko
import tyko.database


def test_project_update():
    app = Flask(__name__, template_folder="../tyko/templates")
    db = SQLAlchemy(app)
    tyko.create_app(app)
    tyko.database.init_database(db.engine)
    app.config["TESTING"] = True

    with app.test_client() as server:
        post_resp = server.post(
            "/api/project/",
            data={
                "title": "my dumb project",
            }
        )
        assert post_resp.status_code == 200

        new_project_record = json.loads(post_resp.data)["url"]

        put_resp = server.put(new_project_record, data={
            "title": "my dumb project has changed"
        })
        assert put_resp.status_code == 200


def test_item_update():
    app = Flask(__name__, template_folder="../tyko/templates")
    db = SQLAlchemy(app)
    tyko.create_app(app)
    tyko.database.init_database(db.engine)
    app.config["TESTING"] = True

    with app.test_client() as server:
        post_resp = server.post("/api/item/",
                    data={
                        "name": "My dummy item",
                        "file_name": "dummy.txt",
                        "medusa_uuid": "03de08f0-dada-0136-5326-0050569601ca-4"
                        }
                    )
        assert post_resp.status_code == 200

        new_item_record_url = json.loads(post_resp.data)["url"]
        put_resp = server.put(new_item_record_url, data={
            "file_name": "changed_dummy.txt"
        })
        assert put_resp.status_code == 200
        put_resp_data = json.loads(put_resp.data)
        put_item = put_resp_data["item"]
        assert put_item["file_name"] == "changed_dummy.txt"

        get_resp = server.get(new_item_record_url)
        assert get_resp.status_code == 200

        edited_data = json.loads(get_resp.data)
        item = edited_data["item"][0]
        assert item["file_name"] == "changed_dummy.txt"
        assert item["medusa_uuid"] == "03de08f0-dada-0136-5326-0050569601ca-4"
        assert item["name"] == "My dummy item"


def test_item_delete():
    app = Flask(__name__, template_folder="../tyko/templates")
    db = SQLAlchemy(app)
    tyko.create_app(app)
    tyko.database.init_database(db.engine)
    app.config["TESTING"] = True

    with app.test_client() as server:
        post_resp = server.post("/api/item/",
                    data={
                        "name": "My dummy item",
                        "file_name": "dummy.txt",
                        "medusa_uuid": "03de08f0-dada-0136-5326-0050569601ca-4"
                        }
                    )
        assert post_resp.status_code == 200

        new_item_record_url = json.loads(post_resp.data)["url"]

        get_resp = server.get(new_item_record_url)
        assert get_resp.status_code == 200

        delete_resp = server.delete(new_item_record_url)
        assert delete_resp.status_code == 204
