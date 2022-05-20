import sys
import logging
import typing

from flask import Flask, make_response, Response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import OperationalError

import tyko
import tyko.data_provider
import tyko.routes

from .database import init_database, create_samples, db as db
from .exceptions import DataError, NoTable
from .schema import ALEMBIC_VERSION


def is_correct_db_version(app, engine) -> bool:
    try:
        version = tyko.data_provider.get_schema_version(
            db_engine=engine
        )

        if version is None:
            app.logger.error("No version information found")
            return False
    except OperationalError as exc:
        app.logger.error(
            "Problem getting version information. "
            f"Reason given: {exc}")
        if "no such table" in str(exc):
            raise NoTable() from exc
        return False
    return version == ALEMBIC_VERSION


def create_app(
        app: typing.Optional[Flask] = None,
        verify_db: bool = True
) -> Flask:
    """Create a new flask app."""

    if app is None:
        app = Flask(__name__)
    app.logger.setLevel(logging.INFO)

    app.logger.info("Loading configurations")
    app.config.from_object("tyko.config.Config")
    app.config.from_envvar("TYKO_SETTINGS", True)

    app.register_error_handler(DataError, handle_error)

    app.logger.info("Configuring database")
    db.init_app(app)
    engine = db.get_engine(app)

    app.logger.info("Loading database connection")
    tyko_data_provider = tyko.data_provider.DataProvider(engine)

    app.logger.info("Checking database schema version")
    if verify_db is True and not is_correct_db_version(app, engine):
        app.logger.critical(f"Database requires alembic version "
                            f"{ALEMBIC_VERSION}. Please migrate or initialize "
                            f"database and try again.")
        app.add_url_rule("/", "unable_to_load", page_failed_on_startup)
        return app

    app_routes = tyko.routes.Routes(tyko_data_provider, app)
    app.logger.info("Initializing API routes")
    app_routes.init_api_routes()
    app.logger.info("Initializing Website routes")
    app_routes.init_website_routes()

    return app


def page_failed_on_startup() -> Response:
    return make_response("Tyko failed during started", 503)


def main() -> None:

    if "init-db" in sys.argv:
        my_app = Flask(__name__)
        my_app.config.from_object("tyko.config.Config")
        my_app.config.from_envvar("TYKO_SETTINGS", True)
        db.init_app(my_app)
        engine = db.get_engine(my_app)
        data_provider = tyko.data_provider.DataProvider(engine)
        my_app.logger.info("Initializing Database")  # pylint: disable=E1101
        init_database(data_provider.db_engine)
        if "--create-samples" in sys.argv:
            create_samples(data_provider.db_engine)
        sys.exit(0)
    my_app = create_app()
    if my_app is not None:
        # Run as a local program and not for production
        my_app.run()


def handle_error(error) -> Response:
    return make_response(error.message, error.status_code)
