import json

import pytest
from tyko.schema.formats import format_types
from tyko.schema import formats
from flask import url_for


@pytest.fixture()
def project(app):
    with app.test_client() as server:
        server.get("/")
        return server.post(
            url_for('api.projects'),
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
        server.get("/")

        server.get(url_for('site.page_project_new'))
        # server.get("/project/create/")
        project_id = project['id']

        return server.post(
            url_for("api.project_add_object", project_id=project_id),
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
                'dateOfCassette': '12/3/2003',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12/3/2003',
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
                'dateOfCassette': '12/3/2003',
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
                    'date_of_cassette': '12/3/2003',
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
                'dateOfCassette': '12/3/2003',
                'duration': '00:39:21',
                'inspectionDate': '12/3/2003',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12/3/2003',
                    'duration': '00:39:21',
                },
                'inspection_date': '12/3/2003',
            }
        ),
        (
            {
                "name": "DummyTransferDate",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'label':'This is a label',
                'dateOfCassette': '12/3/2003',
                'duration': '00:39:21',
                'inspectionDate': '12/3/2003',
                'transferDate':'12/3/2003',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12/3/2003',
                    'duration': '00:39:21',
                },
                'inspection_date': '12/3/2003',
                'transfer_date': '12/3/2003',
            }
        ),
        (
            {
                "name": "DummyCassetteType",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'label':'This is a label',
                'dateOfCassette': '12/3/2003',
                'cassetteTypeId':
                    formats.VideoCassetteType.default_values.index(
                        'Betamax'
                    ) + 1,
                    # + 1 because the database indexes start at 1 not 0
                'duration': '00:39:21',
                'inspectionDate': '12/3/2003',
                'transferDate':'12/3/2003',
            },
            {
                'files': [],
                'format': {
                    'name': 'video cassette'
                },
                "format_details": {
                    'title_of_cassette': 'Title',
                    'label': 'This is a label',
                    'date_of_cassette': '12/3/2003',
                    'duration': '00:39:21',
                    'cassette_type': {
                        "name": 'Betamax',
                        "id": formats.VideoCassetteType.default_values.index(
                            'Betamax'
                        ) + 1,
                    },
                },
                'inspection_date': '12/3/2003',
                'transfer_date': '12/3/2003',
            }
        ),
        (
            {
                "name": "DummyGeneration",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'label':'This is a label',
                'dateOfCassette': '12/3/2003',
                'duration': '00:39:21',
                'inspectionDate': '12/3/2003',
                'transferDate':'12/3/2003',
                'generationId':
                    formats.VideoCassetteGenerations.default_values.index(
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
                    'date_of_cassette': '12/3/2003',
                    'duration': '00:39:21',
                    'generation': {
                        'id':
                            formats.VideoCassetteGenerations
                                .default_values
                                .index('source (original)') + 1,
                        'name': 'source (original)',
                    }
                },
                'inspection_date': '12/3/2003',
                'transfer_date': '12/3/2003',
            }
        ),
        (
            {
                "name": "DummyALL",
                "format_id": format_types['video cassette'][0],
                'titleOfCassette': 'Title',
                'cassetteTypeId':
                    formats.VideoCassetteType.default_values.index(
                        'Betamax'
                    ) + 1,
                'label':'This is a label',
                'dateOfCassette': '12/3/2003',
                'duration': '00:39:21',
                'inspectionDate': '12/3/2003',
                'transferDate':'12/3/2003',
                'generationId':
                    formats.VideoCassetteGenerations.default_values.index(
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
                    'date_of_cassette': '12/3/2003',
                    'duration': '00:39:21',
                    'generation': {
                        'id':
                            formats.VideoCassetteGenerations
                                .default_values
                                .index('source (original)') + 1,
                        'name': 'source (original)',
                    },
                    'cassette_type': {
                        "name": 'Betamax',
                        "id": formats.VideoCassetteType.default_values.index(
                            'Betamax'
                        ) + 1,
                    }
                },
                'inspection_date': '12/3/2003',
                'transfer_date': '12/3/2003',
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
                'opticalTypeId':
                    formats.OpticalType.default_values.index('CD') + 1,
            },
            {
                'files': [],
                'format': {
                    'name': 'optical'
                },
                "format_details": {
                    'type': {
                        "name": 'CD',
                        "id":
                            formats.OpticalType.default_values.index('CD') + 1,
                    },
                },
            }
        ),
        (
            {
                'name': 'CD',
                'format_id': '8',
                'opticalTitleOfItem': 'dfgs',
                'opticalLabel': 'ggg',
                'opticalDateOfItem': '5/23/2022',
                'opticalTypeId':
                    formats.OpticalType.default_values.index('CD') + 1,
                'opticalDuration': '01:55:01',
                'inspectionDate': '5/26/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'optical'
                },
                "format_details": {
                    'title_of_item': 'dfgs',
                    'label': 'ggg',
                    'date_of_item': '5/23/2022',
                    'type': {
                        "name": 'CD',
                        "id":
                            formats.OpticalType.default_values.index('CD') + 1,
                    },
                    'duration': '01:55:01',
                },
                'inspection_date': '5/26/2022',
                'transfer_date': '5/18/2022'
            }
        ),
        (
            {
                'name': 'open reel simple',
                'format_id': '4',
                'openReelReelTitle': 'The title of the reel',
                'openReelSubTypeId':
                    formats.OpenReelSubType.default_values.index('Video') + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'title_of_reel': 'The title of the reel',
                    'format_subtype': {
                        'name': 'Video',
                        "id": formats.OpenReelSubType.default_values.index(
                            'Video'
                        ) + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }

        ),
        (
            {
                'name': 'open reel width',
                'format_id': '4',
                'openReelReelWidthId':
                    formats.OpenReelReelWidth.default_values.index('1/2') + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'reel_width': {
                        "name": '1/2',
                        "id": formats.OpenReelReelWidth.default_values.index(
                            '1/2'
                        ) + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel reel type',
                'format_id': '4',
                'openReelReelType': 'plastic',
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'reel_type': 'plastic',
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }

        ),
        (
            {
                'name': 'open reel date of reel',
                'format_id': '4',
                'openReelDateOfReel': '5/9/2022',
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'date_of_reel': '5/9/2022',
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel reel size',
                'format_id': '4',
                'openReelReelSize': '7',
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'reel_size': 7,
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel diameter',
                'format_id': '4',
                'openReelReelDiameterId':
                    formats.OpenReelReelDiameter.default_values.index('7') + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'reel_diameter': {
                        "name": '7',
                        "id":
                            formats.OpenReelReelDiameter.default_values.index(
                                '7'
                            ) + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel reel thickness',
                'format_id': '4',
                'openReelReelThicknessId':
                    formats.OpenReelReelThickness.default_values.index(
                        '1.0'
                    ) + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'reel_thickness': {
                        "name": '1.0',
                        "id":
                            formats.OpenReelReelThickness.default_values.index(
                                '1.0'
                            ) + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel reel brand',
                'format_id': '4',
                'openReelReelBrand': 'some brand',
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'reel_brand': 'some brand',
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel base',
                'format_id': '4',
                'openReelReelTitle': 'open reel title',
                'openReelBaseId':
                    formats.OpenReelBase.default_values.index('Acetate') + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'base': {
                        "name": 'Acetate',
                        "id": formats.OpenReelBase.default_values.index(
                            'Acetate'
                        ) + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel wind',
                'format_id': '4',
                'openReelWindId':
                    formats.OpenReelReelWind.default_values.index(
                        'Heads out'
                    ) + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'wind': {
                        "name": 'Heads out',
                        "id": formats.OpenReelReelWind.default_values.index(
                            'Heads out'
                        ) + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel reel speed',
                'format_id': '4',
                'openReelReelSpeedId':
                    formats.OpenReelSpeed.default_values.index('3 3/4') + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'reel_speed': {
                        "name": '3 3/4',
                        "id": formats.OpenReelSpeed.default_values.index(
                            '3 3/4'
                        ) + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel track configuration',
                'format_id': '4',
                'openReelTrackConfigurationId':
                    formats.OpenReelTrackConfiguration.default_values.index(
                        '1/4 track mono'
                    ) + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'track_configuration': {
                        "name": '1/4 track mono',
                        "id":
                            formats.OpenReelTrackConfiguration
                                .default_values
                                .index('1/4 track mono') + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel duration',
                'format_id': '4',
                'openReelDuration': '01:23:33',
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'duration': '01:23:33',
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel generation',
                'format_id': '4',
                'openReelGenerationId':
                    formats.OpenReelGeneration.default_values.index('dub') + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'generation': {
                        "name": 'dub',
                        "id": formats.OpenReelGeneration.default_values.index(
                            'dub'
                        ) + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'open reel all metadata',
                'format_id': '4',
                'openReelReelTitle': 'open reel title',
                'openReelSubTypeId':
                    formats.OpenReelSubType.default_values.index('Video') + 1,
                'openReelReelWidthId':
                    formats.OpenReelReelWidth.default_values.index('1/2') + 1,
                'openReelReelType': 'plastic',
                'openReelDateOfReel': '5/23/2022',
                'openReelTrackCount': '2',
                'openReelReelSize': '7',
                'openReelReelDiameterId':
                    formats.OpenReelReelDiameter.default_values.index('7') + 1,
                'openReelReelThicknessId':
                    formats.OpenReelReelThickness.default_values.index(
                        '1.0'
                    ) + 1,
                'openReelReelBrand': 'some brand',
                'openReelBaseId':
                    formats.OpenReelBase.default_values.index('Acetate') + 1,
                'openReelWindId':
                    formats.OpenReelReelWind.default_values.index(
                        'Heads out'
                    ) + 1,
                'openReelReelSpeedId':
                    formats.OpenReelSpeed.default_values.index('3 3/4') + 1,
                'openReelTrackConfigurationId':
                    formats.OpenReelTrackConfiguration.default_values.index(
                        '1/4 track mono'
                    ) + 1,
                'openReelDuration': '01:23:33',
                'openReelGenerationId':
                    formats.OpenReelGeneration.default_values.index('dub') + 1,
                'inspectionDate': '5/23/2022',
                'transferDate': '5/18/2022'
            },
            {
                'files': [],
                'format': {
                    'name': 'open reel'
                },
                "format_details": {
                    'title_of_reel': 'open reel title',
                    'format_subtype': {
                        'name': 'Video',
                        "id": formats.OpenReelSubType.default_values.index(
                            'Video'
                        ) + 1,
                    },
                    'reel_width': {
                        "name": '1/2',
                        "id": formats.OpenReelReelWidth.default_values.index(
                            '1/2'
                        ) + 1,
                    },
                    'date_of_reel': '5/23/2022',
                    'track_count': 2,
                    'reel_size': 7,
                    'reel_diameter': {
                        "name": "7",
                        "id":
                            formats.OpenReelReelDiameter.default_values.index(
                                '7'
                            ) + 1,
                    },
                    'reel_type': 'plastic',
                    'reel_thickness': {
                        "name": '1.0',
                        "id":
                            formats.OpenReelReelThickness.default_values.index(
                                '1.0'
                            ) + 1,
                    },
                    'reel_brand': 'some brand',
                    'base': {
                        "name": 'Acetate',
                        "id": formats.OpenReelBase.default_values.index(
                            'Acetate'
                        ) + 1,
                    },
                    'wind': {
                        "name": 'Heads out',
                        "id": formats.OpenReelReelWind.default_values.index(
                            'Heads out'
                        ) + 1,
                    },
                    'reel_speed': {
                        "name": '3 3/4',
                        "id": formats.OpenReelSpeed.default_values.index(
                            '3 3/4'
                        ) + 1,
                    },
                    'track_configuration': {
                        "name": '1/4 track mono',
                        "id":
                            formats.OpenReelTrackConfiguration
                                .default_values
                                .index('1/4 track mono') + 1,
                    },
                    'duration': '01:23:33',
                    'generation': {
                        "name": 'dub',
                        "id": formats.OpenReelGeneration.default_values.index(
                            'dub'
                        ) + 1,
                    },
                },
                'inspection_date': '5/23/2022',
                'transfer_date': '5/18/2022',
            }
        ),
        (
            {
                'name': 'groove disc title of album',
                'format_id': '5',
                'groovedDiscTitleOfAlbum': 'title of album',
            },
            {
                "files": [],
                "format_details":{
                    'title_of_album': 'title of album',
                }
            }
        ),
        (
                {
                    'name': 'groove disc title of disc',
                    'format_id': '5',
                    'groovedDiscTitleOfDisc': 'title of disc',
                },
                {
                    "files": [],
                    "format_details": {
                        'title_of_disc': 'title of disc',
                    }
                }
        ),
        (
            {
                'name': 'groove disc side labels',
                'format_id': '5',
                'groovedDiscSideALabel': 'side a',
                'groovedDiscSideBLabel': 'side b',
            },
            {
                "files": [],
                "format_details":{
                    'side_a_label': 'side a',
                    'side_b_label': 'side b',
                },
            }
        ),
        (
            {
                'name': 'groove disc Date Of Disc',
                'format_id': '5',
                'groovedDiscDateOfDisc': '5/16/2022',
            },
            {
                "files": [],
                "format_details":{
                    'date_of_disc': '5/16/2022',
                },
            }
        ),
        (
            {
                'name': 'groove disc Side Duration',
                'format_id': '5',
                'groovedDiscSideADuration': '00:12:21',
                'groovedDiscSideBDuration': '00:12:22',
            },
            {
                "files": [],
                "format_details":{
                    'side_a_duration': '00:12:21',
                    'side_b_duration': '00:12:22',
                },
            }
        ),
        (
            {
                'name': 'groove disc Diameter',
                'format_id': '5',
                'groovedDiscDiscDiameterId':
                    formats.GroovedDiscDiscDiameter
                        .default_values.index('8') + 1,
            },
            {
                "files": [],
                "format_details":{
                    'disc_diameter': {
                        "name": '8',
                        "id":
                            formats
                                .GroovedDiscDiscDiameter
                                .default_values
                                .index('8') + 1,
                    }
                },
            }
        ),
        (
            {
                'name': 'groove disc Material',
                'format_id': '5',
                'groovedDiscTitleOfAlbum': 'title of album',
                'groovedDiscDiscMaterialId':
                    formats.GroovedDiscDiscMaterial.default_values.index(
                        'Shellac/78'
                    ) + 1,
            },
            {
                "files": [],
                "format_details": {
                    "disc_material": {
                        "name": 'Shellac/78',
                        "id":
                            formats.GroovedDiscDiscMaterial
                                .default_values
                                .index('Shellac/78') + 1,
                    }
                },
            }
        ),
        (
            {
                'name': 'groove disc Base',
                'format_id': '5',
                'groovedDiscDiscBaseId':
                    formats.GroovedDiscDiscBase.default_values.index(
                        'Glass'
                    ) + 1
            },
            {
                "files": [],
                "format_details":{
                    'disc_base': {
                        "name": 'Glass',
                        "id": formats.GroovedDiscDiscBase.default_values.index(
                            'Glass'
                        ) + 1,
                    }
                },
            }
        ),
        (
            {
                'name': 'groove disc direction',
                'format_id': '5',
                'groovedDiscDiscDirectionId':
                    formats.GroovedDiscPlaybackDirection.default_values.index(
                        'In to Out',
                    ) + 1,

            },
            {
                "files": [],
                "format_details":{
                    'playback_direction': {
                        "name": 'In to Out',
                        "id":
                            formats
                                .GroovedDiscPlaybackDirection
                                .default_values
                                .index('In to Out') + 1
                    }
                },
            }
        ),
        (
            {
                'name': 'groove disc speed',
                'format_id': '5',
                'groovedDiscPlaybackSpeedId':
                    formats.GroovedDiscPlaybackSpeed.default_values.index(
                        '45',
                    ) + 1,
            },
            {
                "files": [],
                "format_details":{
                    'playback_speed': {
                        "name": '45',
                        "id":
                            formats
                                .GroovedDiscPlaybackSpeed
                                .default_values
                                .index('45') + 1
                    }
                },
            }
        ),
        (
            {
                'name': 'groove inspectionDate',
                'format_id': '5',
                'inspectionDate': '5/18/2022',
            },
            {
                "files": [],
                'inspection_date': '5/18/2022',

            }
        ),
        (
            {
                'name': 'groove disc all metadata',
                'format_id': '5',
                'groovedDiscTitleOfAlbum': 'title of album',
                'groovedDiscTitleOfDisc': 'title of disc',
                'groovedDiscSideALabel': 'side a',
                'groovedDiscSideBLabel': 'side b',
                'groovedDiscDateOfDisc': '5/16/2022',
                'groovedDiscSideADuration': '00:12:21',
                'groovedDiscSideBDuration': '00:12:22',
                'groovedDiscDiscDiameterId':
                    formats.GroovedDiscDiscDiameter.default_values.index(
                        '8'
                    ) + 1,
                'groovedDiscDiscMaterialId':
                    formats.GroovedDiscDiscMaterial.default_values.index(
                        'Shellac/78'
                    ) + 1,
                'groovedDiscDiscBaseId':
                    formats.GroovedDiscDiscBase.default_values.index(
                        'Glass'
                    ) + 1,
                'groovedDiscDiscDirectionId':
                    formats.GroovedDiscPlaybackDirection.default_values.index(
                        'In to Out',
                    ) + 1,
                'groovedDiscPlaybackSpeedId':
                    formats.GroovedDiscPlaybackSpeed.default_values.index(
                        '45',
                    ) + 1,
                'inspectionDate': '5/18/2022',
                'transferDate': '5/19/2022'
            },
            {
                "files": [],
                "format_details":{
                    'title_of_album': 'title of album',
                    'title_of_disc': 'title of disc',
                    'side_a_label': 'side a',
                    'side_b_label': 'side b',
                    'date_of_disc': '5/16/2022',
                    'side_a_duration': '00:12:21',
                    'side_b_duration': '00:12:22',
                    'disc_diameter': {
                        "name": '8',
                        "id":
                            formats
                                .GroovedDiscDiscDiameter
                                .default_values
                                .index('8') + 1,
                    },
                    "disc_material": {
                        "name": 'Shellac/78',
                        "id":
                            formats
                                .GroovedDiscDiscMaterial
                                .default_values
                                .index('Shellac/78') + 1,
                    },
                    'disc_base': {
                        "name": 'Glass',
                        "id": formats.GroovedDiscDiscBase.default_values.index(
                            'Glass'
                        ) + 1,
                    },
                    'playback_direction': {
                        "name": 'In to Out',
                        "id":
                            formats.GroovedDiscPlaybackDirection
                                .default_values
                                .index('In to Out') + 1
                    },
                    'playback_speed': {
                        "name": '45',
                        "id":
                            formats
                                .GroovedDiscPlaybackSpeed
                                .default_values
                                .index('45') + 1
                    },
                },
                'inspection_date': '5/18/2022',
                'transfer_date': '5/19/2022',
            }
        ),
        (
            {
                'name': 'film simple',
                'format_id': '6',
                'filmTitle': 'Title of film',
            },
            {
                "files": [],
                "format_details": {
                    'film_title': 'Title of film',
                },
            }
        ),
        (
            {
                'name': 'film date of film',
                'format_id': '6',
                'filmDate': '5/24/2022',
            },
            {
                "files": [],
                "format_details": {
                    'date_of_film': '5/24/2022',
                },
            }
        ),
        (
            {
                'name': 'film Can label',
                'format_id': '6',
                'filmCanLabel': 'Can label',
            },
            {
                "files": [],
                "format_details": {
                    'can_label': 'Can label',
                },
            }
        ),
        (
            {
                'name': 'film leader label',
                'format_id': '6',
                'filmLeaderLabel': 'Leader Label',
            },
            {
                "files": [],
                "format_details": {
                    'leader_label': 'Leader Label',
                },
            }
        ),
        (
            {
                'name': 'film length',
                'format_id': '6',
                'filmLength': 100,
            },
            {
                "files": [],
                "format_details": {
                    'film_length': 100,
                },
            }
        ),
        (
            {
                'name': 'film duration',
                'format_id': '6',
                'filmDuration': '00:12:21',
            },
            {
                "files": [],
                "format_details": {
                    'duration': '00:12:21',
                },
            }
        ),
        (
            {
                'name': 'film film base',
                'format_id': '6',
                'filmBaseId':
                    formats.FilmFilmBase.default_values.index(
                        'Acetate'
                    ) + 1,
            },
            {
                "files": [],
                "format_details": {
                    'film_base': {
                        "name": 'Acetate',
                        "id":
                            formats
                                .FilmFilmBase
                                .default_values
                                .index('Acetate') + 1
                    },
                },
            }
        ),
        (
            {
                'name': 'film edge code',
                'format_id': '6',
                'filmEdgeCodeDate': '1967',
            },
            {
                "files": [],
                "format_details": {
                    'edge_code_date': 1967,
                },
            }
        ),
        (
            {
                'name': 'film soundtrack',
                'format_id': '6',
                'filmSoundtrackId':
                    formats.FilmSoundtrack.default_values.index(
                        'Magnetic'
                    ) + 1,
            },
            {
                "files": [],
                "format_details": {
                    'soundtrack': {
                        "name": 'Magnetic',
                        "id":
                            formats
                                .FilmSoundtrack
                                .default_values
                                .index('Magnetic') + 1
                    },
                },
            }
        ),
        (
            {
                'name': 'film colors',
                'format_id': '6',
                'filmColorId':
                    formats.FilmColor.default_values.index(
                        'Color'
                    ) + 1,
            },
            {
                "files": [],
                "format_details": {
                    'color': {
                        "name": 'Color',
                        "id":
                            formats
                                .FilmColor
                                .default_values
                                .index('Color') + 1
                    },
                },
            }
        ),
        (
            {
                'name': 'film image type',
                'format_id': '6',
                'filmImageTypeId':
                    formats.FilmImageType.default_values.index(
                        'Positive'
                    ) + 1,
            },
            {
                "files": [],
                "format_details": {
                    'film_image_type': {
                        "name": 'Positive',
                        "id":
                            formats
                                .FilmImageType
                                .default_values
                                .index('Positive') + 1
                    },
                },
            }
        ),
        (
            {
                'name': 'film wind',
                'format_id': '6',
                'filmWindId':
                    formats.FilmWind.default_values.index(
                        'A'
                    ) + 1,
            },
            {
                "files": [],
                "format_details": {
                    'wind': {
                        "name": 'A',
                        "id":
                            formats
                                .FilmWind
                                .default_values
                                .index('A') + 1
                    },
                },
            }
        ),
        (
            {
                'name': 'film emulsion',
                'format_id': '6',
                'filmEmulsionId':
                    formats.FilmEmulsion.default_values.index('In') + 1,
            },
            {
                "files": [],
                "format_details": {
                    'film_emulsion': {
                        "name": 'In',
                        "id":
                            formats
                                .FilmEmulsion
                                .default_values
                                .index('In') + 1
                    },
                },
            }
        ),
        (
            {
                'name': 'film ADStripTest',
                'format_id': '6',
                'filmADStripTest': True,
            },
            {
                "files": [],
                "format_details": {
                    'ad_strip_test': True,
                },
            }
        ),
        (
            {
                'name': 'film AD Strip Test Date',
                'format_id': '6',
                'filmADStripTestDate': '11/5/2022',
            },
            {
                "files": [],
                "format_details": {
                    'ad_test_date': '11/5/2022',
                },
            }
        ),
        (
            {
                'name': 'film AD strip test level',
                'format_id': '6',
                'filmADStripTestLevel': '2',
            },
            {
                "files": [],
                "format_details": {
                    'ad_test_level': '2',
                },
            }
        ),
        (
            {
                'name': 'film shrinkage',
                'format_id': '6',
                'filmShrinkage': '32',
            },
            {
                "files": [],
                "format_details": {
                    'film_shrinkage': 32
                },
            }
        ),
        (
            {
                'name': 'film film speed',
                'format_id': '6',
                'filmSpeedId': formats.FilmFilmSpeed.default_values.index(
                        '24'
                    ) + 1,
            },
            {
                "files": [],
                "format_details": {
                    'film_speed': {
                        "name": '24',
                        "id":
                            formats
                                .FilmFilmSpeed
                                .default_values
                                .index('24') + 1
                    },
                },
            }
        ),
        (
            {
                'name': 'film gauge',
                'format_id': '6',
                'filmGaugeId':
                    formats.FilmFilmGauge.default_values.index('16') + 1,
            },
            {
                "files": [],
                "format_details": {
                    'film_gauge': {
                        "name": '16',
                        "id":
                            formats
                                .FilmFilmGauge
                                .default_values
                                .index('16') + 1
                    },
                },
            }
        ),
        (
            {
                'name': 'film all metadata',
                'format_id': '6',
                'filmTitle': 'Title of film',
                'filmDate': '5/24/2022',
                'filmCanLabel': 'Can label',
                'filmLeaderLabel': 'Leader Label',
                'filmLength': 100,
                'filmSpeedId': formats.FilmFilmSpeed.default_values.index(
                        '24'
                    ) + 1,
                'filmDuration': '00:12:21',
                'filmBaseId':
                    formats.FilmFilmBase.default_values.index(
                        'Acetate'
                    ) + 1,
                'filmEdgeCodeDate': '1967',
                'filmSoundtrackId':
                    formats.FilmSoundtrack.default_values.index(
                        'Magnetic'
                    ) + 1,
                'filmColorId':
                    formats.FilmColor.default_values.index(
                        'Color'
                    ) + 1,
                'filmImageTypeId':
                    formats.FilmImageType.default_values.index(
                        'Positive'
                    ) + 1,
                'filmWindId':
                    formats.FilmWind.default_values.index(
                        'A'
                    ) + 1,
                'filmEmulsionId':
                    formats.FilmEmulsion.default_values.index('In') + 1,
                'filmGaugeId':
                    formats.FilmFilmGauge.default_values.index('16') + 1,
                'filmADStripTest': True,
                'filmADStripTestDate': '11/5/2022',
                'filmADStripTestLevel': '2',
                'filmShrinkage': '32',
                'inspectionDate': '5/18/2022',
                'transferDate': '5/19/2022'
            },
            {
                "files": [],
                "format_details": {
                    'film_title': 'Title of film',
                    'date_of_film': '5/24/2022',
                    'can_label': 'Can label',
                    'leader_label': 'Leader Label',
                    'film_base': {
                        "name": 'Acetate',
                        "id":
                            formats
                                .FilmFilmBase
                                .default_values
                                .index('Acetate') + 1
                    },
                    'film_speed': {
                        "name": '24',
                        "id":
                            formats
                                .FilmFilmSpeed
                                .default_values
                                .index('24') + 1
                    },
                    'edge_code_date': 1967,
                    'soundtrack': {
                        "name": 'Magnetic',
                        "id":
                            formats
                                .FilmSoundtrack
                                .default_values
                                .index('Magnetic') + 1
                    },
                    'color': {
                        "name": 'Color',
                        "id":
                            formats
                                .FilmColor
                                .default_values
                                .index('Color') + 1
                    },
                    'film_image_type': {
                        "name": 'Positive',
                        "id":
                            formats
                                .FilmImageType
                                .default_values
                                .index('Positive') + 1
                    },
                    'wind': {
                        "name": 'A',
                        "id":
                            formats
                                .FilmWind
                                .default_values
                                .index('A') + 1
                    },
                    'film_emulsion': {
                        "name": 'In',
                        "id":
                            formats
                                .FilmEmulsion
                                .default_values
                                .index('In') + 1
                    },
                    'film_gauge': {
                        "name": '16',
                        "id":
                            formats
                                .FilmFilmGauge
                                .default_values
                                .index('16') + 1
                    },
                    'film_length': 100,
                    'duration': '00:12:21',
                    'ad_strip_test': True,
                    'ad_test_date': '11/5/2022',
                    'ad_test_level': '2',
                    'film_shrinkage': 32
                },
                'inspection_date': '5/18/2022',
                'transfer_date': '5/19/2022',
            }
        ),
        (
            {
                'name': 'audio cassette title',
                'format_id': '7',
                'cassetteTitle': 'title of cassette',
            },
            {
                "files": [],
                "format_details": {
                    'cassette_title': 'title of cassette',
                },
            }
        ),
        (
            {
                'name': 'audio cassette date of cassette',
                'format_id': '7',
                'dateOfCassette': '5/19/2022',
            },
            {
                "files": [],
                "format_details": {
                    'date_of_cassette': '5/19/2022',
                },
            }
        ),
        (
            {
                'name': 'audio cassette labels',
                'format_id': '7',
                'cassetteSideALabel': 'Label side A',
                'cassetteSideBLabel': 'Label side B',
            },
            {
                "files": [],
                "format_details": {
                    'side_a_label': 'Label side A',
                    'side_b_label': 'Label side B',
                },
            }
        ),
        (
            {
                'name': 'audio cassette duration',
                'format_id': '7',
                'cassetteSideADuration': '00:11:23',
                'cassetteSideBDuration': '00:31:23',
            },
            {
                "files": [],
                "format_details": {
                    'side_a_duration': '00:11:23',
                    'side_b_duration': '00:31:23',
                },
            }
        ),
        (
            {
                'name': 'audio cassette generation',
                'format_id': '7',
                'generationId':
                    formats.AudioCassetteGeneration.default_values.index(
                        'Dub'
                    ) + 1,
            },
            {
                "files": [],
                "format_details": {
                    'generation': {
                        "name": 'Dub',
                        "id":
                            formats
                                .AudioCassetteGeneration
                                .default_values
                                .index('Dub') + 1
                    },
                },
            }
        ),
        (
            {
                'name': 'audio cassette subtype',
                'format_id': '7',
                'cassetteTypeId':
                    formats.AudioCassetteSubtype.default_values.index(
                        'DAT'
                    ) + 1,
            },
            {
                "files": [],
                "format_details": {
                    'cassette_type': {
                        "name": "DAT",
                        "id":
                            formats.AudioCassetteSubtype.default_values.index(
                                'DAT'
                            ) + 1,
                    },
                },
            }
        ),
        (
            {
                'name': 'audio cassette all metadata',
                'format_id': '7',
                'cassetteTitle': 'title of cassette',
                'dateOfCassette': '5/19/2022',
                'cassetteTypeId':
                    formats.AudioCassetteSubtype.default_values.index(
                        'DAT'
                    ) + 1,
                'generationId':
                    formats.AudioCassetteGeneration.default_values.index(
                        'Dub'
                    ) + 1,
                'cassetteSideALabel': 'Label side A',
                'cassetteSideADuration': '00:11:23',
                'cassetteSideBLabel': 'Label side B',
                'cassetteSideBDuration': '00:31:23',
                'inspectionDate': '5/19/2022',
                'transferDate': '5/13/2022'
            },
            {
                "files": [],
                "format_details": {
                    'cassette_title': 'title of cassette',
                    'date_of_cassette': '5/19/2022',
                    'cassette_type': {
                        "name": "DAT",
                        "id":
                            formats.AudioCassetteSubtype.default_values.index(
                                'DAT'
                            ) + 1,
                    },

                    'generation': {
                        "name": 'Dub',
                        "id":
                            formats
                                .AudioCassetteGeneration
                                .default_values
                                .index('Dub') + 1
                    },
                    'side_a_label': 'Label side A',
                    'side_a_duration': '00:11:23',
                    'side_b_label': 'Label side B',
                    'side_b_duration': '00:31:23',
                },
                'inspection_date': '5/19/2022',
                'transfer_date': '5/13/2022'
            }
        )
    ], ids=lambda *args: str(args[0].get('name', str(args[0])))
)
def test_create_new_item(
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
                "site.object_new_item",
                project_id=project['id'],
                object_id=dummy_object['object']['object_id']
            ),
            data=post_data
        )
        get_result = server.get(
            url_for('api.item', item_id=post_results.get_json()['item_id'])
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
