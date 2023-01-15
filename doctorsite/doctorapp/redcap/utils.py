import datetime
from typing import Union

from django.utils.dateparse import parse_date, parse_datetime

DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S.%f%z'
DATETIME_FORMAT_REDCAP = '%Y-%m-%d %H:%M:%S'
DATE_FORMAT = '%Y-%m-%d'


def parse_date_if_obj(date: Union[str, datetime.date]) -> datetime.date:
    assert isinstance(date, str) or isinstance(date, datetime.date)
    return parse_date(date) if isinstance(date, str) else date


def parse_datetime_if_obj(datetime: Union[str, datetime.datetime]) -> datetime.datetime:
    assert isinstance(datetime, str) or isinstance(datetime, datetime.datetime)
    return parse_datetime(datetime) if isinstance(datetime, str) else datetime
