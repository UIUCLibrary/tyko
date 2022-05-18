import re
import datetime
import typing

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
