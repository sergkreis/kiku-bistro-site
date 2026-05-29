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
    <link rel="alternate" hreflang="x-default" href="https://kiku-bistro.de/" />`;

const languageLinks = `          <a href="../" lang="de">DE</a>
          <a href="../en/" lang="en">EN</a>
          <a href="../fr/" lang="fr">FR</a>
          <a href="../nl/" lang="nl">NL</a>
          <a href="../pl/" lang="pl">PL</a>
          <a href="../cs/" lang="cs">CS</a>`;

const mobileLanguageLinks = `        <a href="../" lang="de">Deutsch</a>
        <a href="../en/" lang="en">English</a>
        <a href="../fr/" lang="fr">Français</a>
        <a href="../nl/" lang="nl">Nederlands</a>
        <a href="../pl/" lang="pl">Polski</a>
        <a href="../cs/" lang="cs">Čeština</a>`;

const languageMenu = (current) => `          <details class="language-menu">
            <summary>${current.toUpperCase()}</summary>
            <div class="language-options">
              <a href="../" lang="de">DE</a>
              <a href="../en/" lang="en">EN</a>
              <a href="../fr/" lang="fr">FR</a>
              <a href="../nl/" lang="nl">NL</a>
              <a href="../pl/" lang="pl">PL</a>
              <a href="../cs/" lang="cs">CS</a>
            </div>
          </details>`;

const mobileLanguageList = `        <div class="mobile-language-list" aria-label="Language">
          <a href="../" lang="de">DE</a>
          <a href="../en/" lang="en">EN</a>
          <a href="../fr/" lang="fr">FR</a>
          <a href="../nl/" lang="nl">NL</a>
          <a href="../pl/" lang="pl">PL</a>
          <a href="../cs/" lang="cs">CS</a>
        </div>`;

const locales = {
  fr: {
    description: "Bistro moderne à Quedlinburg avec petit-déjeuner, déjeuner et une petite carte qui change régulièrement.",
    replacements: [
      ["Very French. Very relaxed. Very alive.", "Très français. Très détendu. Très vivant."],
      ["We are open Wednesday from 9:30 to 17:00 and Thursday to Sunday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes.", "Nous sommes ouverts le mercredi de 9h30 &agrave; 17h00 et du jeudi au dimanche\n                de 9h30 &agrave; 21h00, avec des plats modernes et frais pour le petit-d&eacute;jeuner et le d&eacute;jeuner."],
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
      ["We are open Wednesday from 9:30 to 17:00 and Thursday to Sunday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes.", "Wij zijn geopend op woensdag van 9:30 tot 17:00 en van donderdag tot en met zondag\n                van 9:30 tot 21:00, met moderne, verse ontbijt- en lunchgerechten."],
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
      ["We are open Wednesday from 9:30 to 17:00 and Thursday to Sunday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes.", "Jeste&#347;my otwarci w &#347;rod&#281; od 9:30 do 17:00 oraz od czwartku do niedzieli\n                od 9:30 do 21:00. Serwujemy nowoczesne, &#347;wie&#380;e dania &#347;niadaniowe i lunchowe."],
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
      ["We are open Wednesday from 9:30 to 17:00 and Thursday to Sunday\n                from 9:30 to 21:00, serving modern, fresh breakfast and lunch dishes.", "M&aacute;me otev&#345;eno ve st&#345;edu od 9:30 do 17:00 a od &#269;tvrtka do ned&#283;le\n                od 9:30 do 21:00. Pod&aacute;v&aacute;me modern&iacute;, &#269;erstv&aacute; sn&iacute;da&#328;ov&aacute; a poledn&iacute; j&iacute;dla."],
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

const commonIndexReplacements = [
  [
    `    <link rel="alternate" hreflang="de" href="https://kiku-bistro.de/" />
    <link rel="alternate" hreflang="en" href="https://kiku-bistro.de/en/" />`,
    alternates,
  ],
];

function replaceAll(input, replacements) {
  let output = input;
  for (const [from, to] of [...replacements].sort((a, b) => b[0].length - a[0].length)) {
    output = output.split(from).join(to);
  }
  return output;
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
    .replace(/mobile[^\s.]+\.querySelectorAll/g, "mobileMenu.querySelectorAll");
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
  index = replaceAll(index, commonIndexReplacements);
  index = applyLanguageSwitcher(index, locale);
  index = replaceAll(index, config.replacements);
  index = repairGeneratedScript(index);
  await writeFile(join(dir, "index.html"), index, "utf8");

  let reservation = sourceReservation
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replaceAll("&locale=en", `&locale=${locale}`);
  reservation = replaceAll(reservation, config.reservation);
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
