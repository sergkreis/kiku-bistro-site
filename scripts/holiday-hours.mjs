// One source for the seasonal section across every published language.
const copy = {
  de: {
    title: "Weihnachten & Jahreswechsel",
    special: "25. & 26. Dezember 2026",
    specialText: "An beiden Tagen servieren wir ein besonderes Set-Menü. Für Informationen zum Menü schreiben Sie uns an",
    arrivals: "Feste Ankunftszeiten an beiden Tagen: 12:00, 13:00, 17:30 und 18:30 Uhr.",
    normal: "23., 24., 27., 30. & 31. Dezember 2026",
    normalText: "Reguläre Speisekarte von 09:30 bis 17:00 Uhr.",
    closed: "1.–3. Januar 2027",
    closedText: "Geschlossen.",
  },
  en: {
    title: "Christmas & New Year",
    special: "25 & 26 December 2026",
    specialText: "On both days, we serve a special set menu. For details about the menu, email us at",
    arrivals: "Fixed arrival times on both days: 12:00, 13:00, 17:30 and 18:30.",
    normal: "23, 24, 27, 30 & 31 December 2026",
    normalText: "Regular menu from 09:30 to 17:00.",
    closed: "1–3 January 2027",
    closedText: "Closed.",
  },
  fr: {
    title: "Noël et Nouvel An",
    special: "25 et 26 décembre 2026",
    specialText: "Ces deux jours, nous proposons un menu spécial. Pour connaître le détail du menu, écrivez-nous à",
    arrivals: "Heures d’arrivée fixes pour les deux jours : 12:00, 13:00, 17:30 et 18:30.",
    normal: "23, 24, 27, 30 et 31 décembre 2026",
    normalText: "Carte habituelle de 09:30 à 17:00.",
    closed: "Du 1er au 3 janvier 2027",
    closedText: "Fermé.",
  },
  nl: {
    title: "Kerst & jaarwisseling",
    special: "25 en 26 december 2026",
    specialText: "Op beide dagen serveren we een speciaal vast menu. Vraag de menudetails per e-mail aan via",
    arrivals: "Vaste aankomsttijden op beide dagen: 12:00, 13:00, 17:30 en 18:30.",
    normal: "23, 24, 27, 30 en 31 december 2026",
    normalText: "Gewone menukaart van 09:30 tot 17:00.",
    closed: "1 t/m 3 januari 2027",
    closedText: "Gesloten.",
  },
  pl: {
    title: "Boże Narodzenie i Nowy Rok",
    special: "25 i 26 grudnia 2026",
    specialText: "W oba dni serwujemy specjalne menu. Szczegóły menu można uzyskać, pisząc na adres",
    arrivals: "Stałe godziny przybycia w oba dni: 12:00, 13:00, 17:30 i 18:30.",
    normal: "23, 24, 27, 30 i 31 grudnia 2026",
    normalText: "Standardowe menu od 09:30 do 17:00.",
    closed: "1–3 stycznia 2027",
    closedText: "Nieczynne.",
  },
  cs: {
    title: "Vánoce a Nový rok",
    special: "25. a 26. prosince 2026",
    specialText: "Oba dny podáváme speciální pevné menu. Podrobnosti o menu si vyžádejte e-mailem na adrese",
    arrivals: "Pevné časy příchodu v oba dny: 12:00, 13:00, 17:30 a 18:30.",
    normal: "23., 24., 27., 30. a 31. prosince 2026",
    normalText: "Běžné menu od 09:30 do 17:00.",
    closed: "1.–3. ledna 2027",
    closedText: "Zavřeno.",
  },
  it: {
    title: "Natale e Capodanno",
    special: "25 e 26 dicembre 2026",
    specialText: "In entrambi i giorni serviamo un menu speciale fisso. Per conoscere i dettagli del menu, scriveteci a",
    arrivals: "Orari di arrivo prestabiliti per entrambi i giorni: 12:00, 13:00, 17:30 e 18:30.",
    normal: "23, 24, 27, 30 e 31 dicembre 2026",
    normalText: "Menu abituale dalle 09:30 alle 17:00.",
    closed: "1–3 gennaio 2027",
    closedText: "Chiuso.",
  },
  es: {
    title: "Navidad y Año Nuevo",
    special: "25 y 26 de diciembre de 2026",
    specialText: "Ambos días servimos un menú especial cerrado. Para conocer los detalles del menú, escríbenos a",
    arrivals: "Horas fijas de llegada para ambos días: 12:00, 13:00, 17:30 y 18:30.",
    normal: "23, 24, 27, 30 y 31 de diciembre de 2026",
    normalText: "Carta habitual de 09:30 a 17:00.",
    closed: "Del 1 al 3 de enero de 2027",
    closedText: "Cerrado.",
  },
  pt: {
    title: "Natal e Ano Novo",
    special: "25 e 26 de dezembro de 2026",
    specialText: "Em ambos os dias servimos um menu especial fixo. Para saber os detalhes do menu, escreva-nos para",
    arrivals: "Horários fixos de chegada em ambos os dias: 12:00, 13:00, 17:30 e 18:30.",
    normal: "23, 24, 27, 30 e 31 de dezembro de 2026",
    normalText: "Menu habitual das 09:30 às 17:00.",
    closed: "1 a 3 de janeiro de 2027",
    closedText: "Encerrado.",
  },
  ja: {
    title: "クリスマス・年末年始のご案内",
    special: "2026年12月25日・26日",
    specialText: "両日とも特別なセットメニューをご用意します。メニューの詳細はメールでお問い合わせください：",
    arrivals: "両日のご来店時間は12:00、13:00、17:30、18:30に設定しています。",
    normal: "2026年12月23日・24日・27日・30日・31日",
    normalText: "通常メニューを09:30～17:00にご提供します。",
    closed: "2027年1月1日～3日",
    closedText: "休業します。",
  },
};

const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

export function holidaySection(locale) {
  const c = copy[locale];
  if (!c) throw new Error(`Unknown holiday locale: ${locale}`);
  const t = (key) => escapeHtml(c[key]);
  return `      <section class="section holiday-section" id="holiday-hours" aria-labelledby="holiday-heading">
        <div class="container holiday-inner">
          <h2 id="holiday-heading">${t("title")}</h2>
          <div class="holiday-grid">
            <div class="holiday-card holiday-card-special">
              <h3>${t("special")}</h3>
              <p>${t("specialText")} <a href="mailto:info@kiku-bistro.de">info@kiku-bistro.de</a>.</p>
              <p>${t("arrivals")}</p>
            </div>
            <div class="holiday-card">
              <h3>${t("normal")}</h3>
              <p>${t("normalText")}</p>
            </div>
            <div class="holiday-card">
              <h3>${t("closed")}</h3>
              <p>${t("closedText")}</p>
            </div>
          </div>
        </div>
      </section>`;
}

export function updateHoliday(input, locale) {
  const block = /      <section class="section holiday-section" id="holiday-hours"[\s\S]*?      <\/section>/g;
  const matches = [...input.matchAll(block)];
  if (matches.length !== 1) throw new Error(`Expected one holiday section for ${locale}; found ${matches.length}`);
  return input.replace(block, () => holidaySection(locale));
}
