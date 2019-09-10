import abc

from flask import make_response, render_template
import avforms.data_provider
from typing import Tuple

all_forms = set()


class AbsFrontendEntity(metaclass=abc.ABCMeta):
    _entities: Tuple[str, str] = set()

    def __init__(self, provider: avforms.data_provider.DataProvider) -> None:
        self._data_provider = provider

        AbsFrontendEntity._entities.add(
            (self.entity_title, self.entity_list_page_name)
        )

    def list(self):
        return make_response("not implimnented", 404)

    def _render_page(self, tempate, **context):
        context["selected_menu_item"] = self.entity_title
        context["entities"] = self.all_entities()
        context["all_forms"] = all_forms

        return render_template(tempate, **context)

    @property
    @abc.abstractmethod
    def entity_title(self) -> str:
        pass

    @property
    @abc.abstractmethod
    def entity_rule(self) -> str:
        pass


    @property
    @abc.abstractmethod
    def entity_list_page_name(self) -> str:
        pass

    @classmethod
    def all_entities(cls):
        return sorted(cls._entities)

class ProjectFrontend(AbsFrontendEntity):

    def list(self):
        projects = self._data_provider.entities["project"].get(serialize=False)
        return self._render_page(tempate="projects.html", projects=projects)

    @property
    def entity_title(self) -> str:
        return "Project"

    @property
    def entity_rule(self) -> str:
        return "/project"

    @property
    def entity_list_page_name(self) -> str:
        return "page_projects"



class ItemFrontend(AbsFrontendEntity):
    def list(self):
        items = self._data_provider.entities['item'].get(serialize=False)
        return self._render_page(tempate="items.html", items=items)


    @property
    def entity_title(self) -> str:
        return "Item"

    @property
    def entity_rule(self) -> str:
        return "/item"

    @property
    def entity_list_page_name(self) -> str:
        return "page_item"



class ObjectFrontend(AbsFrontendEntity):
    def list(self):
        objects = self._data_provider.entities['object'].get(serialize=False)
        return self._render_page(tempate="objects.html", objects=objects)

    @property
    def entity_title(self) -> str:
        return "Objects"

    @property
    def entity_rule(self) -> str:
        return "/object"

    @property
    def entity_list_page_name(self) -> str:
        return "page_object"


class CollectiontFrontend(AbsFrontendEntity):
    def list(self):
        collections = \
            self._data_provider.entities["collection"].get(serialize=False)

        return self._render_page(tempate="collections.html",
                                 collections=collections)

    @property
    def entity_title(self) -> str:
        return "Collections"

    @property
    def entity_rule(self) -> str:
        return "/collection"

    @property
    def entity_list_page_name(self) -> str:
        return "page_collections"


# class FormatsFrontend(AbsFrontendEntity):
#
#     def list(self):
#         formats = self._data_provider.get_formats(serialize=False)
#         return render_template(
#             "formats.html",
#             selected_menu_item="formats",
#             formats=formats,
#             entities=all_entities,
#             all_forms=all_forms
#         )
#
#     @property
#     def entity_title(self) -> str:
#         return "Format"
