"""Email notification service.

Sends transactional emails via SMTP (aiosmtplib).
Degrades gracefully to log-only when SMTP is not configured.
"""

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import settings
from app.core.logging import get_logger
from app.domain.enums import SERVICE_TYPE_LABELS, STATUS_LABELS, RequestStatus
from app.models.request import ServiceRequest

logger = get_logger(__name__)


class NotificationService:
    async def _send(self, to: str, subject: str, html: str, text: str) -> None:
        if not settings.smtp_configured:
            logger.info("SMTP not configured — skipping email to %s: %s", to, subject)
            return

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"
        msg["To"] = to
        msg.attach(MIMEText(text, "plain", "utf-8"))
        msg.attach(MIMEText(html, "html", "utf-8"))

        try:
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=settings.SMTP_TLS,
            )
            logger.info("Email sent to %s: %s", to, subject)
        except Exception:
            logger.exception("Failed to send email to %s", to)

    # ── Customer emails ───────────────────────────────────────────────────────

    async def send_request_confirmation(self, request: ServiceRequest) -> None:
        service_label = SERVICE_TYPE_LABELS.get(request.service_type, request.service_type)
        subject = f"Anfrage {request.reference_code} erhalten – MeinHelfer"

        html = f"""
        <html><body style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>Ihre Anfrage ist eingegangen!</h2>
        <p>Vielen Dank, <strong>{request.customer_name}</strong>.</p>
        <p>Wir haben Ihre Anfrage erhalten und werden uns in Kürze bei Ihnen melden.</p>
        <table style="border-collapse:collapse;width:100%;margin:20px 0">
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Referenznummer</strong></td>
              <td style="padding:8px">{request.reference_code}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Service</strong></td>
              <td style="padding:8px">{service_label}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Datum</strong></td>
              <td style="padding:8px">{request.scheduled_date.strftime('%d.%m.%Y')} um {request.scheduled_time.strftime('%H:%M')} Uhr</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Helfer</strong></td>
              <td style="padding:8px">{request.helper_count}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Adresse</strong></td>
              <td style="padding:8px">{request.address_street}, {request.address_zip} {request.address_city}</td></tr>
        </table>
        <p>Bitte notieren Sie sich Ihre Referenznummer für Rückfragen.</p>
        <p>Mit freundlichen Grüßen,<br>Ihr MeinHelfer-Team</p>
        </body></html>
        """

        text = (
            f"Anfrage erhalten!\n\n"
            f"Referenznummer: {request.reference_code}\n"
            f"Service: {service_label}\n"
            f"Datum: {request.scheduled_date.strftime('%d.%m.%Y')} um {request.scheduled_time.strftime('%H:%M')} Uhr\n"
            f"Adresse: {request.address_street}, {request.address_zip} {request.address_city}\n\n"
            f"Wir melden uns in Kürze.\n\nMeinHelfer-Team"
        )

        await self._send(request.customer_email, subject, html, text)

    async def send_status_update(self, request: ServiceRequest, new_status: RequestStatus) -> None:
        status_label = STATUS_LABELS.get(new_status, new_status.value)
        subject = f"Anfrage {request.reference_code} – Status: {status_label}"

        messages = {
            RequestStatus.CONFIRMED: "Ihre Buchung wurde bestätigt. Ein Helfer wurde für Sie eingeplant.",
            RequestStatus.COMPLETED: "Ihr Auftrag wurde abgeschlossen. Vielen Dank für Ihr Vertrauen!",
            RequestStatus.CANCELLED: "Ihre Anfrage wurde storniert. Bei Fragen kontaktieren Sie uns gerne.",
        }
        body_text = messages.get(new_status, f"Ihr Anfragestatus wurde auf '{status_label}' aktualisiert.")

        html = f"""
        <html><body style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>Status-Update: {status_label}</h2>
        <p>Hallo <strong>{request.customer_name}</strong>,</p>
        <p>{body_text}</p>
        <p><strong>Referenznummer:</strong> {request.reference_code}</p>
        <p>Mit freundlichen Grüßen,<br>Ihr MeinHelfer-Team</p>
        </body></html>
        """

        await self._send(request.customer_email, subject, html, body_text)

    # ── Admin emails ──────────────────────────────────────────────────────────

    async def send_new_request_alert(self, request: ServiceRequest) -> None:
        if not settings.ADMIN_EMAIL:
            return

        service_label = SERVICE_TYPE_LABELS.get(request.service_type, request.service_type)
        subject = (
            f"[NEU] {request.reference_code} – {service_label} – "
            f"{request.scheduled_date.strftime('%d.%m.%Y')}"
        )

        html = f"""
        <html><body style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>Neue Anfrage eingegangen</h2>
        <table style="border-collapse:collapse;width:100%;margin:20px 0">
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Referenz</strong></td>
              <td style="padding:8px">{request.reference_code}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Service</strong></td>
              <td style="padding:8px">{service_label}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Datum</strong></td>
              <td style="padding:8px">{request.scheduled_date.strftime('%d.%m.%Y')} um {request.scheduled_time.strftime('%H:%M')} Uhr</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Helfer</strong></td>
              <td style="padding:8px">{request.helper_count}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Kunde</strong></td>
              <td style="padding:8px">{request.customer_name} ({request.customer_email})</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Adresse</strong></td>
              <td style="padding:8px">{request.address_street}, {request.address_zip} {request.address_city}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5"><strong>Beschreibung</strong></td>
              <td style="padding:8px">{request.description}</td></tr>
        </table>
        <p><a href="{settings.APP_URL}/admin/requests/{request.id}">Im Admin-Panel ansehen</a></p>
        </body></html>
        """

        text = (
            f"Neue Anfrage: {request.reference_code}\n"
            f"Kunde: {request.customer_name} <{request.customer_email}>\n"
            f"Service: {service_label} | Datum: {request.scheduled_date} | Helfer: {request.helper_count}\n"
            f"Adresse: {request.address_street}, {request.address_zip} {request.address_city}\n\n"
            f"Beschreibung: {request.description}"
        )

        await self._send(settings.ADMIN_EMAIL, subject, html, text)
