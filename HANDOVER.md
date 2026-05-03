# Kiku Bistro - Handover

Последнее обновление: 2026-05-02

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
C:\Users\Sergej\Documents\Codex\PROJECTS.md
```

В новом чате начинать так:

```text
Open C:\Users\Sergej\Documents\Codex\PROJECTS.md and continue Kiku Bistro.
Then open this HANDOVER.md before making changes.
```

## Пути и репозиторий

Локальная папка:

```text
C:\Users\Sergej\Documents\kiku-bistro
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
impressum.html             - Impressum и Datenschutz
agb.html                   - AGB
Bistro.pdf                 - актуальное PDF-меню
assets/                    - изображения, логотипы, favicon
infra/matomo/              - документация и пример compose для Matomo
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
menu tab clicks
PDF menu clicks/downloads
email link clicks
Google Maps route clicks
```

Matomo admin credentials не коммитить. Они сохранены только на VPS:

```text
/opt/kiku-matomo/.matomo-admin
```

Production compose и пароли БД не коммитить. В репозитории есть только безопасный пример:

```text
infra/matomo/docker-compose.example.yml
```

## Деплой

Автоматического deploy script пока нет. Текущий процесс:

```text
edit local files -> visual/test check -> git status -> commit -> push -> deploy to VPS
```

Не деплоить на production без явного разрешения.

Файлы, которые обычно копируются на VPS:

```text
index.html
styles.css
impressum.html
agb.html
Bistro.pdf
assets/
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
e831b6e Move Matomo analytics to subdomain
bf706bf Fix Matomo tracker initialization
6edc196 Add Matomo analytics tracking
c9d9150 Normalize section spacing
adf9d0e Center mobile footer content
01db8a9 Restore eggs benedikt menu layout
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

Основные вкладки:

```text
Frühstück
Ab 12:00 Uhr
```

Вкладка напитков удалена.

Важно по Eggs Benedikt:

```text
EGGS BENEDIKT AUF DER BRIOCHE
- MIT AVOCADO
  Pochierte Eier, Avocado, Tomate, Hollandaise
  14 €
- MIT LACHS
  Pochierte Eier, Avocado, Hollandaise
  18 €
- ROASTBEEF
  Pochierte Eier, Avocado, Unagi-Béarnaise
  18 €
```

Эта позиция должна отображаться как группа с подпунктами, а не как три отдельные карточки.

## Открытые задачи

Технические:

```text
1. Сделать deploy script.
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
