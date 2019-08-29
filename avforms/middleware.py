from flask import jsonify
from typing import Mapping
from avforms.data_provider import DataProvider
from avforms.entities import AbsEntity
from .entities import load_entity


class Middleware:
    def __init__(self, data_provider: DataProvider) -> None:
        self.data_provider = data_provider

        entities = [
            "project",
            "collection",
            "item"
        ]
        self.entities: Mapping[str, AbsEntity] = dict()
        for entity in entities:
            self.entities[entity] = \
                load_entity(entity, self.data_provider).middleware()

    def get_formats(self, serialize=True):
        formats = self.data_provider.get_formats(serialize=serialize)
        if serialize:
            result = jsonify(formats)
        else:
            result = formats
        return result
