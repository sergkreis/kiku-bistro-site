import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const slots = ["09:30", "10:00", "11:00", "13:00", "17:00", "18:00"];

const pages = {
  de: {
    title: "Kiku Bistro | Reservierung verwalten",
    eyebrow: "Reservierung",
    navReserve: "Reservieren",
    heading: "Reservierung verwalten",
    intro: "Hier können Sie Ihre Reservierung ansehen, die Uhrzeit anpassen oder stornieren.",
    loading: "Reservierung wird geladen...",
    statuses: { pending: "Anfrage", confirmed: "Bestätigt", seated: "Gast da", cancelled: "Storniert", no_show: "Nicht gekommen" },
    date: "Datum",
    guests: "Personen",
    time: "Uhrzeit",
    note: "Notiz",
    save: "Änderung speichern",
    cancel: "Reservierung stornieren",
    notFound: "Reservierung nicht gefunden.",
    updated: "Reservierung wurde aktualisiert.",
    confirmCancel: "Reservierung wirklich stornieren?",
    cancelled: "Reservierung wurde storniert.",
    guestWord: "Personen",
    timePrefix: "um",
    timeSuffix: " Uhr",
  },
  en: {
    title: "Kiku Bistro | Manage reservation",
    eyebrow: "Reservation",
    navReserve: "Reserve",
    heading: "Manage reservation",
    intro: "Here you can view, change or cancel your reservation.",
    loading: "Reservation is loading...",
    statuses: { pending: "Request", confirmed: "Confirmed", seated: "Guest seated", cancelled: "Cancelled", no_show: "No-show" },
    date: "Date",
    guests: "Guests",
    time: "Time",
    note: "Note",
    save: "Save changes",
    cancel: "Cancel reservation",
    notFound: "Reservation not found.",
    updated: "Reservation was updated.",
    confirmCancel: "Do you really want to cancel this reservation?",
    cancelled: "Reservation was cancelled.",
    guestWord: "guests",
    timePrefix: "at",
    timeSuffix: "",
  },
  fr: {
    title: "Kiku Bistro | Gérer la réservation",
    eyebrow: "Réservation",
    navReserve: "Réserver",
    heading: "Gérer la réservation",
    intro: "Vous pouvez ici consulter, modifier ou annuler votre réservation.",
    loading: "Chargement de la réservation...",
    statuses: { pending: "Demande", confirmed: "Confirmée", seated: "Client arrivé", cancelled: "Annulée", no_show: "Non venu" },
    date: "Date",
    guests: "Personnes",
    time: "Heure",
    note: "Note",
    save: "Enregistrer les modifications",
    cancel: "Annuler la réservation",
    notFound: "Réservation introuvable.",
    updated: "La réservation a été mise à jour.",
    confirmCancel: "Voulez-vous vraiment annuler cette réservation ?",
    cancelled: "La réservation a été annulée.",
    guestWord: "personnes",
    timePrefix: "à",
    timeSuffix: "",
  },
  nl: {
    title: "Kiku Bistro | Reservering beheren",
    eyebrow: "Reservering",
    navReserve: "Reserveren",
    heading: "Reservering beheren",
    intro: "Hier kunt u uw reservering bekijken, wijzigen of annuleren.",
    loading: "Reservering wordt geladen...",
    statuses: { pending: "Aanvraag", confirmed: "Bevestigd", seated: "Gast aanwezig", cancelled: "Geannuleerd", no_show: "Niet gekomen" },
    date: "Datum",
    guests: "Personen",
    time: "Tijd",
    note: "Notitie",
    save: "Wijzigingen opslaan",
    cancel: "Reservering annuleren",
    notFound: "Reservering niet gevonden.",
    updated: "Reservering is bijgewerkt.",
    confirmCancel: "Wilt u deze reservering echt annuleren?",
    cancelled: "Reservering is geannuleerd.",
    guestWord: "personen",
    timePrefix: "om",
    timeSuffix: "",
  },
  pl: {
    title: "Kiku Bistro | Zarządzanie rezerwacją",
    eyebrow: "Rezerwacja",
    navReserve: "Zarezerwuj",
    heading: "Zarządzaj rezerwacją",
    intro: "Tutaj możesz sprawdzić, zmienić lub anulować rezerwację.",
    loading: "Ładowanie rezerwacji...",
    statuses: { pending: "Zapytanie", confirmed: "Potwierdzona", seated: "Gość na miejscu", cancelled: "Anulowana", no_show: "Nie przyszedł" },
    date: "Data",
    guests: "Osoby",
    time: "Godzina",
    note: "Notatka",
    save: "Zapisz zmiany",
    cancel: "Anuluj rezerwację",
    notFound: "Nie znaleziono rezerwacji.",
    updated: "Rezerwacja została zaktualizowana.",
    confirmCancel: "Czy na pewno chcesz anulować tę rezerwację?",
    cancelled: "Rezerwacja została anulowana.",
    guestWord: "osoby",
    timePrefix: "o",
    timeSuffix: "",
  },
  cs: {
    title: "Kiku Bistro | Správa rezervace",
    eyebrow: "Rezervace",
    navReserve: "Rezervovat",
    heading: "Správa rezervace",
    intro: "Zde můžete svou rezervaci zobrazit, změnit nebo zrušit.",
    loading: "Rezervace se načítá...",
    statuses: { pending: "Poptávka", confirmed: "Potvrzeno", seated: "Host dorazil", cancelled: "Zrušeno", no_show: "Nedorazil" },
    date: "Datum",
    guests: "Osoby",
    time: "Čas",
    note: "Poznámka",
    save: "Uložit změny",
    cancel: "Zrušit rezervaci",
    notFound: "Rezervace nebyla nalezena.",
    updated: "Rezervace byla aktualizována.",
    confirmCancel: "Opravdu chcete tuto rezervaci zrušit?",
    cancelled: "Rezervace byla zrušena.",
    guestWord: "osoby",
    timePrefix: "v",
    timeSuffix: "",
  },
  it: {
    title: "Kiku Bistro | Gestisci prenotazione",
    eyebrow: "Prenotazione",
    navReserve: "Prenota",
    heading: "Gestisci prenotazione",
    intro: "Qui puoi visualizzare, modificare o cancellare la tua prenotazione.",
    loading: "Caricamento prenotazione...",
    statuses: { pending: "Richiesta", confirmed: "Confermata", seated: "Ospite arrivato", cancelled: "Cancellata", no_show: "Non presentato" },
    date: "Data",
    guests: "Persone",
    time: "Ora",
    note: "Nota",
    save: "Salva modifiche",
    cancel: "Cancella prenotazione",
    notFound: "Prenotazione non trovata.",
    updated: "La prenotazione è stata aggiornata.",
    confirmCancel: "Vuoi davvero cancellare questa prenotazione?",
    cancelled: "La prenotazione è stata cancellata.",
    guestWord: "persone",
    timePrefix: "alle",
    timeSuffix: "",
  },
  es: {
    title: "Kiku Bistro | Gestionar reserva",
    eyebrow: "Reserva",
    navReserve: "Reservar",
    heading: "Gestionar reserva",
    intro: "Aquí puede ver, modificar o cancelar su reserva.",
    loading: "Cargando reserva...",
    statuses: { pending: "Solicitud", confirmed: "Confirmada", seated: "Cliente sentado", cancelled: "Cancelada", no_show: "No presentado" },
    date: "Fecha",
    guests: "Personas",
    time: "Hora",
    note: "Nota",
    save: "Guardar cambios",
    cancel: "Cancelar reserva",
    notFound: "Reserva no encontrada.",
    updated: "La reserva se ha actualizado.",
    confirmCancel: "¿Seguro que desea cancelar esta reserva?",
    cancelled: "La reserva se ha cancelado.",
    guestWord: "personas",
    timePrefix: "a las",
    timeSuffix: "",
  },
  pt: {
    title: "Kiku Bistro | Gerir reserva",
    eyebrow: "Reserva",
    navReserve: "Reservar",
    heading: "Gerir reserva",
    intro: "Aqui pode ver, alterar ou cancelar a sua reserva.",
    loading: "A carregar reserva...",
    statuses: { pending: "Pedido", confirmed: "Confirmada", seated: "Cliente sentado", cancelled: "Cancelada", no_show: "Não compareceu" },
    date: "Data",
    guests: "Pessoas",
    time: "Hora",
    note: "Nota",
    save: "Guardar alterações",
    cancel: "Cancelar reserva",
    notFound: "Reserva não encontrada.",
    updated: "A reserva foi atualizada.",
    confirmCancel: "Tem a certeza de que quer cancelar esta reserva?",
    cancelled: "A reserva foi cancelada.",
    guestWord: "pessoas",
    timePrefix: "às",
    timeSuffix: "",
  },
  ja: {
    title: "Kiku Bistro | 予約の管理",
    eyebrow: "予約",
    navReserve: "予約",
    heading: "予約の管理",
    intro: "こちらで予約内容の確認、変更、キャンセルができます。",
    loading: "予約を読み込んでいます...",
    statuses: { pending: "リクエスト", confirmed: "確定", seated: "来店済み", cancelled: "キャンセル済み", no_show: "無断キャンセル" },
    date: "日付",
    guests: "人数",
    time: "時間",
    note: "メモ",
    save: "変更を保存",
    cancel: "予約をキャンセル",
    notFound: "予約が見つかりません。",
    updated: "予約が更新されました。",
    confirmCancel: "この予約をキャンセルしますか？",
    cancelled: "予約はキャンセルされました。",
    guestWord: "名",
    timePrefix: "",
    timeSuffix: "",
  },
};

function renderPage(code, copy, rootPage = false) {
  const assetPrefix = rootPage ? "" : "../";
  const localeQuery = code === "de" ? "de" : code;
  return `<!DOCTYPE html>
<html lang="${code}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${copy.title}</title>
    <meta name="robots" content="noindex,nofollow" />
    <link rel="icon" href="${assetPrefix}assets/favicon.ico" sizes="any" />
    <link rel="stylesheet" href="${assetPrefix}styles.css?v=20260819-restaurant-1" />
  </head>
  <body class="guest-page">
    <header class="site-header">
      <div class="container header-inner">
        <a class="header-address" href="index.html">
          <span>Kiku Bistro</span>
          <span>${copy.eyebrow}</span>
        </a>
        <a class="header-brand" href="index.html" aria-label="Kiku Bistro">
          <img src="${assetPrefix}assets/header-flower.png?v=20260428-1" alt="" />
        </a>
        <nav class="nav">
          <a href="index.html">Website</a>
          <a href="index.html#reservation">${copy.navReserve}</a>
        </nav>
      </div>
    </header>

    <main class="guest-main">
      <section class="container guest-hero">
        <div>
          <p class="eyebrow">${copy.eyebrow}</p>
          <h1>${copy.heading}</h1>
        </div>
        <p>${copy.intro}</p>
      </section>

      <section class="container guest-shell">
        <div id="guest-content">
          <p class="admin-muted">${copy.loading}</p>
        </div>
      </section>
    </main>

    <script>
      const locale = ${JSON.stringify(localeQuery)};
      const copy = ${JSON.stringify(copy)};
      const content = document.getElementById("guest-content");
      const token = new URLSearchParams(location.search).get("token") || "";
      const slots = ${JSON.stringify(slots)};
      const reservationMinutes = 120;
      const toLocalDate = (date) => {
        const offset = date.getTimezoneOffset();
        return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
      };
      const escapeHtml = (value) =>
        String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
      const closingTimeForDate = (value) => {
        const day = new Date(\`\${value}T12:00:00\`).getDay();
        return day === 3 || day === 0 ? "17:00" : "21:00";
      };
      const slotFitsOpeningHours = (dateValue, timeValue) =>
        new Date(\`\${dateValue}T\${timeValue}:00\`).getTime() + reservationMinutes * 60000 <=
        new Date(\`\${dateValue}T\${closingTimeForDate(dateValue)}:00\`).getTime();
      const slotsForDate = (dateValue) => slots.filter((slot) => slotFitsOpeningHours(dateValue, slot));
      const api = async (url, options = {}) => {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error((data.errors || ["Error"]).join(" "));
        return data;
      };
      const renderTimeTiles = (dateValue, selectedTime, disabled) =>
        slotsForDate(dateValue)
          .map(
            (slot) => \`
              <button class="time-tile guest-time-tile \${slot === selectedTime ? "selected" : ""}" type="button" data-time="\${slot}" \${disabled ? "disabled" : ""} aria-pressed="\${slot === selectedTime}">
                <span class="time-tile-hour">\${slot}</span>
              </button>
            \`
          )
          .join("");
      const bindTimeTiles = (form) => {
        form.querySelectorAll(".guest-time-tile").forEach((button) => {
          button.addEventListener("click", () => {
            form.querySelectorAll(".guest-time-tile").forEach((tile) => {
              tile.classList.remove("selected");
              tile.setAttribute("aria-pressed", "false");
            });
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
            form.elements.time.value = button.dataset.time;
          });
        });
      };
      const bindDateChange = (form, disabled) => {
        form.elements.date.addEventListener("change", () => {
          const availableSlots = slotsForDate(form.elements.date.value);
          if (!availableSlots.includes(form.elements.time.value)) {
            form.elements.time.value = "";
          }
          form.querySelector(".time-grid").innerHTML = renderTimeTiles(form.elements.date.value, form.elements.time.value, disabled);
          bindTimeTiles(form);
        });
      };
      const render = (reservation, message = "") => {
        const disabled = ["cancelled", "no_show"].includes(reservation.status);
        const status = copy.statuses[reservation.status] || reservation.status;
        const timePrefix = copy.timePrefix ? \` \${copy.timePrefix} \` : " ";
        content.innerHTML = \`
          <div class="guest-card">
            <div class="guest-summary">
              <div>
                <span class="guest-status \${reservation.status}">\${escapeHtml(status)}</span>
                <h2>\${escapeHtml(reservation.date)}\${timePrefix}\${escapeHtml(reservation.time)}\${escapeHtml(copy.timeSuffix)}</h2>
                <p>\${escapeHtml(reservation.guests)} \${escapeHtml(copy.guestWord)} &middot; \${escapeHtml(reservation.name)}</p>
              </div>
            </div>

            <form id="guest-change-form" class="guest-form">
              <input type="hidden" name="time" value="\${escapeHtml(reservation.time)}" />
              <div class="form-row form-row-two">
                <label><span>\${escapeHtml(copy.date)}</span><input type="date" name="date" value="\${escapeHtml(reservation.date)}" min="\${toLocalDate(new Date())}" \${disabled ? "disabled" : ""} required /></label>
                <label><span>\${escapeHtml(copy.guests)}</span><input type="number" name="guests" min="1" max="12" value="\${escapeHtml(reservation.guests)}" \${disabled ? "disabled" : ""} required /></label>
              </div>
              <div class="guest-time-block">
                <span class="guest-label">\${escapeHtml(copy.time)}</span>
                <div class="time-grid">\${renderTimeTiles(reservation.date, reservation.time, disabled)}</div>
              </div>
              <label><span>\${escapeHtml(copy.note)}</span><textarea name="note" rows="3" \${disabled ? "disabled" : ""}>\${escapeHtml(reservation.note)}</textarea></label>
              <div class="guest-actions">
                <button class="btn btn-dark" type="submit" \${disabled ? "disabled" : ""}>\${escapeHtml(copy.save)}</button>
                <button class="btn btn-outline" type="button" id="guest-cancel" \${disabled ? "disabled" : ""}>\${escapeHtml(copy.cancel)}</button>
              </div>
              <p class="reservation-message" id="guest-message" data-type="\${message ? "success" : ""}">\${escapeHtml(message)}</p>
            </form>
          </div>
        \`;
        const changeForm = document.getElementById("guest-change-form");
        bindTimeTiles(changeForm);
        bindDateChange(changeForm, disabled);
        changeForm.addEventListener("submit", updateReservation);
        document.getElementById("guest-cancel").addEventListener("click", cancelReservation);
      };
      const load = async () => {
        if (!token) {
          content.innerHTML = \`<p class="reservation-message" data-type="error">\${escapeHtml(copy.notFound)}</p>\`;
          return;
        }
        try {
          const data = await api(\`/api/guest/reservation?token=\${encodeURIComponent(token)}&locale=\${locale}\`);
          render(data.reservation);
        } catch (error) {
          content.innerHTML = \`<p class="reservation-message" data-type="error">\${escapeHtml(error.message)}</p>\`;
        }
      };
      const updateReservation = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.action = "change";
        payload.guests = Number(payload.guests);
        try {
          const data = await api(\`/api/guest/reservation?token=\${encodeURIComponent(token)}&locale=\${locale}\`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          render(data.reservation, copy.updated);
        } catch (error) {
          document.getElementById("guest-message").textContent = error.message;
          document.getElementById("guest-message").dataset.type = "error";
        }
      };
      const cancelReservation = async () => {
        if (!confirm(copy.confirmCancel)) return;
        const data = await api(\`/api/guest/reservation?token=\${encodeURIComponent(token)}&locale=\${locale}\`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel" }),
        });
        render(data.reservation, copy.cancelled);
      };
      load();
    </script>
  </body>
</html>
`;
}

await writeFile(join(root, "reservation.html"), renderPage("de", pages.de, true), "utf8");
await copyFile(join(root, "reservation.html"), join(root, "reservierung.html"));

for (const [code, copy] of Object.entries(pages)) {
  if (code === "de") continue;
  const dir = join(root, code);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "reservation.html"), renderPage(code, copy), "utf8");
  await copyFile(join(dir, "reservation.html"), join(dir, "reservierung.html"));
}
