import sqlalchemy
from sqlalchemy import orm

from avforms import database, scheme


class DataProvider:
    def __init__(self, engine):
        self.engine = engine
        db_engine = sqlalchemy.create_engine(engine)
        self.init_database()
        db_session = orm.sessionmaker(bind=db_engine)
        self.session = db_session()

    def init_database(self):
        db_engine = sqlalchemy.create_engine(self.engine)
        database.init_database(db_engine)

    def get_collection(self, id=None, serialize=False):
        if id:
            all_collections = \
                self.session.query(scheme.Collection)\
                    .filter(scheme.Collection.id == id)\
                    .all()
        else:
            all_collections = self.session.query(scheme.Collection).all()

        if serialize:
            return [collection.serialize() for collection in all_collections]
        else:
            return all_collections

    def get_formats(self, serialize=False):
        all_formats = self.session.query(scheme.FormatTypes).all()
        if serialize:
            return [format_.serialize() for format_ in all_formats]
        else:
            return all_formats

    def get_project(self, id=None, serialize=False):
        if id:
            all_projects = self.session.query(scheme.Project)\
                .filter(scheme.Project.id == id)\
                .all()

        else:
            all_projects = self.session.query(scheme.Project).all()
        if serialize:
            return [project.serialize() for project in all_projects]
        else:
            return all_projects

    def add_project(self, title, project_code, current_location, status,
                    specs):
        new_project = scheme.Project(
            title=title,
            project_code=project_code,
            current_location=current_location,
            status=status,
            specs=specs
        )
        self.session.add(new_project)
        self.session.commit()

        return new_project.id

    def add_collection(self, collection_name, department, record_series):
        new_collection = scheme.Collection(
            collection_name=collection_name,
            department=department,
            record_series=record_series

        )
        self.session.add(new_collection)
        self.session.commit()
        return new_collection.id
