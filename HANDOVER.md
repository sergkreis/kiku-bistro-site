# Kiku Bistro Site Handover

Global projects index:

```text
C:\Users\Sergej\Documents\Codex\PROJECTS.md
```

## Project

Static website for Kiku Bistro in Quedlinburg.

Repository:
https://github.com/sergkreis/kiku-bistro-site

Current live URL:
https://kiku-bistro.de/

Important note: the production domain is `kiku-bistro.de`. DNS points to `217.154.193.255`, and HTTPS is active for `kiku-bistro.de` and `www.kiku-bistro.de`.

## Local Project Path

```text
C:\Users\Sergej\Documents\Codex\2026-04-20-kiku-bistro-https-info74051613-wixsite-com
```

## Main Files

```text
index.html
styles.css
impressum.html
agb.html
Bistro.pdf
assets/
```

The site is plain static HTML/CSS/JS, with no build step.

## Git Workflow

GitHub is the source of truth.

Normal workflow:

```text
edit local files
git status
git add .
git commit -m "Describe change"
git push
deploy to VPS
```

Current branch:

```text
main
```

Remote:

```text
origin https://github.com/sergkreis/kiku-bistro-site.git
```

## VPS

Server:

```text
217.154.193.255
```

OS:

```text
Ubuntu 24.04
```

Web server:

```text
nginx
```

Web root:

```text
/var/www/kiku-site
```

nginx config:

```text
/etc/nginx/sites-available/kiku-site
```

Current nginx domains:

```text
kiku-bistro.de
www.kiku-bistro.de
```

Current TLS certificate:

```text
/etc/letsencrypt/live/kiku-bistro.de/
```

## Current Server State

The Kiku Bistro static site is deployed to:

```text
/var/www/kiku-site
```

nginx serves the site directly.

Open ports checked after deploy:

```text
22
80
443
```

Old backend service:

```text
none on the production VPS
```

Status after deploy:

```text
not applicable
```

The production VPS is clean and serves only the static site through nginx.

## Backup

A server-side backup was created before replacing the previous site:

```text
/root/kiku-backups/kiku-site-before-deploy-20260425-103724.tar.gz
```

## Manual Deploy Notes

There is currently no automated deploy script.

Manual deploy means copying these local files/directories to `/var/www/kiku-site`:

```text
index.html
styles.css
impressum.html
agb.html
Bistro.pdf
assets/
```

Then on the VPS:

```bash
chown -R www-data:www-data /var/www/kiku-site
find /var/www/kiku-site -type d -exec chmod 755 {} +
find /var/www/kiku-site -type f -exec chmod 644 {} +
nginx -t
systemctl reload nginx
```

## Design Direction

The user wants a modern version of the original Wix feeling, not a rectangular/card-heavy layout.

Important design preferences:

- main color should feel like pale green, close to the old Wix site
- accent colors: dark green and natural wood
- large photographic hero with bread
- large white Kiku Bistro logo at the top
- editorial layout, spacious, restaurant-like
- avoid obvious box/card sections
- menu should be readable and grouped by section

Hero / intro copy currently includes:

```text
Sehr französisch. Sehr entspannt. Sehr lebendig.

Das Bistro Kiku ist da.

Als kleiner Bruder des Michelin-gelisteten Restaurant Kiku bringt es große Küche in lockerer Atmosphäre auf den Tisch.

Chef Jan Fribus interpretiert seine besten Rezepte neu - er backt außerdem Croissants, Brot und Kuchen täglich selbst und überrascht mit einem außergewöhnlichen Tagesangebot.

Frühstück. Lunch. Etwas zwischendurch.

Unkompliziert. Und in höchster Qualität.

Jeden Tag in der Steinbrücke - direkt am Marktplatz.

Bonjour et bon appétit!

Wir freuen uns auf euch.
```

## Menu Notes

The current menu was transcribed from `Bistro.pdf`.

Breakfast prices are reliable.

Some lunch and drinks prices were matched from the PDF, but the PDF text extraction had column-order issues. When the final menu arrives, verify and update all prices from the source.

The menu tabs are:

```text
Frühstück
Ab 12:00 Uhr
Getränke
```

Lunch is grouped into:

```text
Vorspeisen
Hauptgänge
Desserts
```

Drinks are grouped into:

```text
Kaffee & Specials
Tee & Hausgemachte Getränke
Wein, Cocktails & Bier
```

## Assets

Important current assets:

```text
assets/logo-white.png
assets/hero-bread.jpg
assets/dish-4.jpg
assets/dish-editorial.jpg
assets/interior-kiku-144.jpg
```

Image sizes are currently large. This should be optimized before final launch.

## Important Security Tasks

The VPS root password was shared in chat during setup. It should be changed.

Recommended next security steps:

```text
1. Add SSH key authentication.
2. Disable password login for root.
3. Keep nginx and certbot active.
4. Remove unused backend files/services if no longer needed.
```

## Domain Migration Tasks

When the real Kiku Bistro domain is ready:

```text
Done:
kiku-bistro.de and www.kiku-bistro.de point to 217.154.193.255.
Let's Encrypt certificate is active.
HTTP redirects to HTTPS.
```

## Legal Tasks

Before final public launch:

```text
1. Verify Impressum details.
2. Verify Datenschutz text for the real hosting setup.
3. Verify AGB text.
4. Confirm opening hours and contact details.
```

## Good Next Improvements

Recommended next technical improvements:

```text
1. Create a deploy script.
2. Optimize images to WebP / responsive sizes.
3. Add a simple README.md.
4. Add cache-busting or asset versioning if needed.
5. Review mobile layout in a browser.
```

Recommended next content/design improvements:

```text
1. Verify all menu prices from final source.
2. Replace temporary photos with final room/food photos.
3. Fine-tune typography and spacing.
4. Recheck German copy.
```

## Quick Start For A New Chat

Use this prompt:

```text
Open HANDOVER.md in the Kiku Bistro project and continue from there.
Local path:
C:\Users\Sergej\Documents\Codex\2026-04-20-kiku-bistro-https-info74051613-wixsite-com
```
