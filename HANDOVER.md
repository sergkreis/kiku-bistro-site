# Kiku Bistro - Handover

Update 2026-06-21:
- Local language suggestion prepared; production deploy has not been run yet for this change.
- Added `assets/language-suggest.js`, a soft browser-language prompt. It checks `navigator.languages`, supports DE, EN, FR, NL, PL, CS, IT, ES, PT and JA, and shows a small dismissible banner instead of an automatic redirect.
- The prompt stores manual language choices and dismissals in `localStorage`, preserves menu/reservation hashes where possible, and tracks prompt events in Matomo when `_paq` is available.
- All public language pages include the script; no server-side `Accept-Language` redirect was added.

Update 2026-06-21:
- Menu update from `C:\Users\Sergej\Desktop\Bistro new.pdf` was deployed to production from commit `6d7827b Update Bistro menu`; GitHub Actions run `27897585939` succeeded.
- Public PDF menu `Kiku-Bistro-Menu.pdf` was replaced locally. New SHA256: `0FE982250473200482E79D9CBF3292BD9F2642FF70E7DD20211FF791ADAE9400`.
- Visible food menu was updated on DE and EN, then regenerated for FR, NL, PL, CS, IT, ES, PT, JA.
- Main food changes: breakfast Eggs Benedict is now one brioche group with asparagus, roast beef, salmon and jamon; breakfast added Lachstatar; removed Suesses Croissant; French Toast now has pistachio ice cream; Kardamomschnecke now has apple.
- Lunch changes: Brotkorbchen uses Muhammara; removed Trio von Dips and Lachssalat; Rindertatar now has mushrooms and brioche; Tomaten-Salat replaces Tomaten-Stracciatella-Salat; Gnocchi mit Gorgonzola replaces Kimchisuppe; Rinderragout uses Steinpilze; Singapur Chili Huhn includes paprika; Honigkuchen was removed.
- `sitemap.xml` lastmod values were updated to `2026-06-21`.
- Note: the new PDF still contains the guest Wi-Fi page, same as the previous menu PDF family. Confirm this is acceptable before production deploy.

Update 2026-06-09:
- Production nginx now redirects `www.kiku-bistro.de` to the canonical non-www domain with HTTP 301 on both HTTP and HTTPS.
- Redirect target preserves path and query string, for example `https://www.kiku-bistro.de/fr/?utm_source=test` -> `https://kiku-bistro.de/fr/?utm_source=test`.
- nginx config changed on the VPS at `/etc/nginx/sites-available/kiku-site`; backup created at `/etc/nginx/sites-available/kiku-site.bak-20260609-151616`.
- Verification after reload: `http://www.kiku-bistro.de/`, `https://www.kiku-bistro.de/`, and `https://www.kiku-bistro.de/fr/` return 301 to non-www; `https://kiku-bistro.de/`, `/robots.txt`, and `/sitemap.xml` return 200.

Update 2026-06-08:
- Added root `robots.txt` and `sitemap.xml` for production search crawlers.
- `robots.txt` allows the public site, points crawlers to `https://kiku-bistro.de/sitemap.xml`, and excludes non-search operational/local paths such as `/api/`, `/infra/`, `/scripts/`, `/output/`, `/data/`, and `/__pycache__/`.
- `sitemap.xml` lists canonical HTTPS non-www URLs for DE, EN, FR, NL, PL, CS, IT, ES, PT, JA plus the current PDF menu, and includes reciprocal `hreflang` alternates for the public language pages.
- Public language pages now include `rel="canonical"` links to the non-www URLs, and duplicated generated `hreflang` entries were removed.
- `scripts/deploy-production.sh` now copies `robots.txt` and `sitemap.xml` into `/var/www/kiku-site`.

Update 2026-06-07:
- Public PDF menu `Kiku-Bistro-Menu.pdf` was replaced from `Bistro07062026.pdf`.
- Visible food menu was updated on DE and regenerated for EN, FR, NL, PL, CS, IT, ES, PT, JA.
- Menu changes: added Kardamomschnecke, added Tomaten-Stracciatella-Salat, replaced Nudelsuppe with Kimchisuppe, replaced Cheesecake with Tiramisu, and updated several descriptions from the PDF.
- Locale generators now repair localized PDF hrefs back to `Kiku-Bistro-Menu.pdf`, so text translation cannot produce broken filenames such as `Kiku-Bistro-Carte.pdf` or `Kiku-Bistro-Carta.pdf`.
- Production deploy completed from commit `ed931ff Update Bistro menu`; GitHub Actions run `27091768623` succeeded.
- Production checks after deploy: all public locale pages returned 200, `Kiku-Bistro-Menu.pdf` returned 200, and remote PDF SHA256 matched local SHA256 `F9350E72CB665E58E6D1C2C867921455B308BD1C7FD74515FE174EF6340B090F`.
- Note: the current PDF contains a guest Wi-Fi page. Future menu PDFs should be reviewed for public-safe content before deploy.

Update 2026-05-28:
- Public multilingual pages now cover DE, EN, FR, NL, PL, CS, IT, ES, PT, JA.
- Locale-specific reservation pages are generated for IT/ES/PT/JA as `/{locale}/reservation.html` and `/{locale}/reservierung.html`.
- Reservation frontend/backend email copy accepts the same locale set.

Update 2026-05-29:
- Public booking widget replaced with the Resmio widget; reservation admin/backend remain available.
- Opening hours changed to Wednesday/Sunday 9:30-17:00 and Thursday-Saturday 9:30-21:00.
- Public PDF menu renamed to `Kiku-Bistro-Menu.pdf` and updated from `Bistro new (1).pdf`.
- Visible food menu/prices updated from the new PDF.

Последнее обновление: 2026-06-09

## Быстрый контекст

Kiku Bistro - статический сайт бистро в Quedlinburg. Сайт уже работает на production-домене:

```text
https://kiku-bistro.de/
```

Аналитика Matomo работает на отдельном поддомене:

```text
https://analytics.kiku-bistro.de/
```

Глобальный индекс проектов:

```text
C:\Users\Sergej\Projects\codex-workspace-index\PROJECTS.md
```

В новом чате начинать так:

```text
Open C:\Users\Sergej\Projects\codex-workspace-index\PROJECTS.md and continue Kiku Bistro.
Then open this HANDOVER.md before making changes.
```

## Пути и репозиторий

Локальная папка:

```text
C:\Users\Sergej\Projects\sites\kiku-bistro
```

GitHub:

```text
https://github.com/sergkreis/kiku-bistro-site.git
```

Рабочая ветка:

```text
main
```

GitHub является источником правды. VPS-копия не считается источником правды.

## Технологии

```text
Plain static HTML/CSS/JS
nginx на VPS
Docker Compose для Matomo
Без npm/build step для сайта
```

## Основные файлы

```text
index.html                 - главная страница
styles.css                 - стили сайта
robots.txt                 - search crawler policy and sitemap pointer
sitemap.xml                - canonical public URL sitemap with hreflang alternates
impressum.html             - Impressum и Datenschutz
agb.html                   - AGB
Kiku-Bistro-Menu.pdf                 - актуальное PDF-меню
en/ fr/ nl/ pl/ cs/ it/ es/ pt/ ja/ - локализованные публичные страницы
scripts/generate-locales.mjs         - генерация FR/NL/PL/CS из EN
scripts/generate-extra-locales.mjs   - генерация IT/ES/PT/JA и common language switcher
scripts/deploy-production.sh         - production deploy script для GitHub Actions
assets/                    - изображения, логотипы, favicon
infra/matomo/              - документация и пример compose для Matomo
infra/reservations/        - шаблоны production reservation backend
infra/private/             - приватная локальная инфраструктурная документация, не коммитить
README.md                  - публичное описание проекта
HANDOVER.md                - этот технический handover
```

Приватная документация по Proxmox/Home Assistant для Kiku Bistro лежит здесь:

```text
infra/private/KIKU_PROXMOX_SERVER.md
```

Эта папка находится в `.gitignore`. Не коммитить и не переносить содержимое
этого файла в публичные документы.

Важные ассеты:

```text
assets/logo-white.png
assets/header-flower.png
assets/favicon.ico
assets/favicon-32.png
assets/apple-touch-icon.png
assets/hero-bread.jpg
assets/dish-4.jpg
assets/dish-editorial.jpg
assets/menu-breakfast.png
assets/menu-main.png
assets/menu-granola.jpg
assets/visit-shakshuka.jpg
assets/visit-french-toast.jpg
assets/visit-window-guest.jpg
assets/interior-kiku-144.jpg
```

## Production

Production VPS:

```text
217.154.193.255
Ubuntu 24.04
nginx
Docker + Docker Compose
```

Production paths:

```text
Web root: /var/www/kiku-site
nginx config: /etc/nginx/sites-available/kiku-site
Site TLS certificate: /etc/letsencrypt/live/kiku-bistro.de/
Analytics TLS certificate: /etc/letsencrypt/live/analytics.kiku-bistro.de/
Matomo stack: /opt/kiku-matomo
```

SSH access for Codex/local maintenance:

```text
User: root
Host: 217.154.193.255
Local private key: C:\Users\Sergej\.ssh\id_ed25519
Public key fingerprint: SHA256:7pXp49ZvSWjYVfqTr3sqE8bcSiWzoeSPu9DAcQErlHw
Public key comment: sergej@Mega-PC
Server authorized_keys path: /root/.ssh/authorized_keys
```

Public key currently added on the VPS:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILP6GvbOHXF5ql263+j/dPsf5TXffL+igwsFPw4c1jbX sergej@Mega-PC
```

Do not commit or paste the private key. Password login is still enabled as of
2026-05-02 and should be disabled only after confirming key-based access works
from the local machine.

Домены:

```text
kiku-bistro.de
www.kiku-bistro.de
analytics.kiku-bistro.de
```

Canonical public domain:

```text
https://kiku-bistro.de/
www.kiku-bistro.de redirects with HTTP 301 to kiku-bistro.de, preserving path and query string.
```

Ожидаемые публичные порты:

```text
22
80
443
```

HTTP перенаправляется на HTTPS. Старый путь аналитики:

```text
https://kiku-bistro.de/analytics/
```

редиректит на:

```text
https://analytics.kiku-bistro.de/
```

## Matomo Analytics

Matomo установлен на VPS в Docker Compose:

```text
/opt/kiku-matomo
```

Контейнеры:

```text
kiku-matomo-app  -> 127.0.0.1:8081
kiku-matomo-db   -> MariaDB
```

Публичный URL админки:

```text
https://analytics.kiku-bistro.de/
```

Tracking endpoint на сайте:

```text
https://analytics.kiku-bistro.de/matomo.php
```

Tracking script:

```text
https://analytics.kiku-bistro.de/matomo.js
```

Site ID:

```text
1
```

Privacy mode:

```text
Matomo self-hosted
tracking cookies отключены
browser feature detection отключен
IP сокращается через ip_address_mask_length = 2
```

Отслеживаются:

```text
page views
visit duration via Matomo heartbeat timer
traffic sources / referrers
city/country for new visits via DBIP GeoIP
menu tab clicks
PDF menu clicks/downloads
email link clicks
Google Maps route clicks
```

City geolocation update 2026-05-08:

```text
GeoIP provider: geoip2php
GeoIP DB: /var/www/html/misc/DBIP-City.mmdb
GeoIP auto-update URL: DBIP City Lite monthly download
New visits can show country, region and city. Older masked visits may not recover city data.
```

Goals configured 2026-05-08:

```text
Route geplant       -> event_action contains "Route planen"
E-Mail Klick        -> event_action contains "E-Mail"
PDF Menue geoeffnet -> event_action contains "PDF"
```

Generated local analytics reports:

```text
May 2026 PDF report:
C:\Users\Sergej\Projects\sites\kiku-bistro\output\pdf\kiku-bistro-statistik-mai-2026.pdf

Weekly PDF report, 31.05.2026 - 06.06.2026:
C:\Users\Sergej\Projects\sites\kiku-bistro\output\pdf\kiku-bistro-wochenstatistik-2026-05-31-bis-2026-06-06.pdf
```

`output/` is currently local/untracked unless the user explicitly decides to commit reports.

## Production reservations and GitHub deploy 2026-05-17

Reservations are deployed to production.

```text
Public booking widget: Resmio widget on the website; internal admin booking remains at https://admin.kiku-bistro.de/
Reservation admin: https://admin.kiku-bistro.de/
Analytics admin: https://analytics.kiku-bistro.de/
```

Reservation backend:

```text
Service: kiku-reservations
Backend path: /opt/kiku-reservations
Database: /var/lib/kiku-reservations/reservations.sqlite3
Env file with secrets: /etc/kiku-reservations.env
```

Deploy is GitHub based:

```text
Workflow: .github/workflows/deploy.yml
Deploy script: scripts/deploy-production.sh
VPS checkout: /opt/kiku-bistro-site
Trigger: push to main, or manual workflow_dispatch
```

Required GitHub repository secrets:

```text
KIKU_DEPLOY_HOST
KIKU_DEPLOY_USER
KIKU_DEPLOY_PORT
KIKU_DEPLOY_SSH_KEY
```

Current reservation rules:

```text
Public website uses Resmio for guest reservations. Internal backend/admin remain available with Wednesday/Sunday ending by 17:00 and Thursday-Saturday ending by 21:00
Reservation duration: 2 hours
Default slot limit: 3 active reservations per time
Active statuses for limits: pending, confirmed, seated
Admin can adjust slot limits per date/time
Admin can close full dates for vacation or events
Admin can create manual reservations; email is optional there
Guest emails include a personal link to view, change, or cancel the reservation
Past dates and past same-day slots are blocked on frontend and backend
Auto-confirmation: up to 4 guests when the selected slot has capacity
5+ guests: pending request, restaurant confirms manually
Guest email is required
Restaurant notification email: info@kiku-bistro.de
```

## Reservation production notes 2026-05-17

Reservation system is deployed to production and can also run locally.

Files:

```text
server.py      - local Python stdlib server, API, SQLite storage
booking.js     - legacy public reservation form behavior; public guest reservations now use Resmio
admin.html     - local reservation admin
data/          - local SQLite data, ignored by git
```

Local run:

```powershell
python server.py
```

URLs:

```text
Website: http://127.0.0.1:8080/
Admin:   http://127.0.0.1:8080/admin.html
```

Current behavior:

```text
Opening days: Wednesday-Sunday
Opening time: Wednesday/Sunday 9:30-17:00; Thursday-Saturday 9:30-21:00
Public website uses Resmio for guest reservations. Internal backend/admin remain available with Wednesday/Sunday ending by 17:00 and Thursday-Saturday ending by 21:00
Reservation duration: 2 hours
Default slot limit: 3 active reservations per time
Auto-confirmation: up to 4 guests when the selected slot has capacity
5+ guests: status pending, restaurant confirms manually
Guest email is required.
Restaurant notification email: info@kiku-bistro.de
Statuses: pending, confirmed, seated, cancelled, no_show
```

Important before production:

```text
Admin uses KIKU_ADMIN_PASSWORD, or local default kiku-local when unset.
Email notifications are wired through SMTP env vars:
KIKU_SMTP_HOST, KIKU_SMTP_PORT, KIKU_SMTP_SECURITY, KIKU_SMTP_USER, KIKU_SMTP_PASSWORD, KIKU_SMTP_FROM.
STRATO SMTP settings confirmed 2026-05-17:
KIKU_SMTP_HOST=smtp.strato.de
KIKU_SMTP_PORT=465
KIKU_SMTP_SECURITY=ssl
KIKU_SMTP_USER=info@kiku-bistro.de
KIKU_SMTP_FROM=info@kiku-bistro.de
Without SMTP settings, emails are skipped and logged locally.
Datenschutz text must be reviewed before collecting real guest data.
Do not deploy this reservation system without explicit approval and server plan.
```

Instagram UTM standard:

```text
Bio:
https://kiku-bistro.de/?utm_source=instagram&utm_medium=social&utm_campaign=instagram&utm_content=bio

Stories:
https://kiku-bistro.de/?utm_source=instagram&utm_medium=social&utm_campaign=instagram&utm_content=story

Posts:
https://kiku-bistro.de/?utm_source=instagram&utm_medium=social&utm_campaign=instagram&utm_content=post
```

For a temporary campaign, keep `utm_source=instagram` and `utm_medium=social`,
then change only `utm_campaign`, for example `menu_may_2026`.

Matomo admin credentials не коммитить. Они сохранены только на VPS:

```text
/opt/kiku-matomo/.matomo-admin
```

Production compose и пароли БД не коммитить. В репозитории есть только безопасный пример:

```text
infra/matomo/docker-compose.example.yml
```

## Деплой

Production deploy автоматизирован через GitHub Actions. Push в `main` запускает workflow:

```text
.github/workflows/deploy.yml -> scripts/deploy-production.sh -> VPS /opt/kiku-bistro-site -> /var/www/kiku-site
```

Обычный процесс:

```text
edit local files -> local visual/test check -> git status -> commit -> push main -> check GitHub Actions -> verify production URLs
```

Последний production deploy: 2026-06-07.

```text
Commit: ed931ff Update Bistro menu
Workflow run: 27091768623
Result: success
Проверка после деплоя: все языковые страницы DE/EN/FR/NL/PL/CS/IT/ES/PT/JA отдают 200, Kiku-Bistro-Menu.pdf отдает 200, remote PDF SHA256 совпадает с локальным.
```

Не деплоить на production без явного разрешения.

Файлы и папки, которые production deploy script копирует/синхронизирует на VPS:

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
server.py -> /opt/kiku-reservations/server.py
infra/reservations/ -> /opt/kiku-reservations/infra/reservations/
```

После копирования на VPS:

```bash
chown -R www-data:www-data /var/www/kiku-site
find /var/www/kiku-site -type d -exec chmod 755 {} +
find /var/www/kiku-site -type f -exec chmod 644 {} +
nginx -t
systemctl reload nginx
```

Для изменений nginx:

```bash
nginx -t
systemctl reload nginx
```

## Проверка перед публикацией

Минимальная проверка:

```text
git status
открыть главную страницу
проверить desktop и mobile
проверить меню
проверить footer/contact
проверить impressum.html
проверить agb.html
проверить отсутствие JS-ошибок
```

Для аналитики:

```text
https://analytics.kiku-bistro.de/ открывается
https://analytics.kiku-bistro.de/matomo.js отдается 200
https://analytics.kiku-bistro.de/matomo.php принимает события
```

Последняя проверка 2026-05-02:

```text
DNS analytics.kiku-bistro.de -> 217.154.193.255
SSL для analytics.kiku-bistro.de выпущен
тестовое событие записалось в Matomo DB
```

## VPS health check 2026-05-02

Codex connected over SSH as `root` using the local key above and performed a
read-only health check.

VM resources:

```text
OS: Ubuntu 24.04.4 LTS
CPU: 1 vCPU
RAM: 848 MiB
Swap: 1.0 GiB
Disk: 8.7G total, 5.2G used, 3.5G free, 60%
Uptime: 6 days
Load average: 0.00, 0.00, 0.00
```

Services:

```text
nginx: active
nginx -t: successful
/var/www/kiku-site: 4.6M
kiku-matomo-app: matomo:5-apache, bound to 127.0.0.1:8081
kiku-matomo-db: mariadb:11, internal Docker port 3306 only
Matomo tracker cache: writable as www-data
Failed systemd units: 0
OOM / killed process in kernel log: none found
nginx/docker warnings in last 24h: none found
```

Resource conclusion:

```text
The static site is very light for the VM.
nginx uses about 7 MB RAM.
Matomo app is the main memory user at about 275 MB RAM.
MariaDB uses about 27-31 MB RAM.
Available RAM during check was about 186-211 MB.
Swap was already used at about 184-191 MB.
```

Current VPS security state:

```text
SSH port 22 is public.
HTTP 80 and HTTPS 443 are public.
Matomo app port 8081 listens only on 127.0.0.1.
MariaDB is not exposed publicly.
UFW is inactive.
fail2ban is not installed/active.
sshd effective config:
  PermitRootLogin yes
  PasswordAuthentication yes
  PubkeyAuthentication yes
SSH brute-force noise in last 24h:
  Failed password: about 8906
  Invalid user: about 1224
```

Security priority:

```text
1. Confirm root key login works from the local machine.
2. Create/use a non-root sudo user if desired.
3. Disable SSH password login.
4. Disable direct root login or set PermitRootLogin prohibit-password at minimum.
5. Enable firewall for 22, 80, 443 only.
6. Install and enable fail2ban or equivalent sshd protection.
7. Replace the root password that was shared during setup.
```

## Git workflow

```text
main - рабочая ветка
GitHub - источник правды
не коммитить секреты
не коммитить временные скриншоты без необходимости
не трогать чужие незакоммиченные изменения без причины
```

Последние важные коммиты:

```text
ed931ff Update Bistro menu
078cc98 Fix localized reservation pages and French menu script
abf898c Update menu hours and reservation widget
eb98637 Update hours and visit photo
8313df3 Update Bistro menu
75f9e4d Update project handover docs
e831b6e Move Matomo analytics to subdomain
bf706bf Fix Matomo tracker initialization
6edc196 Add Matomo analytics tracking
```

## Дизайн-направление

Цель: сохранить ощущение исходного Wix-сайта, но сделать сайт современнее, чище и визуально дороже.

Предпочтения:

```text
основной фон - бледно-зеленый
акценты - темно-зеленый и натуральное дерево
hero на весь viewport нравится пользователю
крупный белый Kiku Bistro логотип поверх хлебного hero
минимум карточек и прямоугольных блоков
editorial layout
много качественных фото еды и зала
меню должно быть читабельным, с аккуратными ценами
```

Не менять без отдельного обсуждения:

```text
hero во весь viewport
мобильную концепцию навигации
общий pale-green стиль
```

## Меню

Текущее меню обновлялось из актуального PDF и изображений меню.
По умолчанию новые обновления меню приходят от пользователя в PDF. Пока пользователь
не попросит другой источник, сверять позиции, цены и порядок вывода меню на сайте
по присланному PDF, а затем заменять `Kiku-Bistro-Menu.pdf` актуальным файлом.

Основные вкладки:

```text
Frühstück
Ab 12:00 Uhr
```

Вкладка напитков удалена.
Порядок позиций на сайте должен повторять порядок в актуальном PDF-меню.

Последнее обновление меню и PDF выполнено 2026-06-07 из файла `Bistro07062026.pdf`:

```text
Kiku-Bistro-Menu.pdf заменен актуальным PDF.
Frühstück и Ab 12:00 Uhr обновлены по позициям, описаниям, ценам и порядку.
Frühstück: Brotkörbchen без Brioche в описании; добавлена Kardamomschnecke 7 €.
Ab 12:00 Uhr: Brotkörbchen теперь с Frischkäse, Jamón, Olivenpaste.
Ab 12:00 Uhr: добавлен Tomaten-Stracciatella-Salat 12 €.
Ab 12:00 Uhr: Nudelsuppe заменена на Kimchisuppe 16 €.
Ab 12:00 Uhr: Singapur Chili Huhn теперь без Sauerteigbrot в описании.
Desserts: Cheesecake заменен на Tiramisu 6,5 €.
Напитки, вина и коктейли из PDF не выводятся на сайте как отдельная вкладка.
Текущий PDF содержит guest Wi-Fi page; перед будущим деплоем PDF проверять на public-safe content.
scripts/generate-locales.mjs и scripts/generate-extra-locales.mjs чинят PDF href обратно на Kiku-Bistro-Menu.pdf после переводов.
```

Актуальные часы на сайте после обновления 2026-05-07:

```text
Montag - Dienstag: Ruhetag
Mittwoch & Sonntag: 9:30 - 17:00
Donnerstag - Samstag: 9:30 - 21:00
```

Нижнее фото в секции `#visit` заменено на:

```text
assets/visit-window-guest.jpg
```

Важно по Eggs Benedikt после обновления 2026-06-07:

```text
EGGS BENEDIKT AUF BRIOCHE
Pochierte Eier, Avocado, Hollandaise
- MIT SPARGEL
  12 €
- MIT ROASTBEEF
  16 €

EGGS BENEDIKT AUF CROISSANT
Pochierte Eier, Avocado, Hollandaise
- MIT JAMÓN
  16,5 €
- MIT LACHS
  16,5 €
```

Эти позиции должны отображаться как группы с подпунктами, а не как отдельные карточки на каждую вариацию.

## Открытые задачи

Технические:

```text
1. Поддерживать scripts/deploy-production.sh и GitHub Actions workflow в актуальном состоянии.
2. Оптимизировать изображения: WebP/responsive sizes.
3. SSH key authentication для root настроен на VPS.
4. После подтверждения доступа по ключу отключить SSH password login.
5. Отключить direct root login или оставить только prohibit-password.
6. Включить UFW/firewall для 22, 80, 443.
7. Установить fail2ban или аналог для sshd.
8. Удалить или перенести старые review/check PNG, если они больше не нужны.
```

Контент/дизайн:

```text
1. Проверять все новые цены меню по финальному источнику.
2. Добавлять новые фото по мере готовности.
3. Периодически делать Playwright дизайн-ревью desktop/mobile.
4. Проверять немецкий copy перед публикацией.
```

Юридическое:

```text
1. Impressum проверить финально.
2. Datenschutz проверить под реальный hosting + Matomo setup.
3. AGB проверить финально.
```

Безопасность VPS:

```text
Root password передавался в чат при настройке VPS. Его нужно заменить.
SSH key authentication для root добавлен 2026-05-02.
PasswordAuthentication и PermitRootLogin пока включены.
UFW inactive, fail2ban не установлен/не активен.
Рекомендуется отключить password login, ограничить root login и включить защиту sshd.
Matomo admin password тоже лучше заменить после первой стабилизации.
```

## Запрещено

```text
Не коммитить секреты.
Не коммитить production docker-compose с паролями.
Не деплоить без явного разрешения.
Не считать VPS-копию источником правды.
Не удалять backup без отдельного решения.
```
