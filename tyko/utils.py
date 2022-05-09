import re
from datetime import datetime, date
from sqlalchemy import Column, Date
from typing import Union

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
    1: re.compile(r'^([0-9]{4})$'),
    2: re.compile(r'^([0-1]?[0-9])/([0-9]{4})$'),
    # 3: re.compile(r'^([0-1][0-9])-([0-3][0-9])-([0-9]{4})$'),
    3: re.compile(r'^([0-1]?[0-9])/([0-3]?[0-9])/([0-9]{4})$')
}


def identify_precision(data) -> int:
    for precision, matcher in DATE_PRECISIONS_REGEX.items():
        if matcher.match(data):
            return precision
    raise AttributeError(f"Unable to identify format for string {data}")


def create_precision_datetime(date: str, precision: int = 3):

    formatter = DATE_FORMATS_IN.get(precision)
    if formatter is None:
        raise AttributeError("Invalid precision type")
    return datetime.strptime(date, formatter)


def create_precision_datetime_with_slash(date: str, precision: int = 3):

    return datetime.strptime(date, "%m/%d/%Y")


def serialize_precision_datetime(
        date: Union[date, Column[Date]],
        precision=3
) -> str:
    formatter = DATE_FORMATS_OUT.get(precision)
    if formatter is None:
        raise AttributeError("Invalid precision type")
    return date.strftime(formatter)


# def serialize_precision_datetime_with_slash(
#         date: Union[date, Column[Date]],
# ) -> str:
#     return date.strftime("%-m/%-d/%Y")
