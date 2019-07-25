import argparse


def setup_cli_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("db_engine")
    # subparsers = parser.add_subparsers(title="Extra", dest="subcommand")
    # for k, v in commands.items():
    #     subparsers.add_parser(k, help=v[0])

    return parser
