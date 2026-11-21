// KM Radio Station Transmission & Activity Log
(function() {
  const modal = document.querySelector("#radio-log-modal");
  const openBtn = document.querySelector("#radio-log-btn");
  const closeBtn = document.querySelector("#radio-log-close");
  const tbody = document.querySelector("#radio-log-tbody");
  const filterBtns = document.querySelectorAll(".radio-log-filter-btn");
  const clockBadge = document.querySelector("#radio-log-clock-badge");
  const summaryBadge = document.querySelector("#radio-log-status-summary");
  const refreshBtn = document.querySelector("#radio-log-refresh-btn");

  let currentFilter = "all";
  let pollTimer = null;

  function formatBadge(type) {
    if (type === "SONG_START") {
      return `<span class="log-tag tag-song-start">Song Start</span>`;
    }
    if (type === "SONG_FINISH") {
      return `<span class="log-tag tag-song-finish">Song Finish</span>`;
    }
    if (type === "DJ_START") {
      return `<span class="log-tag tag-dj-start">DJ Start</span>`;
    }
    if (type === "DJ_FINISH") {
      return `<span class="log-tag tag-dj-finish">DJ Finish</span>`;
    }
    if (type === "IDENT_START") {
      return `<span class="log-tag tag-ident-start">Ident Start</span>`;
    }
    if (type === "IDENT_FINISH") {
      return `<span class="log-tag tag-ident-finish">Ident Finish</span>`;
    }
    return `<span class="log-tag">${type}</span>`;
  }

  function formatStatus(status) {
    if (status === "ON AIR") {
      return `<span class="status-pill on-air"><span class="pulse-dot"></span>ON AIR</span>`;
    }
    if (status === "COMPLETED") {
      return `<span class="status-pill completed">COMPLETED</span>`;
    }
    return `<span class="status-pill upcoming">UPCOMING</span>`;
  }

  async function loadLog() {
    if (!modal || modal.hidden) return;
    try {
      const res = await fetch(`/radio/log?filter=${currentFilter}&limit=80&_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      if (clockBadge && data.currentClock) {
        clockBadge.textContent = `UK Time: ${data.currentClock}`;
      }
      if (summaryBadge && data.currentShow) {
        summaryBadge.textContent = `Current Show: ${data.currentShow.title} (${data.currentShow.presenter}) · ${data.totalEvents} Logged Events`;
      }

      if (!tbody) return;
      if (!data.events || data.events.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #888;">No transmission events found for this filter.</td></tr>`;
        return;
      }

      // Render chronological event rows
      const rows = data.events.map(evt => {
        const isCurrent = evt.status === "ON AIR";
        const rowClass = isCurrent ? "log-row-current" : "";
        return `
          <tr class="${rowClass}">
            <td class="log-time">${evt.time}</td>
            <td class="log-event-cell">${formatBadge(evt.type)}</td>
            <td class="log-title-cell"><strong>${evt.title}</strong></td>
            <td class="log-artist-cell">${evt.artist || "—"}</td>
            <td class="log-dur-cell">${evt.duration || "—"}</td>
            <td class="log-status-cell">${formatStatus(evt.status)}</td>
          </tr>
        `;
      }).join("");

      tbody.innerHTML = rows;
    } catch (_) {}
  }

  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    modal.classList.add("active");
    loadLog();
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(loadLog, 1500);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.hidden = true;
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  openBtn?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  refreshBtn?.addEventListener("click", loadLog);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) {
      closeModal();
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter || "all";
      loadLog();
    });
  });
})();
