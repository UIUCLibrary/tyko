from typing import Mapping

import sqlalchemy as db

from tyko.schema.avtables import AVTables, SerializedData


class Treatment(AVTables):
    __tablename__ = "treatment"
    id = db.Column(
        "treatment_id", db.Integer, primary_key=True, autoincrement=True)

    treatment_type = db.Column("type", db.Text)
    message = db.Column("message", db.Text)
    date = db.Column("date", db.Date)
    item_id = db.Column(db.Integer, db.ForeignKey("formats.item_id"))

    def serialize(self, recurse=False) -> Mapping[str, SerializedData]:
        return {
            "treatment_id": self.id,
            "message": self.message,
            "type": self.treatment_type,
            # "needed": self.needed,
            # "given": self.given,
            # "date": self.serialize_date(self.date),
            "item_id": self.item_id
        }
