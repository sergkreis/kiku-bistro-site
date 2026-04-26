# Kiku Bistro Website

Static website for **Kiku Bistro** in Quedlinburg.

Current temporary live URL:

https://kreisphoto.de/

Repository:

https://github.com/sergkreis/kiku-bistro-site

## Status

The site is currently deployed to a VPS and served by nginx as a static website.

Important: `kreisphoto.de` is a temporary domain for this project. When the final Kiku Bistro domain is ready, DNS, nginx, and the TLS certificate need to be updated.

## Project Structure

```text
.
|-- index.html          # Main page
|-- styles.css          # Global styling
|-- impressum.html      # Impressum and Datenschutz
|-- agb.html            # Terms page
|-- Bistro.pdf          # Current menu PDF
|-- HANDOVER.md         # Operational handover for future chats/work
`-- assets/             # Images and logo
```

Key assets:

```text
assets/logo-white.png
assets/hero-bread.jpg
assets/dish-4.jpg
assets/dish-editorial.jpg
assets/interior-kiku-144.jpg
```

## Local Development

This project has no build step and no package manager dependency.

Open directly in a browser:

```text
index.html
```

Or run a local static server from the project folder:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

## Git Workflow

GitHub is the source of truth.

Use the `main` branch.

Typical workflow:

```powershell
git status
git add .
git commit -m "Update site"
git push
```

After pushing, deploy the updated static files to the VPS.

## VPS Deployment

Current VPS:

```text
212.227.28.224
```

Web root:

```text
/var/www/kiku-site
```

nginx config:

```text
/etc/nginx/conf.d/kiku-site.conf
```

Current domains in nginx:

```text
kreisphoto.de
www.kreisphoto.de
```

Deploy these files/directories:

```text
index.html
styles.css
impressum.html
agb.html
Bistro.pdf
assets/
```

After copying files to the server:

```bash
chown -R nginx:nginx /var/www/kiku-site
find /var/www/kiku-site -type d -exec chmod 755 {} +
find /var/www/kiku-site -type f -exec chmod 644 {} +
nginx -t
systemctl reload nginx
```

## Server Notes

The site is served directly by nginx.

The old backend service was disabled:

```text
kiku-booking.service
```

Expected public ports:

```text
22
80
443
```

Backup from the first deployment:

```text
/root/kiku-backups/kiku-site-before-deploy-20260425-103724.tar.gz
```

## Content Notes

The current menu was transcribed from `Bistro.pdf`.

Breakfast prices are reliable. Some lunch and drinks prices should be verified against the final source menu because the PDF text extraction had column-order issues.

Before final public launch:

```text
1. Verify all menu prices.
2. Verify opening hours.
3. Verify phone, email, and address.
4. Review Impressum, Datenschutz, and AGB.
```

## Design Direction

The site should feel close to the original Wix version, but more modern and cleaner.

Current direction:

```text
pale green main background
dark green typography
natural wood accents
large photographic hero
large Kiku Bistro logo
editorial restaurant layout
minimal card-like blocks
readable menu grouped by sections
```

## Next Improvements

Recommended technical work:

```text
1. Optimize large images and create WebP versions.
2. Add a simple deploy script.
3. Set up SSH key access for the VPS.
4. Disable root password login after key access is confirmed.
5. Update nginx and Let's Encrypt when the final domain is ready.
```

Recommended content/design work:

```text
1. Replace temporary photos with final room and food photos.
2. Finalize menu prices.
3. Review German copy.
4. Check mobile spacing in a real browser.
```

## Handover

For full operational context, read:

```text
HANDOVER.md
```

Global projects index on the local machine:

```text
C:\Users\Sergej\Documents\Codex\PROJECTS.md
```
