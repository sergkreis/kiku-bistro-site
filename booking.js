(function () {
  const form = document.getElementById("reservation-form");
  if (!form) return;

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

  const slotLabel = (slot, guests) => {
    if (slot.requiresConfirmation) {
      return "Anfrage";
    }
    if (guests >= 3) {
      return "4er-Tisch";
    }
    return "frei";
  };

  const loadAvailability = async () => {
    const selectedDate = dateInput.value;
    const guests = Number(guestsInput.value || 1);
    timeGrid.innerHTML = '<p class="time-grid-empty">Zeiten werden geladen...</p>';
    timeInput.value = "";
    setMessage("", "");

    if (!selectedDate) return;

    try {
      const response = await fetch(
        `/api/availability?date=${encodeURIComponent(selectedDate)}&guests=${encodeURIComponent(guests)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error((data.errors || ["Verfuegbarkeit konnte nicht geladen werden."]).join(" "));
      }

      if (!data.open) {
        timeGrid.innerHTML = '<p class="time-grid-empty">Ruhetag</p>';
        setMessage("Montag und Dienstag sind Ruhetage.", "error");
        return;
      }

      const availableSlots = data.slots.filter((slot) => slot.available);
      if (!availableSlots.length) {
        timeGrid.innerHTML = '<p class="time-grid-empty">Keine passende Zeit frei</p>';
        setMessage("Fuer diese Personenzahl ist an diesem Tag kein freier Slot verfuegbar.", "error");
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
          <span class="time-tile-note">${slotLabel(slot, guests)}</span>
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
      timeGrid.innerHTML = '<p class="time-grid-empty">Nicht verfuegbar</p>';
      setMessage(error.message, "error");
    }
  };

  dateInput.addEventListener("change", loadAvailability);
  guestsInput.addEventListener("change", loadAvailability);
  guestsInput.addEventListener("input", loadAvailability);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!timeInput.value) {
      setMessage("Bitte eine Uhrzeit waehlen.", "error");
      timeGrid.focus();
      return;
    }
    if (!form.reportValidity()) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setMessage("Reservierung wird geprueft...", "");

    const payload = {
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
        throw new Error((data.errors || ["Reservierung konnte nicht gespeichert werden."]).join(" "));
      }

      form.reset();
      dateInput.value = payload.date;
      guestsInput.value = "2";
      await loadAvailability();

      const isPending = data.reservation.status === "pending";
      setMessage(
        isPending
          ? `Anfrage eingegangen: ${data.reservation.date} um ${data.reservation.time} Uhr fuer ${data.reservation.guests} Personen. Wir bestaetigen persoenlich per E-Mail.`
          : `Reservierung bestaetigt: ${data.reservation.date} um ${data.reservation.time} Uhr fuer ${data.reservation.guests} Personen. Eine E-Mail-Bestaetigung wird versendet.`,
        "success"
      );

      if (window._paq) {
        window._paq.push(["trackEvent", "Reservierung", isPending ? "Pending" : "Confirmed", data.reservation.date]);
      }
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  loadAvailability();
})();
