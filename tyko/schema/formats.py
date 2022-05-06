import abc
import datetime
import typing
import warnings
from abc import ABC

from typing import Optional, Tuple, TYPE_CHECKING, Mapping
import re
import sqlalchemy as db
from sqlalchemy.orm import relationship
from tyko import utils
from tyko.schema.avtables import AVTables, SerializedData

if TYPE_CHECKING:
    from tyko.schema.objects import CollectionObject  # noqa: F401
    from tyko.schema.treatment import Treatment  # noqa: F401
    from tyko.schema.instantiation import InstantiationFile  # noqa: F401
    from tyko.schema.notes import Note  # noqa: F401

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
    treatment = relationship("Treatment", backref="treatment_id")

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

    def _iter_notes(self):
        yield from self.notes

    def format_details(self) -> Mapping[str, SerializedData]:
        return {}

    def serialize(self, recurse=False) -> Mapping[str, SerializedData]:

        data: typing.Dict[str, SerializedData] = {
            "item_id": self.table_id,
            "name": self.name,
            "files": list(self._iter_files(recurse)),
            "parent_object_id": self.object_id,
            "obj_sequence": self.obj_sequence,
            "notes": [note.serialize() for note in self._iter_notes()]
        }

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
    # tape_size = db.Column("tape_size", db.Text)

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

    # wind = db.Column("wind", db.Text)
    # track_speed = db.Column("track_speed", db.Text)

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
            # "tape_size": self.tape_size,
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

    date_of_film = db.Column("date_of_film", db.Date)
    can_label = db.Column("can_label", db.Text)
    leader_label = db.Column("leader_label", db.Text)
    length = db.Column("length", db.Integer)
    duration = db.Column("duration", db.Text)
    format_gauge = db.Column("format_gauge", db.Integer)
    base = db.Column("base", db.Text)
    edge_code_date = db.Column("edge_code_date", db.Date)
    sound = db.Column("sound", db.Text)
    color = db.Column("color", db.Text)
    image_type = db.Column("image_type", db.Text)
    ad_test_date = db.Column("ad_test_date", db.Date)
    ad_test_level = db.Column("ad_test_level", db.Integer)

    def format_details(self) -> Mapping[str, SerializedData]:
        return {
            "date_of_film":
                utils.serialize_precision_datetime(self.date_of_film)
                if self.date_of_film is not None else None,
            "can_label": self.can_label,
            "leader_label": self.leader_label,
            "length": self.length,
            "duration": self.duration,
            "format_gauge": self.format_gauge,
            "base": self.base,
            "edge_code_date":
                utils.serialize_precision_datetime(
                    self.edge_code_date)
                if self.edge_code_date is not None else None,
            "sound": self.sound,
            "color": self.color,
            "image_type": self.image_type,
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

    # This is a year
    date_recorded = db.Column("date_recorded", db.Integer)
    side = db.Column("side", db.Text)
    duration = db.Column("duration", db.Text)
    diameter = db.Column("diameter", db.Integer)
    disc_material = db.Column("disc_material", db.Text)
    base = db.Column("base", db.Text)
    playback_direction = db.Column("playback_direction", db.Text)
    playback_speed = db.Column("playback_speed", db.Text)

    def format_details(self) -> Mapping[str, SerializedData]:
        return {
            "date_recorded": self.date_recorded,
            "side": self.side,
            "duration": self.duration,
            "diameter": self.diameter,
            "disc_material": self.disc_material,
            "base": self.base,
            "playback_direction": self.playback_direction,
            "playback_speed": self.playback_speed
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

    def serialize(self, recurse=False) -> Mapping[str, SerializedData]:
        return {
            "name": self.name,
            "id": self.table_id
        }


class OpticalType(EnumTable):
    __tablename__ = 'optical_optical_types'


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


class VideoCassetteType(EnumTable):
    __tablename__ = 'video_cassette_cassette_types'


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
        details = {
            'title_of_cassette': self.title_of_cassette,
        }

        if self.generation is not None:
            details['generation'] = self.generation.serialize()

        if self.label is not None:
            details['label'] = self.label

        if self.duration is not None:
            details['duration'] = self.duration

        if self.cassette_type is not None:
            details['cassette_type'] = self.cassette_type

        if self.date_of_cassette is not None:
            details['date_of_cassette'] = \
                utils.serialize_precision_datetime(self.date_of_cassette, 3)

        if self.cassette_type is not None:
            details['cassette_type'] = self.cassette_type.serialize()

        return details


class AudioCassette(AVFormat):
    __tablename__ = 'audio_cassettes'
    __mapper_args__ = {'polymorphic_identity': 'audio_cassettes'}

    table_id = db.Column(db.Integer, db.ForeignKey(AVFormat.table_id),
                         primary_key=True)

    cassette_format_type_id = db.Column(
        db.Integer,
        db.ForeignKey("cassette_types.table_id")
    )

    cassette_type = relationship("CassetteType")

    tape_type_id = db.Column(db.Integer,
                             db.ForeignKey("cassette_tape_types.table_id"))

    tape_type = relationship("CassetteTapeType")

    tape_thickness_id = \
        db.Column(db.Integer,
                  db.ForeignKey("cassette_tape_thickness.table_id"))

    tape_thickness = relationship("CassetteTapeThickness")

    recording_date = db.Column("recording_date", db.Date)
    recording_date_precision = db.Column("recording_date_precision",
                                         db.Integer, default=3)

    # REGEX
    REGEX_DAY_MONTH_YEAR = re.compile(r"^([0-1][0-9])-([0-2][0-9])-([0-9]){4}")
    REGEX_YEAR_ONLY = re.compile(r"^([1-9]){4}$")
    REGEX_MONTH_YEAR = re.compile(r"^([0-1][0-9])-([0-9]){4}$")

    @classmethod
    def serialize_date(cls, date: Optional[datetime.date],
                       precision=3) -> str:
        warnings.warn(
            "Use utils.serialize_precision_datetime instead",
            DeprecationWarning
        )

        if isinstance(date, datetime.date):
            if precision == 3:
                return date.strftime("%m-%d-%Y")

            if precision == 2:
                return date.strftime("%m-%Y")

            if precision == 1:
                return date.strftime("%Y")

        raise AttributeError("Unable to serialize date {}".format(date))

    @classmethod
    def encode_date(cls, date_string: str) -> Tuple[datetime.datetime, int]:
        warnings.warn("encode_date is deprecated. "
                      "use utils.serialize_precision_datetime instead",
                      DeprecationWarning)

        if cls.REGEX_DAY_MONTH_YEAR.match(date_string):
            return datetime.datetime.strptime(date_string, "%m-%d-%Y"), 3

        if cls.REGEX_MONTH_YEAR.match(date_string):
            return datetime.datetime.strptime(date_string, "%m-%Y"), 2

        if cls.REGEX_YEAR_ONLY.match(date_string):
            return datetime.datetime.strptime(date_string, "%Y"), 1

        raise AttributeError("Unknown date format: {}".format(date_string))

    def format_details(self) -> Mapping[str, SerializedData]:

        serialized_data = {
            "date_recorded":
                utils.serialize_precision_datetime(
                    self.recording_date,
                    self.recording_date_precision)
                if self.recording_date is not None
                else None,
        }
        if self.cassette_type is not None:
            serialized_data["cassette_type"] = self.cassette_type.serialize()
        if self.tape_type is not None:
            serialized_data["tape_type"] = self.tape_type.serialize()
        else:
            serialized_data["tape_type"] = None

        if self.tape_thickness is not None:
            serialized_data["tape_thickness"] = self.tape_thickness.serialize()
        else:
            serialized_data["tape_thickness"] = None

        return serialized_data


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


class OpenReelReelWidth(EnumTable):
    __tablename__ = "open_reel_reel_width"


class OpenReelReelDiameter(EnumTable):
    __tablename__ = "open_reel_reel_diameter"


class OpenReelReelThickness(EnumTable):
    __tablename__ = "open_reel_reel_thickness"


class OpenReelBase(EnumTable):
    __tablename__ = "open_reel_base"


class OpenReelSpeed(EnumTable):
    __tablename__ = "open_reel_reel_speed"


class OpenReelTrackConfiguration(EnumTable):
    __tablename__ = "open_reel_track_configuration"


class OpenReelGeneration(EnumTable):
    __tablename__ = "open_reel_generation"


class OpenReelReelWind(EnumTable):
    __tablename__ = "open_reel_wind"


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


format_types = {
    "audio video": (1, AudioVideo),
    "audio": (2,),
    "video": (3,),
    "open reel": (4, OpenReel),
    "grooved disc": (5, GroovedDisc),
    "film": (6, Film),
    "audio cassette": (7, AudioCassette),
    "optical": (8, Optical),
    "video cassette": (9, VideoCassette),
}

# todo: put these in enum table classes
video_cassette_types = [
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

optical_types = ['DVD', 'CD']

video_cassette_generations = [
    'source (original)',
    'dub',
    'master',
    'commercial',
    'other'
]

open_reel_sub_type = ["Video", "Audio"]

open_reel_reel_width = ["1/4", "1/2", "1", "2"]

open_reel_reel_diameter = ["5", "7", "10.5"]

open_reel_reel_thickness = ["0.5", "1.0", "1.5"]

open_reel_base = ["Acetate", "Polyester"]

open_reel_wind = ["Heads out", "Tails out"]

open_reel_reel_speed = ["1 7/8", "3 3/4", "7 1/2", "15"]

open_reel_track_configuration = [
    "full track",
    "1/4 track mono",
    "1/4 stereo",
    "1/2 track mono",
    "1/2 track stereo"
]

open_reel_generation = [
    "source (original)",
    "dub",
    "master",
    "commercial",
    "other"
]
