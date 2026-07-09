import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceIndex = await readFile(join(root, "en", "index.html"), "utf8");
const sourceReservation = await readFile(join(root, "en", "reservation.html"), "utf8");

const alternates = `    <link rel="alternate" hreflang="de" href="https://kiku-bistro.de/" />
    <link rel="alternate" hreflang="en" href="https://kiku-bistro.de/en/" />
    <link rel="alternate" hreflang="fr" href="https://kiku-bistro.de/fr/" />
    <link rel="alternate" hreflang="nl" href="https://kiku-bistro.de/nl/" />
    <link rel="alternate" hreflang="pl" href="https://kiku-bistro.de/pl/" />
    <link rel="alternate" hreflang="cs" href="https://kiku-bistro.de/cs/" />
    <link rel="alternate" hreflang="it" href="https://kiku-bistro.de/it/" />
    <link rel="alternate" hreflang="es" href="https://kiku-bistro.de/es/" />
    <link rel="alternate" hreflang="pt" href="https://kiku-bistro.de/pt/" />
    <link rel="alternate" hreflang="ja" href="https://kiku-bistro.de/ja/" />
    <link rel="alternate" hreflang="x-default" href="https://kiku-bistro.de/" />`;

const canonicalHref = (code) => (code === "de" ? "https://kiku-bistro.de/" : `https://kiku-bistro.de/${code}/`);

const seoHeadLinks = (code) => `    <link rel="canonical" href="${canonicalHref(code)}" />
${alternates}`;

const seoHeadLinksPattern =
  /(?:    <link rel="canonical" href="https:\/\/kiku-bistro\.de\/[^"]*" \/>\r?\n)?(?:    <link rel="alternate" hreflang="(?:de|en|fr|nl|pl|cs|it|es|pt|ja|x-default)" href="https:\/\/kiku-bistro\.de\/[^"]*" \/>\r?\n?)+/;

const languageLinks = `          <a href="../" lang="de">DE</a>
          <a href="../en/" lang="en">EN</a>
          <a href="../fr/" lang="fr">FR</a>
          <a href="../nl/" lang="nl">NL</a>
          <a href="../pl/" lang="pl">PL</a>
          <a href="../cs/" lang="cs">CS</a>
          <a href="../it/" lang="it">IT</a>
          <a href="../es/" lang="es">ES</a>
          <a href="../pt/" lang="pt">PT</a>
          <a href="../ja/" lang="ja">JA</a>`;

const mobileLanguageLinks = `        <a href="../" lang="de">Deutsch</a>
        <a href="../en/" lang="en">English</a>
        <a href="../fr/" lang="fr">Français</a>
        <a href="../nl/" lang="nl">Nederlands</a>
        <a href="../pl/" lang="pl">Polski</a>
        <a href="../cs/" lang="cs">Čeština</a>
        <a href="../it/" lang="it">Italiano</a>
        <a href="../es/" lang="es">Español</a>
        <a href="../pt/" lang="pt">Português</a>
        <a href="../ja/" lang="ja">日本語</a>`;

const languageMenu = (current) => `          <details class="language-menu">
            <summary>${current.toUpperCase()}</summary>
            <div class="language-options">
              <a href="../" lang="de">DE</a>
              <a href="../en/" lang="en">EN</a>
              <a href="../fr/" lang="fr">FR</a>
              <a href="../nl/" lang="nl">NL</a>
              <a href="../pl/" lang="pl">PL</a>
              <a href="../cs/" lang="cs">CS</a>
              <a href="../it/" lang="it">IT</a>
              <a href="../es/" lang="es">ES</a>
              <a href="../pt/" lang="pt">PT</a>
              <a href="../ja/" lang="ja">JA</a>
            </div>
          </details>`;

const mobileLanguageList = `        <div class="mobile-language-list" aria-label="Language">
          <a href="../" lang="de">DE</a>
          <a href="../en/" lang="en">EN</a>
          <a href="../fr/" lang="fr">FR</a>
          <a href="../nl/" lang="nl">NL</a>
          <a href="../pl/" lang="pl">PL</a>
          <a href="../cs/" lang="cs">CS</a>
          <a href="../it/" lang="it">IT</a>
          <a href="../es/" lang="es">ES</a>
          <a href="../pt/" lang="pt">PT</a>
          <a href="../ja/" lang="ja">JA</a>
        </div>`;

const locales = {
  fr: {
    description: "Bistro moderne à Quedlinburg avec petit-déjeuner, déjeuner et une petite carte qui change régulièrement.",
    replacements: [
      ["Very French. Very relaxed. Very alive.", "Très français. Très détendu. Très vivant."],
      ["We are open Wednesday and Sunday from 9:30 to 17:00 and Thursday to Saturday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes. From Thursday\n                to Saturday evening, we also serve dinner with selected wines in a warm atmosphere.", "Nous sommes ouverts le mercredi et le dimanche de 9h30 &agrave; 17h00 et du jeudi au samedi\n                de 9h30 &agrave; 21h00, avec des plats modernes et frais pour le petit-d&eacute;jeuner et le d&eacute;jeuner.\n                Du jeudi au samedi soir, nous servons aussi le d&icirc;ner avec des vins choisis dans une atmosph&egrave;re agr&eacute;able."],
      ["View menu", "Voir la carte"],
      ["Reserve a table", "Réserver une table"],
      ["Reserve", "Réserver"],
      ["Get directions", "Itinéraire"],
      ["The bistro in Quedlinburg", "Le bistro à Quedlinburg"],
      ["<span>The bistro</span><span>Kiku is here.</span>", "<span>Le bistro</span><span>Kiku est là.</span>"],
      ["As the casual sibling of the Michelin-listed Restaurant Kiku, it brings serious cooking to the table in a relaxed atmosphere.", "Comme adresse plus décontractée du restaurant Kiku recommandé par le Guide Michelin, le bistro propose une cuisine sérieuse dans une atmosphère détendue."],
      ["Chef Jan Fribus reinterprets his favorite recipes, bakes croissants, bread and cakes fresh every day, and surprises with a special daily offer.", "Le chef Jan Fribus réinterprète ses recettes préférées, prépare chaque jour croissants, pains et gâteaux frais, et surprend avec une offre du jour."],
      ["Breakfast. Lunch. Something in between.", "Petit-déjeuner. Déjeuner. Et quelque chose entre les deux."],
      ["Uncomplicated. And at the highest quality.", "Sans complication. Et avec une grande exigence de qualité."],
      ["Every day on Steinbruecke, right by the market square.", "Chaque jour sur la Steinbrücke, juste à côté de la place du marché."],
      ["We look forward to seeing you.", "Nous nous réjouissons de votre visite."],
      ["Freshly baked bread, fine patisserie and bold flavors in a relaxed atmosphere.", "Pain fraîchement cuit, pâtisserie fine et saveurs affirmées dans une atmosphère détendue."],
      ["Menu", "Carte"],
      ["Breakfast, lunch and something in between.", "Petit-déjeuner, déjeuner et quelque chose entre les deux."],
      ["Breakfast", "Petit-déjeuner"],
      ["From 12:00", "À partir de 12h00"],
      ["Until 12:00", "Jusqu'à 12h00"],
      ["Bread basket", "Corbeille de pain"],
      ["Sourdough bread, black rye sourdough with fermented malt, butter, jam and jam&oacute;n", "Pain au levain, pain de seigle noir au levain avec malt fermenté, beurre, confiture et jamón"],
      ["Sourdough bread, black rye sourdough with fermented malt, cream cheese, jam&oacute;n, muhammara", "Pain au levain, pain de seigle noir au levain avec malt fermenté, fromage frais, jamón, muhammara"],
      ["With salmon", "Avec saumon"],
      ["With jam&oacute;n", "Avec jamón"],
      ["Salmon tartare", "Tartare de saumon"],
      ["Guacamole, tomatoes, mango mayo", "Guacamole, tomates, mayo à la mangue"],
      ["Eggs, tomato sauce, peppers, feta", "Oeufs, sauce tomate, poivron, feta"],
      ["Tomatoes, particella", "Tomates, particella"],
      ["Brioche, yuzu mascarpone, berries, pistachio ice cream", "Brioche, mascarpone au yuzu, baies, glace pistache"],
      ["Cardamom bun", "Brioche à la cardamome"],
      ["with vanilla cream and apple", "avec crème vanille et pomme"],
      ["Berries, nuts, yogurt", "Baies, noix, yaourt"],
      ["Beef tartare", "Tartare de bœuf"],
      ["Mushrooms, brioche", "Champignons, brioche"],
      ["Tomato salad", "Salade de tomates"],
      ["Buratta salad", "Salade de burrata"],
      ["Tomatoes, salad mix, pesto", "Tomates, salade, pesto"],
      ["Stracciatella, pesto", "Stracciatella, pesto"],
      ["Gnocchi with gorgonzola", "Gnocchi au gorgonzola"],
      ["Prawns, bisque", "Crevettes, bisque"],
      ["Parsnip puree, tomato salsa, beurre blanc", "Purée de panais, salsa de tomate, beurre blanc"],
      ["Mashed potatoes, carrots, porcini mushrooms, jus", "Purée de pommes de terre, carottes, cèpes, jus"],
      ["Asparagus, peppers, egg", "Asperges, poivron, œuf"],
      ["with vanilla ice cream", "avec glace vanille"],
      ["Tiramisu with ice cream", "Tiramisu avec glace"],
      ["Bread basket with butter", "Corbeille de pain avec beurre"],
      ["Sourdough bread, black rye sourdough with fermented malt, brioche", "Pain au levain, pain de seigle noir au levain avec malt fermenté, brioche"],
      ["Eggs Benedict on brioche", "Œufs Benedict sur brioche"],
      ["Poached eggs, avocado, hollandaise", "Œufs pochés, avocat, sauce hollandaise"],
      ["With asparagus", "Avec asperges"],
      ["With roast beef", "Avec roast-beef"],
      ["Croissant with salmon", "Croissant au saumon"],
      ["Poached eggs, avocado, salad, hollandaise", "Œufs pochés, avocat, salade, sauce hollandaise"],
      ["Croissant with jamon", "Croissant au jambon"],
      ["French Toast", "Pain perdu"],
      ["Brioche, yuzu mascarpone, berries, caramel", "Brioche, mascarpone au yuzu, baies, caramel"],
      ["Sweet croissant", "Croissant sucré"],
      ["Yuzu mascarpone, chocolate-hazelnut praline, caramel", "Mascarpone au yuzu, praliné chocolat-noisette, caramel"],
      ["Homemade granola", "Granola maison"],
      ["Goji berries, nuts, yogurt", "Baies de goji, noix, yaourt"],
      ["Lunch", "Déjeuner"],
      ["Starters", "Entrées"],
      ["Pate with sourdough bread", "Pâté avec pain au levain"],
      ["Chicken liver, passion fruit, onion", "Foie de volaille, fruit de la passion, oignon"],
      ["Trio of dips with sourdough bread", "Trio de dips avec pain au levain"],
      ["Beef, venison, black rye sourdough, leaf salad, yuzu sesame, cornichons, mushrooms", "Bœuf, gibier, pain de seigle noir au levain, salade, sésame au yuzu, cornichons, champignons"],
      ["Salmon salad", "Salade au saumon"],
      ["Mixed salad, cauliflower, white asparagus, XO sauce", "Salade mélangée, chou-fleur, asperges blanches, sauce XO"],
      ["Mains", "Plats"],
      ["Consomme noodle soup", "Consommé aux nouilles"],
      ["Pork, noodles, egg", "Porc, nouilles, œuf"],
      ["Fjord trout steak", "Pavé de truite des fjords"],
      ["Parsnip puree, tomato salsa, bisque", "Purée de panais, salsa de tomate, bisque"],
      ["Mashed potatoes, carrots, mushrooms, jus", "Purée de pommes de terre, carottes, champignons, jus"],
      ["Asparagus with rice", "Asperges avec riz"],
      ["Eggplant, beurre blanc", "Aubergine, beurre blanc"],
      ["Desserts", "Desserts"],
      ["Honey cake with ice cream", "Gâteau au miel avec glace"],
      ["Cardamom bun with vanilla cream and strawberries", "Brioche à la cardamome, crème vanille et fraises"],
      ["Ice cream", "Glace"],
      ["Berries, caramel", "Baies, caramel"],
      ["The lunch menu is based on the current PDF menu. The full original menu is available below.", "La carte du déjeuner est basée sur le menu PDF actuel. La carte complète originale est disponible ci-dessous."],
      ["Current menu as PDF", "Carte actuelle en PDF"],
      ["Choose your date, time and party size directly in the reservation form.", "Choisissez la date, l'heure et le nombre de personnes directement dans le formulaire de réservation."],
      ["For 5 or more guests, please reserve by phone.", "À partir de 5 personnes, merci de réserver par téléphone."],
      ["Wednesday &amp; Sunday", "Mercredi &amp; dimanche"],
      ["Wednesday & Sunday", "Mercredi & dimanche"],
      ["Thursday - Saturday", "Jeudi - samedi"],
      ["Reservation", "Réservation"],
      ["Reserve a table at Kiku Bistro.", "Réserver une table au Kiku Bistro."],
      ["Choose your date, time and party size. Available times are calculated\n              automatically based on current reservations.", "Choisissez la date, l'heure et le nombre de personnes. Les horaires disponibles sont calculés\n              automatiquement selon les réservations existantes."],
      ["Opening hours", "Horaires"],
      ["Wednesday, 9:30 - 17:00; Thursday to Sunday, 9:30 - 21:00", "Mercredi, 9h30 - 17h00 ; jeudi &agrave; dimanche, 9h30 - 21h00"],
      ["Duration", "Durée"],
      ["Reservations are planned for 2 hours.", "Les réservations sont prévues pour 2 heures."],
      ["Groups", "Groupes"],
      ["Up to 4 guests are confirmed automatically; for 5 or more guests we contact you personally.", "Jusqu'à 4 personnes, la réservation est confirmée automatiquement ; à partir de 5 personnes, nous vous contactons personnellement."],
      ["Date", "Date"],
      ["Guests", "Personnes"],
      ["Time", "Heure"],
      ["Please choose a date", "Veuillez choisir une date"],
      ["Name", "Nom"],
      ["Phone", "Téléphone"],
      ["Message optional", "Message facultatif"],
      ["I agree that my details may be stored to process the reservation.", "J'accepte que mes données soient enregistrées pour traiter la réservation."],
      ["Confirm reservation", "Confirmer la réservation"],
      ["Address", "Adresse"],
      ["Thursday - Sunday", "Jeudi - dimanche"],
      ["Wednesday", "Mercredi"],
      ["Monday - Tuesday", "Lundi - mardi"],
      ["Closed", "Fermé"],
      ["Contact", "Contact"],
      ["Write an e-mail", "Écrire un e-mail"],
      ["Legal notice & privacy", "Mentions légales & confidentialité"],
      ["Terms", "CGV"],
    ],
    reservation: [
      ["Kiku Bistro | Manage reservation", "Kiku Bistro | Gérer la réservation"],
      ["Reservation", "Réservation"],
      ["Reserve", "Réserver"],
      ["Manage reservation", "Gérer la réservation"],
      ["Here you can view, change or cancel your reservation.", "Vous pouvez ici consulter, modifier ou annuler votre réservation."],
      ["Reservation is loading...", "Chargement de la réservation..."],
      ["Request", "Demande"],
      ["Confirmed", "Confirmée"],
      ["Guest seated", "Client arrivé"],
      ["Cancelled", "Annulée"],
      ["No-show", "Non venu"],
      [" at ", " à "],
      [" guests · ", " personnes · "],
      ["Date", "Date"],
      ["Guests", "Personnes"],
      ["Time", "Heure"],
      ["Note", "Note"],
      ["Save changes", "Enregistrer les modifications"],
      ["Cancel reservation", "Annuler la réservation"],
      ["Reservation not found.", "Réservation introuvable."],
      ["Reservation was updated.", "La réservation a été mise à jour."],
      ["Do you really want to cancel this reservation?", "Voulez-vous vraiment annuler cette réservation ?"],
      ["Reservation was cancelled.", "La réservation a été annulée."],
      ["Error", "Erreur"],
    ],
  },
  nl: {
    description: "Modern bistro in Quedlinburg met ontbijt, lunch en een kleine wisselende kaart.",
    replacements: [
      ["Very French. Very relaxed. Very alive.", "Heel Frans. Heel ontspannen. Heel levendig."],
      ["We are open Wednesday and Sunday from 9:30 to 17:00 and Thursday to Saturday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes. From Thursday\n                to Saturday evening, we also serve dinner with selected wines in a warm atmosphere.", "Wij zijn geopend op woensdag en zondag van 9:30 tot 17:00 en van donderdag tot en met zaterdag\n                van 9:30 tot 21:00, met moderne, verse ontbijt- en lunchgerechten. Van donderdag\n                tot en met zaterdagavond serveren wij ook diner met geselecteerde wijnen in een aangename sfeer."],
      ["View menu", "Bekijk menu"],
      ["Reserve a table", "Tafel reserveren"],
      ["Reserve", "Reserveren"],
      ["Get directions", "Route"],
      ["The bistro in Quedlinburg", "De bistro in Quedlinburg"],
      ["<span>The bistro</span><span>Kiku is here.</span>", "<span>De bistro</span><span>Kiku is er.</span>"],
      ["As the casual sibling of the Michelin-listed Restaurant Kiku, it brings serious cooking to the table in a relaxed atmosphere.", "Als de ontspannen zuster van Restaurant Kiku, vermeld in de Michelingids, brengt de bistro serieuze keuken in een ongedwongen sfeer."],
      ["Chef Jan Fribus reinterprets his favorite recipes, bakes croissants, bread and cakes fresh every day, and surprises with a special daily offer.", "Chef Jan Fribus geeft zijn favoriete recepten een nieuwe draai, bakt dagelijks verse croissants, brood en cake, en verrast met een dagspecial."],
      ["Breakfast. Lunch. Something in between.", "Ontbijt. Lunch. Iets daartussenin."],
      ["Uncomplicated. And at the highest quality.", "Ongecompliceerd. En van hoge kwaliteit."],
      ["Every day on Steinbruecke, right by the market square.", "Elke dag aan de Steinbrücke, direct bij het marktplein."],
      ["We look forward to seeing you.", "Wij kijken uit naar uw bezoek."],
      ["Freshly baked bread, fine patisserie and bold flavors in a relaxed atmosphere.", "Versgebakken brood, fijne patisserie en uitgesproken smaken in een ontspannen sfeer."],
      ["Menu", "Menu"],
      ["Breakfast, lunch and something in between.", "Ontbijt, lunch en iets daartussenin."],
      ["Breakfast", "Ontbijt"],
      ["From 12:00", "Vanaf 12:00"],
      ["Until 12:00", "Tot 12:00"],
      ["Bread basket", "Broodmand"],
      ["Sourdough bread, black rye sourdough with fermented malt, butter, jam and jam&oacute;n", "Zuurdesembrood, zwart roggezuurdesem met gefermenteerde mout, boter, jam en jamón"],
      ["Sourdough bread, black rye sourdough with fermented malt, cream cheese, jam&oacute;n, muhammara", "Zuurdesembrood, zwart roggezuurdesem met gefermenteerde mout, roomkaas, jamón, muhammara"],
      ["With salmon", "Met zalm"],
      ["With jam&oacute;n", "Met jamón"],
      ["Salmon tartare", "Zalmtartaar"],
      ["Guacamole, tomatoes, mango mayo", "Guacamole, tomaten, mangomayo"],
      ["Eggs, tomato sauce, peppers, feta", "Eieren, tomatensaus, paprika, feta"],
      ["Tomatoes, particella", "Tomaten, particella"],
      ["Brioche, yuzu mascarpone, berries, pistachio ice cream", "Brioche, yuzu-mascarpone, bessen, pistache-ijs"],
      ["Cardamom bun", "Kardemombroodje"],
      ["with vanilla cream and apple", "met vanillecrème en appel"],
      ["Berries, nuts, yogurt", "Bessen, noten, yoghurt"],
      ["Beef tartare", "Rundertartaar"],
      ["Mushrooms, brioche", "Paddenstoelen, brioche"],
      ["Tomato salad", "Tomatensalade"],
      ["Buratta salad", "Burratasalade"],
      ["Tomatoes, salad mix, pesto", "Tomaten, slamix, pesto"],
      ["Stracciatella, pesto", "Stracciatella, pesto"],
      ["Gnocchi with gorgonzola", "Gnocchi met gorgonzola"],
      ["Prawns, bisque", "Garnalen, bisque"],
      ["Parsnip puree, tomato salsa, beurre blanc", "Pastinaakpuree, tomatensalsa, beurre blanc"],
      ["Mashed potatoes, carrots, porcini mushrooms, jus", "Aardappelpuree, wortelen, eekhoorntjesbrood, jus"],
      ["Asparagus, peppers, egg", "Asperges, paprika, ei"],
      ["with vanilla ice cream", "met vanille-ijs"],
      ["Tiramisu with ice cream", "Tiramisu met ijs"],
      ["Bread basket with butter", "Broodmand met boter"],
      ["Sourdough bread, black rye sourdough with fermented malt, brioche", "Zuurdesembrood, zwart roggezuurdesem met gefermenteerde mout, brioche"],
      ["Eggs Benedict on brioche", "Eggs Benedict op brioche"],
      ["Poached eggs, avocado, hollandaise", "Gepocheerde eieren, avocado, hollandaisesaus"],
      ["With asparagus", "Met asperges"],
      ["With roast beef", "Met rosbief"],
      ["Croissant with salmon", "Croissant met zalm"],
      ["Poached eggs, avocado, salad, hollandaise", "Gepocheerde eieren, avocado, salade, hollandaisesaus"],
      ["Croissant with jamon", "Croissant met jamon"],
      ["French Toast", "Wentelteefjes"],
      ["Brioche, yuzu mascarpone, berries, caramel", "Brioche, yuzu-mascarpone, bessen, karamel"],
      ["Sweet croissant", "Zoete croissant"],
      ["Yuzu mascarpone, chocolate-hazelnut praline, caramel", "Yuzu-mascarpone, chocolade-hazelnootpraliné, karamel"],
      ["Homemade granola", "Huisgemaakte granola"],
      ["Goji berries, nuts, yogurt", "Gojibessen, noten, yoghurt"],
      ["Lunch", "Lunch"],
      ["Starters", "Voorgerechten"],
      ["Pate with sourdough bread", "Paté met zuurdesembrood"],
      ["Chicken liver, passion fruit, onion", "Kippenlever, passievrucht, ui"],
      ["Trio of dips with sourdough bread", "Trio van dips met zuurdesembrood"],
      ["Beef, venison, black rye sourdough, leaf salad, yuzu sesame, cornichons, mushrooms", "Rund, wild, zwart roggezuurdesem, bladsalade, yuzu-sesam, cornichons, paddenstoelen"],
      ["Salmon salad", "Zalmsalade"],
      ["Mixed salad, cauliflower, white asparagus, XO sauce", "Gemengde salade, bloemkool, witte asperges, XO-saus"],
      ["Mains", "Hoofdgerechten"],
      ["Consomme noodle soup", "Consommé met noedels"],
      ["Pork, noodles, egg", "Varkensvlees, noedels, ei"],
      ["Fjord trout steak", "Fjordforelsteak"],
      ["Parsnip puree, tomato salsa, bisque", "Pastinaakpuree, tomatensalsa, bisque"],
      ["Mashed potatoes, carrots, mushrooms, jus", "Aardappelpuree, wortelen, paddenstoelen, jus"],
      ["Asparagus with rice", "Asperges met rijst"],
      ["Eggplant, beurre blanc", "Aubergine, beurre blanc"],
      ["Desserts", "Desserts"],
      ["Honey cake with ice cream", "Honingcake met ijs"],
      ["Cardamom bun with vanilla cream and strawberries", "Kardemombroodje met vanillecrème en aardbeien"],
      ["Ice cream", "IJs"],
      ["Berries, caramel", "Bessen, karamel"],
      ["The lunch menu is based on the current PDF menu. The full original menu is available below.", "Het lunchmenu is gebaseerd op het actuele PDF-menu. Het volledige originele menu vindt u hieronder."],
      ["Current menu as PDF", "Actueel menu als PDF"],
      ["Choose your date, time and party size directly in the reservation form.", "Kies datum, tijd en aantal personen direct in het reserveringsformulier."],
      ["For 5 or more guests, please reserve by phone.", "Voor 5 of meer personen reserveert u telefonisch."],
      ["Wednesday &amp; Sunday", "Woensdag &amp; zondag"],
      ["Wednesday & Sunday", "Woensdag & zondag"],
      ["Thursday - Saturday", "Donderdag - zaterdag"],
      ["Reservation", "Reservering"],
      ["Reserve a table at Kiku Bistro.", "Reserveer een tafel bij Kiku Bistro."],
      ["Choose your date, time and party size. Available times are calculated\n              automatically based on current reservations.", "Kies datum, tijd en aantal personen. Beschikbare tijden worden automatisch\n              berekend op basis van bestaande reserveringen."],
      ["Opening hours", "Openingstijden"],
      ["Wednesday, 9:30 - 17:00; Thursday to Sunday, 9:30 - 21:00", "Woensdag, 9:30 - 17:00; donderdag tot en met zondag, 9:30 - 21:00"],
      ["Duration", "Duur"],
      ["Reservations are planned for 2 hours.", "Reserveringen zijn gepland voor 2 uur."],
      ["Groups", "Groepen"],
      ["Up to 4 guests are confirmed automatically; for 5 or more guests we contact you personally.", "Tot en met 4 personen wordt automatisch bevestigd; vanaf 5 personen nemen wij persoonlijk contact op."],
      ["Date", "Datum"],
      ["Guests", "Personen"],
      ["Time", "Tijd"],
      ["Please choose a date", "Kies een datum"],
      ["Name", "Naam"],
      ["Phone", "Telefoon"],
      ["Message optional", "Bericht optioneel"],
      ["I agree that my details may be stored to process the reservation.", "Ik ga ermee akkoord dat mijn gegevens worden opgeslagen om de reservering te verwerken."],
      ["Confirm reservation", "Reservering bevestigen"],
      ["Address", "Adres"],
      ["Thursday - Sunday", "Donderdag - zondag"],
      ["Wednesday", "Woensdag"],
      ["Monday - Tuesday", "Maandag - dinsdag"],
      ["Closed", "Gesloten"],
      ["Contact", "Contact"],
      ["Write an e-mail", "E-mail schrijven"],
      ["Legal notice & privacy", "Juridische informatie & privacy"],
      ["Terms", "Voorwaarden"],
    ],
    reservation: [
      ["Kiku Bistro | Manage reservation", "Kiku Bistro | Reservering beheren"],
      ["Reservation", "Reservering"],
      ["Reserve", "Reserveren"],
      ["Manage reservation", "Reservering beheren"],
      ["Here you can view, change or cancel your reservation.", "Hier kunt u uw reservering bekijken, wijzigen of annuleren."],
      ["Reservation is loading...", "Reservering wordt geladen..."],
      ["Request", "Aanvraag"],
      ["Confirmed", "Bevestigd"],
      ["Guest seated", "Gast aanwezig"],
      ["Cancelled", "Geannuleerd"],
      ["No-show", "Niet gekomen"],
      [" at ", " om "],
      [" guests · ", " personen · "],
      ["Date", "Datum"],
      ["Guests", "Personen"],
      ["Time", "Tijd"],
      ["Note", "Notitie"],
      ["Save changes", "Wijzigingen opslaan"],
      ["Cancel reservation", "Reservering annuleren"],
      ["Reservation not found.", "Reservering niet gevonden."],
      ["Reservation was updated.", "Reservering is bijgewerkt."],
      ["Do you really want to cancel this reservation?", "Wilt u deze reservering echt annuleren?"],
      ["Reservation was cancelled.", "Reservering is geannuleerd."],
      ["Error", "Fout"],
    ],
  },
  pl: {
    description: "Nowoczesne bistro w Quedlinburgu ze śniadaniami, lunchem i małą zmienną kartą.",
    replacements: [
      ["Very French. Very relaxed. Very alive.", "Bardzo francusko. Bardzo swobodnie. Bardzo żywo."],
      ["We are open Wednesday and Sunday from 9:30 to 17:00 and Thursday to Saturday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes. From Thursday\n                to Saturday evening, we also serve dinner with selected wines in a warm atmosphere.", "Jeste&#347;my otwarci w &#347;rod&#281; i niedziel&#281; od 9:30 do 17:00 oraz od czwartku do soboty\n                od 9:30 do 21:00. Serwujemy nowoczesne, &#347;wie&#380;e dania &#347;niadaniowe i lunchowe.\n                Od czwartku do soboty wieczorem zapraszamy tak&#380;e na kolacje z wybranymi winami w przyjemnej atmosferze."],
      ["View menu", "Zobacz menu"],
      ["Reserve a table", "Zarezerwuj stolik"],
      ["Reserve", "Rezerwuj"],
      ["Get directions", "Dojazd"],
      ["The bistro in Quedlinburg", "Bistro w Quedlinburgu"],
      ["<span>The bistro</span><span>Kiku is here.</span>", "<span>Bistro</span><span>Kiku jest tutaj.</span>"],
      ["As the casual sibling of the Michelin-listed Restaurant Kiku, it brings serious cooking to the table in a relaxed atmosphere.", "Jako swobodniejsza siostra restauracji Kiku wyróżnionej w przewodniku Michelin, bistro łączy poważną kuchnię z luźną atmosferą."],
      ["Chef Jan Fribus reinterprets his favorite recipes, bakes croissants, bread and cakes fresh every day, and surprises with a special daily offer.", "Szef Jan Fribus interpretuje na nowo swoje ulubione przepisy, codziennie piecze świeże croissanty, pieczywo i ciasta oraz zaskakuje daniem dnia."],
      ["Breakfast. Lunch. Something in between.", "Śniadanie. Lunch. Coś pomiędzy."],
      ["Uncomplicated. And at the highest quality.", "Bez komplikacji. I w najwyższej jakości."],
      ["Every day on Steinbruecke, right by the market square.", "Codziennie przy Steinbrücke, tuż obok rynku."],
      ["We look forward to seeing you.", "Czekamy na Państwa wizytę."],
      ["Freshly baked bread, fine patisserie and bold flavors in a relaxed atmosphere.", "Świeżo pieczony chleb, delikatne wypieki i wyraziste smaki w swobodnej atmosferze."],
      ["Menu", "Menu"],
      ["Breakfast, lunch and something in between.", "Śniadanie, lunch i coś pomiędzy."],
      ["Breakfast", "Śniadanie"],
      ["From 12:00", "Od 12:00"],
      ["Until 12:00", "Do 12:00"],
      ["Bread basket", "Koszyk pieczywa"],
      ["Sourdough bread, black rye sourdough with fermented malt, butter, jam and jam&oacute;n", "Chleb na zakwasie, ciemny chleb żytni na zakwasie z fermentowanym słodem, masło, dżem i jamón"],
      ["Sourdough bread, black rye sourdough with fermented malt, cream cheese, jam&oacute;n, muhammara", "Chleb na zakwasie, ciemny chleb żytni na zakwasie z fermentowanym słodem, serek śmietankowy, jamón, muhammara"],
      ["With salmon", "Z łososiem"],
      ["With jam&oacute;n", "Z jamón"],
      ["Salmon tartare", "Tatar z łososia"],
      ["Guacamole, tomatoes, mango mayo", "Guacamole, pomidory, majonez mango"],
      ["Eggs, tomato sauce, peppers, feta", "Jajka, sos pomidorowy, papryka, feta"],
      ["Tomatoes, particella", "Pomidory, particella"],
      ["Brioche, yuzu mascarpone, berries, pistachio ice cream", "Brioche, mascarpone yuzu, owoce jagodowe, lody pistacjowe"],
      ["Cardamom bun", "Bułka kardamonowa"],
      ["with vanilla cream and apple", "z kremem waniliowym i jabłkiem"],
      ["Berries, nuts, yogurt", "Owoce jagodowe, orzechy, jogurt"],
      ["Beef tartare", "Tatar wołowy"],
      ["Mushrooms, brioche", "Grzyby, brioche"],
      ["Tomato salad", "Sałatka pomidorowa"],
      ["Buratta salad", "Sa&#322;atka z burrat&#261;"],
      ["Tomatoes, salad mix, pesto", "Pomidory, mix sa&#322;at, pesto"],
      ["Stracciatella, pesto", "Stracciatella, pesto"],
      ["Gnocchi with gorgonzola", "Gnocchi z gorgonzolą"],
      ["Prawns, bisque", "Krewetki, bisque"],
      ["Parsnip puree, tomato salsa, beurre blanc", "Purée z pasternaku, salsa pomidorowa, beurre blanc"],
      ["Mashed potatoes, carrots, porcini mushrooms, jus", "Purée ziemniaczane, marchew, borowiki, sos"],
      ["Asparagus, peppers, egg", "Szparagi, papryka, jajko"],
      ["with vanilla ice cream", "z lodami waniliowymi"],
      ["Tiramisu with ice cream", "Tiramisu z lodami"],
      ["Bread basket with butter", "Koszyk pieczywa z masłem"],
      ["Sourdough bread, black rye sourdough with fermented malt, brioche", "Chleb na zakwasie, czarniak żytni na zakwasie z fermentowanym słodem, brioche"],
      ["Eggs Benedict on brioche", "Jajka po benedyktyńsku na brioche"],
      ["Poached eggs, avocado, hollandaise", "Jajka w koszulce, awokado, sos holenderski"],
      ["With asparagus", "Ze szparagami"],
      ["With roast beef", "Z roast beefem"],
      ["Croissant with salmon", "Croissant z łososiem"],
      ["Poached eggs, avocado, salad, hollandaise", "Jajka w koszulce, awokado, sałata, sos holenderski"],
      ["Croissant with jamon", "Croissant z jamon"],
      ["French Toast", "Tost francuski"],
      ["Brioche, yuzu mascarpone, berries, caramel", "Brioche, mascarpone z yuzu, owoce jagodowe, karmel"],
      ["Sweet croissant", "Słodki croissant"],
      ["Yuzu mascarpone, chocolate-hazelnut praline, caramel", "Mascarpone z yuzu, pralina czekoladowo-orzechowa, karmel"],
      ["Homemade granola", "Domowa granola"],
      ["Goji berries, nuts, yogurt", "Jagody goji, orzechy, jogurt"],
      ["Lunch", "Lunch"],
      ["Starters", "Przystawki"],
      ["Pate with sourdough bread", "Pasztet z chlebem na zakwasie"],
      ["Chicken liver, passion fruit, onion", "Wątróbka drobiowa, marakuja, cebula"],
      ["Trio of dips with sourdough bread", "Trio dipów z chlebem na zakwasie"],
      ["Beef, venison, black rye sourdough, leaf salad, yuzu sesame, cornichons, mushrooms", "Wołowina, dziczyzna, czarniak żytni na zakwasie, sałata, sezam yuzu, korniszony, grzyby"],
      ["Salmon salad", "Sałatka z łososiem"],
      ["Mixed salad, cauliflower, white asparagus, XO sauce", "Mieszana sałata, kalafior, białe szparagi, sos XO"],
      ["Mains", "Dania główne"],
      ["Consomme noodle soup", "Consommé z makaronem"],
      ["Pork, noodles, egg", "Wieprzowina, makaron, jajko"],
      ["Fjord trout steak", "Stek z pstrąga fiordowego"],
      ["Parsnip puree, tomato salsa, bisque", "Purée z pasternaku, salsa pomidorowa, bisque"],
      ["Mashed potatoes, carrots, mushrooms, jus", "Purée ziemniaczane, marchew, grzyby, sos"],
      ["Asparagus with rice", "Szparagi z ryżem"],
      ["Eggplant, beurre blanc", "Bakłażan, beurre blanc"],
      ["Desserts", "Desery"],
      ["Honey cake with ice cream", "Ciasto miodowe z lodami"],
      ["Cardamom bun with vanilla cream and strawberries", "Bułeczka kardamonowa z kremem waniliowym i truskawkami"],
      ["Ice cream", "Lody"],
      ["Berries, caramel", "Owoce jagodowe, karmel"],
      ["The lunch menu is based on the current PDF menu. The full original menu is available below.", "Menu lunchowe opiera się na aktualnym menu PDF. Pełna oryginalna karta znajduje się poniżej."],
      ["Current menu as PDF", "Aktualne menu jako PDF"],
      ["Choose your date, time and party size directly in the reservation form.", "Wybierz datę, godzinę i liczbę osób bezpośrednio w formularzu rezerwacji."],
      ["For 5 or more guests, please reserve by phone.", "Dla 5 lub więcej osób prosimy o rezerwację telefoniczną."],
      ["Wednesday &amp; Sunday", "Środa &amp; niedziela"],
      ["Wednesday & Sunday", "Środa & niedziela"],
      ["Thursday - Saturday", "Czwartek - sobota"],
      ["Reservation", "Rezerwacja"],
      ["Reserve a table at Kiku Bistro.", "Zarezerwuj stolik w Kiku Bistro."],
      ["Choose your date, time and party size. Available times are calculated\n              automatically based on current reservations.", "Wybierz datę, godzinę i liczbę osób. Dostępne godziny są obliczane\n              automatycznie na podstawie istniejących rezerwacji."],
      ["Opening hours", "Godziny otwarcia"],
      ["Wednesday, 9:30 - 17:00; Thursday to Sunday, 9:30 - 21:00", "&#346;roda, 9:30 - 17:00; czwartek - niedziela, 9:30 - 21:00"],
      ["Duration", "Czas trwania"],
      ["Reservations are planned for 2 hours.", "Rezerwacje są planowane na 2 godziny."],
      ["Groups", "Grupy"],
      ["Up to 4 guests are confirmed automatically; for 5 or more guests we contact you personally.", "Do 4 osób rezerwacja jest potwierdzana automatycznie; przy 5 lub więcej osobach kontaktujemy się osobiście."],
      ["Date", "Data"],
      ["Guests", "Osoby"],
      ["Time", "Godzina"],
      ["Please choose a date", "Wybierz datę"],
      ["Name", "Imię i nazwisko"],
      ["Phone", "Telefon"],
      ["Message optional", "Wiadomość opcjonalna"],
      ["I agree that my details may be stored to process the reservation.", "Zgadzam się na przechowywanie moich danych w celu obsługi rezerwacji."],
      ["Confirm reservation", "Potwierdź rezerwację"],
      ["Address", "Adres"],
      ["Thursday - Sunday", "Czwartek - niedziela"],
      ["Wednesday", "&#346;roda"],
      ["Monday - Tuesday", "Poniedziałek - wtorek"],
      ["Closed", "Zamknięte"],
      ["Contact", "Kontakt"],
      ["Write an e-mail", "Napisz e-mail"],
      ["Legal notice & privacy", "Nota prawna i prywatność"],
      ["Terms", "Regulamin"],
    ],
    reservation: [
      ["Kiku Bistro | Manage reservation", "Kiku Bistro | Zarządzanie rezerwacją"],
      ["Reservation", "Rezerwacja"],
      ["Reserve", "Zarezerwuj"],
      ["Manage reservation", "Zarządzaj rezerwacją"],
      ["Here you can view, change or cancel your reservation.", "Tutaj możesz sprawdzić, zmienić lub anulować rezerwację."],
      ["Reservation is loading...", "Ładowanie rezerwacji..."],
      ["Request", "Zapytanie"],
      ["Confirmed", "Potwierdzona"],
      ["Guest seated", "Gość na miejscu"],
      ["Cancelled", "Anulowana"],
      ["No-show", "Nie przyszedł"],
      [" at ", " o "],
      [" guests · ", " osoby · "],
      ["Date", "Data"],
      ["Guests", "Osoby"],
      ["Time", "Godzina"],
      ["Note", "Notatka"],
      ["Save changes", "Zapisz zmiany"],
      ["Cancel reservation", "Anuluj rezerwację"],
      ["Reservation not found.", "Nie znaleziono rezerwacji."],
      ["Reservation was updated.", "Rezerwacja została zaktualizowana."],
      ["Do you really want to cancel this reservation?", "Czy na pewno chcesz anulować tę rezerwację?"],
      ["Reservation was cancelled.", "Rezerwacja została anulowana."],
      ["Error", "Błąd"],
    ],
  },
  cs: {
    description: "Moderní bistro v Quedlinburgu se snídaní, obědem a malou obměňovanou nabídkou.",
    replacements: [
      ["Very French. Very relaxed. Very alive.", "Velmi francouzské. Velmi uvolněné. Velmi živé."],
      ["We are open Wednesday and Sunday from 9:30 to 17:00 and Thursday to Saturday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes. From Thursday\n                to Saturday evening, we also serve dinner with selected wines in a warm atmosphere.", "M&aacute;me otev&#345;eno ve st&#345;edu a v ned&#283;li od 9:30 do 17:00 a od &#269;tvrtka do soboty\n                od 9:30 do 21:00. Pod&aacute;v&aacute;me modern&iacute;, &#269;erstv&aacute; sn&iacute;da&#328;ov&aacute; a poledn&iacute; j&iacute;dla.\n                Od &#269;tvrtka do soboty ve&#269;er nab&iacute;z&iacute;me tak&eacute; ve&#269;e&#345;e s vybran&yacute;mi v&iacute;ny v p&#345;&iacute;jemn&eacute; atmosf&eacute;&#345;e."],
      ["View menu", "Zobrazit menu"],
      ["Reserve a table", "Rezervovat stůl"],
      ["Reserve", "Rezervovat"],
      ["Get directions", "Navigace"],
      ["The bistro in Quedlinburg", "Bistro v Quedlinburgu"],
      ["<span>The bistro</span><span>Kiku is here.</span>", "<span>Bistro</span><span>Kiku je tady.</span>"],
      ["As the casual sibling of the Michelin-listed Restaurant Kiku, it brings serious cooking to the table in a relaxed atmosphere.", "Jako uvolněnější sourozenec restaurace Kiku uvedené v průvodci Michelin přináší bistro poctivou kuchyni v neformální atmosféře."],
      ["Chef Jan Fribus reinterprets his favorite recipes, bakes croissants, bread and cakes fresh every day, and surprises with a special daily offer.", "Šéfkuchař Jan Fribus nově pojímá své oblíbené recepty, každý den peče čerstvé croissanty, chléb a koláče a překvapuje denní nabídkou."],
      ["Breakfast. Lunch. Something in between.", "Snídaně. Oběd. Něco mezi tím."],
      ["Uncomplicated. And at the highest quality.", "Neformálně. A ve vysoké kvalitě."],
      ["Every day on Steinbruecke, right by the market square.", "Každý den na Steinbrücke, hned u náměstí."],
      ["We look forward to seeing you.", "Těšíme se na vaši návštěvu."],
      ["Freshly baked bread, fine patisserie and bold flavors in a relaxed atmosphere.", "Čerstvě pečený chléb, jemná cukrařina a výrazné chutě v uvolněné atmosféře."],
      ["Menu", "Menu"],
      ["Breakfast, lunch and something in between.", "Snídaně, oběd a něco mezi tím."],
      ["Breakfast", "Snídaně"],
      ["From 12:00", "Od 12:00"],
      ["Until 12:00", "Do 12:00"],
      ["Bread basket", "Košík pečiva"],
      ["Sourdough bread, black rye sourdough with fermented malt, butter, jam and jam&oacute;n", "Kváskový chléb, černý žitný kváskový chléb s fermentovaným sladem, máslo, marmeláda a jamón"],
      ["Sourdough bread, black rye sourdough with fermented malt, cream cheese, jam&oacute;n, muhammara", "Kváskový chléb, černý žitný kváskový chléb s fermentovaným sladem, čerstvý sýr, jamón, muhammara"],
      ["With salmon", "S lososem"],
      ["With jam&oacute;n", "S jamónem"],
      ["Salmon tartare", "Tatarák z lososa"],
      ["Guacamole, tomatoes, mango mayo", "Guacamole, rajčata, mangová mayo"],
      ["Eggs, tomato sauce, peppers, feta", "Vejce, rajčatová omáčka, paprika, feta"],
      ["Tomatoes, particella", "Rajčata, particella"],
      ["Brioche, yuzu mascarpone, berries, pistachio ice cream", "Brioška, yuzu mascarpone, bobulové ovoce, pistáciová zmrzlina"],
      ["Cardamom bun", "Kardamomová buchta"],
      ["with vanilla cream and apple", "s vanilkovým krémem a jablkem"],
      ["Berries, nuts, yogurt", "Bobulové ovoce, ořechy, jogurt"],
      ["Beef tartare", "Hovězí tatarák"],
      ["Mushrooms, brioche", "Houby, brioška"],
      ["Tomato salad", "Rajčatový salát"],
      ["Buratta salad", "Sal&aacute;t s burratou"],
      ["Tomatoes, salad mix, pesto", "Raj&#269;ata, sal&aacute;tov&yacute; mix, pesto"],
      ["Stracciatella, pesto", "Stracciatella, pesto"],
      ["Gnocchi with gorgonzola", "Gnocchi s gorgonzolou"],
      ["Prawns, bisque", "Krevety, bisque"],
      ["Parsnip puree, tomato salsa, beurre blanc", "Pastinákové pyré, rajčatová salsa, beurre blanc"],
      ["Mashed potatoes, carrots, porcini mushrooms, jus", "Bramborové pyré, mrkev, hřiby, jus"],
      ["Asparagus, peppers, egg", "Chřest, paprika, vejce"],
      ["with vanilla ice cream", "s vanilkovou zmrzlinou"],
      ["Tiramisu with ice cream", "Tiramisu se zmrzlinou"],
      ["Bread basket with butter", "Košík pečiva s máslem"],
      ["Sourdough bread, black rye sourdough with fermented malt, brioche", "Kváskový chléb, černý žitný kváskový chléb s fermentovaným sladem, brioška"],
      ["Eggs Benedict on brioche", "Vejce Benedikt na briošce"],
      ["Poached eggs, avocado, hollandaise", "Ztracená vejce, avokádo, holandská omáčka"],
      ["With asparagus", "S chřestem"],
      ["With roast beef", "S roastbeefem"],
      ["Croissant with salmon", "Croissant s lososem"],
      ["Poached eggs, avocado, salad, hollandaise", "Ztracená vejce, avokádo, salát, holandská omáčka"],
      ["Croissant with jamon", "Croissant s jamonem"],
      ["French Toast", "Francouzský toast"],
      ["Brioche, yuzu mascarpone, berries, caramel", "Brioška, yuzu mascarpone, bobulové ovoce, karamel"],
      ["Sweet croissant", "Sladký croissant"],
      ["Yuzu mascarpone, chocolate-hazelnut praline, caramel", "Yuzu mascarpone, čokoládovo-oříšková pralinka, karamel"],
      ["Homemade granola", "Domácí granola"],
      ["Goji berries, nuts, yogurt", "Goji, ořechy, jogurt"],
      ["Lunch", "Oběd"],
      ["Starters", "Předkrmy"],
      ["Pate with sourdough bread", "Paštika s kváskovým chlebem"],
      ["Chicken liver, passion fruit, onion", "Kuřecí játra, marakuja, cibule"],
      ["Trio of dips with sourdough bread", "Trio dipů s kváskovým chlebem"],
      ["Beef, venison, black rye sourdough, leaf salad, yuzu sesame, cornichons, mushrooms", "Hovězí, zvěřina, černý žitný kváskový chléb, listový salát, yuzu sezam, okurky, houby"],
      ["Salmon salad", "Salát s lososem"],
      ["Mixed salad, cauliflower, white asparagus, XO sauce", "Míchaný salát, květák, bílý chřest, XO omáčka"],
      ["Mains", "Hlavní jídla"],
      ["Consomme noodle soup", "Consommé s nudlemi"],
      ["Pork, noodles, egg", "Vepřové, nudle, vejce"],
      ["Fjord trout steak", "Steak z fjordského pstruha"],
      ["Parsnip puree, tomato salsa, bisque", "Pastinákové pyré, rajčatová salsa, bisque"],
      ["Mashed potatoes, carrots, mushrooms, jus", "Bramborová kaše, mrkev, houby, jus"],
      ["Asparagus with rice", "Chřest s rýží"],
      ["Eggplant, beurre blanc", "Lilek, beurre blanc"],
      ["Desserts", "Dezerty"],
      ["Honey cake with ice cream", "Medový koláč se zmrzlinou"],
      ["Cardamom bun with vanilla cream and strawberries", "Kardamomová buchta s vanilkovým krémem a jahodami"],
      ["Ice cream", "Zmrzlina"],
      ["Berries, caramel", "Bobulové ovoce, karamel"],
      ["The lunch menu is based on the current PDF menu. The full original menu is available below.", "Polední menu vychází z aktuálního PDF menu. Kompletní původní menu najdete níže."],
      ["Current menu as PDF", "Aktuální menu jako PDF"],
      ["Choose your date, time and party size directly in the reservation form.", "Vyberte datum, čas a počet osob přímo v rezervačním formuláři."],
      ["For 5 or more guests, please reserve by phone.", "Pro 5 a více osob prosím rezervujte telefonicky."],
      ["Wednesday &amp; Sunday", "Středa &amp; neděle"],
      ["Wednesday & Sunday", "Středa & neděle"],
      ["Thursday - Saturday", "Čtvrtek - sobota"],
      ["Reservation", "Rezervace"],
      ["Reserve a table at Kiku Bistro.", "Rezervujte si stůl v Kiku Bistro."],
      ["Choose your date, time and party size. Available times are calculated\n              automatically based on current reservations.", "Vyberte datum, čas a počet osob. Dostupné časy se počítají\n              automaticky podle stávajících rezervací."],
      ["Opening hours", "Otevírací doba"],
      ["Wednesday, 9:30 - 17:00; Thursday to Sunday, 9:30 - 21:00", "St&#345;eda, 9:30 - 17:00; &#269;tvrtek a&#382; ned&#283;le, 9:30 - 21:00"],
      ["Duration", "Délka"],
      ["Reservations are planned for 2 hours.", "Rezervace jsou plánovány na 2 hodiny."],
      ["Groups", "Skupiny"],
      ["Up to 4 guests are confirmed automatically; for 5 or more guests we contact you personally.", "Až 4 osoby potvrzujeme automaticky; u 5 a více osob vás kontaktujeme osobně."],
      ["Date", "Datum"],
      ["Guests", "Osoby"],
      ["Time", "Čas"],
      ["Please choose a date", "Vyberte datum"],
      ["Name", "Jméno"],
      ["Phone", "Telefon"],
      ["Message optional", "Volitelná zpráva"],
      ["I agree that my details may be stored to process the reservation.", "Souhlasím s uložením svých údajů pro zpracování rezervace."],
      ["Confirm reservation", "Potvrdit rezervaci"],
      ["Address", "Adresa"],
      ["Thursday - Sunday", "&#268;tvrtek - ned&#283;le"],
      ["Wednesday", "St&#345;eda"],
      ["Monday - Tuesday", "Pondělí - úterý"],
      ["Closed", "Zavřeno"],
      ["Contact", "Kontakt"],
      ["Write an e-mail", "Napsat e-mail"],
      ["Legal notice & privacy", "Právní informace a soukromí"],
      ["Terms", "Podmínky"],
    ],
    reservation: [
      ["Kiku Bistro | Manage reservation", "Kiku Bistro | Správa rezervace"],
      ["Reservation", "Rezervace"],
      ["Reserve", "Rezervovat"],
      ["Manage reservation", "Správa rezervace"],
      ["Here you can view, change or cancel your reservation.", "Zde můžete svou rezervaci zobrazit, změnit nebo zrušit."],
      ["Reservation is loading...", "Rezervace se načítá..."],
      ["Request", "Poptávka"],
      ["Confirmed", "Potvrzeno"],
      ["Guest seated", "Host dorazil"],
      ["Cancelled", "Zrušeno"],
      ["No-show", "Nedorazil"],
      [" at ", " v "],
      [" guests · ", " osoby · "],
      ["Date", "Datum"],
      ["Guests", "Osoby"],
      ["Time", "Čas"],
      ["Note", "Poznámka"],
      ["Save changes", "Uložit změny"],
      ["Cancel reservation", "Zrušit rezervaci"],
      ["Reservation not found.", "Rezervace nebyla nalezena."],
      ["Reservation was updated.", "Rezervace byla aktualizována."],
      ["Do you really want to cancel this reservation?", "Opravdu chcete tuto rezervaci zrušit?"],
      ["Reservation was cancelled.", "Rezervace byla zrušena."],
      ["Error", "Chyba"],
    ],
  },
};

const menuUpdateReplacements = {
  fr: [
    ["Sourdough bread, black rye sourdough, butter, jam, cheese and jam&oacute;n", "Pain au levain, pain de seigle noir au levain, beurre, confiture, fromage et jamón"],
    ["Benedict open sandwich", "Tartine Benedict"],
    ["Brioche, poached eggs, avocado, hollandaise", "Brioche, œufs pochés, avocat, sauce hollandaise"],
    ["Tomato and burrata open sandwich", "Tartine tomate et burrata"],
    ["Brioche, avocado, pesto", "Brioche, avocat, pesto"],
    ["Vanilla cream and apple", "Crème vanille et pomme"],
    ["Homemade sourdough bread, black rye sourdough", "Pain au levain maison, pain de seigle noir au levain"],
    ["Bread basket with butter &amp; dips", "Corbeille de pain avec beurre &amp; dips"],
    ["Hummus with sourdough bread", "Houmous avec pain au levain"],
    ["Brioche, mushrooms, salad mix", "Brioche, champignons, salade"],
    ["Caesar salad", "Salade César"],
    ["Salad mix, chicken, parmesan", "Salade, poulet, parmesan"],
    ["Gorgonzola, prawns, bisque", "Gorgonzola, crevettes, bisque"],
    ["Beef ragout", "Ragoût de bœuf"],
    ["Parsley potatoes, lingonberries, salad", "Pommes de terre persillées, airelles, salade"],
    ["Singapore chili chicken", "Poulet chili Singapour"],
    ["Truffle risotto", "Risotto à la truffe"],
    ["Truffle, parmesan", "Truffe, parmesan"],
    ["Vanilla cream, apple", "Crème vanille, pomme"],
    ["Mascarpone, coffee, vanilla ice cream", "Mascarpone, café, glace vanille"],
    ["Honey cake", "Gâteau au miel"],
    ["Passion fruit, mango ice cream", "Fruit de la passion, glace mangue"],
  ],
  nl: [
    ["Sourdough bread, black rye sourdough, butter, jam, cheese and jam&oacute;n", "Zuurdesembrood, zwart roggezuurdesem, boter, jam, kaas en jamón"],
    ["Benedict open sandwich", "Benedict open sandwich"],
    ["Brioche, poached eggs, avocado, hollandaise", "Brioche, gepocheerde eieren, avocado, hollandaise"],
    ["Tomato and burrata open sandwich", "Open sandwich met tomaat en burrata"],
    ["Brioche, avocado, pesto", "Brioche, avocado, pesto"],
    ["Vanilla cream and apple", "Vanillecrème en appel"],
    ["Homemade sourdough bread, black rye sourdough", "Huisgemaakt zuurdesembrood, zwart roggezuurdesem"],
    ["Bread basket with butter &amp; dips", "Broodmand met boter &amp; dips"],
    ["Hummus with sourdough bread", "Hummus met zuurdesembrood"],
    ["Brioche, mushrooms, salad mix", "Brioche, paddenstoelen, slamix"],
    ["Caesar salad", "Caesarsalade"],
    ["Salad mix, chicken, parmesan", "Slamix, kip, parmezaan"],
    ["Gorgonzola, prawns, bisque", "Gorgonzola, garnalen, bisque"],
    ["Beef ragout", "Runderragout"],
    ["Parsley potatoes, lingonberries, salad", "Peterselie-aardappelen, vossenbessen, salade"],
    ["Singapore chili chicken", "Singapore chili kip"],
    ["Truffle risotto", "Truffelrisotto"],
    ["Truffle, parmesan", "Truffel, parmezaan"],
    ["Vanilla cream, apple", "Vanillecrème, appel"],
    ["Mascarpone, coffee, vanilla ice cream", "Mascarpone, koffie, vanille-ijs"],
    ["Honey cake", "Honingcake"],
    ["Passion fruit, mango ice cream", "Passievrucht, mango-ijs"],
  ],
  pl: [
    ["Sourdough bread, black rye sourdough, butter, jam, cheese and jam&oacute;n", "Chleb na zakwasie, czarny żytni chleb na zakwasie, masło, konfitura, ser i jamón"],
    ["Benedict open sandwich", "Kanapka Benedict"],
    ["Brioche, poached eggs, avocado, hollandaise", "Brioche, jajka w koszulce, awokado, sos holenderski"],
    ["Tomato and burrata open sandwich", "Kanapka z pomidorami i burratą"],
    ["Brioche, avocado, pesto", "Brioche, awokado, pesto"],
    ["Vanilla cream and apple", "Krem waniliowy i jabłko"],
    ["Homemade sourdough bread, black rye sourdough", "Domowy chleb na zakwasie, czarny żytni chleb na zakwasie"],
    ["Bread basket with butter &amp; dips", "Koszyk chleba z masłem i dipami"],
    ["Hummus with sourdough bread", "Hummus z chlebem na zakwasie"],
    ["Brioche, mushrooms, salad mix", "Brioche, grzyby, mix sałat"],
    ["Caesar salad", "Sałatka Caesar"],
    ["Salad mix, chicken, parmesan", "Mix sałat, kurczak, parmezan"],
    ["Gorgonzola, prawns, bisque", "Gorgonzola, krewetki, bisque"],
    ["Beef ragout", "Ragout wołowe"],
    ["Parsley potatoes, lingonberries, salad", "Ziemniaki z pietruszką, borówki, sałata"],
    ["Singapore chili chicken", "Kurczak chili Singapore"],
    ["Truffle risotto", "Risotto truflowe"],
    ["Truffle, parmesan", "Trufla, parmezan"],
    ["Vanilla cream, apple", "Krem waniliowy, jabłko"],
    ["Mascarpone, coffee, vanilla ice cream", "Mascarpone, kawa, lody waniliowe"],
    ["Honey cake", "Ciasto miodowe"],
    ["Passion fruit, mango ice cream", "Marakuja, lody mango"],
  ],
  cs: [
    ["Sourdough bread, black rye sourdough, butter, jam, cheese and jam&oacute;n", "Kváskový chléb, černý žitný kváskový chléb, máslo, marmeláda, sýr a jamón"],
    ["Benedict open sandwich", "Obložený chléb Benedict"],
    ["Brioche, poached eggs, avocado, hollandaise", "Brioche, ztracená vejce, avokádo, holandská omáčka"],
    ["Tomato and burrata open sandwich", "Obložený chléb s rajčaty a burratou"],
    ["Brioche, avocado, pesto", "Brioche, avokádo, pesto"],
    ["Vanilla cream and apple", "Vanilkový krém a jablko"],
    ["Homemade sourdough bread, black rye sourdough", "Domácí kváskový chléb, černý žitný kváskový chléb"],
    ["Bread basket with butter &amp; dips", "Košík chleba s máslem a dipy"],
    ["Hummus with sourdough bread", "Hummus s kváskovým chlebem"],
    ["Brioche, mushrooms, salad mix", "Brioche, houby, salátový mix"],
    ["Caesar salad", "Caesar salát"],
    ["Salad mix, chicken, parmesan", "Salátový mix, kuře, parmazán"],
    ["Gorgonzola, prawns, bisque", "Gorgonzola, krevety, bisque"],
    ["Beef ragout", "Hovězí ragú"],
    ["Parsley potatoes, lingonberries, salad", "Petrželové brambory, brusinky, salát"],
    ["Singapore chili chicken", "Singapurské chilli kuře"],
    ["Truffle risotto", "Lanýžové risotto"],
    ["Truffle, parmesan", "Lanýž, parmazán"],
    ["Vanilla cream, apple", "Vanilkový krém, jablko"],
    ["Mascarpone, coffee, vanilla ice cream", "Mascarpone, káva, vanilková zmrzlina"],
    ["Honey cake", "Medový dort"],
    ["Passion fruit, mango ice cream", "Mučenka, mangová zmrzlina"],
  ],
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

function applyLanguageSwitcher(input, locale) {
  return input
    .replace(/          <details class="language-menu">[\s\S]*?          <\/details>/, languageMenu(locale))
    .replace(/        <div class="mobile-language-list"[\s\S]*?        <\/div>/, mobileLanguageList);
}

function repairGeneratedScript(input) {
  return input
    .replace(/enableHeartBeat[^\"]*r/g, "enableHeartBeatTimer")
    .replace(/getElementsByTag[^(]+/g, "getElementsByTagName")
    .replace(/const mobile[^\s=]+ = document\.querySelector\("\.mobile-menu"\);/g, 'const mobileMenu = document.querySelector(".mobile-menu");')
    .replace(/menuToggle && mobile[^\s)]+/g, "menuToggle && mobileMenu")
    .replace(/mobile[^\s.]+\.querySelectorAll/g, "mobileMenu.querySelectorAll");
}

function updateSeoHeadLinks(input, locale) {
  return input.replace(seoHeadLinksPattern, `${seoHeadLinks(locale)}\n`);
}

for (const [locale, config] of Object.entries(locales)) {
  const dir = join(root, locale);
  await mkdir(dir, { recursive: true });

  let index = sourceIndex
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replace(
      'content="Modern bistro in Quedlinburg with breakfast, lunch and a small changing menu."',
      `content="${config.description}"`
    )
    .replace("../booking.js?v=20260525-en-1", `../booking.js?v=20260525-${locale}-1`);
  index = updateSeoHeadLinks(index, locale);
  index = applyLanguageSwitcher(index, locale);
  index = replaceAll(index, [...config.replacements, ...(menuUpdateReplacements[locale] || [])]);
  index = repairPdfMenuHref(index);
  index = repairGeneratedScript(index);
  await writeFile(join(dir, "index.html"), index, "utf8");

  let reservation = sourceReservation
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replaceAll("&locale=en", `&locale=${locale}`);
  reservation = translateOutsideScripts(reservation, config.reservation);
  reservation = reservation
    .replaceAll("new Erreur", "new Error")
    .replaceAll("new Fout", "new Error")
    .replaceAll("new Błąd", "new Error")
    .replaceAll("new Chyba", "new Error")
    .replaceAll("new Datum", "new Date")
    .replaceAll("new Data", "new Date")
    .replaceAll("getHeurezoneOffset", "getTimezoneOffset")
    .replaceAll("getTijdzoneOffset", "getTimezoneOffset")
    .replaceAll("getGodzinazoneOffset", "getTimezoneOffset")
    .replaceAll("getČaszoneOffset", "getTimezoneOffset")
    .replaceAll("getHeure()", "getTime()")
    .replaceAll("getTijd()", "getTime()")
    .replaceAll("getGodzina()", "getTime()")
    .replaceAll("getČas()", "getTime()");
  await writeFile(join(dir, "reservation.html"), reservation, "utf8");
  await copyFile(join(dir, "reservation.html"), join(dir, "reservierung.html"));
}

await import("./generate-guest-pages.mjs");
