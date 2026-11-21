// Master Physical Segment Map & Schedule Engine for KM Radio UK
// 1411 MPEG-TS segments (s0001.ts - s1411.ts) broadcast at exactly 5.875s per segment.
// Total broadcast loop: 1411 * 5.875 = 8289.625s (~2.30267 hours)

export const TOTAL_SEGMENTS = 1411;
export const SEGMENT_DURATION = 5.875;
export const CYCLE_DURATION = TOTAL_SEGMENTS * SEGMENT_DURATION; // 8289.625s

export const SHOWS = [
  { start: 6, end: 10, id: "breakfast", title: "Breakfast", presenter: "Callum & Rhys" },
  { start: 10, end: 15, id: "days", title: "Days", presenter: "Sarah Quinn" },
  { start: 15, end: 19, id: "drive", title: "Drive", presenter: "Owen Hart" },
  { start: 19, end: 23, id: "evenings", title: "Evenings", presenter: "Nia Brooks" },
  { start: 23, end: 27, id: "late", title: "Late", presenter: "Tom Hale" },
  { start: 3, end: 6, id: "early", title: "Early", presenter: "Maya Cole" }
];

export const TRACK_SEGMENTS = [
  // Block 1: The Debut Master Tracks (1 - 415)
  { start: 1, end: 34, title: "Play the Whole Thing", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 13, story: "Pure unedited guitar rock energy from first to last bar." },
  { start: 35, end: 68, title: "Play It Twice", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 10, story: "Unapologetic power-chord rocker built for live arenas." },
  { start: 69, end: 107, title: "No Encore", artist: "Kayleigh Merez", vibe: "ballad", energy: "medium", ramp: 9, story: "Emotive midnight indie ballad with delicate guitar bends." },
  { start: 108, end: 145, title: "Call It What It Is", artist: "Kayleigh Merez", vibe: "rock", energy: "medium", ramp: 8, story: "Gritty, uncompromising British rock storytelling." },
  { start: 146, end: 178, title: "No Warm Up", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 7, story: "Instant rock adrenaline diving straight into heavy guitar overdrive." },
  { start: 179, end: 210, title: "Not Half", artist: "Kayleigh Merez", vibe: "rock", energy: "medium", ramp: 12, story: "Edgy guitar swagger with sharp British vocal cadence." },
  { start: 211, end: 247, title: "Same Old Road", artist: "Kayleigh Merez", vibe: "rock", energy: "medium", ramp: 14, story: "Reflective journey rock track with melodic bass groove." },
  { start: 248, end: 285, title: "We Already Know", artist: "Kayleigh Merez", vibe: "rock", energy: "medium", ramp: 9, story: "Searing post-punk guitar textures with punchy drive." },
  { start: 286, end: 324, title: "All the Way Home", artist: "Kayleigh Merez", vibe: "acoustic", energy: "chill", ramp: 11, story: "Soulful acoustic ballad written on the Pacific Coast Highway." },
  { start: 325, end: 363, title: "Down the Front", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 15, story: "Passionate gig anthem dedicated to front-row indie music lovers." },
  { start: 364, end: 415, title: "Never Say My Name", artist: "Leah Carter", vibe: "ballad", energy: "chill", ramp: 10, story: "Heartbreaking acoustic ballad with lush vocal layering." },

  // Block 2: Master Singles Addition (416 - 861)
  { start: 416, end: 463, title: "Thunder Queen", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 14, story: "Kayleigh's roaring vintage Gibson Les Paul riff hitting the rock post." },
  { start: 464, end: 515, title: "Wrong Kind of Right", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 10, story: "Punchy, driving rock groove with soaring lead vocal." },
  { start: 516, end: 565, title: "Lola's the Fire in the Wire", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 11, story: "Electric tribute celebrating Kayleigh's California love and rock soul." },
  { start: 566, end: 605, title: "The Highway Don't Lie", artist: "Leah Carter", vibe: "country", energy: "medium", ramp: 12, story: "Leah's open-road Americana anthem driven by acoustic rhythm." },
  { start: 606, end: 645, title: "The Ranch", artist: "Leah Carter", vibe: "country", energy: "medium", ramp: 11, story: "Upbeat country rock celebrating rural independence." },
  { start: 646, end: 675, title: "Same Old Shadow", artist: "Leah Carter", vibe: "country", energy: "chill", ramp: 14, story: "Atmospheric acoustic country noir." },
  { start: 676, end: 714, title: "The Last Good Year", artist: "Leah Carter", vibe: "ballad", energy: "chill", ramp: 13, story: "Nostalgic reflection on youth, songwriting, and shared time." },
  { start: 715, end: 757, title: "Calluses on These Hands", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 10, story: "Working musician's pride in honest craftsmanship." },
  { start: 758, end: 795, title: "My Own Two Feet", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 11, story: "Empowering pop anthem with driving acoustic strum." },
  { start: 796, end: 821, title: "Whiskey on a Wednesday", artist: "Leah Carter", vibe: "country", energy: "medium", ramp: 12, story: "Midweek roots-rocker with sharp wit and infectious tempo." },
  { start: 822, end: 861, title: "Not That Girl", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 12, story: "Defiant pop-country statement of artistic autonomy." },

  // Block 3: Expanded Desktop Collection & Downloads Masters (862 - 1411)
  { start: 862, end: 891, title: "Bubblegum in the Rain", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 13, story: "Bright acoustic pop with infectious hook and feel-good sunshine." },
  { start: 892, end: 922, title: "Pocket Full of Stars", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 11, story: "Uplifting feel-good daytime anthem with chiming guitar arpeggios." },
  { start: 923, end: 960, title: "Kindness Wins", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 10, story: "Warm, heartwarming acoustic songwriting with honest lyrical craft." },
  { start: 961, end: 989, title: "Take My Hand", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 9, story: "Sweeping romantic pop melody with acoustic warmth." },
  { start: 990, end: 1026, title: "Echoes in My Room", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 14, story: "Intimate late-night acoustic contemplation and vocal harmony." },
  { start: 1027, end: 1057, title: "The Hard Part", artist: "Leah Carter", vibe: "ballad", energy: "chill", ramp: 12, story: "Vulnerable, poignant lyrics over soft piano and fingerpicked guitar." },
  { start: 1058, end: 1095, title: "Gold on the Water", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 16, story: "Gentle fingerpicked sunrise acoustic ballad." },
  { start: 1096, end: 1131, title: "The Last Stool at the Bar", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 15, story: "Late-night country tavern ballad with aching pedal steel tones." },
  { start: 1132, end: 1171, title: "Golden, Actually", artist: "Leah Carter & Zach Rivera", vibe: "pop", energy: "medium", ramp: 14, story: "Lush vocal duet blending country warmth and California pop." },
  { start: 1172, end: 1213, title: "We Dance All Night", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 12, story: "Euphoric uptempo pop celebration with country flair." },
  { start: 1214, end: 1254, title: "Gravel and Goodbye", artist: "Leah Carter", vibe: "country", energy: "chill", ramp: 13, story: "Heartfelt acoustic farewell on rural UK roads." },
  { start: 1255, end: 1297, title: "Cherry Red", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 12, story: "High-octane British indie rock with crisp Telecaster drive." },
  { start: 1298, end: 1341, title: "Guitar Speaks", artist: "Kayleigh Merez", vibe: "rock", energy: "high", ramp: 16, story: "Intricate guitar wizardry showcasing Kayleigh's signature fretwork." },
  { start: 1342, end: 1365, title: "Harbour of Ashes", artist: "Leah Carter", vibe: "acoustic", energy: "chill", ramp: 15, story: "Moody coastal reflection recorded by the Atlantic." },
  { start: 1366, end: 1411, title: "Is This It? (What Am I Here For)", artist: "Leah Carter", vibe: "pop", energy: "medium", ramp: 11, story: "Existential pop questioning with dynamic chorus lift." }
];

// Helper to look up the show active at a given Unix timestamp in seconds
export function getShowAt(sec) {
  const d = new Date(sec * 1000);
  const clockStr = d.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
  const hour = parseInt(clockStr.split(":")[0], 10);
  return SHOWS.find(s => {
    if (s.start <= s.end) return hour >= s.start && hour < s.end;
    return hour >= s.start || hour < (s.end % 24);
  }) || SHOWS[0];
}

// Helper to format UK clock and dates
export function formatUKTime(sec) {
  const d = new Date(sec * 1000);
  return d.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatUKDate(sec) {
  const d = new Date(sec * 1000);
  return d.toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" });
}

export function formatDuration(sec) {
  const whole = Math.round(sec);
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
