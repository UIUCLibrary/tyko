import functools

import sqlalchemy
import typing

from sqlalchemy import orm

from . import data_provider
from tyko import utils
from tyko.schema import \
    formats, \
    AudioCassette, \
    CassetteTapeThickness


class FormatConnector(data_provider.ItemDataConnector):
    @staticmethod
    def get_format_type(session, format_id: int):
        return session.query(formats.FormatTypes) \
            .filter(formats.FormatTypes.id == format_id).one()


def verify_unused_params(func):
    @functools.wraps(func)
    def wrapper(connector, session, values):
        metadata = values.copy()
        result = func(connector, session, metadata)
        if metadata:
            raise KeyError(f"Invalid data types: {list(metadata.keys())}")

        return result

    return wrapper


class AudioCassetteDataConnector(FormatConnector):
    @verify_unused_params
    def create_new_format_item(self, session: orm.session, format_data):
        new_cassette = AudioCassette(
            name=format_data.pop('name'),
            format_type=self.get_format_type(
                session,
                int(format_data.pop("format_id"))
            )
        )
        api_data = format_data.pop('format_details', {})
        new_cassette.title_of_cassette = format_data.pop('cassetteTitle', None)
        if new_cassette.title_of_cassette is None:
            api_data.pop('cassette_title', None)

        new_cassette.side_a_label = format_data.pop('cassetteSideALabel', None)
        new_cassette.side_b_label = format_data.pop('cassetteSideBLabel', None)
        new_cassette.side_a_duration = \
            format_data.pop('cassetteSideADuration', None)

        new_cassette.side_b_duration = \
            format_data.pop('cassetteSideBDuration', None)

        if cassette_type_id := format_data.pop(
                'cassetteTypeId',
                None
        ):
            new_cassette.tape_subtype = \
                session.query(formats.AudioCassetteSubtype).filter(
                    formats.AudioCassetteSubtype.table_id == cassette_type_id
                ).one()

        if gen_id := format_data.pop('generationId', None):
            generation = \
                session.query(
                    formats.AudioCassetteGeneration
                ).filter(
                    formats.AudioCassetteGeneration.table_id == int(gen_id)
                ).one()
            new_cassette.generation = generation

        if date_of_cassette := format_data.pop('dateOfCassette', None):
            new_cassette.recording_date = \
                utils.create_precision_datetime(date_of_cassette, 3)
        if new_cassette.recording_date is None:
            if date_of_cassette := api_data.pop('date_of_cassette', None):
                new_cassette.recording_date = \
                    utils.create_precision_datetime(date_of_cassette, 3)

        return new_cassette

    @staticmethod
    def _add_optional_args(new_cassette, **params):
        tape_thickness_id = params.get('tape_type_id')
        if tape_thickness_id is not None and str(tape_thickness_id) != "":
            new_cassette.tape_thickness_id = int(tape_thickness_id)

        date_inspected = params.get('inspection_date')
        if date_inspected is not None and date_inspected.strip() != "":
            new_cassette.inspection_date = \
                utils.create_precision_datetime(date_inspected)

        tape_type_id = params.get('tape_type_id')
        if tape_type_id is not None and str(tape_type_id) != "":
            new_cassette.tape_type_id = int(tape_type_id)

        date_recorded = params.get("date_recorded")
        if date_recorded is not None and str(date_recorded) != "":
            date_prec = utils.identify_precision(date_recorded)

            new_cassette.recording_date = utils.create_precision_datetime(
                date=date_recorded,
                precision=date_prec
            )
            new_cassette.recording_date_precision = date_prec

        tape_thickness_id = params.get('tape_thickness_id')
        if tape_thickness_id:
            new_cassette.tape_thickness_id = tape_thickness_id


class CassetteTapeThicknessConnector(data_provider.EnumConnector):
    enum_table = CassetteTapeThickness

    def get(self, id=None, serialize=False):
        session = self.session_maker()
        try:
            if id is not None:
                cassette_types = session.query(self.enum_table).filter(
                    CassetteTapeThickness.table_id == id
                )
            else:
                cassette_types = session.query(self.enum_table).all()
            if serialize is False:
                return cassette_types

            enum_types = []
            for i in cassette_types:
                enum_types.append(i.serialize())

            if id is not None:
                return enum_types[0]
            return enum_types
        finally:
            session.close()

    def create(self, *args, **kwargs):
        session = self.session_maker()
        value = kwargs['value']
        unit = kwargs['unit']
        try:
            new_thickness = \
                CassetteTapeThickness(value=value, unit=unit)

            session.add(new_thickness)
            session.commit()
            return new_thickness.serialize()
        finally:
            session.close()

    def update(self, id, changed_data):
        session = self.session_maker()
        try:
            matching_enum = self.get_by_id(session, id, False)
            if "value" in changed_data:
                matching_enum.value = changed_data['value']
            if "unit" in changed_data:
                matching_enum.unit = changed_data['unit']

            session.commit()
            return matching_enum.serialize()
        finally:
            session.close()


class OpticalDataConnector(FormatConnector):
    @verify_unused_params
    def create_new_format_item(self, session, format_data) -> formats.AVFormat:
        new_item = formats.Optical(
            name=format_data.pop('name'),
            format_type=self.get_format_type(
                session, int(format_data.pop("format_id"))
            )
        )

        new_item.title_of_item = format_data.pop('opticalTitleOfItem', None)

        new_item.label = format_data.pop('opticalLabel', None)

        if date_of_item := format_data.pop('opticalDateOfItem', None):
            new_item.date_of_item = \
                typing.cast(
                    sqlalchemy.Column[sqlalchemy.Date],
                    utils.create_precision_datetime(date_of_item)
                )

        new_item.duration = format_data.pop('opticalDuration', None)

        if optical_type_id := format_data.pop('opticalTypeId', None):
            new_item.optical_type = \
                session.query(formats.OpticalType).filter(
                    formats.OpticalType.table_id == int(
                        optical_type_id
                    )
                ).one()
        return new_item


class FilmDataConnector(FormatConnector):
    @verify_unused_params
    def create_new_format_item(self, session, format_data):
        new_item = formats.Film(
            name=format_data.pop('name'),
            format_type=self.get_format_type(
                session, int(format_data.pop("format_id"))
            )
        )
        new_item.title_of_film = format_data.pop('filmTitle', None)
        new_item.film_shrinkage = format_data.pop('filmShrinkage', None)
        new_item.can_label = format_data.pop('filmCanLabel', None)
        new_item.leader_label = format_data.pop('filmLeaderLabel', None)
        new_item.length = format_data.pop('filmLength', None)
        new_item.duration = format_data.pop('filmDuration', None)
        new_item.ad_test_level = format_data.pop('filmADStripTestLevel', None)

        if film_edge_code_date := format_data.pop('filmEdgeCodeDate', None):
            new_item.edge_code_date = int(film_edge_code_date)

        self._add_date_values(new_item, format_data)

        self._add_enum_values(new_item, format_data, session)

        return new_item

    def _add_enum_values(self, item, format_data, session):
        if base_id := format_data.pop('filmBaseId', None):
            item.film_base = session.query(formats.FilmFilmBase).filter(
                formats.FilmFilmBase.table_id == int(base_id)
            ).one()
        if soundtrack_id := format_data.pop('filmSoundtrackId', None):
            item.soundtrack = session.query(formats.FilmSoundtrack).filter(
                formats.FilmSoundtrack.table_id == int(soundtrack_id)
            ).one()
        if color_id := format_data.pop('filmColorId', None):
            item.color = session.query(formats.FilmColor).filter(
                formats.FilmColor.table_id == int(color_id)
            ).one()
        if image_type_id := format_data.pop('filmImageTypeId', None):
            item.image_type = session.query(formats.FilmImageType).filter(
                formats.FilmImageType.table_id == int(image_type_id)
            ).one()
        if wind_id := format_data.pop('filmWindId', None):
            item.wind = session.query(formats.FilmWind).filter(
                formats.FilmWind.table_id == int(wind_id)
            ).one()
        if film_emulsion_id := format_data.pop('filmEmulsionId', None):
            item.emulsion = session.query(formats.FilmEmulsion).filter(
                formats.FilmEmulsion.table_id == int(film_emulsion_id)
            ).one()
        if film_speed_id := format_data.pop('filmSpeedId', None):
            item.film_speed = session.query(formats.FilmFilmSpeed).filter(
                formats.FilmFilmSpeed.table_id == int(film_speed_id)
            ).one()
        if film_gauge_id := format_data.pop('filmGaugeId', None):
            item.film_gauge = session.query(formats.FilmFilmGauge).filter(
                formats.FilmFilmGauge.table_id == int(film_gauge_id)
            ).one()

    def _add_date_values(self, item, format_data) -> None:
        if film_ad_strip_test := format_data.pop('filmADStripTest', None):
            item.ad_test = bool(film_ad_strip_test)

        if film_date := format_data.pop('filmDate', None):
            item.date_of_film = \
                utils.create_precision_datetime(film_date, 3)
        if film_ad_strip_test_date := format_data.pop(
                'filmADStripTestDate',
                None
        ):
            item.ad_test_date = \
                utils.create_precision_datetime(film_ad_strip_test_date, 3)


class GroovedDiscDataConnector(FormatConnector):
    @verify_unused_params
    def create_new_format_item(self, session, format_data):
        new_item = formats.GroovedDisc(
            name=format_data.pop('name'),
            format_type=self.get_format_type(
                session, int(format_data.pop("format_id"))
            )
        )
        new_item.title_of_album = \
            format_data.pop('groovedDiscTitleOfAlbum', None)

        new_item.title_of_disc = \
            format_data.pop('groovedDiscTitleOfDisc', None)

        new_item.side_a_label = format_data.pop('groovedDiscSideALabel', None)
        new_item.side_b_label = format_data.pop('groovedDiscSideBLabel', None)
        if date_of_disc := format_data.pop(
                'groovedDiscDateOfDisc',
                None
        ):
            new_item.date_of_disc = \
                utils.create_precision_datetime(date_of_disc)

        new_item.side_a_duration = \
            format_data.pop('groovedDiscSideADuration', None)

        new_item.side_b_duration = \
            format_data.pop('groovedDiscSideBDuration', None)

        if diameter_id := format_data.pop('groovedDiscDiscDiameterId', None):
            try:
                new_item.disc_diameter = \
                    session.query(
                        formats.GroovedDiscDiscDiameter
                    ).filter(
                        formats
                        .GroovedDiscDiscDiameter
                        .table_id == int(diameter_id)
                    ).one()
            except sqlalchemy.exc.NoResultFound as e:
                raise KeyError(f"No enum found for id: {diameter_id}") from e

        if disc_material_id := format_data.pop(
                'groovedDiscDiscMaterialId',
                None
        ):
            new_item.disc_material = \
                session.query(
                    formats.GroovedDiscDiscMaterial
                ).filter(
                    formats
                    .GroovedDiscDiscMaterial
                    .table_id == int(disc_material_id)
                ).one()

        if disc_base_id := format_data.pop('groovedDiscDiscBaseId', None):
            new_item.disc_base = \
                session.query(
                    formats.GroovedDiscDiscBase
                ).filter(
                    formats.GroovedDiscDiscBase.table_id == int(disc_base_id)
                ).one()

        if disc_direction_id := format_data.pop(
                'groovedDiscDiscDirectionId',
                None
        ):
            new_item.playback_direction = \
                session.query(
                    formats.GroovedDiscPlaybackDirection
                ).filter(
                    formats
                    .GroovedDiscPlaybackDirection
                    .table_id == int(disc_direction_id)
                ).one()

        if disc_speed_id := format_data.pop(
                'groovedDiscPlaybackSpeedId',
                None
        ):
            new_item.playback_speed = \
                session.query(
                    formats.GroovedDiscPlaybackSpeed
                ).filter(
                    formats
                    .GroovedDiscPlaybackSpeed
                    .table_id == int(disc_speed_id)
                ).one()

        return new_item


class OpenReelDataConnector(FormatConnector):
    @verify_unused_params
    def create_new_format_item(self, session, format_data):
        new_item = formats.OpenReel(
            name=format_data.pop('name'),
            format_type=self.get_format_type(
                session, int(format_data.pop("format_id"))
            )
        )
        new_item.title_of_reel = format_data.pop('openReelReelTitle', None)
        new_item.reel_type = format_data.pop('openReelReelType', None)
        new_item.track_count = format_data.pop('openReelTrackCount', None)
        new_item.reel_size = format_data.pop('openReelReelSize', None)
        new_item.reel_brand = format_data.pop('openReelReelBrand', None)
        new_item.duration = format_data.pop('openReelDuration', None)

        if subtype_id := format_data.pop('openReelSubTypeId', None):
            new_item.subtype = session.query(formats.OpenReelSubType).filter(
                formats.OpenReelSubType.table_id == subtype_id
            ).one()

        if reel_width_id := format_data.pop('openReelReelWidthId', None):
            new_item.reel_width = \
                session.query(
                    formats.OpenReelReelWidth
                ).filter(
                    formats.OpenReelReelWidth.table_id == reel_width_id
                ).one()

        if reel_diameter_id := format_data.pop('openReelReelDiameterId', None):
            new_item.reel_diameter = \
                session.query(
                    formats.OpenReelReelDiameter
                ).filter(
                    formats.OpenReelReelDiameter.table_id == reel_diameter_id
                ).one()

        if reel_thickness_id := format_data.pop(
                'openReelReelThicknessId', None
        ):
            new_item.reel_thickness = \
                session.query(
                    formats.OpenReelReelThickness
                ).filter(
                    formats.OpenReelReelThickness.table_id == reel_thickness_id
                ).one()

        if base_id := format_data.pop('openReelBaseId', None):
            new_item.base = session.query(formats.OpenReelBase).filter(
                formats.OpenReelBase.table_id == base_id
            ).one()

        if wind_id := format_data.pop('openReelWindId', None):
            new_item.wind = session.query(formats.OpenReelReelWind).filter(
                formats.OpenReelReelWind.table_id == wind_id
            ).one()

        if reel_speed_id := format_data.pop('openReelReelSpeedId', None):
            new_item.reel_speed = session.query(formats.OpenReelSpeed).filter(
                formats.OpenReelSpeed.table_id == reel_speed_id
            ).one()

        if configuration_id := format_data.pop(
                'openReelTrackConfigurationId',
                None
        ):
            new_item.track_configuration = session.query(
                formats.OpenReelTrackConfiguration
            ).filter(
                formats.OpenReelTrackConfiguration.table_id == configuration_id
            ).one()

        if generation_id := format_data.pop('openReelGenerationId', None):
            new_item.generation = \
                session.query(formats.OpenReelGeneration).filter(
                    formats.OpenReelGeneration.table_id == generation_id
                ).one()

        if open_reel_date_of_reel := format_data.pop(
                'openReelDateOfReel',
                None
        ):
            new_item.date_of_reel = \
                utils.create_precision_datetime(
                    open_reel_date_of_reel
                )
        return new_item


class VideoCassetteDataConnector(FormatConnector):
    @verify_unused_params
    def create_new_format_item(self, session, format_data):
        self.cleanup_nulls(format_data)
        new_item = formats.VideoCassette(
            name=format_data.pop('name'),
            format_type=self.get_format_type(
                session, int(format_data.pop("format_id"))
            )
        )

        new_item.title_of_cassette = format_data.pop('titleOfCassette', None)

        new_item.label = format_data.pop('label', None)

        if "dateOfCassette" in format_data:
            new_item.date_of_cassette = \
                utils.create_precision_datetime(
                    format_data.pop('dateOfCassette'),
                )

        new_item.duration = format_data.pop('duration', None)

        if cassette_type_id := format_data.pop('cassetteTypeId', None):
            new_item.cassette_type = \
                session.query(formats.VideoCassetteType).filter(
                    formats.VideoCassetteType.table_id == cassette_type_id
                ).one()

        if gen_id := format_data.pop('generationId', None):
            generation = \
                session.query(
                    formats.VideoCassetteGenerations
                ).filter(
                    formats.VideoCassetteGenerations.table_id == int(gen_id)
                ).one()
            new_item.generation = generation
        return new_item

    @staticmethod
    def cleanup_nulls(metadata):
        fields = [
            'dateOfCassette',
            'inspectionDate',
            'transferDate',
            'generationId'
        ]
        for field in fields:
            if field not in metadata:
                continue
            if metadata[field].strip() == '':
                del metadata[field]
