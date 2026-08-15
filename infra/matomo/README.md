# Matomo Analytics

Production Matomo runs on the Kiku Bistro VPS in `/opt/kiku-matomo`.

Last documentation update: 2026-07-09.

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
  - phone links
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

Updated on 2026-07-09.

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
Telefon Klick       -> event_action contains "Telefon"
```

The public site uses `enableHeartBeatTimer` in the Matomo JavaScript tracker so
single-page visits get more accurate time-on-site measurements.

## Current menu tracking context

Updated on 2026-08-15.

```text
Current public PDF: https://kiku-bistro.de/Kiku-Bistro-Menu.pdf
Current menu source file: user-provided Bistro new.pdf from 2026-08-15
Current public PDF SHA256: a131e9444e33c36efa5e24301de11e35d9fd2c830d2fd8354207bdab971cb0f8
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

## Google Ads / CPC campaign context

Updated on 2026-07-02.

The Bistro Google Ads campaign currently points traffic to the Bistro site with
Google CPC UTM parameters:

```text
utm_source=google
utm_medium=cpc
utm_campaign=bistro_search_local
```

Current Bistro campaign focus:

```text
Campaign: KIKU Bistro | Suche lokal
Google Ads campaign ID: 23977868810
Budget: 10,00 EUR/day
Schedule: Wednesday-Sunday, 08:00-15:00 plus Tuesday-Saturday, 18:00-22:00 Europe/Berlin
Intent: breakfast, brunch, lunch, mittagessen, cafe/kaffee and KIKU Bistro searches around Quedlinburg
Location asset: campaign-level group KIKU Bistro only, only KIKU Bistro at Steinbrücke 2
Campaign-level broad negatives include hotel/holiday/accommodation/delivery/jobs/recipe intent plus restaurant/fine-dining terms: urlaub, jan fribus, fine dining, fine-dining, degustation, abendessen, dinner, kiku restaurant
```

Restaurant campaign separation:

```text
Campaign: KIKU Restaurant | Fine Dining Search
Google Ads campaign ID: 23979471269
Budget: 8,00 EUR/day
Location asset: campaign-level group KIKU Restaurant only, only KIKU at Pölle 8
Campaign-level broad negatives: frühstück, fruehstueck, breakfast, brunch, café, cafe, kaffee, coffee, lunch, mittagessen, mittagstisch, bistro
```

The 2026-06-28 Ads fix separated the two Google Business Profile locations after
the Bistro breakfast ad rendered the Restaurant local card in Google Search.
Historical Google Ads location reporting can still show both locations; active
configuration should be checked in the upper location asset association grid.

Next reporting check:

```text
2026-07-02 to 2026-07-04
```

Review Matomo traffic for the `bistro_search_local` UTM campaign together with
Google Ads search terms, CPC, spend, and top-of-page visibility. Keep credential
details out of commits and chat.

## Google Ads conversion bridge

Updated on 2026-07-09.

The public site now has an active Google Ads conversion bridge for tracked click
actions:

```text
phone    -> tel: links, Matomo event_action "Telefon"
email    -> mailto: links, Matomo event_action "E-Mail"
route    -> Google Maps route links, Matomo event_action "Route planen"
menu_pdf -> PDF menu links, Matomo event_action "PDF öffnen"
```

`assets/google-ads-conversions.js` loads the Google tag, defines
`window.KIKU_GOOGLE_ADS_CONVERSIONS`, and maps all four website actions to the
Google Ads conversion action `KIKU Bistro Website Interaction`. Enhanced
conversions are not enabled, and ad personalization signals are disabled on the
tag. The Matomo events remain separate and more granular for local reporting.
