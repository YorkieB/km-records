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
      liveSyncDurationCount: 1,
      liveMaxLatencyDurationCount: 40,
      maxLiveSyncPlaybackRate: 1,
      backBufferLength: 180
    })
    hls.loadSource(src)
    hls.attachMedia(audio)
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
  return typeof cat.into === "number" && cat.into < 4
}

async function playTalk(cue) {
  if (!cue || talking || cue.id === lastTalkId) return
  lastTalkId = cue.id
  talking = true
  const liveSrc = isLive(current) && current ? current.dataset.src : null
  try {
    parkLive()
    talkAudio.pause()
    talkAudio.src = cue.src
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
      const weather = data.live && data.live.weather
      if (weather && weather.weather) bits.push(weather.place + ": " + weather.weather)
      const next = data.live && data.live.catalogue && data.live.catalogue.next
      if (next) bits.push("Next: " + next.title)
      if (data.talk && data.talk.kind === "conversation") {
        bits.push(data.talk.with && data.talk.with.name ? "Chat with " + data.talk.with.name : "On-air chat")
      } else if (data.talk && data.talk.kind === "desk") {
        bits.push("Live desk")
      } else if (data.talk && data.talk.kind === "jingle") {
        bits.push("Jingle")
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
      nowTimer = window.setInterval(refreshNow, 2000)
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
