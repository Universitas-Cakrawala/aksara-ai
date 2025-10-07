from datetime import date, datetime

import pytz


def serialize_date(d):
    return d.isoformat() if isinstance(d, date) else None


def format_date(date_str):
    dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    jakarta_tz = pytz.timezone("Asia/Jakarta")
    local_dt = dt.astimezone(jakarta_tz)
    return local_dt.strftime("%Y-%m-%d %H:%M:%S")


MOTNTH_MAPPING = {
    "januari": 1,
    "februari": 2,
    "maret": 3,
    "april": 4,
    "mei": 5,
    "juni": 6,
    "juli": 7,
    "agustus": 8,
    "september": 9,
    "oktober": 10,
    "november": 11,
    "desember": 12,
}
