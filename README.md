# Сайт Kiku Bistro

Статический сайт для **Kiku Bistro** в Кведлинбурге.

Production:

```text
https://kiku-bistro.de/
```

Репозиторий:

```text
https://github.com/sergkreis/kiku-bistro-site
```

Аналитика:

```text
https://analytics.kiku-bistro.de/
```

## Статус

Сайт развернут на отдельном production VPS и отдается через nginx как обычный статический сайт.

DNS направлен на VPS:

```text
217.154.193.255
```

HTTPS активен для:

```text
kiku-bistro.de
www.kiku-bistro.de
analytics.kiku-bistro.de
```

## Структура проекта

```text
.
|-- index.html                  # главная страница
|-- styles.css                  # основные стили
|-- impressum.html              # Impressum и Datenschutz
|-- agb.html                    # AGB
|-- Bistro.pdf                  # актуальное PDF-меню
|-- HANDOVER.md                 # технический handover проекта
|-- infra/
|   `-- matomo/                 # документация и пример Matomo setup
`-- assets/                     # изображения, логотипы, favicon
```

Ключевые ассеты:

```text
assets/logo-white.png
assets/header-flower.png
assets/hero-bread.jpg
assets/menu-breakfast.png
assets/menu-main.png
assets/menu-granola.jpg
assets/visit-shakshuka.jpg
assets/visit-french-toast.jpg
assets/visit-window-guest.jpg
```

## Актуальный контент

Последнее обновление сайта: 2026-05-16.

```text
Часы работы: Mittwoch - Samstag, 9:30 - 20:00; Sonntag, 9:30 - 17:00; Montag - Dienstag, Ruhetag.
Bistro.pdf обновлен по новому PDF-меню `Bistro new.pdf`.
Меню на сайте сверяется с PDF и сохраняет порядок позиций из PDF.
Последнее изменение меню: добавлен Croissant mit Jamon, удалена Quiche, обновлены описания Lachs/Granola/Konsommé.
Нижнее фото visit-секции: assets/visit-window-guest.jpg
```

## Production reservations and deploy

Reservations are live in production.

```text
Booking form: https://kiku-bistro.de/#reservierung
Reservation admin: https://admin.kiku-bistro.de/
Reservation API: https://kiku-bistro.de/api/
Analytics admin: https://analytics.kiku-bistro.de/
```

Production reservation backend:

```text
Service: kiku-reservations
Backend path: /opt/kiku-reservations
Database: /var/lib/kiku-reservations/reservations.sqlite3
Env file with secrets: /etc/kiku-reservations.env
```

Current reservation rules:

```text
Public slots: Mittwoch-Samstag 09:30, 10:00, 11:00, 13:00, 17:00, 18:00; Sonntag filters out reservations ending after 17:00
Default slot limit: 3 active reservations per time
Active statuses for limits: pending, confirmed, seated
Admin can adjust slot limits per date/time
Admin can close full dates for vacation or events
Admin can create manual reservations; email is optional there
Guest emails include a personal link to view, change, or cancel the reservation
```

Production deploy is automated through GitHub Actions.

```text
Workflow: .github/workflows/deploy.yml
Deploy script: scripts/deploy-production.sh
Trigger: push to main, or manual workflow_dispatch
VPS checkout: /opt/kiku-bistro-site
```

Required GitHub repository secrets:

```text
KIKU_DEPLOY_HOST
KIKU_DEPLOY_USER
KIKU_DEPLOY_PORT
KIKU_DEPLOY_SSH_KEY
```

## Локальный запуск

У проекта нет сборки, npm, backend или базы данных.

Можно открыть напрямую:

```text
index.html
```

Или запустить простой локальный сервер из папки проекта:

```powershell
python -m http.server 8080
```

Потом открыть:

```text
http://localhost:8080/
```

### Local reservation server

The reservation system uses Python stdlib + SQLite. Locally it can be started
with the same backend used in production.

Start it from the project root:

```powershell
python server.py
```

Open:

```text
Website: http://127.0.0.1:8080/
Admin:   http://127.0.0.1:8080/admin.html
```

Local reservation data is stored in `data/reservations.sqlite3`, which is ignored
by git. The admin page uses `KIKU_ADMIN_PASSWORD`, or `kiku-local` locally when
no password is configured.

Reservation rules:

```text
Public slots: Mittwoch-Samstag 09:30, 10:00, 11:00, 13:00, 17:00, 18:00; Sonntag filters out reservations ending after 17:00
Reservation duration: 2 hours
Default slot limit: 3 active reservations per time
Active statuses for limits: pending, confirmed, seated
Admin can adjust slot limits per date/time
Admin can close full dates for vacation or events
Admin can create manual reservations; email is optional there
Auto-confirmation: up to 4 guests
5+ guests: pending request, restaurant confirms manually
Guest email: required
Restaurant notifications: info@kiku-bistro.de
SMTP env vars: KIKU_SMTP_HOST, KIKU_SMTP_PORT, KIKU_SMTP_SECURITY, KIKU_SMTP_USER, KIKU_SMTP_PASSWORD, KIKU_SMTP_FROM
STRATO SMTP: smtp.strato.de, port 465, SSL/TLS
```

## Git workflow

GitHub является основным источником правды.

Рабочая ветка:

```text
main
```

Обычный процесс:

```text
edit locally -> check -> commit -> push -> deploy to VPS
```

## VPS и деплой

Production VPS:

```text
217.154.193.255
```

Папка сайта на сервере:

```text
/var/www/kiku-site
```

nginx config:

```text
/etc/nginx/sites-available/kiku-site
```

Matomo:

```text
/opt/kiku-matomo
```

Для деплоя обычно копируются:

```text
index.html
styles.css
impressum.html
agb.html
Bistro.pdf
assets/
```

После копирования:

```bash
chown -R www-data:www-data /var/www/kiku-site
find /var/www/kiku-site -type d -exec chmod 755 {} +
find /var/www/kiku-site -type f -exec chmod 644 {} +
nginx -t
systemctl reload nginx
```

## Matomo

Публичная админка:

```text
https://analytics.kiku-bistro.de/
```

Сайт отправляет аналитику на:

```text
https://analytics.kiku-bistro.de/matomo.php
```

Настройки приватности:

```text
без tracking cookies
browser feature detection отключен
IP сокращается
данные хранятся на собственном VPS
```

Пароли и production compose не коммитить. Данные админки Matomo находятся только на сервере:

```text
/opt/kiku-matomo/.matomo-admin
```

## Handover

Полный технический контекст проекта:

```text
HANDOVER.md
```

Общий индекс проектов на локальной машине:

```text
C:\Users\Sergej\Documents\Codex\PROJECTS.md
```
