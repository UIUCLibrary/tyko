import json
from typing import Dict
from unittest.mock import Mock

import pytest
from flask import url_for, Flask, request

from tyko.schema.formats import format_types
from tyko.views import object_item
from tyko.data_provider import DataProvider

def test_project_create_and_delete(app):
    with app.test_client() as server:
        server.get('/')
        new_project_id = json.loads(server.post(
            url_for('api.add_project'),
            data=json.dumps(
                {
                    "title": "my dumb project",
                    "project_code": "my dumb project code",
                    "current_location": "old location",
                    "status": "No Work Done"
                }
            ),
            content_type='application/json'

        ).data)['id']
        delete_resp = server.delete(
            url_for("api.project", project_id=new_project_id)
        )
        assert delete_resp.status_code == 204


def test_project_posting(app):
    with app.test_client() as server:
        server.get('/')
        a = url_for('api.add_project')

        post_resp = server.post(
            url_for('api.add_project'),
            data=json.dumps(
                {
                    "title": "my dumb project",
                    "project_code": "my dumb project code",
                    "current_location": "old location",
                    "status": "No Work Done"
                }
            ),
            content_type='application/json'
        )
        assert post_resp.status_code == 200


def test_project_update(app):

    with app.test_client() as server:
        server.get('/')
        post_resp = server.post(
            url_for('api.add_project'),
            data=json.dumps(
                {
                    "title": "my dumb project",
                    "project_code": "my dumb project code",
                    "current_location": "old location",
                    "status": "No Work Done"
                }
            ),
            content_type='application/json'

        )
        assert post_resp.status_code == 200

        new_project_record = json.loads(post_resp.data)["url"]

        put_resp = server.put(
            new_project_record,
            data=json.dumps(
                {
                    "title": "my dumb project has changed",
                    "project_code": "my dumb project code changed",
                    "current_location": "new location",
                    "status": "Complete"
                }
            ),
            content_type='application/json'
        )
        assert put_resp.status_code == 200
        updated_project = json.loads(put_resp.data)["project"]
        assert updated_project["title"] == "my dumb project has changed"

        assert updated_project["project_code"] == "my dumb project code " \
                                                  "changed"

        assert updated_project["current_location"] == "new location"
        assert updated_project["status"] == "Complete"


@pytest.mark.parametrize(
    'vendor_info,key,expected_value',
    [
        (
            {
                'originals_received_date': '4/22/1999'
            },
            'originals_received_date',
            '4/22/1999'
        ),
        (
            {
                'deliverable_received_date': '5/11/1996'
            },
            'deliverable_received_date',
            '5/11/1996'
        ),
        (
            {
                'deliverable_received_date': '5/11/1996',
                'originals_received_date': '4/22/1999'
            },
            'deliverable_received_date',
            '5/11/1996'
        ),
        (
            {
                'deliverable_received_date': '5/11/1996',
                'originals_received_date': '4/22/1999'
            },
            'originals_received_date',
            '4/22/1999'
        ),
        (
            {
                'vendor_name': "Bob's copy shop",
                'deliverable_received_date': '5/11/1996',
                'originals_received_date': '4/22/1999'
            },
            'vendor_name',
            "Bob's copy shop"
        ),
    ]
)
def test_item_update_vendor_info(
        app: Flask,
        vendor_info: Dict[str, str],
        key: str,
        expected_value: str
):
    with app.test_client() as server:
        server.get('/')

        project_id = server.post(
            url_for("api.add_project"),
            content_type='application/json',
            data=json.dumps({
                "title": 'Spam Project'
            })
        ).get_json()["id"]

        new_object_id = server.post(
            url_for("api.project_add_object", project_id=project_id),
            data=json.dumps(
                {
                    "name": "My dummy object",
                    "barcode": "12345",
                }
            ),
            content_type='application/json'
        ).get_json()['object']["object_id"]

        item_id = server.post(
            url_for(
                "api.object_item",
                project_id=project_id,
                object_id=new_object_id
            )
            ,
            data=json.dumps(
                {
                    "name": "My dummy item",
                    "files": [
                        {
                            "name": "dummy.wav",
                        }
                    ],
                    "format_id": 4
                }
            ),
            content_type='application/json').get_json()['item']['item_id']
        item_api_url = url_for("api.object_item",
                               project_id=project_id,
                               object_id=new_object_id,
                               item_id=item_id
                               )

        put_response = server.put(
            item_api_url,
            data=json.dumps(vendor_info),
            content_type='application/json'
        )

        assert \
            put_response.status_code == 200, \
            put_response.data.decode(put_response.charset)

        put_response = server.get(
            item_api_url,
            content_type='application/json'
        )
        item = put_response.get_json()
        assert item["name"] == "My dummy item"
        assert item['vendor'][key] == expected_value
        assert put_response.status_code == 200


@pytest.mark.filterwarnings("ignore:Unknown format type items. Not updating")
def test_item_update(app):

    with app.test_client() as server:
        server.get('/')
        post_resp = server.post(
            url_for("api.add_item"),
            # "/api/item/",
            data=json.dumps(
                {
                    "name": "My dummy item",
                    "files": [
                        {
                            "name": "dummy.txt",
                        }
                    ],
                    "format_id": 4,
                }
            ),
            content_type='application/json'
        )
        assert post_resp.status_code == 200
        new_item_data = json.loads(post_resp.data)
        new_item_record_url = url_for("api.item", item_id=new_item_data['id'])
        put_resp = server.put(
            new_item_record_url,
            data=json.dumps({
                "name": "changed_dummy"
            }),
            content_type='application/json'
        )
        assert put_resp.status_code == 200
        get_resp = server.get(new_item_record_url)
        assert get_resp.status_code == 200
        #
        edited_data = json.loads(get_resp.data)
        item = edited_data["item"]
        assert item["name"] == "changed_dummy"


def test_item_delete(app):

    with app.test_client() as server:
        server.get('/')
        post_resp = server.post(
            url_for("api.add_item"),
            data=json.dumps(
                {
                    "name": "My dummy item",
                    "files": [
                        {
                            "name": "changed_dummy.txt",
                        }
                    ],
                    "format_id": format_types['audio cassette'][0]
                }
            ),
            content_type='application/json'
        )
        assert post_resp.status_code == 200
        data = json.loads(post_resp.data)

        new_item_record_url = url_for("api.item", item_id=data['id'])

        get_resp = server.get(new_item_record_url)
        assert get_resp.status_code == 200

        delete_resp = server.delete(new_item_record_url)
        assert delete_resp.status_code == 204


def test_object_add_note(app):
    with app.test_client() as server:
        server.get('/')
        project_id = server.post(
            url_for("api.add_project"),
            # "/api/project/",
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        ).get_json()["id"]

        new_object_id = server.post(
            url_for("api.project_add_object", project_id=project_id),
            data=json.dumps(
                {
                    "name": "My dummy object",
                    "barcode": "12345",
                }
            ),
            content_type='application/json'
        ).get_json()['object']["object_id"]

        new_object_note_resp = server.post(
            url_for("api.project_object_add_note",
                    project_id=project_id,
                    object_id=new_object_id),
            data=json.dumps(
                {
                    "note_type_id": "3",
                    "text": "MY dumb note",
                }
            ),
            content_type='application/json'
        )
        assert new_object_note_resp.status_code == 200
        # new_note_data = new_object_note_resp.get_json()

        object_notes = server.get(
            url_for("api.object", object_id=new_object_id)
        ).get_json()['object']['notes']
        assert len(object_notes) == 1

        new_note_id = object_notes[0]['note_id']

        delete_resp = server.delete(
            url_for("api.object_notes",
                    project_id=project_id,
                    object_id=new_object_id,
                    note_id=new_note_id
                    )
        )
        assert delete_resp.status_code == 202

        notes_after_deleting = server.get(
            url_for("api.object", object_id=new_object_id)
        ).get_json()['object']['notes']

        assert len(notes_after_deleting) == 0


def test_object_update(app):

    with app.test_client() as server:
        server.get('/')
        collection_one_id = json.loads(server.post(
            url_for("api.add_collection"),
            data=json.dumps(
                {
                    "collection_name": "dumb collection",
                    "department": "dumb department",
                    "record_series": "dumb record series",
                }
            ),
            content_type='application/json'
        ).data)["id"]

        collection_two_id = json.loads(server.post(
            url_for("api.add_collection"),
            data=json.dumps(
                {
                    "collection_name": "dumb other collection",
                    "department": "dumb other department",
                    "record_series": "dumb other record series",
                }
            ),
            content_type='application/json'
        ).data)["id"]

        post_resp = server.post(
            url_for("api.add_object"),
            data=json.dumps(
                {
                    "name": "My dummy object",
                    "barcode": "12345",
                    "collection_id": collection_one_id,
                    "originals_rec_date": "2/4/2010",
                    "originals_return_date": "2/4/2012"
                }
            ),
            content_type='application/json'
            )
        assert post_resp.status_code == 200
        post_data = json.loads(post_resp.data)
        new_object_record_url = url_for("api.object", object_id=post_data['id'])

        put_resp = server.put(
            new_object_record_url,
            data=json.dumps({
                "name": "changed_dummy object",
                "barcode": "54321",
                "collection_id": collection_two_id,
                "originals_rec_date": "4/1/2010",
                "originals_return_date": "4/5/2012"
            }),
            content_type='application/json'

        )

        assert put_resp.status_code == 200
        put_resp_data = json.loads(put_resp.data)
        put_item = put_resp_data["object"]
        assert put_item["name"] == "changed_dummy object"
        # assert put_item["barcode"] == "54321"

        get_resp = server.get(new_object_record_url)
        assert get_resp.status_code == 200

        edited_data = json.loads(get_resp.data)
        get_object = edited_data["object"]
        assert get_object["name"] == "changed_dummy object"
        assert get_object["name"] == "changed_dummy object"
        assert get_object["originals_rec_date"] == "4/1/2010"
        assert get_object["originals_return_date"] == "4/5/2012"
        assert get_object["collection_id"] == collection_two_id


def test_object_delete(app):
    with app.test_client() as server:
        server.get('/')
        post_resp = server.post(
            url_for("api.add_object"),
            data=json.dumps(
                {
                    "name": "My dummy object",
                    "barcode": "12345",
                }
            ),
            content_type='application/json'
        )
        assert post_resp.status_code == 200

        new_record_url = json.loads(post_resp.data)["url"]

        get_resp = server.get(new_record_url)
        assert get_resp.status_code == 200

        delete_resp = server.delete(new_record_url)
        assert delete_resp.status_code == 204


def test_note_create(app):

    with app.test_client() as server:
        server.get('/')
        post_resp = server.post(
            url_for("api.add_note"),
            data=json.dumps(
                {
                    "note_type_id": "3",
                    "text": "MY dumb note",
                }
            ),
            content_type='application/json'
        )
        assert post_resp.status_code == 200
        new_record_id = json.loads(post_resp.data)["id"]

        get_all_notes = server.get(url_for('api.notes'))
        note_data = json.loads(get_all_notes.data)
        assert note_data['total'] == 1

        get_resp = server.get(url_for("api.note", note_id=new_record_id))
        note_data = json.loads(get_resp.data)
        assert note_data['note']["text"] == "MY dumb note"


def test_note_create_and_delete(app):

    with app.test_client() as server:
        server.get('/')
        post_resp = server.post(
            url_for("api.add_note"),
            data=json.dumps(
                {
                    "note_type_id": "3",
                    "text": "MY dumb note",
                }
            ),
            content_type='application/json'
            )
        assert post_resp.status_code == 200
        post_data = json.loads(post_resp.data)
        new_record_url = url_for("api.note", note_id=post_data['id'])

        get_all_notes = server.get("/api/notes")
        note_data = json.loads(get_all_notes.data)
        assert note_data['total'] == 1

        delete_resp = server.delete(new_record_url)
        assert delete_resp.status_code == 204

        get_all_notes_again = server.get("/api/notes")
        new_note_data = json.loads(get_all_notes_again.data)
        assert new_note_data['total'] == 0


def test_note_update(app):

    with app.test_client() as server:
        server.get('/')
        post_resp = server.post(
            url_for("api.add_note"),
            data=json.dumps(
                {
                    "note_type_id": "3",
                    "text": "MY dumb note",
                }
            ),
            content_type='application/json'
        )
        assert post_resp.status_code == 200
        new_record_url = json.loads(post_resp.data)["url"]

        put_resp = server.put(
            new_record_url,
            data=json.dumps(
                {
                    "text": "My Note has changed"
                }
            ),
            content_type='application/json'

        )

        assert put_resp.status_code == 200
        newly_created_data = json.loads(put_resp.data)
        created_collection = newly_created_data["note"]
        assert created_collection["text"] == "My Note has changed"
        assert created_collection["note_type_id"] == 3


def test_create_new_project_note_with_invalid_type(app):
    with app.test_client() as server:
        server.get('/')
        project_post_resp = server.post(
            url_for("api.add_project"),
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        )

        new_project_data = json.loads(project_post_resp.data)
        new_project_id = new_project_data["id"]

        note_post_resp = server.post(
            url_for("api.project_add_note", project_id=new_project_id),
            data=json.dumps({
                "note_type_id": "-3",
                "text": "MY dumb note",
            }
            ),
            content_type='application/json'
        )
        assert note_post_resp.status_code == 400


def test_create_new_project_note(app):
    with app.test_client() as server:
        server.get('/')
        project_post_resp = server.post(
            url_for("api.add_project"),
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        )

        assert project_post_resp.status_code == 200
        new_project_data = json.loads(project_post_resp.data)
        new_project_url = new_project_data["url"]
        new_note_url = f"{new_project_url}/notes"

        note_post_resp = server.post(
            new_note_url,
            data=json.dumps({
                "note_type_id": "3",
                "text": "MY dumb note",
            }),
            content_type='application/json'
        )

        assert note_post_resp.status_code == 200
        project_get_resp = server.get(new_project_url)
        assert project_get_resp.status_code == 200
        updated_project = \
            json.loads(project_get_resp.data)['project']
        project_notes = updated_project['notes']

        assert len(project_notes) == 1
        assert project_notes[0]['text'] == "MY dumb note"

        note_update_resp = server.put(
            url_for(
                "api.project_notes",
                project_id=new_project_data['id'],
                note_id=1
            ),
            data=json.dumps(
                {
                    "text": "MY dumb note changed",
                    "note_type_id": "1",
                }
            ),
            content_type='application/json'
        )
        assert note_update_resp.status_code == 200

        get_updated_note_resp = server.get(
            url_for("api.note", note_id=project_notes[0]['note_id'])
        )
        assert get_updated_note_resp.status_code == 200
        updated_note = get_updated_note_resp.get_json()['note']

        assert updated_note['text'] == "MY dumb note changed"
        assert updated_note["note_type_id"] == 1


def test_collection_update(app):

    with app.test_client() as server:
        server.get("/")

        post_resp = server.post(
            url_for("api.add_collection"),
            data=json.dumps(
                {
                    "collection_name": "My dummy collection",
                    "department": "preservation",
                    "record_series": "one"
                }
            ),
            content_type='application/json'
        )
        assert post_resp.status_code == 200
        post_resp_data = json.loads(post_resp.data)
        new_record_url = \
            url_for("api.collection", collection_id=post_resp_data['id'])

        get_resp = server.get(new_record_url)
        assert get_resp.status_code == 200
        newly_created_data = json.loads(get_resp.data)
        created_collection = newly_created_data["collection"]
        assert created_collection['collection_name'] == "My dummy collection"
        assert created_collection["department"] == "preservation"

        put_resp = server.put(
            new_record_url,
            data=json.dumps(
                {
                    "collection_name": "My changed dummy collection",
                    "record_series": "two"
                }
            ),
            content_type='application/json'
        )

        assert put_resp.status_code == 200
        put_resp_data = json.loads(put_resp.data)
        put_item = put_resp_data["collection"]
        assert put_item["collection_name"] == "My changed dummy collection"
        assert put_item["department"] == "preservation"
        assert put_item["record_series"] == "two"

        get_resp = server.get(new_record_url)
        assert get_resp.status_code == 200

        edited_data = json.loads(get_resp.data)
        get_object = edited_data["collection"]
        assert get_object["collection_name"] == "My changed dummy collection"
        assert get_object["department"] == "preservation"

        update_2 = json.loads(
            server.put(
                new_record_url,
                data=json.dumps(
                    {
                        "department": "some other departments",
                    }
                ),
                content_type='application/json'
            ).data
        )['collection']
        assert update_2["department"] == "some other departments"


def test_collection_delete(app):
    with app.test_client() as server:
        server.get('/')
        post_resp = server.post(
            url_for("api.add_collection"),
            # "/api/collection/",
            data=json.dumps(
                {
                    "collection_name": "My dummy collection",
                    "department": "preservation",
                }
            ),
            content_type='application/json'
        )

        assert post_resp.status_code == 200

        new_record_url = json.loads(post_resp.data)["url"]

        get_resp = server.get(new_record_url)
        assert get_resp.status_code == 200

        delete_resp = server.delete(new_record_url)
        assert delete_resp.status_code == 204


def test_add_object_to_project(server_with_project):
    project_api_url = url_for("api.project", project_id=1)
    new_object_api_url = url_for('api.project_add_object', project_id=1)
    post_new_object_project_resp = server_with_project.post(
        new_object_api_url,
        data=json.dumps(
            {
                "name": "My dummy object",
                "barcode": "12345",
                "originals_rec_date": "2010-2-4"
            }
        ),
        content_type='application/json'
    )

    assert post_new_object_project_resp.status_code == 200
    new_object_data = json.loads(post_new_object_project_resp.data)['object']
    assert new_object_data["name"] == "My dummy object"

    project_resp = server_with_project.get(project_api_url)
    assert project_resp.status_code == 200
    data = json.loads(project_resp.data)['project']
    assert len(data['objects']) == 1
    # assert data['objects'][0]['barcode'] == "12345"


def test_add_and_delete_object_to_project(server_with_project):
    project_api_url = url_for("api.project", project_id=1)
    object_api_url = url_for('api.project_add_object', project_id=1)

    post_new_object_project_resp = server_with_project.post(
        object_api_url,
        data=json.dumps({
            "name": "My dummy object",
            "barcode": "12345",
        }),
        content_type='application/json'
    )

    assert post_new_object_project_resp.status_code == 200
    new_object_data = json.loads(post_new_object_project_resp.data)['object']
    assert new_object_data["name"] == "My dummy object"

    project_resp = server_with_project.get(project_api_url)
    assert project_resp.status_code == 200
    data = json.loads(project_resp.data)['project']
    assert len(data['objects']) == 1

    new_object_id = new_object_data['object_id']
    new_object_api_url = url_for('api.project_object', project_id=1, object_id=new_object_id)

    delete_resp = server_with_project.delete(new_object_api_url)
    assert delete_resp.status_code == 202


def test_add_and_delete_item_to_object(server_with_object):
    server, data = server_with_object
    formats = dict()
    for format_type in server.get(url_for("api.formats")).get_json():
        formats[format_type['name']] = format_type['id']

    test_project_url = url_for("api.projects")
    test_project = \
        json.loads(server.get(test_project_url).data)['projects'][0]

    test_object = test_project['objects'][0]

    new_object_item_url = url_for("api.object_item",
                                  project_id=test_project['project_id'],
                                  object_id=test_object['object_id']
                                  )

    post_response = server.post(
        new_object_item_url,
        data=json.dumps(
            {
                "name": "My dummy item",
                "files": [
                    {
                        "name": "dummy.wav",
                    }
                ],
                "format_id": formats['open reel']
            }
        ),
        content_type='application/json')

    assert post_response.status_code == 200, \
        f"Failed reason {post_response.data}"

    new_item = json.loads(post_response.data)['item']
    assert new_item
    assert new_item['name'] == "My dummy item"
    assert new_item["files"][0]['name'] == "dummy.wav"
    assert new_item['format']['name'] == "open reel"

    object_url = url_for(
        "api.object",
        object_id=test_object['object_id']
    )

    object_get_resp = server.get(object_url)
    object_data = json.loads(object_get_resp.data)['object']
    assert len(object_data['items']) == 1
    assert object_data['items'][0]['name'] == "My dummy item"

    item_api_url = url_for("api.object_item",
                           project_id=test_project['project_id'],
                           object_id=test_object['object_id'],
                           item_id=new_item['item_id']
                           )

    delete_response = server.delete(item_api_url)
    assert delete_response.status_code == 202

    items_after_deleted = \
        json.loads(server.get(object_url).data)['object']['items']
    assert len(items_after_deleted) == 0


def test_create_and_get_file(server_with_object_and_item):
    projects = json.loads(
        server_with_object_and_item.get(url_for("api.projects")).data
    )["projects"]
    project_id = projects[0]['project_id']
    project = json.loads(
        server_with_object_and_item.get(
            url_for("api.project", project_id=project_id)
        ).data
    )['project']
    object_id = project['objects'][0]["object_id"]
    item_id = project['objects'][0]["items"][0]["item_id"]

    new_file_url = url_for("api.project_object_item_add_file",
                           project_id=project_id,
                           object_id=object_id,
                           item_id=item_id
                           )
    res = server_with_object_and_item.post(
        new_file_url,
        data=json.dumps({
            "file_name": "my_dumb_audio.wav",
        }),
        content_type='application/json'
    )
    assert res.status_code == 200
    new_file_res_data = json.loads(res.data)
    new_file_details_url = new_file_res_data['url']
    file_details_resp = server_with_object_and_item.get(new_file_details_url)
    assert file_details_resp.status_code == 200
    file_details_data = json.loads(file_details_resp.data)
    assert file_details_data['file_name'] == "my_dumb_audio.wav"


def test_update_file_name(server_with_object_and_item):
    projects = json.loads(
        server_with_object_and_item.get(url_for("api.projects")).data
    )["projects"]
    project = projects[0]
    project_id = project['project_id']
    object_id = project['objects'][0]["object_id"]
    item_id = project['objects'][0]["items"][0]["item_id"]
    new_file_url = url_for("api.project_object_item_add_file",
                           project_id=project_id,
                           object_id=object_id,
                           item_id=item_id
                           )

    file_id = json.loads(server_with_object_and_item.post(
        new_file_url,
        data=json.dumps({
            "file_name": "my_dumb_audio.wav",
        }),
        content_type='application/json'
    ).data)['id']

    new_file_route = url_for("api.item_files",
                             project_id=project_id,
                             object_id=object_id,
                             item_id=item_id,
                             id=file_id)

    put_res = server_with_object_and_item.put(
        new_file_route,
        data=json.dumps({
            "file_name": "my_dumb_changed_audio.wav"
        }),
        content_type='application/json'
    )
    assert put_res.status_code == 200

    # Get again and see if the data is changed
    get_res = server_with_object_and_item.get(
        new_file_route,
        content_type='application/json'
    )
    get_res_data = json.loads(get_res.data)
    assert get_res_data['file_name'] == "my_dumb_changed_audio.wav"


def test_create_and_delete_file(server_with_object_and_item):
    server = server_with_object_and_item
    projects = json.loads(
        server.get(url_for("api.projects")).data)["projects"]

    project_id = projects[0]['project_id']

    project = json.loads(
        server.get(url_for("api.project", project_id=project_id)).data)['project']

    object_id = project['objects'][0]["object_id"]
    item_id = project['objects'][0]["items"][0]["item_id"]

    new_file_url = url_for("api.project_object_item_add_file",
                           project_id=project_id,
                           object_id=object_id,
                           item_id=item_id
                           )
    res = server.post(
        new_file_url,
        data=json.dumps({
            "file_name": "my_dumb_audio.wav",
        }),
        content_type='application/json'
    )
    assert res.status_code == 200

#     check that item has file
    item = \
        json.loads(server.get(url_for("api.item", item_id=item_id)).data)['item']

    assert len(item['files']) == 1

    file_id = item['files'][0]['id']

    new_file_url = url_for("api.item_files",
                           project_id=project_id,
                           object_id=object_id,
                           item_id=item_id,
                           id=file_id)

    del_resp = server.delete(
        new_file_url
    )
    assert del_resp.status_code == 202


def test_create_and_delete_file_note(server_with_object_item_file):
    server, data = server_with_object_item_file

    file_id = data['file_id']

    file_notes_url = url_for("api.file_notes", file_id=file_id)
    new_note_resp = server.post(
        file_notes_url,
        data=json.dumps(
            {
                "message": "This file is silly"
            }
        ),
        content_type='application/json'
    )
    assert new_note_resp.status_code == 200
    new_note_api_url = json.loads(new_note_resp.data)['note']['url']['api']
    notes = json.loads(server.get(file_notes_url).data)['notes']
    assert len(notes) == 1
    del_resp = server.delete(new_note_api_url)
    assert del_resp.status_code == 202

    assert len(json.loads(server.get(file_notes_url).data)['notes']) == 0


def test_get_file_note(server_with_file_note):
    server, data = server_with_file_note
    file_notes_url = url_for("api.file_notes",
                             file_id=data['file_id'],
                             id=data['note_id']
                             )
    get_resp = server.get(file_notes_url)
    assert get_resp.status_code == 200
    res_data = json.loads(get_resp.data)
    assert res_data['file_id'] == data['file_id']


def test_update_file_note(server_with_file_note):
    server, data = server_with_file_note

    file_notes_url = url_for("api.file_notes",
                             file_id=data['file_id'],
                             id=data['note_id']
                             )

    update_resp = server.put(
        file_notes_url,
        data=json.dumps({
            "message": "New note message"
        }),
        content_type='application/json'
    )
    assert update_resp.status_code == 200
    assert json.loads(update_resp.data)["message"] == "New note message"


def test_create_and_delete_file_annotation_types(server_with_object_item_file):
    server, data = server_with_object_item_file
    file_annotation_types_url = url_for("api.file_annotation_types")

    new_annotation_type_get_resp = server.get(file_annotation_types_url)

    assert new_annotation_type_get_resp.status_code == 200

    new_annotation_type_data = json.loads(new_annotation_type_get_resp.data)
    assert len(new_annotation_type_data['annotation_types']) == 0
    assert new_annotation_type_data['total'] == 0

    new_annotation_type_resp = server.post(
        file_annotation_types_url,
        data=json.dumps({
            "text": "Audio Quality"

        }),
        content_type='application/json'
    )

    assert new_annotation_type_resp.status_code == 200

    new_annotation_type_resp_data = \
        json.loads(new_annotation_type_resp.data)

    new_anno_type_data = \
        json.loads(server.get(file_annotation_types_url).data)

    assert len(new_anno_type_data['annotation_types']) == 1
    assert new_anno_type_data['total'] == 1
    assert new_anno_type_data['annotation_types'][0]["name"] == "Audio Quality"

    file_annotation_type_url = \
        url_for("api.file_annotation_types",
                id=new_annotation_type_resp_data['fileAnnotationType']['id'])

    resp = server.delete(file_annotation_type_url)
    assert resp.status_code == 202

    assert json.loads(server.get(file_annotation_types_url).data)['total'] == 0


def test_create_and_delete_file_annotation(server_with_object_item_file):
    server, data = server_with_object_item_file

    file_id = data['file_id']
    file_annotation_types_url = url_for("api.file_annotation_types")
    new_annotation_type_resp = server.post(
        file_annotation_types_url,
        data=json.dumps({
            "text": "Audio Quality"

        }),
        content_type='application/json'
    )

    assert new_annotation_type_resp.status_code == 200

    new_annotation_type_data = \
        json.loads(new_annotation_type_resp.data)['fileAnnotationType']

    assert isinstance(new_annotation_type_data["id"], int)

    file_annotations_url = url_for("api.file_annotations", file_id=file_id)
    new_annotation_resp = server.post(
        file_annotations_url,
        data=json.dumps(
            {
                "content": "This file is silly",
                "type_id": new_annotation_type_data["id"]
            }
        ),
        content_type='application/json'
    )
    assert new_annotation_resp.status_code == 200

    annotations = \
        json.loads(server.get(file_annotations_url).data)['annotations']

    assert len(annotations) == 1

    annotation_url = url_for("api.file_annotations",
                             file_id=file_id,
                             id=annotations[0]['id'])

    del_resp = server.delete(annotation_url)
    assert del_resp.status_code == 202
    annotations_after_deleting = json.loads(
        server.get(file_annotations_url).data)['annotations']

    assert len(annotations_after_deleting) == 0


dates = [
    # "1993",
    # "11/1950",
    # "11/26/1993",
    "11/6/1993",
    "1/6/1993"
]


@pytest.mark.parametrize("date", dates)
def test_create_add_and_remove_cassette(date, server_with_enums):
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
                "date_of_cassette": date,
            },
            "inspection_date": "12/10/2019",
                # "tape_thickness_id": data['tape_thicknesses'][0]['id'],
                # 'tape_type_id': data["cassette_tape_tape_types"][0]['id']
        }),
        content_type='application/json'
    )
    assert new_item_resp.status_code == 200, new_item_resp.status
    new_item_data = json.loads(new_item_resp.data)
    assert new_item_data["item"]['format']['name'] == "audio cassette"
    assert "routes" in new_item_data

    item_get_resp = server.get(new_item_data['routes']['api'])
    assert item_get_resp.status_code == 200, item_get_resp.status
    new_item_get_data = json.loads(item_get_resp.data)
    assert "cassette_type" in new_item_get_data['format_details']

    format_details = new_item_get_data['format_details']
    # cassette_type = format_details['cassette_type']
    # assert cassette_type['name'] == "compact cassette"

    assert format_details['date_of_cassette'] == date
    assert new_item_get_data['inspection_date'] == "12/10/2019"

    # assert format_details['tape_thickness']['id'] == \
    #        data['tape_thicknesses'][0]['id']
    #
    # assert format_details['tape_type']['id'] == \
    #        data["cassette_tape_tape_types"][0]['id']

    delete_resp = server.delete(new_item_data['routes']['api'])

    assert delete_resp.status_code == 202


def test_create_and_remove_cassette_with_notes(server_with_enums):
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
                "date_recorded": "11/26/1993"}
        }),
        content_type='application/json'
    )
    assert new_item_resp.status_code == 200, new_item_resp.status
    new_item_data = json.loads(new_item_resp.data)

    # add a note to the cassette tape
    new_item_note_url = url_for("api.project_object_item_add_note",
                                project_id=data['project']['id'],
                                object_id=data['object']['object_id'],
                                item_id=new_item_data['item']['item_id']
                                )

    new_note_resp = server.post(new_item_note_url,
                                data=json.dumps({
                                    "note_type_id": "3",
                                    "text": "MY dumb note",
                                }),
                                content_type='application/json'
                                )
    assert new_note_resp.status_code == 200, new_note_resp.status

    # Now the item should have a note
    item_get_resp = server.get(new_item_data['routes']['api'])
    item_post_add_data = json.loads(item_get_resp.data)
    assert len(item_post_add_data['notes']) == 1

    new_note_api_route = item_post_add_data['notes'][0]['route']['api']

    delete_resp = server.delete(new_note_api_route)
    assert delete_resp.status_code == 202, delete_resp.status

    # Now the item should not have a note

    assert len(
        json.loads(server.get(new_item_data['routes']['api']).data)['notes']
    ) == 0


cassette_data = [
    ("date_of_cassette", lambda x: x["date_of_cassette"], "11/26/1993"),
    # ("format_type_id", lambda x: x['cassette_type']["id"], 2),
    # ("tape_thickness_id", lambda x: x['tape_thickness']["id"], 2),
    # ("tape_type_id", lambda x: x['tape_type']["id"], 2),
]


@pytest.mark.parametrize("key,server_key, value", cassette_data)
def test_update_cassette_records(key, server_key, value, server_with_cassette):
    server, data = server_with_cassette

    put_res = server.put(
        data['item']['routes']['api'],
        data=json.dumps(
            {
                "format_details": {
                    key: value
                }
            }),
        content_type='application/json'
    )

    assert put_res.status_code == 200, put_res.status
    put_data = json.loads(put_res.data)

    assert server_key(put_data['format_details']) == value

    get_data = json.loads(server.get(data['item']['routes']['api']).data)

    assert server_key(get_data['format_details']) == value


enum_endpoints = [
    ('api.cassette_tape_tape_types', {"name": "X"}, "name"),
    ("api.cassette_tape_tape_thickness", {"value": "2.0", "unit": "mm"}, "value"),
    ("api.cassette_tape_format_types",
     {"name": "ultra new cassette tape format"}, "name")
]


@pytest.mark.parametrize("endpoint,_,_a", enum_endpoints)
def test_api_enum_get(endpoint, _, _a, server_with_enums):
    server, data = server_with_enums
    api_url = url_for(endpoint)
    get_resp = server.get(api_url)
    assert get_resp.status_code == 200, get_resp.status


@pytest.mark.parametrize("endpoint,new_enum_data,name_key", enum_endpoints)
def test_api_enum_post(endpoint, new_enum_data, name_key, server_with_enums):
    server, data = server_with_enums
    api_url = url_for(endpoint)
    post_resp = server.post(api_url,
                            data=json.dumps(new_enum_data),
                            content_type='application/json')

    assert post_resp.status_code == 200, post_resp.status

    get_resp = server.get(api_url)
    assert get_resp.status_code == 200, get_resp.status

    enums = json.loads(get_resp.data)
    for enum in enums:
        if enum[name_key] == new_enum_data[name_key]:
            assert True
            break
    else:
        assert False, f"{new_enum_data['name']} not found in returned enums"


@pytest.mark.parametrize("endpoint,enum_data,name_key", enum_endpoints)
def test_api_enum_get_id(endpoint, enum_data, name_key, server_with_enums):
    server, data = server_with_enums
    api_url = url_for(endpoint, id=1)
    get_resp = server.get(api_url)
    assert get_resp.status_code == 200, get_resp.status
    get_data = json.loads(get_resp.data)
    assert int(get_data['id']) == 1


@pytest.mark.parametrize("endpoint,enum_data,name_key", enum_endpoints)
def test_api_enum_delete_id(endpoint, enum_data, name_key, server_with_enums):
    server, data = server_with_enums
    api_id_url = url_for(endpoint, id=1)
    del_resp = server.delete(api_id_url)
    assert del_resp.status_code == 204, \
        f"{endpoint} failed to delete request. reason: {del_resp.status}"

    get_resp = server.get(url_for(endpoint))
    get_data = json.loads(get_resp.data)
    for enum in get_data:
        if enum['id'] == 1:
            assert False, "enum was not deleted"


@pytest.mark.parametrize("endpoint,enum_data,name_key", enum_endpoints)
def test_api_enum_put_id(endpoint, enum_data, name_key, server_with_enums):
    server, data = server_with_enums
    api_id_url = url_for(endpoint, id=1)

    put_resp = server.put(api_id_url,
                          data=json.dumps(enum_data),
                          content_type='application/json')
    assert put_resp.status_code == 200, put_resp.status

    get_resp = server.get(api_id_url)
    assert get_resp.status_code == 200, get_resp.status
    get_data = json.loads(get_resp.data)
    assert get_data[name_key] == enum_data[name_key]


def test_api_video_cassette_generation(app):
    with app.test_client() as server:
        server.get('/')
        response = server.get(url_for('api.video_cassette_generations'))
        assert {'id': 2, 'name': 'dub'} in response.get_json()


def test_api_get_application_data_has_version(app):
    with app.test_client() as server:
        server.get('/')
        response = server.get(url_for('api.get_application_data'))
        assert "version" in response.get_json()

class TestItemTreatment:
    @pytest.fixture()
    def server(self, app):
        with app.test_client() as app_server:
            app_server.get('/')
            yield app_server
    @pytest.fixture()
    def object_id(self, server, project_id):
        return server.post(
            url_for("api.project_add_object", project_id=project_id),
            data=json.dumps(
                {
                    "name": "My dummy object",
                    "barcode": "12345",
                }
            ),
            content_type='application/json'
        ).get_json()['object']["object_id"]
    @pytest.fixture()
    def item_id(self, server, object_id, project_id):
        return  server.post(
            url_for(
                "api.object_item",
                project_id=project_id,
                object_id=object_id
            )
            ,
            data=json.dumps(
                {
                    "name": "My dummy item",
                    "files": [
                        {
                            "name": "dummy.wav",
                        }
                    ],
                    "format_id": 4
                }
            ),
            content_type='application/json').get_json()['item']['item_id']
    @pytest.fixture()
    def project_id(self, server):
        return server.post(
            url_for("api.add_project"),
            content_type='application/json',
            data=json.dumps({
                "title": 'Spam Project'
            })
        ).get_json()["id"]
    @pytest.fixture()
    def item_api_url(self, server, project_id, object_id, item_id):
        return url_for("api.object_item",
                       project_id=project_id,
                       object_id=object_id,
                       item_id=item_id
                       )

    def test_endpoint_exists(self, server, item_api_url, project_id, object_id, item_id):
        assert url_for(
            "api.item_treatment",
            project_id=project_id,
            object_id=object_id,
        )

    def test_post_returns_id(self, server, item_api_url, project_id, object_id, item_id):
        treatment_url = url_for(
            "api.item_treatment",
            project_id=project_id,
            object_id=object_id,
        )
        response = server.post(
            treatment_url,
            query_string={'item_id': item_id},
            data=json.dumps(
                {
                    "type": 'needed',
                    'message': 'spam'
                }
            ),
            content_type='application/json'
        )
        assert response.status_code == 200
        assert 'id' in response.get_json()

    def test_post_adds_treatment(self, server, item_api_url, project_id, object_id, item_id):
        treatment_url = url_for(
            "api.item_treatment",
            project_id=project_id,
            object_id=object_id,
        )
        assert server.post(
            treatment_url,
            query_string={'item_id': item_id},
            data=json.dumps(
                {
                    "type": 'needed',
                    'message': 'spam'
                }
            ),
            content_type='application/json'
        ).status_code == 200
        response = server.get(item_api_url).get_json()
        assert len(response['treatment']) > 0

    def test_put_edits_treatment(
            self,
            server,
            item_api_url,
            project_id,
            object_id,
            item_id
    ):
        treatment_url = url_for(
            "api.item_treatment",
            project_id=project_id,
            object_id=object_id,
        )
        treatment_id = server.post(
            treatment_url,
            query_string={'item_id': item_id},
            data=json.dumps(
                {
                    "type": 'needed',
                    'message': 'spam'
                }
            ),
            content_type='application/json'
        ).get_json()['id']

        server.put(
            treatment_url,
            query_string={'item_id': item_id, "treatment_id": treatment_id},
            data=json.dumps(
                {
                    "message": "bacon"
                },
            ),
            content_type='application/json'
        )
        response = server.get(item_api_url).get_json()
        assert response['treatment'][0]['message'] == 'bacon'


class TestObjectItemTreatmentAPI:
    @pytest.fixture()
    def simple_app(self):
        app = Flask(__name__, template_folder="../tyko/templates")
        app.config.update({
            "TESTING": True,
            "SQLALCHEMY_TRACK_MODIFICATIONS": False
        })
        yield app

    @pytest.fixture()
    def client(self, simple_app):
        return simple_app.test_client()

    def test_treatment_get(self, monkeypatch, simple_app):
        item = Mock(name="Item", treatments=[
            Mock(id=1, serialize=Mock(return_value={"treatment_id": 1}))
        ])
        data_provider = Mock(
            spec=DataProvider,
            db_session_maker=Mock(
                name='db_session_maker',
                return_value=Mock(
                    name="session",
                    query=Mock(return_value=Mock(
                        name="query",
                        filter=Mock(return_value=Mock(
                            name="filter",
                            one=Mock(return_value=item)
                        ))
                    ))
                )
            )
        )
        view = object_item.ObjectItemTreatmentAPI(
            provider=data_provider
        ).as_view('dummy', provider=data_provider)
        simple_app.add_url_rule(
            '/dummy/<int:project_id>/<int:object_id>/<int:item_id>',
            view_func=view
        )
        with simple_app.test_client() as client:
            response = client.get("/dummy/1/1/1?item_id=1&treatment_id=1")
            assert response.get_json()['treatment_id'] == 1

