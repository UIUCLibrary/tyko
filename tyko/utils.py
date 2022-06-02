"""Utility functions."""

import abc
import re
import datetime
import shutil
import typing
import subprocess


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


class AbsGetVersionStrategy(abc.ABC):
    """Base class for getting version info."""

    @abc.abstractmethod
    def get_version(self):
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
        import pkg_resources
        try:
            return pkg_resources.get_distribution("tyko").version
        except pkg_resources.DistributionNotFound as error:
            raise InvalidVersionStrategy from error

    def get_version(self) -> str:
        """Get version info from pkg."""
        return self.get_from_pkg_resources()


class GitVersionStrategy(AbsGetVersionStrategy):
    """Version strategy using git version control."""

    @staticmethod
    def get_git_commit() -> bytes:
        """Get git hash of HEAD."""
        git_command = shutil.which("git")
        if git_command is None:
            raise InvalidVersionStrategy("git command not found")
        return subprocess.check_output(
            [
                git_command,
                "rev-parse",
                "HEAD"
            ]
        )

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

    If all strategies fails to get a version a NoValidStrategy exception with
    be raised.

    Args:
        strategies: Strategy in order to use for getting version info.

    Returns:
        version info as a string

    """
    strategies = strategies or [
        PkgResourceDistributionVersionStrategy
    ]
    for strategy_type in strategies:
        try:
            strategy = strategy_type()
            return strategy.get_version()
        except InvalidVersionStrategy:
            continue
    raise NoValidStrategy()
