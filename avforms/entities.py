import abc
from typing import NamedTuple, Type
import avforms.data_provider
from avforms import middleware

class AbsFactory(metaclass=abc.ABCMeta):
    def __init__(self, provider: avforms.data_provider.DataProvider) -> None:
        self._data_provider = provider

    @abc.abstractmethod
    def middleware(self) -> middleware.AbsMiddlwareEntity:
        pass

class EntityComponent(NamedTuple):
    factory: Type[AbsFactory]
    data_provider: Type[avforms.data_provider.AbsDataProvider]


class ProjectFactory(AbsFactory):
    def middleware(self) -> middleware.AbsMiddlwareEntity:
        return middleware.ProjectMiddlwareEntity(self._data_provider)


class ItemFactory(AbsFactory):
    def middleware(self) -> middleware.AbsMiddlwareEntity:
        return middleware.ItemMiddlwareEntity(self._data_provider)


class CollectionFactory(AbsFactory):

    def middleware(self):
        return middleware.CollectionMiddlwareEntity(self._data_provider)

class ObjectFactory(AbsFactory):

    def middleware(self):
        return middleware.ObjectMiddlwareEntity(self._data_provider)


def load_entity(name, data_provider: avforms.data_provider.DataProvider) -> AbsFactory:
    new_entity = entities[name][0]
    return new_entity(data_provider)


entities = {
    "project": EntityComponent(
        factory=ProjectFactory,
        data_provider=avforms.data_provider.ProjectData
    ),
    "collection": EntityComponent(
        factory=CollectionFactory,
        data_provider=avforms.data_provider.CollectionData
    ),
    "item": EntityComponent(
        factory=ItemFactory,
        data_provider=avforms.data_provider.ItemData
    ),
    "object": EntityComponent(
        factory=ObjectFactory,
        data_provider=avforms.data_provider.ObjectData
    ),
}
