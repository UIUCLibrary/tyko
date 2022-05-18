from __future__ import annotations
from importlib.resources import read_text
import typing
from jinja2 import Template

from tyko.data_provider import ProjectDataConnector, \
    ObjectDataConnector, FilesDataConnector

if typing.TYPE_CHECKING:
    from tyko.data_provider import DataProvider


def resolve_project_data(
        project_connector: ProjectDataConnector,
        unresolved_object: dict
):
    project_id = unresolved_object.get("parent_project_id")
    if project_id is None:
        return None
    return project_connector.get(project_id, serialize=True)


def create_pbcore_from_object(object_id: int,
                              data_provider: DataProvider) -> str:
    template = Template(
        read_text("tyko.pbcore.templates", "pbcore.xml"),
        keep_trailing_newline=True
    )

    connector = ObjectDataConnector(data_provider.db_session_maker)
    resulting_object = connector.get(object_id, serialize=True)
    file_connector = FilesDataConnector(data_provider.db_session_maker)
    project_connector = ProjectDataConnector(data_provider.db_session_maker)

    resulting_object['project'] = resolve_project_data(
        project_connector, resulting_object)

    for item in resulting_object.get("items", []):
        item['files'] = resolve_files(file_connector, item)

    return template.render(
        obj=resulting_object,
        identifier_source="University of Illinois at Urbana-Champaign"
    )


def resolve_files(file_connector: FilesDataConnector, item):
    # The files comibg back aren't complete, get the rest of the metadata
    # before passing it on to the PBCore template
    resolved_files = []
    for item_file in item.get("files", []):
        file_id = item_file['id']
        res = file_connector.get(file_id, serialize=True)
        resolved_files.append(res)
    return resolved_files
