from pydantic import BaseModel as BaseModelV2
from pydantic import conint


class PageParams(BaseModelV2):
    """Request query params for paginated API."""

    page: conint(ge=1) = 1
    size: conint(ge=1) = 10


def MapPagination(data, totalItems, pageParams):
    return {
        "data": data,
        "pagination": {
            "total_items": totalItems,
            "page": pageParams.page,
            "size": pageParams.size,
            "total_pages": (totalItems + pageParams.size - 1)
            // pageParams.size,  # Calculate total pages
        },
    }
