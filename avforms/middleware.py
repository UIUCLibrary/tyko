from flask import jsonify, request, url_for, abort, make_response
from avforms.data_provider import DataProvider
import hashlib
import json


class Middleware:
    def __init__(self, data_provider: DataProvider) -> None:
        self.data_provider = data_provider

    def update_project(self, id):
        new_project = {
            "project_code": request.form["project_code"],
            "current_location": request.form["current_location"],
            "status": request.form["status"],
            "title": request.form["title"]
        }
        updated_project = self.data_provider.update_project(id, new_project)
        if not updated_project:
            return make_response("", 204)
        else:
            return jsonify(
                {"project": updated_project}
            )

    def delete_project(self, id):
        if self.data_provider.delete_project(id):
            return make_response("", 204)
        else:
            make_response("", 404)

    def get_projects(self, serialize=True):
        projects = self.data_provider.get_project(serialize=serialize)
        if serialize:
            data = {
                "projects": projects,
                "total": len(projects)
            }
            json_data = json.dumps(data)
            response = make_response(jsonify(data, 200))
            hash_value = hashlib.sha256(bytes(json_data, encoding="utf-8")).hexdigest()
            response.headers["ETag"] = str(hash_value)
            response.headers["Cache-Control"] = "private, max-age=300"
            return response
        else:
            result = projects
        return result

    def add_project(self):
        project_code = request.form.get('project_code')
        title = request.form.get('title')
        if title is None:
            return make_response("Missing required data", 400)
        current_location = request.form.get('current_location')
        status = request.form.get('status')
        specs = request.form.get('specs')
        new_project_id = self.data_provider.add_project(
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

    def get_collections(self, serialize=True):
        collections = self.data_provider.get_collection(serialize=serialize)
        if serialize:
            data = {
                "collections": collections,
                "total": len((collections))
            }

            json_data = json.dumps(data)
            response = make_response(jsonify(data, 200))
            hash_value= hashlib.sha256(bytes(json_data, encoding="utf-8")).hexdigest()
            response.headers["ETag"] = str(hash_value)
            response.headers["Cache-Control"] = "private, max-age=300"
            return response
        else:
            result = collections
        return result

    def collection_by_id(self, id):
        current_collection = \
            self.data_provider.get_collection(id, serialize=True)

        if current_collection:
            return jsonify({
                "collection": current_collection
            })
        else:
            abort(404)

    def add_collection(self):
        collection_name = request.form["collection_name"]
        department = request.form.get("department")
        record_series = request.form.get("record_series")
        new_collection_id = self.data_provider.add_collection(
            collection_name=collection_name,
            department=department,
            record_series=record_series)
        return jsonify({
            "id": new_collection_id,
            "url": url_for("collection_by_id", id=new_collection_id)
        })

    def get_formats(self, serialize=True):
        formats = self.data_provider.get_formats(serialize=serialize)
        if serialize:
            result = jsonify(formats)
        else:
            result = formats
        return result

    def get_project_by_id(self, id):
        current_project = self.data_provider.get_project(id, serialize=True)
        if current_project:
            return jsonify(
                {
                    "project": current_project
                }
            )
        else:
            abort(404)

    def get_item(self, serialize=True):
        items = self.data_provider.get_item(serialize=serialize)
        if serialize:
            data = {
                "items": items,
                "total": len(items)
            }

            json_data = json.dumps(data)
            response = make_response(jsonify(data, 200))
            hash_value= hashlib.sha256(bytes(json_data, encoding="utf-8")).hexdigest()
            response.headers["ETag"] = str(hash_value)
            response.headers["Cache-Control"] = "private, max-age=300"
            return response

        else:
            result = items
        return result

    def item_by_id(self, id):
        current_item = self.data_provider.get_item(id, serialize=True)
        if current_item:
            return jsonify(
                {
                    "item": current_item
                }
            )
        else:
            abort(404)

    def add_item(self):
        name = request.form.get('name')
        barcode = request.form.get('barcode')
        file_name = request.form.get('file_name')
        new_item_id = self.data_provider.add_item(
            name=name,
            barcode=barcode,
            file_name=file_name
        )
        return jsonify({
            "id": new_item_id,
            "url": url_for("item_by_id", id=new_item_id)
            }
        )
