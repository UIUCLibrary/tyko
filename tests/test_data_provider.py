from datetime import datetime
from unittest.mock import Mock
from sqlalchemy.orm.session import Session, sessionmaker
from sqlalchemy.orm import Query
import pytest
import tyko.data_provider.formats
from tyko import data_provider
from tyko.schema import objects, formats
import tyko
from tyko.exceptions import NotValidRequest, DataError


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


@pytest.mark.parametrize(
    'data_changed, expected_values', [
        (
            {'title_of_album': 'spam'},
            {'title_of_album': 'spam'}
        ),
        (
            {'title_of_disc': 'spam'},
            {'title_of_disc': 'spam'}
        ),
        (
            {'disc_base_id': 1},
            {'disc_base_id': 1}
        ),
        (
            {'disc_diameter_id': 1},
            {'disc_diameter_id': 1}
        ),
        (
            {'playback_direction_id': 1},
            {'playback_direction_id': 1}
        ),
        (
            {'disc_material_id': 1},
            {'disc_material_id': 1}
        ),
        (
            {'playback_speed_id': 1},
            {'playback_speed_id': 1}
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
        (
            {'date_of_disc': '10/21/1990'},
            {
                'date_of_disc': datetime(1990, 10, 21, 0, 0),
            }
        ),
    ]
)
def test_update_groove_discs(data_changed, expected_values):
    item = Mock(spec=tyko.data_provider.formats.formats.GroovedDisc)
    tyko.data_provider.data_provider.update_groove_discs(item, data_changed)
    assert all(
        getattr(item, key) == value for key, value in expected_values.items()
    ), f"expected {expected_values} to be in {item.__dict__}"


@pytest.mark.parametrize(
    'data_changed, expected_values', [
        (
            {'date_of_film': '10/21/1990'},
            {'recording_date': datetime(1990, 10, 21, 0, 0)}
        ),
        (
            {'can_label': 'spam'},
            {'can_label': 'spam'}
        ),
        (
            {'film_title': 'bacon'},
            {'title_of_film': 'bacon'}
        ),
        (
            {'leader_label': 'eggs'},
            {'leader_label': 'eggs'}
        ),
        (
            {'duration': '00:01:02'},
            {'duration': '00:01:02'}
        ),
        (
            {'edge_code_date': 1920},
            {'edge_code_date': 1920}
        ),
        (
            {'film_length': 500},
            {'length': 500}
        ),
        (
            {'film_shrinkage': 24},
            {'film_shrinkage': 24}
        ),
        (
            {'film_color_id': 1},
            {'color_id': 1}
        ),
        (
            {'film_base_id': 1},
            {'film_base_id': 1}
        ),
        (
            {'film_emulsion_id': 1},
            {'emulsion_id': 1}
        ),
        (
            {'image_type_id': 1},
            {'image_type_id': 1}
        ),
        (
            {'film_speed_id': 1},
            {'film_speed_id': 1}
        ),
        (
            {'film_gauge_id': 1},
            {'film_gauge_id': 1}
        ),
        (
            {'soundtrack_id': 1},
            {'soundtrack_id': 1}
        ),
        (
            {'wind_id': 1},
            {'wind_id': 1}
        ),
    ])
def test_update_film(data_changed, expected_values):
    item = Mock(spec=tyko.data_provider.formats.formats.Film)
    tyko.data_provider.data_provider.update_film(item, data_changed)
    assert all(
        getattr(item, key) == value for key, value in expected_values.items()
    ), f"expected {expected_values} to be in {item.__dict__}"


@pytest.mark.parametrize(
    'data_changed, expected_values', [
        (
            {'date_of_item': '10/21/1990'},
            {'date_of_item': datetime(1990, 10, 21, 0, 0)}
        ),
        (
            {'title_of_item': 'spam'},
            {'title_of_item': 'spam'}
        ),
        (
            {'label': 'spam'},
            {'label': 'spam'}
        ),
        (
            {'duration': '00:01:02'},
            {'duration': '00:01:02'}
        ),
        (
            {'type_id': 1},
            {'optical_type_id': 1}
        ),
    ])
def test_update_optical(data_changed, expected_values):
    item = Mock(spec=tyko.data_provider.formats.formats.Optical)
    tyko.data_provider.data_provider.update_optical(item, data_changed)
    assert all(
        getattr(item, key) == value for key, value in expected_values.items()
    ), f"expected {expected_values} to be in {item.__dict__}"


@pytest.mark.parametrize(
    'data_changed, expected_values', [
        (
            {'date_of_cassette': '10/21/1990'},
            {'date_of_cassette': datetime(1990, 10, 21, 0, 0)}
        ),
        (
            {'label': 'my label'},
            {'label': 'my label'},
        ),
        (
            {'duration': '00:01:02'},
            {'duration': '00:01:02'}
        ),
        (
            {'title_of_cassette': 'my title'},
            {'title_of_cassette': 'my title'}
        ),
        (
            {'generation_id': 1},
            {'generation_id': 1}
        ),
        (
            {'cassette_type_id': 1},
            {'cassette_type_id': 1}
        )
])
def test_update_video_cassette(data_changed, expected_values):
    item = Mock(spec=tyko.data_provider.formats.formats.VideoCassette)
    tyko.data_provider.data_provider.update_video_cassette(item, data_changed)
    assert all(
        getattr(item, key) == value for key, value in expected_values.items()
    ), f"expected {expected_values} to be in {item.__dict__}"


class TestItemDataConnector:
    def test_invalid_request_raises(self):
        def query(*args):
            if args[0] == objects.CollectionObject:
                mock_object = Mock()
                return Mock(
                        spec=Query,
                        name='Query',
                        filter=Mock(
                            name='filter',
                            return_value=Mock(
                                all=Mock(
                                    name='all',
                                    return_value=[mock_object]
                                )
                            )
                        )
                    )
            if args[0] == formats.FormatTypes:
                mock_format = Mock()
                return Mock(
                    spec=Query,
                    name='Query',
                    filter=Mock(
                        name='filter',
                        return_value=Mock(
                            one=Mock(
                                name='one',
                                return_value=mock_format
                            ),
                            all=Mock(
                                name='one',
                                return_value=[mock_format]
                            ),
                        )
                    )
                )
            if args[0] in [
                formats.Film,
                formats.AudioCassette,
                formats.AudioVideo,
                formats.GroovedDisc,
                formats.OpenReel,
                formats.VideoCassette,
                formats.CollectionItem,
                formats.AVFormat,
            ]:
                mock_format = Mock(spec=args[0])
                return Mock(
                    spec=Query,
                    name='Query',
                    all=Mock(
                        name='all',
                        return_value=['mock_format']
                    ),
                    filter=Mock(
                        name='filter',
                        return_value=Mock(
                            one=Mock(
                                name='one',
                                return_value=mock_format
                            ),
                            all=Mock(
                                name='one',
                                return_value=[]
                            ),
                        )
                    )
                )
            else:
                print('d')
        session = Mock(
            name='session',
            spec=Session,
            query=query
        )
        mock_sessionmaker = Mock(spec=sessionmaker, return_value=session)
        with pytest.raises(NotValidRequest):
            connector = data_provider.ItemDataConnector(mock_sessionmaker)
            connector.get(id=1)
            # connector.get(id=1, serialize=True)

    def test_create_with_barcode(self):
        mock_object = Mock(spec=objects.CollectionObject)

        def query(*args):
            if args[0] == objects.CollectionObject:
                return Mock(
                        spec=Query,
                        name='Query',
                        filter=Mock(
                            name='filter',
                            return_value=Mock(
                                all=Mock(
                                    name='all',
                                    return_value=[mock_object]
                                )
                            )
                        )
                    )
            if args[0] == formats.FormatTypes:
                mock_format = Mock()
                return Mock(
                    spec=Query,
                    name='Query',
                    filter=Mock(
                        name='filter',
                        return_value=Mock(
                            one=Mock(
                                name='one',
                                return_value=mock_format
                            )
                        )
                    )
                )
            if args[0] in [
                formats.Film,
                formats.AudioCassette,
                formats.AudioVideo,
                formats.GroovedDisc,
                formats.OpenReel,
                formats.CollectionItem,
            ]:
                mock_format = Mock()
                return Mock(
                    spec=Query,
                    name='Query',
                    all=Mock(
                        name='all',
                        return_value=[mock_format]
                    )
                )
        session = Mock(
            name='session',
            spec=Session,
            query=query
        )
        session.add=Mock(name='add')
        mock_sessionmaker = Mock(spec=sessionmaker, return_value=session)

        connector = data_provider.ObjectDataConnector(mock_sessionmaker)
        format_data = {
            "format_id": '7',
            "name": "spam",
            "inspectionDate": "12/20/2000",
            "itemBarcode": "12345"
        }
        connector.add_item(1, format_data)
        assert session.add.called is True
        assert all([
            session.add.call_args[0][0].name == 'spam',
            session.add.call_args[0][0].barcode == '12345'
        ])

    def test_remove_treatment_deletes(self, monkeypatch):
        treatment = Mock(id=2)
        item = Mock(spec=formats.CollectionItem, treatments=[
            treatment
        ])
        def query(*args):
            if args[0] == formats.AVFormat:
                return Mock(
                        spec=Query,
                        name='Query',
                        filter=Mock(
                            name='filter',
                            return_value=Mock(
                                one=Mock(
                                    name='one',
                                    return_value=item
                                )
                            )
                        )
                    )
        session = Mock(
            name='session',
            spec=Session,
            query=query,
        )
        mock_sessionmaker = Mock(spec=sessionmaker, return_value=session)
        connector = data_provider.ItemDataConnector(mock_sessionmaker)
        monkeypatch.setattr(
            data_provider.ItemDataConnector,
            "_get_item",
            lambda *args, **kwargs: item
        )
        connector.remove_treatment(2, {"id": 2})
        assert session.delete.called is True

    def test_add_treatment_appends(self):
        item = Mock(formats.CollectionItem)
        def query(*args):
            if args[0] == formats.AVFormat:
                return Mock(
                        spec=Query,
                        name='Query',
                        filter=Mock(
                            name='filter',
                            return_value=Mock(
                                one=Mock(
                                    name='one',
                                    return_value=item
                                )
                            )
                        )
                    )
        session = Mock(
            name='session',
            spec=Session,
            query=query
        )
        mock_sessionmaker = Mock(spec=sessionmaker, return_value=session)
        connector = data_provider.ItemDataConnector(mock_sessionmaker)
        connector.add_treatment(2, {"message": "dummy"})
        assert item.treatments.append.called is True
    def test_get_treatment(self):

        mock_treatment = Mock(id=2, serialize=Mock(return_value={"id":2}))
        item = Mock(
            formats.CollectionItem,
            treatments=[
                Mock(id=1, serialize=Mock(return_value={"id": 1})),
                mock_treatment,
            ]
        )

        def query(*args):
            if args[0] == formats.AVFormat:
                return Mock(
                    spec=Query,
                    name='Query',
                    filter=Mock(
                        name='filter',
                        return_value=Mock(
                            one=Mock(
                                name='one',
                                return_value=item
                            )
                        )
                    )
                )
        session = Mock(
            name='session',
            spec=Session,
            query=query
        )
        mock_sessionmaker = Mock(spec=sessionmaker, return_value=session)
        connector = data_provider.ItemDataConnector(mock_sessionmaker)
        treatment = connector.get_treatment(item_id=1, treatment_id=2)
        assert treatment['id'] == 2

    def test_get_treatment_invalid_raises_exception(self):

        item = Mock(
            formats.CollectionItem,
            treatments=[]
        )

        def query(*args):
            if args[0] == formats.AVFormat:
                return Mock(
                    spec=Query,
                    name='Query',
                    filter=Mock(
                        name='filter',
                        return_value=Mock(
                            one=Mock(
                                name='one',
                                return_value=item
                            )
                        )
                    )
                )
        session = Mock(
            name='session',
            spec=Session,
            query=query
        )
        mock_sessionmaker = Mock(spec=sessionmaker, return_value=session)
        connector = data_provider.ItemDataConnector(mock_sessionmaker)
        with pytest.raises(DataError):
            connector.get_treatment(item_id=1, treatment_id=3)
