from typing import List, Iterable, TypedDict

from flask import Blueprint, current_app, jsonify
from werkzeug.routing import Rule

from tyko import database, data_provider, middleware, utils

from tyko.views.cassette_tape import CassetteTapeThicknessAPI, \
    CassetteTapeFormatTypesAPI, CassetteTapeTapeTypesAPI

from tyko.views.files import ItemFilesAPI, FileNotesAPI, \
    FileAnnotationTypesAPI, \
    FileAnnotationsAPI

from tyko.views.object_item import ItemAPI, ObjectItemAPI, ObjectItemNotesAPI
from tyko.views.project import ProjectAPI, ProjectNotesAPI
from tyko.views.project_object import ProjectObjectAPI, ObjectApi, \
    ProjectObjectNotesAPI

from . import views

FORMAT_ENUM_ROUTES = [
    (
        "/formats/video_cassette/generations",
        'video_cassette_generations',
        "VideoCassetteGenerations"
    ),
    (
        "/formats/video_cassette/cassette_type",
        'video_cassette_cassette_type',
        "VideoCassetteType"
    ),
    (
        "/formats/optical/optical_types",
        'optical_optical_types',
        "OpticalType"
    ),
    (
        "/formats/open_reel/sub_types",
        'open_reel_sub_type',
        "OpenReelSubType"
    ),
    (
        "/formats/open_reel/reel_width",
        'open_reel_reel_width',
        "OpenReelReelWidth"
    ),
    (
        "/formats/open_reel/reel_diameter",
        'open_reel_reel_diameter',
        "OpenReelReelDiameter"
    ),
    (
        "/formats/open_reel/reel_thickness",
        'open_reel_reel_thickness',
        "OpenReelReelThickness"
    ),
    (
        "/formats/open_reel/base",
        'open_reel_base',
        "OpenReelBase"
    ),
    (
        "/formats/open_reel/reel_speed",
        'open_reel_reel_speed',
        "OpenReelSpeed"
    ),
    (
        "/formats/open_reel/track_configuration",
        'open_reel_track_configuration',
        "OpenReelTrackConfiguration"
    ),
    (
        "/formats/open_reel/generation",
        'open_reel_generation',
        "OpenReelGeneration"
    ),
    (
        "/formats/open_reel/wind",
        'open_reel_wind',
        "OpenReelReelWind"
    ),
    (
        "/formats/grooved_disc/disc_diameter",
        'grooved_disc_disc_diameter',
        "GroovedDiscDiscDiameter"
    ),
    (
        "/formats/grooved_disc/disc_material",
        'grooved_disc_disc_material',
        "GroovedDiscDiscMaterial"
    ),
    (
        "/formats/grooved_disc/playback_direction",
        'grooved_disc_playback_direction',
        "GroovedDiscPlaybackDirection"
    ),
    (
        "/formats/grooved_disc/playback_speed",
        'grooved_disc_playback_speed',
        "GroovedDiscPlaybackSpeed"
    ),
    (
        "/formats/grooved_disc/disc_base",
        'grooved_disc_disc_base',
        "GroovedDiscDiscBase"
    ),
    (
        "/formats/film/film_speed",
        'film_film_speed',
        "FilmFilmSpeed"
    ),
    (
        "/formats/film/film_gauge",
        'film_film_gauge',
        "FilmFilmGauge"
    ),
    (
        "/formats/film/film_base",
        'film_film_base',
        "FilmFilmBase"
    ),
    (
        "/formats/film/film_emulsion",
        'film_emulsion',
        "FilmEmulsion"
    ),
    (
        "/formats/film/soundtrack",
        'film_soundtrack',
        "FilmSoundtrack"
    ),
    (
        "/formats/film/color",
        'film_color',
        "FilmColor"
    ),
    (
        "/formats/film/image_type",
        'film_image_type',
        "FilmImageType"
    ),
    (
        "/formats/film/wind",
        'film_wind',
        "FilmWind"
    ),
    (
        "/formats/audio_cassette/subtype",
        'audio_cassette_subtype',
        "AudioCassetteSubtype"
    ),
    (
        "/formats/audio_cassette/generation",
        'audio_cassette_generation',
        "AudioCassetteGeneration"
    ),
]

api = Blueprint("api", __name__, url_prefix="/api")


@api.route("/format")
def formats():
    data_prov = data_provider.DataProvider(database.db.engine)
    return middleware.Middleware(data_prov).get_formats()


@api.route("/collection")
def collections():
    data_prov = data_provider.DataProvider(database.db.engine)
    collection_middleware = middleware.CollectionMiddlewareEntity(data_prov)
    return collection_middleware.get(True)


@api.route("/collection", methods=["POST"])
def add_collection():
    data_prov = data_provider.DataProvider(database.db.engine)
    collection_middleware = middleware.CollectionMiddlewareEntity(data_prov)
    return collection_middleware.create()


@api.route("/collection/<int:collection_id>", methods=["GET", "PUT", "DELETE"])
def collection(collection_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    collection_middleware = middleware.CollectionMiddlewareEntity(data_prov)
    return views.CollectionsAPI.as_view(
        "collection",
        collection=collection_middleware
    )(collection_id)


@api.route("/project")
def projects():
    data_prov = data_provider.DataProvider(database.db.engine)
    project_middleware = middleware.ProjectMiddlewareEntity(data_prov)
    return project_middleware.get(serialize=True)


@api.route("/project", methods=['POST'])
def add_project():
    data_prov = data_provider.DataProvider(database.db.engine)
    project_middleware = middleware.ProjectMiddlewareEntity(data_prov)
    return project_middleware.create()


@api.route("/project/<int:project_id>", methods=["GET", "PUT", "DELETE"])
def project(project_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    project_middleware = middleware.ProjectMiddlewareEntity(data_prov)
    return ProjectAPI.as_view(
        "projects",
        project=project_middleware
    )(project_id)


@api.route("/project/<string:project_id>/notes", methods=["POST"])
def project_add_note(project_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    project_middleware = middleware.ProjectMiddlewareEntity(data_prov)
    return project_middleware.add_note(project_id)


@api.route("/project/<int:project_id>/object", methods=["POST"])
def project_add_object(project_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    project_middleware = middleware.ProjectMiddlewareEntity(data_prov)
    return project_middleware.add_object(project_id)


@api.route(
    "/project/<int:project_id>/object/<int:object_id>",
    methods=["GET", "DELETE"]
)
def project_object(project_id, object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    project_middleware = middleware.ProjectMiddlewareEntity(data_prov)
    return ProjectObjectAPI.as_view(
        "project_objects",
        project=project_middleware
    )(project_id=project_id, object_id=object_id)


@api.route(
    "/project/<int:project_id>/notes/<int:note_id>",
    methods=["GET", "PUT", "DELETE"]
)
def project_notes(project_id, note_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    project_middleware = middleware.ProjectMiddlewareEntity(data_prov)
    return ProjectNotesAPI.as_view(
        "project_notes",
        project=project_middleware
    )(project_id, note_id)


@api.route("/item/<int:item_id>", methods=["GET", "PUT", "DELETE"])
def item(item_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    return ItemAPI.as_view("item", provider=data_prov)(item_id)


@api.route(
    "/project/<int:project_id>/object/<int:object_id>/notes",
    methods=["POST"]
)
def project_object_add_note(project_id, object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    object_middleware = middleware.ObjectMiddlewareEntity(data_prov)
    return object_middleware.add_note(project_id, object_id)


@api.route(
    "/object/<int:object_id>",
    endpoint="object",
    methods=[
        "GET",
        "DELETE",
        "PUT",
    ])
def modify_project_object(object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    object_middleware = middleware.ObjectMiddlewareEntity(data_prov)
    return ObjectApi.as_view(
        "object", object_middleware=object_middleware
    )(object_id)


@api.route(
    "/project/<int:project_id>/object/<int:object_id>/notes/<int:note_id>",
    methods=["GET", "PUT", "DELETE"])
def object_notes(project_id, object_id, note_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    object_middleware = middleware.ObjectMiddlewareEntity(data_prov)
    return ProjectObjectNotesAPI.as_view(
        "object_notes",
        project_object=object_middleware
    )(project_id, object_id, note_id)


@api.route("/object", methods=["POST"])
def add_object():
    data_prov = data_provider.DataProvider(database.db.engine)
    project_object_middleware = middleware.ObjectMiddlewareEntity(data_prov)
    return project_object_middleware.create()


@api.route("/notes/", methods=["POST"])
def add_note():
    data_prov = data_provider.DataProvider(database.db.engine)
    notes_middleware = middleware.NotestMiddlewareEntity(data_prov)
    return notes_middleware.create()


@api.route("/notes")
def notes():
    data_prov = data_provider.DataProvider(database.db.engine)
    notes_middleware = middleware.NotestMiddlewareEntity(data_prov)
    return notes_middleware.get(serialize=True)


@api.route("/note_types")
def note_types():
    data_prov = data_provider.DataProvider(database.db.engine)
    notes_middleware = middleware.NotestMiddlewareEntity(data_prov)
    return notes_middleware.list_types()


@api.route("/note/<int:note_id>", methods=["GET", "PUT", "DELETE"])
def note(note_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    notes_middleware = middleware.NotestMiddlewareEntity(data_prov)
    return views.NotesAPI.as_view(
        "note",
        notes_middleware=notes_middleware
    )(note_id=note_id)


@api.route(
    "/project/<int:project_id>/object/<int:object_id>/item",
    methods=["GET",
             "DELETE",
             "POST",
             "PUT"
             ])
def object_item(project_id, object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    return ObjectItemAPI.as_view(
        "object_item",
        provider=data_prov
    )(project_id=project_id, object_id=object_id)


@api.route(
    "/project/<int:project_id>/object/<int:object_id>/item/<int:item_id>"
    "/files",
    methods=["POST", "GET", "PUT", "DELETE"]
)
def item_files(project_id, object_id, item_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    return ItemFilesAPI.as_view(
        "item_files",
        provider=data_prov
    )(project_id=project_id, object_id=object_id, item_id=item_id)


@api.route(
    "/file/<int:file_id>/note",
    methods=["GET", "POST", "PUT", "DELETE"]
)
def file_notes(file_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    return FileNotesAPI.as_view(
        "file_notes", provider=data_prov
    )(file_id)


@api.route("/file/annotation_types", methods=["GET", "POST", "DELETE"])
def file_annotation_types():
    data_prov = data_provider.DataProvider(database.db.engine)
    return FileAnnotationTypesAPI.as_view(
        "file_annotation_types",
        provider=data_prov
    )()


@api.route(
    "/file/<int:file_id>/annotations",
    methods=["GET", "POST", "PUT", "DELETE"]
)
def file_annotations(file_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    return FileAnnotationsAPI.as_view(
        "file_annotations",
        provider=data_prov
    )(file_id)


@api.route(
    "/formats/cassette_tape/cassette_tape_tape_thickness",
    methods=["GET", "POST", "DELETE", "PUT"]
)
def cassette_tape_tape_thickness():
    data_prov = data_provider.DataProvider(database.db.engine)
    return CassetteTapeThicknessAPI.as_view(
        "cassette_tape_tape_thickness",
        provider=data_prov)()


@api.route(
    "/formats/cassette_tape/cassette_tape_format_types",
    methods=["GET", "POST", "DELETE", "PUT"]
)
def cassette_tape_format_types():
    data_prov = data_provider.DataProvider(database.db.engine)
    return CassetteTapeFormatTypesAPI.as_view(
        "cassette_tape_format_types",
        provider=data_prov
    )()


@api.route(
    "/formats/cassette_tape/cassette_tape_tape_types",
    methods=["GET", "POST", "DELETE", "PUT"]
)
def cassette_tape_tape_types():
    data_prov = data_provider.DataProvider(database.db.engine)
    return CassetteTapeTapeTypesAPI.as_view(
        "cassette_tape_tape_types",
        provider=data_prov
    )()


@api.route("/item")
def items():
    data_prov = data_provider.DataProvider(database.db.engine)
    item_middleware = middleware.ItemMiddlewareEntity(data_prov)
    return item_middleware.get(True)


@api.route("/item", methods=["POST"])
def add_item():
    data_prov = data_provider.DataProvider(database.db.engine)
    item_middleware = middleware.ItemMiddlewareEntity(data_prov)
    return item_middleware.create()


@api.route(
    "project/<int:project_id>/object/<int:object_id>/item/<int:item_id>/notes",
    methods=["POST"]
)
def project_object_item_add_note(project_id, object_id, item_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    item_middleware = middleware.ItemMiddlewareEntity(data_prov)
    return item_middleware.add_note(item_id)


@api.route(
    "/project/<int:project_id>/object/<int:object_id>/item/<int:item_id>/file",
    methods=["POST"]
)
def project_object_item_add_file(project_id, object_id, item_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    item_middleware = middleware.ItemMiddlewareEntity(data_prov)
    return item_middleware.add_file(project_id, object_id, item_id)


@api.route(
    "/project/<int:project_id>/object/<int:object_id>/item/<int:item_id>/"
    "notes/<int:note_id>",
    methods=["GET", "PUT", "DELETE"]
)
def item_notes(project_id, object_id, item_id, note_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    item_middleware = middleware.ItemMiddlewareEntity(data_prov)
    return ObjectItemNotesAPI.as_view(
        "item_notes",
        item=item_middleware
    )(
        project_id=project_id,
        object_id=object_id,
        item_id=item_id,
        note_id=note_id
    )


@api.route("/object")
def objects():
    data_prov = data_provider.DataProvider(database.db.engine)
    object_middleware = middleware.ObjectMiddlewareEntity(data_prov)
    return object_middleware.get(True)


@api.route("/object/<int:object_id>-pbcore.xml")
def object_pbcore(object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    object_middleware = middleware.ObjectMiddlewareEntity(data_prov)
    return object_middleware.pbcore(id=object_id)


@api.route("/")
def list_routes():
    result_type = TypedDict(
        'result_type', {
            'endpoint': str,
            'methods': List[str],
            'route': str
        }
    )
    rules: Iterable[Rule] = [
        rule for rule in current_app.url_map.iter_rules()
        if rule.rule.startswith(api.url_prefix)

    ]

    results: List[result_type] = [
        {
            "route": str(rt),
            "methods": list(rt.methods),
            "endpoint": rt.endpoint,

        } for rt in rules
    ]
    return jsonify(sorted(results, key=lambda x: x["route"]))


@api.route("/format/<int:format_id>")
def format_by_id(format_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    return middleware.Middleware(data_prov).get_formats_by_id(id=format_id)


@api.route('/application_data')
def get_application_data():

    server_color = current_app.config.get('TYKO_SERVER_COLOR')
    return {
        "version": utils.get_version(),
        "server_color": server_color
    }


def add_enum_routes():
    for rule, end_point, class_name in FORMAT_ENUM_ROUTES:
        api.add_url_rule(
            rule,
            endpoint=end_point,
            view_func=lambda class_name_=class_name: middleware.get_enums(
                data_provider.DataProvider(
                    database.db.engine
                ).db_session_maker,
                class_name_
            )
        )


add_enum_routes()
