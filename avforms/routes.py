from flask import Flask, jsonify, render_template
import avforms
from .decorators import authenticate
from avforms.data_provider import DataProvider
from dataclasses import dataclass, field
from typing import Any, List

the_app = Flask(__name__)


@dataclass
class Route:
    rule: str
    method: str
    viewFunction: Any
    methods: List[str] = field(default_factory=lambda: ["GET"])


@dataclass
class APIEntity:
    entity_type: str
    rules: List[Route] = field(default_factory=list)


@dataclass
class EntityPage:
    entity_type: str
    entity_list_page: str
    rules: List[Route] = field(default_factory=list)


@dataclass
class FormPage:
    page_name: str
    page_endpoint: str
    rule: Route


@dataclass
class FormField:
    form_type: str
    form_id: str
    form_user_text: str
    required: bool


all_entities = set()
all_forms = set()


class Routes:

    def __init__(self, db_engine: DataProvider, app) -> None:
        self.db_engine = db_engine
        self.app = app
        self.mw = avforms.Middleware(self.db_engine)
        self.wr = WebsiteRoutes(self.mw)

    def init_api_routes(self) -> None:
        project = self.mw.entities["project"]
        collection = self.mw.entities["collection"]
        item = self.mw.entities["item"]
        project_object = self.mw.entities["object"]

        if self.app:
            entities = [
                APIEntity("Projects", rules=[
                    Route("/api/project", "projects",
                          lambda serialize=True: project.get(serialize)),
                    Route("/api/project/<string:id>", "project_by_id",
                          lambda id: project.get(id=id)),
                    Route("/api/project/", "add_project",
                          project.create,
                          methods=["POST"]),
                    Route("/api/project/<string:id>", "update_project",
                          lambda id: project.update(id=id),
                          methods=["PUT"]),
                    Route("/api/project/<string:id>", "delete_project",
                          lambda id: project.delete(id=id),
                          methods=["DELETE"]),
                  ]),
                APIEntity("Collection", rules=[
                    Route("/api/collection", "collection",
                          lambda serialize=True: collection.get(serialize)),
                    Route("/api/collection/<string:id>", "collection_by_id",
                          lambda id: collection.get(id=id)),
                    Route("/api/collection/", "add_collection",
                          collection.create,
                          methods=["POST"])
                ]),
                APIEntity("Formats", rules=[
                    Route("/api/format", "formats",
                          self.mw.get_formats
                          )
                ]),
                APIEntity("Item", rules=[
                    Route("/api/item", "item",
                          lambda serialize=True: item.get(serialize),
                          methods=["GET"]),
                    Route("/api/item/<string:id>", "item_by_id",
                          lambda id: item.get(id=id),
                          methods=["GET"]),
                    Route("/api/item/", "add_item",
                          item.create,
                          methods=["POST"])

                ]),
                APIEntity("Object", rules=[
                    Route("/api/object", "object",
                          lambda serialize=True: project_object.get(serialize),
                          methods=["GET"]
                          ),
                    Route("/api/object/<string:id>", "object_by_id",
                          lambda id: project_object.get(id=id)),
                    Route("/api/object/", "add_object",
                          project_object.create,
                          methods=["POST"])
                ])

            ]

            for entity in entities:
                for rule in entity.rules:
                    self.app.add_url_rule(rule.rule, rule.method,
                                          rule.viewFunction,
                                          methods=rule.methods)

            # ##############
            self.app.add_url_rule(
                "/api",
                "list_routes",
                list_routes,
                methods=["get"],
                defaults={"app": self.app}
            )

    def init_website_routes(self):

        static_web_routes = [
            Route("/", "page_index", self.wr.page_index),
            Route("/about", "page_about", self.wr.page_about),
            ]

        entity_pages = [
            EntityPage("Collection", "page_collections", rules=[
                    Route("/collection", "page_collections",
                          self.wr.page_collections)
                ]),
            EntityPage("Projects", "page_projects", rules=[
                    Route("/project", "page_projects", self.wr.page_projects),
                ]),
            EntityPage("Formats", "page_formats", rules=[
                    Route("/format", "page_formats", self.wr.page_formats),
                ]),
            EntityPage("Items", "page_item", rules=[
                    Route("/item", "page_item", self.wr.page_item)
                ])
        ]

        form_pages = [
            FormPage("Project", "page_new_project",
                     rule=Route("/newproject", "page_new_project",
                                self.wr.page_new_project)),
            FormPage("Collection", "page_new_collection",
                     rule=Route("/newcollection", "page_new_collection",
                                self.wr.page_new_collection)),
            FormPage("Item", "page_new_item",
                     rule=Route("/newitem", "page_new_item",
                                self.wr.page_new_item))
        ]

        if self.app:
            for rule in static_web_routes:
                self.app.add_url_rule(rule.rule, rule.method,
                                      rule.viewFunction)

            for entity in entity_pages:
                for rule in entity.rules:
                    all_entities.add((entity.entity_type,
                                      entity.entity_list_page))

                    self.app.add_url_rule(rule.rule, rule.method,
                                          rule.viewFunction)

            for form_page in form_pages:
                all_forms.add(
                    (
                        form_page.page_name,
                        form_page.page_endpoint
                    )
                )
                rule = form_page.rule
                self.app.add_url_rule(rule.rule, rule.method,
                                      rule.viewFunction)


class Routers:
    def __init__(self, middleware: avforms.Middleware) -> None:
        self.middleware = middleware


class ProjectRoute:
    def __init__(self, middleware: avforms.Middleware):
        self._middleware = middleware.entities["project"]

    def get(self, serialize=True):
        return self._middleware.get(serialize=serialize)


class WebsiteRoutes(Routers):

    @staticmethod
    def page_index():
        return render_template("index.html", selected_menu_item="index",
                               entities=all_entities,
                               all_forms=all_forms
                               )

    @staticmethod
    def page_about():
        return render_template("about.html", selected_menu_item="about",
                               entities=all_entities,
                               all_forms=all_forms
                               )

    def page_collections(self):
        collections = \
            self.middleware.entities["collection"].get(serialize=False)

        return render_template(
            "collections.html",
            selected_menu_item="collection",
            collections=collections,
            entities=all_entities,
            all_forms=all_forms
        )

    def page_projects(self):

        projects = self.middleware.entities["project"].get(serialize=False)
        return render_template(
            "projects.html",
            selected_menu_item="projects",
            projects=projects,
            entities=all_entities,
            all_forms=all_forms
        )

    def page_formats(self):
        formats = self.middleware.get_formats(serialize=False)
        return render_template(
            "formats.html",
            selected_menu_item="formats",
            formats=formats,
            entities=all_entities,
            all_forms=all_forms
        )

    def page_item(self):
        items = self.middleware.entities['item'].get(serialize=False)
        return render_template(
            "items.html",
            selected_menu_item="item",
            items=items,
            entities=all_entities,
            all_forms=all_forms
        )

    @authenticate
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
                FormField("text", "current_location", "Current Location",
                          False),
                FormField("text", "specs", "Specs", False),
            ],
            entities=all_entities,
            all_forms=all_forms
        )

    @authenticate
    def page_new_collection(self):
        return render_template(
            "newentity.html",
            selected_menu_item="forms",
            form_title="New Collection",
            api_location="api/collection/",
            form_fields=[
                FormField("text", "collection_name", "Name", True),
                FormField("text", "department", "Department", True),
            ],
            entities=all_entities,
            all_forms=all_forms
        )

    @authenticate
    def page_new_item(self):
        return render_template(
            "newentity.html",
            selected_menu_item="forms",
            form_title="New Item",
            api_location="api/item/",
            form_fields=[
                FormField("text", "name", "Name", True),
                FormField("text", "barcode", "Barcode", True),
                FormField("text", "file_name", "File name", True),
            ],
            entities=all_entities,
            all_forms=all_forms
        )


def list_routes(app):
    results = []
    for rt in app.url_map.iter_rules():
        results.append({
            "methods": list(rt.methods),
            "route": str(rt)
        })
    return jsonify(results)
