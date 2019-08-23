from flask import Flask, jsonify, render_template
import avforms
from avforms.data_provider import DataProvider
from dataclasses import dataclass
the_app = Flask(__name__)
from typing import Any


@dataclass
class Route:
    rule: str
    method: str
    viewFunction: Any


@dataclass
class FormField:
    form_type: str
    form_id: str
    form_user_text: str
    required: bool

class Routes:

    def __init__(self, db_engine: DataProvider, app) -> None:
        self.db_engine = db_engine
        self.app = app
        mw = avforms.Middleware(self.db_engine)
        self.wr = WebsiteRoutes(mw)
        self.ar = APIRoutes(mw)

    def init_api_routes(self) -> None:

        if self.app:
            # ###### projects
            self.app.add_url_rule(
                "/api/project",
                "projects",
                self.ar.get_projects
            )

            self.app.add_url_rule(
                "/api/project/<string:id>",
                "project_by_id",
                self.ar.get_project_by_id,
                methods=["GET"]
            )

            self.app.add_url_rule(
                "/api/project/",
                "add_project",
                self.ar.add_project,
                methods=["POST"]
            )

            self.app.add_url_rule(
                "/api/project/<string:id>",
                "update_project",
                self.ar.update_project,
                methods=["PUT"]
            )
            self.app.add_url_rule(
                "/api/project/<string:id>",
                "delete_project",
                self.ar.delete_project,
                methods=["DELETE"]
            )

            # ###### collections
            self.app.add_url_rule(
                "/api/collection/<string:id>",
                "collection_by_id",
                self.ar.collection_by_id,
                methods=["GET"]
            )

            self.app.add_url_rule(
                "/api/collection",
                "collection",
                self.ar.get_collections,
                methods=["GET"]
            )

            self.app.add_url_rule(
                "/api/collection/",
                "add_collection",
                self.ar.add_collection,
                methods=["POST"]
            )

            # ###### Formats
            self.app.add_url_rule(
                "/api/format",
                "formats",
                self.ar.get_formats
            )

            # ##############
            self.app.add_url_rule(
                "/api",
                "list_routes",
                list_routes,
                methods=["get"],
                defaults={"app": self.app}
            )

    def init_website_routes(self):
        # TODO Convert routes to a dataclass

        static_web_routes = [
            Route("/", "page_index", self.wr.page_index),
            Route("/about", "page_about", self.wr.page_about),
            ]

        entity_pages = [
            Route("/collection", "page_collections", self.wr.page_collections),
            Route("/project", "page_projects", self.wr.page_projects),
            Route("/format", "page_formats", self.wr.page_formats),

        ]

        form_pages = [
            Route("/newproject", "page_new_project", self.wr.page_new_project),
            Route("/newcollection", "page_new_collection", self.wr.page_new_collection),
        ]

        if self.app:
            for rule in static_web_routes:
                self.app.add_url_rule(rule.rule, rule.method, rule.viewFunction)

            for rule in entity_pages:
                self.app.add_url_rule(rule.rule, rule.method, rule.viewFunction)

            for rule in form_pages:
                self.app.add_url_rule(rule.rule, rule.method, rule.viewFunction)


class Routers:
    def __init__(self, middleware: avforms.Middleware) -> None:
        self.middleware = middleware


class APIRoutes(Routers):

    def get_projects(self, serialize=True):
        return self.middleware.get_projects(serialize)

    def get_project_by_id(self, id):
        return self.middleware.get_project_by_id(id)

    def get_collections(self, serialize=True):
        return self.middleware.get_collections(serialize)

    def collection_by_id(self, id):
        return self.middleware.collection_by_id(id)

    def get_formats(self, serialize=True):
        return self.middleware.get_formats(serialize)

    def add_project(self):
        return self.middleware.add_project()

    def update_project(self, id):
        return self.middleware.update_project(id)

    def delete_project(self, id):
        return self.middleware.delete_project(id)

    def add_collection(self):
        return self.middleware.add_collection()


class WebsiteRoutes(Routers):

    @staticmethod
    def page_index():
        return render_template("index.html", selected_menu_item="index")

    @staticmethod
    def page_about():
        return render_template("about.html", selected_menu_item="about")

    def page_collections(self):
        collections = self.middleware.get_collections(serialize=False)
        return render_template(
            "collections.html",
            selected_menu_item="collection",
            collections=collections
        )

    def page_projects(self):
        projects = self.middleware.get_projects(serialize=False)
        return render_template(
            "projects.html",
            selected_menu_item="projects",
            projects=projects
        )

    def page_formats(self):
        formats = self.middleware.get_formats(serialize=False)
        return render_template(
            "formats.html",
            selected_menu_item="formats",
            formats=formats
        )

    def page_new_project(self):
        return render_template(
            "newentity.html",
            selected_menu_item="forms",
            form_title="New Project",
            api_location="api/project/",
            form_fields=[
                FormField("text", "title", "Project Title", True),
                FormField("text", "project_code", "Project Code", False),
                FormField("text", "status", "Project Status", False),
                FormField("text", "current_location", "Current Location", False),
                FormField("text", "specs", "Specs", False),
            ]
        )

    def page_new_collection(self):
        return render_template(
            "newentity.html",
            selected_menu_item="forms",
            form_title="New Collection",
            api_location="api/collection/",
            form_fields=[
                FormField("text", "collection_name", "Name", True),
                FormField("text", "department", "Department", True),
            ]
        )

def list_routes(app):
    results = []
    for rt in app.url_map.iter_rules():
        results.append({
            "methods": list(rt.methods),
            "route": str(rt)
        })
    return jsonify(results)
