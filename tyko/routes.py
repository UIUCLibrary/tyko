# pylint: disable=invalid-name, not-an-iterable

from dataclasses import dataclass, field
from typing import Any, List, Iterator, Tuple, Callable, Optional, Union
from flask import jsonify, render_template, views

import tyko.views.files
from . import middleware
from .data_provider import DataProvider
from . import frontend
from .views.object_item import ObjectItemNotesAPI, ObjectItemAPI
from .views.object_item import ItemAPI
from .views.project import ProjectNotesAPI, ProjectAPI
from .views.project_object import ProjectObjectAPI, ObjectApi, \
    ProjectObjectNotesAPI


@dataclass
class Route:
    rule: str
    method: str
    view_function: Any
    methods: List[str] = field(default_factory=lambda: ["GET"])


@dataclass
class APIEntity:
    entity_type: str
    rules: List[Route] = field(default_factory=list)


@dataclass
class EntityPage:
    entity_type: str
    entity_list_page: str
    routes: List[Route] = field(default_factory=list)


_all_entities = set()


@dataclass
class UrlRule:
    rule: str
    endpoint: Optional[str] = None
    view_func: Optional[Union[views.View, Callable]] = None
    methods: List[str] = field(default_factory=lambda: ["GET"])
    defaults: Optional[dict] = None


class NotesAPI(views.MethodView):
    def __init__(self,
                 notes_middleware: middleware.NotestMiddlwareEntity) -> None:
        self._middleware = notes_middleware

    def delete(self, note_id: int):
        return self._middleware.delete(id=note_id)

    def get(self, note_id: int):
        return self._middleware.get(id=note_id)

    def put(self, note_id: int):
        return self._middleware.update(id=note_id)


class CollectionsAPI(views.MethodView):
    def __init__(self,
                 collection: middleware.CollectionMiddlwareEntity) -> None:

        self._collection = collection

    def get(self, collection_id: int):
        return self._collection.get(id=collection_id)

    def put(self, collection_id: int):
        return self._collection.update(id=collection_id)

    def delete(self, collection_id: int):
        return self._collection.delete(id=collection_id)


class Routes:

    def __init__(self, db_engine: DataProvider, app) -> None:
        self.db_engine = db_engine
        self.app = app
        self.mw = middleware.Middleware(self.db_engine)

    def init_api_routes(self) -> None:

        if self.app:
            for url_rule in self.get_api_routes():
                self.app.add_url_rule(
                    url_rule.rule,
                    endpoint=url_rule.endpoint,
                    view_func=url_rule.view_func,
                    methods=url_rule.methods,
                    defaults=url_rule.defaults
                )

    def init_website_routes(self):
        about_page = frontend.AboutPage()
        index_page = frontend.IndexPage()
        more_page = frontend.MoreMenuPage()
        new_collection_page = frontend.NewCollectionForm()

        static_web_routes = [
            Route("/", "page_index", index_page.render_page),
            Route("/about", "page_about", about_page.render_page),
            Route("/more", "page_more", more_page.render_page),
            Route("/collection/new", "form_new_collection",
                  new_collection_page.render_page),
            ]

        simple_pages = []

        entity_pages = [
            EntityPage(
                "Formats",
                "page_formats",
                routes=[
                    Route(
                        "/format",
                        "page_formats",
                        lambda: page_formats(self.mw)
                    ),
                ]),

            EntityPage(
                "Objects",
                "page_object",
                routes=[
                    Route(
                        "/object",
                        "page_object",
                        lambda: frontend.ObjectFrontend(
                            self.mw.data_provider).list()
                    ),
                    Route(
                        "/object/<int:object_id>",
                        "page_object_details",
                        lambda object_id: frontend.ObjectFrontend(
                            self.mw.data_provider).display_details(
                                object_id, show_bread_crumb=False)
                    ),
                ]),
            EntityPage(
                "Items",
                "page_item",
                routes=[
                    Route(
                        "/item",
                        "page_item",
                        lambda: frontend.ItemFrontend(
                            self.mw.data_provider).list()
                    ),
                    Route(
                        "/item/<string:item_id>",
                        "page_item_details",
                        lambda item_id: frontend.ItemFrontend(
                            self.mw.data_provider).display_details(
                                item_id, show_bread_crumb=False)
                    ),
                ]),
            EntityPage(
                "Collections",
                "page_collections",
                routes=[
                    Route(
                        "/collection",
                        "page_collections",
                        lambda: frontend.CollectionFrontend(
                            self.mw.data_provider).list()
                    ),
                    Route(
                        "/collection/<string:collection_id>",
                        "page_collection_details",
                        lambda collection_id: frontend.CollectionFrontend(
                            self.mw.data_provider).display_details(
                                collection_id)
                    ),
                ]),
        ]
        for simple_page in simple_pages:
            entity_pages.append(
                EntityPage(
                    simple_page.entity_title,
                    simple_page.entity_list_page_name,
                    routes=[
                        Route(
                            rule=simple_page.entity_rule,
                            method=simple_page.entity_list_page_name,
                            view_function=simple_page.list,
                        )
                    ]
                )
            )
        project_page = EntityPage(
            "Projects",
            "page_project",
            routes=[
                Route(
                    "/project",
                    "page_projects",
                    frontend.ProjectFrontend(self.mw.data_provider).list
                ),
                Route(
                    "/project/<int:project_id>",
                    "page_project_details",
                    lambda project_id: frontend.ProjectFrontend(
                        self.mw.data_provider).display_details(
                            project_id,
                            show_bread_crumb=True)
                ),
                Route(
                    "/project/<int:project_id>/object/<int:object_id>",
                    "page_project_object_details",
                    lambda project_id, object_id: frontend.ObjectFrontend(
                        self.mw.data_provider).display_details(
                            object_id, show_bread_crumb=True)
                ),
                Route(
                    "/project/<int:project_id>/object/<int:object_id>/item/<int:item_id>",  # noqa: E501 pylint: disable=C0301
                    "page_project_object_item_details",
                    lambda project_id, object_id, item_id:
                    frontend.ItemFrontend(
                        self.mw.data_provider).display_details(
                            item_id,
                            project_id=project_id,
                            object_id=object_id,
                            show_bread_crumb=True)
                ),
                Route(
                    "/project/create/",
                    "page_project_new",
                    frontend.ProjectFrontend(self.mw.data_provider).create
                )
            ]
        )

        if self.app:
            for rule in static_web_routes:
                self.app.add_url_rule(rule.rule, rule.method,
                                      rule.view_function)
            for rule in project_page.routes:
                self.app.add_url_rule(rule.rule,
                                      rule.method,
                                      rule.view_function)

            for entity in entity_pages:
                for rule in entity.routes:
                    _all_entities.add((entity.entity_type,
                                       entity.entity_list_page))

                    self.app.add_url_rule(rule.rule, rule.method,
                                          rule.view_function)

            for route, route_name, func in get_frontend_page_routes(
                    self.mw.data_provider):

                self.app.add_url_rule(route, route_name, func)

    def get_api_project_routes(self) -> Iterator[UrlRule]:
        project = middleware.ProjectMiddlwareEntity(self.db_engine)
        yield UrlRule(
            rule="/api/project/",
            endpoint="add_project",
            view_func=project.create,
            methods=['POST']
        )

        yield UrlRule(
            rule="/api/project/<string:project_id>/notes",
            endpoint="project_add_note",
            view_func=project.add_note,
            methods=["POST"]

        )

        yield UrlRule(
            rule="/api/project",
            endpoint="projects",
            view_func=lambda serialize=True: project.get(serialize)
        )

        yield UrlRule(
            rule="/api/project/<int:project_id>",
            endpoint="project",
            view_func=ProjectAPI.as_view("projects", project=project),
            methods=["GET", "PUT", "DELETE"]
        )

        yield UrlRule(
            rule="/api/project/<int:project_id>/object",
            endpoint="project_add_object",
            view_func=project.add_object,
            methods=["POST"]
        )

        yield UrlRule(
            rule="/api/project/<int:project_id>/object/<int:object_id>",
            endpoint="project_object",
            view_func=ProjectObjectAPI.as_view("project_objects",
                                               project=project),
            methods=["DELETE"]
        )

        yield UrlRule(
            "/api/project/<int:project_id>/notes/<int:note_id>",
            view_func=ProjectNotesAPI.as_view("project_notes",
                                              project=project),
            methods=["PUT", "DELETE"]
        )

    def get_api_object_routes(self) -> Iterator[UrlRule]:
        project_object = middleware.ObjectMiddlwareEntity(self.db_engine)

        yield UrlRule(
            rule="/api/object/<int:object_id>",
            view_func=ObjectApi.as_view("object",
                                        object_middleware=project_object),
            methods=[
                "GET",
                "DELETE",
                "PUT"
            ]
        )

        yield UrlRule(
            "/api/project/<int:project_id>/object/<int:object_id>/item",
            "project_object_add_item",
            lambda project_id, object_id: project_object.add_item(
                project_id=project_id, object_id=object_id),
            methods=["POST"]

        )

        yield UrlRule(
            "/api/project/<int:project_id>/object/<int:object_id>/notes",
            endpoint="project_object_add_note",
            view_func=project_object.add_note,
            methods=["POST"]
        )

        yield UrlRule(
            "/api/project/<int:project_id>/object/<int:object_id>/notes"
            "/<int:note_id>",
            view_func=ProjectObjectNotesAPI.as_view(
                "object_notes", project_object=project_object),
            methods=["PUT", "DELETE"]
        )

        yield UrlRule(
            rule="/api/object/",
            endpoint="add_object",
            view_func=project_object.create,
            methods=["POST"]
        )

        yield UrlRule(
            rule="/api/object/<int:id>-pbcore.xml",
            endpoint="object_pbcore",
            view_func=project_object.pbcore,
        )

        yield UrlRule(
            rule="/api/object",
            endpoint="objects",
            view_func=lambda serialize=True: project_object.get(serialize),
        )

        yield UrlRule(
            "/api/project/<int:project_id>/object/<int:object_id>/item"
            "/<int:item_id>",
            view_func=ObjectItemAPI.as_view(
                "object_item",
                parent=project_object),
            methods=[
                "DELETE"
            ]
        )

    def get_api_item_routes(self) -> Iterator[UrlRule]:

        item = middleware.ItemMiddlwareEntity(self.db_engine)

        yield UrlRule(
            rule="/api/project/<int:project_id>/object/<int:object_id>"
                 "/item/<int:item_id>/notes",
            endpoint="project_object_item_add_note",
            view_func=lambda project_id, object_id, item_id: item.add_note(
                item_id),
            methods=["POST"]
        )

        yield UrlRule(
            "/api/item/<int:item_id>",
            view_func=ItemAPI.as_view(
                "item",
                provider=self.db_engine),
            methods=[
                "GET",
                "PUT",
                "DELETE"
            ]
        )

        yield UrlRule(
            "/api/project/<int:project_id>/object/<int:object_id>/item/<int"
            ":item_id>/files",
            view_func=tyko.views.files.ItemFilesAPI.as_view(
                "item_files",
                provider=self.db_engine
            ),
            methods=["POST", "GET", "PUT", "DELETE"]
        )

        yield UrlRule(
            "/api/project/<int:project_id>/object/<int:object_id>/item"
            "/<int:item_id>/file",
            "project_object_item_add_file",
            item.add_file,
            methods=["POST"]
        )

        yield UrlRule(
            "/api/item/",
            endpoint="add_item",
            view_func=item.create,
            methods=["POST"]
        )

        yield UrlRule(
            "/api/item",
            endpoint="items",
            view_func=lambda serialize=True: item.get(serialize)
        )

        yield UrlRule(
            "/api/project/<int:project_id>/object/<int:object_id>/item"
            "/<int:item_id>/notes/<int:note_id>",
            view_func=ObjectItemNotesAPI.as_view(
                "item_notes",
                item=item),
            methods=["PUT", "DELETE"]
        )

    def get_api_file_routes(self):
        # TODO: add url rule for editing file annotation types
        yield UrlRule(
            "/api/file/<int:file_id>/annotations",
            view_func=tyko.views.files.FileAnnotationsAPI.as_view(
                "file_annotations",
                provider=self.db_engine
            ),
            methods=["GET", "POST", "PUT", "DELETE"]
        )

        yield UrlRule(
            "/api/file/annotation_types",
            view_func=tyko.views.files.FileAnnotationTypesAPI.as_view(
                "file_annotation_types",
                provider=self.db_engine
            ),
            methods=["GET", "POST", "DELETE"]
        )

        yield UrlRule(
            "/api/file/<int:file_id>/note",
            view_func=tyko.views.files.FileNotesAPI.as_view(
                "file_notes", provider=self.db_engine
            ),
            methods=["GET", "POST", "PUT", "DELETE"]
        )

    def get_api_notes_routes(self) -> Iterator[UrlRule]:
        notes = middleware.NotestMiddlwareEntity(self.db_engine)
        yield UrlRule(
            "/api/note/<int:note_id>",
            view_func=NotesAPI.as_view(
                "note",
                notes_middleware=notes),
            methods=["GET", "PUT", "DELETE"]
        )
        yield UrlRule(
            rule="/api/notes/",
            endpoint="add_note",
            view_func=notes.create,
            methods=["POST"]
        )

        yield UrlRule(
            rule="/api/notes",
            endpoint="notes",
            view_func=lambda serialize=True: notes.get(serialize),
        )

    def get_api_collection_routes(self) -> Iterator[UrlRule]:
        collection = middleware.CollectionMiddlwareEntity(self.db_engine)
        yield UrlRule(
            "/api/collection/<int:collection_id>",
            view_func=CollectionsAPI.as_view(
                "collection", collection=collection),
            methods=["GET", "PUT", "DELETE"]
        )

        yield UrlRule(
            rule="/api/collection/",
            endpoint="add_collection",
            view_func=collection.create,
            methods=["POST"]
        )

        yield UrlRule(
            rule="/api/collection",
            endpoint="collections",
            view_func=lambda serialize=True: collection.get(serialize)
        )

    def get_api_format_routes(self) -> Iterator[UrlRule]:
        yield UrlRule(
            rule="/api/format",
            endpoint="formats",
            view_func=self.mw.get_formats
        )
        yield UrlRule(
            rule="/api/format/<int:id>",
            endpoint="format_by_id",
            view_func=self.mw.get_formats_by_id
        )

    def get_api_routes(self) -> Iterator[UrlRule]:
        yield from self.get_api_project_routes()
        yield from self.get_api_object_routes()
        yield from self.get_api_item_routes()
        yield from self.get_api_file_routes()
        yield from self.get_api_notes_routes()
        yield from self.get_api_collection_routes()
        yield from self.get_api_format_routes()

        yield UrlRule(
            "/api",
            "list_routes",
            list_routes,
            methods=["get"],
            defaults={"app": self.app}
        )


def get_frontend_page_routes(data_prov) -> Iterator[Tuple[str, str, Callable]]:
    # TODO: add frontend routes to here

    file_details = frontend.FileDetailsFrontend(data_prov)
    yield (
        "/project/<int:project_id>/object/<int:object_id>/item/<int:item_id>/files/<int:file_id>",  # noqa: E501 pylint: disable=C0301
        "page_file_details",
        file_details.display_details)


def page_formats(middleware_source):
    formats = middleware_source.get_formats(serialize=False)
    return render_template(
        "formats.html",
        selected_menu_item="formats",
        formats=formats,
        entities=_all_entities
    )


def list_routes(app):
    results = []
    for rt in app.url_map.iter_rules():
        results.append({
            "endpoint": rt.endpoint,
            "methods": list(rt.methods),
            "route": str(rt)
        })
    return jsonify(results)
