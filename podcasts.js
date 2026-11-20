// KM Records Podcasts Engine (KM Podcasts)
(function () {
  "use strict";

  let podcastData = null;
  let currentEpisode = null;
  let currentFilter = "all";
  let playbackRate = 1;

  // Dedicated Podcast Audio Object
  const podcastAudio = new Audio();
  podcastAudio.preload = "metadata";

  // DOM Elements
  const heroPlayBtn = document.getElementById("pod-hero-play");
  const heroCover = document.getElementById("pod-hero-cover");
  const heroShowTag = document.getElementById("pod-hero-show");
  const heroEpNum = document.getElementById("pod-hero-num");
  const heroTitle = document.getElementById("pod-hero-title");
  const heroSummary = document.getElementById("pod-hero-summary");
  const heroCurTime = document.getElementById("pod-hero-curtime");
  const heroDurTime = document.getElementById("pod-hero-durtime");
  const heroProgress = document.getElementById("pod-hero-progress");
  const heroProgressBar = document.getElementById("pod-hero-bar");
  const heroSkipBack = document.getElementById("pod-hero-back");
  const heroSkipFwd = document.getElementById("pod-hero-fwd");
  const heroSpeedBtn = document.getElementById("pod-hero-speed");
  const heroNotesBtn = document.getElementById("pod-hero-notes-btn");

  const episodesGrid = document.getElementById("pod-episodes-grid");
  const filterButtons = document.querySelectorAll(".pod-filter-btn");

  // Show Notes Modal Elements
  const notesModal = document.getElementById("podcast-notes-modal");
  const notesCloseBtn = document.getElementById("pod-notes-close");
  const notesEpTitle = document.getElementById("pod-notes-title");
  const notesShowTitle = document.getElementById("pod-notes-show");
  const notesMeta = document.getElementById("pod-notes-meta");
  const notesSummary = document.getElementById("pod-notes-summary");
  const notesTimestamps = document.getElementById("pod-notes-timestamps");
  const notesPlayBtn = document.getElementById("pod-notes-play");

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  // Interlock helper: silence 24/7 radio and KM TV
  function interlockSilenceOthers() {
    // 1. Radio
    const radioAudio = document.querySelector("#audio");
    if (radioAudio && !radioAudio.paused) {
      try { radioAudio.pause(); } catch (_) {}
    }
    const radioBar = document.querySelector(".now");
    if (radioBar) radioBar.classList.remove("playing");

    // 2. TV
    const tvVideo = document.querySelector("#tv-video");
    if (tvVideo && !tvVideo.paused) {
      try { tvVideo.pause(); } catch (_) {}
    }
  }

  async function initPodcasts() {
    try {
      const res = await fetch("podcasts/podcasts_data.json");
      if (!res.ok) return;
      podcastData = await res.json();
      if (!podcastData || !podcastData.episodes || podcastData.episodes.length === 0) return;

      // Set initial featured episode (first episode marked featured or index 0)
      const featured = podcastData.episodes.find(e => e.featured) || podcastData.episodes[0];
      setHeroEpisode(featured);

      renderEpisodes("all");
      setupFilterEvents();
      setupAudioEvents();
      setupModalEvents();
    } catch (e) {
      console.error("Failed to load podcast data", e);
    }
  }

  function setHeroEpisode(ep) {
    currentEpisode = ep;
    if (heroCover) heroCover.src = ep.cover;
    if (heroShowTag) heroShowTag.textContent = ep.showTitle;
    if (heroEpNum) heroEpNum.textContent = `${ep.episodeNumber} · ${ep.date} · ${ep.duration}`;
    if (heroTitle) heroTitle.textContent = ep.title;
    if (heroSummary) heroSummary.textContent = ep.summary;
    if (heroDurTime) heroDurTime.textContent = ep.duration;
    if (heroCurTime) heroCurTime.textContent = "0:00";
    if (heroProgressBar) heroProgressBar.style.width = "0%";

    podcastAudio.src = ep.audio;
    podcastAudio.playbackRate = playbackRate;
    updateHeroPlayButton(false);
    highlightActiveEpisodeCard(ep.id);
  }

  function renderEpisodes(filter) {
    if (!episodesGrid || !podcastData) return;
    episodesGrid.innerHTML = "";
    currentFilter = filter;

    const eps = podcastData.episodes.filter(ep => {
      if (filter === "all") return true;
      return ep.showId === filter;
    });

    eps.forEach(ep => {
      const card = document.createElement("article");
      card.className = "podcast-card" + (currentEpisode && currentEpisode.id === ep.id ? " active-playing" : "");
      card.dataset.id = ep.id;

      card.innerHTML = `
        <div class="podcast-card-cover-wrap">
          <img src="${ep.cover}" alt="${ep.showTitle}" class="podcast-card-cover" loading="lazy">
          <button type="button" class="pod-card-play-btn" data-id="${ep.id}" aria-label="Play ${ep.title}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="podcast-card-body">
          <div class="pod-card-tag-row">
            <span class="pod-card-show">${ep.showTitle}</span>
            <span class="pod-card-num">${ep.episodeNumber}</span>
          </div>
          <h3 class="pod-card-title">${ep.title}</h3>
          <div class="pod-card-meta">
            <span>📅 ${ep.date}</span>
            <span>⏱️ ${ep.duration}</span>
          </div>
          <p class="pod-card-desc">${ep.summary}</p>
          <div class="pod-card-actions">
            <button type="button" class="pill solid pod-card-action-play" data-id="${ep.id}">Play Episode</button>
            <button type="button" class="pill ghost pod-card-action-notes" data-id="${ep.id}">Show Notes</button>
          </div>
        </div>
      `;

      // Event listeners for play
      const playBtns = card.querySelectorAll(".pod-card-play-btn, .pod-card-action-play");
      playBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          if (currentEpisode && currentEpisode.id === ep.id && !podcastAudio.paused) {
            podcastAudio.pause();
            updateHeroPlayButton(false);
          } else {
            setHeroEpisode(ep);
            playCurrentEpisode();
          }
        });
      });

      // Show notes listener
      const notesBtn = card.querySelector(".pod-card-action-notes");
      if (notesBtn) {
        notesBtn.addEventListener("click", () => openShowNotes(ep));
      }

      episodesGrid.appendChild(card);
    });
  }

  function playCurrentEpisode() {
    interlockSilenceOthers();
    podcastAudio.play().then(() => {
      updateHeroPlayButton(true);
      highlightActiveEpisodeCard(currentEpisode.id);
      syncWithSiteNowPlaying();
    }).catch(err => {
      console.warn("Podcast audio play prevented:", err);
    });
  }

  function togglePlay() {
    if (!currentEpisode) return;
    if (podcastAudio.paused) {
      playCurrentEpisode();
    } else {
      podcastAudio.pause();
      updateHeroPlayButton(false);
    }
  }

  function updateHeroPlayButton(isPlaying) {
    if (!heroPlayBtn) return;
    if (isPlaying) {
      heroPlayBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
      heroPlayBtn.setAttribute("aria-label", "Pause Episode");
    } else {
      heroPlayBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      heroPlayBtn.setAttribute("aria-label", "Play Episode");
    }
  }

  function highlightActiveEpisodeCard(epId) {
    document.querySelectorAll(".podcast-card").forEach(c => {
      if (c.dataset.id === epId) {
        c.classList.add("active-playing");
      } else {
        c.classList.remove("active-playing");
      }
    });
  }

  function syncWithSiteNowPlaying() {
    // Optionally update site bottom bar
    const bar = document.querySelector(".now");
    const barTitle = document.querySelector("#now-title");
    const barDesk = document.querySelector("#now-desk");
    if (bar && barTitle && barDesk && currentEpisode) {
      barTitle.textContent = currentEpisode.title;
      barDesk.textContent = `Podcast: ${currentEpisode.showTitle} (${currentEpisode.episodeNumber})`;
      bar.removeAttribute("hidden");
      bar.classList.add("playing");
    }
  }

  function setupFilterEvents() {
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderEpisodes(btn.dataset.filter);
      });
    });
  }

  function setupAudioEvents() {
    if (heroPlayBtn) {
      heroPlayBtn.addEventListener("click", togglePlay);
    }

    if (heroNotesBtn) {
      heroNotesBtn.addEventListener("click", () => {
        if (currentEpisode) openShowNotes(currentEpisode);
      });
    }

    // Skip -15s / +15s
    if (heroSkipBack) {
      heroSkipBack.addEventListener("click", () => {
        podcastAudio.currentTime = Math.max(0, podcastAudio.currentTime - 15);
      });
    }
    if (heroSkipFwd) {
      heroSkipFwd.addEventListener("click", () => {
        podcastAudio.currentTime = Math.min(podcastAudio.duration || 9999, podcastAudio.currentTime + 15);
      });
    }

    // Playback Speed Toggle (1x -> 1.25x -> 1.5x -> 2x)
    if (heroSpeedBtn) {
      const speeds = [1, 1.25, 1.5, 2];
      heroSpeedBtn.addEventListener("click", () => {
        const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
        playbackRate = speeds[nextIdx];
        podcastAudio.playbackRate = playbackRate;
        heroSpeedBtn.textContent = `${playbackRate}×`;
      });
    }

    // Time update & Progress Bar
    podcastAudio.addEventListener("timeupdate", () => {
      const cur = podcastAudio.currentTime;
      const dur = podcastAudio.duration || (currentEpisode ? currentEpisode.durationSec : 1800);
      if (heroCurTime) heroCurTime.textContent = formatTime(cur);
      if (heroProgressBar) heroProgressBar.style.width = `${(cur / dur) * 100}%`;
    });

    // Scrubber click
    if (heroProgress) {
      heroProgress.addEventListener("click", (e) => {
        const rect = heroProgress.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        const dur = podcastAudio.duration || (currentEpisode ? currentEpisode.durationSec : 1800);
        podcastAudio.currentTime = pct * dur;
      });
    }

    // Audio Ended: auto advance
    podcastAudio.addEventListener("ended", () => {
      updateHeroPlayButton(false);
      if (!podcastData) return;
      const curIdx = podcastData.episodes.findIndex(e => e.id === currentEpisode.id);
      if (curIdx >= 0 && curIdx < podcastData.episodes.length - 1) {
        setHeroEpisode(podcastData.episodes[curIdx + 1]);
        playCurrentEpisode();
      }
    });

    podcastAudio.addEventListener("play", () => updateHeroPlayButton(true));
    podcastAudio.addEventListener("pause", () => updateHeroPlayButton(false));
  }

  // Show Notes Modal
  function openShowNotes(ep) {
    if (!notesModal) return;
    if (notesEpTitle) notesEpTitle.textContent = ep.title;
    if (notesShowTitle) notesShowTitle.textContent = `${ep.showTitle} · ${ep.episodeNumber}`;
    if (notesMeta) notesMeta.textContent = `Published on ${ep.date} · Duration: ${ep.duration}`;
    if (notesSummary) notesSummary.textContent = ep.summary;

    if (notesTimestamps) {
      notesTimestamps.innerHTML = "";
      if (ep.notes && ep.notes.length > 0) {
        ep.notes.forEach(note => {
          const li = document.createElement("li");
          li.className = "pod-timestamp-item";
          li.textContent = note;
          notesTimestamps.appendChild(li);
        });
      }
    }

    if (notesPlayBtn) {
      notesPlayBtn.onclick = () => {
        closeShowNotes();
        setHeroEpisode(ep);
        playCurrentEpisode();
      };
    }

    notesModal.removeAttribute("hidden");
    notesModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeShowNotes() {
    if (!notesModal) return;
    notesModal.classList.remove("active");
    notesModal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  function setupModalEvents() {
    if (notesCloseBtn) notesCloseBtn.addEventListener("click", closeShowNotes);
    if (notesModal) {
      notesModal.addEventListener("click", (e) => {
        if (e.target === notesModal) closeShowNotes();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && notesModal && !notesModal.hasAttribute("hidden")) {
        closeShowNotes();
      }
    });
  }

  // Global listener for site radio/tv interlocking: if radio plays, pause podcast
  const siteAudio = document.querySelector("#audio");
  if (siteAudio) {
    siteAudio.addEventListener("play", () => {
      if (!podcastAudio.paused) {
        podcastAudio.pause();
        updateHeroPlayButton(false);
      }
    });
  }

  // DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPodcasts);
  } else {
    initPodcasts();
  }
})();
