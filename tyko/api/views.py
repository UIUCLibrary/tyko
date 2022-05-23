from __future__ import annotations
import typing

import flask.views

if typing.TYPE_CHECKING:
    from tyko import middleware


class CollectionsAPI(flask.views.MethodView):
    def __init__(self,
                 collection: middleware.CollectionMiddlewareEntity) -> None:

        self._collection = collection

    def get(self, collection_id: int) -> flask.Response:
        return self._collection.get(id=collection_id)

    def put(self, collection_id: int) -> flask.Response:
        return self._collection.update(id=collection_id)

    def delete(self, collection_id: int) -> flask.Response:
        return self._collection.delete(id=collection_id)


class NotesAPI(flask.views.MethodView):
    def __init__(self,
                 notes_middleware: middleware.NotestMiddlewareEntity) -> None:
        self._middleware = notes_middleware

    def delete(self, note_id: int) -> flask.Response:
        return self._middleware.delete(id=note_id)

    def get(self, note_id: int) -> flask.Response:
        return self._middleware.get(id=note_id)

    def put(self, note_id: int) -> flask.Response:
        return self._middleware.update(id=note_id)
