import sys

import sqlalchemy
from flask import Flask

from avforms.commands import commands
from avforms import routes
from avforms.config import setup_cli_parser
from avforms.middleware import data_provider

app = Flask(__name__)


def create_app(db_engine):
    app_routes = routes.Routes(db_engine, app=app)
    if not app_routes.is_valid():
        sys.exit(1)

    # print("Running normal program")

    app_routes.init_api_routes()
    routes.init_website_routes(app)
    return app
    # app.run(host='0.0.0.0')


def main() -> None:
    """Run as a local program and not for production"""

    parser = setup_cli_parser()
    args = parser.parse_args()

    # Validate that the database can be connected to
    print(args)

    my_app = create_app(args.db_engine)
    my_app.run(host='0.0.0.0')
