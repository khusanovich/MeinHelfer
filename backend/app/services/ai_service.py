"""AI service stub — wired into the architecture, not yet implemented.

Each method returns a sentinel value so callers can branch on None.
Phase 6 will replace these stubs with real Claude API calls.
"""

from decimal import Decimal

from app.core.logging import get_logger
from app.domain.enums import ServiceType
from app.models.request import ServiceRequest

logger = get_logger(__name__)


class AIService:
    async def classify_request(self, description: str) -> ServiceType | None:
        """Classify a free-text description into a ServiceType."""
        logger.debug("AI classify_request: stub called")
        return None

    async def estimate_duration(self, request: ServiceRequest) -> Decimal | None:
        """Estimate job duration in hours."""
        logger.debug("AI estimate_duration: stub called")
        return None

    async def estimate_price(self, request: ServiceRequest) -> Decimal | None:
        """Estimate job price in EUR."""
        logger.debug("AI estimate_price: stub called")
        return None

    async def recommend_helpers(self, request: ServiceRequest) -> list[str]:
        """Return a ranked list of helper names for the request."""
        logger.debug("AI recommend_helpers: stub called")
        return []

    async def generate_summary(self, request: ServiceRequest) -> str | None:
        """Generate a concise admin-facing summary of the request."""
        logger.debug("AI generate_summary: stub called")
        return None
