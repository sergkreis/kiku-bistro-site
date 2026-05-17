#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/sergkreis/kiku-bistro-site.git}"
BRANCH="${BRANCH:-main}"
CHECKOUT="${CHECKOUT:-/opt/kiku-bistro-site}"
WEBROOT="${WEBROOT:-/var/www/kiku-site}"
BACKEND="${BACKEND:-/opt/kiku-reservations}"
DATA_DIR="${DATA_DIR:-/var/lib/kiku-reservations}"

if [ ! -d "$CHECKOUT/.git" ]; then
  rm -rf "$CHECKOUT"
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$CHECKOUT"
else
  git -C "$CHECKOUT" fetch --prune origin "$BRANCH"
  git -C "$CHECKOUT" reset --hard "origin/$BRANCH"
fi

install -d -o www-data -g www-data "$WEBROOT"
install -d -o root -g root "$BACKEND"
install -d -o root -g root "$BACKEND/infra"
install -d -o www-data -g www-data -m 750 "$DATA_DIR"

install -o www-data -g www-data -m 644 "$CHECKOUT/index.html" "$WEBROOT/index.html"
install -o www-data -g www-data -m 644 "$CHECKOUT/styles.css" "$WEBROOT/styles.css"
install -o www-data -g www-data -m 644 "$CHECKOUT/impressum.html" "$WEBROOT/impressum.html"
install -o www-data -g www-data -m 644 "$CHECKOUT/agb.html" "$WEBROOT/agb.html"
install -o www-data -g www-data -m 644 "$CHECKOUT/Bistro.pdf" "$WEBROOT/Bistro.pdf"
install -o www-data -g www-data -m 644 "$CHECKOUT/admin.html" "$WEBROOT/admin.html"
install -o www-data -g www-data -m 644 "$CHECKOUT/booking.js" "$WEBROOT/booking.js"
rsync -a --delete --chown=www-data:www-data "$CHECKOUT/assets/" "$WEBROOT/assets/"

install -o root -g root -m 644 "$CHECKOUT/server.py" "$BACKEND/server.py"
rsync -a --delete --chown=root:root "$CHECKOUT/infra/reservations/" "$BACKEND/infra/reservations/"
install -o root -g root -m 644 \
  "$CHECKOUT/infra/reservations/kiku-reservations.service" \
  /etc/systemd/system/kiku-reservations.service

python3 -m py_compile "$BACKEND/server.py"
systemctl daemon-reload
systemctl restart kiku-reservations
nginx -t
systemctl reload nginx

echo "deployed_commit=$(git -C "$CHECKOUT" rev-parse --short HEAD)"
echo "kiku-reservations=$(systemctl is-active kiku-reservations)"
echo "nginx=$(systemctl is-active nginx)"
