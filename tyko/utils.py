"""Utility functions."""

import abc
import os.path
import re
import datetime
import shutil
import typing
import subprocess  # nosec # noqa: S404


from sqlalchemy import Column, Date

DATE_FORMATS_IN = {
    1: "%Y",
    2: "%m/%Y",
    3: "%m/%d/%Y",
}

DATE_FORMATS_OUT = {
    1: "%Y",
    2: "%-m/%Y",
    3: "%-m/%-d/%Y",
}


DATE_PRECISIONS_REGEX = {
    1: re.compile(r'^(\d{4})$'),
    2: re.compile(r'^([0-1]?\d)/(\d{4})$'),
    3: re.compile(r'^([0-1]?\d)/([0-3]?\d)/(\d{4})$')
}


def identify_precision(data: str) -> int:
    for precision, matcher in DATE_PRECISIONS_REGEX.items():
        if matcher.match(data):
            return precision
    raise AttributeError(f"Unable to identify format for string {data}")


def create_precision_datetime(
        date: str,
        precision: int = 3
) -> datetime.datetime:

    formatter = DATE_FORMATS_IN.get(precision)
    if formatter is None:
        raise AttributeError("Invalid precision type")
    return datetime.datetime.strptime(date, formatter)


def serialize_precision_datetime(
        date: typing.Union[datetime.date, Column[Date]],
        precision: int = 3
) -> str:
    formatter = DATE_FORMATS_OUT.get(precision)
    if formatter is None:
        raise AttributeError("Invalid precision type")
    return typing.cast(datetime.date, date).strftime(formatter)


class AbsGetVersionStrategy(abc.ABC):  # pylint: disable=too-few-public-methods
    """Base class for getting version info."""

    @abc.abstractmethod
    def get_version(self) -> str:
        """Get version."""


class StrategyError(Exception):
    """Strategy error."""


class NoValidStrategy(StrategyError):
    """No valid strategy."""


class InvalidVersionStrategy(StrategyError):
    """Raises when strategy doesn't make sense for the current environment."""


class PkgResourceDistributionVersionStrategy(AbsGetVersionStrategy):
    """Use pkg_resources to locate version info from package metadata."""

    @staticmethod
    def get_from_pkg_resources() -> str:
        """Get pky version with pkg_resources."""
        try:
            import pkg_resources  # pylint: disable=import-outside-toplevel
            return pkg_resources.get_distribution("tyko").version
        except ImportError as error:
            raise InvalidVersionStrategy from error
        except pkg_resources.DistributionNotFound as error:
            raise InvalidVersionStrategy from error

    def get_version(self) -> str:
        """Get version info from pkg."""
        return self.get_from_pkg_resources()


class GitVersionStrategy(AbsGetVersionStrategy):
    """Version strategy using git version control."""

    @staticmethod
    def get_git_commit(git_command: typing.Optional[str] = None) -> bytes:
        """Get git hash of HEAD.

        Args:
            git_command:
                Path to git command. If not specified, the version on the path
                will be used.

        Returns:
            git hash value

        """
        git_command = git_command or GitVersionStrategy.get_git_command()
        if not os.path.exists(git_command):
            raise FileNotFoundError("Unable to locate absolute path to git")

        return subprocess.check_output(  # nosec # noqa: S603
            [
                git_command,
                "rev-parse",
                "HEAD"
            ]
        )

    @staticmethod
    def get_git_command() -> str:
        """Locate a git command."""
        git_command = shutil.which("git")
        if git_command is None:
            raise InvalidVersionStrategy("git command not found")

        return os.path.abspath(git_command)

    def get_version(self) -> str:
        """Get a git commit hash for a version."""
        git_hash = str(self.get_git_commit())
        return f"GIT:{git_hash}"


def get_version(
        strategies: typing.List[typing.Type[AbsGetVersionStrategy]] = None
) -> str:
    """Get the version information for Tyko.

    This will cycle through the strategies and use the first one that does not
    raise a InvalidVersionStrategy exception.

    If all strategies fails to get a version, a NoValidStrategy exception will
    be raised.

    Args:
        strategies: Strategy in order to use for getting version info.

    Returns:
        version info as a string

    """
    if strategies is None:
        strategies = [
            PkgResourceDistributionVersionStrategy,
            GitVersionStrategy
        ]
    for strategy_type in strategies:
        try:
            strategy = strategy_type()
            return strategy.get_version()
        except InvalidVersionStrategy:
            continue

    tried_strategies = \
        ",".join(strategy.__name__ for strategy in strategies)

    raise NoValidStrategy(f"Tried [{tried_strategies}]")
