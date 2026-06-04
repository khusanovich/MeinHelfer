# Import all models so Alembic autogenerate can discover them
from app.models.admin import Admin
from app.models.request import RequestStatusLog, ServiceRequest

__all__ = ["Admin", "ServiceRequest", "RequestStatusLog"]
