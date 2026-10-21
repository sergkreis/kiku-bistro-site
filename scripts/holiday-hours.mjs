// One structural, localized source for the seasonal section across ten languages.
const copy = {
  de: { title: "Öffnungszeiten zum Jahreswechsel", christmas: "Weihnachten · Set-Menü", christmasDates: "25. & 26. Dezember 2026", starts: "Reservierungsbeginn — an beiden Tagen", menuAsk: "Menü per E-Mail anfragen", regular: "Reguläre Speisekarte", regularHours: "09:30–17:00 Uhr", closed: "Geschlossen", closedDates: "1.–3. Januar 2027", month: "Dezember 2026", days: ["23.", "24.", "27.", "30.", "31."] },
  en: { title: "Opening hours over the New Year", christmas: "Christmas · Set menu", christmasDates: "25 & 26 December 2026", starts: "Reservation start times — both days", menuAsk: "Ask for the menu by email", regular: "Regular menu", regularHours: "09:30–17:00", closed: "Closed", closedDates: "1–3 January 2027", month: "December 2026", days: ["23", "24", "27", "30", "31"] },
  fr: { title: "Horaires d’ouverture pour le Nouvel An", christmas: "Noël · Menu fixe", christmasDates: "25 et 26 décembre 2026", starts: "Début des réservations — les deux jours", menuAsk: "Demander le menu par e-mail", regular: "Carte habituelle", regularHours: "09:30–17:00", closed: "Fermé", closedDates: "Du 1er au 3 janvier 2027", month: "décembre 2026", days: ["23", "24", "27", "30", "31"] },
  nl: { title: "Openingstijden rond de jaarwisseling", christmas: "Kerst · Vast menu", christmasDates: "25 en 26 december 2026", starts: "Begintijden reserveringen — beide dagen", menuAsk: "Menu per e-mail aanvragen", regular: "Gewone menukaart", regularHours: "09:30–17:00", closed: "Gesloten", closedDates: "1 t/m 3 januari 2027", month: "december 2026", days: ["23", "24", "27", "30", "31"] },
  pl: { title: "Godziny otwarcia na przełomie roku", christmas: "Boże Narodzenie · Menu zestawowe", christmasDates: "25 i 26 grudnia 2026", starts: "Godziny rozpoczęcia rezerwacji — w oba dni", menuAsk: "Zapytaj o menu e-mailem", regular: "Standardowe menu", regularHours: "09:30–17:00", closed: "Nieczynne", closedDates: "1–3 stycznia 2027", month: "grudnia 2026", days: ["23", "24", "27", "30", "31"] },
  cs: { title: "Otevírací doba na přelomu roku", christmas: "Vánoce · Pevné menu", christmasDates: "25. a 26. prosince 2026", starts: "Začátky rezervací — oba dny", menuAsk: "Vyžádat menu e-mailem", regular: "Běžné menu", regularHours: "09:30–17:00", closed: "Zavřeno", closedDates: "1.–3. ledna 2027", month: "prosince 2026", days: ["23.", "24.", "27.", "30.", "31."] },
  it: { title: "Orari di apertura per il nuovo anno", christmas: "Natale · Menu fisso", christmasDates: "25 e 26 dicembre 2026", starts: "Orari di inizio prenotazioni — entrambi i giorni", menuAsk: "Richiedi il menu via e-mail", regular: "Menu abituale", regularHours: "09:30–17:00", closed: "Chiuso", closedDates: "1–3 gennaio 2027", month: "dicembre 2026", days: ["23", "24", "27", "30", "31"] },
  es: { title: "Horario de apertura de fin de año", christmas: "Navidad · Menú especial", christmasDates: "25 y 26 de diciembre de 2026", starts: "Horas de inicio de las reservas — ambos días", menuAsk: "Pedir el menú por correo", regular: "Carta habitual", regularHours: "09:30–17:00", closed: "Cerrado", closedDates: "Del 1 al 3 de enero de 2027", month: "diciembre de 2026", days: ["23", "24", "27", "30", "31"] },
  pt: { title: "Horário de funcionamento na passagem de ano", christmas: "Natal · Menu fixo", christmasDates: "25 e 26 de dezembro de 2026", starts: "Horários de início das reservas — ambos os dias", menuAsk: "Pedir o menu por e-mail", regular: "Menu habitual", regularHours: "09:30–17:00", closed: "Encerrado", closedDates: "1 a 3 de janeiro de 2027", month: "dezembro de 2026", days: ["23", "24", "27", "30", "31"] },
  ja: { title: "年末年始の営業時間", christmas: "クリスマス · セットメニュー", christmasDates: "2026年12月25日・26日", starts: "両日の予約開始時刻", menuAsk: "メールでメニューを問い合わせる", regular: "通常メニュー", regularHours: "09:30–17:00", closed: "休業", closedDates: "2027年1月1日～3日", month: "2026年12月", days: ["23日", "24日", "27日", "30日", "31日"] },
};

const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

export function holidaySection(locale) {
  const c = copy[locale];
  if (!c) throw new Error(`Unknown holiday locale: ${locale}`);
  const t = (key) => escapeHtml(c[key]);
  const dates = c.days.map((day) => `<span>${escapeHtml(locale === "ja" ? `${c.month}${day}` : `${day} ${c.month}`)}</span>`).join(locale === "ja" ? "、" : ", ");
  const times = ["12:00", "13:00", "17:30", "18:30"].map((time) => `<time datetime="${time}">${time}</time>`).join(", ");
  return `      <section class="section holiday-section" id="holiday-hours" aria-labelledby="holiday-heading">
        <div class="container holiday-inner">
          <h2 id="holiday-heading">${t("title")}</h2>
          <h3>${t("christmas")}</h3>
          <p class="holiday-period">${t("christmasDates")}</p>
          <p><a class="holiday-menu-link" href="mailto:info@kiku-bistro.de?subject=${encodeURIComponent(c.menuAsk)}">${t("menuAsk")} <span aria-hidden="true">↗</span></a></p>
          <p class="holiday-starts">${t("starts")}: <strong>${times}</strong></p>
          <h3>${t("regular")}</h3>
          <p class="holiday-hours">${t("regularHours")}</p>
          <p class="holiday-dates">${dates}</p>
          <h3>${t("closed")}</h3>
          <p class="holiday-closed-dates"><strong>${t("closedDates")}</strong></p>
        </div>
      </section>`;
}

export function updateHoliday(input, locale) {
  const block = /      <section class="section holiday-section" id="holiday-hours"[\s\S]*?      <\/section>/g;
  const matches = [...input.matchAll(block)];
  if (matches.length !== 1) throw new Error(`Expected one holiday section for ${locale}; found ${matches.length}`);
  return input.replace(block, () => holidaySection(locale));
}
