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
