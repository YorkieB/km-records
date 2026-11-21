export async function onRequest(context) {
  const CATALOGUE = [
    { title: "Thunder Queen", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 14, story: "Kayleigh's roaring vintage Gibson Les Paul riff hitting the rock post." },
    { title: "The Highway Don't Lie", artist: "Leah Carter", vibe: "country", energy: "medium", ramp: 12, story: "Leah's open-road Americana anthem driven by acoustic rhythm." },
    { title: "Cherry Red", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 12, story: "High-octane British indie rock with crisp Telecaster drive." },
    { title: "Bubblegum in the Rain", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 13, story: "Bright acoustic pop with infectious hook and feel-good sunshine." },
    { title: "Wrong Kind of Right", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 10, story: "Punchy, driving rock groove with soaring lead vocal." },
    { title: "Pocket Full of Stars", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 11, story: "Uplifting feel-good daytime anthem with chiming guitar arpeggios." },
    { title: "Guitar Speaks", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 16, story: "Intricate guitar wizardry showcasing Kayleigh's signature fretwork." },
    { title: "Kindness Wins", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 10, story: "Warm, heartwarming acoustic songwriting with honest lyrical craft." },
    { title: "Lola's the Fire in the Wire", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 11, story: "Electric tribute celebrating Kayleigh's California love and rock soul." },
    { title: "Take My Hand", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 9, story: "Sweeping romantic pop melody with acoustic warmth." },
    { title: "No Encore", artist: "Kayleigh Merez", vibe: "ballad", energy: "medium", ramp: 9, story: "Emotive midnight indie ballad with delicate guitar bends." },
    { title: "Echoes in My Room", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 14, story: "Intimate late-night acoustic contemplation and vocal harmony." },
    { title: "Call It What It Is", artist: "Kayleigh Merez", vibe: "rock", energy: "medium", ramp: 8, story: "Gritty, uncompromising British rock storytelling." },
    { title: "The Hard Part", artist: "Leah Carter", vibe: "ballad", energy: "chill", ramp: 12, story: "Vulnerable, poignant lyrics over soft piano and fingerpicked guitar." },
    { title: "No Warm Up", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 7, story: "Instant rock adrenaline diving straight into heavy guitar overdrive." },
    { title: "Gold on the Water", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 16, story: "Gentle fingerpicked sunrise acoustic ballad." },
    { title: "Not Half", artist: "Kayleigh Merez", vibe: "rock", energy: "medium", ramp: 12, story: "Edgy guitar swagger with sharp British vocal cadence." },
    { title: "The Last Stool at the Bar", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 15, story: "Late-night country tavern ballad with aching pedal steel tones." },
    { title: "Play It Twice", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 10, story: "Unapologetic power-chord rocker built for live arenas." },
    { title: "Golden, Actually", artist: "Leah Carter & Zach Rivera", vibe: "pop", energy: "medium", ramp: 14, story: "Lush vocal duet blending country warmth and California pop." },
    { title: "Same Old Road", artist: "Kayleigh Merez", vibe: "rock", energy: "medium", ramp: 14, story: "Reflective journey rock track with melodic bass groove." },
    { title: "We Dance All Night", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 12, story: "Euphoric uptempo pop celebration with country flair." },
    { title: "All the Way Home", artist: "Kayleigh Merez", vibe: "acoustic", energy: "chill", ramp: 11, story: "Soulful acoustic ballad written on the Pacific Coast Highway." },
    { title: "Gravel and Goodbye", artist: "Leah Carter", vibe: "country", energy: "chill", ramp: 13, story: "Heartfelt acoustic farewell on rural UK roads." },
    { title: "Down the Front", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 15, story: "Passionate gig anthem dedicated to front-row indie music lovers." },
    { title: "The Ranch", artist: "Leah Carter", vibe: "country", energy: "medium", ramp: 11, story: "Upbeat country rock celebrating rural independence." },
    { title: "Play the Whole Thing", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 13, story: "Pure unedited guitar rock energy from first to last bar." },
    { title: "Calluses on These Hands", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 10, story: "Working musician's pride in honest craftsmanship." },
    { title: "We Already Know", artist: "Kayleigh Merez", vibe: "rock", energy: "medium", ramp: 9, story: "Searing post-punk guitar textures with punchy drive." },
    { title: "Whiskey on a Wednesday", artist: "Leah Carter", vibe: "country", energy: "medium", ramp: 12, story: "Midweek roots-rocker with sharp wit and infectious tempo." },
    { title: "Same Old Shadow", artist: "Leah Carter", vibe: "country", energy: "chill", ramp: 14, story: "Atmospheric acoustic country noir." },
    { title: "My Own Two Feet", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 11, story: "Empowering pop anthem with driving acoustic strum." },
    { title: "The Last Good Year", artist: "Leah Carter", vibe: "ballad", energy: "chill", ramp: 13, story: "Nostalgic reflection on youth, songwriting, and shared time." },
    { title: "Not That Girl", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 12, story: "Defiant pop-country statement of artistic autonomy." },
    { title: "Never Say My Name", artist: "Leah Carter", vibe: "ballad", energy: "chill", ramp: 10, story: "Heartbreaking acoustic ballad with lush vocal layering." },
    { title: "Harbour of Ashes", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 15, story: "Moody coastal reflection recorded by the Atlantic." },
    { title: "Is This It? (What Am I Here For)", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 11, story: "Existential pop questioning with dynamic chorus lift." },
    { title: "Let It Ring", artist: "Leah Carter", vibe: "ballad", energy: "chill", ramp: 12, story: "Gentle acoustic lullaby easing into quiet evening reflections." },
    { title: "Come Back Louder", artist: "Leah Carter", vibe: "rock", energy: "high", ramp: 10, story: "Full-band pop-rock surge with driving drum groove." }
  ];

  const SHOWS = [
    { start: 6, end: 10, id: "breakfast", title: "Breakfast", presenter: "Callum & Rhys" },
    { start: 10, end: 15, id: "days", title: "Days", presenter: "Sarah Quinn" },
    { start: 15, end: 19, id: "drive", title: "Drive", presenter: "Owen Hart" },
    { start: 19, end: 23, id: "evenings", title: "Evenings", presenter: "Nia Brooks" },
    { start: 23, end: 27, id: "late", title: "Late", presenter: "Tom Hale" },
    { start: 3, end: 6, id: "early", title: "Early", presenter: "Maya Cole" }
  ];

  const now = new Date();
  const londonDateStr = now.toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "long" });
  const weekdayStr = now.toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "long" });
  const clockStr = now.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
  const parts = clockStr.split(":");
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  const isWeekend = weekdayStr === "Saturday" || weekdayStr === "Sunday";

  let currentShow = SHOWS.find(s => {
    if (s.start <= s.end) return hour >= s.start && hour < s.end;
    return hour >= s.start || hour < (s.end % 24);
  }) || SHOWS[0];

  const nowSec = Math.floor(now.getTime() / 1000);
  const songPeriod = 210; // 3m 30s per track
  const rotationIndex = Math.floor(nowSec / songPeriod);
  const songIdx = rotationIndex % CATALOGUE.length;
  const currentSong = CATALOGUE[songIdx];
  const nextSong = CATALOGUE[(songIdx + 1) % CATALOGUE.length];
  const intoSec = nowSec % songPeriod;

  // --- CONTENT-AWARE IMAGING & PRESENTER SELECTION ENGINE ---
  let cue = null;
  const joinId = `join_${rotationIndex}`;

  // Evaluate transition cues when we are near the song join (intoSec < 24)
  if (intoSec < 24) {
    // 1. Top of the Hour (minutes 58, 59, 0, 1): Grand Nationwide Ident (London to Penzance)
    if (minute >= 58 || minute <= 1) {
      cue = {
        id: `${joinId}_toh`,
        kind: "ident",
        src: "/audio/imaging/heart/heart_ident_nationwide_toh.mp3",
        title: "Top of the Hour Nationwide Ident (London to Penzance)",
        duckTo: 0.20,
        context: "Scheduled: Nationwide Top of the Hour broadcast check"
      };
    }
    // 2. Bottom of the Hour (minutes 28 - 32): 30-Minute Variety Promise
    else if (minute >= 28 && minute <= 32) {
      cue = {
        id: `${joinId}_variety`,
        kind: "ident",
        src: "/audio/imaging/heart/heart_ident_nonstop_variety.mp3",
        title: "Non-Stop Variety Promise Ident",
        duckTo: 0.22,
        context: "Scheduled: Mid-hour music variety guarantee"
      };
    }
    // 3. Weekend Feel-Good (Every 4th transition on Saturday / Sunday)
    else if (isWeekend && (rotationIndex % 4 === 1)) {
      cue = {
        id: `${joinId}_weekend`,
        kind: "ident",
        src: "/audio/imaging/heart/heart_ident_weekend_feelgood.mp3",
        title: "Weekend Feel-Good Ident",
        duckTo: 0.22,
        context: `Weekend programming: ${weekdayStr} uplifting rotation`
      };
    }
    // 4. Content-Aware Presenter Links (Every 2nd transition across the broadcast daypart)
    else if (rotationIndex % 2 === 0) {
      if (currentShow.id === "breakfast") {
        const link = (rotationIndex % 4 === 0) 
          ? { src: "/audio/presenters/callum_rhys_link_01.mp3", title: "Callum & Rhys Breakfast Link (Into Thunder Queen)" }
          : { src: "/audio/presenters/callum_rhys_link_02.mp3", title: "Callum & Rhys Breakfast Link (School Run Check)" };
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: link.src, title: link.title, duckTo: 0.20, context: `Breakfast link with Callum & Rhys heading into ${nextSong.title}` };
      } else if (currentShow.id === "days") {
        const link = (nextSong.artist.includes("Kayleigh"))
          ? { src: "/audio/presenters/sarah_quinn_link_01.mp3", title: "Sarah Quinn Daytime Link (Into Kayleigh Merez)" }
          : { src: "/audio/presenters/sarah_quinn_link_02.mp3", title: "Sarah Quinn Daytime Link (Into Leah Carter Sunshine)" };
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: link.src, title: link.title, duckTo: 0.20, context: `Days link with Sarah Quinn heading into ${nextSong.title}` };
      } else if (currentShow.id === "drive") {
        const link = (nextSong.artist.includes("Kayleigh"))
          ? { src: "/audio/presenters/owen_hart_link_02.mp3", title: "Owen Hart Drivetime Link (Into Cherry Red)" }
          : { src: "/audio/presenters/owen_hart_link_01.mp3", title: "Owen Hart Drivetime Link (Rush Hour Highway Check)" };
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: link.src, title: link.title, duckTo: 0.20, context: `Drive link with Owen Hart heading into ${nextSong.title}` };
      } else if (currentShow.id === "evenings") {
        const link = (nextSong.vibe === "rock")
          ? { src: "/audio/presenters/nia_brooks_link_01.mp3", title: "Nia Brooks Evenings Rock Link (Guitar Craft)" }
          : { src: "/audio/presenters/nia_brooks_link_02.mp3", title: "Nia Brooks Evenings Link (Leah Carter Grit)" };
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: link.src, title: link.title, duckTo: 0.20, context: `Evenings link with Nia Brooks heading into ${nextSong.title}` };
      } else if (currentShow.id === "late") {
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: "/audio/presenters/tom_hale_link_01.mp3", title: "Tom Hale Late Show Link (Midnight Unwind)", duckTo: 0.20, context: `Late show link with Tom Hale heading into ${nextSong.title}` };
      } else if (currentShow.id === "early") {
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: "/audio/presenters/maya_cole_link_01.mp3", title: "Maya Cole Early Show Link (Dawn Shift Check)", duckTo: 0.20, context: `Early show link with Maya Cole heading into ${nextSong.title}` };
      }
    }
    // 5. Content-Aware Artist Drops & Energy Matching
    else {
      if (nextSong.artist === "Kayleigh Merez" && nextSong.energy === "high") {
        cue = (rotationIndex % 3 === 0)
          ? { id: `${joinId}_artist`, kind: "artist_drop", src: "/audio/imaging/heart/heart_artist_drop_kayleigh.mp3", title: "Kayleigh Merez Artist Drop", duckTo: 0.22, context: "Artist matching: Kayleigh Merez high-octane rock intro" }
          : { id: `${joinId}_sweeper`, kind: "sweeper", src: "/audio/imaging/sweeper_01_nonstop_rock.mp3", title: "Non-Stop Rock Guitar Sweeper", duckTo: 0.22, context: "Energy matching: Rock intro ramp" };
      } else if (nextSong.artist.includes("Leah Carter") && nextSong.vibe === "pop") {
        cue = { id: `${joinId}_artist`, kind: "artist_drop", src: "/audio/imaging/heart/heart_artist_drop_leah.mp3", title: "Leah Carter Artist Drop", duckTo: 0.22, context: "Artist matching: Leah Carter pop feel-good intro" };
      } else if (nextSong.vibe === "acoustic" || nextSong.vibe === "ballad") {
        cue = { id: `${joinId}_chilled`, kind: "ident", src: "/audio/imaging/heart/heart_ident_acoustic_chilled.mp3", title: "Acoustic & Chilled Ident", duckTo: 0.22, context: "Vibe matching: Stripped-back acoustic ballad" };
      } else {
        // Fallback to station brander or feel-good ident
        cue = { id: `${joinId}_feelgood`, kind: "ident", src: "/audio/imaging/heart/heart_ident_feel_good.mp3", title: "KM Radio Feel-Good Station Ident", duckTo: 0.22, context: "Standard station identity rotation" };
      }
    }
  }

  const data = {
    timezone: "Europe/London",
    hour,
    minute,
    clock: clockStr,
    weekday: weekdayStr,
    date: londonDateStr,
    isWeekend,
    id: currentShow.id,
    title: currentShow.title,
    presenter: currentShow.presenter,
    onAir: `KM Records — ${currentShow.title} with ${currentShow.presenter}`,
    live: {
      weather: {
        place: "London & UK",
        weather: "clear, about 8 degrees"
      },
      catalogue: {
        title: currentSong.title,
        artist: currentSong.artist,
        vibe: currentSong.vibe,
        energy: currentSong.energy,
        story: currentSong.story,
        into: intoSec,
        next: {
          title: nextSong.title,
          artist: nextSong.artist,
          vibe: nextSong.vibe,
          energy: nextSong.energy,
          ramp: nextSong.ramp,
          story: nextSong.story
        }
      }
    },
    talk: cue
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=2, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
