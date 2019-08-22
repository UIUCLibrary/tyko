import sys
from typing import Dict, Tuple, Any

import sqlalchemy as db
from sqlalchemy.orm.session import sessionmaker

from avforms import scheme


def init_database(engine) -> None:
    scheme.AVTables.metadata.create_all(bind=engine)

    initial_session = sessionmaker(bind=engine)
    session = initial_session()
    session.commit()

    for i in session.query(scheme.NoteTypes):
        session.delete(i)
    _populate_note_type_table(session)

    for i in session.query(scheme.FormatTypes):
        session.delete(i)
    _populate_format_types_table(session)

    session.commit()
    session.close()

    if not(validate_tables(engine)):
        raise IOError("Newly created database is invalid")

    if not(validate_enumerated_tables(engine)):
        raise IOError("Table data has changed")


def _populate_note_type_table(session):

    for note_type, note_metadata in scheme.note_types.items():
        note_id = note_metadata[0]

        new_note_type = scheme.NoteTypes(name=note_type, id=note_id)
        session.add(new_note_type)


def _populate_format_types_table(session):
    for format_type, format_metadata in scheme.format_types.items():
        format_id = format_metadata[0]

        new_format_type = scheme.FormatTypes(name=format_type, id=format_id)
        session.add(new_format_type)


def validate_enumerated_tables(engine):
    session = sessionmaker(bind=engine)()
    valid = True

    if not validate_enumerate_table_data(
            engine, scheme.FormatTypes, scheme.format_types):

        valid = False

    if not validate_enumerate_table_data(
            engine, scheme.NoteTypes, scheme.note_types):

        valid = False

    session.close()
    return valid


def validate_enumerate_table_data(engine, sql_table_type: scheme.AVTables,
                                  expected_table: Dict[str, Tuple[int, Any]]
                                  ) -> bool:

    session = sessionmaker(bind=engine)()
    valid = True

    for table_entry in session.query(sql_table_type):
        expected_item = expected_table.get(table_entry.name)

        if expected_item is None:
            return False

        expected_id = expected_item[0]

        if expected_id != table_entry.id:
            print(f"Type {table_entry.name} does not match expected id. "
                  f"expected {expected_id}. "
                  f"got {table_entry.id}.",
                  file=sys.stderr)
            valid = False

    session.close()
    return valid


def validate_tables(engine):

    expected_table_names = [k for k in scheme.AVTables.metadata.tables.keys()]

    valid = True

    for table in db.inspect(engine).get_table_names():
        if table not in expected_table_names:
            print("Unexpected table found: {}".format(table))
            valid = False
        else:
            expected_table_names.remove(table)

    if len(expected_table_names) > 0:
        print("Missing tables [{}]".format(",".join(expected_table_names)))
        valid = False
    return valid
