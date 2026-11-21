export async function onRequest(context) {
  const CATALOGUE = [
    { title: "Thunder Queen", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "The Highway Don't Lie", artist: "Leah Carter", duration: 210, vibe: "country" },
    { title: "Cherry Red", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "Bubblegum in the Rain", artist: "Leah Carter", duration: 210, vibe: "pop" },
    { title: "Wrong Kind of Right", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "Pocket Full of Stars", artist: "Leah Carter", duration: 210, vibe: "pop" },
    { title: "Guitar Speaks", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "Kindness Wins", artist: "Leah Carter", duration: 210, vibe: "pop" },
    { title: "Lola's the Fire in the Wire", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "Take My Hand", artist: "Leah Carter", duration: 210, vibe: "pop" },
    { title: "No Encore", artist: "Kayleigh Merez", duration: 210, vibe: "ballad" },
    { title: "Echoes in My Room", artist: "Leah Carter", duration: 210, vibe: "acoustic" },
    { title: "Call It What It Is", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "The Hard Part", artist: "Leah Carter", duration: 210, vibe: "ballad" },
    { title: "No Warm Up", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "Gold on the Water", artist: "Leah Carter", duration: 210, vibe: "acoustic" },
    { title: "Not Half", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "The Last Stool at the Bar", artist: "Leah Carter", duration: 210, vibe: "acoustic" },
    { title: "Play It Twice", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "Golden, Actually", artist: "Leah Carter & Zach Rivera", duration: 210, vibe: "pop" },
    { title: "Same Old Road", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "We Dance All Night", artist: "Leah Carter", duration: 210, vibe: "pop" },
    { title: "All the Way Home", artist: "Kayleigh Merez", duration: 210, vibe: "acoustic" },
    { title: "Gravel and Goodbye", artist: "Leah Carter", duration: 210, vibe: "country" },
    { title: "Down the Front", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "The Ranch", artist: "Leah Carter", duration: 210, vibe: "country" },
    { title: "Play the Whole Thing", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "Calluses on These Hands", artist: "Leah Carter", duration: 210, vibe: "acoustic" },
    { title: "We Already Know", artist: "Kayleigh Merez", duration: 210, vibe: "rock" },
    { title: "Whiskey on a Wednesday", artist: "Leah Carter", duration: 210, vibe: "country" },
    { title: "Same Old Shadow", artist: "Leah Carter", duration: 210, vibe: "country" },
    { title: "My Own Two Feet", artist: "Leah Carter", duration: 210, vibe: "pop" },
    { title: "The Last Good Year", artist: "Leah Carter", duration: 210, vibe: "ballad" },
    { title: "Not That Girl", artist: "Leah Carter", duration: 210, vibe: "pop" },
    { title: "Never Say My Name", artist: "Leah Carter", duration: 210, vibe: "ballad" },
    { title: "Harbour of Ashes", artist: "Leah Carter", duration: 210, vibe: "acoustic" },
    { title: "Is This It? (What Am I Here For)", artist: "Leah Carter", duration: 210, vibe: "pop" },
    { title: "Let It Ring", artist: "Leah Carter", duration: 210, vibe: "ballad" },
    { title: "Come Back Louder", artist: "Leah Carter", duration: 210, vibe: "rock" }
  ];

  const SHOWS = [
    { start: 6, end: 10, id: "breakfast", title: "Breakfast", presenter: "Callum & Rhys" },
    { start: 10, end: 15, id: "days", title: "Days", presenter: "Sarah Quinn" },
    { start: 15, end: 19, id: "drive", title: "Drive", presenter: "Owen Hart" },
    { start: 19, end: 23, id: "evenings", title: "Evenings", presenter: "Nia Brooks" },
    { start: 23, end: 27, id: "late", title: "Late", presenter: "Tom Hale" },
    { start: 3, end: 6, id: "early", title: "Early", presenter: "Maya Cole" }
  ];

  function getShowAt(sec) {
    const d = new Date(sec * 1000);
    const clockStr = d.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
    const hour = parseInt(clockStr.split(":")[0], 10);
    return SHOWS.find(s => {
      if (s.start <= s.end) return hour >= s.start && hour < s.end;
      return hour >= s.start || hour < (s.end % 24);
    }) || SHOWS[0];
  }

  function formatUKTime(sec) {
    const d = new Date(sec * 1000);
    return d.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function formatUKDate(sec) {
    const d = new Date(sec * 1000);
    return d.toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" });
  }

  const url = new URL(context.request.url);
  const format = url.searchParams.get("format") || "json";
  const limit = Math.min(200, Math.max(10, parseInt(url.searchParams.get("limit") || "60", 10)));
  const filterType = url.searchParams.get("filter") || "all"; // all, songs, idents, djs

  const nowSec = Math.floor(Date.now() / 1000);
  const songPeriod = 210; // 3m 30s per rotation block
  const currentRot = Math.floor(nowSec / songPeriod);

  // We build a timeline from (currentRot - pastRotations) to (currentRot + futureRotations)
  const pastCount = Math.floor(limit * 0.7);
  const futureCount = limit - pastCount;
  const startRot = currentRot - pastCount;
  const endRot = currentRot + futureCount;

  const events = [];

  for (let rot = startRot; rot <= endRot; rot++) {
    const rotStartSec = rot * songPeriod;
    const songIdx = ((rot % CATALOGUE.length) + CATALOGUE.length) % CATALOGUE.length;
    const song = CATALOGUE[songIdx];
    const show = getShowAt(rotStartSec);
    const d = new Date(rotStartSec * 1000);
    const minute = parseInt(d.toLocaleTimeString("en-GB", { timeZone: "Europe/London", minute: "2-digit" }), 10);
    const weekdayStr = d.toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "long" });
    const isWeekend = weekdayStr === "Saturday" || weekdayStr === "Sunday";

    let cursorSec = rotStartSec;

    // Check if transition element was scheduled before song
    // 1. Top of the Hour Ident
    if (minute >= 58 || minute <= 1) {
      const dur = 10;
      events.push({
        id: `ident_${rot}_toh`,
        timestamp: cursorSec,
        time: formatUKTime(cursorSec),
        date: formatUKDate(cursorSec),
        type: "IDENT_START",
        category: "Station Ident",
        title: "Top of the Hour Nationwide Ident (London to Penzance)",
        artist: "KM Radio Station Imaging",
        duration: "10s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
      cursorSec += dur;
      events.push({
        id: `ident_${rot}_toh_end`,
        timestamp: cursorSec,
        time: formatUKTime(cursorSec),
        date: formatUKDate(cursorSec),
        type: "IDENT_FINISH",
        category: "Station Ident",
        title: "Top of the Hour Nationwide Ident (London to Penzance)",
        artist: "KM Radio Station Imaging",
        duration: "10s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
    }
    // 2. Bottom of the Hour Variety Promise
    else if (minute >= 28 && minute <= 31) {
      const dur = 8;
      events.push({
        id: `ident_${rot}_variety`,
        timestamp: cursorSec,
        time: formatUKTime(cursorSec),
        date: formatUKDate(cursorSec),
        type: "IDENT_START",
        category: "Station Ident",
        title: "30-Minute Non-Stop Variety Promise Ident",
        artist: "KM Radio Station Imaging",
        duration: "8s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
      cursorSec += dur;
      events.push({
        id: `ident_${rot}_variety_end`,
        timestamp: cursorSec,
        time: formatUKTime(cursorSec),
        date: formatUKDate(cursorSec),
        type: "IDENT_FINISH",
        category: "Station Ident",
        title: "30-Minute Non-Stop Variety Promise Ident",
        artist: "KM Radio Station Imaging",
        duration: "8s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
    }
    // 3. Weekend Feel-Good Ident
    else if (isWeekend && (rot % 4 === 1)) {
      const dur = 8;
      events.push({
        id: `ident_${rot}_weekend`,
        timestamp: cursorSec,
        time: formatUKTime(cursorSec),
        date: formatUKDate(cursorSec),
        type: "IDENT_START",
        category: "Station Ident",
        title: "Weekend Feel-Good Station Ident",
        artist: "KM Radio Station Imaging",
        duration: "8s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
      cursorSec += dur;
      events.push({
        id: `ident_${rot}_weekend_end`,
        timestamp: cursorSec,
        time: formatUKTime(cursorSec),
        date: formatUKDate(cursorSec),
        type: "IDENT_FINISH",
        category: "Station Ident",
        title: "Weekend Feel-Good Station Ident",
        artist: "KM Radio Station Imaging",
        duration: "8s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
    }
    // 4. Presenter Link (Every 3rd track)
    else if (rot % 3 === 0) {
      const dur = 12;
      let linkTitle = `${show.presenter} On-Air Link (Into ${song.title})`;
      if (show.id === "breakfast") linkTitle = `Callum & Rhys Breakfast Link (Into ${song.title})`;
      else if (show.id === "days") linkTitle = `Sarah Quinn Daytime Link (Into ${song.title})`;
      else if (show.id === "drive") linkTitle = `Owen Hart Drivetime Link (Into ${song.title})`;
      else if (show.id === "evenings") linkTitle = `Nia Brooks Evenings Alternative Rock Link (Into ${song.title})`;
      else if (show.id === "late") linkTitle = `Tom Hale Late Show Unwind (Into ${song.title})`;
      else if (show.id === "early") linkTitle = `Maya Cole Early Dawn Companion (Into ${song.title})`;

      events.push({
        id: `dj_${rot}_start`,
        timestamp: cursorSec,
        time: formatUKTime(cursorSec),
        date: formatUKDate(cursorSec),
        type: "DJ_START",
        category: "Presenter Link",
        title: linkTitle,
        artist: show.presenter,
        duration: "12s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
      cursorSec += dur;
      events.push({
        id: `dj_${rot}_end`,
        timestamp: cursorSec,
        time: formatUKTime(cursorSec),
        date: formatUKDate(cursorSec),
        type: "DJ_FINISH",
        category: "Presenter Link",
        title: linkTitle,
        artist: show.presenter,
        duration: "12s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
    }

    // Now the Song plays
    const songStartSec = cursorSec;
    const songDur = song.duration;
    const songFinishSec = songStartSec + songDur;

    events.push({
      id: `song_${rot}_start`,
      timestamp: songStartSec,
      time: formatUKTime(songStartSec),
      date: formatUKDate(songStartSec),
      type: "SONG_START",
      category: "Music",
      title: song.title,
      artist: song.artist,
      duration: "3m 30s",
      durationSec: songDur,
      vibe: song.vibe,
      show: show.title,
      presenter: show.presenter
    });

    events.push({
      id: `song_${rot}_finish`,
      timestamp: songFinishSec,
      time: formatUKTime(songFinishSec),
      date: formatUKDate(songFinishSec),
      type: "SONG_FINISH",
      category: "Music",
      title: song.title,
      artist: song.artist,
      duration: "3m 30s",
      durationSec: songDur,
      vibe: song.vibe,
      show: show.title,
      presenter: show.presenter
    });
  }

  // Sort events chronologically
  events.sort((a, b) => a.timestamp - b.timestamp);

  // Annotate live status
  events.forEach(e => {
    if (e.timestamp + e.durationSec <= nowSec) {
      e.status = "COMPLETED";
    } else if (e.timestamp <= nowSec && nowSec < e.timestamp + e.durationSec) {
      e.status = "ON AIR";
    } else {
      e.status = "UPCOMING";
    }
  });

  // Apply category filter if requested
  let filtered = events;
  if (filterType === "songs") {
    filtered = events.filter(e => e.type.startsWith("SONG"));
  } else if (filterType === "djs") {
    filtered = events.filter(e => e.type.startsWith("DJ"));
  } else if (filterType === "idents") {
    filtered = events.filter(e => e.type.startsWith("IDENT") || e.category === "Station Ident");
  }

  // Return CSV export if requested
  if (format === "csv") {
    const csvHeader = "Timestamp (UK),Date,Event Type,Category,Item Title,Artist / Presenter,Show,Duration,Status\n";
    const csvRows = filtered.map(e => {
      const escape = s => `"${(s || "").toString().replace(/"/g, '""')}"`;
      return [
        escape(e.time),
        escape(e.date),
        escape(e.type),
        escape(e.category),
        escape(e.title),
        escape(e.artist),
        escape(e.show),
        escape(e.duration),
        escape(e.status)
      ].join(",");
    }).join("\n");

    const todayDate = new Date().toISOString().slice(0, 10);
    return new Response(csvHeader + csvRows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="km_radio_transmission_log_${todayDate}.csv"`,
        "Cache-Control": "public, max-age=5, must-revalidate",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  // Return JSON format
  const currentShow = getShowAt(nowSec);
  const responseData = {
    station: "KM Radio UK",
    url: "https://www.kmrecords.uk",
    generatedAt: new Date(nowSec * 1000).toISOString(),
    currentClock: formatUKTime(nowSec),
    currentDate: formatUKDate(nowSec),
    currentShow: {
      title: currentShow.title,
      presenter: currentShow.presenter
    },
    totalEvents: filtered.length,
    events: filtered
  };

  return new Response(JSON.stringify(responseData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
