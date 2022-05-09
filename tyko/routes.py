# pylint: disable=invalid-name, not-an-iterable

from dataclasses import dataclass, field
from typing import Any, List, Iterator, Tuple, Callable, Optional, Union
from flask import jsonify, render_template, views, request

import tyko.views.files
from . import middleware
from .data_provider import DataProvider, ItemDataConnector, \
    ObjectDataConnector, \
    ProjectDataConnector
from . import frontend
from .views.object_item import ObjectItemNotesAPI, ObjectItemAPI
from .views.object_item import ItemAPI
from .views.project import ProjectNotesAPI, ProjectAPI
from .views.project_object import ProjectObjectAPI, ObjectApi, \
    ProjectObjectNotesAPI
from .views import cassette_tape


"""
FORMAT_ENUM_ROUTES:
For setting formats
    URI
    Endpoint
    view_func
"""
FORMAT_ENUM_ROUTES = [
    (
        "/api/formats/video_cassette/generations",
        'video_cassette_generations',
        "VideoCassetteGenerations"
    ),
    (
        "/api/formats/video_cassette/cassette_type",
        'video_cassette_cassette_type',
        "VideoCassetteType"
    ),
    (
        "/api/formats/optical/optical_types",
        'optical_optical_types',
        "OpticalType"
    ),
    (
        "/api/formats/open_reel/sub_types",
        'open_reel_sub_type',
        "OpenReelSubType"
    ),
    (
        "/api/formats/open_reel/reel_width",
        'open_reel_reel_width',
        "OpenReelReelWidth"
    ),
    (
        "/api/formats/open_reel/reel_diameter",
        'open_reel_reel_diameter',
        "OpenReelReelDiameter"
    ),
    (
        "/api/formats/open_reel/reel_thickness",
        'open_reel_reel_thickness',
        "OpenReelReelThickness"
    ),
    (
        "/api/formats/open_reel/base",
        'open_reel_base',
        "OpenReelBase"
    ),
    (
        "/api/formats/open_reel/reel_speed",
        'open_reel_reel_speed',
        "OpenReelSpeed"
    ),
    (
        "/api/formats/open_reel/track_configuration",
        'open_reel_track_configuration',
        "OpenReelTrackConfiguration"
    ),
    (
        "/api/formats/open_reel/generation",
        'open_reel_generation',
        "OpenReelGeneration"
    ),
    (
        "/api/formats/open_reel/wind",
        'open_reel_wind',
        "OpenReelReelWind"
    ),
    (
        "/api/formats/grooved_disc/disc_diameter",
        'grooved_disc_disc_diameter',
        "GroovedDiscDiscDiameter"
    ),
    (
        "/api/formats/grooved_disc/disc_material",
        'grooved_disc_disc_material',
        "GroovedDiscDiscMaterial"
    ),
    (
        "/api/formats/grooved_disc/playback_direction",
        'grooved_disc_playback_direction',
        "GroovedDiscPlaybackDirection"
    ),
    (
        "/api/formats/grooved_disc/playback_speed",
        'grooved_disc_playback_speed',
        "GroovedDiscPlaybackSpeed"
    ),
    (
        "/api/formats/grooved_disc/disc_base",
        'grooved_disc_disc_base',
        "GroovedDiscDiscBase"
    )
]


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


class NewItem(views.MethodView):
    def __init__(self, data_connector: ObjectDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, project_id, object_id):
        data = request.form
        return jsonify(self._data_connector.add_item(object_id, data))


class ObjectItemNewNotes(views.MethodView):
    def __init__(self, data_connector: ItemDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs):
        item_id = kwargs['item_id']
        data = request.form
        return jsonify(
            self._data_connector.add_note(
                item_id=item_id,
                note_text=data['text'],
                note_type_id=data['note_type_id']
            )
        )


class ObjectUpdateNotes(views.MethodView):
    def __init__(self, data_connector: ObjectDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs):
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

    def post(self, *args, **kwargs):
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

    def post(self, *args, **kwargs):
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

    def post(self, *args, **kwargs):
        project_id = kwargs['project_id']
        data = request.form
        print(data)
        return jsonify(self._data_connector.add_object(project_id, data))


class ObjectNewNotes(views.MethodView):
    def __init__(self, data_connector: ObjectDataConnector) -> None:
        self._data_connector = data_connector

    def post(self, *args, **kwargs):
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

    def post(self, project_id, object_id, item_id):
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

    def post(self, *args, **kwargs):
        data = request.form
        note_id = int(data['noteId'])
        item_id = kwargs['item_id']

        return jsonify(
            self._data_connector.update_note(item_id, note_id, data)
        )


class Routes:

    def __init__(self, db_engine: DataProvider, app) -> None:
        self.db_engine = db_engine
        self.app = app
        self.mw = middleware.Middleware(self.db_engine)

    def init_api_routes(self) -> None:

        if self.app:
            item_data_connector = ItemDataConnector(
                self.db_engine.db_session_maker
            )

            self.app.add_url_rule(
                rule="/project/<int:project_id>/object/<int:object_id>/"
                     "item/<int:item_id>/addFile",
                view_func=ObjectItemNewFile.as_view(
                    "item_new_file",
                    data_connector=item_data_connector
                ),
                methods=['POST']
            )

            self.app.add_url_rule(
                    rule="/project/<int:project_id>/object/<int:object_id>/"
                         "item/<int:item_id>/updateNote",
                    view_func=ObjectItemNotes.as_view(
                        "update_item_note",
                        data_connector=item_data_connector
                    ),
                    methods=['POST']
            )

            self.app.add_url_rule(
                rule="/project/<int:project_id>/object/<int:object_id>/"
                     "item/<int:item_id>/addNote",
                view_func=ObjectItemNewNotes.as_view(
                    "add_item_note",
                    data_connector=item_data_connector
                ),
                methods=['POST']
            )

            object_data_connector = ObjectDataConnector(
                self.db_engine.db_session_maker
            )

            self.app.add_url_rule(
                "/project/<int:project_id>/object/<int:object_id>/addNote",
                view_func=ObjectNewNotes.as_view(
                    "add_object_note",
                    data_connector=object_data_connector
                ),
                methods=['POST']
            )

            self.app.add_url_rule(
                rule="/project/<int:project_id>/object/<int:object_id>/"
                     "updateNote",
                view_func=ObjectUpdateNotes.as_view(
                    "update_object_note",
                    data_connector=object_data_connector
                ),
                methods=['POST']
            )

            project_data_connector = ProjectDataConnector(
                self.db_engine.db_session_maker)

            self.app.add_url_rule(
                rule="/project/<int:project_id>/addNote",
                view_func=ProjectNewNote.as_view(
                    "add_project_note",
                    data_connector=project_data_connector
                ),
                methods=['POST']
            )

            self.app.add_url_rule(
                rule="/project/<int:project_id>/addObject",
                view_func=ProjectNewObject.as_view(
                    "add_new_object",
                    data_connector=project_data_connector
                ),
                methods=['POST']
            )

            self.app.add_url_rule(
                rule="/project/<int:project_id>/updateNote",
                view_func=ProjectNoteUpdate.as_view(
                    "update_project_note",
                    data_connector=project_data_connector
                ),
                methods=['POST']
            )
            self.app.add_url_rule(
                "/project/<int:project_id>/object/<int:object_id>/newItem",
                view_func=NewItem.as_view(
                    "object_new_item",
                    data_connector=object_data_connector
                ),
                methods=['POST']
            )

            self.add_enum_routes(self.db_engine.db_session_maker)

            for url_rule in self.get_api_routes():
                self.app.logger.debug(f"Loading rule {url_rule.rule}")
                self.app.add_url_rule(
                    url_rule.rule,
                    endpoint=url_rule.endpoint,
                    view_func=url_rule.view_func,
                    methods=url_rule.methods,
                    defaults=url_rule.defaults
                )

    def add_enum_routes(self, db_session_maker):
        for route in FORMAT_ENUM_ROUTES:
            self.app.add_url_rule(
                route[0],
                endpoint=route[1],
                view_func=lambda class_name=route[2]: middleware.get_enums(
                    db_session_maker,
                    class_name
                )
            )

    def _page_routes(self, data_prov) -> Iterator[Tuple[str, str, Callable]]:
        file_details = frontend.FileDetailsFrontend(data_prov)
        yield (
            "/project/<int:project_id>/object/<int:object_id>/item"
            "/<int:item_id>/files/<int:file_id>",
            "page_file_details",
            file_details.display_details)

        yield (
            "/format",
            "page_formats",
            lambda: page_formats(self.mw)
        )

        index_page = frontend.IndexPage()
        yield (
            "/",
            "page_index",
            index_page.render_page
        )

        about_page = frontend.AboutPage()
        yield (
            "/about",
            "page_about",
            about_page.render_page
        )

        more_page = frontend.MoreMenuPage()
        yield (
            "/more",
            "page_more",
            more_page.render_page
        )

        new_collection_page = frontend.NewCollectionForm()
        yield (
            "/collection/new",
            "form_new_collection",
            new_collection_page.render_page
        )

        yield from self._project_pages(data_prov)
        yield from self._collections_pages(data_prov)
        yield from self._object_pages(data_prov)
        yield from self._item_pages(data_prov)

    @staticmethod
    def _collections_pages(data_prov):
        collection_frontent = frontend.CollectionFrontend(data_prov)

        yield (
            "/collection",
            "page_collections",
            collection_frontent.list
        )

        yield (
            "/collection/<string:collection_id>",
            "page_collection_details",
            collection_frontent.display_details
        )

    @staticmethod
    def _project_pages(data_prov):
        project_frontend = frontend.ProjectFrontend(data_prov)

        yield (
            "/project/create/",
            "page_project_new",
            project_frontend.create
        )

        yield (
            "/project",
            "page_projects",
            project_frontend.list
        )

        yield (
            "/project/<int:project_id>",
            "page_project_details",
            lambda project_id: project_frontend.display_details(
                project_id,
                show_bread_crumb=True)
        )

    def init_website_routes(self):
        if self.app:
            for rule, endpoint, func in \
                    self._page_routes(self.mw.data_provider):
                self.app.logger.debug(f"Loading rule {rule}")
                self.app.add_url_rule(rule, endpoint, func)

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
            methods=["GET", "DELETE"]
        )

        yield UrlRule(
            "/api/project/<int:project_id>/notes/<int:note_id>",
            view_func=ProjectNotesAPI.as_view("project_notes",
                                              project=project),
            methods=["GET", "PUT", "DELETE"]
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
                "PUT",
            ]
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
            methods=["GET", "PUT", "DELETE"]
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

    def get_api_item_routes(self) -> Iterator[UrlRule]:

        item = middleware.ItemMiddlwareEntity(self.db_engine)
        yield UrlRule(
            "/api/project/<int:project_id>/object/<int:object_id>/item",
            view_func=ObjectItemAPI.as_view(
                "object_item",
                provider=self.db_engine
            ),
            methods=[
                "GET",
                "DELETE",
                "POST",
                "PUT"
            ]
        )
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
            methods=["GET", "PUT", "DELETE"]
        )

        yield UrlRule(
            "/api/formats/cassette_tape/cassette_tape_tape_types",
            view_func=cassette_tape.CassetteTapeTapeTypesAPI.as_view(
                "cassette_tape_tape_types",
                provider=self.db_engine
            ),
            methods=["GET", "POST", "DELETE", "PUT"]
        )
        yield UrlRule(
            "/api/formats/cassette_tape/cassette_tape_format_types",
            view_func=cassette_tape.CassetteTapeFormatTypesAPI.as_view(
                "cassette_tape_format_types",
                provider=self.db_engine
            ),
            methods=["GET", "POST", "DELETE", "PUT"]
        )
        yield UrlRule(
            "/api/formats/cassette_tape/cassette_tape_tape_thickness",
            view_func=cassette_tape.CassetteTapeThicknessAPI.as_view(
                "cassette_tape_tape_thickness",
                provider=self.db_engine
            ),
            methods=["GET", "POST", "DELETE", "PUT"]
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

        yield UrlRule(
            "/api/note_types",
            view_func=notes.list_types,
            endpoint="note_types"
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

    @staticmethod
    def _object_pages(data_prov):
        object_frontend = frontend.ObjectFrontend(data_prov)
        yield (
            "/project/<int:project_id>/object/<int:object_id>",
            "page_project_object_details",
            lambda project_id, object_id: object_frontend.display_details(
                object_id,
                show_bread_crumb=True)
        )
        yield (
            "/object/<int:object_id>",
            "page_object_details",
            lambda object_id: object_frontend.display_details(
                object_id, show_bread_crumb=False)
        )

        yield (
            "/object",
            "page_object",
            object_frontend.list
        )

    @staticmethod
    def _item_pages(data_prov):
        item_pages = frontend.ItemFrontend(data_prov)
        yield (
            "/item",
            "page_item",
            item_pages.list
        )

        yield (
            "/item/<string:item_id>",
            "page_item_details",
            lambda item_id: item_pages.display_details(item_id,
                                                       show_bread_crumb=False)
        )
        yield (
            "/project/<int:project_id>/object/<int:object_id>/item"
            "/<int:item_id>",
            "page_project_object_item_details",
            lambda project_id, object_id, item_id:
            item_pages.display_details(
                item_id,
                project_id=project_id,
                object_id=object_id,
                show_bread_crumb=True)
        )


def page_formats(middleware_source):
    formats = middleware_source.get_formats(serialize=False)
    return render_template(
        "formats.html",
        selected_menu_item="formats",
        formats=formats
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
