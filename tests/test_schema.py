import pytest
from tyko import schema
from datetime import datetime


class TestVideoCassette:
    @pytest.mark.parametrize(
        'key,value',
        [
            ('title_of_cassette', 'spam'),
        ]
    )
    def test_format_details_simple(self, key, value):
        video_cassette = schema.formats.VideoCassette(**{
            key: value
        })
        details = video_cassette.format_details()
        assert details[key] == value

    @pytest.mark.parametrize(
        'key,value',
        [
            ('date_of_cassette', '12-03-2003'),
            ('transfer_date', '12-03-2003'),
            ('inspection_date', '12-03-2003'),
        ]
    )
    def test_format_details_dates(self, key, value):
        video_cassette = schema.formats.VideoCassette(**{
            key: datetime.strptime(value, "%m-%d-%Y",)
        })
        details = video_cassette.format_details()
        assert details[key] == value
