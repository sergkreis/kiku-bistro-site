(function () {
  const form = document.getElementById("reservation-form");
  if (!form) return;

  const pageLocale = (document.documentElement.lang || "de").slice(0, 2).toLowerCase();
  const locale = ["de", "en", "fr", "nl", "pl", "cs"].includes(pageLocale) ? pageLocale : "de";
  const i18n = {
    de: {
      loading: "Zeiten werden geladen...",
      unavailable: "Nicht verfügbar",
      pastDate: "Reservierungen in der Vergangenheit sind nicht möglich.",
      pastTime: "Diese Uhrzeit liegt bereits in der Vergangenheit.",
      loadError: "Verfügbarkeit konnte nicht geladen werden.",
      closed: "An diesem Tag geschlossen.",
      restDay: "Montag und Dienstag sind Ruhetage.",
      noSlots: "Keine passende Zeit frei",
      noSlotsMessage: "Für diese Personenzahl ist an diesem Tag kein freier Slot verfügbar.",
      chooseTime: "Bitte eine Uhrzeit wählen.",
      checking: "Reservierung wird geprüft...",
      saveError: "Reservierung konnte nicht gespeichert werden.",
      request: "Anfrage",
      available: "Verfügbar",
      pendingSuccess: (reservation) =>
        `Anfrage eingegangen: ${reservation.date} um ${reservation.time} Uhr für ${reservation.guests} Personen. Wir bestätigen persönlich per E-Mail.`,
      confirmedSuccess: (reservation) =>
        `Reservierung bestätigt: ${reservation.date} um ${reservation.time} Uhr für ${reservation.guests} Personen. Eine E-Mail-Bestätigung wird versendet.`,
      eventCategory: "Reservierung",
    },
    en: {
      loading: "Loading available times...",
      unavailable: "Not available",
      pastDate: "Reservations in the past are not possible.",
      pastTime: "This time is already in the past.",
      loadError: "Availability could not be loaded.",
      closed: "Closed on this day.",
      restDay: "Monday and Tuesday are rest days.",
      noSlots: "No suitable time available",
      noSlotsMessage: "There is no available time for this party size on this day.",
      chooseTime: "Please choose a time.",
      checking: "Checking reservation...",
      saveError: "Reservation could not be saved.",
      request: "Request",
      available: "Available",
      pendingSuccess: (reservation) =>
        `Request received: ${reservation.date} at ${reservation.time} for ${reservation.guests} guests. We will confirm personally by e-mail.`,
      confirmedSuccess: (reservation) =>
        `Reservation confirmed: ${reservation.date} at ${reservation.time} for ${reservation.guests} guests. A confirmation e-mail will be sent.`,
      eventCategory: "Reservation",
    },
    fr: {
      loading: "Chargement des horaires disponibles...",
      unavailable: "Non disponible",
      pastDate: "Les réservations dans le passé ne sont pas possibles.",
      pastTime: "Cette heure est déjà passée.",
      loadError: "Les disponibilités n'ont pas pu être chargées.",
      closed: "Fermé ce jour-là.",
      restDay: "Le lundi et le mardi sont des jours de repos.",
      noSlots: "Aucun horaire adapté disponible",
      noSlotsMessage: "Aucun horaire n'est disponible ce jour-là pour ce nombre de personnes.",
      chooseTime: "Veuillez choisir une heure.",
      checking: "Vérification de la réservation...",
      saveError: "La réservation n'a pas pu être enregistrée.",
      request: "Demande",
      available: "Disponible",
      pendingSuccess: (reservation) =>
        `Demande reçue : ${reservation.date} à ${reservation.time} pour ${reservation.guests} personnes. Nous confirmerons personnellement par e-mail.`,
      confirmedSuccess: (reservation) =>
        `Réservation confirmée : ${reservation.date} à ${reservation.time} pour ${reservation.guests} personnes. Un e-mail de confirmation sera envoyé.`,
      eventCategory: "Réservation",
    },
    nl: {
      loading: "Beschikbare tijden worden geladen...",
      unavailable: "Niet beschikbaar",
      pastDate: "Reserveringen in het verleden zijn niet mogelijk.",
      pastTime: "Deze tijd is al voorbij.",
      loadError: "Beschikbaarheid kon niet worden geladen.",
      closed: "Op deze dag gesloten.",
      restDay: "Maandag en dinsdag zijn rustdagen.",
      noSlots: "Geen geschikte tijd beschikbaar",
      noSlotsMessage: "Voor dit aantal personen is er op deze dag geen beschikbare tijd.",
      chooseTime: "Kies een tijd.",
      checking: "Reservering wordt gecontroleerd...",
      saveError: "Reservering kon niet worden opgeslagen.",
      request: "Aanvraag",
      available: "Beschikbaar",
      pendingSuccess: (reservation) =>
        `Aanvraag ontvangen: ${reservation.date} om ${reservation.time} voor ${reservation.guests} personen. Wij bevestigen persoonlijk per e-mail.`,
      confirmedSuccess: (reservation) =>
        `Reservering bevestigd: ${reservation.date} om ${reservation.time} voor ${reservation.guests} personen. Er wordt een bevestiging per e-mail verzonden.`,
      eventCategory: "Reservering",
    },
    pl: {
      loading: "Ładowanie dostępnych godzin...",
      unavailable: "Niedostępne",
      pastDate: "Rezerwacje w przeszłości nie są możliwe.",
      pastTime: "Ta godzina już minęła.",
      loadError: "Nie udało się wczytać dostępności.",
      closed: "Tego dnia lokal jest zamknięty.",
      restDay: "Poniedziałek i wtorek są dniami wolnymi.",
      noSlots: "Brak odpowiedniej godziny",
      noSlotsMessage: "Dla tej liczby osób tego dnia nie ma dostępnej godziny.",
      chooseTime: "Wybierz godzinę.",
      checking: "Sprawdzanie rezerwacji...",
      saveError: "Nie udało się zapisać rezerwacji.",
      request: "Zapytanie",
      available: "Dostępne",
      pendingSuccess: (reservation) =>
        `Zapytanie przyjęte: ${reservation.date} o ${reservation.time} dla ${reservation.guests} osób. Potwierdzimy osobiście e-mailem.`,
      confirmedSuccess: (reservation) =>
        `Rezerwacja potwierdzona: ${reservation.date} o ${reservation.time} dla ${reservation.guests} osób. Potwierdzenie zostanie wysłane e-mailem.`,
      eventCategory: "Rezerwacja",
    },
    cs: {
      loading: "Načítají se dostupné časy...",
      unavailable: "Není k dispozici",
      pastDate: "Rezervace v minulosti nejsou možné.",
      pastTime: "Tento čas již uplynul.",
      loadError: "Dostupnost se nepodařilo načíst.",
      closed: "V tento den je zavřeno.",
      restDay: "Pondělí a úterý jsou zavírací dny.",
      noSlots: "Není k dispozici vhodný čas",
      noSlotsMessage: "Pro tento počet osob není v tento den dostupný žádný čas.",
      chooseTime: "Vyberte prosím čas.",
      checking: "Kontrola rezervace...",
      saveError: "Rezervaci se nepodařilo uložit.",
      request: "Poptávka",
      available: "Dostupné",
      pendingSuccess: (reservation) =>
        `Poptávka přijata: ${reservation.date} v ${reservation.time} pro ${reservation.guests} osob. Potvrdíme ji osobně e-mailem.`,
      confirmedSuccess: (reservation) =>
        `Rezervace potvrzena: ${reservation.date} v ${reservation.time} pro ${reservation.guests} osob. Potvrzení bude odesláno e-mailem.`,
      eventCategory: "Rezervace",
    },
  }[locale];

  const dateInput = form.elements.date;
  const guestsInput = form.elements.guests;
  const timeInput = form.elements.time;
  const timeGrid = document.getElementById("reservation-time-grid");
  const message = document.getElementById("reservation-message");

  const toLocalDate = (date) => {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
  };

  const today = new Date();
  dateInput.min = toLocalDate(today);
  dateInput.value = toLocalDate(today);

  const isPastDate = (value) => value && value < toLocalDate(new Date());
  const isFutureSlot = (dateValue, timeValue) => new Date(`${dateValue}T${timeValue}:00`) > new Date();

  const setMessage = (text, type) => {
    message.textContent = text;
    message.dataset.type = type || "";
  };

  const clearSelectedTime = () => {
    timeInput.value = "";
    timeGrid.querySelectorAll(".time-tile").forEach((tile) => {
      tile.classList.remove("selected");
      tile.setAttribute("aria-checked", "false");
    });
  };

  const slotLabel = (slot) => (slot.requiresConfirmation ? i18n.request : i18n.available);

  const loadAvailability = async () => {
    const selectedDate = dateInput.value;
    const guests = Number(guestsInput.value || 1);
    timeGrid.innerHTML = `<p class="time-grid-empty">${i18n.loading}</p>`;
    timeInput.value = "";
    setMessage("", "");

    if (!selectedDate) return;
    if (isPastDate(selectedDate)) {
      timeGrid.innerHTML = `<p class="time-grid-empty">${i18n.unavailable}</p>`;
      setMessage(i18n.pastDate, "error");
      return;
    }

    try {
      const response = await fetch(
        `/api/availability?date=${encodeURIComponent(selectedDate)}&guests=${encodeURIComponent(guests)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error((data.errors || [i18n.loadError]).join(" "));
      }

      if (!data.open) {
        timeGrid.innerHTML = `<p class="time-grid-empty">${data.closed ? i18n.closed : i18n.restDay}</p>`;
        setMessage(data.closed ? `${i18n.closed} ${data.closedReason || ""}` : i18n.restDay, "error");
        return;
      }

      const availableSlots = data.slots.filter((slot) => slot.available && isFutureSlot(selectedDate, slot.time));
      if (!availableSlots.length) {
        timeGrid.innerHTML = `<p class="time-grid-empty">${i18n.noSlots}</p>`;
        setMessage(i18n.noSlotsMessage, "error");
        return;
      }

      timeGrid.innerHTML = "";
      availableSlots.forEach((slot) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = slot.requiresConfirmation ? "time-tile time-tile-request" : "time-tile";
        button.setAttribute("role", "radio");
        button.setAttribute("aria-checked", "false");
        button.dataset.time = slot.time;
        button.innerHTML = `
          <span class="time-tile-hour">${slot.time}</span>
          <span class="time-tile-note">${slotLabel(slot)}</span>
        `;
        button.addEventListener("click", () => {
          clearSelectedTime();
          timeInput.value = slot.time;
          button.classList.add("selected");
          button.setAttribute("aria-checked", "true");
        });
        timeGrid.append(button);
      });
    } catch (error) {
      timeGrid.innerHTML = `<p class="time-grid-empty">${i18n.unavailable}</p>`;
      setMessage(error.message, "error");
    }
  };

  dateInput.addEventListener("change", loadAvailability);
  guestsInput.addEventListener("change", loadAvailability);
  guestsInput.addEventListener("input", loadAvailability);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isPastDate(dateInput.value)) {
      setMessage(i18n.pastDate, "error");
      return;
    }
    if (timeInput.value && !isFutureSlot(dateInput.value, timeInput.value)) {
      setMessage(i18n.pastTime, "error");
      clearSelectedTime();
      await loadAvailability();
      return;
    }
    if (!timeInput.value) {
      setMessage(i18n.chooseTime, "error");
      timeGrid.focus();
      return;
    }
    if (!form.reportValidity()) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setMessage(i18n.checking, "");

    const payload = {
      locale,
      date: form.elements.date.value,
      time: form.elements.time.value,
      guests: Number(form.elements.guests.value),
      name: form.elements.name.value,
      phone: form.elements.phone.value,
      email: form.elements.email.value,
      note: form.elements.note.value,
    };

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error((data.errors || [i18n.saveError]).join(" "));
      }

      form.reset();
      dateInput.value = payload.date;
      guestsInput.value = "2";
      await loadAvailability();

      const isPending = data.reservation.status === "pending";
      setMessage(isPending ? i18n.pendingSuccess(data.reservation) : i18n.confirmedSuccess(data.reservation), "success");

      if (window._paq) {
        window._paq.push(["trackEvent", i18n.eventCategory, isPending ? "Pending" : "Confirmed", data.reservation.date]);
      }
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  loadAvailability();
})();
