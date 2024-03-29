import sys
import traceback
from typing import Dict

from flask import views, make_response, jsonify, request, url_for

from tyko import middleware, data_provider


class ObjectItemNotesAPI(views.MethodView):
    def __init__(self, item: middleware.ItemMiddlewareEntity) -> None:
        self._item = item

    def put(self, project_id, object_id, item_id, note_id):  # noqa: E501 pylint: disable=W0613,C0301
        return self._item.update_note(item_id, note_id)

    def delete(self, project_id, object_id, item_id, note_id):  # noqa: E501  pylint: disable=W0613,C0301
        return self._item.remove_note(item_id, note_id)

    def get(self,  project_id, object_id, item_id, note_id):  # noqa: E501  pylint: disable=W0613,C0301
        return self._item.get_note(item_id, note_id)


class ObjectItemAPI(views.MethodView):
    def __init__(self, provider: data_provider.DataProvider) -> None:

        self._provider = provider

    def post(self, project_id, object_id):  # noqa: E501  pylint: disable=W0613,C0301
        current_project = middleware.ProjectMiddlewareEntity(
            self._provider).get_project_by_id(project_id)
        # make sure that the project has that object
        for child_object in current_project['objects']:
            if child_object['object_id'] == object_id:
                break
        else:
            return make_response(
                f"Project with id {project_id} does not have an object with an"
                f" id of {object_id}",
                404)
        request_data = request.get_json()
        try:
            data = request_data.copy()
            data.pop('transfer_date', None)
            data.pop('inspection_date', None)
            new_item_data = {
                "name": data.pop("name"),
                "format_id": data.pop("format_id"),
                "files": data.pop("files", []),
                "format_details": data
            }
        except KeyError as error:
            traceback.print_exc(file=sys.stderr)
            return make_response(f"missing required value {error}", 400)

        format_type = self._provider.get_formats(
            request_data["format_id"], serialize=True)[0]
        connectors = {
            "audio cassette": data_provider.formats.AudioCassetteDataConnector,
            'cassette tape': data_provider.formats.AudioCassetteDataConnector,
            "film": data_provider.formats.FilmDataConnector,
            'grooved disc': data_provider.formats.GroovedDiscDataConnector,
            'open reel': data_provider.formats.OpenReelDataConnector,
            'optical': data_provider.formats.OpticalDataConnector,
            "video cassette": data_provider.formats.VideoCassetteDataConnector
        }
        connector_class = connectors.get(format_type['name'])
        if connector_class is not None:
            connector = connector_class(self._provider.db_session_maker)
            new_item = connector.create(**request_data, object_id=object_id)
        else:
            data_connector = \
                data_provider.ObjectDataConnector(
                    self._provider.db_session_maker
                )

            new_item = data_connector.add_item(
                object_id=object_id,
                data=new_item_data)
        try:
            return jsonify(
                {
                    "item": new_item,
                    'routes': {
                        "frontend":
                            url_for("site.page_project_object_item_details",
                                    object_id=object_id,
                                    project_id=project_id,
                                    item_id=new_item['item_id']
                                    ),
                        "api": url_for("api.object_item",
                                       object_id=object_id,
                                       project_id=project_id,
                                       item_id=new_item['item_id']
                                       )
                    }
                }
            )
        except AttributeError:
            traceback.print_exc(file=sys.stderr)
            return make_response("Invalid item data", 400)

    def get(self, project_id, object_id):  # noqa: E501  pylint: disable=W0613,C0301
        item_id = int(request.args.get("item_id"))

        connector = data_provider.ItemDataConnector(
            self._provider.db_session_maker)

        i = connector.get(id=item_id, serialize=True)
        if i['parent_object_id'] != object_id:
            raise AttributeError("object id doesn't match item id")
        i['files'] = self._add_routes_to_files(
            files=i['files'],
            item_id=item_id,
            object_id=object_id,
            project_id=project_id
        )

        for note in i['notes']:
            note['route'] = self.get_note_routes(
                note,
                object_id=object_id,
                project_id=project_id,
                item_id=item_id
            )
        return i

    def put(self, project_id, object_id):
        item_id = request.args.get("item_id")
        data = request.get_json()
        connector = data_provider.ItemDataConnector(
            self._provider.db_session_maker
        )

        replacement_item = connector.update(int(item_id), data)
        return replacement_item

    @staticmethod
    def get_note_routes(note, item_id, object_id,
                        project_id) -> Dict[str, str]:

        return {
            "api": url_for("api.item_notes",
                           note_id=note['note_id'],
                           item_id=item_id,
                           object_id=object_id,
                           project_id=project_id)
        }

    def delete(self, project_id, object_id):  # noqa: E501  pylint: disable=W0613,C0301
        item_id = int(request.args.get("item_id"))
        parent_object = middleware.ObjectMiddlewareEntity(self._provider)
        return parent_object.remove_item(object_id=object_id, item_id=item_id)

    def _add_routes_to_files(self, files, item_id, object_id, project_id):
        new_files = []
        for file_entry in files:
            updated_file_entry = file_entry.copy()
            updated_file_entry['routes'] = {
                "api": url_for("api.item_files",
                               item_id=item_id,
                               object_id=object_id,
                               project_id=project_id,
                               id=file_entry['id']
                               ),
                "frontend": url_for(
                    "site.page_file_details",
                    item_id=item_id,
                    object_id=object_id,
                    project_id=project_id,
                    file_id=file_entry['id']
                )
            }
            new_files.append(updated_file_entry)
        return new_files


class ItemAPI(views.MethodView):
    WRITABLE_FIELDS = [
        "name",
        "medusa_uuid",
        "obj_sequence",
        "files"
    ]

    def __init__(self, provider: data_provider.DataProvider) -> None:
        self._data_provider = provider
        self._data_connector = \
            data_provider.ItemDataConnector(provider.db_session_maker)

    def put(self, item_id):
        replacement_item = self._data_connector.update(
            int(item_id),
            request.json
        )
        if not replacement_item:
            return make_response("", 204)
        return jsonify(
            {
                "item": replacement_item
            }
        )

    def get(self, item_id):
        item = self._data_connector.get(item_id, True)
        object_provider = data_provider.ObjectDataConnector(
            self._data_provider.db_session_maker
        )

        if 'parent_object_id' in item and item['parent_object_id'] is not None:
            parent_project = \
                object_provider.get(id=item['parent_object_id'],
                                    serialize=True)['parent_project_id']

            for file in item['files']:
                file['routes'] = {
                    "frontend": url_for("site.page_file_details",
                                        item_id=item['item_id'],
                                        object_id=item['parent_object_id'],
                                        project_id=parent_project,
                                        file_id=file["id"]),
                    "api": url_for("api.item_files",
                                   item_id=item['item_id'],
                                   object_id=item['parent_object_id'],
                                   project_id=parent_project, id=file["id"])

                }

        data = {
            "item": item
        }

        return make_response(jsonify(data), 200)

    def delete(self, item_id):
        res = self._data_connector.delete(item_id)

        if res is True:
            return make_response("", 204)
        return make_response("", 404)


class ObjectItemTreatmentAPI(views.MethodView):
    def __init__(self, provider: data_provider.DataProvider) -> None:
        self._provider = provider
        self.data_connector = \
            data_provider.ItemDataConnector(self._provider.db_session_maker)

    def put(self, project_id, object_id, item_id):
        data = request.get_json()
        if not (treatment_id := request.args.get("treatment_id")):
            raise AttributeError('missing id')
        return self.data_connector.update_treatment(
                item_id,
                int(treatment_id),
                data=data
        )

    def get(self, project_id, object_id, item_id):
        treatment_id = request.args.get("treatment_id")
        if not treatment_id:
            raise AttributeError('missing id')
        treatment_id = int(treatment_id)
        return self.data_connector.get_treatment(item_id, treatment_id)

    def post(self, project_id, object_id, item_id):
        return self.data_connector.add_treatment(
            item_id,
            data=request.get_json()
        )

    def delete(self, project_id, object_id, item_id):
        return self.data_connector.remove_treatment(
            item_id,
            data=request.get_json()
        )
