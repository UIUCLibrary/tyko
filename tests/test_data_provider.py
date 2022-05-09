from datetime import datetime
from unittest.mock import Mock
from sqlalchemy.orm.session import Session
from tyko import data_provider
import pytest


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
            data_provider.OpticalDataConnector(
                Mock()
            ).create_new_format_item(Mock(spec=Session), data)
        assert getattr(new_item, output_key) == expected_value
