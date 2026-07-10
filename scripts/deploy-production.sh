#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/sergkreis/kiku-bistro-site.git}"
BRANCH="${BRANCH:-main}"
CHECKOUT="${CHECKOUT:-/opt/kiku-bistro-site}"
WEBROOT="${WEBROOT:-/var/www/kiku-site}"
BACKEND="${BACKEND:-/opt/kiku-reservations}"
DATA_DIR="${DATA_DIR:-/var/lib/kiku-reservations}"
WEB_RELEASES_DIR="${WEB_RELEASES_DIR:-${WEBROOT}-releases}"
BACKEND_RELEASES_DIR="${BACKEND_RELEASES_DIR:-${BACKEND}/releases}"

if [ ! -d "$CHECKOUT/.git" ]; then
  rm -rf "$CHECKOUT"
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$CHECKOUT"
else
  git -C "$CHECKOUT" fetch --prune origin "$BRANCH"
  git -C "$CHECKOUT" reset --hard "origin/$BRANCH"
fi

commit="$(git -C "$CHECKOUT" rev-parse --short HEAD)"
release_id="${commit}-$(date -u +%Y%m%d%H%M%S)"
web_stage="$WEB_RELEASES_DIR/.staging-$release_id"
web_release="$WEB_RELEASES_DIR/$release_id"
backend_stage="$BACKEND_RELEASES_DIR/.staging-$release_id"
backend_release="$BACKEND_RELEASES_DIR/$release_id"
previous_web_release=""
previous_backend_release=""
web_activated=false
backend_activated=false

activate_link() {
  local target="$1"
  local link="$2"
  local next_link="${link}.next.$$"

  rm -f "$next_link"
  ln -s "$target" "$next_link"
  mv -Tf "$next_link" "$link"
}

wait_for_url() {
  local attempt

  for attempt in $(seq 1 20); do
    if curl --fail --silent --show-error "$@" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  curl --fail --silent --show-error "$@" >/dev/null
}

rollback() {
  set +e
  echo "Deployment failed; rolling back release links" >&2

  if [ "$backend_activated" = true ] && [ -n "$previous_backend_release" ]; then
    activate_link "$previous_backend_release" "$BACKEND/current"
    systemctl daemon-reload
    systemctl restart kiku-reservations
  fi

  if [ "$web_activated" = true ] && [ -n "$previous_web_release" ]; then
    activate_link "$previous_web_release" "$WEBROOT"
    nginx -t && systemctl reload nginx
  fi
}

finish() {
  local status=$?
  trap - EXIT

  if [ "$status" -ne 0 ]; then
    rollback
  fi
  [ ! -d "$web_stage" ] || rm -rf "$web_stage"
  [ ! -d "$backend_stage" ] || rm -rf "$backend_stage"
  exit "$status"
}

trap finish EXIT

install -d -o root -g root "$WEB_RELEASES_DIR"
install -d -o root -g root "$BACKEND"
install -d -o root -g root "$BACKEND_RELEASES_DIR"
install -d -o www-data -g www-data -m 750 "$DATA_DIR"
install -d -o www-data -g www-data "$web_stage"
install -d -o root -g root "$backend_stage"

for public_file in \
  index.html styles.css robots.txt sitemap.xml llms.txt impressum.html agb.html \
  Kiku-Bistro-Menu.pdf admin.html reservation.html reservierung.html booking.js; do
  install -o www-data -g www-data -m 644 "$CHECKOUT/$public_file" "$web_stage/$public_file"
done

install -d -o www-data -g www-data "$web_stage/assets"
rsync -a --delete --chown=www-data:www-data "$CHECKOUT/assets/" "$web_stage/assets/"
install -o www-data -g www-data -m 644 "$CHECKOUT/assets/favicon.ico" "$web_stage/favicon.ico"

for locale_dir in en fr nl pl cs it es pt ja; do
  install -d -o www-data -g www-data "$web_stage/$locale_dir"
  rsync -a --delete --chown=www-data:www-data "$CHECKOUT/$locale_dir/" "$web_stage/$locale_dir/"
done

for verification_file in "$CHECKOUT"/google*.html "$CHECKOUT"/BingSiteAuth*.xml; do
  [ -e "$verification_file" ] || continue
  install -o www-data -g www-data -m 644 "$verification_file" "$web_stage/$(basename "$verification_file")"
done

install -o root -g root -m 644 "$CHECKOUT/server.py" "$backend_stage/server.py"
install -d -o root -g root "$backend_stage/infra/reservations"
rsync -a --delete --chown=root:root \
  "$CHECKOUT/infra/reservations/" \
  "$backend_stage/infra/reservations/"

test -s "$web_stage/index.html"
test -s "$web_stage/styles.css"
test -s "$web_stage/Kiku-Bistro-Menu.pdf"
for locale_dir in en fr nl pl cs it es pt ja; do
  test -s "$web_stage/$locale_dir/index.html"
done
python3 -m py_compile "$backend_stage/server.py"
nginx -t

mv "$web_stage" "$web_release"
mv "$backend_stage" "$backend_release"

if [ ! -L "$BACKEND/current" ]; then
  legacy_backend="$BACKEND_RELEASES_DIR/legacy-$(date -u +%Y%m%d%H%M%S)"
  install -d -o root -g root "$legacy_backend"
  if [ -f "$BACKEND/server.py" ]; then
    install -o root -g root -m 644 "$BACKEND/server.py" "$legacy_backend/server.py"
  else
    install -o root -g root -m 644 "$backend_release/server.py" "$legacy_backend/server.py"
  fi
  if [ -d "$BACKEND/infra" ]; then
    install -d -o root -g root "$legacy_backend/infra"
    rsync -a --chown=root:root "$BACKEND/infra/" "$legacy_backend/infra/"
  fi
  activate_link "$legacy_backend" "$BACKEND/current"
fi

previous_backend_release="$(readlink -f "$BACKEND/current")"
test -n "$previous_backend_release"
install -o root -g root -m 644 \
  "$CHECKOUT/infra/reservations/kiku-reservations.service" \
  /etc/systemd/system/kiku-reservations.service
activate_link "$backend_release" "$BACKEND/current"
backend_activated=true
systemctl daemon-reload
systemctl restart kiku-reservations
systemctl is-active --quiet kiku-reservations
wait_for_url http://127.0.0.1:8080/api/health

if [ ! -L "$WEBROOT" ]; then
  legacy_web="$WEB_RELEASES_DIR/legacy-$(date -u +%Y%m%d%H%M%S)"
  if [ -d "$WEBROOT" ]; then
    mv "$WEBROOT" "$legacy_web"
  else
    install -d -o www-data -g www-data "$legacy_web"
  fi
  activate_link "$legacy_web" "$WEBROOT"
fi

previous_web_release="$(readlink -f "$WEBROOT")"
test -n "$previous_web_release"
activate_link "$web_release" "$WEBROOT"
web_activated=true
nginx -t
systemctl reload nginx
wait_for_url \
  --resolve kiku-bistro.de:443:127.0.0.1 \
  https://kiku-bistro.de/api/health
wait_for_url \
  --resolve kiku-bistro.de:443:127.0.0.1 \
  https://kiku-bistro.de/

echo "deployed_commit=$commit"
echo "web_release=$web_release"
echo "backend_release=$backend_release"
echo "kiku-reservations=$(systemctl is-active kiku-reservations)"
echo "nginx=$(systemctl is-active nginx)"

web_activated=false
backend_activated=false
