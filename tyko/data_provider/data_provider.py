import abc
import warnings
from abc import ABC, ABCMeta
from datetime import datetime
from typing import \
    Iterator, \
    List, \
    Dict, \
    Any, \
    Optional, \
    TypedDict, \
    Mapping, \
    Union, \
    Callable

import sqlalchemy
from sqlalchemy import true, orm
import sqlalchemy.exc
import tyko
from tyko import schema, utils, database
from tyko.exceptions import DataError, NotValidRequest

from tyko.schema import NoteTypes, Note, formats, CollectionItem, \
    InstantiationFile, Project, ProjectStatus, CollectionObject, Collection, \
    FileNotes, FileAnnotation, FileAnnotationType, CassetteType, \
    CassetteTapeType
from tyko.schema.formats import AVFormat

DATE_FORMAT = '%Y-%m-%d'

TykoEnumData = TypedDict('TykoEnumData', {'name': str, 'id': int})


class AbsDataProviderConnector(metaclass=abc.ABCMeta):

    def __init__(self, session_maker: orm.sessionmaker) -> None:
        self.session_maker = session_maker

    @abc.abstractmethod
    def get(self, id=None, serialize=False):
        """Perform the get command"""

    @abc.abstractmethod
    def create(self, *args, **kwargs):
        """Create a new entity"""

    @abc.abstractmethod
    def update(self, id, changed_data):
        """Update an existing entity"""

    @abc.abstractmethod
    def delete(self, id):
        """Delete an existing entity"""


class AbsNotesConnector(AbsDataProviderConnector, ABC):  # noqa: E501 pylint: disable=abstract-method
    @staticmethod
    def get_note_type(session: orm.Session, note_type_id: int) -> NoteTypes:
        note_types = session.query(NoteTypes) \
            .filter(NoteTypes.id == note_type_id) \
            .all()

        if len(note_types) == 0:
            raise ValueError("Not a valid note_type")
        return note_types[0]

    @classmethod
    def new_note(
            cls,
            session: orm.Session,
            text: str,
            note_type_id: int
    ) -> Note:
        new_note = Note(
            text=text,
            note_type=cls.get_note_type(session, note_type_id)
        )
        session.add(new_note)
        return new_note


def strip_empty_strings(data):
    for key, value in data.items():
        if value == '':
            data[key] = None
    return data


def update_video_cassette(
        item: formats.VideoCassette,
        changed_data: Dict[str, Optional[Union[str, bool, int]]]):
    if date_of_cassette := changed_data.pop('date_of_cassette', None):
        item.date_of_cassette = utils.create_precision_datetime(
            date_of_cassette
        )
    if duration := changed_data.pop('duration', None):
        item.duration = duration

    if label := changed_data.pop('label', None):
        item.label = label

    if title_of_cassette := changed_data.pop('title_of_cassette', None):
        item.title_of_cassette = title_of_cassette

    if generation_id := changed_data.pop('generation_id', None):
        item.generation_id = int(generation_id)

    if cassette_type_id := changed_data.pop('cassette_type_id', None):
        item.cassette_type_id = int(cassette_type_id)


def update_optical(
        item: formats.Optical,
        changed_data: Dict[str, Optional[Union[str, bool, int]]]):
    if date_of_item := changed_data.pop('date_of_item', None):
        item.date_of_item = utils.create_precision_datetime(date_of_item)

    if title_of_item := changed_data.pop('title_of_item', None):
        item.title_of_item = title_of_item

    if duration := changed_data.pop('duration', None):
        item.duration = duration

    if label := changed_data.pop('label', None):
        item.label = label

    if type_id := changed_data.pop('type_id', None):
        item.optical_type_id = int(type_id)


def update_open_reel(
        item: formats.OpenReel,
        changed_data: Dict[str, Optional[Union[str, bool, int]]]):
    if date_of_reel := changed_data.pop('date_of_reel', None):
        item.date_of_reel = utils.create_precision_datetime(date_of_reel)

    if title_of_reel := changed_data.pop('title_of_reel', None):
        item.title_of_reel = title_of_reel

    if base_id := changed_data.pop('base_id', None):
        item.base_id = base_id

    if format_subtype_id := changed_data.pop('format_subtype_id', None):
        item.subtype_id = format_subtype_id

    if generation_id := changed_data.pop('generation_id', None):
        item.generation_id = generation_id

    if reel_brand := changed_data.pop('reel_brand', None):
        item.reel_brand = reel_brand

    if duration := changed_data.pop('duration', None):
        item.duration = duration

    if reel_diameter_id := changed_data.pop('reel_diameter_id', None):
        item.reel_diameter_id = reel_diameter_id

    if reel_speed_id := changed_data.pop('reel_speed_id', None):
        item.reel_speed_id = reel_speed_id

    if reel_thickness_id := changed_data.pop('reel_thickness_id', None):
        item.reel_thickness_id = reel_thickness_id

    if reel_width_id := changed_data.pop('reel_width_id', None):
        item.reel_width_id = reel_width_id

    if track_configuration_id := changed_data.pop(
            'track_configuration_id',
            None
    ):
        item.track_configuration_id = track_configuration_id

    if track_count := changed_data.pop('track_count', None):
        item.track_count = track_count

    if wind_id := changed_data.pop('wind_id', None):
        item.wind_id = wind_id

    if reel_type := changed_data.pop('reel_type', None):
        item.reel_type = reel_type


def update_groove_discs(
        item: formats.GroovedDisc,
        changed_data: Dict[str, Optional[Union[str, bool, int]]]):

    if title_of_album := changed_data.pop('title_of_album', None):
        item.title_of_album = title_of_album

    if title_of_disc := changed_data.pop('title_of_disc', None):
        item.title_of_disc = title_of_disc

    if disc_base_id := changed_data.pop('disc_base_id', None):
        item.disc_base_id = disc_base_id

    if disc_diameter_id := changed_data.pop('disc_diameter_id', None):
        item.disc_diameter_id = disc_diameter_id

    if playback_direction_id := changed_data.pop(
            'playback_direction_id',
            None
    ):
        item.playback_direction_id = playback_direction_id

    if disc_material_id := changed_data.pop('disc_material_id', None):
        item.disc_material_id = disc_material_id

    if playback_speed_id := changed_data.pop('playback_speed_id', None):
        item.playback_speed_id = playback_speed_id

    if side_a_label := changed_data.pop('side_a_label', None):
        item.side_a_label = side_a_label

    if side_a_duration := changed_data.pop('side_a_duration', None):
        item.side_a_duration = side_a_duration

    if side_b_label := changed_data.pop('side_b_label', None):
        item.side_b_label = side_b_label

    if side_b_duration := changed_data.pop('side_b_duration', None):
        item.side_b_duration = side_b_duration

    if date_of_disc := changed_data.pop('date_of_disc', None):
        item.date_of_disc = utils.create_precision_datetime(date_of_disc)


class UpdateFilm:
    @staticmethod
    def update_enum_values(item, changed_data):

        if film_color_id := changed_data.pop('film_color_id', None):
            item.color_id = film_color_id

        if film_base_id := changed_data.pop('film_base_id', None):
            item.film_base_id = film_base_id

        if film_emulsion_id := changed_data.pop('film_emulsion_id', None):
            item.emulsion_id = film_emulsion_id

        if image_type_id := changed_data.pop('image_type_id', None):
            item.image_type_id = image_type_id

        if film_speed_id := changed_data.pop('film_speed_id', None):
            item.film_speed_id = film_speed_id

        if film_gauge_id := changed_data.pop('film_gauge_id', None):
            item.film_gauge_id = film_gauge_id

        if soundtrack_id := changed_data.pop('soundtrack_id', None):
            item.soundtrack_id = soundtrack_id

        if wind_id := changed_data.pop('wind_id', None):
            item.wind_id = wind_id

    @staticmethod
    def update_ad_test(item, changed_data):

        ad_test = changed_data.pop('ad_test_performed', False)
        item.ad_test = ad_test == "on"
        if data_of_ad_test := changed_data.pop('ad_test_date', None):
            item.ad_test_date = \
                utils.create_precision_datetime(data_of_ad_test)
        else:
            item.ad_test_date = None

        item.ad_test_level = changed_data.pop('ad_test_level', None)

    @staticmethod
    def update(item, changed_data):
        if data_of_film := changed_data.pop('date_of_film', None):
            precision = utils.identify_precision(data_of_film)
            item.recording_date = \
                utils.create_precision_datetime(data_of_film, precision)

            item.recording_date_precision = precision

        UpdateFilm.update_ad_test(item, changed_data)

        if can_label := changed_data.pop('can_label', None):
            item.can_label = can_label

        if duration := changed_data.pop('duration', None):
            item.duration = duration

        if title_of_film := changed_data.pop('film_title', None):
            item.title_of_film = title_of_film

        if leader_label := changed_data.pop('leader_label', None):
            item.leader_label = leader_label

        if edge_code_date := changed_data.pop('edge_code_date', None):
            item.edge_code_date = edge_code_date

        if film_length := changed_data.pop('film_length', None):
            item.length = film_length

        if film_shrinkage := changed_data.pop('film_shrinkage', None):
            item.film_shrinkage = film_shrinkage

        UpdateFilm.update_enum_values(item, changed_data)


def update_film(
        item: formats.Film,
        changed_data: Dict[str, Optional[Union[str, bool, int]]]):
    UpdateFilm().update(item, changed_data)


def update_cassette(
        item: formats.AudioCassette,
        changed_data: Dict[str, Optional[Union[str, bool, int]]]):

    if data_of_cassette := changed_data.pop('date_of_cassette', None):
        precision = utils.identify_precision(data_of_cassette)
        item.recording_date = \
            utils.create_precision_datetime(data_of_cassette, precision)

        item.recording_date_precision = precision

    if cassette_title := changed_data.pop('cassette_title', None):
        item.title_of_cassette = cassette_title

    if (
            cassette_type_id := changed_data.pop('cassette_type_id', None)
    ) is not None:
        if cassette_type_id == '':
            item.tape_subtype = None
        else:
            item.tape_subtype_id = int(cassette_type_id)

    if (generation := changed_data.pop('generation_id', None)) is not None:
        if generation == '':
            item.generation = None
        else:
            item.generation_id = generation

    if side_a_label := changed_data.pop('side_a_label', None):
        item.side_a_label = side_a_label

    if side_a_duration := changed_data.pop('side_a_duration', None):
        item.side_a_duration = side_a_duration

    if side_b_label := changed_data.pop('side_b_label', None):
        item.side_b_label = side_b_label

    if side_b_duration := changed_data.pop('side_b_duration', None):
        item.side_b_duration = side_b_duration

    if len(changed_data.items()) > 0:
        raise KeyError(f"Unknown keys {changed_data.keys()}")


def update_format_specific_details(
        format_type: str,
        changed_data,
        session,
        item
):
    data = changed_data.copy()
    update_formats: Dict[
        str,
        Callable[
            [
                AVFormat,
                Dict[str, Optional[Union[str, bool, int]]]
            ],
            None
        ]
    ] = {
        "audio_cassettes": update_cassette,
        "films": update_film,
        "grooved_discs": update_groove_discs,
        "open_reels": update_open_reel,
        "optical": update_optical,
        "video_cassette": update_video_cassette,
    }
    update_format = update_formats.get(format_type)
    if update_format is not None:
        update_format(item, data)
        session.commit()
    else:
        warnings.warn(
            f'Unknown format type {format_type}. Not updating',
            UserWarning
        )


class ItemDataConnector(AbsNotesConnector):

    @staticmethod
    def _get_all(session: orm.Session) -> List[schema.formats.AVFormat]:
        res: List[schema.formats.AVFormat] = \
            list(session.query(schema.formats.Film).all()) + \
            list(session.query(schema.formats.AudioCassette).all()) + \
            list(session.query(schema.formats.AudioVideo).all()) + \
            list(session.query(schema.formats.GroovedDisc).all()) + \
            list(session.query(schema.formats.OpenReel).all()) + \
            list(session.query(schema.formats.CollectionItem).all())
        if len(res) == 0:
            res = list(session.query(formats.AVFormat)
                       .all())
        return res

    @staticmethod
    def _iterall(session: orm.Session) -> Iterator[schema.formats.AVFormat]:
        yield from session.query(schema.formats.Film).all()
        yield from session.query(schema.formats.AudioCassette).all()
        yield from session.query(schema.formats.AudioVideo).all()
        yield from session.query(schema.formats.GroovedDisc).all()
        yield from session.query(schema.formats.OpenReel).all()
        yield from session.query(schema.formats.CollectionItem).all()
        yield from session.query(schema.formats.VideoCassette).all()

    @staticmethod
    def _get_one(
            session: orm.Session,
            table_id: int
    ) -> List[schema.formats.AVFormat]:

        res = list(session.query(schema.formats.Film)
                   .filter(schema.formats.AVFormat.table_id == table_id)
                   .all()) + \
              list(session.query(schema.formats.AudioCassette)
                   .filter(schema.formats.AVFormat.table_id == table_id)
                   .all()) + \
              list(session.query(schema.formats.AudioVideo)
                   .filter(schema.formats.AVFormat.table_id == table_id)
                   .all()) + \
              list(session.query(schema.formats.GroovedDisc)
                   .filter(schema.formats.AVFormat.table_id == table_id)
                   .all()) + \
              list(session.query(schema.formats.OpenReel)
                   .filter(schema.formats.AVFormat.table_id == table_id)
                   .all()) + \
              list(session.query(schema.formats.VideoCassette)
                   .filter(schema.formats.AVFormat.table_id == table_id)
                   .all()) + \
              list(session.query(schema.formats.CollectionItem)
                   .filter(schema.formats.AVFormat.table_id == table_id)
                   .all())
        if len(res) == 0:
            res = list(session.query(schema.formats.AVFormat)
                       .filter(schema.formats.AVFormat.table_id == table_id)
                       .all())
        return res

    @staticmethod
    def _serialize(items: List[formats.CollectionItem]):
        return [
            collection_item.serialize(true) for collection_item in items
        ]

    def get(self, id=None, serialize=False):
        session = self.session_maker()
        try:
            if id is not None:
                all_collection_item = self._get_one(session, id)
            else:
                all_collection_item = self._get_all(session)

            if serialize:
                all_collection_item = self._serialize(all_collection_item)

            if id is not None:
                try:
                    return all_collection_item[0]
                except IndexError as error:
                    raise NotValidRequest(f"No object with id {id}") from error

            return all_collection_item
        finally:
            session.close()

    def add_note(self, item_id: int, note_text: str, note_type_id: int):
        session = self.session_maker()
        try:
            collection_item = self._get_item(item_id, session=session)

            collection_item.notes.append(
                self.new_note(session, note_text, note_type_id)
            )
            session.commit()
            return self._get_item(item_id, session=session).serialize()

        finally:
            session.close()

    def create_new_format_item(
            self,
            session: orm.Session,
            format_data: Mapping[str, str]
    ) -> CollectionItem:

        format_type = \
            session.query(schema.formats.FormatTypes).filter(
                schema.formats.FormatTypes.id == int(format_data["format_id"])
            ).one()

        return \
            CollectionItem(name=format_data['name'], format_type=format_type)

    def create(self, *args, **kwargs):
        session = self.session_maker()
        try:
            format_data = kwargs.copy()
            strip_empty_strings(format_data)
            files = format_data.pop("files", [])

            if 'inspectionDate' in format_data:
                format_data['inspection_date'] = \
                    format_data.pop('inspectionDate')

            if 'transferDate' in format_data:
                format_data['transfer_date'] = \
                    format_data.pop('transferDate')

            transfer_date = format_data.pop('transfer_date', None)
            inspection_date = format_data.pop('inspection_date', None)
            parent_object_id = format_data.pop('object_id', None)
            item_barcode = format_data.pop('itemBarcode', None)
            format_data.pop('medusa_uuid', None)

            new_item = self.create_new_format_item(session, format_data)
            new_item.object_id = parent_object_id
            if transfer_date:
                new_item.transfer_date = \
                    utils.create_precision_datetime(
                        transfer_date,
                        3
                    )
            if inspection_date:
                new_item.inspection_date = \
                    utils.create_precision_datetime(
                        inspection_date
                    )
            if item_barcode:
                new_item.barcode = item_barcode

            for instance_file in files:
                new_file = InstantiationFile(file_name=instance_file['name'])

                new_item.files.append(new_file)
            # new_item.files.append(f)
            session.add(new_item)
            session.commit()
            return new_item.serialize()
        finally:
            session.close()

    def update(self, id, changed_data):
        updated_item = None
        item: CollectionItem = self.get_item(id)
        session = self.session_maker()
        if item:
            copy_of_changed_data = changed_data.copy()
            if name := copy_of_changed_data.pop('name', None):
                item.name = name

            if obj_sequence := copy_of_changed_data.pop('obj_sequence', None):
                item.obj_sequence = int(obj_sequence)

            if format_details := copy_of_changed_data.pop(
                    'format_details',
                    None
            ):
                update_format_specific_details(
                    format_type=item.type,
                    changed_data=format_details,
                    session=session, item=item)

            if barcode := copy_of_changed_data.pop('barcode', None):
                item.barcode = barcode

            self._update_vendor_info(copy_of_changed_data, item)

            unparsed_keys = copy_of_changed_data.keys()
            if len(unparsed_keys) > 0:
                unexpected_keys = ", ".join(unparsed_keys)
                raise DataError(
                    message=f"Invalid Key(s): {unexpected_keys}"
                )

            try:
                session.add(item)
                session.commit()
                updated_item = item.serialize()
            finally:
                session.close()
        return updated_item

    @staticmethod
    def _update_vendor_info(changed_data: Dict[str, str], item):
        """Updates vendor info from changed data.

        Notes:
            This function removes items from changed_data as it updates.
        Args:
            changed_data:
            item:

        Returns:

        """
        if vendor_name := changed_data.pop("vendor_name", None):
            item.vendor_name = vendor_name
        if deliverable_received_date := changed_data.pop(
                'deliverable_received_date',
                None
        ):
            item.deliverable_received_date = \
                utils.create_precision_datetime(deliverable_received_date)
        if originals_received_date := changed_data.pop(
                'originals_received_date',
                None
        ):
            item.originals_received_date = \
                utils.create_precision_datetime(originals_received_date)

    @staticmethod
    def update_cassette_tape(session, format_details, item):
        if item.type == 'audio_cassettes':
            if 'date_recorded' in format_details:
                precision = utils.identify_precision(
                    format_details['date_recorded']
                )
                item.recording_date = \
                    utils.create_precision_datetime(
                        format_details['date_recorded'], precision
                    )
                item.recording_date_precision = precision

            if "inspection_date" in format_details:
                item.inspection_date = \
                    utils.create_precision_datetime(
                        format_details['inspection_date'])

            if "format_type_id" in format_details:
                f_id = format_details['format_type_id']
                item.cassette_type = \
                    session.query(formats.CassetteType).filter(
                        formats.CassetteType.table_id == f_id).one()

            tape_thickness_id = format_details.get("tape_thickness_id")
            if tape_thickness_id:
                item.tape_thickness_id = int(tape_thickness_id)

            tape_type_id = format_details.get('tape_type_id')
            if tape_type_id:
                item.tape_type_id = tape_type_id

    def delete(self, id):
        if id:
            session = self.session_maker()
            try:

                items_deleted = session.query(AVFormat)\
                    .filter(AVFormat.table_id == id).delete()

                success = items_deleted > 0
                session.commit()
            finally:
                session.close()
            return success
        return False

    def get_item(self, id=None, serialize=False):
        return self.get(id, serialize)

    def get_note_types(self):
        session = self.session_maker()
        try:
            return session.query(NoteTypes).all()
        finally:
            session.close()

    @staticmethod
    def _get_item(item_id, session):
        for i in ItemDataConnector._iterall(session):
            if i.table_id == item_id:
                return i
        raise ValueError("Not a valid item")

    def remove_note(self, item_id, note_id):
        session = self.session_maker()
        try:

            item = self._get_item(item_id, session)

            if len(item.notes) == 0:
                raise DataError(f"Item with ID: {item_id} has no notes")

            # Find note that matches the note ID
            for note in item.notes:
                if note.id == note_id:
                    item.notes.remove(note)
                    break
            else:
                raise DataError(
                    message=f"Item id {item_id} contains no note with an"
                            f" id {note_id}",
                    status_code=404
                )

            session.commit()
            return self._get_item(item_id, session).serialize()
        finally:
            session.close()

    def update_note(self, item_id, note_id, changed_data):
        session: sqlalchemy.orm.session.Session = self.session_maker()
        try:
            item = self._get_item(item_id, session=session)

            note = self._find_note(item, note_id)
            if "text" in changed_data:
                note.text = changed_data['text']
            if "note_type_id" in changed_data:

                note_type = session.query(NoteTypes)\
                    .filter(NoteTypes.id == changed_data['note_type_id'])\
                    .one()

                if note_type is not None:
                    note.note_type = note_type

            session.commit()
            new_item = \
                session.query(AVFormat).filter(
                    AVFormat.table_id == item_id).one()

            return new_item.serialize()

        finally:
            session.close()

    @staticmethod
    def _find_note(item, note_id):
        for note in item.notes:
            if note.id == note_id:
                return note
        raise ValueError(f"No matching note for item {note_id}")

    def get_note(self, item_id, note_id):
        session = self.session_maker()
        item = self._get_item(item_id, session=session)
        return self._find_note(item, note_id).serialize()

    def add_file(self, project_id, object_id, item_id, file_name, generation):
        session = self.session_maker()
        try:
            collection_item = self._get_item(item_id, session=session)
            collection_item.files.append(
                self.new_file(session, file_name, generation)
            )
            session.commit()
            return self._get_item(item_id, session=session).serialize()

        finally:
            session.close()

    @staticmethod
    def new_file(
            session,
            file_name: str,
            generation: str
    ) -> InstantiationFile:

        new_file = \
            InstantiationFile(file_name=file_name, generation=generation)

        session.add(new_file)
        return new_file


class DataProvider:
    def __init__(self, engine):
        self.engine = engine
        self.db_engine = engine
        # self.init_database()
        self.db_session_maker = orm.sessionmaker(bind=self.db_engine)

    def init_database(self):
        database.init_database(self.engine)

    def get_formats(self, id=None, serialize=False):
        try:
            session = self.db_session_maker()

            if id:
                all_formats = session.query(schema.formats.FormatTypes)\
                    .filter(schema.formats.FormatTypes.id == id)\
                    .all()
            else:
                all_formats = session.query(schema.formats.FormatTypes).all()
            session.close()

        except sqlalchemy.exc.DatabaseError as error:
            raise DataError(
                f"Enable to get all format. Reason: {error}"
            ) from error

        if serialize:
            return [format_.serialize() for format_ in all_formats]

        return all_formats


class ProjectDataConnector(AbsNotesConnector):

    def get(self, id=None, serialize=False):
        session = self.session_maker()
        if id:
            all_projects = session.query(Project)\
                .filter(Project.id == id)\
                .all()

        else:
            all_projects = session.query(Project).all()

        if serialize is True:
            serialized_projects = []
            for project in all_projects:
                serialized_project = project.serialize(recurse=True)
                serialized_projects.append(serialized_project)

            all_projects = serialized_projects
        session.close()

        if id is not None:
            return all_projects[0]

        return all_projects

    def get_all_project_status(self) -> List[ProjectStatus]:
        """Get the list of all possible statuses that a project can be

        Returns:
            All valid status types for projects

        """
        session = self.session_maker()
        try:
            return session.query(ProjectStatus).all()
        finally:
            session.close()

    def get_project_status_by_name(self, name: str,
                                   create_if_not_exists: bool = False
                                   ) -> ProjectStatus:
        """ Check if an existing status exists and if so, return that, if not
        and create_if_not_exists is false throw an DataError exception

        Args:
            name:
            create_if_not_exists:
        """
        session = self.session_maker()
        try:
            names = session.query(ProjectStatus)\
                .filter(ProjectStatus.name == name).all()

            if len(names) > 1:
                raise DataError(
                    f"Database contained multiple matches for {name}"
                )

            if len(names) == 0:
                if create_if_not_exists:
                    new_project_status = ProjectStatus(name=name)
                    session.add(new_project_status)
                    return new_project_status

                raise DataError("No valid project status")

            return names[0]
        finally:
            session.close()

    def create(self, *args, **kwargs):
        title = kwargs["title"]
        project_code = kwargs.get("project_code")
        current_location = kwargs.get("current_location")
        status = kwargs.get("status")
        specs = kwargs.get("specs")
        session = self.session_maker()

        try:
            new_project = Project(
                title=title,
                project_code=project_code,
                current_location=current_location,
                specs=specs
            )
            if status is not None:
                project_status = self.get_project_status_by_name(status)
                new_project.status = project_status

            session.add(new_project)
            session.flush()
            new_project_id = new_project.id
            session.commit()
            return new_project_id
        finally:
            session.close()

    def include_note(self, project_id, note_type_id, note_text):
        new_project_data = None
        session = self.session_maker()
        try:
            project = self._get_project(session, project_id)

            project.notes.append(
                self.new_note(session, note_text, note_type_id))

            session.commit()
            new_project = \
                session.query(Project).filter(Project.id == project_id).one()

            new_project_data = new_project.serialize()
        finally:
            session.close()
        return new_project_data

    def update_note(self, project_id, note_id, changed_data):
        session = self.session_maker()
        try:

            project = self._get_project(session, project_id)

            note = self._find_note(project, note_id)
            if "text" in changed_data:
                note.text = changed_data['text']
            if "note_type_id" in changed_data:

                note_type = session.query(NoteTypes).filter(
                    NoteTypes.id == changed_data['note_type_id']).one()

                if note_type is not None:
                    note.note_type = note_type

            session.commit()
            new_project = \
                session.query(Project).filter(Project.id == project_id).one()

            return new_project.serialize()
        finally:
            session.close()

    @staticmethod
    def _find_note(project, note_id):
        for note in project.notes:
            if note.id == note_id:
                return note
        raise ValueError("no matching note for project")

    def get_project(self, id=None, serialize=False):

        return self.get(id, serialize)

    def update(self, id, changed_data):
        updated_project = None
        if project := self.get_project(id):
            if "title" in changed_data:
                project.title = changed_data['title']

            if "current_location" in changed_data:
                project.current_location = changed_data['current_location']

            if "project_code" in changed_data:
                project.project_code = changed_data['project_code']

            if "status" in changed_data:
                if isinstance(changed_data['status'], str):
                    project.status = \
                        self.get_project_status_by_name(changed_data['status'])
                else:
                    project.status = changed_data['status']

            session = self.session_maker()
            session.add(project)
            session.commit()
            session.close()

            updated_project = session.query(Project)\
                .filter(Project.id == id)\
                .one()

        return updated_project.serialize()

    def delete(self, id):
        if id:
            session = self.session_maker()
            items_deleted = session.query(Project)\
                .filter(Project.id == id)\
                .delete()

            session.commit()
            session.close()
            return items_deleted > 0
        return False

    def get_note_types(self):
        session = self.session_maker()
        try:
            return session.query(NoteTypes).all()
        finally:
            session.close()

    def remove_note(self, project_id, note_id):
        session = self.session_maker()
        try:
            project = self._get_project(session, project_id)

            if len(project.notes) == 0:
                raise DataError(f"Project with ID: {project_id} has no notes")

            # Find note that matches the note ID
            for note in project.notes:
                if note.id == note_id:
                    project.notes.remove(note)
                    break
            else:
                raise DataError(
                    message=f"Project id {project_id} contains no note with an"
                            f" id {note_id}",
                    status_code=404
                )

            session.commit()
            return session.query(Project) \
                .filter(Project.id == project_id) \
                .one().serialize()
        finally:
            session.close()

    def add_object(self, project_id, data):
        session = self.session_maker()
        try:

            project = self._get_project(session, project_id)
            object_connector = ObjectDataConnector(self.session_maker)
            new_data = {
                k: v
                for k, v in data.items()
                if not isinstance(v, str) or v.strip() != ""
            }

            new_object_id = object_connector.create(**new_data)
            project.objects.append(object_connector.get(id=new_object_id))
            session.commit()
            return object_connector.get(id=new_object_id, serialize=True)
        finally:
            session.close()

    def remove_object(self, project_id, object_id):
        session = self.session_maker()
        try:
            project = self._get_project(session=session, project_id=project_id)
            for child_object in project.objects:
                if child_object.id == object_id:
                    project.objects.remove(child_object)
                    session.commit()
                    return session.query(Project) \
                        .filter(Project.id == project_id) \
                        .one().serialize()
            raise DataError(
                message=f"Project id {project_id} contains no object with an"
                        f" id {object_id}",
                status_code=404
            )
        finally:
            session.close()

    @staticmethod
    def _get_project(
            session: orm.Session,
            project_id: int
    ) -> Project:
        projects = session.query(Project).filter(
            Project.id == project_id).all()

        if len(projects) == 0:
            raise DataError(
                message="Unable to locate project "
                        f"with ID: {project_id}",
                status_code=404
            )

        if len(projects) > 1:
            raise DataError(
                message=f"Found multiple projects with ID: {project_id}"
            )

        return projects[0]

    def get_note(self, project_id, note_id):
        session = self.session_maker()
        try:
            project = self.get(id=project_id, serialize=True)
            notes = project.get('notes', [])
            for note in notes:
                if note_id == note["note_id"]:
                    return note
            raise ValueError("No Note found")
        finally:
            session.close()

    def add_note(self, project_id, text, note_type_id):
        session = self.session_maker()
        try:
            project = self._get_project(session, project_id)
            new_note = self.new_note(session, text, note_type_id)
            project.notes.append(new_note)
            session.commit()
            return new_note.serialize()
        finally:
            session.close()


class ObjectDataConnector(AbsNotesConnector):

    def get(self, id=None, serialize=False):
        session = self.session_maker()
        try:
            if id is not None:
                all_collection_object = \
                    session.query(CollectionObject).filter(
                        CollectionObject.id == id).all()
                if len(all_collection_object) == 0:
                    raise DataError(message=f"Unable to find object: {id}")
            else:
                all_collection_object = \
                    session.query(CollectionObject).filter(
                        CollectionObject.project is not None).all()
        except sqlalchemy.exc.DatabaseError as error:
            raise DataError(
                message=f"Unable to find object: {error}"
            ) from error

        if serialize:
            serialized_all_collection_object = [
                collection_object.serialize(False)
                for collection_object in all_collection_object
            ]

            all_collection_object = serialized_all_collection_object
        session.close()

        if id is not None:
            return all_collection_object[0]

        return all_collection_object

    def create(self, *args, **kwargs):
        name = kwargs["name"]
        data = self.get_data(kwargs)
        new_object = CollectionObject(name=name)
        if 'originals_rec_date' in data:
            new_object.originals_rec_date = data['originals_rec_date']

        barcode = kwargs.get("barcode")
        if barcode is not None:
            new_object.barcode = barcode
        session = self.session_maker()
        if "collection_id" in kwargs and kwargs['collection_id'] is not None:
            collection = session.query(Collection).filter(
                Collection.id == kwargs['collection_id']).one()

            if collection is None:
                raise ValueError("Not a valid collection")
            new_object.collection = collection
        session.add(new_object)
        session.commit()
        object_id = new_object.id
        session.close()

        return object_id

    def update(self, id, changed_data):
        collection_object = self.get(id, serialize=False)
        if not collection_object:
            return
        session = self.session_maker()
        try:
            if "name" in changed_data:
                collection_object.name = changed_data['name']

            if "barcode" in changed_data:
                collection_object.barcode = changed_data['barcode']

            if "collection_id" in changed_data:
                collection = session.query(Collection)\
                    .filter(Collection.id == changed_data['collection_id'])\
                    .one()

                collection_object.collection = collection

            if 'originals_rec_date' in changed_data:
                if changed_data['originals_rec_date'] is None:
                    collection_object.originals_rec_date = None
                else:
                    collection_object.originals_rec_date = \
                        datetime.strptime(
                            changed_data['originals_rec_date'],
                            "%m/%d/%Y"
                        )
            if 'originals_return_date' in changed_data:
                if changed_data['originals_return_date'] is None:
                    collection_object.originals_return_date = None
                else:
                    collection_object.originals_return_date = \
                        datetime.strptime(
                            changed_data['originals_return_date'],
                            "%m/%d/%Y"
                        )

            session.add(collection_object)
            session.commit()

            updated_object = session.query(CollectionObject)\
                .filter(CollectionObject.id == id)\
                .one()
            return updated_object.serialize()

        finally:
            session.close()

    def delete(self, id):
        if id:
            session = self.session_maker()

            items_deleted = session.query(CollectionObject)\
                .filter(CollectionObject.id == id).delete()

            success = items_deleted > 0
            session.commit()
            return success
        return False

    def get_note_types(self):
        session = self.session_maker()
        try:
            return session.query(NoteTypes).all()
        finally:
            session.close()

    def add_note(self, object_id: int,
                 note_type_id: int, note_text) -> Dict[str, Any]:

        session = self.session_maker()
        try:
            collection_object = self._get_object(object_id, session=session)

            collection_object.notes.append(
                self.new_note(session, note_text, note_type_id)
            )
            session.commit()

            new_object = session.query(CollectionObject) \
                .filter(CollectionObject.id == object_id) \
                .one()

            return new_object.serialize()

        finally:
            session.close()

    def remove_note(self, object_id, note_id):
        session = self.session_maker()
        try:
            objects = session.query(CollectionObject)\
                .filter(CollectionObject.id == object_id)\
                .all()

            if len(objects) == 0:
                raise DataError(
                    message=f"Unable to locate collection object with "
                            f"ID: {object_id}",
                    status_code=404
                )

            if len(objects) > 1:
                raise DataError(
                    message=f"Found multiple objects with ID: {object_id}"
                )

            collection_object = objects[0]

            if len(collection_object.notes) == 0:
                raise DataError(
                    f"Object with ID: {object_id} has no notes")

            # Find note that matches the note ID
            for note in collection_object.notes:
                if note.id == note_id:
                    collection_object.notes.remove(note)
                    break
            else:
                raise DataError(
                    message=f"Collection id {object_id} contains no note "
                            f"with an id {note_id}",
                    status_code=404
                )

            session.commit()
            return session.query(CollectionObject) \
                .filter(CollectionObject.id == object_id) \
                .one()\
                .serialize()
        finally:
            session.close()

    def update_note(self, object_id, note_id, changed_data):
        session = self.session_maker()
        try:
            collection_object = self._get_object(object_id, session=session)

            note = self._find_note(collection_object, note_id)
            if "text" in changed_data:
                note.text = changed_data['text']
            if "note_type_id" in changed_data:

                note_type = session.query(NoteTypes)\
                    .filter(NoteTypes.id == changed_data['note_type_id']).one()

                if note_type is not None:
                    note.note_type = note_type

            session.commit()
            new_object = \
                session.query(CollectionObject).filter(
                    CollectionObject.id == object_id).one()

            return new_object.serialize()
        finally:
            session.close()

    @staticmethod
    def _get_object(object_id, session):
        collection_object = session.query(CollectionObject) \
            .filter(CollectionObject.id == object_id) \
            .all()
        if len(collection_object) == 0:
            raise ValueError("Not a valid object")
        collection_object = collection_object[0]
        return collection_object

    @staticmethod
    def _find_note(collection_object, note_id):
        for note in collection_object.notes:
            if note.id == note_id:
                return note
        raise ValueError("No matching note for object")

    def add_item(self, object_id, data):
        session = self.session_maker()
        try:
            matching_object = self._get_object(object_id, session)

            connectors = {
                schema.formats.format_types['video cassette'][0]:
                    tyko.data_provider.formats.VideoCassetteDataConnector,
                schema.formats.format_types['optical'][0]:
                    tyko.data_provider.formats.OpticalDataConnector,
                schema.formats.format_types['open reel'][0]:
                    tyko.data_provider.formats.OpenReelDataConnector,
                schema.formats.format_types['grooved disc'][0]:
                    tyko.data_provider.formats.GroovedDiscDataConnector,
                schema.formats.format_types['film'][0]:
                    tyko.data_provider.formats.FilmDataConnector,
                schema.formats.format_types['audio cassette'][0]:
                    tyko.data_provider.formats.AudioCassetteDataConnector,
            }
            connector = connectors.get(
                int(data['format_id']),
                ItemDataConnector
            )
            item_connector = connector(self.session_maker)
            new_data = data.copy()
            new_item_id = item_connector.create(**new_data)['item_id']

            matching_object.items.append(
                item_connector.get(id=new_item_id)
            )

            session.commit()
            return item_connector.get(id=new_item_id, serialize=True)
        finally:
            session.close()

    def remove_item(self, object_id, item_id):
        session = self.session_maker()
        try:
            matching_item = self._find_item(item_id, session)

            matching_object = self._find_object(
                object_id=object_id,
                session=session
            )
            matching_list = self._find_matching_section(matching_item,
                                                        matching_object)
            if matching_list is not None and matching_item in matching_list:
                matching_list.remove(matching_item)

            session.commit()
            return session.query(CollectionObject) \
                .filter(CollectionObject.id == object_id) \
                .one().serialize()

        finally:
            session.close()

    @staticmethod
    def _find_item(item_id, session) -> AVFormat:
        matching_items = \
            session.query(AVFormat).filter(
                AVFormat.table_id == item_id).all()

        if len(matching_items) == 0:
            raise DataError(message=f"No items found with ID: {item_id}")

        if len(matching_items) > 1:
            raise DataError(message=f"Found multiple items with ID: {item_id}")

        return matching_items[0]

    @staticmethod
    def _find_object(object_id, session) -> CollectionObject:
        matching_objects = \
            session.query(CollectionObject).filter(
                CollectionObject.id == object_id).all()

        if len(matching_objects) == 0:
            raise DataError(message=f"No object found with ID: {object_id}")

        if len(matching_objects) > 1:
            raise DataError(
                message=f"Found multiple objects with ID: {object_id}"
            )

        return matching_objects[0]

    @classmethod
    def get_data(cls, data):
        new_data = data.copy()
        if 'originals_rec_date' in data and \
                data['originals_rec_date'].strip() != "":

            new_data['originals_rec_date'] = \
                datetime.strptime(data['originals_rec_date'], '%Y-%m-%d')

        return new_data

    @staticmethod
    def _find_matching_section(matching_item,
                               matching_object) -> Optional[List[AVFormat]]:

        subtype = matching_object.items
        if matching_item in subtype:
            return subtype
        return None

    def get_note(self, object_id, note_id, serialize=False):
        session = self.session_maker()
        try:
            collection_object = self._get_object(object_id, session=session)
            return self._find_note(
                collection_object,
                note_id
            ).serialize(serialize)

        finally:
            session.close()


class FileNotesDataConnector(AbsDataProviderConnector):

    def get(self, id=None, serialize=False):
        session = self.session_maker()
        try:
            if id is not None:
                all_notes = \
                    session.query(FileNotes).filter(FileNotes.id == id).all()
            else:
                all_notes = \
                    session.query(CollectionObject).filter(
                        CollectionObject.project is not None).all()

            if serialize:
                all_notes = [
                    notes.serialize(True) for notes in all_notes
                ]
            if id is not None:
                return all_notes[0]

            return all_notes
        finally:
            session.close()

    def create(self, *args, **kwargs):
        session = self.session_maker()
        try:
            new_note = FileNotes(file_id=kwargs['file_id'],
                                 message=kwargs['message'])

            session.add(new_note)
            session.commit()
            return new_note.serialize()
        finally:
            session.close()

    def update(self, id, changed_data):
        session = self.session_maker()
        try:
            note_record = session.query(FileNotes) \
                .filter(FileNotes.id == id).one()

            if "message" in changed_data:
                note_record.message = changed_data['message']
            session.commit()
            return note_record.serialize()
        finally:
            session.close()

    def delete(self, id):
        session = self.session_maker()
        try:
            items_deleted = session.query(FileNotes)\
                .filter(FileNotes.id == id).delete()

            success = items_deleted > 0
            session.commit()
            return success

        finally:
            session.close()


class FilesDataConnector(AbsDataProviderConnector):
    def get(self, id=None, serialize=False):
        session = self.session_maker()
        try:
            matching_file = session.query(InstantiationFile)\
                .filter(InstantiationFile.file_id == id).one()

            if serialize is True:
                return matching_file.serialize(recurse=True)

            return matching_file
        finally:
            session.close()

    def create(self, item_id, *args, **kwargs):
        name = kwargs['file_name']
        generation = kwargs.get('generation')
        session = self.session_maker()
        try:
            matching_item = session.query(AVFormat)\
                .filter(AVFormat.table_id == item_id).one()

            new_file = InstantiationFile(file_name=name)

            if generation is not None:
                new_file.generation = generation

            matching_item.files.append(new_file)
            session.flush()
            session.commit()
            return new_file.serialize()
        finally:
            session.close()

    def update(self, id, changed_data):
        session = self.session_maker()
        try:
            matching_file = session.query(InstantiationFile) \
                .filter(InstantiationFile.file_id == id).one()

            if "file_name" in changed_data:
                matching_file.file_name = changed_data['file_name']
            if "generation" in changed_data:
                matching_file.generation = changed_data['generation']
            session.commit()
            return matching_file.serialize()
        finally:
            session.close()

    def delete(self, id: int):
        session = self.session_maker()
        try:
            items_deleted = session.query(InstantiationFile)\
                .filter(InstantiationFile.file_id == id).delete()

            session.commit()
            return items_deleted > 0
        finally:
            session.close()

    def remove(self, item_id: int, file_id: int):
        session = self.session_maker()
        try:
            item = session.query(AVFormat)\
                .filter(AVFormat.table_id == item_id).one()

            for file in item.files:
                if file.file_id == file_id:
                    item.files.remove(file)
                    return True
            raise ValueError(f"Item {item_id} does not have a file with an"
                             f" id of {file_id}")
        finally:
            session.close()


class CollectionDataConnector(AbsDataProviderConnector):

    def get(self, id=None, serialize=False):
        session = self.session_maker()
        if id:
            all_collections = session.query(Collection)\
                .filter(Collection.id == id)\
                .all()
        else:
            all_collections = \
                session.query(Collection).all()

        if serialize:
            all_collections = [
                collection.serialize() for collection in all_collections
            ]

        session.close()

        if id is not None:
            return all_collections[0]

        return all_collections

    def create(self, *args, **kwargs):
        collection_name = kwargs.get("collection_name")
        department = kwargs.get("department")
        record_series = kwargs.get("record_series")

        new_collection = Collection(
            collection_name=collection_name,
            department=department,
            record_series=record_series

        )

        session = self.session_maker()
        session.add(new_collection)
        session.commit()
        new_collection_id = new_collection.id
        session.close()

        return new_collection_id

    def update(self, id, changed_data):
        updated_collection = None
        if collection := self.get(id, serialize=False):
            if "collection_name" in changed_data:
                collection.collection_name = changed_data["collection_name"]

            if "department" in changed_data:
                collection.department = changed_data["department"]

            if "record_series" in changed_data:
                collection.record_series = changed_data["record_series"]

            session = self.session_maker()

            session.add(collection)
            session.commit()
            updated_collection = session.query(Collection)\
                .filter(Collection.id == id)\
                .one()

        return updated_collection.serialize()

    def delete(self, id):
        if id:
            session = self.session_maker()

            collections_deleted = session.query(Collection)\
                .filter(Collection.id == id).delete()

            success = collections_deleted > 0
            session.commit()
            return success
        return False


class NotesDataConnector(AbsDataProviderConnector):

    def get(self, id=None, serialize=False):
        session = self.session_maker()
        if id:
            all_notes = session.query(Note) \
                .filter(Note.id == id) \
                .all()
        else:
            all_notes = \
                session.query(Note).all()

        if serialize:
            serialized_notes = []
            for note in all_notes:
                note_data = note.serialize()

                projects_mentioned = [
                    project.id for project in note.project_sources
                ]
                note_data['parent_project_ids'] = projects_mentioned

                objects_mentioned = [
                    obj.id for obj in note.object_sources
                ]
                note_data['parent_object_ids'] = objects_mentioned

                items_mentioned = [
                    obj.id for obj in note.item_source
                ]
                note_data['parent_item_ids'] = items_mentioned

                serialized_notes.append(note_data)
            all_notes = serialized_notes

        session.close()

        if id is not None:
            return all_notes[0]

        return all_notes

    def list_types(self):
        session = self.session_maker()
        try:
            return [i.serialize() for i in session.query(NoteTypes).all()]
        finally:
            session.close()

    def create(self, *args, **kwargs):
        note_types_id = kwargs.get("note_types_id")
        text = kwargs.get("text")

        new_note = Note(
            text=text,
            note_type_id=note_types_id
        )

        session = self.session_maker()
        session.add(new_note)
        session.commit()
        new_note_id = new_note.id
        session.close()
        return new_note_id

    def update(self, id, changed_data):
        updated_note = None
        if note := self.get(id, serialize=False):
            session = self.session_maker()
            if "text" in changed_data:
                note.text = changed_data['text']

            if 'note_type_id' in changed_data:
                note_types = session.query(NoteTypes)\
                    .filter(NoteTypes.id == changed_data['note_type_id'])

                note_type = note_types.one()
                note.note_type = note_type

            session.add(note)
            session.commit()
            session.close()

            updated_note = session.query(Note) \
                .filter(Note.id == id) \
                .one()
        return updated_note.serialize()

    def delete(self, id):
        if id:
            session = self.session_maker()
            items_deleted = session.query(Note) \
                .filter(Note.id == id) \
                .delete()

            session.commit()
            session.close()
            return items_deleted > 0
        return False


def get_schema_version(db_engine: sqlalchemy.engine.Engine) -> Optional[str]:
    """Get the alembic_version version of a given database.

    Args:
        db_engine:

    Returns:
        Returns a version if exists but returns None is the alembic_version is
        empty.

    """
    results = db_engine.execute("SELECT * FROM alembic_version").first()
    if results is None:
        return None
    return results.version_num


class FileAnnotationsConnector(AbsDataProviderConnector):
    def get_single_annotations(self, annotation_id, serialize):
        session = self.session_maker()
        try:
            annotation = session.query(FileAnnotation)\
                .filter(FileAnnotation.id == annotation_id)\
                .one()
            if serialize is True:
                return annotation.serialize()
            return annotation
        finally:
            session.close()

    def get_all_annotations(self, serialize):
        session = self.session_maker()
        try:
            annotations = []

            for annotation in session.query(FileAnnotationType)\
                    .filter(FileAnnotationType.active == true()):

                if serialize:
                    annotations.append(annotation.serialize())
                else:
                    annotations.append(annotation)
            return annotations
        finally:
            session.close()

    def get(self, id=None, serialize=False):
        if id is None:
            return self.get_all_annotations(serialize)
        return self.get_single_annotations(id, serialize)

    def create(self, *args, **kwargs):
        file_id = kwargs['file_id']
        content = kwargs['content']
        annotation_type_id = kwargs['annotation_type_id']
        session = self.session_maker()
        try:
            new_data = FileAnnotation(file_id=file_id,
                                      annotation_content=content,
                                      type_id=annotation_type_id)

            session.add(new_data)
            session.flush()
            session.refresh(new_data)
            annotation_id = new_data.id
            session.commit()
            return annotation_id
        finally:
            session.close()

    def update(self, id, changed_data):
        session = self.session_maker()
        try:
            annotation = \
                session.query(FileAnnotation)\
                .filter(FileAnnotation.id == id)\
                .one()

            if "content" in changed_data:
                annotation.annotation_content = changed_data['content']
            if "type_id" in changed_data:
                annotation.type_id = changed_data['type_id']
            session.commit()
            return annotation.serialize()
        finally:
            session.close()

    def delete(self, id):
        session = self.session_maker()
        try:
            items_deleted = session.query(FileAnnotation)\
                .filter(FileAnnotation.id == id)\
                .delete()
            session.commit()
            session.close()
            return items_deleted > 0
        finally:
            session.close()


class FileAnnotationTypeConnector(AbsDataProviderConnector):

    def get(self, id=None, serialize=False):
        # TODO: FileAnnotationTypeConnector.get()
        pass

    def create(self, *args, **kwargs):
        annotation_message = kwargs['text']
        session = self.session_maker()
        try:
            new_annotation_type = FileAnnotationType(
                name=annotation_message,
                active=True
            )

            session.add(new_annotation_type)
            session.flush()
            session.refresh(new_annotation_type)
            session.commit()
            return new_annotation_type.serialize()

        finally:
            session.close()

    def update(self, id, changed_data):
        # TODO: FileAnnotationTypeConnector.update()
        pass

    def delete(self, id):
        """
        Sets the annotation type to inactive, not really deleting it.
        Args:
            id:

        Returns:
            bool: true if successful

        """
        session = self.session_maker()
        try:
            annotation_type = session.query(FileAnnotationType) \
                .filter(FileAnnotationType.id == id).one()

            annotation_type.active = False
            session.commit()
            return True
        finally:
            session.close()


class EnumConnector(AbsDataProviderConnector, metaclass=ABCMeta):
    @classmethod
    @property
    @abc.abstractmethod
    def enum_table(cls):
        pass

    def delete(self, id):
        session = self.session_maker()
        try:
            enum_deleted = session.query(self.enum_table) \
                .filter(self.enum_table.table_id == id) \
                .delete()
            session.commit()
            return enum_deleted > 0
        finally:
            session.close()

    @classmethod
    def get_by_id(cls, session, id, serialize):
        enum_results = session.query(cls.enum_table).filter(
            cls.enum_table.table_id == id
        ).one()
        if serialize:
            return enum_results.serialize()
        return enum_results

    def update(self, id, changed_data):
        session = self.session_maker()
        try:
            enum = self.get_by_id(session, id, serialize=False)
            if "name" in changed_data:
                enum.name = changed_data['name']
            session.commit()
            return enum.serialize()
        finally:
            session.close()


class CassetteTypeConnector(EnumConnector):
    enum_table = CassetteType

    def get_all(self, session, serialize):
        cassette_types = session.query(self.enum_table).all()
        if serialize is False:
            return cassette_types

        return [i.serialize() for i in cassette_types]

    def get(self, id=None, serialize=False):
        session = self.session_maker()
        try:
            if id is not None:
                cassette_types = self.get_by_id(session, int(id), serialize)
            else:
                cassette_types = self.get_all(session, serialize)
            return cassette_types
        finally:
            session.close()

    def create(self, *args, **kwargs):
        name = kwargs["name"]
        session = self.session_maker()
        try:
            if self.entry_already_exists(name, session) is True:
                raise ValueError(
                    f"Already a value stored for {self.enum_table}"
                )
            new_cassette_type = self.enum_table(name=name)
            session.add(new_cassette_type)
            session.flush()
            session.commit()
            return new_cassette_type.serialize()
        finally:
            session.close()

    def entry_already_exists(self, name, session):
        return session.query(self.enum_table).filter(
            self.enum_table.name == name).count() > 0


class CassetteTapeTypeConnector(EnumConnector):
    enum_table = CassetteTapeType

    def get(self, id=None, serialize=False):
        session = self.session_maker()
        try:
            if id is not None:
                cassette_types = session.query(CassetteTapeType).filter(
                    CassetteTapeType.table_id == id
                )
            else:
                cassette_types = session.query(CassetteTapeType).all()
            if serialize is False:
                return cassette_types

            enum_types = [i.serialize() for i in cassette_types]
            if id is not None:
                return enum_types[0]
            return enum_types
        finally:
            session.close()

    def create(self, *args, **kwargs):
        new_tape_type = CassetteTapeType(name=kwargs['name'])
        session = self.session_maker()
        try:
            session.add(new_tape_type)
            session.commit()
            return new_tape_type.serialize()
        finally:
            session.close()


def enum_getter(session: orm.Session, enum_name: str) -> List[TykoEnumData]:
    data_type: schema.formats.EnumTable = getattr(schema.formats, enum_name)
    return [
        {
            "id": item.table_id,
            "name": item.name
        } for item in session.query(data_type).all()
    ]
