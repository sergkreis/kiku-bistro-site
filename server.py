from __future__ import annotations

import csv
import hashlib
import hmac
import io
import json
import os
import re
import smtplib
import sqlite3
from datetime import date, datetime, time, timedelta
from email.message import EmailMessage
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("KIKU_DATA_DIR", ROOT / "data"))
DB_PATH = Path(os.environ.get("KIKU_DB_PATH", DATA_DIR / "reservations.sqlite3"))

OPEN_DAYS = {2, 3, 4, 5, 6}
OPEN_TIME = time(9, 30)
LAST_SEATING = time(18, 0)
SLOT_MINUTES = 30
RESERVATION_MINUTES = 120
TABLES = [4, 2, 2, 2, 2]
SEAT_CAPACITY = sum(TABLES)
MAX_PARTY_SIZE = 12
AUTO_CONFIRM_MAX_GUESTS = 4
ACTIVE_STATUSES = {"confirmed", "seated"}
VALID_STATUSES = {"pending", "confirmed", "seated", "cancelled", "no_show"}
RESTAURANT_EMAIL = "info@kiku-bistro.de"
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
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(booking_date, booking_time)"
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


def slot_times(day: date) -> list[str]:
    if not is_open_day(day):
        return []
    current = combine(day, OPEN_TIME)
    end = combine(day, LAST_SEATING)
    slots: list[str] = []
    while current <= end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=SLOT_MINUTES)
    return slots


def bookable_slot_times(day: date) -> list[str]:
    return [slot for slot in slot_times(day) if is_future_slot(day, slot)]


def overlaps(start_a: datetime, end_a: datetime, start_b: datetime, end_b: datetime) -> bool:
    return start_a < end_b and start_b < end_a


def table_size_for_party(guests: int) -> int | None:
    if guests <= 2:
        return 2
    if guests <= 4:
        return 4
    return None


def overlapping_reservations(day: date, slot: str, exclude_id: int | None = None) -> list[sqlite3.Row]:
    requested_start = combine(day, slot)
    requested_end = requested_start + timedelta(minutes=RESERVATION_MINUTES)
    params: list[object] = [day.isoformat(), *ACTIVE_STATUSES]
    exclude_sql = ""
    if exclude_id is not None:
        exclude_sql = " AND id != ?"
        params.append(exclude_id)

    with connect() as conn:
        rows = conn.execute(
            f"""
            SELECT id, booking_time, guests
            FROM reservations
            WHERE booking_date = ?
              AND status IN ({",".join("?" for _ in ACTIVE_STATUSES)})
              {exclude_sql}
            """,
            params,
        ).fetchall()

    overlapping = []
    for row in rows:
        existing_start = combine(day, row["booking_time"])
        existing_end = existing_start + timedelta(minutes=RESERVATION_MINUTES)
        if overlaps(requested_start, requested_end, existing_start, existing_end):
            overlapping.append(row)
    return overlapping


def available_tables(day: date, slot: str, exclude_id: int | None = None) -> list[int]:
    free_tables = sorted(TABLES)
    occupied = overlapping_reservations(day, slot, exclude_id)
    for row in sorted(occupied, key=lambda item: int(item["guests"]), reverse=True):
        needed = table_size_for_party(int(row["guests"]))
        if needed is None:
            continue
        for index, table_size in enumerate(free_tables):
            if table_size >= needed:
                free_tables.pop(index)
                break
    return sorted(free_tables, reverse=True)


def availability_for_party(day: date, slot: str, guests: int) -> dict:
    free_tables = available_tables(day, slot)
    needed = table_size_for_party(guests)
    if needed is None:
        return {
            "available": True,
            "remaining": sum(free_tables),
            "freeTables": free_tables,
            "matchingTables": [],
            "requiresConfirmation": True,
        }
    matching_tables = [table_size for table_size in free_tables if table_size >= needed]
    return {
        "available": bool(matching_tables),
        "remaining": sum(free_tables),
        "freeTables": free_tables,
        "matchingTables": matching_tables,
        "requiresConfirmation": False,
    }


def validate_reservation(payload: dict) -> tuple[dict, list[str]]:
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
    if len(phone) < 5:
        errors.append("Bitte eine Telefonnummer angeben.")
    if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        errors.append("Bitte eine gültige E-Mail-Adresse angeben.")

    cleaned.update({"name": name, "phone": phone, "email": email, "note": note})

    if booking_day and booking_time:
        today = restaurant_now().date()
        if booking_day < today:
            errors.append("Reservierungen in der Vergangenheit sind nicht möglich.")
        if booking_day == today and not is_future_slot(booking_day, booking_time):
            errors.append("Diese Uhrzeit liegt bereits in der Vergangenheit.")
        if not is_open_day(booking_day):
            errors.append("Montag und Dienstag sind Ruhetage.")
        if booking_time.strftime("%H:%M") not in bookable_slot_times(booking_day):
            errors.append("Bitte eine verfügbare Uhrzeit auswählen.")

    if booking_day and booking_time and "guests" in cleaned and cleaned["guests"] <= AUTO_CONFIRM_MAX_GUESTS:
        availability = availability_for_party(booking_day, cleaned["booking_time"], cleaned["guests"])
        if not availability["available"]:
            errors.append("Für diese Uhrzeit ist kein passender Tisch frei.")

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
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def notification_subject(row: sqlite3.Row) -> str:
    status = "Anfrage" if row["status"] == "pending" else "Reservierung"
    return f"Kiku Bistro {status} am {row['booking_date']} um {row['booking_time']}"


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
        "Kiku Bistro\nSteinbrücke 2\n06484 Quedlinburg\n"
    )


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


def send_email(to_address: str, subject: str, body: str) -> bool:
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
        results["guest"] = send_email(row["email"], notification_subject(row), guest_message(row))
    except Exception as exc:
        print(f"Guest email failed: {exc}")
    try:
        results["restaurant"] = send_email(RESTAURANT_EMAIL, notification_subject(row), restaurant_message(row))
    except Exception as exc:
        print(f"Restaurant email failed: {exc}")
    return results


def send_status_notification(row: sqlite3.Row) -> bool:
    if row["status"] not in {"confirmed", "cancelled"}:
        return False
    try:
        return send_email(row["email"], status_subject(row), guest_message(row))
    except Exception as exc:
        print(f"Status email failed: {exc}")
        return False


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
        json_response(self, HTTPStatus.NOT_FOUND, {"error": "Not found"})

    def do_PATCH(self) -> None:
        parsed = urlparse(self.path)
        match = re.match(r"^/api/reservations/(\d+)$", parsed.path)
        if match:
            if not require_admin(self):
                return
            self.handle_update_reservation(int(match.group(1)))
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

        slots = []
        for slot in bookable_slot_times(day):
            availability = availability_for_party(day, slot, guests)
            slots.append({"time": slot, "capacity": SEAT_CAPACITY, **availability})

        json_response(
            self,
            HTTPStatus.OK,
            {
                "date": day.isoformat(),
                "open": is_open_day(day),
                "durationMinutes": RESERVATION_MINUTES,
                "maxPartySize": MAX_PARTY_SIZE,
                "autoConfirmMaxGuests": AUTO_CONFIRM_MAX_GUESTS,
                "slots": slots,
            },
        )

    def handle_reservations(self, query: str) -> None:
        params = parse_qs(query)
        selected_date = (params.get("date") or [restaurant_now().date().isoformat()])[0]
        try:
            parse_date(selected_date)
        except ValueError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid date"]})
            return

        with connect() as conn:
            rows = conn.execute(
                """
                SELECT *
                FROM reservations
                WHERE booking_date = ?
                ORDER BY booking_time ASC, created_at ASC
                """,
                (selected_date,),
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

        now = datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
        status = "confirmed" if cleaned["guests"] <= AUTO_CONFIRM_MAX_GUESTS else "pending"
        with connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO reservations
                  (booking_date, booking_time, guests, name, phone, email, note, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    now,
                    now,
                ),
            )
            row = conn.execute("SELECT * FROM reservations WHERE id = ?", (cursor.lastrowid,)).fetchone()

        email_results = send_reservation_notifications(row)
        json_response(self, HTTPStatus.CREATED, {"reservation": row_to_dict(row), "email": email_results})

    def handle_update_reservation(self, reservation_id: int) -> None:
        try:
            payload = read_json(self)
        except json.JSONDecodeError:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid JSON"]})
            return

        status = str(payload.get("status", "")).strip()
        if status not in VALID_STATUSES:
            json_response(self, HTTPStatus.BAD_REQUEST, {"errors": ["Invalid status"]})
            return

        now = datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
        with connect() as conn:
            old_row = conn.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,)).fetchone()
            conn.execute(
                "UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?",
                (status, now, reservation_id),
            )
            row = conn.execute("SELECT * FROM reservations WHERE id = ?", (reservation_id,)).fetchone()

        if row is None:
            json_response(self, HTTPStatus.NOT_FOUND, {"errors": ["Reservation not found"]})
            return

        email_sent = False
        if old_row is not None and old_row["status"] != row["status"]:
            email_sent = send_status_notification(row)
        json_response(self, HTTPStatus.OK, {"reservation": row_to_dict(row), "email": {"guest": email_sent}})


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
