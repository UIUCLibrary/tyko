import sys
from typing import Dict, Tuple, Any, Type

import sqlalchemy as db
import sqlalchemy.orm
from sqlalchemy.orm.session import sessionmaker

import tyko.schema.avtables
from tyko import schema
from .schema import formats
from .schema import notes
from .schema import projects
import packaging.version


def alembic_table_exists(engine) -> bool:

    if packaging.version.parse(sqlalchemy.__version__) < \
            packaging.version.parse("1.4"):
        return engine.dialect.has_table(engine, "alembic_version")
    else:
        return sqlalchemy.inspect(engine).has_table("alembic_version")


def _populate_video_cassette_generations_table(session):
    print("Populating video generations types Table")
    for generation in formats.VideoCassetteGenerations.default_values:
        new_type = formats.VideoCassetteGenerations()
        new_type.name = generation
        session.add(new_type)


def _populate_video_cassette_types_table(session):
    print("Populating video cassette types Table")
    for cassette_type in formats.VideoCassetteType.default_values:
        new_type = formats.VideoCassetteType()
        new_type.name = cassette_type
        session.add(new_type)


def _create_sample_collection(session):
    print("Adding sample collection")
    new_collection = schema.Collection()
    new_collection.collection_name = "sample collection"
    session.add(new_collection)


def _populate_optical_types_table(session):
    print("Populating optical types Table")
    for new_type_name in formats.OpticalType.default_values:
        new_type = formats.OpticalType()
        new_type.name = new_type_name
        session.add(new_type)


def _populate_open_reel_enum_tables(session):
    print("Populating open reel tables")
    enum_table_classes = [
        formats.OpenReelSubType,
        formats.OpenReelReelWidth,
        formats.OpenReelReelDiameter,
        formats.OpenReelReelThickness,
        formats.OpenReelBase,
        formats.OpenReelReelWind,
        formats.OpenReelSpeed,
        formats.OpenReelTrackConfiguration,
        formats.OpenReelGeneration
    ]

    for enum_table_class in enum_table_classes:
        for new_type_name in enum_table_class.default_values:
            new_type = enum_table_class()
            new_type.name = new_type_name
            session.add(new_type)


def create_samples(engine: sqlalchemy.engine.Engine):
    session_maker = sessionmaker(bind=engine)
    session: sqlalchemy.orm.Session = session_maker()
    _create_sample_collection(session)
    session.commit()
    session.close()


def init_database(engine: sqlalchemy.engine.Engine) -> None:
    # if engine.dialect.has_table(engine, "audio_video"):
    #     return
    print("Creating all tables")
    tyko.schema.avtables.AVTables.metadata.create_all(bind=engine)

    initial_session = sessionmaker(bind=engine)
    session: sqlalchemy.orm.Session = initial_session()
    if not alembic_table_exists(engine):
        version_table = db.Table(
            "alembic_version", tyko.schema.avtables.AVTables.metadata,
            db.Column("version_num", db.String(length=32), primary_key=True)
        )
        tyko.schema.avtables.AVTables.metadata.create_all(bind=engine)
        set_version_sql = \
            version_table.insert().values(version_num=schema.ALEMBIC_VERSION)  # noqa: E501 pylint: disable=E1120
        session.execute(set_version_sql)

    session.commit()

    for i in session.query(notes.NoteTypes):
        session.delete(i)
    _populate_note_type_table(session)

    for i in session.query(formats.FormatTypes):
        session.delete(i)

    _populate_format_types_table(session)

    _populate_video_cassette_types_table(session)
    _populate_video_cassette_generations_table(session)
    _populate_optical_types_table(session)
    _populate_open_reel_enum_tables(session)

    _populate_starting_project_status(
        session, project_status_table=projects.ProjectStatus)

    session.commit()
    session.close()

    if not validate_tables(engine):
        raise IOError("Newly created database is invalid")

    if not validate_enumerated_tables(engine):
        raise IOError("Table data has changed")


def _populate_note_type_table(session):
    print("Populating NoteTypes Table")
    for note_type, note_metadata in notes.note_types.items():
        note_id = note_metadata[0]

        new_note_type = notes.NoteTypes(name=note_type, id=note_id)
        session.add(new_note_type)


def _populate_starting_project_status(
        session,
        project_status_table: Type[projects.ProjectStatus]) -> None:

    print(f"Populating {project_status_table.__tablename__} Table")
    statuses = ['In progress', "Complete", "No work done"]
    for status in statuses:
        new_status = project_status_table(name=status)
        session.add(new_status)


def _populate_format_types_table(session):
    print("Populating project_status_type Table")
    for format_type, format_metadata in formats.format_types.items():
        format_id = format_metadata[0]

        new_format_type = formats.FormatTypes(name=format_type,
                                              id=format_id)
        session.add(new_format_type)


def validate_enumerated_tables(engine):
    session = sessionmaker(bind=engine)()
    valid = True

    if not validate_enumerate_table_data(
            engine, formats.FormatTypes,
            formats.format_types):

        valid = False

    if not validate_enumerate_table_data(
            engine, notes.NoteTypes, notes.note_types):

        valid = False

    session.close()
    return valid


def validate_enumerate_table_data(engine,
                                  sql_table_type: Type[
                                      tyko.schema.avtables.AVTables],
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

    expected_table_names = []
    for k in tyko.schema.avtables.AVTables.metadata.tables.keys():
        expected_table_names.append(k)

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
