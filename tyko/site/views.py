from __future__ import annotations

import flask
from flask import views, request, jsonify

from tyko.data_provider import ObjectDataConnector, ItemDataConnector, \
    ProjectDataConnector


class NewItem(views.MethodView):
    def __init__(self, data_connector: ObjectDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, project_id, object_id) -> flask.Response:
        data = request.form
        return jsonify(self._data_connector.add_item(object_id, data))


class ObjectItemNewNotes(views.MethodView):
    def __init__(self, data_connector: ItemDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs) -> flask.Response:
        item_id = kwargs['item_id']
        data = request.form
        return jsonify(
            self._data_connector.add_note(
                item_id=item_id,
                note_text=data['text'],
                note_type_id=int(data['note_type_id'])
            )
        )


class ObjectUpdateNotes(views.MethodView):
    def __init__(self, data_connector: ObjectDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs) -> flask.Response:
        data = request.form

        changed_data = {}

        if "text" in data:
            changed_data['text'] = data['text']

        if "note_type_id" in data:
            changed_data['note_type_id'] = data['note_type_id']
        return jsonify(
            self._data_connector.update_note(
                object_id=kwargs['object_id'],
                note_id=int(data['noteId']),
                changed_data=changed_data
            )
        )


class ProjectNoteUpdate(views.MethodView):
    def __init__(self, data_connector: ProjectDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs) -> flask.Response:
        project_id = kwargs['project_id']
        data = request.form

        changed_data = {}

        if "text" in data:
            changed_data['text'] = data['text']

        if "note_type_id" in data:
            changed_data['note_type_id'] = data['note_type_id']
        return jsonify(
            self._data_connector.update_note(
                project_id=project_id,
                note_id=int(data['noteId']),
                changed_data=changed_data
            )
        )


class ProjectNewNote(views.MethodView):
    def __init__(self, data_connector: ProjectDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs) -> flask.Response:
        project_id = kwargs['project_id']
        data = request.form
        note_type_id = int(data['note_type_id'])
        text = data['text']
        return jsonify(
            self._data_connector.add_note(project_id, text, note_type_id)
        )


class ProjectNewObject(views.MethodView):
    def __init__(self, data_connector: ProjectDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs) -> flask.Response:
        project_id = kwargs['project_id']
        data = request.form
        print(data)
        return jsonify(self._data_connector.add_object(project_id, data))


class ObjectNewNotes(views.MethodView):
    def __init__(self, data_connector: ObjectDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs) -> flask.Response:
        data = request.form
        note_type_id = int(data['note_type_id'])
        object_id = kwargs['object_id']
        return jsonify(
            self._data_connector.add_note(
                object_id=object_id,
                note_type_id=note_type_id,
                note_text=data['text']
            )
        )


class ObjectItemNewFile(views.MethodView):
    def __init__(self, data_connector: ItemDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, project_id, object_id, item_id) -> flask.Response:
        data = request.form
        return jsonify(self._data_connector.add_file(
            project_id,
            object_id,
            item_id,
            file_name=data['file_name'],
            generation=data['generation'],
        ))


class ObjectItemNotes(views.MethodView):
    def __init__(self, data_connector: ItemDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs) -> flask.Response:
        data = request.form
        note_id = int(data['noteId'])
        item_id = kwargs['item_id']

        return jsonify(
            self._data_connector.update_note(item_id, note_id, data)
        )
