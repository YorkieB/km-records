// KM Records TV Channel Engine (KM TV)
(function () {
  "use strict";

  let lineup = [];
  let currentIndex = 0;
  let isLiveBroadcastMode = true;

  // DOM Elements
  const tvVideo = document.getElementById("tv-video");
  const tvPlayBtn = document.getElementById("tv-play-btn");
  const tvMuteBtn = document.getElementById("tv-mute-btn");
  const tvPipBtn = document.getElementById("tv-pip-btn");
  const tvFullscreenBtn = document.getElementById("tv-fullscreen-btn");
  const tvUnmuteBanner = document.getElementById("tv-unmute-banner");
  
  // Overlay Chyron Elements
  const tvChyronArtist = document.getElementById("tv-chyron-artist");
  const tvChyronTitle = document.getElementById("tv-chyron-title");
  const tvChyronTag = document.getElementById("tv-chyron-tag");
  const tvUpNextTitle = document.getElementById("tv-upnext-title");
  const tvTimeCurrent = document.getElementById("tv-time-current");
  const tvTimeDuration = document.getElementById("tv-time-duration");
  const tvProgressBar = document.getElementById("tv-progress-bar");
  
  // Guide Elements
  const tvGuideList = document.getElementById("tv-guide-list");
  const tvFilterButtons = document.querySelectorAll(".tv-filter-btn");

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  // Load TV Lineup
  async function loadLineup() {
    try {
      const res = await fetch("tv_lineup.json");
      if (!res.ok) return;
      lineup = await res.json();
      if (!lineup || lineup.length === 0) return;

      renderGuide("all");
      initLiveBroadcast();
    } catch (e) {
      console.error("Failed to load TV lineup", e);
    }
  }

  // Calculate synchronized broadcast based on current wall-clock seconds
  function initLiveBroadcast() {
    const totalDuration = lineup.reduce((acc, item) => acc + (item.duration || 200), 0);
    const nowSec = Math.floor(Date.now() / 1000);
    let offsetInLoop = nowSec % totalDuration;

    let accumulated = 0;
    let selectedIdx = 0;
    let videoStartTime = 0;

    for (let i = 0; i < lineup.length; i++) {
      const dur = lineup[i].duration || 200;
      if (accumulated + dur > offsetInLoop) {
        selectedIdx = i;
        videoStartTime = offsetInLoop - accumulated;
        break;
      }
      accumulated += dur;
    }

    currentIndex = selectedIdx;
    playVideo(currentIndex, videoStartTime);
  }

  // Play Video at Index
  function playVideo(index, startSeconds = 0) {
    if (!lineup[index]) return;
    currentIndex = index;
    const item = lineup[index];

    tvVideo.src = item.src;
    tvVideo.poster = item.poster;

    updateChyron(item);
    highlightGuideCard(index);

    tvVideo.addEventListener("loadedmetadata", function onMeta() {
      if (startSeconds > 0 && startSeconds < tvVideo.duration) {
        tvVideo.currentTime = startSeconds;
      }
      tvVideo.play().catch(() => {
        // Autoplay policy prevented unmuted autoplay
        tvVideo.muted = true;
        updateMuteState();
        tvVideo.play().catch(() => {});
      });
      tvVideo.removeEventListener("loadedmetadata", onMeta);
    });

    tvVideo.play().catch(() => {
      tvVideo.muted = true;
      updateMuteState();
      tvVideo.play().catch(() => {});
    });
  }

  function updateChyron(item) {
    if (tvChyronArtist) tvChyronArtist.textContent = item.artist;
    if (tvChyronTitle) tvChyronTitle.textContent = item.title;
    if (tvChyronTag) {
      tvChyronTag.textContent = item.tag;
      tvChyronTag.className = "chyron-tag " + (item.artist === "Kayleigh Merez" ? "tag-kayleigh" : "tag-leah");
    }

    // Up next preview
    const nextIdx = (currentIndex + 1) % lineup.length;
    const nextItem = lineup[nextIdx];
    if (tvUpNextTitle && nextItem) {
      tvUpNextTitle.textContent = `Up Next: ${nextItem.title} (${nextItem.artist})`;
    }
  }

  function highlightGuideCard(index) {
    document.querySelectorAll(".tv-guide-card").forEach((card, idx) => {
      const cardIdx = parseInt(card.dataset.index, 10);
      if (cardIdx === index) {
        card.classList.add("playing");
      } else {
        card.classList.remove("playing");
      }
    });
  }

  // Render TV Guide List
  function renderGuide(filter) {
    if (!tvGuideList) return;
    tvGuideList.innerHTML = "";

    const f = (filter || "").toLowerCase();
    lineup.forEach((item, idx) => {
      if (f.includes("kayleigh") && item.artist !== "Kayleigh Merez") return;
      if (f.includes("leah") && item.artist !== "Leah Carter") return;

      const card = document.createElement("div");
      card.className = "tv-guide-card" + (idx === currentIndex ? " playing" : "");
      card.dataset.index = idx;

      card.innerHTML = `
        <div class="guide-thumb-wrap">
          <img src="${item.poster}" alt="${item.title}" class="guide-thumb" loading="lazy">
          <span class="guide-badge ${item.artist === 'Kayleigh Merez' ? 'tag-kayleigh' : 'tag-leah'}">${item.tag}</span>
          <span class="guide-dur">${formatTime(item.duration)}</span>
        </div>
        <div class="guide-meta">
          <h4 class="guide-title">${item.title}</h4>
          <p class="guide-artist">${item.artist}</p>
          <p class="guide-desc">${item.desc}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        isLiveBroadcastMode = false;
        pauseRadioIfPlaying();
        playVideo(idx, 0);
        tvVideo.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      tvGuideList.appendChild(card);
    });
  }

  // Filters
  tvFilterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tvFilterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderGuide(btn.dataset.filter);
    });
  });

  // Video Time Update & Chyron progress
  if (tvVideo) {
    tvVideo.addEventListener("timeupdate", () => {
      const cur = tvVideo.currentTime;
      const dur = tvVideo.duration || 1;
      if (tvTimeCurrent) tvTimeCurrent.textContent = formatTime(cur);
      if (tvTimeDuration) tvTimeDuration.textContent = formatTime(dur);
      if (tvProgressBar) tvProgressBar.style.width = ((cur / dur) * 100) + "%";
    });

    // On video end: Auto advance to next in rotation
    tvVideo.addEventListener("ended", () => {
      currentIndex = (currentIndex + 1) % lineup.length;
      playVideo(currentIndex, 0);
    });

    // Interlock: pause radio when TV plays unmuted
    tvVideo.addEventListener("play", () => {
      if (!tvVideo.muted) {
        pauseRadioIfPlaying();
      }
      if (tvPlayBtn) tvPlayBtn.textContent = "Pause";
    });

    tvVideo.addEventListener("pause", () => {
      if (tvPlayBtn) tvPlayBtn.textContent = "Play";
    });
  }

  function pauseRadioIfPlaying() {
    const radioAudio = document.getElementById("audio");
    const nowToggle = document.getElementById("now-toggle");
    if (radioAudio && !radioAudio.paused) {
      radioAudio.pause();
      if (nowToggle) nowToggle.textContent = "Play";
    }
  }

  // Controls
  if (tvPlayBtn) {
    tvPlayBtn.addEventListener("click", () => {
      if (tvVideo.paused) {
        pauseRadioIfPlaying();
        tvVideo.play();
      } else {
        tvVideo.pause();
      }
    });
  }

  function updateMuteState() {
    if (tvVideo.muted) {
      if (tvMuteBtn) tvMuteBtn.textContent = "Unmute 🔇";
      if (tvUnmuteBanner) tvUnmuteBanner.classList.remove("hidden");
    } else {
      if (tvMuteBtn) tvMuteBtn.textContent = "Mute 🔊";
      if (tvUnmuteBanner) tvUnmuteBanner.classList.add("hidden");
    }
  }

  if (tvMuteBtn) {
    tvMuteBtn.addEventListener("click", () => {
      tvVideo.muted = !tvVideo.muted;
      if (!tvVideo.muted) {
        pauseRadioIfPlaying();
      }
      updateMuteState();
    });
  }

  if (tvUnmuteBanner) {
    tvUnmuteBanner.addEventListener("click", () => {
      tvVideo.muted = false;
      pauseRadioIfPlaying();
      updateMuteState();
    });
  }

  if (tvPipBtn && document.pictureInPictureEnabled) {
    tvPipBtn.addEventListener("click", async () => {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await tvVideo.requestPictureInPicture();
        }
      } catch (e) {}
    });
  } else if (tvPipBtn) {
    tvPipBtn.style.display = "none";
  }

  if (tvFullscreenBtn) {
    tvFullscreenBtn.addEventListener("click", () => {
      const container = document.getElementById("tv-screen-box");
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (container && container.requestFullscreen) {
        container.requestFullscreen();
      } else if (tvVideo.requestFullscreen) {
        tvVideo.requestFullscreen();
      }
    });
  }

  // Interlock listener: pause TV if Radio begins playing
  const radioAudio = document.getElementById("audio");
  if (radioAudio) {
    radioAudio.addEventListener("play", () => {
      if (tvVideo && !tvVideo.paused) {
        tvVideo.pause();
      }
    });
  }

  // Init
  loadLineup();
})();
