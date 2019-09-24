# pylint: disable=too-few-public-methods, invalid-name
import abc
from typing import List, Optional
import datetime
import sqlalchemy as db
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta
from sqlalchemy.orm import relationship, scoped_session, sessionmaker

Session = scoped_session(sessionmaker(expire_on_commit=False))


class DeclarativeABCMeta(DeclarativeMeta, abc.ABCMeta):
    pass


class AVTables(declarative_base(metaclass=DeclarativeABCMeta)):
    __abstract__ = True

    @abc.abstractmethod
    def serialize(self) -> dict:  # pylint: disable=no-self-use
        """Serialize the data so that it can be turned into a JSON format"""
        return {}

    @classmethod
    def serialize_date(cls, date: Optional[datetime.date]):
        if isinstance(date, datetime.date):
            return date.isoformat()

        return None


item_has_notes_table = db.Table(
    "item_has_notes",
    AVTables.metadata,
    db.Column("notes_id", db.Integer, db.ForeignKey("notes.note_id")),
    db.Column("item_id", db.Integer, db.ForeignKey("item.item_id"))
)


object_has_notes_table = db.Table(
    "object_has_notes",
    AVTables.metadata,
    db.Column("notes_id", db.Integer, db.ForeignKey("notes.note_id")),
    db.Column("object_id", db.Integer, db.ForeignKey("object.object_id"))
)

project_has_notes_table = db.Table(
    "project_has_notes",
    AVTables.metadata,
    db.Column("notes_id", db.Integer, db.ForeignKey("notes.note_id")),
    db.Column("project_id", db.Integer, db.ForeignKey("project.project_id"))
)


class Contact(AVTables):
    __tablename__ = "contact"

    id = db.Column(
        "contact_id",
        db.Integer,
        primary_key=True,
        autoincrement=True)

    first_name = db.Column("first_name", db.Text)
    last_name = db.Column("last_name", db.Text)
    email_address = db.Column("email_address", db.Text)

    def serialize(self) -> dict:
        return {
            "contact_id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email_address": self.email_address
        }


class Project(AVTables):
    __tablename__ = "project"

    id = db.Column(
        "project_id",
        db.Integer,
        primary_key=True,
        autoincrement=True)

    project_code = db.Column("project_code", db.Text)
    title = db.Column("title", db.Text)
    current_location = db.Column("current_location", db.Text)
    status = db.Column("status", db.Text)
    specs = db.Column("specs", db.Text)

    notes = relationship(
        "Note",
        secondary=project_has_notes_table,
        backref="project_sources"
    )

    def serialize(self):
        notes = []
        for note in self.notes:
            notes.append(note.serialize())
        #
        return {
            "project_id": self.id,
            "project_code": self.project_code,
            "current_location": self.current_location,
            "status": self.status,
            "title": self.title,
            "notes": notes
        }


class Collection(AVTables):
    __tablename__ = "collection"
    id = db.Column(
        "collection_id",
        db.Integer,
        primary_key=True,
        autoincrement=True)
    record_series = db.Column("record_series", db.Text)
    collection_name = db.Column("collection_name", db.Text)
    department = db.Column("department", db.Text)
    contact = relationship("Contact")
    contact_id = db.Column(db.Integer, db.ForeignKey("contact.contact_id"))

    def serialize(self):
        return {
            "collection_id": self.id,
            "record_series": self.record_series,
            "collection_name": self.collection_name,
            "contact_id": self.contact_id,
            "department": self.department
        }


class CollectionObject(AVTables):
    __tablename__ = "object"

    id = db.Column(
        "object_id",
        db.Integer,
        primary_key=True,
        autoincrement=True)

    name = db.Column("name", db.Text)
    barcode = db.Column("barcode", db.Text)
    collection_id = \
        db.Column(db.Integer, db.ForeignKey("collection.collection_id"))

    collection = relationship("Collection", foreign_keys=[collection_id])

    project_id = db.Column(db.Integer, db.ForeignKey("project.project_id"))
    project = relationship("Project", foreign_keys=[project_id])
    originals_rec_date = db.Column("originals_rec_date", db.Date)
    originals_return_date = db.Column("originals_return_date", db.Date)
    notes = relationship("Note",
                         secondary=object_has_notes_table,
                         backref="object_sources"
                         )

    items = relationship("CollectionItem", backref="item_id")

    contact_id = db.Column(db.Integer, db.ForeignKey("contact.contact_id"))

    contact = relationship("Contact", foreign_keys=[contact_id])

    def serialize(self):

        def sorter(collection_items: List[CollectionItem]):
            no_sequence = set()
            has_sequence = set()
            for collection_item in collection_items:
                if collection_item.obj_sequence is None:
                    no_sequence.add(collection_item)
                else:
                    has_sequence.add(collection_item)

            resulting_sorted_list = \
                sorted(list(has_sequence), key=lambda x: x.obj_sequence)

            resulting_sorted_list += list(no_sequence)
            return resulting_sorted_list

        items = []
        for item in sorter(self.items):
            items.append(item.serialize())

        notes = [note.serialize() for note in self.notes]

        if self.collection is not None:
            collection = self.collection.serialize()
        else:
            collection = None

        if self.contact is not None:
            contact = self.contact.serialize()
        else:
            contact = None

        if self.project is not None:
            project = self.project.serialize()
        else:
            project = None

        return {
            "object_id": self.id,
            "name": self.name,
            "collection": collection,
            "barcode": self.barcode,
            "originals_rec_date":
                self.serialize_date(self.originals_rec_date),
            "originals_return_date":
                self.serialize_date(self.originals_return_date),
            "project": project,
            "contact": contact,
            "notes": notes,
            "items": items
        }


class CollectionItem(AVTables):
    __tablename__ = "item"

    id = db.Column("item_id", db.Integer, primary_key=True, autoincrement=True)

    name = db.Column("name", db.Text)
    #
    file_name = db.Column("file_name", db.Text)
    medusa_uuid = db.Column("medusa_uuid", db.Text)

    collection_object_id = db.Column("object_id",
                                     db.Integer,
                                     db.ForeignKey("object.object_id"),
                                     )

    collection_object = relationship("CollectionObject",
                                     foreign_keys=[collection_object_id])

    obj_sequence = db.Column("obj_sequence", db.Integer)
    notes = relationship("Note",
                         secondary=item_has_notes_table,
                         backref="item_sources"
                         )

    treatment = relationship("Treatment", backref="treatment_id")

    format_type_id = db.Column(db.Integer,
                               db.ForeignKey("format_types.format_id"))

    format_type = relationship("FormatTypes", foreign_keys=[format_type_id])

    def serialize(self):
        notes = [note.serialize() for note in self.notes]
        return {
            "item_id": self.id,
            "name": self.name,
            "file_name": self.file_name,
            "medusa_uuid": self.medusa_uuid,
            "obj_sequence": self.obj_sequence,
            "format_type_id": self.format_type_id,
            "parent_object_id": self.collection_object_id,
            "notes": notes
        }


class Note(AVTables):
    __tablename__ = "notes"

    id = db.Column("note_id", db.Integer, primary_key=True, autoincrement=True)
    text = db.Column("text", db.Text, nullable=False)

    note_type_id = db.Column(
        db.Integer, db.ForeignKey("note_types.note_types_id"))

    note_type = relationship("NoteTypes", foreign_keys=[note_type_id])

    def serialize(self):
        return {
            "note_id": self.id,
            "text": self.text,
            "note_types_id": self.note_type_id
        }


class NoteTypes(AVTables):
    __tablename__ = "note_types"
    id = db.Column(
        "note_types_id", db.Integer, primary_key=True, autoincrement=True)

    name = db.Column("type_name", db.Text)

    def serialize(self) -> dict:
        return {
            "note_types_id": self.id,
            "name": self.name
        }


class Treatment(AVTables):
    __tablename__ = "treatment"
    id = db.Column(
        "treatment_id", db.Integer, primary_key=True, autoincrement=True)

    needed = db.Column("needed", db.Text)
    given = db.Column("given", db.Text)
    date = db.Column("date", db.Date)
    item_id = db.Column(db.Integer, db.ForeignKey("item.item_id"))

    def serialize(self) -> dict:
        return {
            "treatment_id": self.id,
            "needed": self.needed,
            "given": self.given,
            "date": self.serialize_date(self.date),
            "item_id": self.item_id
        }


class FormatTypes(AVTables):
    __tablename__ = "format_types"

    id = db.Column(
        "format_id", db.Integer, primary_key=True, autoincrement=True)

    name = db.Column("name", db.Text)

    def serialize(self):
        return {
            "format_types_id": self.id,
            "name": self.name
        }


class OpenReel(AVTables):
    __tablename__ = "open_reel"

    item_id = db.Column(
        db.Integer, db.ForeignKey("item.item_id"), primary_key=True)

    item = relationship("CollectionItem", foreign_keys=[item_id])

    date_recorded = db.Column(
        "date_recorded", db.Date
    )

    track_count = db.Column("track_count", db.Text)
    tape_size = db.Column("tape_size", db.Text)
    reel_diam = db.Column("reel_diam", db.Integer)
    reel_type = db.Column("reel_type", db.Text)
    tape_thickness = db.Column("tape_thickness", db.Integer)
    tape_brand = db.Column("tape_brand", db.Text)
    base = db.Column("base", db.Text)
    wind = db.Column("wind", db.Text)
    track_speed = db.Column("track_speed", db.Text)
    track_configuration = db.Column("track_configuration", db.Text)
    track_duration = db.Column("track_duration", db.Text)
    generation = db.Column("generation", db.Text)

    def serialize(self) -> dict:
        return {
            "item_id": self.item_id,
            "date_recorded": self.serialize_date(self.date_recorded),
            "track_count": self.track_count,
            "tape_size": self.tape_size,
            "reel_diam": self.reel_diam,
            "reel_type": self.reel_type,
            "tape_thickness": self.tape_thickness,
            "tape_brand": self.tape_brand,
            "base": self.base,
            "wind": self.wind,
            "track_speed": self.track_speed,
            "track_configuration": self.track_configuration,
            "track_duration": self.track_duration,
            "generation": self.generation
        }


class Film(AVTables):
    __tablename__ = "film"

    item_id = db.Column(
        db.Integer, db.ForeignKey("item.item_id"), primary_key=True)

    item = relationship("CollectionItem", foreign_keys=[item_id])

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

    def serialize(self) -> dict:
        return {
            "item_id": self.item_id,
            "date_of_film": self.serialize_date(self.date_of_film),
            "can_label": self.can_label,
            "leader_label": self.leader_label,
            "length": self.length,
            "duration": self.duration,
            "format_gauge": self.format_gauge,
            "base": self.base,
            "edge_code_date": self.serialize_date(self.edge_code_date),
            "sound": self.sound,
            "color": self.color,
            "image_type": self.image_type,
            "ad_test_date": self.serialize_date(self.ad_test_date),
            "ad_test_level": self.ad_test_level,
        }


class GroovedDisc(AVTables):
    __tablename__ = "grooved_disc"

    item_id = db.Column(
        db.Integer, db.ForeignKey("item.item_id"), primary_key=True)

    item = relationship("CollectionItem", foreign_keys=[item_id])

    # This is a year
    date_recorded = db.Column("date_recorded", db.Integer)
    side = db.Column("side", db.Text)
    duration = db.Column("duration", db.Text)
    diameter = db.Column("diameter", db.Integer)
    disc_material = db.Column("disc_material", db.Text)
    base = db.Column("base", db.Text)
    playback_direction = db.Column("playback_direction", db.Text)
    playback_speed = db.Column("playback_speed", db.Text)

    def serialize(self) -> dict:
        return {
            "item_id": self.item_id,
            "date_recorded": self.date_recorded,
            "side": self.side,
            "duration": self.duration,
            "diameter": self.diameter,
            "disc_material": self.disc_material,
            "base": self.base,
            "playback_direction": self.playback_direction,
            "playback_speed": self.playback_speed

        }


class AudioVideo(AVTables):
    __tablename__ = "audio_video"

    item_id = db.Column(
        db.Integer, db.ForeignKey("item.item_id"), primary_key=True)

    item = relationship("CollectionItem", foreign_keys=[item_id])
    date_recorded = db.Column("date_recorded", db.Date)
    side = db.Column("side", db.Text)
    duration = db.Column("duration", db.Text)
    format_subtype = db.Column("format_subtype", db.Text)

    def serialize(self) -> dict:
        return {
            "item_id": self.item_id,
            "date_recorded": self.serialize_date(self.date_recorded),
            "side": self.side,
            "duration": self.duration,
            "format_subtype": self.format_subtype

        }


vendor_has_contacts_table = db.Table(
    "vendor_has_contacts",
    AVTables.metadata,
    db.Column("contact_id", db.Integer, db.ForeignKey("contact.contact_id")),
    db.Column("vendor_id", db.Integer, db.ForeignKey("vendor.vendor_id"))
)

item_has_contacts_table = db.Table(
    "item_has_contacts",
    AVTables.metadata,
    db.Column("contact_id", db.Integer, db.ForeignKey("item.item_id")),
    db.Column("item_id", db.Integer, db.ForeignKey("contact.contact_id"))
)


class Vendor(AVTables):
    __tablename__ = "vendor"

    id = db.Column(
        "vendor_id", db.Integer, primary_key=True, autoincrement=True)

    name = db.Column("name", db.Text)
    address = db.Column("address", db.Text)
    city = db.Column("city", db.Text)
    state = db.Column("state", db.Text)
    zipcode = db.Column("zipcode", db.Text)
    contacts = relationship("Contact",
                            secondary=vendor_has_contacts_table,
                            backref="vendor_id"
                            )

    def serialize(self) -> dict:
        contacts = [contact.serialize() for contact in self.contacts]
        return {
            "vendor_id": self.id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "zipcode": self.zipcode,
            "contacts": contacts,

        }


vendor_transfer_has_an_object = db.Table(
    "vendor_transfer_has_an_object",
    AVTables.metadata,
    db.Column("object_id",
              db.Integer,
              db.ForeignKey("object.object_id")),
    db.Column("vendor_transfer_id",
              db.Integer,
              db.ForeignKey("vendor_transfer.vendor_transfer_id")
              )
)


class VendorTransfer(AVTables):
    __tablename__ = "vendor_transfer"

    id = db.Column(
        "vendor_transfer_id", db.Integer, primary_key=True, autoincrement=True)

    vendor_id = db.Column(
        db.Integer, db.ForeignKey("vendor.vendor_id")
    )
    vendor = relationship("Vendor", foreign_keys=[vendor_id])

    # date the digital surrogates and accompanying metadata was received
    # from vendor
    vendor_deliverables_rec_date = \
        db.Column("vendor_deliverables_rec_date", db.Date)

    # date the originals were returned from the vendor
    returned_originals_rec_date = \
        db.Column("returned_originals_rec_date", db.Date)

    transfer_objects = relationship(
        "CollectionObject",
        secondary=vendor_transfer_has_an_object,
        backref="transfer_object"
    )

    def serialize(self) -> dict:
        return {
            "vendor_transfer_id": self.id,
            "vendor_id": self.vendor_id,
            "vendor_deliverables_rec_date":
                self.serialize_date(self.vendor_deliverables_rec_date),
            "returned_originals_rec_date":
                self.serialize_date(self.returned_originals_rec_date)
        }


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

note_types = {
    "Inspection": (1, ),
    "Playback": (2, ),
    "Project": (3, ),
    "Other": (4, ),
}


format_types = {
    "audio video": (1, AudioVideo),
    "audio": (2,),
    "video": (3,),
    "open reel": (4, OpenReel),
    "grooved disc": (5, GroovedDisc),
    "film": (6, Film)
}
# =============================================================================
