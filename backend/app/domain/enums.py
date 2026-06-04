import enum


class ServiceType(str, enum.Enum):
    MOVING = "moving"
    ASSEMBLY = "assembly"
    LOADING = "loading"
    CLEANING = "cleaning"
    GARDENING = "gardening"
    GENERAL = "general"


class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# Valid forward transitions — only these are permitted
VALID_TRANSITIONS: dict[RequestStatus, set[RequestStatus]] = {
    RequestStatus.PENDING: {RequestStatus.CONFIRMED, RequestStatus.CANCELLED},
    RequestStatus.CONFIRMED: {RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED},
    RequestStatus.IN_PROGRESS: {RequestStatus.COMPLETED, RequestStatus.CANCELLED},
    RequestStatus.COMPLETED: set(),
    RequestStatus.CANCELLED: set(),
}


def is_valid_transition(from_status: RequestStatus, to_status: RequestStatus) -> bool:
    return to_status in VALID_TRANSITIONS.get(from_status, set())


SERVICE_TYPE_LABELS: dict[ServiceType, str] = {
    ServiceType.MOVING: "Umzug",
    ServiceType.ASSEMBLY: "Montage",
    ServiceType.LOADING: "Be-/Entladen",
    ServiceType.CLEANING: "Reinigung",
    ServiceType.GARDENING: "Gartenarbeit",
    ServiceType.GENERAL: "Allgemeine Hilfe",
}

STATUS_LABELS: dict[RequestStatus, str] = {
    RequestStatus.PENDING: "Ausstehend",
    RequestStatus.CONFIRMED: "Bestätigt",
    RequestStatus.IN_PROGRESS: "In Bearbeitung",
    RequestStatus.COMPLETED: "Abgeschlossen",
    RequestStatus.CANCELLED: "Storniert",
}
