# Kiku Bistro - Handover

Update 2026-07-09:
- Menu update prepared from user-provided `/Users/ulia/Desktop/Bistro new1.pdf` created at 2026-07-09 12:03 CEST.
- Public PDF menu `Kiku-Bistro-Menu.pdf` was replaced with a sanitized 3-page version containing only pages 2-4 from the source PDF. The first page with guest Wi-Fi credentials was intentionally not published. New SHA256: `cfaaffcfb19703606cad4a42291eba70555c320cd3dda0a54f115d42ab97fc8b`.
- Visible food menu was updated on DE and EN, then regenerated for FR, NL, PL, CS, IT, ES, PT, JA.
- Main visible changes: lunch `Gnocchi` and `Schnitzel` were removed; `Fischsuppe` was added at 18,9 EUR; desserts now include `Süßes Croissant` at 10,5 EUR and `Schichttorte` at 6,9 EUR; `Honigkuchen` was removed; `Burrata-Salat` spelling was corrected.
- `sitemap.xml` lastmod values for public menu pages and the PDF were updated to `2026-07-09`.
- Locale generator dictionaries were extended for the new menu strings so future regeneration keeps the translated pages localized.

- Website-side conversion tracking is now active for the Bistro site. Public language pages track `tel:`, `mailto:`, Google Maps route, and PDF menu clicks in Matomo and map the same high-intent clicks to Google Ads keys `phone`, `email`, `route`, and `menu_pdf`.
- Matomo goal added for site ID 1: `Telefon Klick` with `event_action contains "Telefon"`. Existing goals remain `Route geplant`, `E-Mail Klick`, and `PDF Menue geoeffnet`.
- `scripts/generate-locales.mjs` was aligned with the current language switcher so future locale regeneration keeps IT/ES/PT/JA links.
- Google Ads conversion tracking was added for the Bistro campaign workflow. In Google Ads, a website conversion action was created: `KIKU Bistro Website Interaction`, category `Contact`, primary action, count `One`, default value `1 EUR`. Event snippet target: `AW-11328671562/KH47CO3Zus0cEMqe95kq`.
- `assets/google-ads-conversions.js` is loaded by all public language index pages. It installs the Google tag, defines `window.KIKU_GOOGLE_ADS_CONVERSIONS`, maps all four website actions to the Google Ads conversion action, and does not change the visible site.
- Enhanced conversions were intentionally not enabled; no email/phone user-provided data is sent to Google Ads. The Google tag is configured with `allow_ad_personalization_signals` set to `false` and `send_page_view: false`.
- `impressum.html` / Datenschutz was updated with a Google Ads Conversion Tracking section. This is a factual implementation note and should still be treated as subject to legal review.
- Follow-up after deploy: use Google Ads Tag Assistant / conversion diagnostics and then re-check Google Ads conversion status after 24-48 hours. Initial status may remain inactive until a valid tagged click happens and Google processes it.

Update 2026-07-01:
- PDF-only menu refresh prepared from the latest user-provided `/Users/ulia/Desktop/Bistro new.pdf` created at 2026-07-01 11:56 CEST.
- Visible food menu content matched the already deployed 2026-07-01 menu, so DE/EN and generated locale HTML were not changed in this refresh.
- Public PDF menu `Kiku-Bistro-Menu.pdf` was replaced with a sanitized 3-page version containing only the menu pages. The first page with guest Wi-Fi credentials was intentionally not published. New SHA256: `aea8d5a2f41bc4778b0c5cf0d9546f764e62eb5b8e7f38bc3c7f672172981593`.
- Production deploy completed from commit `9147b99 Refresh Bistro menu PDF`; GitHub Actions run `28510987407` succeeded. Production checks after deploy returned 200 for all public locale pages, reservation/admin pages, robots.txt, sitemap.xml, llms.txt, and the PDF; live PDF SHA256 matched local `aea8d5a2f41bc4778b0c5cf0d9546f764e62eb5b8e7f38bc3c7f672172981593`; the live PDF has 3 pages and no Wi-Fi page marker.
- Local checks completed: PDF metadata/page count check, visual PDF page render via Poppler/pdftoppm, local HTTP checks, and production HTTP/hash checks.

Update 2026-07-01:
- Menu update prepared from user-provided `/Users/ulia/Desktop/Bistro new.pdf`.
- Public PDF menu `Kiku-Bistro-Menu.pdf` was replaced with a sanitized 3-page version containing only the menu pages. The first page with guest Wi-Fi credentials was intentionally not published. New SHA256: `c96d8ee722465a9fc73fc39726effa84e677c6d39f1e62bf561713726d4d02ad`.
- Visible food menu was updated on DE and EN, then regenerated for FR, NL, PL, CS, IT, ES, PT, JA.
- Main food changes: breakfast Brotkörbchen is now 10,5 EUR; Stulle - Benedict base is 11,9 EUR with roast beef 16,9 EUR; Stulle - Tomaten und Burrata added at 13,9 EUR; Shakshuka is 14,9 EUR; French Toast is 12,9 EUR; Kardamomschnecke is 6,9 EUR.
- Lunch changes: simple Brotkörbchen is 3,5 EUR and Brotkörbchen mit Butter & Dips is 10,5 EUR; Hummus is 7,9 EUR; Rindertatar and Burrata-Salat are 11,9 EUR; Caesar Salat, Schnitzel and Trüffelrisotto were added; Fjordforellensteak, Spitzkohl Steak and Süßes Croissant were removed.
- Locale generator dictionaries were extended for the new menu strings so future regeneration keeps the translated pages localized.
- Production deploy completed from commit `8bfc4b1 Update Bistro menu`; GitHub Actions run `28508448210` succeeded. Production checks after deploy returned 200 for all public locale pages, reservation/admin pages, robots.txt, sitemap.xml, llms.txt, and the PDF; live PDF SHA256 matched local `c96d8ee722465a9fc73fc39726effa84e677c6d39f1e62bf561713726d4d02ad`.
- `sitemap.xml` lastmod values were updated to `2026-07-01`.
- Local checks completed: locale generators, PDF metadata/page count check, PDF render via Poppler/pdftoppm, static HTML checks, and local HTTP checks.

Update 2026-06-28:
- AI/search optimization added as website code with no visual UI change: root `llms.txt`, explicit `Allow: /llms.txt` in `robots.txt`, `llms.txt` entry in `sitemap.xml`, and production deploy copy in `scripts/deploy-production.sh`.
- Root `index.html` JSON-LD was expanded from a basic `Restaurant` object to an `@graph` with `Restaurant`/`CafeOrCoffeeShop`, `Menu`, and `WebSite`. It now includes disambiguation from KIKU Restaurant at Pölle 8, geo coordinates for Steinbrücke 2 (`51.7883485`, `11.1418539` from OpenStreetMap/Nominatim), area served Quedlinburg, reservation action, opening hours, and structured menu sections/items/prices. The structured menu was refreshed again on 2026-07-01.
- Validation completed locally: JSON-LD parsed with Node from `index.html`; `sitemap.xml` contains `https://kiku-bistro.de/llms.txt`; `llms.txt` contains Bistro/Restaurant disambiguation; `node --check` passed for locale generator scripts. After deploy, verify `https://kiku-bistro.de/llms.txt` returns 200 and production homepage still exposes the JSON-LD graph.
- Google Ads live fix completed for the wrong local ad card shown on breakfast searches such as `frühstück quedlinburg sonntag`. Root cause: both Kiku Google Business Profile locations were inherited through the account-level location asset (`all locations`), so the Bistro breakfast ad could render the Restaurant GBP card `KIKU, Pölle 8` while using Bistro ad copy.
- Bistro campaign `23977868810` (`KIKU Bistro | Suche lokal`) now uses campaign-level location group `KIKU Bistro only`, containing only `KIKU Bistro, Steinbrücke 2, 06484 Quedlinburg`. Verified in Google Ads on 2026-06-28: active association row `KIKU Bistro only KIKU Bistro | Suche lokal Campaign`; no active `all locations` account-level association.
- Restaurant campaign `23979471269` (`KIKU Restaurant | Fine Dining Search`) now uses campaign-level location group `KIKU Restaurant only`, containing only `KIKU, Pölle 8, 06484 Quedlinburg`. Verified in Google Ads on 2026-06-28: active association row `KIKU Restaurant only KIKU Restaurant | Fine Dining Search Campaign`; no active `all locations` account-level association.
- Restaurant campaign negatives added at campaign level as broad match to stop breakfast/Bistro intent from matching the fine-dining campaign: `frühstück`, `fruehstueck`, `breakfast`, `brunch`, `café`, `cafe`, `kaffee`, `coffee`, `lunch`, `mittagessen`, `mittagstisch`, `bistro`.
- Bistro campaign negatives added at campaign level as broad match to stop holiday and restaurant/fine-dining intent from matching the Bistro campaign: `urlaub`, `jan fribus`, `fine dining`, `fine-dining`, `degustation`, `abendessen`, `dinner`, `kiku restaurant`. Important: broad negative `restaurant` was intentionally not added, to avoid cutting normal lunch/cafe discovery too aggressively.
- Important Google Ads UI note: the lower location asset performance/reporting table can still show historical rows for both `KIKU Pölle 8` and `KIKU Bistro Steinbrücke 2`. For active configuration, trust the upper association grid row and confirm `all locations` is not active.
- External mobile Google Search check after the fix: `frühstück quedlinburg sonntag`, `frühstück quedlinburg`, and `brunch quedlinburg` showed Sponsored `KIKU Bistro` with address `2 Steinbrücke`; no Sponsored `KIKU`/Pölle restaurant card appeared for those breakfast/brunch queries. `lunch quedlinburg` and `mittagessen quedlinburg` showed the Bistro campaign as eligible in Google's advertiser overlay, but no paid KIKU card appeared in that live SERP sample.
- Wider external mobile SERP matrix on 2026-06-28 covered breakfast/brunch/cafe/lunch/Bistro brand/Restaurant brand/fine-dining/dinner/negative-intent queries. No wrong Sponsored `KIKU`/Pölle restaurant card appeared on Bistro intent. Restaurant campaign was not eligible on Bistro breakfast/brunch/cafe/lunch query samples. Hotel/delivery/jobs/recipe negatives held. `urlaub quedlinburg frühstück` still showed Bistro campaign eligible in Google's advertiser overlay, so verify/add the Bistro `urlaub` negative once Ads UI access works again. Restaurant/fine-dining/generic restaurant queries did not show a user-facing Sponsored KIKU card in the sample, but Bistro campaign was often eligible; verify search terms later and add Bistro negatives if it spends on restaurant intent.
- After adding the Bistro negatives, external mobile Google Search was rechecked: `urlaub quedlinburg frühstück`, `kiku restaurant quedlinburg`, `restaurant kiku quedlinburg`, `jan fribus quedlinburg`, `fine dining quedlinburg`, and `abendessen quedlinburg` no longer made Bistro campaign eligible. Restaurant campaign remained eligible for `kiku restaurant`, `restaurant kiku`, `jan fribus`, and `fine dining`; `abendessen quedlinburg` showed no KIKU Sponsored card in the live sample.
- Live Google Search/Maps ads may need propagation time. Re-check the query that triggered the screenshot after propagation and again in the 2026-07-02 to 2026-07-04 review window.

Update 2026-06-27:
- Google Ads work was completed in the browser, not as website code. No website code/content change was needed for this marketing session.
- Docs-only commit `be67b4b docs: add Google Ads handoff` pushed after the Ads work and the GitHub Actions `Deploy production` workflow run `28291282632` completed successfully. This synced docs but did not change the public menu/content.
- Google Ads access issue on the current Mac was caused by DNS resolving `ads.google.com` to `0.0.0.0`/`::` through local/Tailscale DNS. Temporary workstation fix applied: Tailscale DNS acceptance disabled and Wi-Fi DNS set to `8.8.8.8` and `1.1.1.1`; DNS cache flushed. This is local machine state, not a repo/server change.
- KIKU Bistro campaign `23977868810` (`KIKU Bistro | Suche lokal`) was optimized for breakfast/lunch search demand. Budget changed from `5,00 EUR/day` to `10,00 EUR/day`.
- Bistro keywords now include additional exact/phrase breakfast, brunch, lunch, mittagessen, bistro, cafe/kaffee and KIKU Bistro Quedlinburg terms. Some very narrow keywords are expected to show "low search volume"; keep them for high-intent coverage unless they create clutter later.
- Bistro negative keywords expanded at campaign level to protect spend from hotel/holiday/recipe/job/delivery intent, including terms such as `hotel`, `urlaub`, `rezept`, `jobs`, `lieferdienst`, `takeaway`, `uebernachtung`.
- Bistro ad schedule was changed from all-day/all-week to Wednesday-Sunday `08:00-15:00` in Europe/Berlin. On 2026-07-02 an evening breakfast-planning test was added for Tuesday-Saturday `18:00-22:00`; budget stayed `10,00 EUR/day`.
- Bistro responsive search ad already mentions `Fruehstueck, Lunch und Kaffee im KIKU Bistro in Quedlinburg`; Google still marked ad strength as poor, so next optimization can add more headline/description variants if the UI permits without triggering final URL reauth.
- KIKU Restaurant campaign `23979471269` (`KIKU Restaurant | Fine Dining Search`) was published earlier in the session. Budget: `8,00 EUR/day`. Positioning: special occasion / fine dining, broader regional reach than Quedlinburg only.
- Next Ads review window: 2026-07-05 to 2026-07-09. Check search terms, CPC, spend, top-of-page visibility for `fruehstueck/fruehstueck quedlinburg`, morning vs evening clicks, and whether budget should move from `10 EUR/day` toward `12 EUR/day`.
- Do not paste Google, KeePassXC, Matomo or server secrets into chat or docs. If Matomo data is needed later, use the existing account access only through the browser/session and summarize metrics, not credentials.

Update 2026-06-26:
- Menu update from `C:\Users\Sergej\Downloads\Bistro new (2).pdf` was deployed to production from commit `2b3acc8 Update Bistro menu`; GitHub Actions run `28230668078` succeeded.
- Public PDF menu `Kiku-Bistro-Menu.pdf` was replaced locally. New SHA256: `FEE11FE868E9E7F934652239B4E20CAA836D687B29009483DA06D29E17D76BB0`.
- Visible food menu was updated on DE and EN, then regenerated for FR, NL, PL, CS, IT, ES, PT, JA.
- Main food changes: Eggs Benedict with asparagus is now 13 EUR, with roast beef 17 EUR; Lachstatar is now 13,5 EUR; Pate was removed; Tomaten-Salat became Buratta-Salat with tomato, salad mix and pesto; Tiramisu is now served with ice cream; Honigkuchen mit Eis and Suesses Croissant were added.
- `sitemap.xml` lastmod values were updated to `2026-06-26`.
- Local checks completed: locale generators, PDF render via Poppler/pdftoppm, desktop/mobile browser menu check against the local static server, and PDF HTTP response check.
- Note: the deployed PDF still contains the guest Wi-Fi page, same as the previous menu PDF family. This was accepted for the current deploy; future menu PDFs should still be reviewed for public-safe content before deploy.

Update 2026-06-21:
- Multilingual design-review fix deployed to production from commit `8bcc8ee Fix Japanese mobile intro overflow`; GitHub Actions run `27911744973` succeeded.
- Production review found one real visual issue: `/ja/` on mobile had horizontal overflow in the intro/about section because the second intro heading line used `white-space: nowrap`.
- Fix: `styles.css` now gives intro grid children `min-width: 0` and allows the Japanese intro heading's last line to wrap. CSS cache-buster updated to `styles.css?v=20260621-design-review-1` in HTML pages and locale generators.
- Verification before deploy: DE, EN, FR, NL, PL, CS, IT, ES, PT and JA passed desktop `1440x1000`, mobile `390x844`, and opened mobile-menu checks with no horizontal overflow, text overflow, text overlaps, missing above-fold images, or console errors.
- Production checks after deploy: `/`, `/en/`, `/fr/`, `/nl/`, `/pl/`, `/cs/`, `/it/`, `/es/`, `/pt/`, `/ja/`, `/reservation.html`, `/admin.html`, and `/Kiku-Bistro-Menu.pdf` returned 200; `/ja/#about` at `390x844` uses `styles.css?v=20260621-design-review-1`, has no horizontal overflow and no console errors.

Update 2026-06-21:
- Local language suggestion deployed to production from commit `b36d6c7 Add language suggestion prompt`; GitHub Actions run `27897881594` succeeded.
- Added `assets/language-suggest.js`, a soft browser-language prompt. It checks `navigator.languages`, supports DE, EN, FR, NL, PL, CS, IT, ES, PT and JA, and shows a small dismissible banner instead of an automatic redirect.
- The prompt stores manual language choices and dismissals in `localStorage`, preserves menu/reservation hashes where possible, and tracks prompt events in Matomo when `_paq` is available.
- All public language pages include the script; no server-side `Accept-Language` redirect was added.
- Production checks after deploy: public locale pages, the language suggestion JS and CSS returned 200; root and FR pages include the script; canonical and hreflang metadata remained valid; a production Playwright check switched a French browser from `/` to `/fr/`.

Update 2026-06-21:
- Menu update from `C:\Users\Sergej\Desktop\Bistro new.pdf` was deployed to production from commit `6d7827b Update Bistro menu`; GitHub Actions run `27897585939` succeeded.
- Public PDF menu `Kiku-Bistro-Menu.pdf` was replaced locally. New SHA256: `0FE982250473200482E79D9CBF3292BD9F2642FF70E7DD20211FF791ADAE9400`.
- Visible food menu was updated on DE and EN, then regenerated for FR, NL, PL, CS, IT, ES, PT, JA.
- Main food changes: breakfast Eggs Benedict is now one brioche group with asparagus, roast beef, salmon and jamon; breakfast added Lachstatar; removed Suesses Croissant; French Toast now has pistachio ice cream; Kardamomschnecke now has apple.
- Lunch changes: Brotkorbchen uses Muhammara; removed Trio von Dips and Lachssalat; Rindertatar now has mushrooms and brioche; Tomaten-Salat replaces Tomaten-Stracciatella-Salat; Gnocchi mit Gorgonzola replaces Kimchisuppe; Rinderragout uses Steinpilze; Singapur Chili Huhn includes paprika; Honigkuchen was removed.
- `sitemap.xml` lastmod values were updated to `2026-06-21`.
- Note: the new PDF still contains the guest Wi-Fi page, same as the previous menu PDF family. Future menu PDFs should be reviewed for public-safe content before deploy.

Update 2026-06-21:
- Frontend performance/robustness update deployed to production from commit `ab787b3 Improve image loading and mobile layout`; GitHub Actions run `27907774698` succeeded.
- Public locale index pages (DE, EN, FR, NL, PL, CS, IT, ES, PT, JA) now include explicit `width`/`height` image attributes, `decoding="async"`, lazy loading for below-fold images, and `fetchpriority="high"` for the hero bread image.
- `styles.css` now sets base `img { height: auto; }` so HTML image dimensions reserve layout space without stretching logos, and mobile reservation grid items use `min-width: 0` to avoid horizontal overflow.
- CSS cache-buster updated to `styles.css?v=20260621-image-attrs-3` in public, reservation, admin, legal pages, and locale generators.
- Verification after changes: `python3 -m py_compile server.py`, `node --check` for JS/MJS files, locale generators, GitHub Actions smoke test, production URL checks, and in-app browser desktop/mobile checks passed with no console errors and no horizontal overflow.

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

Последнее обновление: 2026-07-09

## Быстрый контекст

Kiku Bistro - статический сайт бистро в Quedlinburg. Сайт уже работает на production-домене:

```text
https://kiku-bistro.de/
```

Аналитика Matomo работает на отдельном поддомене:

```text
https://analytics.kiku-bistro.de/
```

Marketing / Google Ads context as of 2026-07-02:

```text
Bistro campaign: KIKU Bistro | Suche lokal, campaignId 23977868810, budget 10,00 EUR/day, schedule Wednesday-Sunday 08:00-15:00 plus Tuesday-Saturday 18:00-22:00.
Bistro focus: breakfast, brunch, lunch, mittagessen, cafe/kaffee and KIKU Bistro searches in Quedlinburg.
Bistro location asset: campaign-level group KIKU Bistro only, only KIKU Bistro at Steinbrücke 2.
Bistro negatives: hotel/holiday/accommodation/delivery/jobs/recipe intent plus restaurant/fine-dining intent such as urlaub, jan fribus, fine dining, abendessen, dinner, kiku restaurant.
Restaurant campaign: KIKU Restaurant | Fine Dining Search, campaignId 23979471269, budget 8,00 EUR/day, fine-dining/special-occasion positioning.
Restaurant location asset: campaign-level group KIKU Restaurant only, only KIKU at Pölle 8.
Restaurant negatives: breakfast/brunch/cafe/kaffee/lunch/mittagessen/bistro intent excluded at campaign level.
Next Ads check: 2026-07-05 to 2026-07-09.
```

Conversion / analytics context as of 2026-07-09:

```text
Matomo goals for site ID 1: Route geplant, E-Mail Klick, PDF Menue geoeffnet, Telefon Klick.
Website click events: route links, email links, PDF menu links, menu tabs, and phone links.
Google Ads website conversion hook is active via assets/google-ads-conversions.js and one conversion action: KIKU Bistro Website Interaction.
```

Current public menu/PDF as of 2026-07-09:

```text
Menu source: /Users/ulia/Desktop/Bistro new1.pdf
Public PDF SHA256: cfaaffcfb19703606cad4a42291eba70555c320cd3dda0a54f115d42ab97fc8b
Public PDF is sanitized to 3 menu pages; the source PDF's first page with guest Wi-Fi credentials is intentionally not published.
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

Последний content-changing production deploy: 2026-07-01.

```text
Commit: 9147b99 Refresh Bistro menu PDF
Workflow run: 28510987407
Result: success
Проверка после деплоя: все языковые страницы DE/EN/FR/NL/PL/CS/IT/ES/PT/JA, reservation.html, admin.html, robots.txt, sitemap.xml, llms.txt и Kiku-Bistro-Menu.pdf отдают 200. Live PDF SHA256 совпадает с локальным `aea8d5a2f41bc4778b0c5cf0d9546f764e62eb5b8e7f38bc3c7f672172981593`; live PDF содержит 3 страницы меню и не содержит Wi-Fi page marker.
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
be67b4b docs: add Google Ads handoff
2b3acc8 Update Bistro menu
8bcc8ee Fix Japanese mobile intro overflow
ab787b3 Improve image loading and mobile layout
6d7827b Update Bistro menu
b36d6c7 Add language suggestion prompt
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

Последнее обновление меню и PDF выполнено 2026-07-01 из файла `/Users/ulia/Desktop/Bistro new.pdf`:

```text
Kiku-Bistro-Menu.pdf заменен актуальным публичным PDF из 3 страниц меню; SHA256 aea8d5a2f41bc4778b0c5cf0d9546f764e62eb5b8e7f38bc3c7f672172981593.
Frühstück и Ab 12:00 Uhr обновлены на DE и EN, затем локали FR/NL/PL/CS/IT/ES/PT/JA регенерированы.
Frühstück: Brotkörbchen 10,5 EUR; Stulle - Benedict 11,9 EUR; Stulle - Tomaten und Burrata 13,9 EUR.
Ab 12:00 Uhr: Brotkörbchen 3,5 EUR; Brotkörbchen mit Butter & Dips 10,5 EUR; Caesar Salat added.
Hauptgänge: Gnocchi 21,9 EUR; Rinderragout 24,5 EUR; Schnitzel and Trüffelrisotto added.
Desserts: Kardamomschnecke 6,9 EUR; Tiramisu and Honigkuchen updated without "mit Eis" in the visible item names.
Напитки, вина и коктейли из PDF не выводятся на сайте как отдельная вкладка.
Публичный PDF не содержит первую страницу исходного PDF с guest Wi-Fi credentials; перед будущим деплоем PDF все равно проверять на public-safe content.
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

Важно по Eggs Benedict после обновления 2026-06-26:

```text
EGGS BENEDIKT AUF BRIOCHE
Pochierte Eier, Avocado, Hollandaise
- MIT SPARGEL
  13 €
- MIT ROASTBEEF
  17 €

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
