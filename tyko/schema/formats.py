from __future__ import annotations
import abc
import datetime
import typing
import warnings
from abc import ABC

from typing import Tuple, TYPE_CHECKING, Mapping, Union, Type
import re
import sqlalchemy as db
from sqlalchemy.orm import relationship
from tyko import utils
from tyko.schema.avtables import AVTables, SerializedData

if TYPE_CHECKING:
    from tyko.schema.objects import CollectionObject  # noqa: F401
    from tyko.schema.treatment import Treatment  # noqa: F401
    from tyko.schema.instantiation import InstantiationFile  # noqa: F401
    from tyko.schema.notes import Note  # noqa:
    from sqlalchemy import Column, Date

item_has_notes_table = db.Table(
    "item_has_notes",
    AVTables.metadata,
    db.Column("notes_id", db.Integer, db.ForeignKey("notes.note_id")),
    db.Column("item_id", db.Integer, db.ForeignKey("formats.item_id"))
)


class AVFormat(AVTables, abc.ABC):
    __tablename__ = 'formats'
    name = db.Column("name", db.Text)
    type = db.Column(db.Text())
    FK_TABLE_ID = "formats.item_id"
    table_id = db.Column(
        "item_id",
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    __mapper_args__ = {
        'polymorphic_identity': 'formats',
        'polymorphic_on': type
    }
    obj_sequence = db.Column("obj_sequence", db.Integer)

    object_id = db.Column(db.ForeignKey("tyko_object.object_id"))
    object = relationship('CollectionObject', back_populates="items")

    notes = relationship("Note",
                         secondary=item_has_notes_table,
                         backref="item_source"
                         )

    format_type_id = db.Column(db.Integer,
                               db.ForeignKey("format_types.format_id"))

    transfer_date = db.Column("transfer_date", db.Date)
    inspection_date = db.Column("inspection_date", db.Date)

    format_type = relationship("FormatTypes", foreign_keys=[format_type_id])
    files = relationship("InstantiationFile", backref="file_source")
    treatments = relationship("Treatment", backref="treatment_id")
    barcode = db.Column("barcode", db.Text)

    vendor_name = db.Column("vendor_name", db.Text)
    deliverable_received_date = db.Column("deliverable_received_date", db.Date)
    originals_received_date = db.Column("originals_received_date", db.Date)

    def _iter_files(self, recurse=False):
        for file_ in self.files:
            if recurse is True:
                yield file_.serialize(recurse=True)
            else:
                yield {
                    "name": file_.file_name,
                    "id": file_.file_id,
                    "generation": file_.generation
                }

    def _iter_treatment(self):
        yield from self.treatments

    def _iter_notes(self):
        yield from self.notes

    def format_details(self) -> Mapping[str, SerializedData]:
        return {}

    def vendor_info(self):
        return {
            "vendor_name": self.vendor_name,
            "deliverable_received_date":
                utils.serialize_precision_datetime(
                    self.deliverable_received_date
                ) if self.deliverable_received_date is not None else None,
            "originals_received_date":
                utils.serialize_precision_datetime(
                    self.originals_received_date
                ) if self.originals_received_date is not None else None

        }

    def serialize(self, recurse=False) -> Mapping[str, SerializedData]:

        data: typing.Dict[str, SerializedData] = {
            "item_id": self.table_id,
            "name": self.name,
            "files": list(self._iter_files(recurse)),
            "parent_object_id": self.object_id,
            "obj_sequence": self.obj_sequence,
            "notes": [note.serialize() for note in self._iter_notes()],
            "barcode": self.barcode,
            "treatment": [
                treatment.serialize() for treatment in self._iter_treatment()
            ],
        }

        # for treatment in self.treatments:
        #     if treatment.treatment_type not in data['treatment']:
        #         data['treatment'][treatment.treatment_type] = []
        #     data['treatment'][treatment.treatment_type].append(treatment.message)

        try:
            data["format"] = self.format_type.serialize()
            data["format_id"] = self.format_type_id
        except AttributeError:
            data["format"] = None
            data["format_id"] = None

        data['format_details'] = self.format_details()

        data["inspection_date"] = \
            utils.serialize_precision_datetime(
                self.inspection_date
            ) if self.inspection_date is not None else None

        data['vendor'] = self.vendor_info()

        data['transfer_date'] = \
            utils.serialize_precision_datetime(
                self.transfer_date,
                3
            ) if self.transfer_date is not None else None

        return data


class FormatTypes(AVTables):
    __tablename__ = "format_types"

    id = db.Column(
        "format_id", db.Integer, primary_key=True, autoincrement=True)

    name = db.Column("name", db.Text)

    def serialize(self, recurse=False) -> Mapping[str, SerializedData]:
        return {
            "id": self.id,
            "name": self.name
        }


# ###############################  AV Formats #################################

class OpenReel(AVFormat):
    __tablename__ = "open_reels"
    __mapper_args__ = {'polymorphic_identity': 'open_reels'}
    table_id = db.Column(db.Integer, db.ForeignKey(AVFormat.table_id),
                         primary_key=True)
    date_of_reel = db.Column(
        "date_recorded", db.Date
    )
    title_of_reel = db.Column("title_of_reel", db.Text)

    subtype_id = db.Column(
        db.Integer,
        db.ForeignKey("open_reel_sub_type.table_id")
    )
    subtype = relationship("OpenReelSubType")

    reel_width_id = db.Column(
        db.Integer,
        db.ForeignKey("open_reel_reel_width.table_id")
    )
    reel_width = relationship("OpenReelReelWidth")

    reel_size = db.Column("reel_size", db.Integer)
    track_count = db.Column("track_count", db.Integer)

    reel_diameter_id = db.Column(
        db.Integer,
        db.ForeignKey("open_reel_reel_diameter.table_id")
    )
    reel_diameter = relationship("OpenReelReelDiameter")

    reel_type = db.Column("reel_type", db.Text)

    reel_thickness_id = db.Column(
        db.Integer,
        db.ForeignKey("open_reel_reel_thickness.table_id")
    )
    reel_thickness = relationship("OpenReelReelThickness")

    reel_brand = db.Column("tape_brand", db.Text)

    base_id = db.Column(
        db.Integer,
        db.ForeignKey("open_reel_base.table_id")
    )
    base = relationship("OpenReelBase")

    wind_id = db.Column(
        db.Integer,
        db.ForeignKey("open_reel_wind.table_id")
    )
    wind = relationship("OpenReelReelWind")

    reel_speed_id = db.Column(
        db.Integer,
        db.ForeignKey("open_reel_reel_speed.table_id")
    )
    reel_speed = relationship("OpenReelSpeed")

    track_configuration_id = db.Column(
        db.Integer,
        db.ForeignKey("open_reel_track_configuration.table_id")
    )
    track_configuration = relationship("OpenReelTrackConfiguration")

    duration = db.Column("track_duration", db.Text)

    generation_id = db.Column(
        db.Integer,
        db.ForeignKey("open_reel_generation.table_id")
    )
    generation = relationship("OpenReelGeneration")

    def format_details(self) -> Mapping[str, SerializedData]:
        return {
            "title_of_reel": self.title_of_reel,
            "format_subtype":
                self.subtype.serialize() if self.subtype else None,
            "date_of_reel": utils.serialize_precision_datetime(
                self.date_of_reel)
            if self.date_of_reel is not None else None,
            'reel_width':
                self.reel_width.serialize() if self.reel_width else None,
            "track_count": self.track_count,
            "reel_size": self.reel_size,
            "reel_diameter":
                self.reel_diameter.serialize() if self.reel_diameter else None,
            "reel_type": self.reel_type,
            "reel_thickness":
                self.reel_thickness.serialize()
                if self.reel_thickness else None,
            "reel_brand": self.reel_brand,
            "base": self.base.serialize() if self.base else None,
            "wind":
                self.wind.serialize() if self.wind else None,
            "reel_speed":
                self.reel_speed.serialize() if self.reel_speed else None,
            "track_configuration":
                self.track_configuration.serialize()
                if self.track_configuration else None,
            "duration": self.duration,
            "generation":
                self.generation.serialize() if self.generation else None,

        }


class Film(AVFormat, ABC):
    __tablename__ = "films"
    __mapper_args__ = {
        'polymorphic_identity': 'films'
    }

    table_id = db.Column(db.Integer, db.ForeignKey(AVFormat.FK_TABLE_ID),
                         primary_key=True)

    title_of_film = db.Column("film_title", db.Text)
    film_shrinkage = db.Column("film_shrinkage", db.Integer)
    date_of_film = db.Column("date_of_film", db.Date)
    can_label = db.Column("can_label", db.Text)
    leader_label = db.Column("leader_label", db.Text)
    length = db.Column("length", db.Integer)
    duration = db.Column("duration", db.Text)

    film_base_id = db.Column(
        db.Integer,
        db.ForeignKey("film_film_base.table_id")
    )
    film_base = relationship("FilmFilmBase")

    soundtrack_id = db.Column(
        db.Integer,
        db.ForeignKey("film_soundtrack.table_id")
    )
    soundtrack = relationship("FilmSoundtrack")

    edge_code_date = db.Column("edge_code_date", db.Integer)

    color_id = db.Column(
        db.Integer,
        db.ForeignKey("film_color.table_id")
    )
    color = relationship("FilmColor")

    image_type_id = db.Column(
        db.Integer,
        db.ForeignKey("film_image_type.table_id")
    )
    image_type = relationship("FilmImageType")

    wind_id = db.Column(
        db.Integer,
        db.ForeignKey("film_wind.table_id")
    )
    wind = relationship("FilmWind")

    emulsion_id = db.Column(
        db.Integer,
        db.ForeignKey("film_emulsion.table_id")
    )
    emulsion = relationship("FilmEmulsion")

    film_speed_id = db.Column(
        db.Integer,
        db.ForeignKey("film_film_speed.table_id")
    )

    film_speed = relationship("FilmFilmSpeed")

    film_gauge_id = db.Column(
        db.Integer,
        db.ForeignKey("film_film_gauge.table_id")
    )

    film_gauge = relationship("FilmFilmGauge")

    ad_test = db.Column("ad_test", db.Boolean)
    ad_test_date = db.Column("ad_test_date", db.Date)
    ad_test_level = db.Column("ad_test_level", db.Text)

    def format_details(self) -> Mapping[str, SerializedData]:
        return {
            "film_title": self.title_of_film,
            "date_of_film":
                utils.serialize_precision_datetime(
                    self.date_of_film
                ) if self.date_of_film is not None else None,
            "can_label": self.can_label,
            "leader_label": self.leader_label,
            "film_length": self.length,
            "duration": self.duration,
            "film_base":
                self.film_base.serialize() if self.film_base else None,
            "edge_code_date": self.edge_code_date,
            "soundtrack":
                self.soundtrack.serialize() if self.soundtrack else None,
            "color": self.color.serialize() if self.color else None,
            "film_gauge":
                self.film_gauge.serialize() if self.film_gauge else None,
            "film_speed":
                self.film_speed.serialize() if self.film_speed else None,
            "film_image_type":
                self.image_type.serialize() if self.image_type else None,
            "wind": self.wind.serialize() if self.wind else None,
            "film_emulsion":
                self.emulsion.serialize() if self.emulsion else None,
            "film_shrinkage": self.film_shrinkage,
            'ad_strip_test': self.ad_test,
            "ad_test_date":
                utils.serialize_precision_datetime(
                    self.ad_test_date)
                if self.ad_test_date is not None else None,
            "ad_test_level": self.ad_test_level
        }


class GroovedDisc(AVFormat, ABC):
    __tablename__ = "grooved_discs"
    __mapper_args__ = {'polymorphic_identity': 'grooved_discs'}
    table_id = db.Column(db.Integer, db.ForeignKey(AVFormat.FK_TABLE_ID),
                         primary_key=True)

    title_of_album = db.Column("title_of_album", db.Text)
    title_of_disc = db.Column("title_of_disc", db.Text)

    side_a_label = db.Column("side_a_label", db.Text)
    side_b_label = db.Column("side_b_label", db.Text)

    date_of_disc = db.Column("date_of_disc", db.Date)

    side_a_duration = db.Column("side_a_duration", db.Text)
    side_b_duration = db.Column("side_b_duration", db.Text)

    disc_diameter_id = db.Column(
        db.Integer,
        db.ForeignKey("grooved_disc_disc_diameter.table_id")
    )
    disc_diameter = relationship("GroovedDiscDiscDiameter")

    disc_material_id = db.Column(
        db.Integer,
        db.ForeignKey("grooved_disc_disc_material.table_id")
    )
    disc_material = relationship("GroovedDiscDiscMaterial")

    disc_base_id = db.Column(
        db.Integer,
        db.ForeignKey("grooved_disc_disc_base.table_id")
    )
    disc_base = relationship("GroovedDiscDiscBase")

    playback_direction_id = db.Column(
        db.Integer,
        db.ForeignKey("grooved_disc_playback_direction.table_id")
    )
    playback_direction = relationship("GroovedDiscPlaybackDirection")

    playback_speed_id = db.Column(
        db.Integer,
        db.ForeignKey("grooved_disc_playback_speed.table_id")
    )
    playback_speed = relationship("GroovedDiscPlaybackSpeed")

    def format_details(self) -> Mapping[str, SerializedData]:
        return {
            "title_of_album": self.title_of_album,
            "title_of_disc": self.title_of_disc,
            "side_a_label": self.side_a_label,
            "side_b_label": self.side_b_label,
            "date_of_disc": utils.serialize_precision_datetime(
                self.date_of_disc) if self.date_of_disc else None,
            "side_a_duration": self.side_a_duration,
            "side_b_duration": self.side_b_duration,
            "disc_diameter":
                self.disc_diameter.serialize() if self.disc_diameter else None,
            "disc_material":
                self.disc_material.serialize() if self.disc_material else None,
            "disc_base":
                self.disc_base.serialize() if self.disc_base else None,
            "playback_direction":
                self.playback_direction.serialize()
                if self.playback_direction else None,
            "playback_speed":
                self.playback_speed.serialize()
                if self.playback_speed else None
        }


class AudioVideo(AVFormat):
    __tablename__ = "audio_video"
    __mapper_args__ = {'polymorphic_identity': 'audio_video'}
    table_id = db.Column(db.Integer, db.ForeignKey(AVFormat.table_id),
                         primary_key=True)

    av_date_recorded = db.Column("date_recorded", db.Date)
    side = db.Column("side", db.Text)
    duration = db.Column("duration", db.Text)
    format_subtype = db.Column("format_subtype", db.Text)

    def format_details(self) -> Mapping[str, SerializedData]:
        return {
            "date_recorded":
                utils.serialize_precision_datetime(
                    self.av_date_recorded)
                if self.av_date_recorded is not None else None,
            "side": self.side,
            "duration": self.duration,
            "format_subtype": self.format_subtype

        }


class EnumTable(AVTables):
    __abstract__ = True
    table_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column("name", db.Text)

    default_values = []

    def serialize(self, recurse=False) -> Mapping[str, SerializedData]:
        return {
            "name": self.name,
            "id": self.table_id
        }


class OpticalType(EnumTable):
    __tablename__ = 'optical_optical_types'
    default_values = ['DVD', 'CD']


class Optical(AVFormat, ABC):
    __tablename__ = 'optical'
    __mapper_args__ = {'polymorphic_identity': 'optical'}

    table_id = db.Column(db.Integer, db.ForeignKey(AVFormat.FK_TABLE_ID),
                         primary_key=True)
    title_of_item = db.Column("title_of_cassette", db.Text)

    label = db.Column("label", db.Text)
    date_of_item = db.Column("date_of_item", db.Date)

    optical_type_id = db.Column(
        db.Integer,
        db.ForeignKey("optical_optical_types.table_id")
    )

    optical_type = relationship("OpticalType")

    duration = db.Column("duration", db.Text)

    def format_details(self) -> Mapping[str, SerializedData]:
        details = {
            'title_of_item': self.title_of_item,
            'label': self.label,
            'date_of_item': self.date_of_item,
            'type':
                self.optical_type.serialize()
                if self.optical_type is not None else None,
            'duration': self.duration
        }

        if self.date_of_item:
            details['date_of_item'] = \
                utils.serialize_precision_datetime(self.date_of_item, 3)
        return details


class VideoCassetteGenerations(EnumTable):
    __tablename__ = 'video_cassette_generations'
    default_values = [
        'source (original)',
        'dub',
        'master',
        'commercial',
        'other'
    ]


class VideoCassetteType(EnumTable):
    __tablename__ = 'video_cassette_cassette_types'
    default_values = [
        'VHS',
        '3/4″ U-matic',
        '1″ Type C',
        'Betamax',
        'Betacam',
        'Betacam SP',
        'Digital Betacam',
        'Mini DV',
        'Dvcam',
        'DVCPro',
        'HDV',
        'Hi-8',
        'other',
    ]


class VideoCassette(AVFormat, ABC):
    __tablename__ = 'video_cassettes'
    __mapper_args__ = {'polymorphic_identity': 'video_cassette'}

    table_id = db.Column(db.Integer, db.ForeignKey(AVFormat.table_id),
                         primary_key=True)

    title_of_cassette = db.Column("title_of_cassette", db.Text)
    label = db.Column("label", db.Text)
    date_of_cassette = db.Column("date_of_cassette", db.Date)

    cassette_type_id = \
        db.Column(
            db.Integer,
            db.ForeignKey("video_cassette_cassette_types.table_id")
        )
    cassette_type = relationship("VideoCassetteType")

    duration = db.Column("duration", db.Text)

    generation_id = \
        db.Column(
            db.Integer,
            db.ForeignKey("video_cassette_generations.table_id")
        )
    generation = relationship('VideoCassetteGenerations')

    def format_details(self) -> Mapping[str, SerializedData]:

        return {
            'title_of_cassette': self.title_of_cassette,
            'generation':
                self.generation.serialize() if self.generation else None,
            'cassette_type':
                self.cassette_type.serialize() if self.cassette_type else None,
            'duration': self.duration,
            'label': self.label,
            'date_of_cassette':
                utils.serialize_precision_datetime(
                    self.date_of_cassette,
                    3
                ) if self.date_of_cassette else None,
        }


class AudioCassette(AVFormat):
    __tablename__ = 'audio_cassettes'
    __mapper_args__ = {'polymorphic_identity': 'audio_cassettes'}

    table_id = db.Column(db.Integer, db.ForeignKey(AVFormat.table_id),
                         primary_key=True)
    cassette_format_type_id = db.Column(
        db.Integer,
        db.ForeignKey("cassette_types.table_id")
    )
    title_of_cassette = db.Column(db.Text)
    side_a_label = db.Column(db.Text)
    side_a_duration = db.Column(db.Text)

    side_b_label = db.Column(db.Text)
    side_b_duration = db.Column(db.Text)
    generation_id = db.Column(
        db.Integer,
        db.ForeignKey("audio_cassette_generation.table_id")
    )
    generation = relationship('AudioCassetteGeneration')

    tape_subtype_id = db.Column(
        db.Integer,
        db.ForeignKey("audio_cassette_subtype.table_id")
    )

    tape_subtype = relationship("AudioCassetteSubtype")

    recording_date = db.Column("recording_date", db.Date)
    recording_date_precision = db.Column("recording_date_precision",
                                         db.Integer, default=3)

    # REGEX
    REGEX_DAY_MONTH_YEAR = \
        re.compile(r"^([0-1]?\d)/([0-2]\d)/(\d){4}")
    REGEX_YEAR_ONLY = re.compile(r"^([1-9]){4}$")
    REGEX_MONTH_YEAR = re.compile(r"^([0-1]?\d)/(\d){4}$")

    @classmethod
    def serialize_date(
            cls,
            date: Union[Column[Date], datetime.date],
            precision: int = 3
    ) -> str:
        warnings.warn(
            "Use utils.serialize_precision_datetime instead",
            DeprecationWarning
        )

        if isinstance(date, datetime.date):
            if precision == 3:
                return date.strftime("%m/%d/%Y")

            if precision == 2:
                return date.strftime("%m/%Y")

            if precision == 1:
                return date.strftime("%Y")

        raise AttributeError(f"Unable to serialize date {date}")

    @classmethod
    def encode_date(cls, date_string: str) -> Tuple[datetime.datetime, int]:
        warnings.warn("encode_date is deprecated. "
                      "use utils.serialize_precision_datetime instead",
                      DeprecationWarning)

        if cls.REGEX_DAY_MONTH_YEAR.match(date_string):
            return datetime.datetime.strptime(date_string, "%m/%d/%Y"), 3

        if cls.REGEX_MONTH_YEAR.match(date_string):
            return datetime.datetime.strptime(date_string, "%m/%Y"), 2

        if cls.REGEX_YEAR_ONLY.match(date_string):
            return datetime.datetime.strptime(date_string, "%Y"), 1

        raise AttributeError(f"Unknown date format: {date_string}")

    def format_details(self) -> Mapping[str, SerializedData]:

        return {
            "cassette_title": self.title_of_cassette,
            "side_a_label": self.side_a_label,
            "side_a_duration": self.side_a_duration,
            "side_b_label": self.side_b_label,
            "side_b_duration": self.side_b_duration,
            "generation":
                self.generation.serialize() if self.generation else None,
            "cassette_type":
                self.tape_subtype.serialize() if self.tape_subtype else None,
            "date_of_cassette":
                utils.serialize_precision_datetime(
                    self.recording_date,
                    typing.cast(
                        int,
                        self.recording_date_precision
                    )
                ) if self.recording_date is not None else None,
        }


class CollectionItem(AVFormat):
    __tablename__ = "items"
    __mapper_args__ = {'polymorphic_identity': 'items'}
    table_id = db.Column(db.Integer, db.ForeignKey(AVFormat.table_id),
                         primary_key=True)

    def format_details(self) -> Mapping[str, SerializedData]:
        return {}


# ############################ End of AV Formats ##############################


class CassetteType(EnumTable):
    __tablename__ = "cassette_types"


class CassetteTapeType(EnumTable):
    __tablename__ = "cassette_tape_types"


class CassetteTapeThickness(AVTables):
    __tablename__ = "cassette_tape_thickness"
    table_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    value = db.Column("value", db.Text)
    unit = db.Column("unit", db.Text)

    def serialize(self, recurse=False) -> Mapping[str, SerializedData]:
        return {
            "value": self.value,
            "unit": self.unit,
            "id": self.table_id
        }


class OpenReelSubType(EnumTable):
    __tablename__ = "open_reel_sub_type"
    default_values = ["Video", "Audio"]


class OpenReelReelWidth(EnumTable):
    __tablename__ = "open_reel_reel_width"
    default_values = ["1/4", "1/2", "1", "2"]


class OpenReelReelDiameter(EnumTable):
    __tablename__ = "open_reel_reel_diameter"
    default_values = ["5", "7", "10.5"]


class OpenReelReelThickness(EnumTable):
    __tablename__ = "open_reel_reel_thickness"
    default_values = ["0.5", "1.0", "1.5"]


class OpenReelBase(EnumTable):
    __tablename__ = "open_reel_base"
    default_values = ["Acetate", "Polyester"]


class OpenReelSpeed(EnumTable):
    __tablename__ = "open_reel_reel_speed"
    default_values = ["1 7/8", "3 3/4", "7 1/2", "15"]


class OpenReelTrackConfiguration(EnumTable):
    __tablename__ = "open_reel_track_configuration"
    default_values = [
        "full track",
        "1/4 track mono",
        "1/4 stereo",
        "1/2 track mono",
        "1/2 track stereo"
    ]


class OpenReelGeneration(EnumTable):
    __tablename__ = "open_reel_generation"
    default_values = [
        "source (original)",
        "dub",
        "master",
        "commercial",
        "other"
    ]


class OpenReelReelWind(EnumTable):
    __tablename__ = "open_reel_wind"
    default_values = ["Heads out", "Tails out"]


class GroovedDiscDiscDiameter(EnumTable):
    __tablename__ = "grooved_disc_disc_diameter"
    default_values = ["7", "8", "10", "12", "16"]


class GroovedDiscDiscMaterial(EnumTable):
    __tablename__ = "grooved_disc_disc_material"
    default_values = [
        "Shellac/78",
        "Lacquer",
        "Vinyl",
        "Edison Diamond"
    ]


class GroovedDiscPlaybackDirection(EnumTable):
    __tablename__ = "grooved_disc_playback_direction"
    default_values = ["In to Out", "Out to In"]


class GroovedDiscPlaybackSpeed(EnumTable):
    __tablename__ = "grooved_disc_playback_speed"
    default_values = ["33 1/3", "45", "78"]


class GroovedDiscDiscBase(EnumTable):
    __tablename__ = "grooved_disc_disc_base"
    default_values = ["Glass", "Cardboard", "Aluminum", "Unknown"]


class FilmFilmSpeed(EnumTable):
    __tablename__ = "film_film_speed"
    default_values = ["16", "18", "24", "Unknown"]


class FilmFilmGauge(EnumTable):
    __tablename__ = "film_film_gauge"
    default_values = ["8", "Super8", "16", "35"]


class FilmFilmBase(EnumTable):
    __tablename__ = "film_film_base"
    default_values = ["Acetate", "Nitrate", "Polyester"]


class FilmSoundtrack(EnumTable):
    __tablename__ = "film_soundtrack"
    default_values = ["Optical", "Magnetic", "Silent"]


class FilmColor(EnumTable):
    __tablename__ = "film_color"
    default_values = ["Color", "Black & White", "Color/Black & White"]


class FilmImageType(EnumTable):
    __tablename__ = "film_image_type"
    default_values = ["Positive", "Negative", "Reversal"]


class FilmWind(EnumTable):
    __tablename__ = "film_wind"
    default_values = ["A", "B"]


class FilmEmulsion(EnumTable):
    __tablename__ = "film_emulsion"
    default_values = ["In", "Out"]


class AudioCassetteSubtype(EnumTable):
    __tablename__ = "audio_cassette_subtype"
    default_values = [
        "Compact cassette I",
        "Compact cassette type II",
        "Compact cassette type III",
        "Compact cassette IV",
        "DAT",
        "ADAT",
        "Microcassette",
        "Continuous loop cartridge",
        "Other"
    ]


class AudioCassetteGeneration(EnumTable):
    __tablename__ = "audio_cassette_generation"
    default_values = [
        "Source (original)",
        "Dub",
        "Master",
        "Commercial",
        "Other"
    ]


item_has_contacts_table = db.Table(
    "item_has_contacts",
    AVTables.metadata,
    db.Column("contact_id", db.Integer, db.ForeignKey("formats.item_id")),
    db.Column("item_id", db.Integer, db.ForeignKey("contact.contact_id"))
)

# =============================================================================
# Enumerated tables
# =============================================================================
#
# To keep the enumerated id tables consistent, the ids are hardcoded
#
# Important Note:
#
# Add to the bottom of this list, For compatibility reasons, do not
# edit existing value ids


# =============================================================================


format_types: Mapping[
    str,
    Union[
        Tuple[int],
        Tuple[int, Type[AVFormat]]
    ]
] = {
    # "audio video": (1, AudioVideo),
    # "audio": (2,),
    # "video": (3,),
    "open reel": (4, OpenReel),
    "grooved disc": (5, GroovedDisc),
    "film": (6, Film),
    "audio cassette": (7, AudioCassette),
    "optical": (8, Optical),
    "video cassette": (9, VideoCassette),
}
