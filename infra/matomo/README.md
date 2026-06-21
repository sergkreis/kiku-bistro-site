# Matomo Analytics

Production Matomo runs on the Kiku Bistro VPS in `/opt/kiku-matomo`.

Last documentation update: 2026-06-21.

Public URL:

```text
https://analytics.kiku-bistro.de/
```

The public site tracks to:

```text
https://analytics.kiku-bistro.de/matomo.php
```

The public JavaScript tracker is loaded from:

```text
https://analytics.kiku-bistro.de/matomo.js
```

Site ID:

```text
1
```

Current privacy mode:

- self-hosted Matomo
- no Matomo tracking cookies on the public site
- browser feature detection disabled
- IP masking is enabled in Matomo config (`ip_address_mask_length = 2`)
- important click events tracked:
  - route planning links
  - email links
  - PDF menu link
  - menu tab clicks

Production nginx exposes Matomo through a dedicated virtual host:

```text
analytics.kiku-bistro.de -> 127.0.0.1:8081 -> kiku-matomo-app
```

The old path redirects to the subdomain:

```text
https://kiku-bistro.de/analytics/ -> https://analytics.kiku-bistro.de/
```

Do not commit production passwords. The production compose file and admin
credentials live only on the server.


## City geolocation and goals update

Updated on 2026-05-08.

```text
GeoIP provider: geoip2php
GeoIP database: /var/www/html/misc/DBIP-City.mmdb
GeoIP update URL: DBIP City Lite monthly download
GeoIP update period: month
```

New visits can show country, region and city in Matomo. Older visits may keep an
empty city because they were tracked before the city database was installed and
stored with masked IPs.

Goals configured in Matomo for site ID 1:

```text
Route geplant       -> event_action contains "Route planen"
E-Mail Klick        -> event_action contains "E-Mail"
PDF Menue geoeffnet -> event_action contains "PDF"
```

The public site uses `enableHeartBeatTimer` in the Matomo JavaScript tracker so
single-page visits get more accurate time-on-site measurements.

## Current menu tracking context

Updated on 2026-06-21.

```text
Current public PDF: https://kiku-bistro.de/Kiku-Bistro-Menu.pdf
Current menu source file: latest user-provided PDF from 2026-06-21
Menu deploy commit: 6d7827b Update Bistro menu
Production workflow run: 27897585939, success
```

The public site keeps one canonical PDF filename, `Kiku-Bistro-Menu.pdf`, across
all languages. Locale generation scripts repair translated PDF hrefs back to
this filename so Matomo PDF click tracking remains grouped under the same URL.

The visible website menu still tracks only the food tabs (`Frühstück` and
`Ab 12:00 Uhr`). Drinks, wine and cocktails are present in the PDF, but are not
rendered as a separate website tab.

## Local analytics reports

Generated reports are local artifacts under `output/pdf/`. They are currently
untracked unless the user explicitly decides to commit or publish them.

```text
May 2026 report:
output/pdf/kiku-bistro-statistik-mai-2026.pdf
output/pdf/kiku-bistro-statistik-mai-2026-data.json

Weekly report, 31.05.2026 - 06.06.2026:
output/pdf/kiku-bistro-wochenstatistik-2026-05-31-bis-2026-06-06.pdf
output/pdf/kiku-bistro-wochenstatistik-2026-05-31-bis-2026-06-06-data.json
```

## Instagram UTM links

Use these links when placing Kiku Bistro URLs in Instagram. Matomo will group
them as Instagram traffic and separate bio, stories and posts by `utm_content`.

```text
Bio:
https://kiku-bistro.de/?utm_source=instagram&utm_medium=social&utm_campaign=instagram&utm_content=bio

Stories:
https://kiku-bistro.de/?utm_source=instagram&utm_medium=social&utm_campaign=instagram&utm_content=story

Posts:
https://kiku-bistro.de/?utm_source=instagram&utm_medium=social&utm_campaign=instagram&utm_content=post
```

For one-off campaigns, keep `utm_source=instagram` and `utm_medium=social`, then
change only `utm_campaign`, for example:

```text
https://kiku-bistro.de/?utm_source=instagram&utm_medium=social&utm_campaign=menu_may_2026&utm_content=story
```
