import argparse
import sys

from avforms.commands import commands


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title="Extra", dest="subcommand")
    for k, v in commands.items():
        subparsers.add_parser(k, help=v[0])

    args = parser.parse_args()

    if args.subcommand:
        commands[args.subcommand][1]()
        sys.exit()

    print("ASdfadfsdsa")
