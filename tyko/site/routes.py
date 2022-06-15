from flask import Blueprint, render_template
from tyko import frontend, data_provider, database, middleware
from . import views

site = Blueprint("site", __name__, template_folder='templates')


@site.route("/")
def page_index():
    index_page = frontend.IndexPage()
    return index_page.render_page()


@site.route("/about")
def page_about():
    about_page = frontend.AboutPage()
    return about_page.render_page()


@site.route("/project")
def page_projects():
    data_prov = data_provider.DataProvider(database.db.engine)
    project_frontend = frontend.ProjectFrontend(data_prov)
    return project_frontend.list()


@site.route("/more")
def page_more():
    more_page = frontend.MoreMenuPage()
    return more_page.render_page()


@site.route("/project/create/")
def page_project_new():
    data_prov = data_provider.DataProvider(database.db.engine)
    project_frontend = frontend.ProjectFrontend(data_prov)
    return project_frontend.create()


@site.route("/collection")
def page_collections():
    data_prov = data_provider.DataProvider(database.db.engine)
    collection_frontend = frontend.CollectionFrontend(data_prov)
    return collection_frontend.list()


@site.route("/formats")
def page_formats():
    data_prov = data_provider.DataProvider(database.db.engine)
    middleware_source = middleware.Middleware(data_prov)
    formats = middleware_source.get_formats(serialize=False)
    return render_template(
        "formats.html",
        selected_menu_item="formats",
        formats=formats
    )


@site.route("/collection/new")
def form_new_collection():
    new_collection_page = frontend.NewCollectionForm()
    return new_collection_page.render_page()


@site.route("/collection/<int:collection_id>")
def page_collection_details(collection_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    collection_frontend = frontend.CollectionFrontend(data_prov)
    return collection_frontend.display_details(collection_id=collection_id)


@site.route("/project/<int:project_id>")
def page_project_details(project_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    project_frontend = frontend.ProjectFrontend(data_prov)
    return project_frontend.display_details(project_id)


@site.route("/project/<int:project_id>/addObject", methods=['POST'])
def add_new_object(project_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    project_data_connector = data_provider.ProjectDataConnector(
        data_prov.db_session_maker)
    return views.ProjectNewObject.as_view(
        "add_new_object",
        data_connector=project_data_connector)(project_id=project_id)


@site.route("/project/<int:project_id>/addNote", methods=['POST'])
def add_project_note(project_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    project_data_connector = \
        data_provider.ProjectDataConnector(data_prov.db_session_maker)

    return views.ProjectNewNote.as_view(
            "add_project_note",
            data_connector=project_data_connector
        )(project_id)


@site.route("/project/<int:project_id>/updateNote", methods=['POST'])
def update_project_note(project_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    project_data_connector = data_provider.ProjectDataConnector(
        data_prov.db_session_maker)
    return \
        views.ProjectNoteUpdate.as_view(
            "update_project_note",
            data_connector=project_data_connector
        )(project_id=project_id)


@site.route("/project/<int:project_id>/object/<int:object_id>")
def page_project_object_details(project_id, object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    object_frontend = frontend.ObjectFrontend(data_prov)
    return object_frontend.display_details(object_id, show_bread_crumb=True)


@site.route("/object")
def page_object():
    data_prov = data_provider.DataProvider(database.db.engine)
    object_frontend = frontend.ObjectFrontend(data_prov)
    return object_frontend.list()


@site.route("/object/<int:object_id>")
def page_object_details(object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    object_frontend = frontend.ObjectFrontend(data_prov)
    return object_frontend.display_details(
        object_id, show_bread_crumb=False)


@site.route(
    "/project/<int:project_id>/object/<int:object_id>/item/<int:item_id>"
)
def page_project_object_item_details(project_id, object_id, item_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    item_pages = frontend.ItemFrontend(data_prov)
    return item_pages.display_details(
                item_id,
                project_id=project_id,
                object_id=object_id,
                show_bread_crumb=True)


@site.route(
    "/project/<int:project_id>/object/<int:object_id>/item/<int:item_id>/files"
    "/<int:file_id>"
)
def page_file_details(project_id, object_id, item_id, file_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    file_details = frontend.FileDetailsFrontend(data_prov)
    return file_details.display_details(
        project_id=project_id,
        object_id=object_id,
        item_id=item_id,
        file_id=file_id
    )


@site.route(
    "/project/<int:project_id>/object/<int:object_id>/updateNote",
    methods=['POST']
)
def update_object_note(project_id, object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    object_data_connector = data_provider.ObjectDataConnector(
        data_prov.db_session_maker
    )
    return views.ObjectUpdateNotes.as_view(
        "update_object_note",
        data_connector=object_data_connector
    )(project_id=project_id, object_id=object_id)


@site.route(
    "/project/<int:project_id>/object/<int:object_id>/addNote",
    methods=['POST']
)
def add_object_note(project_id, object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    object_data_connector = \
        data_provider.ObjectDataConnector(data_prov.db_session_maker)

    return views.ObjectNewNotes.as_view(
        "add_object_note",
        data_connector=object_data_connector
    )(project_id=project_id, object_id=object_id)


@site.route(
    "/project/<int:project_id>/object/<int:object_id>/newItem",
    methods=['POST']
)
def object_new_item(project_id, object_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    object_data_connector = \
        data_provider.ObjectDataConnector(data_prov.db_session_maker)

    return views.NewItem.as_view(
        "object_new_item",
        data_connector=object_data_connector
    )(project_id=project_id, object_id=object_id)


@site.route(
    "/project/<int:project_id>/object/<int:object_id>"
    "/item/<int:item_id>/addFile",
    methods=['POST']
)
def item_new_file(project_id, object_id, item_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    item_data_connector = \
        data_provider.ItemDataConnector(data_prov.db_session_maker)

    return views.ObjectItemNewFile.as_view(
        "item_new_file",
        data_connector=item_data_connector
    )(project_id=project_id, object_id=object_id, item_id=item_id)


@site.route("/project/<int:project_id>/object/<int:object_id>/item/"
            "<int:item_id>/addNote",
            methods=['POST'])
def add_item_note(project_id, object_id, item_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    item_data_connector = \
        data_provider.ItemDataConnector(data_prov.db_session_maker)

    return views.ObjectItemNewNotes.as_view(
        "add_item_note",
        data_connector=item_data_connector
    )(project_id=project_id, object_id=object_id, item_id=item_id)


@site.route(
    "/project/<int:project_id>/object/<int:object_id>/item/<int:item_id>"
    "/updateNote",
    methods=['POST']
)
def update_item_note(project_id, object_id, item_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    item_data_connector = \
        data_provider.ItemDataConnector(data_prov.db_session_maker)

    return views.ObjectItemNotes.as_view(
        "update_item_note",
        data_connector=item_data_connector
    )(project_id=project_id, object_id=object_id, item_id=item_id)


@site.route("/item")
def page_item():
    data_prov = data_provider.DataProvider(database.db.engine)
    item_pages = frontend.ItemFrontend(data_prov)
    return item_pages.list()


@site.route('/item/<int:item_id>')
def page_item_details(item_id):
    data_prov = data_provider.DataProvider(database.db.engine)
    item_pages = frontend.ItemFrontend(data_prov)
    return item_pages.display_details(item_id, show_bread_crumb=False)
