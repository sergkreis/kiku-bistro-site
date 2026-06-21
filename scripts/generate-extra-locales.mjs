import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const languages = [
  ["de", "Deutsch"],
  ["en", "English"],
  ["fr", "Français"],
  ["nl", "Nederlands"],
  ["pl", "Polski"],
  ["cs", "Čeština"],
  ["it", "Italiano"],
  ["es", "Español"],
  ["pt", "Português"],
  ["ja", "日本語"],
];

const alternates = [
  '    <link rel="alternate" hreflang="de" href="https://kiku-bistro.de/" />',
  ...languages
    .filter(([code]) => code !== "de")
    .map(([code]) => `    <link rel="alternate" hreflang="${code}" href="https://kiku-bistro.de/${code}/" />`),
  '    <link rel="alternate" hreflang="x-default" href="https://kiku-bistro.de/" />',
].join("\n");

const canonicalHref = (code) => (code === "de" ? "https://kiku-bistro.de/" : `https://kiku-bistro.de/${code}/`);

const seoHeadLinks = (code) => `    <link rel="canonical" href="${canonicalHref(code)}" />
${alternates}`;

const seoHeadLinksPattern =
  /(?:    <link rel="canonical" href="https:\/\/kiku-bistro\.de\/[^"]*" \/>\r?\n)?(?:    <link rel="alternate" hreflang="(?:de|en|fr|nl|pl|cs|it|es|pt|ja|x-default)" href="https:\/\/kiku-bistro\.de\/[^"]*" \/>\r?\n?)+/;

const langLinks = (prefix) =>
  languages
    .map(([code]) => {
      const href = code === "de" ? prefix.de : `${prefix.locale}${code}/`;
      return `              <a href="${href}" lang="${code}">${code.toUpperCase()}</a>`;
    })
    .join("\n");

const mobileLangLinks = (prefix) =>
  languages
    .map(([code]) => {
      const href = code === "de" ? prefix.de : `${prefix.locale}${code}/`;
      return `          <a href="${href}" lang="${code}">${code.toUpperCase()}</a>`;
    })
    .join("\n");

const languageMenu = (current, prefix) => `          <details class="language-menu">
            <summary>${current.toUpperCase()}</summary>
            <div class="language-options">
${langLinks(prefix)}
            </div>
          </details>`;

const mobileLanguageList = (label, prefix) => `        <div class="mobile-language-list" aria-label="${label}">
${mobileLangLinks(prefix)}
        </div>`;

const localizedPrefix = { de: "../", locale: "../" };
const rootPrefix = { de: "./", locale: "" };

const locales = {
  it: {
    description: "Bistrot moderno a Quedlinburg con colazione, pranzo e un piccolo menu stagionale.",
    nav: ["Bistro", "Menu", "Prenota", "Contatto"],
    directions: "Indicazioni",
    legal: "Note legali e privacy",
    terms: "Termini",
    replacements: [
      ["Very French. Very relaxed. Very alive.", "Molto francese. Molto rilassato. Molto vivo."],
      ["We are open Wednesday and Sunday from 9:30 to 17:00 and Thursday to Saturday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes. From Thursday\n                to Saturday evening, we also serve dinner with selected wines in a warm atmosphere.", "Siamo aperti il mercoled&igrave; e la domenica dalle 9:30 alle 17:00 e dal gioved&igrave; al sabato\n                dalle 9:30 alle 21:00, con piatti moderni e freschi per colazione e pranzo. Dal gioved&igrave;\n                al sabato sera serviamo anche la cena con vini selezionati in un'atmosfera piacevole."],
      ["View menu", "Vedi il menu"],
      ["Reserve a table", "Prenota un tavolo"],
      ["Get directions", "Indicazioni"],
      ["The bistro in Quedlinburg", "Il bistrot a Quedlinburg"],
      ["<span>The bistro</span><span>Kiku is here.</span>", "<span>Il bistrot</span><span>Kiku è qui.</span>"],
      ["As the casual sibling of the Michelin-listed Restaurant Kiku, it brings serious cooking to the table in a relaxed atmosphere.", "Come versione più informale del Restaurant Kiku, segnalato dalla Guida Michelin, porta in tavola una cucina curata in un'atmosfera rilassata."],
      ["Chef Jan Fribus reinterprets his favorite recipes, bakes croissants, bread and cakes fresh every day, and surprises with a special daily offer.", "Lo chef Jan Fribus reinterpreta le sue ricette preferite, prepara ogni giorno croissant, pane e dolci freschi e sorprende con una proposta del giorno."],
      ["Breakfast. Lunch. Something in between.", "Colazione. Pranzo. Qualcosa nel mezzo."],
      ["Uncomplicated. And at the highest quality.", "Semplice. E di alta qualità."],
      ["Every day on Steinbruecke, right by the market square.", "Ogni giorno sulla Steinbrücke, proprio accanto alla piazza del mercato."],
      ["We look forward to seeing you.", "Vi aspettiamo."],
      ["Freshly baked bread, fine patisserie and bold flavors in a relaxed atmosphere.", "Pane appena sfornato, fine pasticceria e sapori decisi in un'atmosfera rilassata."],
      ["Breakfast, lunch and something in between.", "Colazione, pranzo e qualcosa nel mezzo."],
      ["Breakfast", "Colazione"],
      ["From 12:00", "Dalle 12:00"],
      ["Until 12:00", "Fino alle 12:00"],
      ["Bread basket", "Cestino di pane"],
      ["Sourdough bread, black rye sourdough with fermented malt, butter, jam and jam&oacute;n", "Pane a lievitazione naturale, pane di segale nero con malto fermentato, burro, confettura e jamón"],
      ["Sourdough bread, black rye sourdough with fermented malt, cream cheese, jam&oacute;n, muhammara", "Pane a lievitazione naturale, pane di segale nero con malto fermentato, formaggio fresco, jamón, muhammara"],
      ["With salmon", "Con salmone"],
      ["With jam&oacute;n", "Con jamón"],
      ["Salmon tartare", "Tartare di salmone"],
      ["Guacamole, tomatoes, mango mayo", "Guacamole, pomodori, mayo al mango"],
      ["Eggs, tomato sauce, peppers, feta", "Uova, salsa di pomodoro, peperoni, feta"],
      ["Tomatoes, particella", "Pomodori, particella"],
      ["Brioche, yuzu mascarpone, berries, pistachio ice cream", "Brioche, mascarpone allo yuzu, frutti di bosco, gelato al pistacchio"],
      ["Cardamom bun", "Brioche al cardamomo"],
      ["with vanilla cream and apple", "con crema alla vaniglia e mela"],
      ["Berries, nuts, yogurt", "Frutti di bosco, frutta secca, yogurt"],
      ["Beef tartare", "Tartare di manzo"],
      ["Mushrooms, brioche", "Funghi, brioche"],
      ["Tomato salad", "Insalata di pomodori"],
      ["Stracciatella, pesto", "Stracciatella, pesto"],
      ["Gnocchi with gorgonzola", "Gnocchi con gorgonzola"],
      ["Prawns, bisque", "Gamberi, bisque"],
      ["Parsnip puree, tomato salsa, beurre blanc", "Purea di pastinaca, salsa di pomodoro, beurre blanc"],
      ["Mashed potatoes, carrots, porcini mushrooms, jus", "Purè di patate, carote, porcini, jus"],
      ["Asparagus, peppers, egg", "Asparagi, peperoni, uovo"],
      ["with vanilla ice cream", "con gelato alla vaniglia"],
      ["Bread basket with butter", "Cestino di pane con burro"],
      ["Sourdough bread, black rye sourdough with fermented malt, brioche", "Pane a lievitazione naturale, segale nera con malto fermentato, brioche"],
      ["Eggs Benedict on brioche", "Uova Benedict su brioche"],
      ["Poached eggs, avocado, hollandaise", "Uova in camicia, avocado, salsa olandese"],
      ["With asparagus", "Con asparagi"],
      ["With roast beef", "Con roast beef"],
      ["Croissant with salmon", "Croissant con salmone"],
      ["Poached eggs, avocado, salad, hollandaise", "Uova in camicia, avocado, insalata, salsa olandese"],
      ["Croissant with jamon", "Croissant con jamón"],
      ["French Toast", "French toast"],
      ["Brioche, yuzu mascarpone, berries, caramel", "Brioche, mascarpone allo yuzu, frutti di bosco, caramello"],
      ["Sweet croissant", "Croissant dolce"],
      ["Yuzu mascarpone, chocolate-hazelnut praline, caramel", "Mascarpone allo yuzu, pralinato cioccolato-nocciola, caramello"],
      ["Homemade granola", "Granola fatta in casa"],
      ["Goji berries, nuts, yogurt", "Bacche di goji, frutta secca, yogurt"],
      ["Lunch", "Pranzo"],
      ["Starters", "Antipasti"],
      ["Pate with sourdough bread", "Paté con pane a lievitazione naturale"],
      ["Chicken liver, passion fruit, onion", "Fegato di pollo, frutto della passione, cipolla"],
      ["Trio of dips with sourdough bread", "Trio di dip con pane a lievitazione naturale"],
      ["Salmon salad", "Insalata di salmone"],
      ["Mixed salad, cauliflower, white asparagus, XO sauce", "Insalata mista, cavolfiore, asparagi bianchi, salsa XO"],
      ["Mains", "Piatti principali"],
      ["Consomme noodle soup", "Consommé con noodles"],
      ["Pork, noodles, egg", "Maiale, noodles, uovo"],
      ["Fjord trout steak", "Trancio di trota dei fiordi"],
      ["Parsnip puree, tomato salsa, bisque", "Purea di pastinaca, salsa di pomodoro, bisque"],
      ["Mashed potatoes, carrots, mushrooms, jus", "Purè di patate, carote, funghi, jus"],
      ["Asparagus with rice", "Asparagi con riso"],
      ["Eggplant, beurre blanc", "Melanzana, beurre blanc"],
      ["Desserts", "Dessert"],
      ["Honey cake with ice cream", "Torta al miele con gelato"],
      ["Cardamom bun with vanilla cream and strawberries", "Brioche al cardamomo con crema alla vaniglia e fragole"],
      ["Ice cream", "Gelato"],
      ["Berries, caramel", "Frutti di bosco, caramello"],
      ["The lunch menu is based on the current PDF menu. The full original menu is available below.", "Il menu del pranzo si basa sul PDF attuale. Il menu completo originale è disponibile qui sotto."],
      ["Current menu as PDF", "Menu attuale in PDF"],
      ["Choose your date, time and party size directly in the reservation form.", "Scegli data, ora e numero di persone direttamente nel modulo di prenotazione."],
      ["For 5 or more guests, please reserve by phone.", "Per 5 o più persone, prenotate telefonicamente."],
      ["Wednesday &amp; Sunday", "Mercoledì &amp; domenica"],
      ["Wednesday & Sunday", "Mercoledì & domenica"],
      ["Thursday - Saturday", "Giovedì - sabato"],
      ["Reservation", "Prenotazione"],
      ["Reserve a table at Kiku Bistro.", "Prenota un tavolo al Kiku Bistro."],
      ["Choose your date, time and party size. Available times are calculated\n              automatically based on current reservations.", "Scegli data, ora e numero di persone. Gli orari disponibili vengono calcolati\n              automaticamente in base alle prenotazioni esistenti."],
      ["Opening hours", "Orari di apertura"],
      ["Wednesday, 9:30 - 17:00; Thursday to Sunday, 9:30 - 21:00", "Mercoled&igrave;, 9:30 - 17:00; gioved&igrave; - domenica, 9:30 - 21:00"],
      ["Duration", "Durata"],
      ["Reservations are planned for 2 hours.", "Le prenotazioni sono previste per 2 ore."],
      ["Groups", "Gruppi"],
      ["Up to 4 guests are confirmed automatically; for 5 or more guests we contact you personally.", "Fino a 4 persone la prenotazione è confermata automaticamente; da 5 persone in su vi contattiamo personalmente."],
      ["Date", "Data"],
      ["Guests", "Persone"],
      ["Time", "Ora"],
      ["Please choose a date", "Scegli una data"],
      ["Name", "Nome"],
      ["Phone", "Telefono"],
      ["Message optional", "Messaggio facoltativo"],
      ["I agree that my details may be stored to process the reservation.", "Accetto che i miei dati siano memorizzati per gestire la prenotazione."],
      ["Confirm reservation", "Conferma prenotazione"],
      ["Address", "Indirizzo"],
      ["Thursday - Sunday", "Gioved&igrave; - domenica"],
      ["Wednesday", "Mercoled&igrave;"],
      ["Monday - Tuesday", "Lunedì - martedì"],
      ["Closed", "Chiuso"],
      ["Contact", "Contatto"],
      ["Write an e-mail", "Scrivi un'e-mail"],
    ],
    manage: {
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
      at: "alle",
    },
  },
  es: {
    description: "Bistró moderno en Quedlinburg con desayuno, almuerzo y una pequeña carta cambiante.",
    nav: ["Bistro", "Carta", "Reservar", "Contacto"],
    directions: "Cómo llegar",
    legal: "Aviso legal y privacidad",
    terms: "Condiciones",
    replacements: [
      ["Very French. Very relaxed. Very alive.", "Muy francés. Muy relajado. Muy vivo."],
      ["We are open Wednesday and Sunday from 9:30 to 17:00 and Thursday to Saturday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes. From Thursday\n                to Saturday evening, we also serve dinner with selected wines in a warm atmosphere.", "Abrimos los mi&eacute;rcoles y domingos de 9:30 a 17:00 y de jueves a s&aacute;bado\n                de 9:30 a 21:00, con platos modernos y frescos para desayuno y almuerzo. De jueves\n                a s&aacute;bado por la noche tambi&eacute;n servimos cenas con vinos seleccionados en un ambiente agradable."],
      ["View menu", "Ver carta"],
      ["Reserve a table", "Reservar mesa"],
      ["Get directions", "Cómo llegar"],
      ["The bistro in Quedlinburg", "El bistró en Quedlinburg"],
      ["<span>The bistro</span><span>Kiku is here.</span>", "<span>El bistró</span><span>Kiku está aquí.</span>"],
      ["As the casual sibling of the Michelin-listed Restaurant Kiku, it brings serious cooking to the table in a relaxed atmosphere.", "Como hermano informal del Restaurant Kiku, incluido en la guía Michelin, trae cocina seria a la mesa en un ambiente relajado."],
      ["Chef Jan Fribus reinterprets his favorite recipes, bakes croissants, bread and cakes fresh every day, and surprises with a special daily offer.", "El chef Jan Fribus reinterpreta sus recetas favoritas, hornea croissants, pan y pasteles frescos cada día y sorprende con una propuesta diaria."],
      ["Breakfast. Lunch. Something in between.", "Desayuno. Almuerzo. Algo entre medias."],
      ["Uncomplicated. And at the highest quality.", "Sin complicaciones. Y con la máxima calidad."],
      ["Every day on Steinbruecke, right by the market square.", "Cada día en Steinbrücke, justo junto a la plaza del mercado."],
      ["We look forward to seeing you.", "Nos encantará recibirle."],
      ["Freshly baked bread, fine patisserie and bold flavors in a relaxed atmosphere.", "Pan recién horneado, fina pastelería y sabores intensos en un ambiente relajado."],
      ["Menu", "Carta"],
      ["Breakfast, lunch and something in between.", "Desayuno, almuerzo y algo entre medias."],
      ["Breakfast", "Desayuno"],
      ["From 12:00", "Desde las 12:00"],
      ["Until 12:00", "Hasta las 12:00"],
      ["Bread basket", "Cesta de pan"],
      ["Sourdough bread, black rye sourdough with fermented malt, butter, jam and jam&oacute;n", "Pan de masa madre, pan de centeno negro con malta fermentada, mantequilla, mermelada y jamón"],
      ["Sourdough bread, black rye sourdough with fermented malt, cream cheese, jam&oacute;n, muhammara", "Pan de masa madre, pan de centeno negro con malta fermentada, queso crema, jamón, muhammara"],
      ["With salmon", "Con salmón"],
      ["With jam&oacute;n", "Con jamón"],
      ["Salmon tartare", "Tartar de salmón"],
      ["Guacamole, tomatoes, mango mayo", "Guacamole, tomates, mayo de mango"],
      ["Eggs, tomato sauce, peppers, feta", "Huevos, salsa de tomate, pimiento, feta"],
      ["Tomatoes, particella", "Tomates, particella"],
      ["Brioche, yuzu mascarpone, berries, pistachio ice cream", "Brioche, mascarpone de yuzu, frutos rojos, helado de pistacho"],
      ["Cardamom bun", "Bollo de cardamomo"],
      ["with vanilla cream and apple", "con crema de vainilla y manzana"],
      ["Berries, nuts, yogurt", "Frutos rojos, frutos secos, yogur"],
      ["Beef tartare", "Tartar de ternera"],
      ["Mushrooms, brioche", "Setas, brioche"],
      ["Tomato salad", "Ensalada de tomate"],
      ["Stracciatella, pesto", "Stracciatella, pesto"],
      ["Gnocchi with gorgonzola", "Gnocchi con gorgonzola"],
      ["Prawns, bisque", "Gambas, bisque"],
      ["Parsnip puree, tomato salsa, beurre blanc", "Puré de chirivía, salsa de tomate, beurre blanc"],
      ["Mashed potatoes, carrots, porcini mushrooms, jus", "Puré de patatas, zanahorias, boletus, jugo"],
      ["Asparagus, peppers, egg", "Espárragos, pimiento, huevo"],
      ["with vanilla ice cream", "con helado de vainilla"],
      ["Bread basket with butter", "Cesta de pan con mantequilla"],
      ["Eggs Benedict on brioche", "Huevos Benedict sobre brioche"],
      ["Poached eggs, avocado, hollandaise", "Huevos pochados, aguacate, holandesa"],
      ["With asparagus", "Con espárragos"],
      ["With roast beef", "Con roast beef"],
      ["Croissant with salmon", "Croissant con salmón"],
      ["Croissant with jamon", "Croissant con jamón"],
      ["Sweet croissant", "Croissant dulce"],
      ["Homemade granola", "Granola casera"],
      ["Lunch", "Almuerzo"],
      ["Starters", "Entrantes"],
      ["Mains", "Platos principales"],
      ["Desserts", "Postres"],
      ["Current menu as PDF", "Carta actual en PDF"],
      ["Choose your date, time and party size directly in the reservation form.", "Elija fecha, hora y número de personas directamente en el formulario de reserva."],
      ["For 5 or more guests, please reserve by phone.", "Para 5 o más personas, reserve por teléfono."],
      ["Wednesday &amp; Sunday", "Miércoles &amp; domingo"],
      ["Wednesday & Sunday", "Miércoles & domingo"],
      ["Thursday - Saturday", "Jueves - sábado"],
      ["Reservation", "Reserva"],
      ["Reserve a table at Kiku Bistro.", "Reserve una mesa en Kiku Bistro."],
      ["Choose your date, time and party size. Available times are calculated\n              automatically based on current reservations.", "Elija fecha, hora y número de personas. Los horarios disponibles se calculan\n              automáticamente según las reservas existentes."],
      ["Opening hours", "Horario"],
      ["Duration", "Duración"],
      ["Reservations are planned for 2 hours.", "Las reservas están previstas para 2 horas."],
      ["Groups", "Grupos"],
      ["Up to 4 guests are confirmed automatically; for 5 or more guests we contact you personally.", "Hasta 4 personas se confirma automáticamente; para 5 o más personas contactamos personalmente."],
      ["Date", "Fecha"],
      ["Guests", "Personas"],
      ["Time", "Hora"],
      ["Please choose a date", "Elija una fecha"],
      ["Name", "Nombre"],
      ["Phone", "Teléfono"],
      ["Message optional", "Mensaje opcional"],
      ["I agree that my details may be stored to process the reservation.", "Acepto que mis datos se guarden para procesar la reserva."],
      ["Confirm reservation", "Confirmar reserva"],
      ["Address", "Dirección"],
      ["Wednesday, 9:30 - 17:00; Thursday to Sunday, 9:30 - 21:00", "Mi&eacute;rcoles, 9:30 - 17:00; jueves - domingo, 9:30 - 21:00"],
      ["Thursday - Sunday", "Jueves - domingo"],
      ["Wednesday", "Mi&eacute;rcoles"],
      ["Monday - Tuesday", "Lunes - martes"],
      ["Closed", "Cerrado"],
      ["<strong>Contact</strong>", "<strong>Contacto</strong>"],
      ["Write an e-mail", "Escribir e-mail"],
    ],
    manage: {
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
      at: "a las",
    },
  },
  pt: {
    description: "Bistrô moderno em Quedlinburg com pequeno-almoço, almoço e uma pequena carta sazonal.",
    nav: ["Bistro", "Menu", "Reservar", "Contacto"],
    directions: "Como chegar",
    legal: "Aviso legal e privacidade",
    terms: "Termos",
    replacements: [
      ["Very French. Very relaxed. Very alive.", "Muito francês. Muito descontraído. Muito vivo."],
      ["We are open Wednesday and Sunday from 9:30 to 17:00 and Thursday to Saturday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes. From Thursday\n                to Saturday evening, we also serve dinner with selected wines in a warm atmosphere.", "Estamos abertos &agrave; quarta e ao domingo das 9:30 &agrave;s 17:00 e de quinta a s&aacute;bado\n                das 9:30 &agrave;s 21:00, com pratos modernos e frescos para pequeno-almo&ccedil;o e almo&ccedil;o. De quinta\n                a s&aacute;bado &agrave; noite tamb&eacute;m servimos jantar com vinhos selecionados num ambiente agrad&aacute;vel."],
      ["View menu", "Ver menu"],
      ["Reserve a table", "Reservar mesa"],
      ["Get directions", "Como chegar"],
      ["The bistro in Quedlinburg", "O bistrô em Quedlinburg"],
      ["<span>The bistro</span><span>Kiku is here.</span>", "<span>O bistrô</span><span>Kiku está aqui.</span>"],
      ["As the casual sibling of the Michelin-listed Restaurant Kiku, it brings serious cooking to the table in a relaxed atmosphere.", "Como irmão mais descontraído do Restaurant Kiku, listado no Guia Michelin, traz cozinha séria à mesa num ambiente relaxado."],
      ["Chef Jan Fribus reinterprets his favorite recipes, bakes croissants, bread and cakes fresh every day, and surprises with a special daily offer.", "O chef Jan Fribus reinterpreta as suas receitas favoritas, prepara croissants, pão e bolos frescos todos os dias e surpreende com uma sugestão diária."],
      ["Breakfast. Lunch. Something in between.", "Pequeno-almoço. Almoço. Algo pelo meio."],
      ["Uncomplicated. And at the highest quality.", "Descomplicado. E com a mais alta qualidade."],
      ["Every day on Steinbruecke, right by the market square.", "Todos os dias na Steinbrücke, junto à praça do mercado."],
      ["We look forward to seeing you.", "Teremos muito gosto em recebê-lo."],
      ["Freshly baked bread, fine patisserie and bold flavors in a relaxed atmosphere.", "Pão acabado de sair do forno, pastelaria fina e sabores marcantes num ambiente descontraído."],
      ["Breakfast, lunch and something in between.", "Pequeno-almoço, almoço e algo pelo meio."],
      ["Breakfast", "Pequeno-almoço"],
      ["From 12:00", "A partir das 12:00"],
      ["Until 12:00", "Até às 12:00"],
      ["Bread basket", "Cesto de pão"],
      ["Sourdough bread, black rye sourdough with fermented malt, butter, jam and jam&oacute;n", "Pão de fermentação natural, pão de centeio escuro com malte fermentado, manteiga, compota e jamón"],
      ["Sourdough bread, black rye sourdough with fermented malt, cream cheese, jam&oacute;n, muhammara", "Pão de fermentação natural, pão de centeio escuro com malte fermentado, queijo creme, jamón, muhammara"],
      ["With salmon", "Com salmão"],
      ["With jam&oacute;n", "Com jamón"],
      ["Salmon tartare", "Tártaro de salmão"],
      ["Guacamole, tomatoes, mango mayo", "Guacamole, tomate, maionese de manga"],
      ["Eggs, tomato sauce, peppers, feta", "Ovos, molho de tomate, pimento, feta"],
      ["Tomatoes, particella", "Tomate, particella"],
      ["Brioche, yuzu mascarpone, berries, pistachio ice cream", "Brioche, mascarpone de yuzu, frutos vermelhos, gelado de pistácio"],
      ["Cardamom bun", "Brioche de cardamomo"],
      ["with vanilla cream and apple", "com creme de baunilha e maçã"],
      ["Berries, nuts, yogurt", "Frutos vermelhos, frutos secos, iogurte"],
      ["Beef tartare", "Tártaro de vaca"],
      ["Mushrooms, brioche", "Cogumelos, brioche"],
      ["Tomato salad", "Salada de tomate"],
      ["Stracciatella, pesto", "Stracciatella, pesto"],
      ["Gnocchi with gorgonzola", "Gnocchi com gorgonzola"],
      ["Prawns, bisque", "Camarões, bisque"],
      ["Parsnip puree, tomato salsa, beurre blanc", "Puré de pastinaca, salsa de tomate, beurre blanc"],
      ["Mashed potatoes, carrots, porcini mushrooms, jus", "Puré de batata, cenouras, boletos, jus"],
      ["Asparagus, peppers, egg", "Espargos, pimento, ovo"],
      ["with vanilla ice cream", "com gelado de baunilha"],
      ["Bread basket with butter", "Cesto de pão com manteiga"],
      ["Eggs Benedict on brioche", "Ovos Benedict em brioche"],
      ["Poached eggs, avocado, hollandaise", "Ovos escalfados, abacate, molho holandês"],
      ["With asparagus", "Com espargos"],
      ["With roast beef", "Com rosbife"],
      ["Croissant with salmon", "Croissant com salmão"],
      ["Croissant with jamon", "Croissant com jamón"],
      ["Sweet croissant", "Croissant doce"],
      ["Homemade granola", "Granola caseira"],
      ["Lunch", "Almoço"],
      ["Starters", "Entradas"],
      ["Mains", "Pratos principais"],
      ["Desserts", "Sobremesas"],
      ["Current menu as PDF", "Menu atual em PDF"],
      ["Choose your date, time and party size directly in the reservation form.", "Escolha data, hora e número de pessoas diretamente no formulário de reserva."],
      ["For 5 or more guests, please reserve by phone.", "Para 5 ou mais pessoas, reserve por telefone."],
      ["Wednesday &amp; Sunday", "Quarta-feira &amp; domingo"],
      ["Wednesday & Sunday", "Quarta-feira & domingo"],
      ["Thursday - Saturday", "Quinta-feira - sábado"],
      ["Reservation", "Reserva"],
      ["Reserve a table at Kiku Bistro.", "Reserve uma mesa no Kiku Bistro."],
      ["Choose your date, time and party size. Available times are calculated\n              automatically based on current reservations.", "Escolha a data, a hora e o número de pessoas. Os horários disponíveis são calculados\n              automaticamente com base nas reservas existentes."],
      ["Opening hours", "Horário"],
      ["Duration", "Duração"],
      ["Reservations are planned for 2 hours.", "As reservas estão previstas para 2 horas."],
      ["Groups", "Grupos"],
      ["Up to 4 guests are confirmed automatically; for 5 or more guests we contact you personally.", "Até 4 pessoas a confirmação é automática; para 5 ou mais pessoas contactamo-lo pessoalmente."],
      ["Date", "Data"],
      ["Guests", "Pessoas"],
      ["Time", "Hora"],
      ["Please choose a date", "Escolha uma data"],
      ["Name", "Nome"],
      ["Phone", "Telefone"],
      ["Message optional", "Mensagem opcional"],
      ["I agree that my details may be stored to process the reservation.", "Aceito que os meus dados sejam guardados para processar a reserva."],
      ["Confirm reservation", "Confirmar reserva"],
      ["Address", "Morada"],
      ["Wednesday, 9:30 - 17:00; Thursday to Sunday, 9:30 - 21:00", "Quarta, 9:30 - 17:00; quinta - domingo, 9:30 - 21:00"],
      ["Thursday - Sunday", "Quinta - domingo"],
      ["Wednesday", "Quarta"],
      ["Monday - Tuesday", "Segunda - terça"],
      ["Closed", "Fechado"],
      ["<strong>Contact</strong>", "<strong>Contacto</strong>"],
      ["Write an e-mail", "Escrever e-mail"],
    ],
    manage: {
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
      at: "às",
    },
  },
  ja: {
    description: "クヴェードリンブルクのモダンなビストロ。朝食、ランチ、小さな季節のメニューをご用意しています。",
    nav: ["ビストロ", "メニュー", "予約", "連絡先"],
    directions: "道順",
    legal: "法的表示・プライバシー",
    terms: "利用規約",
    replacements: [
      ["Very French. Very relaxed. Very alive.", "とてもフレンチに。とても気軽に。とても生き生きと。"],
      ["We are open Wednesday and Sunday from 9:30 to 17:00 and Thursday to Saturday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes. From Thursday\n                to Saturday evening, we also serve dinner with selected wines in a warm atmosphere.", "&#27700;&#26332;&#26085;&#12392;&#26085;&#26332;&#26085;&#12399;9:30&#12363;&#12425;17:00&#12414;&#12391;&#12289;&#26408;&#26332;&#26085;&#12363;&#12425;&#22303;&#26332;&#26085;&#12399;9:30&#12363;&#12425;21:00&#12414;&#12391;&#21942;&#26989;&#12375;&#12390;&#12356;&#12414;&#12377;&#12290;\n                &#12514;&#12480;&#12531;&#12391;&#12501;&#12524;&#12483;&#12471;&#12517;&#12394;&#26397;&#39135;&#12392;&#12521;&#12531;&#12481;&#12434;&#12372;&#29992;&#24847;&#12375;&#12390;&#12356;&#12414;&#12377;&#12290;&#26408;&#26332;&#26085;&#12363;&#12425;&#22303;&#26332;&#26085;&#12398;&#22812;&#12399;&#12289;&#36984;&#12426;&#12377;&#12368;&#12426;&#12398;&#12527;&#12452;&#12531;&#12392;&#24515;&#22320;&#12424;&#12356;&#38640;&#22258;&#27671;&#12398;&#20013;&#12391;&#12487;&#12451;&#12490;&#12540;&#12418;&#12362;&#27005;&#12375;&#12415;&#12356;&#12383;&#12384;&#12369;&#12414;&#12377;&#12290;"],
      ["View menu", "メニューを見る"],
      ["Reserve a table", "席を予約する"],
      ["Get directions", "道順"],
      ["The bistro in Quedlinburg", "クヴェードリンブルクのビストロ"],
      ["<span>The bistro</span><span>Kiku is here.</span>", "<span>ビストロ</span><span>Kikuができました。</span>"],
      ["As the casual sibling of the Michelin-listed Restaurant Kiku, it brings serious cooking to the table in a relaxed atmosphere.", "ミシュラン掲載のRestaurant Kikuのカジュアルな姉妹店として、リラックスした雰囲気の中で丁寧な料理をお届けします。"],
      ["Chef Jan Fribus reinterprets his favorite recipes, bakes croissants, bread and cakes fresh every day, and surprises with a special daily offer.", "シェフのヤン・フリブスが好きなレシピを再解釈し、クロワッサン、パン、ケーキを毎日焼き上げ、その日のおすすめもご用意します。"],
      ["Breakfast. Lunch. Something in between.", "朝食。ランチ。その間のひと皿。"],
      ["Uncomplicated. And at the highest quality.", "気軽に。そして上質に。"],
      ["Every day on Steinbruecke, right by the market square.", "マーケット広場のすぐそば、Steinbrückeで毎日お待ちしています。"],
      ["We look forward to seeing you.", "皆さまのお越しをお待ちしています。"],
      ["Freshly baked bread, fine patisserie and bold flavors in a relaxed atmosphere.", "焼きたてのパン、繊細なパティスリー、印象的な味わいをリラックスした空間で。"],
      ["Menu", "メニュー"],
      ["Breakfast, lunch and something in between.", "朝食、ランチ、その間のひと皿。"],
      ["Breakfast", "朝食"],
      ["From 12:00", "12:00から"],
      ["Until 12:00", "12:00まで"],
      ["Bread basket", "パンバスケット"],
      ["Sourdough bread, black rye sourdough with fermented malt, butter, jam and jam&oacute;n", "サワードウブレッド、発酵麦芽入り黒ライ麦サワードウ、バター、ジャム、ハモン"],
      ["Sourdough bread, black rye sourdough with fermented malt, cream cheese, jam&oacute;n, muhammara", "サワードウブレッド、発酵麦芽入り黒ライ麦サワードウ、クリームチーズ、ハモン、ムハンマラ"],
      ["With salmon", "サーモン添え"],
      ["With jam&oacute;n", "ハモン添え"],
      ["Salmon tartare", "サーモンタルタル"],
      ["Guacamole, tomatoes, mango mayo", "ワカモレ、トマト、マンゴーマヨ"],
      ["Eggs, tomato sauce, peppers, feta", "卵、トマトソース、パプリカ、フェタ"],
      ["Tomatoes, particella", "トマト、パルティチェッラ"],
      ["Brioche, yuzu mascarpone, berries, pistachio ice cream", "ブリオッシュ、柚子マスカルポーネ、ベリー、ピスタチオアイス"],
      ["Cardamom bun", "カルダモンブン"],
      ["with vanilla cream and apple", "バニラクリームとリンゴ"],
      ["Berries, nuts, yogurt", "ベリー、ナッツ、ヨーグルト"],
      ["Beef tartare", "ビーフタルタル"],
      ["Mushrooms, brioche", "キノコ、ブリオッシュ"],
      ["Tomato salad", "トマトサラダ"],
      ["Stracciatella, pesto", "ストラッチャテッラ、ペスト"],
      ["Gnocchi with gorgonzola", "ゴルゴンゾーラのニョッキ"],
      ["Prawns, bisque", "海老、ビスク"],
      ["Parsnip puree, tomato salsa, beurre blanc", "パースニップピュレ、トマトサルサ、ブールブラン"],
      ["Mashed potatoes, carrots, porcini mushrooms, jus", "マッシュポテト、ニンジン、ポルチーニ、ジュ"],
      ["Asparagus, peppers, egg", "アスパラガス、パプリカ、卵"],
      ["with vanilla ice cream", "バニラアイス添え"],
      ["Bread basket with butter", "パンバスケットとバター"],
      ["Eggs Benedict on brioche", "ブリオッシュのエッグベネディクト"],
      ["Poached eggs, avocado, hollandaise", "ポーチドエッグ、アボカド、オランデーズソース"],
      ["With asparagus", "アスパラガス添え"],
      ["With roast beef", "ローストビーフ添え"],
      ["Croissant with salmon", "サーモンのクロワッサン"],
      ["Croissant with jamon", "ハモンのクロワッサン"],
      ["French Toast", "フレンチトースト"],
      ["Sweet croissant", "スイートクロワッサン"],
      ["Homemade granola", "自家製グラノーラ"],
      ["Lunch", "ランチ"],
      ["Starters", "前菜"],
      ["Mains", "メイン"],
      ["Desserts", "デザート"],
      ["Current menu as PDF", "現在のメニューPDF"],
      ["Choose your date, time and party size directly in the reservation form.", "予約フォームで日付、時間、人数を直接お選びください。"],
      ["For 5 or more guests, please reserve by phone.", "5名様以上はお電話でご予約ください。"],
      ["Wednesday &amp; Sunday", "水曜日 &amp; 日曜日"],
      ["Wednesday & Sunday", "水曜日 & 日曜日"],
      ["Thursday - Saturday", "木曜日 - 土曜日"],
      ["Reservation", "予約"],
      ["Reserve a table at Kiku Bistro.", "Kiku Bistroの席を予約する。"],
      ["Choose your date, time and party size. Available times are calculated\n              automatically based on current reservations.", "日付、時間、人数を選択してください。空き時間は現在の予約状況に基づいて\n              自動的に計算されます。"],
      ["Opening hours", "営業時間"],
      ["Duration", "滞在時間"],
      ["Reservations are planned for 2 hours.", "ご予約は2時間で承ります。"],
      ["Groups", "グループ"],
      ["Up to 4 guests are confirmed automatically; for 5 or more guests we contact you personally.", "4名様までは自動で確定します。5名様以上の場合は、こちらから個別にご連絡します。"],
      ["Date", "日付"],
      ["Guests", "人数"],
      ["Time", "時間"],
      ["Please choose a date", "日付を選択してください"],
      ["Name", "お名前"],
      ["Phone", "電話番号"],
      ["Message optional", "メッセージ 任意"],
      ["I agree that my details may be stored to process the reservation.", "予約処理のために入力情報が保存されることに同意します。"],
      ["Confirm reservation", "予約を確定する"],
      ["Address", "住所"],
      ["Wednesday, 9:30 - 17:00; Thursday to Sunday, 9:30 - 21:00", "&#27700;&#26332;&#26085;, 9:30 - 17:00; &#26408;&#26332;&#26085; - &#26085;&#26332;&#26085;, 9:30 - 21:00"],
      ["Thursday - Sunday", "&#26408;&#26332;&#26085; - &#26085;&#26332;&#26085;"],
      ["Wednesday", "&#27700;&#26332;&#26085;"],
      ["Monday - Tuesday", "月曜日 - 火曜日"],
      ["Closed", "休業"],
      ["Contact", "連絡先"],
      ["Write an e-mail", "メールを書く"],
    ],
    manage: {
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
      at: "",
    },
  },
};

function replaceAll(input, replacements) {
  let output = input;
  for (const [from, to] of [...replacements].sort((a, b) => b[0].length - a[0].length)) {
    output = output.split(from).join(to);
  }
  return output;
}

function translateOutsideScripts(input, replacements) {
  return input
    .split(/(<script[\s\S]*?<\/script>)/gi)
    .map((part) => (part.toLowerCase().startsWith("<script") ? part : replaceAll(part, replacements)))
    .join("");
}

function repairPdfMenuHref(input) {
  return input.replace(/href="\.\.\/Kiku-Bistro-[^"]+\.pdf"/g, 'href="../Kiku-Bistro-Menu.pdf"');
}

function updateCommonIndex(input, current, rootPage = false) {
  const prefix = rootPage ? rootPrefix : localizedPrefix;
  const currentLabel = current.toUpperCase();
  return input
    .replace(seoHeadLinksPattern, `${seoHeadLinks(current)}\n`)
    .replace(/          <details class="language-menu">[\s\S]*?          <\/details>/, languageMenu(currentLabel, prefix))
    .replace(/        <div class="mobile-language-list"[\s\S]*?        <\/div>/, mobileLanguageList(rootPage ? "Sprache" : "Language", prefix));
}

function localizedIndex(source, code, config) {
  let html = source
    .replace('<html lang="en">', `<html lang="${code}">`)
    .replace(
      'content="Modern bistro in Quedlinburg with breakfast, lunch and a small changing menu."',
      `content="${config.description}"`
    )
    .replace(/booking\.js\?v=[^"]+/, `booking.js?v=20260527-${code}-1`);
  html = updateCommonIndex(html, code);
  html = translateOutsideScripts(html, [
    ["<a href=\"#about\">Bistro</a>", `<a href="#about">${config.nav[0]}</a>`],
    ["<a href=\"#menu\">Menu</a>", `<a href="#menu">${config.nav[1]}</a>`],
    ["<a href=\"#reservation\">Reserve</a>", `<a href="#reservation">${config.nav[2]}</a>`],
    ["<a href=\"#visit\">Contact</a>", `<a href="#visit">${config.nav[3]}</a>`],
    ["Legal notice & privacy", config.legal],
    ["Terms", config.terms],
    ...config.replacements,
  ]);
  return repairPdfMenuHref(html);
}

function reservationPage(code, config) {
  const t = config.manage;
  const slots = JSON.stringify(["09:30", "10:00", "11:00", "13:00", "17:00", "18:00"]);
  const copy = JSON.stringify(t);
  return `<!DOCTYPE html>
<html lang="${code}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t.title}</title>
    <meta name="robots" content="noindex,nofollow" />
    <link rel="icon" href="../assets/favicon.ico" sizes="any" />
    <link rel="stylesheet" href="../styles.css?v=20260525-lang-menu-1" />
  </head>
  <body class="guest-page">
    <header class="site-header">
      <div class="container header-inner">
        <a class="header-address" href="index.html">
          <span>Kiku Bistro</span>
          <span>${t.eyebrow}</span>
        </a>
        <a class="header-brand" href="index.html" aria-label="Kiku Bistro">
          <img src="../assets/header-flower.png?v=20260428-1" alt="" />
        </a>
        <nav class="nav">
          <a href="index.html">Website</a>
          <a href="index.html#reservation">${t.navReserve}</a>
        </nav>
      </div>
    </header>

    <main class="guest-main">
      <section class="container guest-hero">
        <div>
          <p class="eyebrow">${t.eyebrow}</p>
          <h1>${t.heading}</h1>
        </div>
        <p>${t.intro}</p>
      </section>

      <section class="container guest-shell">
        <div id="guest-content">
          <p class="admin-muted">${t.loading}</p>
        </div>
      </section>
    </main>

    <script>
      const locale = ${JSON.stringify(code)};
      const copy = ${copy};
      const content = document.getElementById("guest-content");
      const token = new URLSearchParams(location.search).get("token") || "";
      const slots = ${slots};
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
          if (!availableSlots.includes(form.elements.time.value)) form.elements.time.value = "";
          form.querySelector(".time-grid").innerHTML = renderTimeTiles(form.elements.date.value, form.elements.time.value, disabled);
          bindTimeTiles(form);
        });
      };
      const render = (reservation, message = "") => {
        const disabled = ["cancelled", "no_show"].includes(reservation.status);
        const status = copy.statuses[reservation.status] || reservation.status;
        const connector = copy.at ? \` \${copy.at} \` : " ";
        content.innerHTML = \`
          <div class="guest-card">
            <div class="guest-summary">
              <div>
                <span class="guest-status \${reservation.status}">\${escapeHtml(status)}</span>
                <h2>\${escapeHtml(reservation.date)}\${connector}\${escapeHtml(reservation.time)}</h2>
                <p>\${escapeHtml(reservation.guests)} \${escapeHtml(copy.guestWord)} · \${escapeHtml(reservation.name)}</p>
              </div>
            </div>
            <form id="guest-change-form" class="guest-form">
              <input type="hidden" name="time" value="\${escapeHtml(reservation.time)}" />
              <div class="form-row form-row-two">
                <label><span>\${copy.date}</span><input type="date" name="date" value="\${escapeHtml(reservation.date)}" min="\${toLocalDate(new Date())}" \${disabled ? "disabled" : ""} required /></label>
                <label><span>\${copy.guests}</span><input type="number" name="guests" min="1" max="12" value="\${escapeHtml(reservation.guests)}" \${disabled ? "disabled" : ""} required /></label>
              </div>
              <div class="guest-time-block">
                <span class="guest-label">\${copy.time}</span>
                <div class="time-grid">\${renderTimeTiles(reservation.date, reservation.time, disabled)}</div>
              </div>
              <label><span>\${copy.note}</span><textarea name="note" rows="3" \${disabled ? "disabled" : ""}>\${escapeHtml(reservation.note)}</textarea></label>
              <div class="guest-actions">
                <button class="btn btn-dark" type="submit" \${disabled ? "disabled" : ""}>\${copy.save}</button>
                <button class="btn btn-outline" type="button" id="guest-cancel" \${disabled ? "disabled" : ""}>\${copy.cancel}</button>
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
          content.innerHTML = \`<p class="reservation-message" data-type="error">\${copy.notFound}</p>\`;
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

const enIndex = await readFile(join(root, "en", "index.html"), "utf8");
const rootIndex = await readFile(join(root, "index.html"), "utf8");
await writeFile(join(root, "index.html"), updateCommonIndex(rootIndex, "de", true), "utf8");

for (const code of ["en", "fr", "nl", "pl", "cs"]) {
  const file = join(root, code, "index.html");
  const html = await readFile(file, "utf8");
  await writeFile(file, updateCommonIndex(html, code), "utf8");
}

for (const [code, config] of Object.entries(locales)) {
  const dir = join(root, code);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), localizedIndex(enIndex, code, config), "utf8");
  await writeFile(join(dir, "reservation.html"), reservationPage(code, config), "utf8");
  await copyFile(join(dir, "reservation.html"), join(dir, "reservierung.html"));
}

await import("./generate-guest-pages.mjs");
