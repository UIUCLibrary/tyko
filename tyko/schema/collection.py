from typing import TYPE_CHECKING, Mapping

import sqlalchemy as db
from sqlalchemy.orm import relationship

from tyko.schema.avtables import AVTables, SerializedData

if TYPE_CHECKING:
    from tyko.schema.contacts import Contact  # noqa: F401


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

    def serialize(self, recurse=False) -> Mapping[str, SerializedData]:
        if self.contact is not None:
            contact = self.contact.serialize()
        else:
            contact = None
        return {
            "collection_id": self.id,
            "record_series": self.record_series,
            "collection_name": self.collection_name,
            "contact_id": self.contact_id,
            "department": self.department,
            "contact": contact
        }
