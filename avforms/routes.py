import sys

import sqlalchemy.exc
from flask import Flask, jsonify, render_template
from avforms import middleware

the_app = Flask(__name__)


class Routes:

    def __init__(self, db_engine, app) -> object:
        self.db_engine = db_engine
        self.app = app

    def is_valid(self):
        try:
            middleware.DataProvider(self.db_engine)
        except sqlalchemy.exc.OperationalError as e:
            print(e, file=sys.stderr)
            return False
        return True

    def init_api_routes(self):
        init_api_routes(self.app)

    def init_website_routes(self):
        init_website_routes(self.app)


def init_api_routes(app):
    if app:
        app.add_url_rule("/api/projects", "projects", middleware.get_projects)

        app.add_url_rule("/api/projects/<string:id>", "project_by_id",
                         middleware.get_project_by_id, methods=["GET"]
                         )
        app.add_url_rule("/api/projects/", "add_project",
                         middleware.add_project,
                         methods=["POST"])

        app.add_url_rule("/api/collections/<string:id>", "collection_by_id",
                         middleware.collection_by_id,
                         methods=["GET"])

        app.add_url_rule("/api/collections", "collection",
                         middleware.get_collections,
                         methods=["GET"]
                         )

        app.add_url_rule("/api/collections/", "add_collection",
                         middleware.add_collection,
                         methods=["POST"])

        app.add_url_rule("/api/formats", "formats", middleware.get_formats)
        app.add_url_rule("/api", "list_routes", list_routes,
                         methods=["get"], defaults={"app": app})


def init_website_routes(app):
    if app:
        app.add_url_rule("/", "page_index", page_index)
        app.add_url_rule("/about", "page_about", page_about)
        app.add_url_rule("/collections", "page_collections", page_collections)
        app.add_url_rule("/projects", "page_projects", page_projects)
        app.add_url_rule("/formats", "page_formats", page_formats)


def page_formats():
    formats = middleware.get_formats(serialize=False)
    return render_template("formats.html",
                           selected_menu_item="formats",
                           formats=formats)


def page_index():
    return render_template("index.html", selected_menu_item="index")


def page_about():
    return render_template("about.html", selected_menu_item="about")


def page_collections():
    collections = middleware.get_collections(serialize=False)
    return render_template("collections.html",
                           selected_menu_item="collection",
                           collections=collections)


def page_projects():

    projects = middleware.get_projects(serialize=False)
    return render_template("projects.html",
                           selected_menu_item="projects",
                           projects=projects)


def list_routes(app):
    results = []
    for rt in app.url_map.iter_rules():
        results.append({
            "methods": list(rt.methods),
            "route": str(rt)
        })
    return jsonify(results)
