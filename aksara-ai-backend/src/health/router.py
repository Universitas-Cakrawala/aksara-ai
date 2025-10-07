from fastapi import APIRouter

from src.common.response_examples import ResponseExamples
from src.health.controller import HealthController

routerHealth = APIRouter()


@routerHealth.get(
    "",
    responses=ResponseExamples.health_check_responses(),
    summary="Health check endpoint",
    description="Check if the server is running properly",
)
async def health_check():
    return await HealthController.health()
