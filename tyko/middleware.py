# pylint: disable=redefined-builtin, invalid-name
from __future__ import annotations
import abc
import hashlib
import json
import sys
import traceback
import typing
from typing import List, Dict, Any, Iterator, Mapping

import flask
from flask import jsonify, make_response, abort, request, url_for

import tyko.data_provider
from . import pbcore
from .exceptions import DataError
from .views import files

CACHE_HEADER = "private, max-age=0"

if typing.TYPE_CHECKING:
    from sqlalchemy import orm
    from tyko import schema


class AbsMiddlewareEntity(metaclass=abc.ABCMeta):
    WRITABLE_FIELDS: List[str] = []

    @classmethod
    def field_can_edit(cls, field) -> bool:
        return field in cls.WRITABLE_FIELDS

    def __init__(self, data_provider) -> None:
        self._data_provider = data_provider

    @abc.abstractmethod
    def get(self, serialize=False, **kwargs):
        """Add a new entity"""

    @abc.abstractmethod
    def delete(self, id):
        """CRU_D_ Delete"""

    @abc.abstractmethod
    def update(self, id):
        """CR_U_D update"""

    @abc.abstractmethod
    def create(self):
        """_C_RUD update"""

    @classmethod
    def create_changed_data(cls, json_request) -> Dict[str, Any]:
        invalid_names_found = []
        for k in json_request.keys():
            if k not in cls.WRITABLE_FIELDS:
                invalid_names_found.append(k)

        if invalid_names_found:
            raise ValueError(
                f"Invalid field(s) {', '.join(invalid_names_found)}. "
                f"only {', '.join(cls.WRITABLE_FIELDS)} can be modified."
            )

        return {}


class Middleware:
    """Middleware to connect to database."""

    def __init__(self, data_provider: tyko.data_provider.DataProvider) -> None:
        self.data_provider = data_provider

    def get_formats(
            self,
            serialize: bool = True
    ) -> typing.Union[
        flask.Response,
        List[Mapping[str, schema.formats.SerializedData]]
    ]:
        formats = self.data_provider.get_formats(serialize=serialize)
        return jsonify(formats) if serialize else formats

    def get_formats_by_id(self, id: int) -> flask.Response:
        return jsonify(self.data_provider.get_formats(id=id, serialize=True))


class ObjectMiddlewareEntity(AbsMiddlewareEntity):
    WRITABLE_FIELDS = [
        "name",
        "barcode",
        "collection_id",
        'originals_rec_date',
        'originals_return_date'
    ]

    def __init__(self, data_provider: tyko.data_provider.DataProvider) -> None:
        super().__init__(data_provider)

        self._data_connector = \
            tyko.data_provider.ObjectDataConnector(
                data_provider.db_session_maker
            )

    def get(self, serialize=False, **kwargs) -> flask.Response:
        if "id" in kwargs:
            return self.object_by_id(id=kwargs["id"])

        objects = self._data_connector.get(serialize=serialize)

        if serialize:
            data = {
                "objects": objects,
                "total": len(objects)
            }
            return make_response(jsonify(data), 200)

        return objects

    def object_by_id(self, id: int) -> flask.Response:

        if current_object := self._data_connector.get(id, serialize=True):
            for item in current_object['items']:
                item['routes'] = {
                    "api": url_for(
                        'api.object_item',
                        item_id=item['item_id'],
                        object_id=id,
                        project_id=current_object['parent_project_id']
                    ),
                    "frontend": url_for(
                        'site.page_project_object_item_details',
                        item_id=item['item_id'],
                        object_id=id,
                        project_id=current_object['parent_project_id']
                    )
                }
            return jsonify({"object": current_object})

        return abort(404)

    def pbcore(self, id: int) -> flask.Response:
        xml = \
            pbcore.create_pbcore_from_object(
                object_id=id,
                data_provider=self._data_provider
            )

        response = make_response(xml, 200)
        response.headers["Content-type"] = "text/xml"
        return response

    def delete(self, id: int) -> flask.Response:
        if self._data_connector.delete(id):
            return make_response("", 204)

        return make_response("", 404)

    def update(self, id: int) -> flask.Response:
        json_request = request.json
        try:
            new_object = self.create_changed_data(json_request)
        except ValueError as reason:
            return make_response(f"Cannot update object field: {reason}", 400)

        updated_object = \
            self._data_connector.update(
                id, changed_data=new_object)

        if not updated_object:
            return make_response("", 204)

        return jsonify({"object": updated_object})

    @classmethod
    def create_changed_data(cls, json_request) -> Dict[str, Any]:
        new_object = super().create_changed_data(json_request)
        if "name" in json_request:
            new_object["name"] = json_request["name"]
        if "barcode" in json_request:
            new_object["barcode"] = json_request['barcode']
        if "collection_id" in json_request:
            new_object['collection_id'] = json_request['collection_id']
        if "originals_rec_date" in json_request:
            new_object['originals_rec_date'] = json_request[
                'originals_rec_date']
            if new_object['originals_rec_date'].strip() == '':
                new_object['originals_rec_date'] = None
        if 'originals_return_date' in json_request:
            new_object['originals_return_date'] = json_request[
                'originals_return_date']
            if new_object['originals_return_date'].strip() == '':
                new_object['originals_return_date'] = None
        return new_object

    def create(self, data=None):
        data = data or request.get_json()
        object_name = data["name"]
        barcode = data.get('barcode')
        collection_id = data.get('collection_id')
        new_object_id = self._data_connector.create(
            name=object_name,
            barcode=barcode,
            collection_id=collection_id
        )
        return jsonify({
            "id": new_object_id,
            "url": url_for("api.object", object_id=new_object_id)
        })

    def add_note(self, project_id, object_id):  # pylint: disable=W0613
        data = request.get_json()
        try:
            note_type_id = int(data.get("note_type_id"))
            note_text = data.get("text")
            update_object = \
                self._data_connector.add_note(
                    object_id=object_id,
                    note_type_id=note_type_id,
                    note_text=note_text)
            return jsonify({"object": update_object})

        except AttributeError:
            traceback.print_exc(file=sys.stderr)
            return make_response("Invalid note data", 400)

    def remove_note(self, object_id: int, note_id: int) -> flask.Response:
        updated_object = self._data_connector.remove_note(
            object_id=object_id,
            note_id=note_id
        )

        return make_response(jsonify({"object": updated_object}), 202)

    def update_note(self, object_id: int, note_id: int) -> flask.Response:
        data = request.get_json()
        updated_object = \
            self._data_connector.update_note(object_id=object_id,
                                             note_id=note_id,
                                             changed_data=data)
        if not updated_object:
            return make_response("", 204)

        return jsonify(
            {"object": updated_object}
        )

    def remove_item(self, object_id: int, item_id: int) -> flask.Response:
        updated_object = self._data_connector.remove_item(
            object_id=object_id,
            item_id=item_id
        )
        return make_response(jsonify({"object": updated_object}), 202)

    def get_note(self, object_id: int, note_id: int) -> flask.Response:
        return jsonify(
            self._data_connector.get_note(
                object_id=object_id,
                note_id=note_id,
                serialize=True
            )
        )


class CollectionMiddlewareEntity(AbsMiddlewareEntity):
    WRITABLE_FIELDS = [
        "collection_name",
        "record_series",
        "department"
    ]

    def __init__(self, data_provider) -> None:
        super().__init__(data_provider)

        self._data_connector = \
            tyko.data_provider.CollectionDataConnector(
                data_provider.db_session_maker
            )

    def get(self, serialize=False, **kwargs):
        if "id" in kwargs:
            return self.collection_by_id(id=kwargs["id"])

        collections = self._data_connector.get(serialize=serialize)

        if serialize:
            data = {
                "collections": collections,
                "total": len((collections))
            }

            json_data = json.dumps(data)
            response = make_response(jsonify(data), 200)

            hash_value = \
                hashlib.sha256(bytes(json_data, encoding="utf-8")).hexdigest()

            response.headers["ETag"] = str(hash_value)
            response.headers["Cache-Control"] = CACHE_HEADER
            return response

        return collections

    def collection_by_id(self, id):
        if current_collection := self._data_connector.get(id, serialize=True):
            return jsonify({
                "collection": current_collection
            })

        return abort(404)

    def delete(self, id):
        if self._data_connector.delete(id):
            return make_response("", 204)

        return make_response("", 404)

    @classmethod
    def create_changed_data(cls, json_request) -> Dict[str, Any]:
        new_collection = super().create_changed_data(json_request)
        if "collection_name" in json_request:
            new_collection["collection_name"] = json_request["collection_name"]

        if "department" in json_request:
            new_collection["department"] = json_request["department"]

        if "record_series" in json_request:
            new_collection["record_series"] = json_request["record_series"]

        return new_collection

    def update(self, id: int) -> flask.Response:
        json_request = request.get_json()

        try:
            new_collection = self.create_changed_data(json_request)
        except ValueError as reason:
            return make_response(
                f"Cannot update collection: Reason {reason}",
                400
            )

        updated_collection = \
            self._data_connector.update(
                id, changed_data=new_collection)

        if not updated_collection:
            return make_response("", 204)

        return jsonify({"collection": updated_collection})

    def create(self) -> flask.Response:
        data = request.get_json()
        collection_name = data["collection_name"]
        department = data.get("department")
        record_series = data.get("record_series")
        new_collection_id = \
            self._data_connector.create(
                collection_name=collection_name,
                department=department,
                record_series=record_series)

        return jsonify(
            {
                "id": new_collection_id,
                "url":
                    url_for("api.collection", collection_id=new_collection_id),
                "frontend_url":
                    url_for(
                        "site.page_collection_details",
                        collection_id=new_collection_id
                    )
            }
        )


class ProjectMiddlewareEntity(AbsMiddlewareEntity):
    WRITABLE_FIELDS = [
        "title",
        "project_code",
        "status",
        "current_location"
    ]

    def __init__(self, data_provider) -> None:
        super().__init__(data_provider)

        self._data_connector = \
            tyko.data_provider.ProjectDataConnector(
                data_provider.db_session_maker
            )

    def get(self, serialize=False, **kwargs):
        if "id" in kwargs:
            return jsonify(
                {
                    "project": self.get_project_by_id(kwargs["id"])
                }
            )

        limit = request.args.get("limit")
        offset = request.args.get("offset")
        projects = self._data_connector.get(serialize=serialize)
        total_projects = len(projects)

        if limit:
            offset_value = int(offset)
            limit_value = int(limit)
            projects = projects[offset_value:limit_value+offset_value]

        if serialize:
            data = {
                "projects": projects,
                "total": total_projects
            }
            response = make_response(jsonify(data), 200)

            hash_value = \
                hashlib.sha256(
                    bytes(json.dumps(data), encoding="utf-8")
                ).hexdigest()

            response.headers["ETag"] = str(hash_value)
            response.headers["Cache-Control"] = CACHE_HEADER
            return response

        return projects

    def get_project_by_id(self, id: int):
        if current_project := self._data_connector.get(id, serialize=True):
            serialized_project_notes = self.serialize_project_notes(
                current_project.get("notes", []),
                project_id=id
            )
            if serialized_project_notes:
                current_project['notes'] = serialized_project_notes

            for obj in current_project['objects']:
                obj['routes'] = {
                    "frontend":
                        url_for(
                            "site.page_project_object_details",
                            project_id=id,
                            object_id=obj['object_id']
                        ),
                    "api":
                        url_for(
                            "api.project_object",
                            project_id=id,
                            object_id=obj['object_id']
                        )
                }

                obj['notes'] = \
                    self.serialize_object_notes(
                        obj['notes'],
                        project_id=id,
                        object_id=obj['object_id'],
                    )
            return current_project

        return abort(404)

    def serialize_object_notes(
            self,
            notes: Iterator[Dict[str, Any]],
            project_id,
            object_id,
            notes_middleware: typing.Optional[AbsMiddlewareEntity] = None
    ):
        serialize_notes = []

        note_mw = \
            notes_middleware or NotestMiddlewareEntity(self._data_provider)

        for note in notes:
            note_id = note['note_id']
            serialize_note = note_mw.get(id=note_id, resolve_parents=False)
            serialize_note["route"] = {
                'api':
                    url_for(
                        "api.object_notes",
                        note_id=note_id,
                        object_id=object_id,
                        project_id=project_id
                    )
            }
            serialize_notes.append(serialize_note)

        return serialize_notes

    def delete(self, id: int) -> flask.Response:
        if self._data_connector.delete(id):
            return make_response("", 204)

        return make_response("", 404)

    @classmethod
    def create_changed_data(cls, json_request) -> Dict[str, Any]:
        new_project = super().create_changed_data(json_request)

        if "project_code" in json_request:
            new_project["project_code"] = json_request.get("project_code")

        if "current_location" in json_request:
            new_project["current_location"] = \
                json_request.get("current_location")

        if "status" in json_request:
            new_project["status"] = json_request.get("status")

        if "title" in request.json:
            new_project["title"] = json_request.get("title")

        return new_project

    def update(self, id: int) -> flask.Response:

        json_request = request.json
        try:
            new_project = self.create_changed_data(json_request)
        except ValueError as reason:
            return \
                make_response(f"Cannot update project. Reason: {reason}", 400)

        updated_project = \
            self._data_connector.update(
                id, changed_data=new_project)

        if not updated_project:
            return make_response("", 204)

        return jsonify({"project": updated_project})

    def create(self) -> flask.Response:
        data = request.get_json()
        title = data['title']
        project_code = data.get('project_code')
        current_location = data.get('current_location')
        status = data.get('status')
        specs = data.get('specs')
        new_project_id = \
            self._data_connector.create(
                title=title,
                project_code=project_code,
                current_location=current_location,
                status=status,
                specs=specs
            )

        return jsonify(
            {
                "id": new_project_id,
                "url": url_for("api.project", project_id=new_project_id)
            }
        )

    def get_note(self, project_id: int, note_id: int) -> flask.Response:
        return jsonify(
            self._data_connector.get_note(
                project_id=project_id,
                note_id=note_id,
            )
        )

    def update_note(self, project_id: int, note_id: int) -> flask.Response:

        updated_project = \
            self._data_connector.update_note(
                project_id=project_id,
                note_id=note_id,
                changed_data=request.get_json()
            )

        if not updated_project:
            return make_response("", 204)

        return jsonify(
            {"project": updated_project}
        )

    def remove_note(self, project_id: int, note_id: int) -> flask.Response:
        updated_project = \
            self._data_connector.remove_note(
                project_id=project_id,
                note_id=note_id
            )

        return make_response(jsonify({"project": updated_project}), 202)

    def add_note(self, project_id: int) -> flask.Response:

        data = request.get_json()
        try:
            note_type_id = data.get("note_type_id")
            note_text = data.get("text")
            updated_project = \
                self._data_connector.include_note(
                    project_id=project_id,
                    note_type_id=note_type_id,
                    note_text=note_text)

            return jsonify(
                {
                    "project": updated_project
                }
            )
        except ValueError:
            traceback.print_exc(file=sys.stderr)
            return make_response("Invalid contents", 400)

        except AttributeError:
            traceback.print_exc(file=sys.stderr)
            return make_response("Invalid note data", 400)

    def add_object(self, project_id: int) -> flask.Response:
        try:

            new_data = self.get_new_data(request.get_json())
            new_object = \
                self._data_connector.add_object(project_id, data=new_data)

            return jsonify({"object": new_object})

        except AttributeError:
            traceback.print_exc(file=sys.stderr)
            return make_response("Invalid data", 400)
        except KeyError as e:
            traceback.print_exc(file=sys.stderr)
            return make_response(f"Missing required data: {e}", 400)

    def remove_object(self, project_id: int, object_id: int) -> flask.Response:
        try:
            updated_project = self._data_connector.remove_object(
                project_id=project_id, object_id=object_id)

            return make_response(jsonify({"project": updated_project}), 202)

        except DataError as e:
            return make_response(e.message, e.status_code)

    @staticmethod
    def get_new_data(data):
        new_data = data.copy()
        if 'collectionId' in data:
            new_data['collection_id'] = int(data['collectionId'])

        return new_data

    @staticmethod
    def serialize_project_notes(notes, project_id: int):
        serialized_notes = []
        for note in notes.copy():
            note["route"] = {
                'api': url_for(
                    "api.project_notes",
                    note_id=note['note_id'],
                    project_id=project_id
                )
            }
            serialized_notes.append(note)
        return serialized_notes


class ItemMiddlewareEntity(AbsMiddlewareEntity):
    WRITABLE_FIELDS = [
        "name",
        "medusa_uuid",
        "obj_sequence",
        "files"
    ]

    def __init__(self, data_provider) -> None:
        super().__init__(data_provider)

        self._data_connector = \
            tyko.data_provider.ItemDataConnector(
                data_provider.db_session_maker
            )

    def get(self, serialize=False, **kwargs):
        if "id" in kwargs:
            return self.item_by_id(kwargs["id"])

        items = self._data_connector.get(serialize=serialize)
        if serialize:
            data = {
                "items": items,
                "total": len(items)
            }

            json_data = json.dumps(data)
            response = make_response(jsonify(data), 200)

            hash_value = \
                hashlib.sha256(bytes(json_data, encoding="utf-8")).hexdigest()

            response.headers["ETag"] = str(hash_value)
            response.headers["Cache-Control"] = CACHE_HEADER
            return response

        return items

    def item_by_id(self, id: int) -> flask.Response:
        if current_item := self._data_connector.get(id, serialize=True):
            return jsonify({"item": current_item})

        return abort(404)

    def delete(self, id: int) -> flask.Response:

        res = self._data_connector.delete(id)

        if res is True:
            return make_response("", 204)
        return make_response("", 404)

    @classmethod
    def create_changed_data(cls, json_request) -> Dict[str, Any]:
        new_item = super().create_changed_data(json_request)

        for field in cls.WRITABLE_FIELDS:
            if field == "obj_sequence":
                continue
            if field in json_request:
                new_item[field] = json_request.get(field)

        if "obj_sequence" in json_request:
            obj_sequence = json_request.get("obj_sequence")
            new_item["obj_sequence"] = int(obj_sequence)
        return new_item

    def update(self, id: int) -> flask.Response:
        json_request = request.json
        try:
            new_item = self.create_changed_data(json_request)

        except ValueError as reason:
            return make_response(f"Cannot update item. Reason: {reason}", 400)

        replacement_item = \
            self._data_connector.update(id, changed_data=new_item)

        if not replacement_item:
            return make_response("", 204)
        return jsonify({"item": replacement_item})

    def add_file(
            self,
            project_id: int,
            object_id: int,
            item_id: int
    ) -> flask.Response:
        return files.ItemFilesAPI(
            self._data_provider
        ).post(project_id, object_id, item_id)

    def add_note(self, item_id: int) -> flask.Response:
        data = request.get_json()
        try:
            note_type_id = int(data.get("note_type_id"))
            note_text = data.get("text")
            update_item = \
                self._data_connector.add_note(
                    item_id=item_id,
                    note_type_id=note_type_id,
                    note_text=note_text)

            return jsonify({"item": update_item})

        except AttributeError:
            traceback.print_exc(file=sys.stderr)
            return make_response("Invalid data", 400)

    def create(self) -> flask.Response:
        data = request.get_json()
        name = data['name']
        format_id = data['format_id']

        new_item = self._data_connector.create(
            name=name,
            files=data.get("files", []),
            format_id=format_id
        )

        return jsonify(
            {
                "id": new_item['item_id'],
                "url": url_for("api.item", item_id=new_item['item_id'])
            }
        )

    def remove_note(self, item_id: int, note_id: int) -> flask.Response:
        updated_item = self._data_connector.remove_note(
            item_id=item_id,
            note_id=note_id
        )

        return make_response(jsonify({"item": updated_item}), 202)

    def update_note(self, item_id: int, note_id: int) -> flask.Response:
        data = request.get_json()
        updated_object = \
            self._data_connector.update_note(item_id=item_id,
                                             note_id=note_id,
                                             changed_data=data)
        if not updated_object:
            return make_response("", 204)

        return jsonify({"item": updated_object})

    def get_note(self, item_id: int, note_id: int) -> flask.Response:
        return jsonify(
            self._data_connector.get_note(
                item_id=item_id,
                note_id=note_id)
        )


#     todo: add treatment


class NotestMiddlewareEntity(AbsMiddlewareEntity):
    WRITABLE_FIELDS = [
        "text",
        "note_type_id"
    ]

    def __init__(self, data_provider) -> None:
        super().__init__(data_provider)

        self._data_connector = \
            tyko.data_provider.NotesDataConnector(
                data_provider.db_session_maker
            )

    @staticmethod
    def resolve_parents(source: dict) -> dict:
        newone = source.copy()
        parent_routes = []

        for pid in source.get('parent_project_ids', []):
            parent_routes.append(f"{url_for('api.projects')}/{pid}")

        for pid in source.get('parent_object_ids', []):
            parent_routes.append(f"{url_for('api.object')}/{pid}")

        for pid in source.get('parent_item_ids', []):
            parent_routes.append(f"{url_for('api.item')}/{pid}")

        newone['parents'] = parent_routes
        return newone

    def get(self, serialize=False, resolve_parents=True, **kwargs):
        if "id" in kwargs:
            note = self._data_connector.get(kwargs['id'], serialize=True)
            if not resolve_parents:
                del note['parent_project_ids']
                del note['parent_object_ids']
                del note['parent_item_ids']
                return note
            note_data = self.resolve_parents(note)
            del note_data['parent_project_ids']
            del note_data['parent_object_ids']
            del note_data['parent_item_ids']

            return jsonify({"note": note_data})

        notes = self._data_connector.get(serialize=serialize)
        if serialize:
            note_data = []
            for n in notes:
                new_data = n.copy()
                del new_data['parent_project_ids']
                del new_data['parent_object_ids']
                del new_data['parent_item_ids']
                note_data.append(new_data)
            data = {
                "notes": note_data,
                "total": len(note_data)
            }
            json_data = json.dumps(data)
            response = make_response(jsonify(data), 200)

            hash_value = \
                hashlib.sha256(bytes(json_data, encoding="utf-8")).hexdigest()

            response.headers["ETag"] = str(hash_value)
            response.headers["Cache-Control"] = "private, max-age=0"
            return response
        return notes

    def delete(self, id: int) -> flask.Response:
        res = self._data_connector.delete(id)

        if res is True:
            return make_response("", 204)
        return make_response("", 404)

    def update(self, id: int) -> flask.Response:
        new_object = {}
        json_request = request.get_json()
        for k, _ in json_request.items():
            if not self.field_can_edit(k):
                return make_response(f"Cannot update note field: {k}", 400)
        if note_text := json_request.get("text"):
            new_object["text"] = note_text

        if note_text_id := json_request.get("note_type_id"):
            new_object['note_type_id'] = int(note_text_id)

        updated_note = \
            self._data_connector.update(
                id, changed_data=new_object)

        if not updated_note:
            return make_response("", 204)

        return jsonify({"note": updated_note})

    def create(self) -> flask.Response:
        data = request.get_json()
        note_type = int(data['note_type_id'])
        text = data['text']
        new_note_id = self._data_connector.create(
            text=text, note_types_id=note_type
        )
        return jsonify(
            {
                "id": new_note_id,
                "url": url_for("api.note", note_id=new_note_id)
            }
        )

    def list_types(self):
        return {"types": self._data_connector.list_types()}


def get_enums(
        session_maker: orm.sessionmaker,
        enum_type: str
) -> flask.Response:
    session: orm.Session = session_maker()
    try:
        results = tyko.data_provider.enum_getter(session, enum_type)
    finally:
        session.close()
    return jsonify(results)
