"""Manage the database."""

import sys
import itertools
import typing
from typing import (
    Tuple,
    Any,
    Type,
    List,
    TypedDict,
    Union,
    Mapping,
    cast,
    Iterable
)
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy
import sqlalchemy.orm
from sqlalchemy.orm.session import sessionmaker


import tyko.schema.avtables

from tyko import schema
from .schema import formats
from .schema import notes
from .schema import projects
if typing.TypedDict:
    from tyko.schema.avtables import AVTables
    from tyko.schema.formats import AVFormat

db = SQLAlchemy()
TykoEnumData = TypedDict('TykoEnumData', {'name': str, 'id': int})


def alembic_table_exists(engine) -> bool:
    """Check for alembic table."""
    import packaging.version  # pylint: disable=import-outside-toplevel
    if packaging.version.parse(sqlalchemy.__version__) < \
            packaging.version.parse("1.4"):
        return engine.dialect.has_table(engine, "alembic_version")
    return sqlalchemy.inspect(engine).has_table("alembic_version")


def _create_sample_object(session, collection, project):
    object_title = "sample object"
    if sample_object := session.query(
            schema.CollectionObject
    ).filter_by(name=object_title).first():
        return sample_object
    print("adding sample object")
    new_collection_object = schema.CollectionObject(
        name=object_title,
        project=project,
        collection=collection
    )
    session.add(new_collection_object)
    return new_collection_object

def _create_sample_item(session, parent_object: schema.CollectionObject):
    item_title = "sample cassette"
    if sample_cassette := session.query(
            schema.Film
    ).filter_by(name=item_title).first():
        return sample_cassette
    print("adding sample cassettee item")
    new_cassette = schema.AudioCassette()
    new_cassette.name = "sss"
    parent_object.items.append(new_cassette)
    session.add(new_cassette)
    session.commit()
    return new_cassette


def _create_sample_project(session):
    project_title = "sample project"
    if sample_project := session.query(
            schema.Project
    ).filter_by(title=project_title).first():
        return sample_project
    print("adding sample project")
    new_project = schema.Project(title=project_title)
    session.add(new_project)
    return new_project


def _create_sample_collection(session: sqlalchemy.orm.Session) -> schema.Collection:
    sample_collection = session.query(schema.Collection).filter_by(
            collection_name='sample collection'
    ).first()
    if sample_collection:
        return sample_collection

    print("Adding sample collection ")
    new_collection = schema.Collection()
    new_collection.collection_name = \
        cast(
            sqlalchemy.Column[sqlalchemy.Text],
            "sample collection"
        )
    session.add(new_collection)
    return new_collection

def _get_enum_tables(
        session: sqlalchemy.orm.Session
) -> Iterable[formats.EnumTable]:
    enum_table_classes: List[Type[formats.EnumTable]] = [
        formats.OpenReelSubType,
        formats.OpenReelReelWidth,
        formats.OpenReelReelDiameter,
        formats.OpenReelReelThickness,
        formats.OpenReelBase,
        formats.OpenReelReelWind,
        formats.OpenReelSpeed,
        formats.OpenReelTrackConfiguration,
        formats.OpenReelGeneration,
        formats.OpticalType,
        formats.VideoCassetteType,
        formats.VideoCassetteGenerations,
        formats.GroovedDiscDiscDiameter,
        formats.GroovedDiscDiscMaterial,
        formats.GroovedDiscPlaybackDirection,
        formats.GroovedDiscDiscBase,
        formats.GroovedDiscPlaybackSpeed,
        formats.FilmFilmSpeed,
        formats.FilmFilmGauge,
        formats.FilmFilmBase,
        formats.FilmSoundtrack,
        formats.FilmColor,
        formats.FilmImageType,
        formats.FilmWind,
        formats.FilmEmulsion,
        formats.AudioCassetteSubtype,
        formats.AudioCassetteGeneration

    ]
    for enum_table_class in enum_table_classes:
        for new_type_name in enum_table_class.default_values:
            if session.query(
                enum_table_class
            ).filter_by(name=new_type_name).first() is None:
                yield enum_table_class(name=new_type_name)


def _populate_enum_tables(session: sqlalchemy.orm.Session) -> None:
    enum_table_classes: List[Type[formats.EnumTable]] = [
        formats.OpenReelSubType,
        formats.OpenReelReelWidth,
        formats.OpenReelReelDiameter,
        formats.OpenReelReelThickness,
        formats.OpenReelBase,
        formats.OpenReelReelWind,
        formats.OpenReelSpeed,
        formats.OpenReelTrackConfiguration,
        formats.OpenReelGeneration,
        formats.OpticalType,
        formats.VideoCassetteType,
        formats.VideoCassetteGenerations,
        formats.GroovedDiscDiscDiameter,
        formats.GroovedDiscDiscMaterial,
        formats.GroovedDiscPlaybackDirection,
        formats.GroovedDiscDiscBase,
        formats.GroovedDiscPlaybackSpeed,
        formats.FilmFilmSpeed,
        formats.FilmFilmGauge,
        formats.FilmFilmBase,
        formats.FilmSoundtrack,
        formats.FilmColor,
        formats.FilmImageType,
        formats.FilmWind,
        formats.FilmEmulsion,
        formats.AudioCassetteSubtype,
        formats.AudioCassetteGeneration

    ]
    for enum_table_class in enum_table_classes:
        for new_type_name in enum_table_class.default_values:
            if session.query(
                enum_table_class
            ).filter_by(name=new_type_name).first() is None:
                yield enum_table_class(name=new_type_name)


def create_samples(engine: sqlalchemy.engine.Engine) -> None:
    session_maker = sessionmaker(bind=engine)
    session: sqlalchemy.orm.Session = session_maker()
    sample_collection = _create_sample_collection(session)
    sample_project = _create_sample_project(session)
    sample_object = _create_sample_object(
        session,
        collection=sample_collection,
        project=sample_project)
    # _create_sample_item(
    #     session,
    #     parent_object=sample_object)

    session.commit()
    session.close()


def init_database(engine: sqlalchemy.engine.Engine) -> None:
    """Initialize database."""
    # if engine.dialect.has_table(engine, "audio_video"):
    #     return
    print("Creating all tables")
    tyko.schema.avtables.AVTables.metadata.create_all(bind=engine)

    initial_session = sessionmaker(bind=engine)
    session: sqlalchemy.orm.Session = initial_session()
    if not alembic_table_exists(engine):
        version_table = sqlalchemy.Table(
            "alembic_version", tyko.schema.avtables.AVTables.metadata,
            sqlalchemy.Column(
                "version_num",
                sqlalchemy.String(length=32),
                primary_key=True
            )
        )
        tyko.schema.avtables.AVTables.metadata.create_all(bind=engine)
        set_version_sql = \
            version_table.insert().values(version_num=schema.ALEMBIC_VERSION)  # noqa: E501 pylint: disable=E1120
        session.execute(set_version_sql)

    session.commit()

    for i in session.query(notes.NoteTypes):
        session.delete(i)

    for i in session.query(formats.FormatTypes):
        session.delete(i)

    session.add_all(
        itertools.chain(
            _iter_format_types_table(session),
            _get_enum_tables(session),
            _iter_note_type_table(session),
            _iter_starting_project_status(
                session,
                project_status_table=projects.ProjectStatus
            )
        )
    )

    session.commit()
    session.close()

    if not validate_tables(engine):
        raise IOError("Newly created database is invalid")

    if not validate_enumerated_tables(engine):
        raise IOError("Table data has changed")


def _iter_note_type_table(
        session: sqlalchemy.orm.Session
) -> Iterable[notes.NoteTypes]:
    for (note_type, note_metadata) in notes.note_types.items():
        if session.query(notes.NoteTypes).filter_by(
                name=note_type
        ).first() is None:
            yield notes.NoteTypes(name=note_type, id=note_metadata[0])


def _iter_starting_project_status(
        session: sqlalchemy.orm.Session,
        project_status_table: Type[projects.ProjectStatus]
) -> Iterable[projects.ProjectStatus]:
    statuses = ['In progress', "Complete", "No work done"]
    for status in statuses:
        if session.query(
                project_status_table
        ).filter_by(name=status).first() is None:
            yield project_status_table(name=status)

def _iter_format_types_table(
        session: sqlalchemy.orm.Session
) -> Iterable[formats.FormatTypes]:

    for (format_type, format_metadata) in formats.format_types.items():
        if session.query(
            formats.FormatTypes
        ).filter_by(
            name=format_type,
        ).first() is None:
            yield formats.FormatTypes(name=format_type, id=format_metadata[0])


def validate_enumerated_tables(engine: sqlalchemy.engine.Engine) -> bool:
    """Validate tables used for enumerated values.

    Returns:
        Returns true if valid, false it not valid
    """
    session = sessionmaker(bind=engine)()
    valid = True

    if not validate_enumerate_table_data(
            engine,
            formats.FormatTypes,
            formats.format_types
    ):

        valid = False

    if not validate_enumerate_table_data(
            engine,
            notes.NoteTypes,
            notes.note_types
    ):

        valid = False

    session.close()
    return valid


def validate_enumerate_table_data(
        engine: sqlalchemy.engine.Engine,
        sql_table_type: Type[AVTables],
        expected_table: Mapping[
            str,
            Union[
                Tuple[int, Any],
                Tuple[int, Type[AVFormat]],
                Tuple[int]
            ]
        ]
) -> bool:
    """Validate enumerated table data."""
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


def validate_tables(engine: sqlalchemy.engine.Engine) -> bool:
    """Validate all required tables exist."""
    tables_to_discard = [
        "alembic_version"
    ]

    expected_table_names = {
        table_name for table_name in
        tyko.schema.avtables.AVTables.metadata.tables.keys()
        if table_name not in tables_to_discard
    }
    valid = True

    existing_tables = {
        table_name for table_name in
        sqlalchemy.inspect(engine).get_table_names()
        if table_name not in tables_to_discard
    }
    for table in existing_tables:
        if table not in expected_table_names:
            print(f"Unexpected table found: {table}", file=sys.stderr)
            valid = False
        else:
            expected_table_names.remove(table)

    if len(expected_table_names) > 0:
        missing_tables = ",".join(expected_table_names)
        print(f"Missing tables [{missing_tables}]")
        valid = False
    return valid
