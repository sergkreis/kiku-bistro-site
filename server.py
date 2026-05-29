from __future__ import annotations

import csv
import hashlib
import hmac
import io
import json
import os
import re
import secrets
import smtplib
import sqlite3
from datetime import date, datetime, time, timedelta
from email.message import EmailMessage
from html import escape
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("KIKU_DATA_DIR", ROOT / "data"))
DB_PATH = Path(os.environ.get("KIKU_DB_PATH", DATA_DIR / "reservations.sqlite3"))

OPEN_DAYS = {2, 3, 4, 5, 6}
PUBLIC_SLOTS = ["09:30", "10:00", "11:00", "13:00", "17:00", "18:00"]
ADMIN_SLOT_START = "09:30"
DEFAULT_CLOSING_TIME = "21:00"
WEDNESDAY_CLOSING_TIME = "17:00"
ADMIN_SLOT_INTERVAL_MINUTES = 15
RESERVATION_MINUTES = 120
DEFAULT_SLOT_LIMIT = 3
MAX_PARTY_SIZE = 12
AUTO_CONFIRM_MAX_GUESTS = 4
ACTIVE_STATUSES = {"pending", "confirmed", "seated"}
VALID_STATUSES = {"pending", "confirmed", "seated", "cancelled", "no_show"}
VALID_LOCALES = {"de", "en", "fr", "nl", "pl", "cs", "it", "es", "pt", "ja"}
RESTAURANT_EMAIL = "info@kiku-bistro.de"
SITE_URL = os.environ.get("KIKU_SITE_URL", "https://kiku-bistro.de").rstrip("/")
try:
    RESTAURANT_TZ = ZoneInfo("Europe/Berlin")
except ZoneInfoNotFoundError:
    RESTAURANT_TZ = None

KIKU_ENV = os.environ.get("KIKU_ENV", "local")
ADMIN_PASSWORD = os.environ.get("KIKU_ADMIN_PASSWORD")
if not ADMIN_PASSWORD and KIKU_ENV == "production":
    raise RuntimeError("KIKU_ADMIN_PASSWORD must be set in production")
ADMIN_PASSWORD = ADMIN_PASSWORD or "kiku-local"
AUTH_COOKIE = "kiku_admin"


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reservations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              booking_date TEXT NOT NULL,
              booking_time TEXT NOT NULL,
              guests INTEGER NOT NULL,
              name TEXT NOT NULL,
              phone TEXT NOT NULL,
              email TEXT NOT NULL,
              note TEXT,
              locale TEXT NOT NULL DEFAULT 'de',
              status TEXT NOT NULL DEFAULT 'confirmed',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            )
            """
        )
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(reservations)").fetchall()}
        if "guest_token" not in columns:
            conn.execute("ALTER TABLE reservations ADD COLUMN guest_token TEXT")
        if "source" not in columns:
            conn.execute("ALTER TABLE reservations ADD COLUMN source TEXT NOT NULL DEFAULT 'public'")
        if "locale" not in columns:
            conn.execute("ALTER TABLE reservations ADD COLUMN locale TEXT NOT NULL DEFAULT 'de'")
        rows_without_token = conn.execute("SELECT id FROM reservations WHERE guest_token IS NULL OR guest_token = ''").fetchall()
        for row in rows_without_token:
            conn.execute("UPDATE reservations SET guest_token = ? WHERE id = ?", (new_guest_token(), row["id"]))
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(booking_date, booking_time)"
        )
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_guest_token ON reservations(guest_token)"
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS slot_settings (
              booking_date TEXT NOT NULL,
              booking_time TEXT NOT NULL,
              slot_limit INTEGER NOT NULL,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (booking_date, booking_time)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS closed_days (
              booking_date TEXT PRIMARY KEY,
              reason TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            )
            """
        )


def json_response(handler: SimpleHTTPRequestHandler, status: HTTPStatus, payload: object) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def text_response(handler: SimpleHTTPRequestHandler, status: HTTPStatus, body: str, content_type: str) -> None:
    data = body.encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", f"{content_type}; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


def auth_token() -> str:
    return hmac.new(ADMIN_PASSWORD.encode("utf-8"), b"kiku-admin-local", hashlib.sha256).hexdigest()


def is_admin_authenticated(handler: SimpleHTTPRequestHandler) -> bool:
    cookies = handler.headers.get("Cookie", "")
    for part in cookies.split(";"):
        name, _, value = part.strip().partition("=")
        if name == AUTH_COOKIE and hmac.compare_digest(value, auth_token()):
            return True
    return False


def require_admin(handler: SimpleHTTPRequestHandler) -> bool:
    if is_admin_authenticated(handler):
        return True
    json_response(handler, HTTPStatus.UNAUTHORIZED, {"authenticated": False, "errors": ["Admin login required"]})
    return False


def set_auth_cookie(handler: SimpleHTTPRequestHandler) -> None:
    body = json.dumps({"authenticated": True}, ensure_ascii=False).encode("utf-8")
    handler.send_response(HTTPStatus.OK)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Set-Cookie", f"{AUTH_COOKIE}={auth_token()}; HttpOnly; SameSite=Lax; Path=/")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def clear_auth_cookie(handler: SimpleHTTPRequestHandler) -> None:
    body = json.dumps({"authenticated": False}, ensure_ascii=False).encode("utf-8")
    handler.send_response(HTTPStatus.OK)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Set-Cookie", f"{AUTH_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def read_json(handler: SimpleHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length") or 0)
    if length <= 0:
        return {}
    raw = handler.rfile.read(length)
    return json.loads(raw.decode("utf-8"))


def new_guest_token() -> str:
    return secrets.token_urlsafe(32)


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def parse_time(value: str) -> time:
    return datetime.strptime(value, "%H:%M").time()


def combine(day: date, value: str | time) -> datetime:
    slot_time = parse_time(value) if isinstance(value, str) else value
    return datetime.combine(day, slot_time)


def restaurant_now() -> datetime:
    if RESTAURANT_TZ is None:
        return datetime.now().astimezone().replace(tzinfo=None)
    return datetime.now(RESTAURANT_TZ).replace(tzinfo=None)


def is_future_slot(day: date, slot: str | time) -> bool:
    return combine(day, slot) > restaurant_now()


def is_open_day(day: date) -> bool:
    return day.weekday() in OPEN_DAYS


def closing_time(day: date) -> str:
    return WEDNESDAY_CLOSING_TIME if day.weekday() in {2, 6} else DEFAULT_CLOSING_TIME


def latest_reservation_start(day: date) -> str:
    latest = datetime.combine(day, parse_time(closing_time(day))) - timedelta(minutes=RESERVATION_MINUTES)
    return latest.strftime("%H:%M")


def slot_fits_opening_hours(day: date, slot: str) -> bool:
    start = datetime.combine(day, parse_time(slot))
    close = datetime.combine(day, parse_time(closing_time(day)))
    return start + timedelta(minutes=RESERVATION_MINUTES) <= close


def time_range_slots(start: str, end: str, step_minutes: int) -> list[str]:
    current = datetime.combine(date.today(), parse_time(start))
    last = datetime.combine(date.today(), parse_time(end))
    slots = []
    while current <= last:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=step_minutes)
    return slots


def public_slot_times(day: date) -> list[str]:
    if not is_open_day(day):
        return []
    return [slot for slot in PUBLIC_SLOTS if slot_fits_opening_hours(day, slot)]


def admin_slot_times(day: date) -> list[str]:
    if not is_open_day(day):
        return []
    return time_range_slots(ADMIN_SLOT_START, latest_reservation_start(day), ADMIN_SLOT_INTERVAL_MINUTES)


def bookable_public_slot_times(day: date) -> list[str]:
    return [slot for slot in public_slot_times(day) if is_future_slot(day, slot)]


def bookable_admin_slot_times(day: date, allow_past: bool = False) -> list[str]:
    slots = admin_slot_times(day)
    if allow_past:
        return slots
    return [slot for slot in slots if is_future_slot(day, slot)]


def now_iso() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def is_closed_day(day: date) -> sqlite3.Row | None:
    with connect() as conn:
        return conn.execute("SELECT * FROM closed_days WHERE booking_date = ?", (day.isoformat(),)).fetchone()


def slot_limit(day: date, slot: str) -> int:
    with connect() as conn:
        row = conn.execute(
            "SELECT slot_limit FROM slot_settings WHERE booking_date = ? AND booking_time = ?",
            (day.isoformat(), slot),
        ).fetchone()
    if row is None:
        return DEFAULT_SLOT_LIMIT
    return max(0, int(row["slot_limit"]))


def active_reservation_count(day: date, slot: str, exclude_id: int | None = None) -> int:
    params: list[object] = [day.isoformat(), slot, *ACTIVE_STATUSES]
    exclude_sql = ""
    if exclude_id is not None:
        exclude_sql = " AND id != ?"
        params.append(exclude_id)
    with connect() as conn:
        return int(
            conn.execute(
                f"""
                SELECT COUNT(*) AS count
                FROM reservations
                WHERE booking_date = ?
                  AND booking_time = ?
                  AND status IN ({",".join("?" for _ in ACTIVE_STATUSES)})
                  {exclude_sql}
                """,
                params,
            ).fetchone()["count"]
        )


def availability_for_party(day: date, slot: str, guests: int) -> dict:
    limit = slot_limit(day, slot)
    booked = active_reservation_count(day, slot)
    return {
        "available": booked < limit,
        "limit": limit,
        "booked": booked,
        "remaining": max(0, limit - booked),
        "requiresConfirmation": guests > AUTO_CONFIRM_MAX_GUESTS,
    }


def validate_reservation(
    payload: dict,
    *,
    require_email: bool = True,
    require_phone: bool = True,
    allow_past: bool = False,
    exclude_id: int | None = None,
    admin_booking: bool = False,
    check_capacity: bool = True,
) -> tuple[dict, list[str]]:
    errors: list[str] = []
    cleaned: dict = {}

    try:
        booking_day = parse_date(str(payload.get("date", "")).strip())
        cleaned["booking_date"] = booking_day.isoformat()
    except ValueError:
        errors.append("Bitte ein gültiges Datum auswählen.")
        booking_day = None

    try:
        booking_time = parse_time(str(payload.get("time", "")).strip())
        cleaned["booking_time"] = booking_time.strftime("%H:%M")
    except ValueError:
        errors.append("Bitte eine gültige Uhrzeit auswählen.")
        booking_time = None

    try:
        guests = int(payload.get("guests", 0))
        if guests < 1 or guests > MAX_PARTY_SIZE:
            raise ValueError
        cleaned["guests"] = guests
    except (TypeError, ValueError):
        errors.append(f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.")

    name = str(payload.get("name", "")).strip()
    phone = str(payload.get("phone", "")).strip()
    email = str(payload.get("email", "")).strip()
    note = str(payload.get("note", "")).strip()

    if len(name) < 2:
        errors.append("Bitte einen Namen angeben.")
    if require_phone and len(phone) < 5:
        errors.append("Bitte eine Telefonnummer angeben.")
    if require_email and not email:
        errors.append("Bitte eine E-Mail-Adresse angeben.")
    if email and not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        errors.append("Bitte eine gültige E-Mail-Adresse angeben.")

    cleaned.update({"name": name, "phone": phone, "email": email, "note": note})

    if booking_day and booking_time:
        today = restaurant_now().date()
        if booking_day < today and not allow_past:
            errors.append("Reservierungen in der Vergangenheit sind nicht möglich.")
        if booking_day == today and not allow_past and not is_future_slot(booking_day, booking_time):
            errors.append("Diese Uhrzeit liegt bereits in der Vergangenheit.")
        if not is_open_day(booking_day):
            errors.append("Montag und Dienstag sind Ruhetage.")
        if admin_booking:
            valid_slots = bookable_admin_slot_times(booking_day, allow_past)
        else:
            valid_slots = public_slot_times(booking_day) if allow_past else bookable_public_slot_times(booking_day)
        if booking_time.strftime("%H:%M") not in valid_slots:
            errors.append("Bitte eine verfügbare Uhrzeit auswählen.")
        if is_closed_day(booking_day):
            errors.append("Dieser Tag ist für Reservierungen geschlossen.")

    if check_capacity and booking_day and booking_time and "guests" in cleaned:
        limit = slot_limit(booking_day, cleaned["booking_time"])
        booked = active_reservation_count(booking_day, cleaned["booking_time"], exclude_id)
        if booked >= limit:
            errors.append("Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.")

    return cleaned, errors


def row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "date": row["booking_date"],
        "time": row["booking_time"],
        "guests": row["guests"],
        "name": row["name"],
        "phone": row["phone"],
        "email": row["email"] or "",
        "note": row["note"] or "",
        "status": row["status"],
        "locale": row["locale"] if "locale" in row.keys() else "de",
        "source": row["source"] if "source" in row.keys() else "public",
        "guestToken": row["guest_token"] if "guest_token" in row.keys() else "",
        "manageUrl": guest_manage_url(row),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def guest_manage_url(row: sqlite3.Row) -> str:
    token = row["guest_token"] if "guest_token" in row.keys() else ""
    locale = row["locale"] if "locale" in row.keys() else "de"
    path = f"/{locale}/reservation.html" if locale != "de" else "/reservierung.html"
    return f"{SITE_URL}{path}?token={token}"


def row_locale(row: sqlite3.Row) -> str:
    locale = row["locale"] if "locale" in row.keys() else "de"
    return locale if locale in VALID_LOCALES else "de"


def payload_locale(payload: dict) -> str:
    locale = str(payload.get("locale", "de")).strip().lower()
    return locale if locale in VALID_LOCALES else "de"


EMAIL_COPY = {
    "de": {
        "subject_request": "Anfrage",
        "subject_reservation": "Reservierung",
        "subject_on": "am",
        "subject_at": "um",
        "confirmed_subject": "Kiku Bistro Reservierung bestätigt am {date} um {time}",
        "cancelled_subject": "Kiku Bistro Reservierung storniert am {date} um {time}",
        "pending_intro": "Vielen Dank für Ihre Anfrage. Für Gruppen ab 5 Personen bestätigen wir persönlich.",
        "cancelled_intro": "Ihre Reservierung wurde storniert.",
        "confirmed_intro": "Vielen Dank. Ihre Reservierung ist bestätigt.",
        "pending_status": "Status: Anfrage eingegangen",
        "cancelled_status": "Status: storniert",
        "confirmed_status": "Status: bestätigt",
        "heading": "Ihre Reservierung",
        "manage": "Reservierung ansehen, ändern oder stornieren:",
        "button": "Reservierung ansehen / ändern",
        "date": "Datum",
        "time": "Uhrzeit",
        "time_suffix": " Uhr",
        "guests": "Personen",
        "name": "Name",
        "not_found": "Reservierung nicht gefunden",
        "status_labels": {
            "pending": "Anfrage eingegangen",
            "confirmed": "Bestätigt",
            "seated": "Gast da",
            "cancelled": "Storniert",
            "no_show": "Nicht gekommen",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "Bitte ein gültiges Datum auswählen.",
            "Bitte eine gültige Uhrzeit auswählen.": "Bitte eine gültige Uhrzeit auswählen.",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.",
            "Bitte einen Namen angeben.": "Bitte einen Namen angeben.",
            "Bitte eine Telefonnummer angeben.": "Bitte eine Telefonnummer angeben.",
            "Bitte eine E-Mail-Adresse angeben.": "Bitte eine E-Mail-Adresse angeben.",
            "Bitte eine gültige E-Mail-Adresse angeben.": "Bitte eine gültige E-Mail-Adresse angeben.",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "Reservierungen in der Vergangenheit sind nicht möglich.",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "Diese Uhrzeit liegt bereits in der Vergangenheit.",
            "Montag und Dienstag sind Ruhetage.": "Montag und Dienstag sind Ruhetage.",
            "Bitte eine verfügbare Uhrzeit auswählen.": "Bitte eine verfügbare Uhrzeit auswählen.",
            "Dieser Tag ist für Reservierungen geschlossen.": "Dieser Tag ist für Reservierungen geschlossen.",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.",
        },
    },
    "en": {
        "subject_request": "request",
        "subject_reservation": "reservation",
        "subject_on": "on",
        "subject_at": "at",
        "confirmed_subject": "Kiku Bistro reservation confirmed on {date} at {time}",
        "cancelled_subject": "Kiku Bistro reservation cancelled on {date} at {time}",
        "pending_intro": "Thank you for your request. For groups of 5 or more, we confirm personally.",
        "cancelled_intro": "Your reservation has been cancelled.",
        "confirmed_intro": "Thank you. Your reservation is confirmed.",
        "pending_status": "Status: request received",
        "cancelled_status": "Status: cancelled",
        "confirmed_status": "Status: confirmed",
        "heading": "Your reservation",
        "manage": "View, change or cancel your reservation:",
        "button": "View / change reservation",
        "date": "Date",
        "time": "Time",
        "time_suffix": "",
        "guests": "Guests",
        "name": "Name",
        "not_found": "Reservation not found",
        "status_labels": {
            "pending": "Request received",
            "confirmed": "Confirmed",
            "seated": "Guest seated",
            "cancelled": "Cancelled",
            "no_show": "No-show",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "Please choose a valid date.",
            "Bitte eine gültige Uhrzeit auswählen.": "Please choose a valid time.",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"Please enter 1 to {MAX_PARTY_SIZE} guests.",
            "Bitte einen Namen angeben.": "Please enter a name.",
            "Bitte eine Telefonnummer angeben.": "Please enter a phone number.",
            "Bitte eine E-Mail-Adresse angeben.": "Please enter an e-mail address.",
            "Bitte eine gültige E-Mail-Adresse angeben.": "Please enter a valid e-mail address.",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "Reservations in the past are not possible.",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "This time is already in the past.",
            "Montag und Dienstag sind Ruhetage.": "Monday and Tuesday are rest days.",
            "Bitte eine verfügbare Uhrzeit auswählen.": "Please choose an available time.",
            "Dieser Tag ist für Reservierungen geschlossen.": "This day is closed for reservations.",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "All reservation places for this time are already booked.",
        },
    },
    "fr": {
        "subject_request": "demande",
        "subject_reservation": "réservation",
        "subject_on": "le",
        "subject_at": "à",
        "confirmed_subject": "Réservation Kiku Bistro confirmée le {date} à {time}",
        "cancelled_subject": "Réservation Kiku Bistro annulée le {date} à {time}",
        "pending_intro": "Merci pour votre demande. Pour les groupes de 5 personnes ou plus, nous confirmons personnellement.",
        "cancelled_intro": "Votre réservation a été annulée.",
        "confirmed_intro": "Merci. Votre réservation est confirmée.",
        "pending_status": "Statut : demande reçue",
        "cancelled_status": "Statut : annulée",
        "confirmed_status": "Statut : confirmée",
        "heading": "Votre réservation",
        "manage": "Voir, modifier ou annuler votre réservation :",
        "button": "Voir / modifier la réservation",
        "date": "Date",
        "time": "Heure",
        "time_suffix": "",
        "guests": "Personnes",
        "name": "Nom",
        "not_found": "Réservation introuvable",
        "status_labels": {
            "pending": "Demande reçue",
            "confirmed": "Confirmée",
            "seated": "Client arrivé",
            "cancelled": "Annulée",
            "no_show": "Non venu",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "Veuillez choisir une date valide.",
            "Bitte eine gültige Uhrzeit auswählen.": "Veuillez choisir une heure valide.",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"Veuillez indiquer entre 1 et {MAX_PARTY_SIZE} personnes.",
            "Bitte einen Namen angeben.": "Veuillez indiquer un nom.",
            "Bitte eine Telefonnummer angeben.": "Veuillez indiquer un numéro de téléphone.",
            "Bitte eine E-Mail-Adresse angeben.": "Veuillez indiquer une adresse e-mail.",
            "Bitte eine gültige E-Mail-Adresse angeben.": "Veuillez indiquer une adresse e-mail valide.",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "Les réservations dans le passé ne sont pas possibles.",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "Cette heure est déjà passée.",
            "Montag und Dienstag sind Ruhetage.": "Le lundi et le mardi sont des jours de repos.",
            "Bitte eine verfügbare Uhrzeit auswählen.": "Veuillez choisir une heure disponible.",
            "Dieser Tag ist für Reservierungen geschlossen.": "Ce jour est fermé aux réservations.",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "Tous les créneaux de réservation pour cette heure sont déjà occupés.",
        },
    },
    "nl": {
        "subject_request": "aanvraag",
        "subject_reservation": "reservering",
        "subject_on": "op",
        "subject_at": "om",
        "confirmed_subject": "Kiku Bistro reservering bevestigd op {date} om {time}",
        "cancelled_subject": "Kiku Bistro reservering geannuleerd op {date} om {time}",
        "pending_intro": "Dank u voor uw aanvraag. Voor groepen van 5 personen of meer bevestigen wij persoonlijk.",
        "cancelled_intro": "Uw reservering is geannuleerd.",
        "confirmed_intro": "Dank u. Uw reservering is bevestigd.",
        "pending_status": "Status: aanvraag ontvangen",
        "cancelled_status": "Status: geannuleerd",
        "confirmed_status": "Status: bevestigd",
        "heading": "Uw reservering",
        "manage": "Bekijk, wijzig of annuleer uw reservering:",
        "button": "Reservering bekijken / wijzigen",
        "date": "Datum",
        "time": "Tijd",
        "time_suffix": "",
        "guests": "Personen",
        "name": "Naam",
        "not_found": "Reservering niet gevonden",
        "status_labels": {
            "pending": "Aanvraag ontvangen",
            "confirmed": "Bevestigd",
            "seated": "Gast aanwezig",
            "cancelled": "Geannuleerd",
            "no_show": "Niet gekomen",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "Kies een geldige datum.",
            "Bitte eine gültige Uhrzeit auswählen.": "Kies een geldige tijd.",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"Voer 1 tot {MAX_PARTY_SIZE} personen in.",
            "Bitte einen Namen angeben.": "Voer een naam in.",
            "Bitte eine Telefonnummer angeben.": "Voer een telefoonnummer in.",
            "Bitte eine E-Mail-Adresse angeben.": "Voer een e-mailadres in.",
            "Bitte eine gültige E-Mail-Adresse angeben.": "Voer een geldig e-mailadres in.",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "Reserveringen in het verleden zijn niet mogelijk.",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "Deze tijd is al voorbij.",
            "Montag und Dienstag sind Ruhetage.": "Maandag en dinsdag zijn rustdagen.",
            "Bitte eine verfügbare Uhrzeit auswählen.": "Kies een beschikbare tijd.",
            "Dieser Tag ist für Reservierungen geschlossen.": "Deze dag is gesloten voor reserveringen.",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "Alle reserveringsplaatsen voor deze tijd zijn al bezet.",
        },
    },
    "pl": {
        "subject_request": "zapytanie",
        "subject_reservation": "rezerwacja",
        "subject_on": "dnia",
        "subject_at": "o",
        "confirmed_subject": "Rezerwacja Kiku Bistro potwierdzona dnia {date} o {time}",
        "cancelled_subject": "Rezerwacja Kiku Bistro anulowana dnia {date} o {time}",
        "pending_intro": "Dziękujemy za zapytanie. Dla grup od 5 osób potwierdzamy rezerwację osobiście.",
        "cancelled_intro": "Twoja rezerwacja została anulowana.",
        "confirmed_intro": "Dziękujemy. Twoja rezerwacja jest potwierdzona.",
        "pending_status": "Status: zapytanie przyjęte",
        "cancelled_status": "Status: anulowana",
        "confirmed_status": "Status: potwierdzona",
        "heading": "Twoja rezerwacja",
        "manage": "Zobacz, zmień lub anuluj rezerwację:",
        "button": "Zobacz / zmień rezerwację",
        "date": "Data",
        "time": "Godzina",
        "time_suffix": "",
        "guests": "Osoby",
        "name": "Imię i nazwisko",
        "not_found": "Nie znaleziono rezerwacji",
        "status_labels": {
            "pending": "Zapytanie przyjęte",
            "confirmed": "Potwierdzona",
            "seated": "Gość na miejscu",
            "cancelled": "Anulowana",
            "no_show": "Nie przyszedł",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "Wybierz prawidłową datę.",
            "Bitte eine gültige Uhrzeit auswählen.": "Wybierz prawidłową godzinę.",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"Podaj od 1 do {MAX_PARTY_SIZE} osób.",
            "Bitte einen Namen angeben.": "Podaj imię i nazwisko.",
            "Bitte eine Telefonnummer angeben.": "Podaj numer telefonu.",
            "Bitte eine E-Mail-Adresse angeben.": "Podaj adres e-mail.",
            "Bitte eine gültige E-Mail-Adresse angeben.": "Podaj prawidłowy adres e-mail.",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "Rezerwacje w przeszłości nie są możliwe.",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "Ta godzina już minęła.",
            "Montag und Dienstag sind Ruhetage.": "Poniedziałek i wtorek są dniami wolnymi.",
            "Bitte eine verfügbare Uhrzeit auswählen.": "Wybierz dostępną godzinę.",
            "Dieser Tag ist für Reservierungen geschlossen.": "Tego dnia rezerwacje są zamknięte.",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "Wszystkie miejsca rezerwacyjne na tę godzinę są już zajęte.",
        },
    },
    "cs": {
        "subject_request": "poptávka",
        "subject_reservation": "rezervace",
        "subject_on": "dne",
        "subject_at": "v",
        "confirmed_subject": "Rezervace Kiku Bistro potvrzena dne {date} v {time}",
        "cancelled_subject": "Rezervace Kiku Bistro zrušena dne {date} v {time}",
        "pending_intro": "Děkujeme za vaši poptávku. Skupiny od 5 osob potvrzujeme osobně.",
        "cancelled_intro": "Vaše rezervace byla zrušena.",
        "confirmed_intro": "Děkujeme. Vaše rezervace je potvrzena.",
        "pending_status": "Stav: poptávka přijata",
        "cancelled_status": "Stav: zrušeno",
        "confirmed_status": "Stav: potvrzeno",
        "heading": "Vaše rezervace",
        "manage": "Zobrazit, změnit nebo zrušit rezervaci:",
        "button": "Zobrazit / změnit rezervaci",
        "date": "Datum",
        "time": "Čas",
        "time_suffix": "",
        "guests": "Osoby",
        "name": "Jméno",
        "not_found": "Rezervace nebyla nalezena",
        "status_labels": {
            "pending": "Poptávka přijata",
            "confirmed": "Potvrzeno",
            "seated": "Host dorazil",
            "cancelled": "Zrušeno",
            "no_show": "Nedorazil",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "Vyberte prosím platné datum.",
            "Bitte eine gültige Uhrzeit auswählen.": "Vyberte prosím platný čas.",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"Zadejte prosím 1 až {MAX_PARTY_SIZE} osob.",
            "Bitte einen Namen angeben.": "Zadejte prosím jméno.",
            "Bitte eine Telefonnummer angeben.": "Zadejte prosím telefonní číslo.",
            "Bitte eine E-Mail-Adresse angeben.": "Zadejte prosím e-mailovou adresu.",
            "Bitte eine gültige E-Mail-Adresse angeben.": "Zadejte prosím platnou e-mailovou adresu.",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "Rezervace v minulosti nejsou možné.",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "Tento čas již uplynul.",
            "Montag und Dienstag sind Ruhetage.": "Pondělí a úterý jsou zavírací dny.",
            "Bitte eine verfügbare Uhrzeit auswählen.": "Vyberte prosím dostupný čas.",
            "Dieser Tag ist für Reservierungen geschlossen.": "Tento den je pro rezervace uzavřen.",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "Všechna rezervační místa pro tento čas jsou již obsazena.",
        },
    },
    "it": {
        "subject_request": "richiesta",
        "subject_reservation": "prenotazione",
        "subject_on": "il",
        "subject_at": "alle",
        "confirmed_subject": "Prenotazione Kiku Bistro confermata il {date} alle {time}",
        "cancelled_subject": "Prenotazione Kiku Bistro cancellata il {date} alle {time}",
        "pending_intro": "Grazie per la richiesta. Per gruppi di 5 o più persone confermiamo personalmente.",
        "cancelled_intro": "La tua prenotazione è stata cancellata.",
        "confirmed_intro": "Grazie. La tua prenotazione è confermata.",
        "pending_status": "Stato: richiesta ricevuta",
        "cancelled_status": "Stato: cancellata",
        "confirmed_status": "Stato: confermata",
        "heading": "La tua prenotazione",
        "manage": "Visualizzare, modificare o cancellare la prenotazione:",
        "button": "Visualizza / modifica prenotazione",
        "date": "Data",
        "time": "Ora",
        "time_suffix": "",
        "guests": "Persone",
        "name": "Nome",
        "not_found": "Prenotazione non trovata",
        "status_labels": {
            "pending": "Richiesta ricevuta",
            "confirmed": "Confermata",
            "seated": "Ospite arrivato",
            "cancelled": "Cancellata",
            "no_show": "Non presentato",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "Scegli una data valida.",
            "Bitte eine gültige Uhrzeit auswählen.": "Scegli un orario valido.",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"Inserisci da 1 a {MAX_PARTY_SIZE} persone.",
            "Bitte einen Namen angeben.": "Inserisci un nome.",
            "Bitte eine Telefonnummer angeben.": "Inserisci un numero di telefono.",
            "Bitte eine E-Mail-Adresse angeben.": "Inserisci un indirizzo e-mail.",
            "Bitte eine gültige E-Mail-Adresse angeben.": "Inserisci un indirizzo e-mail valido.",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "Non è possibile prenotare nel passato.",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "Questo orario è già passato.",
            "Montag und Dienstag sind Ruhetage.": "Lunedì e martedì sono giorni di riposo.",
            "Bitte eine verfügbare Uhrzeit auswählen.": "Scegli un orario disponibile.",
            "Dieser Tag ist für Reservierungen geschlossen.": "Questo giorno è chiuso per le prenotazioni.",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "Tutti i posti prenotabili per questo orario sono già occupati.",
        },
    },
    "es": {
        "subject_request": "solicitud",
        "subject_reservation": "reserva",
        "subject_on": "el",
        "subject_at": "a las",
        "confirmed_subject": "Reserva Kiku Bistro confirmada el {date} a las {time}",
        "cancelled_subject": "Reserva Kiku Bistro cancelada el {date} a las {time}",
        "pending_intro": "Gracias por su solicitud. Para grupos de 5 o más personas confirmamos personalmente.",
        "cancelled_intro": "Su reserva ha sido cancelada.",
        "confirmed_intro": "Gracias. Su reserva está confirmada.",
        "pending_status": "Estado: solicitud recibida",
        "cancelled_status": "Estado: cancelada",
        "confirmed_status": "Estado: confirmada",
        "heading": "Su reserva",
        "manage": "Ver, modificar o cancelar su reserva:",
        "button": "Ver / modificar reserva",
        "date": "Fecha",
        "time": "Hora",
        "time_suffix": "",
        "guests": "Personas",
        "name": "Nombre",
        "not_found": "Reserva no encontrada",
        "status_labels": {
            "pending": "Solicitud recibida",
            "confirmed": "Confirmada",
            "seated": "Cliente sentado",
            "cancelled": "Cancelada",
            "no_show": "No presentado",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "Elija una fecha válida.",
            "Bitte eine gültige Uhrzeit auswählen.": "Elija una hora válida.",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"Indique entre 1 y {MAX_PARTY_SIZE} personas.",
            "Bitte einen Namen angeben.": "Indique un nombre.",
            "Bitte eine Telefonnummer angeben.": "Indique un número de teléfono.",
            "Bitte eine E-Mail-Adresse angeben.": "Indique una dirección de e-mail.",
            "Bitte eine gültige E-Mail-Adresse angeben.": "Indique una dirección de e-mail válida.",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "No es posible reservar en el pasado.",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "Esta hora ya ha pasado.",
            "Montag und Dienstag sind Ruhetage.": "Lunes y martes son días de descanso.",
            "Bitte eine verfügbare Uhrzeit auswählen.": "Elija una hora disponible.",
            "Dieser Tag ist für Reservierungen geschlossen.": "Este día está cerrado para reservas.",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "Todas las plazas de reserva para esta hora ya están ocupadas.",
        },
    },
    "pt": {
        "subject_request": "pedido",
        "subject_reservation": "reserva",
        "subject_on": "em",
        "subject_at": "às",
        "confirmed_subject": "Reserva Kiku Bistro confirmada em {date} às {time}",
        "cancelled_subject": "Reserva Kiku Bistro cancelada em {date} às {time}",
        "pending_intro": "Obrigado pelo seu pedido. Para grupos de 5 ou mais pessoas confirmamos pessoalmente.",
        "cancelled_intro": "A sua reserva foi cancelada.",
        "confirmed_intro": "Obrigado. A sua reserva está confirmada.",
        "pending_status": "Estado: pedido recebido",
        "cancelled_status": "Estado: cancelada",
        "confirmed_status": "Estado: confirmada",
        "heading": "A sua reserva",
        "manage": "Ver, alterar ou cancelar a sua reserva:",
        "button": "Ver / alterar reserva",
        "date": "Data",
        "time": "Hora",
        "time_suffix": "",
        "guests": "Pessoas",
        "name": "Nome",
        "not_found": "Reserva não encontrada",
        "status_labels": {
            "pending": "Pedido recebido",
            "confirmed": "Confirmada",
            "seated": "Cliente sentado",
            "cancelled": "Cancelada",
            "no_show": "Não compareceu",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "Escolha uma data válida.",
            "Bitte eine gültige Uhrzeit auswählen.": "Escolha uma hora válida.",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"Indique entre 1 e {MAX_PARTY_SIZE} pessoas.",
            "Bitte einen Namen angeben.": "Indique um nome.",
            "Bitte eine Telefonnummer angeben.": "Indique um número de telefone.",
            "Bitte eine E-Mail-Adresse angeben.": "Indique um endereço de e-mail.",
            "Bitte eine gültige E-Mail-Adresse angeben.": "Indique um endereço de e-mail válido.",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "Não é possível fazer reservas no passado.",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "Esta hora já passou.",
            "Montag und Dienstag sind Ruhetage.": "Segunda e terça são dias de descanso.",
            "Bitte eine verfügbare Uhrzeit auswählen.": "Escolha uma hora disponível.",
            "Dieser Tag ist für Reservierungen geschlossen.": "Este dia está fechado para reservas.",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "Todos os lugares de reserva para esta hora já estão ocupados.",
        },
    },
    "ja": {
        "subject_request": "リクエスト",
        "subject_reservation": "予約",
        "subject_on": "",
        "subject_at": "",
        "confirmed_subject": "Kiku Bistroの予約が確定しました {date} {time}",
        "cancelled_subject": "Kiku Bistroの予約がキャンセルされました {date} {time}",
        "pending_intro": "リクエストありがとうございます。5名様以上の場合は、こちらから個別に確認いたします。",
        "cancelled_intro": "ご予約はキャンセルされました。",
        "confirmed_intro": "ありがとうございます。ご予約は確定しました。",
        "pending_status": "ステータス: リクエスト受付済み",
        "cancelled_status": "ステータス: キャンセル済み",
        "confirmed_status": "ステータス: 確定",
        "heading": "ご予約",
        "manage": "予約の確認、変更、キャンセル:",
        "button": "予約を確認 / 変更",
        "date": "日付",
        "time": "時間",
        "time_suffix": "",
        "guests": "人数",
        "name": "お名前",
        "not_found": "予約が見つかりません",
        "status_labels": {
            "pending": "リクエスト受付済み",
            "confirmed": "確定",
            "seated": "来店済み",
            "cancelled": "キャンセル済み",
            "no_show": "無断キャンセル",
        },
        "errors": {
            "Bitte ein gültiges Datum auswählen.": "有効な日付を選択してください。",
            "Bitte eine gültige Uhrzeit auswählen.": "有効な時間を選択してください。",
            f"Bitte 1 bis {MAX_PARTY_SIZE} Personen angeben.": f"1名から{MAX_PARTY_SIZE}名までで入力してください。",
            "Bitte einen Namen angeben.": "お名前を入力してください。",
            "Bitte eine Telefonnummer angeben.": "電話番号を入力してください。",
            "Bitte eine E-Mail-Adresse angeben.": "メールアドレスを入力してください。",
            "Bitte eine gültige E-Mail-Adresse angeben.": "有効なメールアドレスを入力してください。",
            "Reservierungen in der Vergangenheit sind nicht möglich.": "過去の日付では予約できません。",
            "Diese Uhrzeit liegt bereits in der Vergangenheit.": "この時間はすでに過ぎています。",
            "Montag und Dienstag sind Ruhetage.": "月曜日と火曜日は定休日です。",
            "Bitte eine verfügbare Uhrzeit auswählen.": "利用可能な時間を選択してください。",
            "Dieser Tag ist für Reservierungen geschlossen.": "この日は予約を受け付けていません。",
            "Für diese Uhrzeit sind bereits alle Reservierungsplätze belegt.": "この時間の予約枠はすべて埋まっています。",
        },
    },
}


def locale_copy(locale: str) -> dict:
    return EMAIL_COPY.get(locale, EMAIL_COPY["de"])


def localize_errors(errors: list[str], locale: str) -> list[str]:
    translations = locale_copy(locale)["errors"]
    return [translations.get(error, error) for error in errors]


def notification_subject(row: sqlite3.Row) -> str:
    copy = locale_copy(row_locale(row))
    kind = copy["subject_request"] if row["status"] == "pending" else copy["subject_reservation"]
    return f"Kiku Bistro {kind} {copy['subject_on']} {row['booking_date']} {copy['subject_at']} {row['booking_time']}"


def status_label(status: str) -> str:
    return locale_copy("de")["status_labels"].get(status, status)


def status_label_en(status: str) -> str:
    return locale_copy("en")["status_labels"].get(status, status)


def status_label_locale(status: str, locale: str) -> str:
    return locale_copy(locale)["status_labels"].get(status, status)


def guest_message(row: sqlite3.Row) -> str:
    copy = locale_copy(row_locale(row))
    if row["status"] == "pending":
        intro = copy["pending_intro"]
        status = copy["pending_status"]
    elif row["status"] == "cancelled":
        intro = copy["cancelled_intro"]
        status = copy["cancelled_status"]
    else:
        intro = copy["confirmed_intro"]
        status = copy["confirmed_status"]
    return (
        f"{intro}\n\n"
        f"{status}\n"
        f"{copy['date']}: {row['booking_date']}\n"
        f"{copy['time']}: {row['booking_time']}{copy['time_suffix']}\n"
        f"{copy['guests']}: {row['guests']}\n"
        f"{copy['name']}: {row['name']}\n\n"
        f"{copy['manage']}\n{guest_manage_url(row)}\n\n"
        "Kiku Bistro\nSteinbrücke 2\n06484 Quedlinburg\n"
    )


def guest_message_html(row: sqlite3.Row) -> str:
    locale = row_locale(row)
    copy = locale_copy(locale)
    if row["status"] == "pending":
        intro = copy["pending_intro"]
    elif row["status"] == "cancelled":
        intro = copy["cancelled_intro"]
    else:
        intro = copy["confirmed_intro"]
    heading = copy["heading"]
    status_value = status_label_locale(row["status"], locale)
    labels = {
        "status": "Status",
        "date": copy["date"],
        "time": copy["time"],
        "guests": copy["guests"],
        "name": copy["name"],
        "button": copy["button"],
    }
    manage_url = guest_manage_url(row)
    safe_date = escape(str(row["booking_date"] or ""))
    safe_time = escape(f"{row['booking_time'] or ''}{copy['time_suffix']}")
    safe_guests = escape(str(row["guests"] or ""))
    safe_name = escape(str(row["name"] or ""))
    return f"""<!doctype html>
<html>
  <body style="margin:0;background:#eef3e6;font-family:Arial,sans-serif;color:#22352b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3e6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffdf8;border:1px solid #d7dfd0;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 16px;">
                <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#486356;">Kiku Bistro</div>
                <h1 style="margin:8px 0 10px;font-family:Georgia,serif;font-size:32px;line-height:1;color:#244235;">{escape(heading)}</h1>
                <p style="margin:0;color:#5a6c61;font-size:16px;line-height:1.5;">{escape(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #d7dfd0;border-bottom:1px solid #d7dfd0;">
                  <tr><td style="padding:12px 0;color:#5a6c61;">{escape(labels["status"])}</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{escape(status_value)}</td></tr>
                  <tr><td style="padding:12px 0;color:#5a6c61;">{escape(labels["date"])}</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{safe_date}</td></tr>
                  <tr><td style="padding:12px 0;color:#5a6c61;">{escape(labels["time"])}</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{safe_time}</td></tr>
                  <tr><td style="padding:12px 0;color:#5a6c61;">{escape(labels["guests"])}</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{safe_guests}</td></tr>
                  <tr><td style="padding:12px 0;color:#5a6c61;">{escape(labels["name"])}</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{safe_name}</td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <a href="{escape(manage_url)}" style="display:inline-block;background:#244235;color:#fffdf8;text-decoration:none;border-radius:8px;padding:13px 18px;font-weight:bold;">{escape(labels["button"])}</a>
                <p style="margin:18px 0 0;color:#5a6c61;font-size:14px;line-height:1.5;">Kiku Bistro<br>Steinbrücke 2<br>06484 Quedlinburg</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""

def restaurant_message(row: sqlite3.Row) -> str:
    return (
        "Neue Reservierung / Anfrage\n\n"
        f"Status: {row['status']}\n"
        f"Datum: {row['booking_date']}\n"
        f"Uhrzeit: {row['booking_time']} Uhr\n"
        f"Personen: {row['guests']}\n"
        f"Name: {row['name']}\n"
        f"Telefon: {row['phone']}\n"
        f"E-Mail: {row['email']}\n"
        f"Notiz: {row['note'] or '-'}\n"
        f"Sprache: {row_locale(row)}\n"
    )


def status_subject(row: sqlite3.Row) -> str:
    copy = locale_copy(row_locale(row))
    if row["status"] == "confirmed":
        return copy["confirmed_subject"].format(date=row["booking_date"], time=row["booking_time"])
    if row["status"] == "cancelled":
        return copy["cancelled_subject"].format(date=row["booking_date"], time=row["booking_time"])
    return notification_subject(row)


def send_email(to_address: str, subject: str, body: str, html_body: str | None = None) -> bool:
    if not to_address:
        return False
    host = os.environ.get("KIKU_SMTP_HOST")
    if not host:
        print(f"Email skipped, KIKU_SMTP_HOST is not set. To: {to_address}, subject: {subject}")
        return False

    port = int(os.environ.get("KIKU_SMTP_PORT", "587"))
    security = os.environ.get("KIKU_SMTP_SECURITY", "ssl" if port == 465 else "starttls").lower()
    username = os.environ.get("KIKU_SMTP_USER")
    password = os.environ.get("KIKU_SMTP_PASSWORD")
    from_address = os.environ.get("KIKU_SMTP_FROM", username or RESTAURANT_EMAIL)

    message = EmailMessage()
    message["From"] = from_address
    message["To"] = to_address
    message["Subject"] = subject
    message.set_content(body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    smtp_class = smtplib.SMTP_SSL if security in {"ssl", "tls", "ssl/tls"} else smtplib.SMTP
    with smtp_class(host, port, timeout=12) as smtp:
        if security == "starttls":
            smtp.starttls()
        if username and password:
            smtp.login(username, password)
        smtp.send_message(message)
    return True


def send_reservation_notifications(row: sqlite3.Row) -> dict:
    results = {"guest": False, "restaurant": False}
    try:
        results["guest"] = send_email(row["email"], notification_subject(row), guest_message(row), guest_message_html(row))
    except Exception as exc:
        print(f"Guest email failed: {exc}")
    try:
        results["restaurant"] = send_email(RESTAURANT_EMAIL, notification_subject(row), restaurant_message(row))
    except Exception as exc:
        print(f"Restaurant email failed: {exc}")
    return results


def send_status_notification(row: sqlite3.Row) -> bool:
    try:
        return send_email(row["email"], status_subject(row), guest_message(row), guest_message_html(row))
    except Exception as exc:
        print(f"Status email failed: {exc}")
        return False


def reservation_by_id(reservation_id: int) -> sqlite3.Row | None:
    with connect() as conn:
        return conn.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,)).fetchone()


def reservation_by_token(token: str) -> sqlite3.Row | None:
    if not token:
        return None
    with connect() as conn:
        return conn.execute("SELECT * FROM reservations WHERE guest_token = ?", (token,)).fetchone()


class KikuHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            json_response(self, HTTPStatus.OK, {"ok": True})
            return
        if parsed.path == "/api/admin/session":
            json_response(self, HTTPStatus.OK, {"authenticated": is_admin_authenticated(self)})
            return
        if parsed.path == "/api/availability":
            self.handle_availability(parsed.query)
            return
        if parsed.path == "/api/guest/reservation":
            self.handle_guest_reservation(parsed.query)
            return
        if parsed.path == "/api/admin/settings":
            if not require_admin(self):
                return
            self.handle_admin_settings(parsed.query)
            return
        if parsed.path == "/api/reservations":
            if not require_admin(self):
                return
            self.handle_reservations(parsed.query)
            return
        if parsed.path == "/api/reservations.csv":
            if not require_admin(self):
                return
            self.handle_reservations_csv(parsed.query)
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/admin/login":
            self.handle_admin_login()
            return
        if parsed.path == "/api/admin/logout":
            clear_auth_cookie(self)
            return
        if parsed.path == "/api/reservations":
            self.handle_create_reservation()
            return
        if parsed.path == "/api/admin/reservations":
            if not require_admin(self):
                return
            self.handle_admin_create_reservation()
            return
        match = re.match(r"^/api/reservations/(\d+)/email$", parsed.path)
        if match:
            if not require_admin(self):
                return
            self.handle_resend_email(int(match.group(1)))
            return
        json_response(self, HTTPStatus.NOT_FOUND, {"error": "Not found"})

    def do_PATCH(self) -> None:
        parsed = urlparse(self.path)
        match = re.match(r"^/api/reservations/(\d+)$", parsed.path)
        if match:
            if not require_admin(self):
                return
            self.handle_update_reservation(int(match.group(1)))
            return
        if parsed.path == "/api/admin/settings":
            if not require_admin(self):
                return
            self.handle_update_admin_settings()
            return
        if parsed.path == "/api/guest/reservation":
            self.handle_guest_update_reservation(parsed.query)
            return
        json_response(self, HTTPStatus.NOT_FOUND, {"error": "Not found"})

    def handle_admin_login(self) -> None:
        try:
            payload = read_json(self)
        except json.JSONDecodeError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid JSON"]})
            return

        if hmac.compare_digest(str(payload.get("password", "")), ADMIN_PASSWORD):
            set_auth_cookie(self)
            return
        json_response(self, HTTPStatus.UNAUTHORIZED, {"authenticated": False, "errors": ["Wrong password"]})

    def date_range_from_query(self, query: str) -> tuple[date, int] | None:
        params = parse_qs(query)
        raw_start = (params.get("start") or params.get("date") or [restaurant_now().date().isoformat()])[0]
        try:
            start = parse_date(raw_start)
        except ValueError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid date"]})
            return None
        try:
            days = int((params.get("days") or ["1"])[0])
        except ValueError:
            days = 1
        return start, min(max(days, 1), 14)

    def handle_admin_settings(self, query: str) -> None:
        parsed_range = self.date_range_from_query(query)
        if parsed_range is None:
            return
        start, days = parsed_range
        dates = [(start + timedelta(days=offset)).isoformat() for offset in range(days)]
        placeholders = ",".join("?" for _ in dates)
        with connect() as conn:
            closed = conn.execute(
                f"SELECT * FROM closed_days WHERE booking_date IN ({placeholders}) ORDER BY booking_date",
                dates,
            ).fetchall()
            settings = conn.execute(
                f"SELECT * FROM slot_settings WHERE booking_date IN ({placeholders}) ORDER BY booking_date, booking_time",
                dates,
            ).fetchall()
        json_response(
            self,
            HTTPStatus.OK,
            {
                "defaultSlotLimit": DEFAULT_SLOT_LIMIT,
                "slots": admin_slot_times(start),
                "publicSlots": public_slot_times(start),
                "closedDays": {row["booking_date"]: row["reason"] or "" for row in closed},
                "slotSettings": {
                    f"{row['booking_date']}|{row['booking_time']}": row["slot_limit"] for row in settings
                },
            },
        )

    def handle_update_admin_settings(self) -> None:
        try:
            payload = read_json(self)
        except json.JSONDecodeError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid JSON"]})
            return
        action = str(payload.get("action", "")).strip()
        timestamp = now_iso()
        try:
            day = parse_date(str(payload.get("date", "")).strip())
        except ValueError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid date"]})
            return

        with connect() as conn:
            if action == "close_day":
                reason = str(payload.get("reason", "")).strip()
                conn.execute(
                    """
                    INSERT INTO closed_days (booking_date, reason, created_at, updated_at)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(booking_date) DO UPDATE SET reason = excluded.reason, updated_at = excluded.updated_at
                    """,
                    (day.isoformat(), reason, timestamp, timestamp),
                )
            elif action == "open_day":
                conn.execute("DELETE FROM closed_days WHERE booking_date = ?", (day.isoformat(),))
            elif action == "set_slot_limit":
                slot = parse_time(str(payload.get("time", "")).strip()).strftime("%H:%M")
                if slot not in admin_slot_times(day):
                    json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid slot"]})
                    return
                limit = max(0, int(payload.get("limit", DEFAULT_SLOT_LIMIT)))
                conn.execute(
                    """
                    INSERT INTO slot_settings (booking_date, booking_time, slot_limit, updated_at)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(booking_date, booking_time)
                    DO UPDATE SET slot_limit = excluded.slot_limit, updated_at = excluded.updated_at
                    """,
                    (day.isoformat(), slot, limit, timestamp),
                )
            else:
                json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid action"]})
                return
        json_response(self, HTTPStatus.OK, {"ok": True})

    def handle_availability(self, query: str) -> None:
        params = parse_qs(query)
        raw_date = (params.get("date") or [""])[0]
        try:
            day = parse_date(raw_date)
        except ValueError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid date"]})
            return

        try:
            guests = int((params.get("guests") or ["2"])[0])
        except ValueError:
            guests = 2

        closed = is_closed_day(day)
        slots = []
        if closed is None:
            for slot in bookable_public_slot_times(day):
                availability = availability_for_party(day, slot, guests)
                slots.append({"time": slot, "capacity": availability["limit"], **availability})

        json_response(
            self,
            HTTPStatus.OK,
            {
                "date": day.isoformat(),
                "open": is_open_day(day) and closed is None,
                "closed": closed is not None,
                "closedReason": closed["reason"] if closed is not None else "",
                "durationMinutes": RESERVATION_MINUTES,
                "maxPartySize": MAX_PARTY_SIZE,
                "autoConfirmMaxGuests": AUTO_CONFIRM_MAX_GUESTS,
                "defaultSlotLimit": DEFAULT_SLOT_LIMIT,
                "slots": slots,
            },
        )

    def handle_reservations(self, query: str) -> None:
        parsed_range = self.date_range_from_query(query)
        if parsed_range is None:
            return
        start, days = parsed_range
        end = start + timedelta(days=days - 1)

        with connect() as conn:
            rows = conn.execute(
                """
                SELECT *
                FROM reservations
                WHERE booking_date BETWEEN ? AND ?
                ORDER BY booking_date ASC, booking_time ASC, created_at ASC
                """,
                (start.isoformat(), end.isoformat()),
            ).fetchall()
        json_response(self, HTTPStatus.OK, {"reservations": [row_to_dict(row) for row in rows]})

    def handle_reservations_csv(self, query: str) -> None:
        params = parse_qs(query)
        selected_date = (params.get("date") or [restaurant_now().date().isoformat()])[0]
        try:
            parse_date(selected_date)
        except ValueError:
            text_response(self, HTTPStatus.BAD_REQUEST, "Invalid date", "text/plain")
            return

        with connect() as conn:
            rows = conn.execute(
                """
                SELECT booking_date, booking_time, guests, name, phone, email, note, status, created_at
                FROM reservations
                WHERE booking_date = ?
                ORDER BY booking_time ASC, created_at ASC
                """,
                (selected_date,),
            ).fetchall()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["date", "time", "guests", "name", "phone", "email", "note", "status", "created_at"])
        writer.writerows([tuple(row) for row in rows])
        text_response(self, HTTPStatus.OK, output.getvalue(), "text/csv")

    def handle_create_reservation(self) -> None:
        try:
            payload = read_json(self)
        except json.JSONDecodeError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid JSON"]})
            return

        locale = payload_locale(payload)
        cleaned, errors = validate_reservation(payload)
        if errors:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": localize_errors(errors, locale)})
            return

        now = now_iso()
        status = "confirmed" if cleaned["guests"] <= AUTO_CONFIRM_MAX_GUESTS else "pending"
        with connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO reservations
                  (booking_date, booking_time, guests, name, phone, email, note, locale, status, guest_token, source, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    cleaned["booking_date"],
                    cleaned["booking_time"],
                    cleaned["guests"],
                    cleaned["name"],
                    cleaned["phone"],
                    cleaned["email"],
                    cleaned["note"],
                    locale,
                    status,
                    new_guest_token(),
                    "public",
                    now,
                    now,
                ),
            )
            row = conn.execute("SELECT * FROM reservations WHERE id = ?", (cursor.lastrowid,)).fetchone()

        email_results = send_reservation_notifications(row)
        json_response(self, HTTPStatus.CREATED, {"reservation": row_to_dict(row), "email": email_results})

    def handle_admin_create_reservation(self) -> None:
        try:
            payload = read_json(self)
        except json.JSONDecodeError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid JSON"]})
            return

        cleaned, errors = validate_reservation(
            payload,
            require_email=False,
            require_phone=False,
            allow_past=True,
            admin_booking=True,
        )
        if errors:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": errors})
            return

        status = str(payload.get("status") or ("confirmed" if cleaned["guests"] <= AUTO_CONFIRM_MAX_GUESTS else "pending"))
        if status not in VALID_STATUSES:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid status"]})
            return
        timestamp = now_iso()
        locale = payload_locale(payload)
        with connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO reservations
                  (booking_date, booking_time, guests, name, phone, email, note, locale, status, guest_token, source, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    cleaned["booking_date"],
                    cleaned["booking_time"],
                    cleaned["guests"],
                    cleaned["name"],
                    cleaned["phone"],
                    cleaned["email"],
                    cleaned["note"],
                    locale,
                    status,
                    new_guest_token(),
                    "admin",
                    timestamp,
                    timestamp,
                ),
            )
            row = conn.execute("SELECT * FROM reservations WHERE id = ?", (cursor.lastrowid,)).fetchone()

        email_results = {"guest": False, "restaurant": False}
        if payload.get("notifyGuest"):
            email_results["guest"] = send_status_notification(row)
        if payload.get("notifyRestaurant", True):
            try:
                email_results["restaurant"] = send_email(RESTAURANT_EMAIL, notification_subject(row), restaurant_message(row))
            except Exception as exc:
                print(f"Restaurant email failed: {exc}")
        json_response(self, HTTPStatus.CREATED, {"reservation": row_to_dict(row), "email": email_results})

    def handle_update_reservation(self, reservation_id: int) -> None:
        try:
            payload = read_json(self)
        except json.JSONDecodeError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid JSON"]})
            return

        reservation_fields = {"date", "time", "guests", "name", "phone", "email"}
        has_details = any(field in payload for field in reservation_fields)
        has_status = "status" in payload
        has_note = "note" in payload
        if not has_details and not has_status and not has_note:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["No changes provided"]})
            return

        status = str(payload.get("status", "")).strip()
        if has_status and status not in VALID_STATUSES:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid status"]})
            return

        notify_guest = bool(payload.get("notifyGuest", True))
        timestamp = now_iso()
        with connect() as conn:
            old_row = conn.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,)).fetchone()
            if old_row is None:
                json_response(self, HTTPStatus.NOT_FOUND, {"errors": ["Reservation not found"]})
                return

            if has_details:
                merged = {
                    "date": payload.get("date", old_row["booking_date"]),
                    "time": payload.get("time", old_row["booking_time"]),
                    "guests": payload.get("guests", old_row["guests"]),
                    "name": payload.get("name", old_row["name"]),
                    "phone": payload.get("phone", old_row["phone"]),
                    "email": payload.get("email", old_row["email"]),
                    "note": payload.get("note", old_row["note"] or ""),
                }
                cleaned, errors = validate_reservation(
                    merged,
                    require_email=False,
                    require_phone=False,
                    allow_past=True,
                    exclude_id=reservation_id,
                    admin_booking=True,
                    check_capacity=False,
                )
                if errors:
                    json_response(self, HTTPStatus.BAD_REQUEST, {"errors": errors})
                    return
            else:
                cleaned = {
                    "booking_date": old_row["booking_date"],
                    "booking_time": old_row["booking_time"],
                    "guests": old_row["guests"],
                    "name": old_row["name"],
                    "phone": old_row["phone"],
                    "email": old_row["email"],
                    "note": str(payload.get("note", old_row["note"] or "")).strip(),
                }

            next_status = status if has_status else old_row["status"]
            next_note = cleaned["note"] if (has_details or has_note) else (old_row["note"] or "")
            if next_status in ACTIVE_STATUSES:
                booked = active_reservation_count(parse_date(cleaned["booking_date"]), cleaned["booking_time"], reservation_id)
                limit = slot_limit(parse_date(cleaned["booking_date"]), cleaned["booking_time"])
                if booked >= limit:
                    json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Dieser Slot ist bereits voll."]})
                    return
            conn.execute(
                """
                UPDATE reservations
                SET booking_date = ?, booking_time = ?, guests = ?, name = ?, phone = ?,
                    email = ?, note = ?, status = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    cleaned["booking_date"],
                    cleaned["booking_time"],
                    cleaned["guests"],
                    cleaned["name"],
                    cleaned["phone"],
                    cleaned["email"],
                    next_note,
                    next_status,
                    timestamp,
                    reservation_id,
                ),
            )
            row = conn.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,)).fetchone()

        if row is None:
            json_response(self, HTTPStatus.NOT_FOUND, {"errors": ["Reservation not found"]})
            return

        email_sent = False
        if notify_guest and row["email"] and (
            has_details or (has_status and old_row is not None and old_row["status"] != row["status"])
        ):
            email_sent = send_status_notification(row)
        json_response(self, HTTPStatus.OK, {"reservation": row_to_dict(row), "email": {"guest": email_sent}})

    def handle_resend_email(self, reservation_id: int) -> None:
        row = reservation_by_id(reservation_id)
        if row is None:
            json_response(self, HTTPStatus.NOT_FOUND, {"errors": ["Reservation not found"]})
            return
        sent = send_status_notification(row)
        json_response(self, HTTPStatus.OK, {"email": {"guest": sent}})

    def handle_guest_reservation(self, query: str) -> None:
        params = parse_qs(query)
        token = (params.get("token") or [""])[0]
        requested_locale = (params.get("locale") or ["de"])[0]
        row = reservation_by_token(token)
        if row is None:
            message = locale_copy(requested_locale if requested_locale in VALID_LOCALES else "de")["not_found"]
            json_response(self, HTTPStatus.NOT_FOUND, {"errors": [message]})
            return
        data = row_to_dict(row)
        data.pop("guestToken", None)
        json_response(self, HTTPStatus.OK, {"reservation": data})

    def handle_guest_update_reservation(self, query: str) -> None:
        params = parse_qs(query)
        token = (params.get("token") or [""])[0]
        requested_locale = (params.get("locale") or ["de"])[0]
        row = reservation_by_token(token)
        if row is None:
            message = locale_copy(requested_locale if requested_locale in VALID_LOCALES else "de")["not_found"]
            json_response(self, HTTPStatus.NOT_FOUND, {"errors": [message]})
            return
        try:
            payload = read_json(self)
        except json.JSONDecodeError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid JSON"]})
            return
        action = str(payload.get("action", "")).strip()
        timestamp = now_iso()
        if action == "cancel":
            with connect() as conn:
                conn.execute("UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?", ("cancelled", timestamp, row["id"]))
                updated = conn.execute("SELECT * FROM reservations WHERE id = ?", (row["id"],)).fetchone()
            send_status_notification(updated)
            json_response(self, HTTPStatus.OK, {"reservation": row_to_dict(updated)})
            return
        if action == "change":
            merged = {
                "date": payload.get("date", row["booking_date"]),
                "time": payload.get("time", row["booking_time"]),
                "guests": payload.get("guests", row["guests"]),
                "name": row["name"],
                "phone": row["phone"],
                "email": row["email"],
                "note": str(payload.get("note", row["note"] or "")).strip(),
            }
            cleaned, errors = validate_reservation(merged, require_email=True, exclude_id=row["id"])
            if errors:
                json_response(self, HTTPStatus.BAD_REQUEST, {"errors": localize_errors(errors, row_locale(row))})
                return
            new_status = "confirmed" if cleaned["guests"] <= AUTO_CONFIRM_MAX_GUESTS else "pending"
            with connect() as conn:
                conn.execute(
                    """
                    UPDATE reservations
                    SET booking_date = ?, booking_time = ?, guests = ?, note = ?, status = ?, updated_at = ?
                    WHERE id = ?
                    """,
                    (
                        cleaned["booking_date"],
                        cleaned["booking_time"],
                        cleaned["guests"],
                        cleaned["note"],
                        new_status,
                        timestamp,
                        row["id"],
                    ),
                )
                updated = conn.execute("SELECT * FROM reservations WHERE id = ?", (row["id"],)).fetchone()
            send_reservation_notifications(updated)
            json_response(self, HTTPStatus.OK, {"reservation": row_to_dict(updated)})
            return
        json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid action"]})


def main() -> None:
    init_db()
    host = os.environ.get("KIKU_HOST", "127.0.0.1")
    port = int(os.environ.get("KIKU_PORT", "8080"))
    server = ThreadingHTTPServer((host, port), KikuHandler)
    print(f"Kiku Bistro server:      http://{host}:{port}/")
    print(f"Reservations admin:      http://{host}:{port}/admin.html")
    print(f"SQLite database:         {DB_PATH}")
    print("Admin password:          KIKU_ADMIN_PASSWORD or default 'kiku-local'")
    server.serve_forever()


if __name__ == "__main__":
    main()
