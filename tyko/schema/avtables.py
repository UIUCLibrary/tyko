import abc
import datetime
from typing import Union, List, Optional, Mapping

from sqlalchemy.orm import DeclarativeMeta, declarative_base
from sqlalchemy import Column, Date, Text, Integer, Boolean


SerializedData = \
    Optional[Union[int,
                   Column[Text],
                   Column[Integer],
                   Column[Boolean],
                   str,
                   List['SerializedData'],
                   Mapping[str, 'SerializedData']]]


class DeclarativeABCMeta(DeclarativeMeta, abc.ABCMeta):
    pass


class AVTables(declarative_base(metaclass=DeclarativeABCMeta)):
    __abstract__ = True

    @abc.abstractmethod
    def serialize(self, recurse=False) -> Mapping[str, SerializedData]:  # noqa: E501 pylint: disable=unused-argument
        """Serialize the data so that it can be turned into a JSON format"""
        return {}

    @classmethod
    def serialize_date(
            cls,
            date: Union[Column[Date], datetime.date],
            precision: int = 3
    ):
        return date.isoformat() if isinstance(date, datetime.date) else None
