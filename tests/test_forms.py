import json

import pytest
from tyko.schema.formats import format_types
from tyko.schema import formats
from flask import url_for


@pytest.fixture()
def project(app):
    with app.test_client() as server:
        # create_project_page = server.get("/project/create/")
        return server.post(
            "/api/project/",
            data=json.dumps(
                {
                    "title": "my dumb project",
                }
            ),
            content_type='application/json'
        ).get_json()

def namer(*args, **kwargs):
    return str(args[0])

@pytest.fixture()
def dummy_object(app, project):
    with app.test_client() as server:
        create_project_page = server.get("/project/create/")
        project_id = project['id']

        return server.post(
            url_for("project_add_object", project_id=project_id),
            data=json.dumps(
                {
                    "name": "my stupid object",
                }
            ),
            content_type='application/json'
        ).get_json()


@pytest.mark.parametrize(
    "post_data, expected_data",
    [
        (
            # "format: video cassette",
            {
                "name": "Dummy",
                "format_id": format_types['video cassette'][0]
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                }
            }
        ),
        (
            {
                "name": "Dummy2",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'ssws',
                'label':'This is a label',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'ssws',
                    'label': 'This is a label',
                }
            }
        ),
        (
            # "format: video cassette",
            {
                "name": "Dummy3",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'label':'This is a label',
                'dateOfCassette': '12-03-2003',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12-03-2003',
                }
            }
        ),
        (
            # "format: video cassette Duration",
            {
                "name": "DummyDuration",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'label':'This is a label',
                'dateOfCassette': '12-03-2003',
                'duration': '00:39:21',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12-03-2003',
                    'duration': '00:39:21',
                }
            }
        ),
        (
            {
                "name": "DummyInspectionDate",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'label':'This is a label',
                'dateOfCassette': '12-03-2003',
                'duration': '00:39:21',
                'inspectionDate': '12-03-2003',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12-03-2003',
                    'duration': '00:39:21',
                },
                'inspection_date': '12-03-2003',
            }
        ),
        (
            {
                "name": "DummyTransferDate",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'label':'This is a label',
                'dateOfCassette': '12-03-2003',
                'duration': '00:39:21',
                'inspectionDate': '12-03-2003',
                'transferDate':'12-03-2003',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12-03-2003',
                    'duration': '00:39:21',
                },
                'inspection_date': '12-03-2003',
                'transfer_date': '12-03-2003',
            }
        ),
        (
            {
                "name": "DummyCassetteType",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'label':'This is a label',
                'dateOfCassette': '12-03-2003',
                'cassetteTypeId':
                    formats.video_cassette_types.index('Betamax') + 1,
                    # + 1 because the database indexes start at 1 not 0
                'duration': '00:39:21',
                'inspectionDate': '12-03-2003',
                'transferDate':'12-03-2003',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12-03-2003',
                    'duration': '00:39:21',
                    'cassette_type': {
                        "name": 'Betamax',
                        "id": formats.video_cassette_types.index('Betamax') + 1,
                    },
                },
                'inspection_date': '12-03-2003',
                'transfer_date': '12-03-2003',
            }
        ),
        (
            {
                "name": "DummyGeneration",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'label':'This is a label',
                'dateOfCassette': '12-03-2003',
                'duration': '00:39:21',
                'inspectionDate': '12-03-2003',
                'transferDate':'12-03-2003',
                'generationId':
                    formats.video_cassette_generations.index(
                        'source (original)'
                    ) + 1
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12-03-2003',
                    'duration': '00:39:21',
                    'generation': {
                        'id': formats.video_cassette_generations.index(
                            'source (original)') + 1,
                        'name': 'source (original)',
                    }
                },
                'inspection_date': '12-03-2003',
                'transfer_date': '12-03-2003',
            }
        ),
        (
            {
                "name": "DummyALL",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'cassetteTypeId':
                    formats.video_cassette_types.index('Betamax') + 1,
                'label':'This is a label',
                'dateOfCassette': '12-03-2003',
                'duration': '00:39:21',
                'inspectionDate': '12-03-2003',
                'transferDate':'12-03-2003',
                'generationId':
                    formats.video_cassette_generations.index(
                        'source (original)'
                    ) + 1
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12-03-2003',
                    'duration': '00:39:21',
                    'generation': {
                        'id': formats.video_cassette_generations.index(
                            'source (original)') + 1,
                        'name': 'source (original)',
                    },
                    'cassette_type': {
                        "name": 'Betamax',
                        "id": formats.video_cassette_types.index('Betamax') + 1,
                    }
                },
                'inspection_date': '12-03-2003',
                'transfer_date': '12-03-2003',
            }
        ),
        (
            {
                'name': 'simple optical',
                'format_id': '8',
                'opticalTitleOfItem': 'dfgs',
            },
            {
                'files': [],
                'format': {
                    'name': 'optical'
                },
                "format_details": {
                    'title_of_item': 'dfgs',
                }
            }
        ),
        (
            {
                'name': 'duration',
                'format_id': '8',
                'opticalTitleOfItem': 'dfgs',
                'opticalDuration': '01:55:01',
            },
            {
                'files': [],
                'format': {
                    'name': 'optical'
                },
                "format_details": {
                    'title_of_item': 'dfgs',
                    'duration': '01:55:01',
                }
            }
        ),
        (
            {
                'name': 'optical type',
                'format_id': '8',
                'opticalTypeId': formats.optical_types.index('CD') + 1,
            },
            {
                'files': [],
                'format': {
                    'name': 'optical'
                },
                "format_details": {
                    'type': {
                        "name": 'CD',
                        "id": formats.optical_types.index('CD') + 1,
                    },
                },
            }
        ),
        (
            {
                'name': 'sdfgsdfgsdg',
                'format_id': '8',
                'opticalTitleOfItem': 'dfgs',
                'opticalLabel': 'ggg',
                'opticalDateOfItem': '05-23-2022',
                'opticalTypeId': formats.optical_types.index('CD') + 1,
                'opticalDuration': '01:55:01',
                'inspectionDate': '05-26-2022',
                'transferDate': '05-18-2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'optical'
                },
                "format_details": {
                    'title_of_item': 'dfgs',
                    'label': 'ggg',
                    'date_of_item': '05-23-2022',
                    'type': {
                        "name": 'CD',
                        "id": formats.optical_types.index('CD') + 1,
                    },
                    'duration': '01:55:01',
                },
                'inspection_date': '05-26-2022',
                'transfer_date': '05-18-2022'
            }
        )
    ], ids=lambda *args: str(args[0].get('name', str(args[0])))
)
def test_create_new_video_cassette(
        app,
        project,
        dummy_object,
        post_data,
        expected_data
):
    with app.test_client() as server:
        server.get("/")
        post_results = server.post(
            url_for(
                "object_new_item",
                project_id=project['id'],
                object_id=dummy_object['object']['object_id']
            ),
            data=post_data
        )
        get_result = server.get(
            url_for('item', item_id=post_results.get_json()['item_id'])
        )
        item = get_result.get_json()['item']

        assert \
            all(key in item for key in expected_data), \
            f"Not all keys match, missing: " \
            f"{list(set(expected_data.keys()).difference(set(item.keys())))}."

        for key, value in expected_data.items():
            if isinstance(value, list):
                assert all(list_item in item[key] for list_item in value)
            elif isinstance(value, dict):
                assert \
                    all(
                        list_item in item[key] for list_item in value.keys()
                    ), \
                    f"subitem missing the following " \
                    f"items {list(set(value).difference(set(item[key])))}"
                assert all(
                    sub_value == item[key][sub_key]
                    for sub_key, sub_value in value.items()
                ), f"expected: {dict(value.items())}. Got: {item[key]}"
            else:
                assert item[key] == value
