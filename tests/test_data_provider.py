from datetime import datetime
from unittest.mock import Mock
from sqlalchemy.orm.session import Session

import tyko.data_provider.formats
import pytest
import tyko

class TestOpticalDataConnector:
    @pytest.mark.parametrize(
        "output_key, expected_value, data",
        [
            (
                'title_of_item',
                'some item title', {
                    'name': 'some name',
                    'format_id': 8,
                    'opticalTitleOfItem': 'some item title'
                }
            ),
            (
                'label',
                'some label',
                {
                    'name': 'some name',
                    'format_id': 8,
                    'opticalLabel': 'some label',
                }
            ),
            (
                'duration',
                '01:55:01',
                {
                    'name': 'some name',
                    'format_id': 8,
                    'opticalDuration': '01:55:01',
                }
            ),
            (
                'date_of_item',
                datetime(year=2022, month=5, day=23),
                {
                    'name': 'some name',
                    'format_id': 8,
                    'opticalDateOfItem': '5/23/2022',
                }
            ),

        ]
    )
    def test_data(self, output_key, expected_value, data):
        new_item = \
            tyko.data_provider.formats.OpticalDataConnector(
                Mock()
            ).create_new_format_item(Mock(spec=Session), data)
        assert getattr(new_item, output_key) == expected_value


@pytest.mark.parametrize('data_changed, expected_values', [
    (
        {'date_of_cassette': '10/21/1990'},
        {
            'recording_date': datetime(1990, 10, 21, 0, 0),
            'recording_date_precision': 3
        }
    ),
    (
        {'cassette_title': 'new title'},
        {'title_of_cassette': 'new title'}
    ),
    (
        {'generation_id': 1},
        {'generation_id': 1}
    ),
    (
        {'cassette_type_id': 1},
        {'tape_subtype_id': 1}
    ),
    (
        {'side_a_label': 'side a label'},
        {'side_a_label': 'side a label'}
    ),
    (
        {'side_a_duration': '00:01:02'},
        {'side_a_duration': '00:01:02'}
    ),
    (
        {'side_b_label': 'side b label'},
        {'side_b_label': 'side b label'}
    ),
    (
        {'side_b_duration': '00:01:02'},
        {'side_b_duration': '00:01:02'}
    ),
])
def test_update_cassette(data_changed, expected_values):
    item = Mock(spec=tyko.data_provider.formats.formats.AudioCassette)
    tyko.data_provider.data_provider.update_cassette(item, data_changed)
    assert all(
        getattr(item, key) == value for key, value in expected_values.items()
    ), f"expected {expected_values} to be in {item.__dict__}"


@pytest.mark.parametrize(
    'data_changed, expected_values', [
        (
            {'date_of_reel': '10/21/1990'},
            {
                'date_of_reel': datetime(1990, 10, 21, 0, 0),
            }
        ),
        (
            {'title_of_reel': 'spam'},
            {'title_of_reel': 'spam'}
        ),
        (
            {'reel_brand': 'bacon'},
            {'reel_brand': 'bacon'}
        ),
        (
            {'base_id': 1},
            {'base_id': 1},
        ),
        (
            {'format_subtype_id': 1},
            {'subtype_id': 1},
        ),
        (
            {'generation_id': 1},
            {'generation_id': 1},
        ),
        (
            {'duration': '00:01:02'},
            {'duration': '00:01:02'}
        ),
        (
            {'reel_diameter_id': 1},
            {'reel_diameter_id': 1},
        ),
        (
            {'reel_speed_id': 1},
            {'reel_speed_id': 1},
        ),
        (
            {'reel_thickness_id': 1},
            {'reel_thickness_id': 1},
        ),
        (
            {'reel_width_id': 1},
            {'reel_width_id': 1},
        ),
        (
            {'track_configuration_id': 1},
            {'track_configuration_id': 1},
        ),
        (
            {'track_count': 2},
            {'track_count': 2},
        ),
        (
            {'wind_id': 1},
            {'wind_id': 1},
        ),
        (
            {'reel_type': 'plastic'},
            {'reel_type': 'plastic'},
        ),
    ]
)
def test_update_open_reel(data_changed, expected_values):
    item = Mock(spec=tyko.data_provider.formats.formats.OpenReel)
    tyko.data_provider.data_provider.update_open_reel(item, data_changed)
    assert all(
        getattr(item, key) == value for key, value in expected_values.items()
    ), f"expected {expected_values} to be in {item.__dict__}"


