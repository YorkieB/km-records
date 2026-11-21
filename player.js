const audio = document.querySelector("#audio")
const bar = document.querySelector(".now")
const toggle = document.querySelector("#now-toggle")
const title = document.querySelector("#now-title")
const desk = document.querySelector("#now-desk")
const seek = document.querySelector("#seek")
const time = document.querySelector("#time")
const tracks = [...document.querySelectorAll(".track")]
let current = null
let dragging = false
let hls = null
let nowTimer = null
let lastTalkId = null
let talking = false
const talkAudio = new Audio()
talkAudio.preload = "auto"

function isLive(button) {
  return button && button.dataset.live === "true"
}

function stopHls() {
  if (!hls) return
  try { hls.destroy() } catch (_) {}
  hls = null
}

function silenceLive() {
  stopHls()
  try { audio.pause() } catch (_) {}
  audio.muted = true
  audio.volume = 0
  audio.removeAttribute("src")
  try { audio.load() } catch (_) {}
}

function attachLive(src) {
  stopHls()
  audio.muted = false
  audio.volume = 1
  if (window.Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      liveSyncDurationCount: 4,          // Buffer 4 segments (approx 24s) ahead - eliminates buffer starvation & popping
      liveMaxLatencyDurationCount: 20,   // Prevent drifting too far
      maxBufferLength: 30,              // Keep 30s of decoded audio in memory
      maxMaxBufferLength: 60,
      backBufferLength: 60,
      highBufferWatchdogPeriod: 2
    })
    hls.loadSource(src)
    hls.attachMedia(audio)
    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            try { hls.startLoad() } catch (_) {}
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            try { hls.recoverMediaError() } catch (_) {}
            break
          default:
            stopHls()
            break
        }
      }
    })
    return new Promise((resolve, reject) => {
      hls.on(Hls.Events.MANIFEST_PARSED, () => resolve())
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) reject(new Error(data.type))
      })
    })
  }
  audio.src = src
}

function parkLive() {
  try { audio.pause() } catch (_) {}
  audio.muted = true
  audio.volume = 0
}

function unparkLive() {
  audio.muted = false
  audio.volume = 1
  return audio.play()
}

function atSongJoin(data) {
  const cat = data && data.live && data.live.catalogue
  if (!cat) return false
  if (cat.onIdent) return true
  // ONLY trigger right at the true song boundary (first 3 seconds), NEVER mid-song!
  return typeof cat.into === "number" && cat.into < 4
}

async function playTalk(cue) {
  if (!cue || talking || cue.id === lastTalkId) return
  lastTalkId = cue.id
  talking = true
  const liveSrc = isLive(current) && current ? current.dataset.src : null

  try {
    // 1. Immediately park (pause & silence) the live music stream!
    // This guarantees the Ident or Jingle NEVER plays over a song!
    parkLive()

    talkAudio.pause()
    talkAudio.volume = 1.0
    talkAudio.src = cue.src

    if (desk && cue.title) {
      desk.textContent = `[ON AIR: ${cue.title}] · KM Radio Live`
    }

    await talkAudio.play()

    await new Promise((resolve) => {
      const done = () => {
        talkAudio.removeEventListener("ended", done)
        talkAudio.removeEventListener("error", done)
        resolve()
      }
      talkAudio.addEventListener("ended", done)
      talkAudio.addEventListener("error", done)
    })
  } catch (_) {}

  talkAudio.pause()
  talkAudio.removeAttribute("src")
  try { talkAudio.load() } catch (_) {}
  talking = false

  // 2. Only after the Ident has fully completed, resume the music stream cleanly!
  if (!current || !liveSrc) {
    audio.muted = false
    audio.volume = 1
    return
  }
  try {
    await unparkLive()
  } catch (_) {
    try {
      await attachLive(liveSrc)
      await audio.play()
    } catch (_) {
      audio.muted = false
      audio.volume = 1
    }
  }
}

async function refreshNow() {
  if (!isLive(current) || talking) return
  try {
    const res = await fetch("/radio/now", { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    if (talking) return
    if (data.onAir) title.textContent = data.onAir
    if (desk) {
      const bits = []
      if (data.clock) bits.push(data.clock)
      const cat = data.live && data.live.catalogue
      if (cat) {
        bits.push(`${cat.title} — ${cat.artist}`)
        if (cat.next) bits.push(`Next: ${cat.next.title}`)
      }
      const weather = data.live && data.live.weather
      if (weather && weather.weather) bits.push(weather.place + ": " + weather.weather)
      if (data.talk && data.talk.title) {
        bits.push(`Upcoming: ${data.talk.title}`)
      }
      desk.textContent = bits.join(" · ")
    }
    if (data.talk && atSongJoin(data)) await playTalk(data.talk)
  } catch (_) {}
}

function clock(seconds) {
  if (!Number.isFinite(seconds)) return "0:00"
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const remain = String(whole % 60).padStart(2, "0")
  return minutes + ":" + remain
}

function showPlaying(button, on) {
  tracks.forEach((track) => {
    const active = track === button && on
    track.classList.toggle("is-playing", active)
    track.setAttribute("aria-pressed", active ? "true" : "false")
    const label = track.querySelector(".play-label")
    if (label) label.textContent = active ? "Pause" : "Play"
  })
  toggle.textContent = on ? "Pause" : "Play"
}

async function playTrack(button) {
  if (current === button && !audio.paused && !talking) {
    audio.pause()
    talkAudio.pause()
    return
  }
  if (current !== button) {
    talkAudio.pause()
    talking = false
    lastTalkId = null
    silenceLive()
    current = button
    title.textContent = button.dataset.artist
      ? button.dataset.title + " — " + button.dataset.artist
      : button.dataset.title
    seek.value = "0"
    time.textContent = isLive(button) ? "LIVE" : "0:00"
    seek.hidden = isLive(button)
    if (!isLive(button) && desk) {
      desk.textContent = button.dataset.artist ? "KM Records Catalogue" : ""
    }
    if (isLive(button)) {
      await attachLive(button.dataset.src)
      if (nowTimer) window.clearInterval(nowTimer)
      nowTimer = window.setInterval(refreshNow, 5000)
      refreshNow()
    } else {
      if (nowTimer) window.clearInterval(nowTimer)
      if (desk) desk.textContent = button.dataset.artist ? "KM Records Catalogue" : ""
      audio.muted = false
      audio.volume = 1
      audio.src = button.dataset.src
    }
  }
  bar.hidden = false
  document.body.classList.add("has-player")
  if (!talking) await audio.play()
}

tracks.forEach((button) => {
  button.addEventListener("click", () => {
    playTrack(button).catch(() => showPlaying(button, false))
  })
})

toggle.addEventListener("click", () => {
  if (!current || talking) return
  if (audio.paused) audio.play().catch(() => showPlaying(current, false))
  else audio.pause()
})

audio.addEventListener("play", () => {
  if (!talking) showPlaying(current, true)
})
audio.addEventListener("pause", () => {
  if (!talking) showPlaying(current, false)
})
audio.addEventListener("ended", () => {
  if (talking) return
  if (isLive(current)) {
    attachLive(current.dataset.src).then(() => audio.play()).catch(() => showPlaying(current, false))
    return
  }
  showPlaying(current, false)
})

audio.addEventListener("timeupdate", () => {
  if (isLive(current)) {
    time.textContent = "LIVE"
    return
  }
  if (!audio.duration || dragging) return
  seek.value = String(Math.round((audio.currentTime / audio.duration) * 1000))
  time.textContent = clock(audio.currentTime) + " / " + clock(audio.duration)
})

seek.addEventListener("pointerdown", () => { dragging = true })
seek.addEventListener("input", () => {
  if (!audio.duration) return
  time.textContent = clock((seek.value / 1000) * audio.duration) + " / " + clock(audio.duration)
})
seek.addEventListener("change", () => {
  if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration
  dragging = false
})

// Comic Lightbox Modal
const comicModal = document.querySelector("#comic-modal")
const comicModalImg = document.querySelector("#comic-modal-img")
const comicModalCaption = document.querySelector("#comic-modal-caption")
const comicModalClose = document.querySelector("#comic-modal-close")

if (comicModal) {
  document.querySelectorAll(".comic-card").forEach(card => {
    card.addEventListener("click", () => {
      const img = card.querySelector(".comic-thumb")
      const title = card.querySelector(".comic-title")?.textContent || ""
      const ep = card.querySelector(".comic-ep")?.textContent || ""
      if (img) {
        comicModalImg.src = img.src
        comicModalImg.alt = img.alt
        comicModalCaption.textContent = ep ? ep + " — " + title : title
        comicModal.classList.add("active")
        comicModal.setAttribute("aria-hidden", "false")
      }
    })
  })

  function closeComicModal() {
    comicModal.classList.remove("active")
    comicModal.setAttribute("aria-hidden", "true")
    comicModalImg.src = ""
  }

  comicModalClose?.addEventListener("click", closeComicModal)
  comicModal.addEventListener("click", (e) => {
    if (e.target === comicModal) closeComicModal()
  })
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && comicModal.classList.contains("active")) {
      closeComicModal()
    }
  })
}
