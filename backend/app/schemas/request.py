from datetime import date, time

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.domain.enums import RequestStatus, ServiceType


class AddressSchema(BaseModel):
    street: str = Field(..., min_length=3, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    zip: str = Field(..., min_length=4, max_length=20)
    notes: str | None = Field(None, max_length=500)


class CustomerSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str | None = Field(None, max_length=50)


class CreateRequestSchema(BaseModel):
    service_type: ServiceType
    helper_count: int = Field(..., ge=1, le=10)
    scheduled_date: date
    scheduled_time: time
    address: AddressSchema
    customer: CustomerSchema
    description: str = Field(..., min_length=10, max_length=2000)

    @field_validator("scheduled_date")
    @classmethod
    def date_must_be_future(cls, v: date) -> date:
        from datetime import date as date_type

        if v <= date_type.today():
            raise ValueError("scheduled_date must be at least 1 day in the future")
        return v

    @field_validator("scheduled_time")
    @classmethod
    def time_in_working_hours(cls, v: time) -> time:
        from datetime import time as time_type

        if not (time_type(7, 0) <= v <= time_type(20, 0)):
            raise ValueError("scheduled_time must be between 07:00 and 20:00")
        return v


class RequestCreatedResponse(BaseModel):
    reference_code: str
    status: RequestStatus
    message: str


class RequestStatusResponse(BaseModel):
    reference_code: str
    status: RequestStatus
    service_type: ServiceType
    scheduled_date: date
    scheduled_time: time
