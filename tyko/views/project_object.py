from __future__ import annotations
import typing
from flask import views, jsonify, make_response, url_for

if typing.TYPE_CHECKING:
    from tyko import middleware


class ProjectObjectAPI(views.MethodView):
    def __init__(self, project: middleware.ProjectMiddlewareEntity) -> None:
        self._project = project

    def get(self, project_id, object_id):

        project = self._project.get_project_by_id(id=project_id)
        for project_object in project['objects']:
            if object_id == project_object['object_id']:
                for item in project_object.get('items', []):
                    item['routes'] = \
                        self._add_item_routes(item, object_id, project_id)

                for note in project_object.get('notes', []):
                    note['route'] = {
                        "api": url_for(
                            'api.object_notes',
                            project_id=project_id,
                            object_id=object_id,
                            note_id=note['note_id']
                        )
                    }
                return jsonify(
                    {
                        **project_object,
                        "parent_project_id": project_id
                    }
                )
        return make_response("no matching item", 404)

    def _add_item_routes(self, item, object_id, project_id):
        return {
            "frontend": url_for(
                "site.page_project_object_item_details",
                project_id=project_id,
                object_id=object_id,
                item_id=item['item_id']
            ),
            "api": url_for(
                "api.object_item",
                project_id=project_id,
                object_id=object_id,
                item_id=item['item_id']
            )
        }

    def delete(self, project_id, object_id):
        return self._project.remove_object(project_id, object_id)


class ObjectApi(views.MethodView):
    def __init__(self,
                 object_middleware: middleware.ObjectMiddlewareEntity) -> None:

        self._object_middleware = object_middleware

    def delete(self, object_id: int):
        return self._object_middleware.delete(id=object_id)

    def get(self, object_id: int):
        return self._object_middleware.get(id=object_id)

    def put(self, object_id: int):
        return self._object_middleware.update(id=object_id)


class ProjectObjectNotesAPI(views.MethodView):

    def __init__(self,
                 project_object: middleware.ObjectMiddlewareEntity) -> None:

        self._project_object = project_object

    def delete(self, project_id, object_id, note_id):  # pylint: disable=W0613
        return self._project_object.remove_note(object_id, note_id)

    def put(self, project_id, object_id, note_id):  # pylint: disable=W0613
        return self._project_object.update_note(object_id, note_id)

    def get(self, project_id, object_id, note_id):
        return self._project_object.get_note(object_id, note_id)
