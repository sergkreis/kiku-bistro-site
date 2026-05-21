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
ADMIN_SLOT_END = "18:00"
ADMIN_SLOT_INTERVAL_MINUTES = 15
RESERVATION_MINUTES = 120
DEFAULT_SLOT_LIMIT = 3
MAX_PARTY_SIZE = 12
AUTO_CONFIRM_MAX_GUESTS = 4
ACTIVE_STATUSES = {"pending", "confirmed", "seated"}
VALID_STATUSES = {"pending", "confirmed", "seated", "cancelled", "no_show"}
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
    return PUBLIC_SLOTS.copy()


def admin_slot_times(day: date) -> list[str]:
    if not is_open_day(day):
        return []
    return time_range_slots(ADMIN_SLOT_START, ADMIN_SLOT_END, ADMIN_SLOT_INTERVAL_MINUTES)


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

    if booking_day and booking_time and "guests" in cleaned:
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
        "source": row["source"] if "source" in row.keys() else "public",
        "guestToken": row["guest_token"] if "guest_token" in row.keys() else "",
        "manageUrl": guest_manage_url(row),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def guest_manage_url(row: sqlite3.Row) -> str:
    token = row["guest_token"] if "guest_token" in row.keys() else ""
    return f"{SITE_URL}/reservierung.html?token={token}"


def notification_subject(row: sqlite3.Row) -> str:
    status = "Anfrage" if row["status"] == "pending" else "Reservierung"
    return f"Kiku Bistro {status} am {row['booking_date']} um {row['booking_time']}"


def status_label(status: str) -> str:
    return {
        "pending": "Anfrage eingegangen",
        "confirmed": "Bestätigt",
        "seated": "Gast da",
        "cancelled": "Storniert",
        "no_show": "Nicht gekommen",
    }.get(status, status)


def guest_message(row: sqlite3.Row) -> str:
    if row["status"] == "pending":
        intro = "Vielen Dank für Ihre Anfrage. Für Gruppen ab 5 Personen bestätigen wir persönlich."
        status = "Status: Anfrage eingegangen"
    elif row["status"] == "cancelled":
        intro = "Ihre Reservierung wurde storniert."
        status = "Status: storniert"
    else:
        intro = "Vielen Dank. Ihre Reservierung ist bestätigt."
        status = "Status: bestätigt"
    return (
        f"{intro}\n\n"
        f"{status}\n"
        f"Datum: {row['booking_date']}\n"
        f"Uhrzeit: {row['booking_time']} Uhr\n"
        f"Personen: {row['guests']}\n"
        f"Name: {row['name']}\n\n"
        f"Reservierung ansehen, ändern oder stornieren:\n{guest_manage_url(row)}\n\n"
        "Kiku Bistro\nSteinbrücke 2\n06484 Quedlinburg\n"
    )


def guest_message_html(row: sqlite3.Row) -> str:
    intro = {
        "pending": "Vielen Dank für Ihre Anfrage. Wir bestätigen Gruppen ab 5 Personen persönlich.",
        "cancelled": "Ihre Reservierung wurde storniert.",
    }.get(row["status"], "Vielen Dank. Ihre Reservierung ist bestätigt.")
    manage_url = guest_manage_url(row)
    safe_date = escape(str(row["booking_date"] or ""))
    safe_time = escape(str(row["booking_time"] or ""))
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
                <h1 style="margin:8px 0 10px;font-family:Georgia,serif;font-size:32px;line-height:1;color:#244235;">Ihre Reservierung</h1>
                <p style="margin:0;color:#5a6c61;font-size:16px;line-height:1.5;">{escape(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #d7dfd0;border-bottom:1px solid #d7dfd0;">
                  <tr><td style="padding:12px 0;color:#5a6c61;">Status</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{escape(status_label(row["status"]))}</td></tr>
                  <tr><td style="padding:12px 0;color:#5a6c61;">Datum</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{safe_date}</td></tr>
                  <tr><td style="padding:12px 0;color:#5a6c61;">Uhrzeit</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{safe_time} Uhr</td></tr>
                  <tr><td style="padding:12px 0;color:#5a6c61;">Personen</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{safe_guests}</td></tr>
                  <tr><td style="padding:12px 0;color:#5a6c61;">Name</td><td align="right" style="padding:12px 0;font-weight:bold;color:#244235;">{safe_name}</td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <a href="{escape(manage_url)}" style="display:inline-block;background:#244235;color:#fffdf8;text-decoration:none;border-radius:8px;padding:13px 18px;font-weight:bold;">Reservierung ansehen / ändern</a>
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
    )


def status_subject(row: sqlite3.Row) -> str:
    if row["status"] == "confirmed":
        return f"Kiku Bistro Reservierung bestätigt am {row['booking_date']} um {row['booking_time']}"
    if row["status"] == "cancelled":
        return f"Kiku Bistro Reservierung storniert am {row['booking_date']} um {row['booking_time']}"
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
                "publicSlots": PUBLIC_SLOTS,
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

        cleaned, errors = validate_reservation(payload)
        if errors:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": errors})
            return

        now = now_iso()
        status = "confirmed" if cleaned["guests"] <= AUTO_CONFIRM_MAX_GUESTS else "pending"
        with connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO reservations
                  (booking_date, booking_time, guests, name, phone, email, note, status, guest_token, source, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    cleaned["booking_date"],
                    cleaned["booking_time"],
                    cleaned["guests"],
                    cleaned["name"],
                    cleaned["phone"],
                    cleaned["email"],
                    cleaned["note"],
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
        with connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO reservations
                  (booking_date, booking_time, guests, name, phone, email, note, status, guest_token, source, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    cleaned["booking_date"],
                    cleaned["booking_time"],
                    cleaned["guests"],
                    cleaned["name"],
                    cleaned["phone"],
                    cleaned["email"],
                    cleaned["note"],
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

        has_status = "status" in payload
        has_note = "note" in payload
        if not has_status and not has_note:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["No changes provided"]})
            return

        status = str(payload.get("status", "")).strip()
        if has_status and status not in VALID_STATUSES:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid status"]})
            return

        note = str(payload.get("note", "")).strip()
        notify_guest = bool(payload.get("notifyGuest", True))
        timestamp = now_iso()
        with connect() as conn:
            old_row = conn.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,)).fetchone()
            if old_row is None:
                json_response(self, HTTPStatus.NOT_FOUND, {"errors": ["Reservation not found"]})
                return
            next_status = status if has_status else old_row["status"]
            next_note = note if has_note else (old_row["note"] or "")
            if has_status and next_status in ACTIVE_STATUSES and old_row["status"] not in ACTIVE_STATUSES:
                booked = active_reservation_count(parse_date(old_row["booking_date"]), old_row["booking_time"], reservation_id)
                limit = slot_limit(parse_date(old_row["booking_date"]), old_row["booking_time"])
                if booked >= limit:
                    json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Dieser Slot ist bereits voll."]})
                    return
            conn.execute(
                "UPDATE reservations SET status = ?, note = ?, updated_at = ? WHERE id = ?",
                (next_status, next_note, timestamp, reservation_id),
            )
            row = conn.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,)).fetchone()

        if row is None:
            json_response(self, HTTPStatus.NOT_FOUND, {"errors": ["Reservation not found"]})
            return

        email_sent = False
        if has_status and notify_guest and old_row is not None and old_row["status"] != row["status"]:
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
        token = (parse_qs(query).get("token") or [""])[0]
        row = reservation_by_token(token)
        if row is None:
            json_response(self, HTTPStatus.NOT_FOUND, {"errors": ["Reservierung nicht gefunden"]})
            return
        data = row_to_dict(row)
        data.pop("guestToken", None)
        json_response(self, HTTPStatus.OK, {"reservation": data})

    def handle_guest_update_reservation(self, query: str) -> None:
        token = (parse_qs(query).get("token") or [""])[0]
        row = reservation_by_token(token)
        if row is None:
            json_response(self, HTTPStatus.NOT_FOUND, {"errors": ["Reservierung nicht gefunden"]})
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
                json_response(self, HTTPStatus.BAD_REQUEST, {"errors": errors})
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
