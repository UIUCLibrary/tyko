import sys

from flask import jsonify, request, url_for, abort
from avforms.data_provider import DataProvider


def data_provider():
    # db_engine = "mysql://avuser:avpsw@db:3306/av_preservation"
    # print(db_engine)
    db_engine = "sqlite:///dummy.db?check_same_thread=False"
    return DataProvider(db_engine)


def get_collections(serialize=True):
    collections = data_provider().get_collection(serialize=serialize)
    if serialize:
        return jsonify(collections)
    else:
        return collections


def collection_by_id(id):
    current_collection = data_provider().get_collection(id, serialize=True)
    if current_collection:
        return jsonify({
            "collection": current_collection
        })
    else:
        abort(404)


def add_collection():
    print(request.form)
    collection_name = request.form["collection_name"]
    department = request.form.get("department")
    record_series = request.form.get("record_series")

    new_collection_id = data_provider().add_collection(
        collection_name=collection_name,
        department=department,
        record_series=record_series)

    return jsonify({
        "id": new_collection_id,
        "url": url_for("collection_by_id", id=new_collection_id)
    })


def get_formats(serialize=True):
    formats = data_provider().get_formats(serialize=serialize)
    if serialize:
        return jsonify(formats)
    else:
        return formats


def get_projects(serialize=True):
    projects = data_provider().get_project(serialize=serialize)
    if serialize:
        return jsonify(projects)
    else:
        return projects


def get_project_by_id(id):
    current_project = data_provider().get_project(id, serialize=True)
    if current_project:
        return jsonify(
            {
                "project": current_project
            }
        )
    else:
        abort(404)


def add_project():
    print(request.form)
    project_code = request.form.get('project_code')
    title = request.form.get('title')
    current_location = request.form.get('current_location')
    status = request.form.get('status')
    specs = request.form.get('specs')

    new_project_id = data_provider().add_project(
        title=title,
        project_code=project_code,
        current_location=current_location,
        status=status,
        specs=specs
    )

    return jsonify(
        {
            "id": new_project_id,
            "url": url_for("project_by_id", id=new_project_id)
        }
    )