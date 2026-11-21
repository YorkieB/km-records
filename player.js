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
let lastCueTime = 0
let talking = false
let currentPlayingSeg = 0
let currentSongIdx = -1
let lastWeather = "London & UK: clear, about 8 degrees"

console.log("[KM Radio] Player v34 loaded — Exclusive Heart-style commercial imaging & AI presenter desk active")

const talkAudio = new Audio()
talkAudio.preload = "auto"

// Physical segment catalogue for 0ms instantaneous UI updates on fragment change
const TRACK_SEGMENTS = [
  { start: 1, end: 34, title: "Play the Whole Thing", artist: "Kayleigh Merez" },
  { start: 35, end: 68, title: "Play It Twice", artist: "Kayleigh Merez" },
  { start: 69, end: 107, title: "No Encore", artist: "Kayleigh Merez" },
  { start: 108, end: 145, title: "Call It What It Is", artist: "Kayleigh Merez" },
  { start: 146, end: 178, title: "No Warm Up", artist: "Kayleigh Merez" },
  { start: 179, end: 210, title: "Not Half", artist: "Kayleigh Merez" },
  { start: 211, end: 247, title: "Same Old Road", artist: "Kayleigh Merez" },
  { start: 248, end: 285, title: "We Already Know", artist: "Kayleigh Merez" },
  { start: 286, end: 324, title: "All the Way Home", artist: "Kayleigh Merez" },
  { start: 325, end: 363, title: "Down the Front", artist: "Kayleigh Merez" },
  { start: 364, end: 415, title: "Never Say My Name", artist: "Leah Carter" },
  { start: 416, end: 463, title: "Thunder Queen", artist: "Kayleigh Merez" },
  { start: 464, end: 515, title: "Wrong Kind of Right", artist: "Kayleigh Merez" },
  { start: 516, end: 565, title: "Lola's the Fire in the Wire", artist: "Kayleigh Merez" },
  { start: 566, end: 605, title: "The Highway Don't Lie", artist: "Leah Carter" },
  { start: 606, end: 645, title: "The Ranch", artist: "Leah Carter" },
  { start: 646, end: 675, title: "Same Old Shadow", artist: "Leah Carter" },
  { start: 676, end: 714, title: "The Last Good Year", artist: "Leah Carter" },
  { start: 715, end: 757, title: "Calluses on These Hands", artist: "Leah Carter" },
  { start: 758, end: 795, title: "My Own Two Feet", artist: "Leah Carter" },
  { start: 796, end: 821, title: "Whiskey on a Wednesday", artist: "Leah Carter" },
  { start: 822, end: 861, title: "Not That Girl", artist: "Leah Carter" },
  { start: 862, end: 891, title: "Bubblegum in the Rain", artist: "Leah Carter" },
  { start: 892, end: 922, title: "Pocket Full of Stars", artist: "Leah Carter" },
  { start: 923, end: 960, title: "Kindness Wins", artist: "Leah Carter" },
  { start: 961, end: 989, title: "Take My Hand", artist: "Leah Carter" },
  { start: 990, end: 1026, title: "Echoes in My Room", artist: "Leah Carter" },
  { start: 1027, end: 1057, title: "The Hard Part", artist: "Leah Carter" },
  { start: 1058, end: 1095, title: "Gold on the Water", artist: "Leah Carter" },
  { start: 1096, end: 1131, title: "The Last Stool at the Bar", artist: "Leah Carter" },
  { start: 1132, end: 1171, title: "Golden, Actually", artist: "Leah Carter & Zach Rivera" },
  { start: 1172, end: 1213, title: "We Dance All Night", artist: "Leah Carter" },
  { start: 1214, end: 1254, title: "Gravel and Goodbye", artist: "Leah Carter" },
  { start: 1255, end: 1297, title: "Cherry Red", artist: "Kayleigh Merez" },
  { start: 1298, end: 1341, title: "Guitar Speaks", artist: "Kayleigh Merez" },
  { start: 1342, end: 1365, title: "Harbour of Ashes", artist: "Leah Carter" },
  { start: 1366, end: 1411, title: "Is This It? (What Am I Here For)", artist: "Leah Carter" }
]

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

function updateLiveSegment(seg) {
  if (!isLive(current) || talking) return
  const trackIdx = TRACK_SEGMENTS.findIndex(t => seg >= t.start && seg <= t.end)
  if (trackIdx === -1) return
  const song = TRACK_SEGMENTS[trackIdx]
  const next = TRACK_SEGMENTS[(trackIdx + 1) % TRACK_SEGMENTS.length]

  const now = new Date()
  const clockStr = now.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" })

  if (desk) {
    const bits = [clockStr, `${song.title} — ${song.artist}`, `Next: ${next.title}`]
    if (lastWeather) bits.push(lastWeather)
    desk.textContent = bits.join(" · ")
  }
}

// EXCLUSIVE HEART-STYLE COMMERCIAL IMAGING & LIVE AI PRESENTER CLOCK:
// All old rock idents have been retired.
// Every element is strictly from the official Heart UK-style package or live AI presenter desk.
async function triggerTransitionCue(trackIdx) {
  if (talking || !isLive(current)) return
  const now = new Date()
  const minute = now.getMinutes()
  const hour = now.getHours()
  const isWeekend = now.getDay() === 0 || now.getDay() === 6
  const nextTrack = TRACK_SEGMENTS[trackIdx]

  let showId = "drive"
  if (hour >= 6 && hour < 10) showId = "breakfast"
  else if (hour >= 10 && hour < 15) showId = "days"
  else if (hour >= 15 && hour < 19) showId = "drive"
  else if (hour >= 19 && hour < 23) showId = "evenings"
  else if (hour >= 23 || hour < 3) showId = "late"
  else if (hour >= 3 && hour < 6) showId = "early"

  let cue = null
  const cueId = `cue_${Date.now()}_t${trackIdx}`

  // 1. Top of the Hour (minutes 58-02): Grand Nationwide TOH Ident (London to Penzance)
  if (minute >= 58 || minute <= 2) {
    cue = {
      id: `${cueId}_toh`,
      kind: "ident",
      src: "/audio/imaging/heart/heart_ident_nationwide_toh.mp3",
      title: "Nationwide Top of the Hour Ident (London to Penzance)"
    }
  }
  // 2. Bottom of the Hour (minutes 28-32): 30-Minute Variety Promise Ident
  else if (minute >= 28 && minute <= 32) {
    cue = {
      id: `${cueId}_var`,
      kind: "ident",
      src: "/audio/imaging/heart/heart_ident_nonstop_variety.mp3",
      title: "Non-Stop Variety Promise Ident"
    }
  }
  // 3. Autonomous Live AI Presenter Link (Every 3rd song in commercial sweep)
  else if (trackIdx % 3 === 0) {
    cue = {
      id: `${cueId}_dj`,
      kind: "presenter_link",
      src: `/radio/speak?show=${showId}&next=${encodeURIComponent(nextTrack.title)}&v=${Math.floor(Date.now() / 900000)}`,
      title: "Live AI Presenter Link (Live UK News & Weather)"
    }
  }
  // 4. Weekend Feel-Good Ident (Weekends)
  else if (isWeekend && (trackIdx % 4 === 1)) {
    cue = {
      id: `${cueId}_wknd`,
      kind: "ident",
      src: "/audio/imaging/heart/heart_ident_weekend_feelgood.mp3",
      title: "Weekend Feel-Good Station Ident"
    }
  }
  // 5. Show-Specific Heart Programme Jingles
  else if (showId === "breakfast" && trackIdx % 2 === 1) {
    cue = {
      id: `${cueId}_brk_jingle`,
      kind: "jingle",
      src: "/audio/imaging/heart/heart_jingle_callum_rhys_breakfast.mp3",
      title: "Callum & Rhys Breakfast Show Jingle"
    }
  }
  else if (showId === "drive" && trackIdx % 2 === 1) {
    cue = {
      id: `${cueId}_drv_jingle`,
      kind: "jingle",
      src: "/audio/imaging/heart/heart_jingle_drive_owen.mp3",
      title: "Owen Hart Drivetime Feel-Good Jingle"
    }
  }
  else if (showId === "days" && trackIdx % 2 === 1) {
    cue = {
      id: `${cueId}_workday_sweeper`,
      kind: "sweeper",
      src: "/audio/imaging/heart/heart_sweeper_workday_feelgood.mp3",
      title: "Workday Feel-Good Sweeper"
    }
  }
  else if ((showId === "evenings" || showId === "late") && trackIdx % 2 === 1) {
    cue = {
      id: `${cueId}_chilled`,
      kind: "ident",
      src: "/audio/imaging/heart/heart_ident_acoustic_chilled.mp3",
      title: "Acoustic & Chilled Evening Ident"
    }
  }
  // 6. Signature Artist Drops & Station Identity
  else if (nextTrack.artist.includes("Kayleigh") && trackIdx % 6 === 2) {
    cue = {
      id: `${cueId}_drop_kayleigh`,
      kind: "artist_drop",
      src: "/audio/imaging/heart/heart_artist_drop_kayleigh.mp3",
      title: "Kayleigh Merez Feel-Good Station Drop"
    }
  }
  else if (nextTrack.artist.includes("Leah") && trackIdx % 6 === 5) {
    cue = {
      id: `${cueId}_drop_leah`,
      kind: "artist_drop",
      src: "/audio/imaging/heart/heart_artist_drop_leah.mp3",
      title: "Leah Carter Music Variety Station Drop"
    }
  }
  else if (trackIdx % 4 === 2) {
    cue = {
      id: `${cueId}_smart`,
      kind: "ident",
      src: "/audio/imaging/heart/heart_ident_smart_speaker_digital.mp3",
      title: "Smart Speaker & Online Streaming Ident"
    }
  }
  else {
    cue = {
      id: `${cueId}_feelgood`,
      kind: "ident",
      src: "/audio/imaging/heart/heart_ident_feel_good.mp3",
      title: "Flagship Feel-Good Station Ident & Vocal Mnemonic"
    }
  }

  if (cue) {
    await playTalk(cue)
  }
}

function attachLive(src) {
  stopHls()
  audio.muted = false
  audio.volume = 1
  if (window.Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      liveSyncDurationCount: 2,          // Responsive ~11.7s buffer to tightly track real-time broadcast
      liveMaxLatencyDurationCount: 8,
      maxBufferLength: 20,
      maxMaxBufferLength: 40,
      backBufferLength: 30,
      highBufferWatchdogPeriod: 2
    })
    hls.loadSource(src)
    hls.attachMedia(audio)

    // SAMPLE-ACCURATE ZERO-LATENCY SYNC & CLEAN TRANSITION HOOK:
    hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
      if (!data || !data.frag) return
      const url = data.frag.relurl || data.frag.url || ""
      const m = url.match(/s(\d{4})\.ts/)
      if (m) {
        const seg = parseInt(m[1], 10)
        if (seg !== currentPlayingSeg) {
          const prevSeg = currentPlayingSeg
          currentPlayingSeg = seg
          updateLiveSegment(seg)

          // Check if this segment represents a genuine song transition:
          const newTrackIdx = TRACK_SEGMENTS.findIndex(t => seg >= t.start && seg <= t.end)
          if (newTrackIdx !== -1) {
            const isSongStart = (seg === TRACK_SEGMENTS[newTrackIdx].start)
            const isSongChanged = (newTrackIdx !== currentSongIdx)

            // Fire cue ONLY when a new song actually begins and previous playback was active
            // This mathematically prevents ANY cue from triggering mid-song!
            const nowMs = Date.now()
            if (isSongChanged && isSongStart && currentSongIdx !== -1 && prevSeg > 0 && !talking && (nowMs - lastCueTime > 90000)) {
              lastCueTime = nowMs
              triggerTransitionCue(newTrackIdx)
            }

            currentSongIdx = newTrackIdx
          }
        }
      }
    })

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

// COMPLETE AUDIO INTERLOCK:
// When an Ident, Jingle, or Presenter Link plays, the live song audio is 100% silenced.
// Zero overlap, zero bleed.
async function playTalk(cue) {
  if (!cue || talking || cue.id === lastTalkId) return
  lastTalkId = cue.id
  talking = true
  const liveSrc = isLive(current) && current ? current.dataset.src : null

  try {
    // 1. HARD SILENCE the music stream:
    audio.muted = true
    audio.volume = 0
    try { audio.pause() } catch (_) {}
    if (hls) {
      try { hls.stopLoad() } catch (_) {}
    }

    talkAudio.pause()
    talkAudio.muted = false
    talkAudio.volume = 1.0
    talkAudio.src = cue.src

    if (desk && cue.title) {
      desk.textContent = `[ON AIR: ${cue.title}] · KM Radio Live`
    }

    await talkAudio.play()

    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 35000)
      const done = () => {
        clearTimeout(timer)
        talkAudio.removeEventListener("ended", done)
        talkAudio.removeEventListener("error", done)
        resolve()
      }
      talkAudio.addEventListener("ended", done)
      talkAudio.addEventListener("error", done)
    })
  } catch (_) {}

  try {
    talkAudio.pause()
    talkAudio.removeAttribute("src")
    talkAudio.load()
  } catch (_) {}
  talking = false

  // 2. Restore live music stream cleanly with zero overlap:
  if (!current || !liveSrc) {
    audio.muted = false
    audio.volume = 1
    return
  }
  try {
    if (hls) {
      try { hls.startLoad() } catch (_) {}
    }
    audio.muted = false
    audio.volume = 1
    await audio.play()
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
    const segQuery = currentPlayingSeg ? `&seg=${currentPlayingSeg}` : ""
    const res = await fetch(`/radio/now?_t=${Date.now()}${segQuery}`, { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    if (talking) return
    if (data.onAir) title.textContent = data.onAir
    if (data.live && data.live.weather && data.live.weather.weather) {
      lastWeather = `${data.live.weather.place}: ${data.live.weather.weather}`
    }
    if (desk) {
      const bits = []
      if (data.clock) bits.push(data.clock)
      const cat = data.live && data.live.catalogue
      if (cat) {
        bits.push(`${cat.title} — ${cat.artist}`)
        if (cat.next) bits.push(`Next: ${cat.next.title}`)
      }
      if (lastWeather) bits.push(lastWeather)
      if (data.talk && data.talk.title) {
        bits.push(`Upcoming: ${data.talk.title}`)
      }
      desk.textContent = bits.join(" · ")
    }
    // Cues are now strictly triggered by physical segment boundaries in FRAG_CHANGED,
    // so refreshNow never triggers cues to avoid mid-song accidents!
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
    currentPlayingSeg = 0
    currentSongIdx = -1
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
      // Rapid 1.5s live polling so clock, weather, and show changes update immediately
      nowTimer = window.setInterval(refreshNow, 1500)
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
