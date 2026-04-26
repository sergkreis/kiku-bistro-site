# Сайт Kiku Bistro

Статический сайт для **Kiku Bistro** в Кведлинбурге.

Текущий временный адрес:

https://kreisphoto.de/

Репозиторий:

https://github.com/sergkreis/kiku-bistro-site

## Статус

Сайт уже развернут на VPS и отдается через nginx как обычный статический сайт.

Важно: `kreisphoto.de` сейчас используется как временный домен для проекта Kiku Bistro. Когда будет готов финальный домен, нужно будет обновить DNS, nginx и TLS-сертификат.

## Структура проекта

```text
.
|-- index.html          # Главная страница
|-- styles.css          # Основные стили
|-- impressum.html      # Impressum и Datenschutz
|-- agb.html            # AGB
|-- Bistro.pdf          # Актуальное PDF-меню
|-- HANDOVER.md         # Технический хэндовер проекта
`-- assets/             # Изображения и логотип
```

Ключевые ассеты:

```text
assets/logo-white.png
assets/hero-bread.jpg
assets/dish-4.jpg
assets/dish-editorial.jpg
assets/interior-kiku-144.jpg
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

После этого открыть:

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

```powershell
git status
git add .
git commit -m "Update site"
git push
```

После `push` обновленная версия деплоится на VPS.

## VPS и деплой

Текущий VPS:

```text
212.227.28.224
```

Папка сайта на сервере:

```text
/var/www/kiku-site
```

nginx config:

```text
/etc/nginx/conf.d/kiku-site.conf
```

Текущие домены в nginx:

```text
kreisphoto.de
www.kreisphoto.de
```

Для деплоя нужно копировать на сервер:

```text
index.html
styles.css
impressum.html
agb.html
Bistro.pdf
assets/
```

После копирования файлов на сервер:

```bash
chown -R nginx:nginx /var/www/kiku-site
find /var/www/kiku-site -type d -exec chmod 755 {} +
find /var/www/kiku-site -type f -exec chmod 644 {} +
nginx -t
systemctl reload nginx
```

## Состояние сервера

Сайт отдается напрямую через nginx.

Старый backend-сервис отключен:

```text
kiku-booking.service
```

Ожидаемые публичные порты:

```text
22
80
443
```

Backup перед первым деплоем:

```text
/root/kiku-backups/kiku-site-before-deploy-20260425-103724.tar.gz
```

## Контент

Текущее меню было перенесено из `Bistro.pdf`.

Цены завтраков считаются надежными. Часть цен lunch и напитков нужно перепроверить по финальному меню, потому что PDF некорректно отдавал порядок колонок при извлечении текста.

Перед финальной публикацией нужно проверить:

```text
1. Все цены меню.
2. Часы работы.
3. Телефон, email и адрес.
4. Impressum, Datenschutz и AGB.
```

## Дизайн

Задача дизайна: сохранить ощущение исходного Wix-сайта, но сделать сайт современнее, чище и визуально дороже.

Текущее направление:

```text
бледно-зеленый основной фон
темно-зеленая типографика
акценты натурального дерева
крупный фотографический hero
большой логотип Kiku Bistro
editorial-верстка ресторанного сайта
минимум карточек и прямоугольных блоков
читабельное меню с группировкой по разделам
```

## Ближайшие улучшения

Технические задачи:

```text
1. Оптимизировать большие изображения и сделать WebP-версии.
2. Добавить простой deploy-скрипт.
3. Настроить SSH-доступ по ключу.
4. После проверки SSH-ключа отключить вход root по паролю.
5. Обновить nginx и Let's Encrypt при переезде на финальный домен.
```

Контент и дизайн:

```text
1. Заменить временные фото на финальные фото зала и блюд.
2. Финально проверить цены меню.
3. Вычитать немецкие тексты.
4. Проверить мобильную верстку в браузере.
```

## Хэндовер

Полный технический контекст проекта:

```text
HANDOVER.md
```

Общий индекс проектов на локальной машине:

```text
C:\Users\Sergej\Documents\Codex\PROJECTS.md
```
