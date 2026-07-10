# Kiku Bistro Reservations

Local reservation backend for the Kiku Bistro static site.

Last documentation update: 2026-06-07.

Current public booking state:

```text
Public website reservations use the Resmio widget.
The custom public reservation form is disabled on the website.
POST /api/reservations is disabled and returns HTTP 410 Gone.
Existing guest management links remain available for legacy reservations.
The internal reservation backend/API/admin remain deployed and available.
Reservation admin: https://admin.kiku-bistro.de/
Reservation API: https://kiku-bistro.de/api/
```

Current opening and reservation rules:

```text
Opening days: Wednesday-Sunday
Wednesday & Sunday: 9:30 - 17:00
Thursday - Saturday: 9:30 - 21:00
Monday - Tuesday: closed
Reservation duration: 2 hours
Default slot limit: 3 active reservations per time
Auto-confirmation: up to 4 guests when capacity is available
5+ guests: pending request, restaurant confirms manually
```

Production shape:

```text
nginx serves static files from /var/www/kiku-site
nginx proxies /api/ to 127.0.0.1:8080
systemd runs /opt/kiku-reservations/server.py
SQLite lives in /var/lib/kiku-reservations/reservations.sqlite3
secrets live in /etc/kiku-reservations.env
```

Files in this folder are templates. Do not commit real passwords.

Production deploy is handled by GitHub Actions and `scripts/deploy-production.sh`.
The deploy script updates static files, syncs localized pages, installs
`server.py`, syncs these reservation templates to `/opt/kiku-reservations/infra`,
restarts `kiku-reservations`, tests nginx and reloads nginx.

## Environment

Copy the example file on the VPS:

```bash
cp /opt/kiku-reservations/infra/reservations/kiku-reservations.env.example /etc/kiku-reservations.env
chmod 600 /etc/kiku-reservations.env
```

Then edit `/etc/kiku-reservations.env` and set:

```text
KIKU_ADMIN_PASSWORD
KIKU_SMTP_PASSWORD
```

STRATO SMTP:

```text
KIKU_SMTP_HOST=smtp.strato.de
KIKU_SMTP_PORT=465
KIKU_SMTP_SECURITY=ssl
KIKU_SMTP_USER=info@kiku-bistro.de
KIKU_SMTP_FROM=info@kiku-bistro.de
```

## systemd

Install service:

```bash
cp /opt/kiku-reservations/infra/reservations/kiku-reservations.service /etc/systemd/system/kiku-reservations.service
systemctl daemon-reload
systemctl enable --now kiku-reservations
systemctl status kiku-reservations --no-pager
```

## nginx

Merge `nginx-reservations-location.conf` into the existing `kiku-site` server
block before generic static locations, then:

```bash
nginx -t
systemctl reload nginx
```

## Smoke checks

```bash
curl -s http://127.0.0.1:8080/api/health
curl -s https://kiku-bistro.de/api/health
curl -I https://admin.kiku-bistro.de/
```
