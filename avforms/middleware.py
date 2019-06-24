from flask import jsonify
from avforms.data_provider import DataProvider

# TODO: set db engine location
db_engine = "sqlite:///dummy.db?check_same_thread=False"
DATA_PROVIDER = DataProvider(db_engine)


def get_collections(serialize=True):
    collections = DATA_PROVIDER.get_collection(serialize=serialize)
    if serialize:
        return jsonify(collections)
    else:
        return collections


def get_formats(serialize=True):
    formats = DATA_PROVIDER.get_formats(serialize=serialize)
    if serialize:
        return jsonify(formats)
    else:
        return formats


def get_projects(serialize=True):
    projects = DATA_PROVIDER.get_project(serialize=serialize)
    if serialize:
        return jsonify(projects)
    else:
        return projects
