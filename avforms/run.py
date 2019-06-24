import argparse
import sys

from flask import Flask

from avforms.commands import commands
from avforms import routes

app = Flask(__name__)


def setup_cli_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title="Extra", dest="subcommand")
    for k, v in commands.items():
        subparsers.add_parser(k, help=v[0])

    return parser


def main() -> None:
    parser = setup_cli_parser()
    args = parser.parse_args()

    if args.subcommand:
        commands[args.subcommand][1]()
        sys.exit()

    print("Running normal program")
    routes.init_api_routes(app)
    routes.init_website_routes(app)
    app.run(debug=True, host='0.0.0.0')
