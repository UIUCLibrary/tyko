import flask.wrappers
from flask import views, request, url_for, jsonify, make_response

from tyko import data_provider
from tyko.data_provider import DataProvider


class ItemFilesAPI(views.MethodView):
    def __init__(self, provider: DataProvider) -> None:
        self._data_provider = provider
        self._data_connector = \
            data_provider.FilesDataConnector(provider.db_session_maker)

    def post(self, project_id, object_id, item_id):
        json_request = request.get_json()
        new_file_id = self._data_connector.create(
            item_id=item_id,
            file_name=json_request['file_name']
        )['id']

        url = url_for("item_file_details",
                      project_id=project_id,
                      object_id=object_id,
                      item_id=item_id,
                      file_id=new_file_id
                      )

        return jsonify({
            "id": new_file_id,
            "url": url
        })


class FileAPI(views.MethodView):
    def __init__(self, provider: DataProvider) -> None:
        self._data_provider = provider
        self._data_connector = \
            data_provider.FilesDataConnector(provider.db_session_maker)

    def get(self,
            project_id: int,
            object_id: int,
            item_id: int,
            file_id: int
            ) -> flask.wrappers.Response:

        return self._data_connector.get(file_id, serialize=True)

    def delete(self,
               project_id: int,
               object_id: int,
               item_id: int,
               file_id: int
               ) -> flask.wrappers.Response:

        self._data_connector.remove(item_id, file_id)
        res = self._data_connector.delete(file_id)
        if res is True:
            return make_response("", 202)
        return make_response("", 404)

    def put(self,
            project_id: int,
            object_id: int,
            item_id: int,
            file_id: int
            ) -> flask.wrappers.Response:

        json_request = request.get_json()
        return self._data_connector.update(file_id, changed_data=json_request)