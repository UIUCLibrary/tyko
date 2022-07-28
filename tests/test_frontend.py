import json

from flask import url_for
import pytest
from tyko import frontend
from tyko.schema.formats import format_types


def test_view_web_object_empty(app):
    with app.test_client() as server:
        server.get("/")
        url = url_for("site.page_object_details", object_id=1)
        resulting_webpage = server.get(url)
        assert resulting_webpage.status_code != 200


def test_view_web_project_details(app):
    with app.test_client() as server:
        server.get("/")
        project_id = server.post(
            url_for("api.add_project"),
            # "/api/project/",
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        ).get_json()['id']
        project_page_resp = server.get(
            url_for("site.page_project_details", project_id=project_id)
        )
        assert project_page_resp.status_code == 200


def test_view_web_more(app):
    with app.test_client() as server:

        more_page_resp = server.get("/more")
        assert more_page_resp.status_code == 200


def test_view_web_file(app):
    with app.test_client() as server:
        server.get("/")
        new_collection_id = json.loads(server.post(
            url_for("api.add_collection"),
            data=json.dumps(
                {
                    "collection_name": "My dummy collection",
                    "department": "preservation",
                }
            ),
            content_type='application/json'
        ).data)['id']

        new_project_id = json.loads(server.post(
            # "/api/project/",
            url_for("api.add_project"),
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        ).data)['id']
        new_object_url = url_for("api.project_add_object",
                                 project_id=new_project_id)

        new_object_id = json.loads(server.post(
            new_object_url,
            data=json.dumps({
                "name": "My dummy object",
                "barcode": "12345",
                "collectionId": new_collection_id
            }),
            content_type='application/json'
        ).data)['object']['object_id']
        new_item_url = url_for("api.object_item",
                               project_id=new_project_id,
                               object_id=new_object_id
                               )

        new_item_id = json.loads(server.post(
            new_item_url,
            data=json.dumps({
                "name": "dummy object",
                "format_id": 4
            }),
            content_type='application/json'
        ).data)['item']['item_id']
        new_file_url = url_for("api.project_object_item_add_file",
                               project_id=new_project_id,
                               object_id=new_object_id,
                               item_id=new_item_id
                               )

        file_id = json.loads(server.post(
            new_file_url,
            data=json.dumps({
                "file_name": "my_dumb_audio.wav",
            }),
            content_type='application/json'
        ).data)['id']
        file_page_resp = server.get(
            url_for("site.page_file_details",
                    project_id=new_project_id,
                    object_id=new_object_id,
                    item_id=new_item_id,
                    file_id=file_id)
        )
        assert file_page_resp.status_code == 200


def test_view_web_item(app):
    with app.test_client() as server:
        server.get('/')
        project_id = server.post(
            url_for("api.add_project"),
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        ).get_json()['id']

        object_id = server.post(
            url_for("api.project_add_object", project_id=project_id),
            data=json.dumps(
                {
                    "name": "my stupid object",
                }
            ),
            content_type='application/json'
        ).get_json()['object']['object_id']
        new_item_rep = server.post(
            url_for(
                'api.object_item',
                project_id=project_id,
                object_id=object_id
            ),
            data=json.dumps(
                {
                    "name": "My dummy item",
                    "files": [
                        {
                            "name": "dummy.txt"
                        }
                    ],
                    "medusa_uuid": "03de08f0-dada-0136-5326-0050569601ca-4",
                    "format_id": format_types['audio cassette'][0],
                    "format_details": {}
                }
            ),
            content_type='application/json'

        )
        assert new_item_rep.status_code == 200
        new_item_data = new_item_rep.get_json()['item']
        resulting_webpage = server.get(
            url_for(
                "site.page_project_object_item_details",
                project_id=project_id,
                object_id=object_id,
                item_id=new_item_data['item_id'])
        )
        assert resulting_webpage.status_code == 200


@pytest.fixture()
def breadcrumb_builder_with_project():
    builder = frontend.BreadcrumbBuilder()
    builder["Project"] = "http://127.0.0.1:5000/project/1"
    return builder


def test_breadcrumb_builder_len(breadcrumb_builder_with_project):
    assert len(breadcrumb_builder_with_project) == 1


def test_breadcrumb_builder_get_key(breadcrumb_builder_with_project):
    assert \
        breadcrumb_builder_with_project["Project"] == \
        "http://127.0.0.1:5000/project/1"


def test_breadcrumb_builder_iter(breadcrumb_builder_with_project):
    for v in breadcrumb_builder_with_project:
        assert v == ("Project", "http://127.0.0.1:5000/project/1")


def test_breadcrumb_builder_builds(breadcrumb_builder_with_project):
    breadcrumbs = breadcrumb_builder_with_project.build(active_level="Project")
    assert isinstance(breadcrumbs, list)
    assert len(breadcrumbs) == 1


def test_breadcrumb_builder_del(breadcrumb_builder_with_project):
    assert len(breadcrumb_builder_with_project) == 1
    del breadcrumb_builder_with_project["Project"]
    assert len(breadcrumb_builder_with_project) == 0


def test_breadcrumb_builder_build_throws_on_false_level(
        breadcrumb_builder_with_project
):
    with pytest.raises(ValueError):
        breadcrumb_builder_with_project.build("invalid")


def test_breadcrumb_builder_set_throws_on_bad_level(
        breadcrumb_builder_with_project
):
    with pytest.raises(ValueError):
        breadcrumb_builder_with_project["invalid"] = "spam"


def test_create_project_page(app):
    with app.test_client() as server:
        create_project_page = server.get("/project/create/")
        assert create_project_page.status_code == 200
