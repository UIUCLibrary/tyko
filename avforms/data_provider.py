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

    def get_project(self, serialize=False):
        all_projects = self.session.query(scheme.Project).all()
        if serialize:
            return [project.serialize() for project in all_projects]
        else:
            return all_projects
