from starlette.responses import JSONResponse

from src.constants import HTTP_INTERNAL_SERVER_ERROR, HTTP_OK
from src.utils.helper import formatError, ok


class HealthController:
    @staticmethod
    async def health() -> JSONResponse:
        try:
            response = {
                "success": True,
            }

            return ok(response, "Server running successfully!", status_code=HTTP_OK)
        except Exception as e:
            return formatError(str(e), HTTP_INTERNAL_SERVER_ERROR)
