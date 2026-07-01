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

Google Ads / marketing context:

```text
KIKU Bistro Search campaign: KIKU Bistro | Suche lokal, campaignId 23977868810.
Current Bistro Ads strategy as of 2026-06-28: breakfast/lunch search intent in Quedlinburg, 10,00 EUR/day, ad schedule Wednesday-Sunday 08:00-15:00 Europe/Berlin, with hotel/holiday/recipe/job/delivery negative keywords.
Bistro location asset: campaign-level Google Ads location group KIKU Bistro only, containing only KIKU Bistro at Steinbrücke 2.
Bistro negatives include hotel/holiday/accommodation/delivery/jobs/recipe intent and restaurant/fine-dining terms such as urlaub, jan fribus, fine dining, abendessen, dinner, kiku restaurant.
KIKU Restaurant Search campaign: KIKU Restaurant | Fine Dining Search, campaignId 23979471269, 8,00 EUR/day.
Restaurant location asset: campaign-level Google Ads location group KIKU Restaurant only, containing only KIKU at Pölle 8. Restaurant campaign has broad-match negatives for breakfast/brunch/cafe/kaffee/lunch/mittagessen/bistro intent.
Next Ads check: 2026-07-02 to 2026-07-04, review search terms, top-of-page visibility, CPC, spend, and whether Bistro breakfast/lunch keywords need budget or copy changes.
```

AI/search context:

```text
Root llms.txt added for AI-readable site facts and Bistro/Restaurant disambiguation.
Root index.html JSON-LD uses an @graph with Restaurant/CafeOrCoffeeShop, Menu and WebSite objects.
Structured data includes Steinbrücke 2 geo coordinates, opening hours, reservation action, current menu sections/items/prices, and explicit separation from KIKU Restaurant at Pölle 8.
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
|-- robots.txt                  # search crawler policy and sitemap pointer
|-- sitemap.xml                 # canonical public URL sitemap with hreflang alternates
|-- llms.txt                    # AI-readable public site facts and disambiguation
|-- impressum.html              # Impressum и Datenschutz
|-- agb.html                    # AGB
|-- Kiku-Bistro-Menu.pdf        # актуальное PDF-меню
|-- HANDOVER.md                 # технический handover проекта
|-- infra/
|   |-- matomo/                 # документация и пример Matomo setup
|   `-- reservations/           # шаблоны production reservation backend
|-- scripts/                    # генерация локалей и production deploy
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

Последнее обновление сайта: 2026-07-01.

```text
Часы работы: Mittwoch & Sonntag, 9:30 - 17:00; Donnerstag - Samstag, 9:30 - 21:00; Montag - Dienstag, Ruhetag.
Kiku-Bistro-Menu.pdf обновлен по последнему пользовательскому PDF-меню `Bistro new.pdf` от 2026-07-01; публичная PDF-версия содержит только страницы меню, без первой страницы с гостевым Wi-Fi.
robots.txt and sitemap.xml added for search crawlers; sitemap uses canonical HTTPS non-www URLs and reciprocal hreflang alternates for DE, EN, FR, NL, PL, CS, IT, ES, PT, JA.
Меню на сайте сверяется с PDF и сохраняет порядок позиций из PDF для вкладок Frühstück и Ab 12:00 Uhr.
Последнее изменение меню: обновлены цены завтраков; добавлен Stulle - Tomaten und Burrata; в ланче добавлены Brotkörbchen mit Butter & Dips, Caesar Salat, Schnitzel и Trüffelrisotto; убраны Fjordforellensteak, Spitzkohl Steak и Süßes Croissant.
Напитки, вина и коктейли остаются в PDF, но не выводятся на сайте отдельной вкладкой.
Нижнее фото visit-секции: assets/visit-window-guest.jpg
Последний frontend fix: японская intro/about-секция на mobile больше не вызывает горизонтальный overflow; CSS cache-buster `styles.css?v=20260621-design-review-1`.
```

Последний content-changing production deploy:

```text
Дата: 2026-07-01
Commit: 9147b99 Refresh Bistro menu PDF
Workflow: Deploy production, run 28510987407, success
Проверка: все языковые страницы DE/EN/FR/NL/PL/CS/IT/ES/PT/JA, reservation.html, admin.html, robots.txt, sitemap.xml, llms.txt и Kiku-Bistro-Menu.pdf отдают 200; live PDF hash совпадает с локальным актуальным PDF.
```

## Production reservations and deploy

Reservations are live in production.

```text
Public booking widget: Resmio widget on the website; internal admin booking remains at https://admin.kiku-bistro.de/
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
Public website uses Resmio for guest reservations. Internal backend/admin remain available with Wednesday/Sunday ending by 17:00 and Thursday-Saturday ending by 21:00
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
Public website uses Resmio for guest reservations. Internal backend/admin remain available with Wednesday/Sunday ending by 17:00 and Thursday-Saturday ending by 21:00
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
robots.txt
sitemap.xml
impressum.html
agb.html
Kiku-Bistro-Menu.pdf
admin.html
reservation.html
reservierung.html
booking.js
en/ fr/ nl/ pl/ cs/ it/ es/ pt/ ja/
assets/
server.py
infra/reservations/
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

Google Ads tracking currently uses campaign UTM parameters such as:

```text
utm_source=google
utm_medium=cpc
utm_campaign=bistro_search_local
```

Локальные PDF-отчеты аналитики лежат в `output/pdf/` и сейчас не отслеживаются git без отдельного решения:

```text
output/pdf/kiku-bistro-statistik-mai-2026.pdf
output/pdf/kiku-bistro-wochenstatistik-2026-05-31-bis-2026-06-06.pdf
```

## Handover

Полный технический контекст проекта:

```text
HANDOVER.md
```

Общий индекс проектов на локальной машине:

```text
C:\Users\Sergej\Projects\codex-workspace-index\PROJECTS.md
```
