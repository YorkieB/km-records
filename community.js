// KM Records Community Hub: The Green Room & Discussion Boards
// Revamped, ultra-responsive, zero-flicker live lounge with multi-tab sync,
// audio FX, message reactions, live radio tracking, and offline persistence.
(function () {
  "use strict";

  const AVATARS = ["🎸", "⚡", "🌾", "🎤", "📻", "✨", "🎧", "🔥", "☕", "👏", "⭐", "🖤", "🎶", "💿", "🎙️", "👑"];

  const CATALOGUE = [
    { title: "Thunder Queen", artist: "Kayleigh Merez" },
    { title: "The Highway Don't Lie", artist: "Leah Carter" },
    { title: "Cherry Red", artist: "Kayleigh Merez" },
    { title: "Bubblegum in the Rain", artist: "Leah Carter" },
    { title: "Wrong Kind of Right", artist: "Kayleigh Merez" },
    { title: "Pocket Full of Stars", artist: "Leah Carter" },
    { title: "Guitar Speaks", artist: "Kayleigh Merez" },
    { title: "Kindness Wins", artist: "Leah Carter" },
    { title: "Lola's the Fire in the Wire", artist: "Kayleigh Merez" },
    { title: "Take My Hand", artist: "Leah Carter" },
    { title: "No Encore", artist: "Kayleigh Merez" },
    { title: "Echoes in My Room", artist: "Leah Carter" },
    { title: "Call It What It Is", artist: "Kayleigh Merez" },
    { title: "The Hard Part", artist: "Leah Carter" },
    { title: "No Warm Up", artist: "Kayleigh Merez" },
    { title: "Gold on the Water", artist: "Leah Carter" },
    { title: "Not Half", artist: "Kayleigh Merez" },
    { title: "The Last Stool at the Bar", artist: "Leah Carter" },
    { title: "Play It Twice", artist: "Kayleigh Merez" },
    { title: "Golden, Actually", artist: "Leah Carter & Zach Rivera" },
    { title: "Same Old Road", artist: "Kayleigh Merez" },
    { title: "We Dance All Night", artist: "Leah Carter" },
    { title: "All the Way Home", artist: "Kayleigh Merez" },
    { title: "Gravel and Goodbye", artist: "Leah Carter" },
    { title: "Down the Front", artist: "Kayleigh Merez" },
    { title: "The Ranch", artist: "Leah Carter" },
    { title: "Play the Whole Thing", artist: "Kayleigh Merez" },
    { title: "Calluses on These Hands", artist: "Leah Carter" },
    { title: "We Already Know", artist: "Kayleigh Merez" },
    { title: "Whiskey on a Wednesday", artist: "Leah Carter" },
    { title: "Same Old Shadow", artist: "Leah Carter" },
    { title: "My Own Two Feet", artist: "Leah Carter" },
    { title: "The Last Good Year", artist: "Leah Carter" },
    { title: "Not That Girl", artist: "Leah Carter" },
    { title: "Never Say My Name", artist: "Leah Carter" },
    { title: "Harbour of Ashes", artist: "Leah Carter" },
    { title: "Is This It? (What Am I Here For)", artist: "Leah Carter" },
    { title: "Let It Ring", artist: "Leah Carter" },
    { title: "Come Back Louder", artist: "Leah Carter" }
  ];

  const SHOWS = [
    { start: 6, end: 10, title: "Breakfast", presenter: "Callum & Rhys" },
    { start: 10, end: 15, title: "Days", presenter: "Sarah Quinn" },
    { start: 15, end: 19, title: "Drive", presenter: "Owen Hart" },
    { start: 19, end: 23, title: "Evenings", presenter: "Nia Brooks" },
    { start: 23, end: 27, title: "Late", presenter: "Tom Hale" },
    { start: 3, end: 6, title: "Early", presenter: "Maya Cole" }
  ];

  const SEED_MESSAGES = [
    {
      id: "msg_seed_daisy",
      author: "Daisy",
      avatar: "🌼",
      badge: "HOST",
      text: "Daisy here in the lounge! 🌼 Tuning in live with everyone. Tag me with @Daisy or drop your favourite track thoughts anytime—let's keep the music flowing!",
      timestamp: Date.now() - 3600000 * 1.8,
      reactions: { "❤️": 16, "✨": 8 }
    },
    {
      id: "msg_seed_1",
      author: "Sarah [Moderator]",
      avatar: "🎧",
      badge: "MOD",
      text: "Welcome to the KM Green Room! The 24/7 stream is live from London. Drop your thoughts & shoutouts below!",
      timestamp: Date.now() - 3600000 * 2,
      reactions: { "❤️": 14, "👏": 9 }
    },
    {
      id: "msg_seed_2",
      author: "HendrixFan77",
      avatar: "🎸",
      badge: "FAN",
      text: "Kayleigh's solo on 'Thunder Queen' gave me absolute chills! Pure rock lineage.",
      timestamp: Date.now() - 3600000 * 1.5,
      reactions: { "🔥": 18, "🎸": 12 }
    },
    {
      id: "msg_seed_3",
      author: "CaliGirl_Sam",
      avatar: "✨",
      badge: "FAN",
      text: "The sound quality on this stream is amazing. Love that the radio plays non-stop in the background.",
      timestamp: Date.now() - 3600000 * 1,
      reactions: { "❤️": 8, "✨": 6 }
    },
    {
      id: "msg_seed_4",
      author: "Owen [Drive Presenter]",
      avatar: "📻",
      badge: "PRESENTER",
      text: "Owen here from the Drive show! What's everyone's favourite track from Leah's new desktop collection?",
      timestamp: Date.now() - 1800000,
      reactions: { "📻": 7, "❤️": 13 }
    },
    {
      id: "msg_seed_5",
      author: "AcousticDrifter",
      avatar: "🌾",
      badge: "FAN",
      text: "'Bubblegum in the Rain' and 'Gravel and Goodbye' are on repeat for me. Leah's storytelling is unmatched.",
      timestamp: Date.now() - 600000,
      reactions: { "🌾": 6, "❤️": 11 }
    }
  ];

  // User Profile State
  let userProfile = {
    name: "Kayleigh",
    avatar: "🎸",
    badge: "ARTIST"
  };

  try {
    const saved = localStorage.getItem("km_user_profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name) userProfile.name = parsed.name;
      if (parsed.avatar) userProfile.avatar = parsed.avatar;
      if (parsed.badge) userProfile.badge = parsed.badge;
    } else {
      localStorage.setItem("km_user_profile", JSON.stringify(userProfile));
    }
  } catch (e) {}

  // Audio FX state
  let soundEnabled = true;
  try {
    const savedSound = localStorage.getItem("km_chat_sound");
    if (savedSound !== null) soundEnabled = savedSound === "true";
  } catch (e) {}

  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playUiSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "send") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "receive") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(783.99, now); // G5
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.14); // C5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === "react") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1); // C6
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {}
  }

  // Cross-tab broadcast channel
  let broadcastChannel = null;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      broadcastChannel = new BroadcastChannel("km_community_chat");
    }
  } catch (e) {}

  // App State
  let activeTab = "chat";
  let currentCategory = "all";
  let activeTopicId = null;
  let chatMessages = [];
  let renderedMessageIds = new Set();
  let typingTimeout = null;
  let currentSpinningTrack = null;

  // DOM Elements
  const tabChatBtn = document.getElementById("tab-chat-btn");
  const tabForumBtn = document.getElementById("tab-forum-btn");
  const tabChatPane = document.getElementById("tab-chat-pane");
  const tabForumPane = document.getElementById("tab-forum-pane");
  
  const userAvatarDisplay = document.getElementById("user-avatar-display");
  const userNameDisplay = document.getElementById("user-name-display");
  const userBadgeDisplay = document.getElementById("user-badge-display");
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const profileModal = document.getElementById("profile-modal");
  const profileNameInput = document.getElementById("profile-name-input");
  const profileBadgeSelect = document.getElementById("profile-badge-select");
  const avatarGrid = document.getElementById("avatar-grid");
  const saveProfileBtn = document.getElementById("save-profile-btn");
  const closeProfileModalBtn = document.getElementById("close-profile-modal-btn");
  const chatSoundToggle = document.getElementById("chat-sound-toggle");
  const presenceCountText = document.getElementById("presence-count-text");

  // Chat Elements
  const chatContainer = document.getElementById("chat-container");
  const chatMessagesList = document.getElementById("chat-messages-list");
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatCharCount = document.getElementById("chat-char-count");
  const chatRadioTrack = document.getElementById("chat-radio-track");
  const chatScrollBottomBtn = document.getElementById("chat-scroll-bottom-btn");
  const chatTypingIndicator = document.getElementById("chat-typing-indicator");
  const typingText = document.getElementById("typing-text");
  const floatingReactionContainer = document.getElementById("floating-reaction-container");

  // Forum Elements
  const forumTopicsView = document.getElementById("forum-topics-view");
  const forumTopicDetailView = document.getElementById("forum-topic-detail-view");
  const forumTopicsList = document.getElementById("forum-topics-list");
  const newTopicBtn = document.getElementById("new-topic-btn");
  const newTopicModal = document.getElementById("new-topic-modal");
  const closeNewTopicModalBtn = document.getElementById("close-new-topic-modal-btn");
  const newTopicForm = document.getElementById("new-topic-form");
  const backToTopicsBtn = document.getElementById("back-to-topics-btn");
  const topicDetailContainer = document.getElementById("topic-detail-container");
  const replyInput = document.getElementById("reply-input");
  const replySendBtn = document.getElementById("reply-send-btn");

  // Format timestamp
  function timeAgo(ts) {
    if (!ts) return "just now";
    const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (sec < 45) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return min + "m ago";
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + "h ago";
    return Math.floor(hr / 24) + "d ago";
  }

  // Update profile UI
  function updateProfileUI() {
    if (userAvatarDisplay) userAvatarDisplay.textContent = userProfile.avatar;
    if (userNameDisplay) userNameDisplay.textContent = userProfile.name;
    if (userBadgeDisplay) {
      userBadgeDisplay.textContent = userProfile.badge;
      userBadgeDisplay.className = "badge " + (userProfile.badge ? userProfile.badge.toLowerCase() : "fan");
    }
    const authorPreview = document.getElementById("chat-author-preview");
    if (authorPreview) {
      authorPreview.textContent = userProfile.avatar + " " + userProfile.name;
    }
  }

  // Sound Toggle UI
  function updateSoundUI() {
    if (chatSoundToggle) {
      chatSoundToggle.textContent = soundEnabled ? "🔔 Sound On" : "🔕 Sound Off";
      chatSoundToggle.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
    }
  }

  if (chatSoundToggle) {
    chatSoundToggle.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      try {
        localStorage.setItem("km_chat_sound", String(soundEnabled));
      } catch (e) {}
      updateSoundUI();
      if (soundEnabled) playUiSound("send");
    });
  }

  // Init Avatar Selection Grid
  function initAvatarGrid() {
    if (!avatarGrid) return;
    avatarGrid.innerHTML = "";
    AVATARS.forEach(av => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "avatar-opt" + (av === userProfile.avatar ? " active" : "");
      btn.textContent = av;
      btn.addEventListener("click", () => {
        avatarGrid.querySelectorAll(".avatar-opt").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
      avatarGrid.appendChild(btn);
    });
  }

  // Open / Close Profile Modal
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      profileNameInput.value = userProfile.name;
      if (profileBadgeSelect) profileBadgeSelect.value = userProfile.badge || "FAN";
      initAvatarGrid();
      profileModal.classList.add("open");
    });
  }
  if (closeProfileModalBtn) {
    closeProfileModalBtn.addEventListener("click", () => {
      profileModal.classList.remove("open");
    });
  }
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", () => {
      const newName = (profileNameInput.value || "").trim().slice(0, 25);
      const selAvatar = avatarGrid.querySelector(".avatar-opt.active");
      if (newName) userProfile.name = newName;
      if (selAvatar) userProfile.avatar = selAvatar.textContent;
      if (profileBadgeSelect) userProfile.badge = profileBadgeSelect.value;
      if (userProfile.name.toLowerCase().includes("kayleigh")) {
        userProfile.badge = "ARTIST";
        userProfile.avatar = "🎸";
      }
      try {
        localStorage.setItem("km_user_profile", JSON.stringify(userProfile));
      } catch (e) {}
      updateProfileUI();
      profileModal.classList.remove("open");
    });
  }

  // Tab Switching
  if (tabChatBtn && tabForumBtn) {
    tabChatBtn.addEventListener("click", () => {
      activeTab = "chat";
      tabChatBtn.classList.add("active");
      tabChatBtn.setAttribute("aria-selected", "true");
      tabForumBtn.classList.remove("active");
      tabForumBtn.setAttribute("aria-selected", "false");
      tabChatPane.classList.remove("hidden");
      tabForumPane.classList.add("hidden");
      scrollChatToBottom(true);
    });
    tabForumBtn.addEventListener("click", () => {
      activeTab = "forum";
      tabForumBtn.classList.add("active");
      tabForumBtn.setAttribute("aria-selected", "true");
      tabChatBtn.classList.remove("active");
      tabChatBtn.setAttribute("aria-selected", "false");
      tabForumPane.classList.remove("hidden");
      tabChatPane.classList.add("hidden");
      fetchForumTopics();
    });
  }

  // Floating Reaction Particle Effect
  function spawnFloatingEmoji(emoji) {
    if (!floatingReactionContainer) return;
    const p = document.createElement("div");
    p.className = "floating-particle";
    p.textContent = emoji;
    const randomOffset = (Math.random() - 0.5) * 40;
    p.style.left = (35 + randomOffset) + "px";
    floatingReactionContainer.appendChild(p);
    setTimeout(() => {
      p.remove();
    }, 2000);
  }

  // Load / Store Local Messages
  function loadLocalMessages() {
    try {
      const stored = localStorage.getItem("km_chat_messages_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return [...SEED_MESSAGES];
  }

  function saveLocalMessages(msgs) {
    try {
      localStorage.setItem("km_chat_messages_v2", JSON.stringify(msgs.slice(-100)));
    } catch (e) {}
  }

  // Check if scrolled near bottom
  function isNearBottom() {
    if (!chatMessagesList) return true;
    return chatMessagesList.scrollHeight - chatMessagesList.scrollTop - chatMessagesList.clientHeight <= 120;
  }

  function scrollChatToBottom(force) {
    if (!chatMessagesList) return;
    chatMessagesList.scrollTo({
      top: chatMessagesList.scrollHeight,
      behavior: force ? "auto" : "smooth"
    });
    if (chatScrollBottomBtn) chatScrollBottomBtn.classList.add("hidden");
  }

  if (chatMessagesList) {
    chatMessagesList.addEventListener("scroll", () => {
      if (isNearBottom()) {
        if (chatScrollBottomBtn) chatScrollBottomBtn.classList.add("hidden");
      }
    });
  }

  if (chatScrollBottomBtn) {
    chatScrollBottomBtn.addEventListener("click", () => {
      scrollChatToBottom(false);
    });
  }

  // Build / Update Single Message Node
  function createMessageElement(msg) {
    const item = document.createElement("div");
    item.className = "chat-msg" + (msg.author === userProfile.name ? " self" : "");
    item.dataset.msgId = msg.id;

    let badgeHtml = "";
    const b = (msg.badge || "").toUpperCase();
    if (b === "MOD") badgeHtml = `<span class="badge mod">MOD</span>`;
    else if (b === "PRESENTER" || b === "ON AIR") badgeHtml = `<span class="badge presenter">ON AIR</span>`;
    else if (b === "ARTIST") badgeHtml = `<span class="badge artist">ARTIST</span>`;
    else if (b === "HOST") badgeHtml = `<span class="badge host">HOST</span>`;
    else if (b === "LABEL") badgeHtml = `<span class="badge label">LABEL</span>`;
    else if (b === "VIP") badgeHtml = `<span class="badge vip">VIP</span>`;

    item.innerHTML = `
      <div class="msg-avatar">${msg.avatar || "🎸"}</div>
      <div class="msg-body">
        <div class="msg-header">
          <span class="msg-author">${msg.author}</span>
          ${badgeHtml}
          <span class="msg-time" data-ts="${msg.timestamp}">${timeAgo(msg.timestamp)}</span>
        </div>
        <div class="msg-text">${msg.text}</div>
        <div class="msg-reactions" id="reactions-${msg.id}"></div>
        <div class="msg-quick-react-bar">
          <button type="button" class="quick-react-btn" data-emoji="❤️" title="Heart">❤️</button>
          <button type="button" class="quick-react-btn" data-emoji="🔥" title="Fire">🔥</button>
          <button type="button" class="quick-react-btn" data-emoji="🎸" title="Guitar">🎸</button>
          <button type="button" class="quick-react-btn" data-emoji="👏" title="Clap">👏</button>
        </div>
      </div>
    `;

    // Quick react buttons
    item.querySelectorAll(".quick-react-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        reactToMessage(msg.id, btn.dataset.emoji);
      });
    });

    renderReactions(item.querySelector(".msg-reactions"), msg);
    return item;
  }

  function renderReactions(container, msg) {
    if (!container) return;
    container.innerHTML = "";
    if (!msg.reactions) return;
    Object.entries(msg.reactions).forEach(([emoji, count]) => {
      if (count <= 0) return;
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "msg-reaction-pill";
      pill.innerHTML = `<span>${emoji}</span> <span>${count}</span>`;
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        reactToMessage(msg.id, emoji);
      });
      container.appendChild(pill);
    });
  }

  // Smart Non-Destructive Render (Zero-Flicker)
  function renderMessages(messages, shouldScroll) {
    if (!chatMessagesList) return;
    const wasNearBottom = isNearBottom();

    messages.forEach(msg => {
      if (!renderedMessageIds.has(msg.id)) {
        const el = createMessageElement(msg);
        chatMessagesList.appendChild(el);
        renderedMessageIds.add(msg.id);
      } else {
        // Update reaction counts in place
        const msgEl = chatMessagesList.querySelector(`[data-msg-id="${msg.id}"]`);
        if (msgEl) {
          const rContainer = msgEl.querySelector(".msg-reactions");
          renderReactions(rContainer, msg);
        }
      }
    });

    if (shouldScroll || wasNearBottom) {
      scrollChatToBottom(false);
    } else if (chatScrollBottomBtn) {
      chatScrollBottomBtn.classList.remove("hidden");
    }
  }

  // Update timestamps every 30s
  setInterval(() => {
    document.querySelectorAll(".msg-time[data-ts]").forEach(el => {
      const ts = parseInt(el.getAttribute("data-ts"), 10);
      if (ts) el.textContent = timeAgo(ts);
    });
  }, 30000);

  // React to a Message
  async function reactToMessage(msgId, emoji) {
    const msg = chatMessages.find(m => m.id === msgId);
    if (!msg) return;
    if (!msg.reactions) msg.reactions = {};
    msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;

    // Update in DOM
    const msgEl = chatMessagesList.querySelector(`[data-msg-id="${msgId}"]`);
    if (msgEl) {
      renderReactions(msgEl.querySelector(".msg-reactions"), msg);
    }

    saveLocalMessages(chatMessages);
    playUiSound("react");
    spawnFloatingEmoji(emoji);

    // Cross-tab broadcast
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "reaction", messageId: msgId, emoji });
    }

    // Try API
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "react", messageId: msgId, emoji })
      });
    } catch (e) {}
  }

  // Fetch / Sync Chat Messages from API
  async function fetchChatMessages(initial) {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.messages) && data.messages.length > 0) {
          // Merge with local messages
          const incoming = data.messages;
          const merged = [...chatMessages];
          incoming.forEach(inc => {
            const existing = merged.find(m => m.id === inc.id);
            if (!existing) {
              merged.push(inc);
            } else {
              existing.reactions = inc.reactions || existing.reactions;
            }
          });
          chatMessages = merged;
          saveLocalMessages(chatMessages);
          renderMessages(chatMessages, initial);
          return;
        }
      }
    } catch (e) {}

    // Fallback: render current state
    renderMessages(chatMessages, initial);
  }

  // Optimistic Message Sending
  async function sendChatMessage() {
    const text = (chatInput.value || "").trim();
    if (!text) return;

    chatSendBtn.disabled = true;
    chatInput.value = "";
    updateCharCount();

    const newMsg = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      author: userProfile.name,
      avatar: userProfile.avatar,
      badge: userProfile.badge,
      text,
      timestamp: Date.now(),
      reactions: {}
    };

    chatMessages.push(newMsg);
    saveLocalMessages(chatMessages);
    renderMessages(chatMessages, true);
    playUiSound("send");
    chatSendBtn.disabled = false;
    chatInput.focus();

    // Broadcast cross-tab
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "new_message", message: newMsg });
    }

    // Post to API
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          author: userProfile.name,
          avatar: userProfile.avatar,
          badge: userProfile.badge
        })
      });
    } catch (e) {}

    // Trigger Daisy AI Host response or lounge chatter
    triggerDaisyResponse(text, userProfile.name, newMsg.id);
  }

  // Listen to cross-tab broadcasts
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      const { type, message, messageId, emoji } = event.data || {};
      if (type === "new_message" && message) {
        if (!chatMessages.find(m => m.id === message.id)) {
          chatMessages.push(message);
          saveLocalMessages(chatMessages);
          renderMessages(chatMessages, false);
          playUiSound("receive");
        }
      } else if (type === "reaction" && messageId && emoji) {
        const msg = chatMessages.find(m => m.id === messageId);
        if (msg) {
          if (!msg.reactions) msg.reactions = {};
          msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
          const msgEl = chatMessagesList.querySelector(`[data-msg-id="${messageId}"]`);
          if (msgEl) renderReactions(msgEl.querySelector(".msg-reactions"), msg);
        }
      }
    };
  }

  // Simulated Typing & Room Chatter
  function showTyping(name) {
    if (!chatTypingIndicator || !typingText) return;
    typingText.textContent = `${name} is typing...`;
    chatTypingIndicator.classList.remove("hidden");
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      chatTypingIndicator.classList.add("hidden");
    }, 2400);
  }

  // --- DAISY AI GREEN ROOM HOST & CONVERSATION ENGINE ---
  const DAISY_PROFILE = {
    name: "Daisy",
    avatar: "🌼",
    badge: "HOST"
  };

  const DAISY_STARTERS = [
    "Quick question for the lounge: if you had to pick one track to introduce someone to Leah Carter, what's your go-to? Mine has to be 'Pocket Full of Stars' ✨",
    "That guitar tone on 'Thunder Queen' always gets me. Kayleigh's solo around 2:10 is pure rock lineage. Who else is practicing this riff at home? 🎸",
    "Spinning into the live stream! What's everyone's favourite late-night comfort track from the KM catalogue?",
    "Does anyone know if Kayleigh recorded 'Guitar Speaks' on her Gibson Les Paul or the vintage Telecaster? That bridge arpeggio is so clean!",
    "Who here plays an instrument? Kayleigh's solos have inspired half of our listeners to pick up electric guitars this season! ⚡",
    "Welcome to everyone tuning in from across the UK and California! What's the weather doing where you are today? Rainy vibes here in London ☕",
    "Leah's lyric writing on 'Same Old Road' hits so deep. What's a lyric from the catalogue that's been stuck in your head lately?",
    "If you could see Kayleigh and Leah play an intimate acoustic set anywhere in the world, where would your dream gig be? 🌾"
  ];

  let lastChatActivityTs = Date.now();
  let daisyStarterIndex = 0;

  function generateDaisyReply(userText, authorName) {
    const text = (userText || "").toLowerCase();
    const currentTrack = (currentSpinningTrack && currentSpinningTrack.title) || "";

    // 1. Who is Daisy?
    if (text.includes("who are you") || text.includes("what are you") || text.includes("what do you do")) {
      return `Hey ${authorName}! I'm Daisy, your resident Green Room host here at KM Records. I hang out in the lounge, chat about all the tracks spinning on our 24/7 London radio stream, and keep the good vibes flowing! What brings you into the studio today? 🌼`;
    }

    // 2. Greetings
    if (text.startsWith("hi") || text.startsWith("hello") || text.startsWith("hey") || text.includes("good morning") || text.includes("good evening") || text.includes("good afternoon")) {
      return `Hey ${authorName}! 🌼 Lovely to have you in the Green Room. What track are you hoping to hear spun next on the radio?`;
    }

    // 3. Specific track discussions
    if (text.includes("thunder queen")) {
      return `Oh, 'Thunder Queen' is an absolute titan! That soaring Les Paul overdrive on the outro gives me goosebumps every single time. Have you tried playing that solo, ${authorName}? 🎸`;
    }
    if (text.includes("bubblegum") || text.includes("bubblegum in the rain")) {
      return `'Bubblegum in the Rain' is pure acoustic sunshine mixed with honest storytelling! Leah's vocal harmonies on the bridge are simply unmatched. Do you prefer her acoustic ballads or the uptempo tracks? 🌾`;
    }
    if (text.includes("cherry red")) {
      return `'Cherry Red' has that unmistakable Camden indie rock crunch! You can really hear the bite of the bridge pickup. What's your favourite rock anthem from Kayleigh? ⚡`;
    }
    if (text.includes("guitar speaks")) {
      return `'Guitar Speaks' is pure technical wizardry! It's one of those rare instrumentals where every bar tells a distinct story. What did you think of the key change at 1:45? 🎶`;
    }
    if (text.includes("gravel and goodbye") || text.includes("gravel")) {
      return `'Gravel and Goodbye' has that bittersweet open-road Americana feel. Leah actually penned the lyrics while watching the dawn mist over rural England. Does the pedal steel in that song get you too? ❤️`;
    }
    if (text.includes("pocket full of stars") || text.includes("stars")) {
      return `'Pocket Full of Stars' is guaranteed to lift any mood! Those chiming acoustic arpeggios in the intro set such an uplifting tone. What's your go-to feel-good song on the stream? ✨`;
    }

    // 4. Guitar & Equipment Talk
    if (text.includes("guitar") || text.includes("solo") || text.includes("riff") || text.includes("telecaster") || text.includes("les paul") || text.includes("pedal") || text.includes("tone") || text.includes("amp")) {
      return `Kayleigh's tone recipe is all about valve tube saturation, custom handwound pickups, and dynamic fingerpicking attack! Are you a guitarist yourself, ${authorName}, or just a dedicated rock connoisseur? 🎸`;
    }

    // 5. Radio & Sound Quality
    if (text.includes("sound") || text.includes("stream") || text.includes("radio") || text.includes("dj") || text.includes("presenter") || text.includes("owen") || text.includes("sarah")) {
      return `Our London broadcast team spends hours mastering every live transition and jingle. The lossless stream sounds incredible through a proper pair of headphones! How are you listening today? 🎧`;
    }

    // 6. Direct Questions
    if (text.includes("?")) {
      if (text.includes("favourite") || text.includes("favorite") || text.includes("recommend")) {
        return `Tough choice, but for Kayleigh I always recommend 'Thunder Queen' for peak adrenaline, and for Leah, 'Bubblegum in the Rain' for the sweetest lyrics! What's topping your personal playlist right now, ${authorName}? 📻`;
      }
      return `That's such an interesting question, ${authorName}! I think Kayleigh and Leah's artistic balance is what makes KM Records so special—raw British rock meets heartfelt storytelling. What do you reckon? 🌼`;
    }

    // 7. Praise & General statements
    if (text.includes("love") || text.includes("amazing") || text.includes("great") || text.includes("fire") || text.includes("chills") || text.includes("incredible") || text.includes("best")) {
      const trackRef = currentTrack ? `'${currentTrack}'` : "this stream";
      return `Couldn't agree more, ${authorName}! ${trackRef} brings such brilliant energy to the Green Room. Are you listening while working, or just relaxing with the music? ☕`;
    }

    // 8. Default engaging response with follow-up
    const currentMsg = currentTrack ? `spinning '${currentTrack}'` : "tuning in live from London";
    const defaults = [
      `That's so true, ${authorName}! We're ${currentMsg} right now. What's the standout moment for you so far? 🎸`,
      `Always love seeing your thoughts in the lounge, ${authorName}! What other KM tracks are on your heavy rotation? ✨`,
      `Spot on! The Green Room community has such incredible taste in rock and acoustic songwriting. Who introduced you to KM Records? 🌼`,
      `That resonates so much! Kayleigh's overdrive and Leah's lyrics make every track feel like home. What's your favourite lyric so far? 🌾`
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  // Daisy response trigger
  async function triggerDaisyResponse(userText, authorName, userMsgId) {
    lastChatActivityTs = Date.now();
    const isDirectMention = (userText || "").toLowerCase().includes("daisy") || (userText || "").toLowerCase().includes("@daisy");
    const hasQuestion = (userText || "").includes("?");

    // Daisy often reacts to the user's message with love or fire!
    if (userMsgId && Math.random() < 0.85) {
      setTimeout(() => {
        const emojis = ["❤️", "🔥", "🎸", "👏"];
        const pick = emojis[Math.floor(Math.random() * emojis.length)];
        reactToMessage(userMsgId, pick);
      }, 900);
    }

    // Decide if Daisy responds
    const shouldRespond = isDirectMention || hasQuestion || Math.random() < 0.7;
    if (!shouldRespond) {
      scheduleFanResponse(userText, authorName);
      return;
    }

    // Typing delay
    const typingDelay = 1300 + Math.random() * 1000;
    setTimeout(() => {
      showTyping("🌼 Daisy");
    }, typingDelay);

    const replyDelay = typingDelay + 1700 + Math.random() * 800;
    setTimeout(async () => {
      let replyText = "";
      
      // Attempt backend Cloudflare Workers AI call
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ai_reply",
            prompt: userText,
            author: authorName,
            song: (currentSpinningTrack && currentSpinningTrack.title) || ""
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.message && data.message.text) {
            replyText = data.message.text;
          }
        }
      } catch (e) {}

      // Fallback to Daisy's smart client conversational engine
      if (!replyText) {
        replyText = generateDaisyReply(userText, authorName);
      }

      const daisyMsg = {
        id: "msg_daisy_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        author: DAISY_PROFILE.name,
        avatar: DAISY_PROFILE.avatar,
        badge: DAISY_PROFILE.badge,
        text: replyText,
        timestamp: Date.now(),
        reactions: { "❤️": 2, "✨": 1 }
      };

      chatMessages.push(daisyMsg);
      saveLocalMessages(chatMessages);
      renderMessages(chatMessages, true);
      playUiSound("receive");

      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: "new_message", message: daisyMsg });
      }
    }, replyDelay);
  }

  // Backup fellow fan response
  function scheduleFanResponse(userText, authorName) {
    const responders = [
      { name: "HendrixFan77", avatar: "🎸", badge: "FAN" },
      { name: "CaliGirl_Sam", avatar: "✨", badge: "FAN" },
      { name: "AcousticDrifter", avatar: "🌾", badge: "FAN" }
    ];
    const responder = responders[Math.floor(Math.random() * responders.length)];

    setTimeout(() => {
      showTyping(responder.avatar + " " + responder.name);
    }, 2200);

    setTimeout(() => {
      const currentTitle = (currentSpinningTrack && currentSpinningTrack.title) || "the live stream";
      const responses = [
        `Totally agree with you, ${authorName}! ${currentTitle} sounds incredible today.`,
        `Loving the conversation in the Green Room today! 🎸`,
        `That guitar tone never fails to blow me away. Pure rock soul!`,
        `Big shoutout to everyone tuned in! ${currentTitle} is pure genius.`
      ];
      const botMsg = {
        id: "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        author: responder.name,
        avatar: responder.avatar,
        badge: responder.badge,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now(),
        reactions: { "❤️": 2 }
      };
      chatMessages.push(botMsg);
      saveLocalMessages(chatMessages);
      renderMessages(chatMessages, true);
      playUiSound("receive");
    }, 4500);
  }

  // Daisy proactively starts a conversation topic if chat is quiet for 65s
  function startDaisyConversationKeeper() {
    setInterval(() => {
      if (activeTab !== "chat") return;
      const idleTime = Date.now() - lastChatActivityTs;
      if (idleTime > 65000) {
        lastChatActivityTs = Date.now();
        showTyping("🌼 Daisy");
        setTimeout(() => {
          const starterText = DAISY_STARTERS[daisyStarterIndex % DAISY_STARTERS.length];
          daisyStarterIndex++;
          const starterMsg = {
            id: "msg_daisy_starter_" + Date.now(),
            author: DAISY_PROFILE.name,
            avatar: DAISY_PROFILE.avatar,
            badge: DAISY_PROFILE.badge,
            text: starterText,
            timestamp: Date.now(),
            reactions: { "❤️": 3, "🎸": 2 }
          };
          chatMessages.push(starterMsg);
          saveLocalMessages(chatMessages);
          renderMessages(chatMessages, isNearBottom());
          playUiSound("receive");

          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: "new_message", message: starterMsg });
          }
        }, 2200);
      }
    }, 15000);
  }

  // Dynamic Presence Count (46 to 54)
  let basePresence = 48;
  setInterval(() => {
    if (!presenceCountText) return;
    const delta = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);
    basePresence = Math.min(56, Math.max(44, basePresence + delta));
    presenceCountText.textContent = `${basePresence} fans listening & in the lounge`;
  }, 14000);

  // Quick Emoji in Composer
  document.querySelectorAll(".quick-emoji").forEach(em => {
    em.addEventListener("click", () => {
      chatInput.value += em.textContent;
      chatInput.focus();
      updateCharCount();
    });
  });

  function updateCharCount() {
    if (chatCharCount) {
      const len = (chatInput.value || "").length;
      chatCharCount.textContent = len + " / 300";
      chatCharCount.style.color = len >= 280 ? "#ff2ea6" : "var(--muted)";
    }
  }

  if (chatInput) {
    chatInput.addEventListener("input", updateCharCount);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", sendChatMessage);
  }

  const mentionDaisyBtn = document.getElementById("mention-daisy-btn");
  if (mentionDaisyBtn && chatInput) {
    mentionDaisyBtn.addEventListener("click", () => {
      if (!chatInput.value.includes("@Daisy")) {
        chatInput.value = "@Daisy " + chatInput.value;
      }
      chatInput.focus();
      updateCharCount();
    });
  }

  const mentionDjBtn = document.getElementById("mention-dj-btn");
  if (mentionDjBtn && chatInput) {
    mentionDjBtn.addEventListener("click", () => {
      const activeShow = computeLocalRadio().show;
      const presenterName = (activeShow && activeShow.presenter) ? activeShow.presenter.split(" ")[0] : "DJ";
      const tag = `@${presenterName} `;
      if (!chatInput.value.includes(tag)) {
        chatInput.value = tag + chatInput.value;
      }
      chatInput.focus();
      updateCharCount();
    });
  }

  // Radio Floating Reactions & Chat Shoutout
  document.querySelectorAll(".react-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const em = btn.dataset.emoji || "🔥";
      spawnFloatingEmoji(em);
      playUiSound("react");

      // Auto shoutout in chat
      const songInfo = (currentSpinningTrack && currentSpinningTrack.title) ? `'${currentSpinningTrack.title}'` : "this track";
      const reactions = {
        "🔥": `Loving ${songInfo}! On repeat! 🔥`,
        "🎸": `Those guitar riffs on ${songInfo} are unreal! 🎸`,
        "❤️": `Absolute favourite: ${songInfo} ❤️`,
        "👏": `Pure magic from the KM London studio! 👏`
      };
      if (chatInput) {
        chatInput.value = reactions[em] || `${em} Loving this track!`;
        sendChatMessage();
      }
      btn.style.transform = "scale(1.25)";
      setTimeout(() => { btn.style.transform = "scale(1)"; }, 200);
    });
  });

  // Radio Track Synchronization (API with local London clock fallback)
  function computeLocalRadio() {
    const now = new Date();
    // Get London time
    const ukTimeStr = now.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
    const parts = ukTimeStr.split(":");
    const hr = parseInt(parts[0], 10);

    const show = SHOWS.find(s => {
      if (s.start <= s.end) return hr >= s.start && hr < s.end;
      return hr >= s.start || hr < (s.end % 24);
    }) || SHOWS[0];

    const nowSec = Math.floor(now.getTime() / 1000);
    const rotationIndex = Math.floor(nowSec / 210);
    const track = CATALOGUE[rotationIndex % CATALOGUE.length];
    return { track, show };
  }

  async function syncRadioInfo() {
    let trackTitle = "";
    let trackArtist = "";
    let showTitle = "";
    let presenterName = "";

    try {
      const res = await fetch("/radio/now");
      if (res.ok) {
        const data = await res.json();
        if (data && data.live && data.live.catalogue) {
          trackTitle = data.live.catalogue.title;
          trackArtist = data.live.catalogue.artist;
          showTitle = data.title;
          presenterName = data.presenter;
        }
      }
    } catch (e) {}

    if (!trackTitle) {
      const local = computeLocalRadio();
      trackTitle = local.track.title;
      trackArtist = local.track.artist;
      showTitle = local.show.title;
      presenterName = local.show.presenter;
    }

    currentSpinningTrack = { title: trackTitle, artist: trackArtist };

    if (chatRadioTrack) {
      chatRadioTrack.innerHTML = `
        <span class="live-dot"></span>
        <strong>Spinning Now:</strong> ${trackTitle} — ${trackArtist}
        <span class="show-tag" style="background: rgba(0, 240, 255, 0.15); color: var(--cyan); border: 1px solid rgba(0, 240, 255, 0.4); border-radius: 9999px; padding: 0.15rem 0.5rem; font-size: 0.75rem; font-weight: 700; margin-left: 0.4rem;">📻 ${presenterName} ON AIR — Reading Chat Live</span>
      `;
    }

    const mentionDjBtn = document.getElementById("mention-dj-btn");
    if (mentionDjBtn && presenterName) {
      const shortPres = presenterName.split(" ")[0];
      mentionDjBtn.textContent = `📻 @${shortPres} (On Air)`;
      mentionDjBtn.title = `Ask ${presenterName} for an on-air radio shoutout`;
    }
  }

  // --- FORUM LOGIC (WITH LOCAL PERSISTENCE FALLBACK) ---
  const SEED_TOPICS = [
    {
      id: "topic_1",
      category: "kayleigh",
      categoryLabel: "🎸 Kayleigh Merez",
      title: "What is your favourite Kayleigh Merez guitar solo across the catalogue?",
      author: "HendrixFan77",
      avatar: "🎸",
      badge: "FAN",
      timestamp: Date.now() - 3600000 * 24,
      content: "Between 'Thunder Queen', 'Lola's the Fire in the Wire', and the newly added instrumental 'Guitar Speaks', the guitar work is incredible. Which one has your favourite riff or outro solo?",
      likes: 18,
      replyCount: 2,
      snippet: "Between 'Thunder Queen', 'Lola's the Fire in the Wire', and 'Guitar Speaks'...",
      replies: [
        {
          id: "rep_1_1",
          author: "Maya Cole",
          avatar: "📻",
          badge: "PRESENTER",
          timestamp: Date.now() - 3600000 * 18,
          content: "Guitar Speaks at 1:45 has to be one of the cleanest transition runs I've heard this year. Absolute precision.",
          likes: 12
        },
        {
          id: "rep_1_2",
          author: "Camden_Rocker",
          avatar: "⚡",
          badge: "FAN",
          timestamp: Date.now() - 3600000 * 12,
          content: "Thunder Queen outro solo has unmatched raw energy! And Cherry Red has such a gritty live energy to it too.",
          likes: 9
        }
      ]
    },
    {
      id: "topic_2",
      category: "leah",
      categoryLabel: "🌾 Leah Carter",
      title: "Leah's storytelling in 'Bubblegum in the Rain' & 'Pocket Full of Stars'",
      author: "AcousticDrifter",
      avatar: "🌾",
      badge: "FAN",
      timestamp: Date.now() - 3600000 * 16,
      content: "The imagery in Leah's new singles is so vivid. That mix of raw country melancholy with infectious hooks in 'Bubblegum in the Rain' is brilliant. What line stuck with you the most?",
      likes: 24,
      replyCount: 2,
      snippet: "The imagery in Leah's new singles is so vivid. That mix of raw country melancholy...",
      replies: [
        {
          id: "rep_2_1",
          author: "NashvilleSoul",
          avatar: "❤️",
          badge: "FAN",
          timestamp: Date.now() - 3600000 * 8,
          content: "The contrast between the bright title and the emotional weight in the bridge is classic Leah. She makes every line feel authentic.",
          likes: 14
        },
        {
          id: "rep_2_2",
          author: "CountryRoads",
          avatar: "✨",
          badge: "FAN",
          timestamp: Date.now() - 3600000 * 3,
          content: "Also don't sleep on 'Gravel and Goodbye'. That open road acoustic progression is stunning.",
          likes: 7
        }
      ]
    },
    {
      id: "topic_3",
      category: "radio",
      categoryLabel: "📻 KM Radio & Requests",
      title: "Presenter shoutouts & track requests for the live stream",
      author: "Calum Reed",
      avatar: "📻",
      badge: "PRESENTER",
      timestamp: Date.now() - 3600000 * 10,
      content: "Calum here hosting the Breakfast show! Tell us where in the world you're tuning in from, and let us know which track you want to hear spun next on KM Radio.",
      likes: 31,
      replyCount: 2,
      snippet: "Calum here hosting the Breakfast show! Tell us where in the world you're tuning in from...",
      replies: [
        {
          id: "rep_3_1",
          author: "LondonRocker",
          avatar: "🔥",
          badge: "FAN",
          timestamp: Date.now() - 3600000 * 6,
          content: "Tuning in from Camden Town! Please play 'Cherry Red' by Kayleigh on the next hour rotation!",
          likes: 11
        },
        {
          id: "rep_3_2",
          author: "ManchesterAcoustic",
          avatar: "☕",
          badge: "FAN",
          timestamp: Date.now() - 3600000 * 2,
          content: "Listening in Manchester with my morning coffee. Would love to hear 'Whiskey on a Wednesday' and 'The Highway Don't Lie'.",
          likes: 8
        }
      ]
    }
  ];

  function loadLocalTopics() {
    try {
      const stored = localStorage.getItem("km_forum_topics");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [...SEED_TOPICS];
  }

  function saveLocalTopics(topics) {
    try {
      localStorage.setItem("km_forum_topics", JSON.stringify(topics));
    } catch (e) {}
  }

  let forumTopics = loadLocalTopics();

  // Category Filters
  document.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.dataset.cat;
      fetchForumTopics();
    });
  });

  async function fetchForumTopics() {
    let topicsToRender = forumTopics;
    try {
      const url = "/api/forum" + (currentCategory !== "all" ? "?category=" + currentCategory : "");
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.topics)) {
          topicsToRender = data.topics;
          forumTopics = data.topics;
          saveLocalTopics(forumTopics);
        }
      }
    } catch (e) {}

    const filtered = currentCategory === "all" ? topicsToRender : topicsToRender.filter(t => t.category === currentCategory);

    if (!forumTopicsList) return;
    forumTopicsList.innerHTML = "";
    if (filtered.length === 0) {
      forumTopicsList.innerHTML = `<div class="empty-state" style="padding: 2rem; text-align: center; color: var(--muted);">No discussions in this category yet. Start the conversation!</div>`;
      return;
    }

    filtered.forEach(t => {
      const card = document.createElement("div");
      card.className = "topic-card";
      card.innerHTML = `
        <div class="topic-cat-badge">${t.categoryLabel || t.category}</div>
        <h3 class="topic-title"><a href="#topic-${t.id}">${t.title}</a></h3>
        <p class="topic-snippet">${t.snippet || (t.content ? t.content.slice(0, 100) + "..." : "")}</p>
        <div class="topic-meta">
          <span class="topic-author">${t.avatar || "🎸"} ${t.author}</span>
          <span class="topic-time">${timeAgo(t.timestamp)}</span>
          <span class="topic-stats">💬 ${t.replyCount !== undefined ? t.replyCount : (t.replies ? t.replies.length : 0)} replies &bull; ❤️ ${t.likes || 0}</span>
        </div>
      `;
      card.addEventListener("click", (e) => {
        e.preventDefault();
        viewTopic(t.id);
      });
      forumTopicsList.appendChild(card);
    });
  }

  async function viewTopic(topicId) {
    activeTopicId = topicId;
    if (forumTopicsView) forumTopicsView.classList.add("hidden");
    if (forumTopicDetailView) forumTopicDetailView.classList.remove("hidden");
    if (topicDetailContainer) topicDetailContainer.innerHTML = `<div class="loading" style="padding: 2rem; color: var(--muted);">Loading discussion...</div>`;

    let topic = forumTopics.find(t => t.id === topicId);

    try {
      const res = await fetch("/api/forum?topicId=" + topicId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.topic) topic = data.topic;
      }
    } catch (e) {}

    if (!topic || !topicDetailContainer) return;

    let repliesHtml = "";
    if (topic.replies && topic.replies.length > 0) {
      topic.replies.forEach(r => {
        repliesHtml += `
          <div class="reply-card" style="padding: 1rem; border-bottom: 1px solid var(--line);">
            <div class="reply-header" style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.35rem; font-size: 0.85rem;">
              <span class="reply-avatar">${r.avatar || "🎸"}</span>
              <span class="reply-author" style="font-weight: 700; color: var(--cream);">${r.author}</span>
              <span class="reply-time" style="color: var(--muted); font-size: 0.78rem; margin-left: auto;">${timeAgo(r.timestamp)}</span>
            </div>
            <div class="reply-text" style="font-size: 0.92rem; color: #ecebf0;">${r.content}</div>
          </div>
        `;
      });
    } else {
      repliesHtml = `<div class="empty-replies" style="padding: 1.5rem; color: var(--muted); font-size: 0.9rem;">No replies yet. Be the first to chime in!</div>`;
    }

    topicDetailContainer.innerHTML = `
      <div class="topic-main-post" style="padding: 1.2rem; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 1.5rem;">
        <div class="topic-cat-badge">${topic.categoryLabel || topic.category}</div>
        <h2 style="margin: 0.6rem 0; font-size: 1.4rem;">${topic.title}</h2>
        <div class="post-meta" style="display: flex; gap: 0.6rem; align-items: center; font-size: 0.85rem; color: var(--muted); margin-bottom: 1rem;">
          <span>${topic.avatar || "🎸"} ${topic.author}</span>
          <span>&bull; ${timeAgo(topic.timestamp)}</span>
          <button type="button" class="like-topic-btn" id="like-topic-btn" style="margin-left: auto; background: rgba(255,46,166,0.12); border: 1px solid var(--pink); color: var(--cream); padding: 0.2rem 0.6rem; border-radius: 999px; cursor: pointer;">❤️ ${topic.likes || 0} Likes</button>
        </div>
        <div class="post-content" style="font-size: 0.98rem; line-height: 1.5;">${topic.content}</div>
      </div>
      <div class="replies-section">
        <h3 style="margin-bottom: 0.8rem;">Replies (${topic.replies ? topic.replies.length : 0})</h3>
        <div class="replies-list" style="background: rgba(10,12,18,0.6); border: 1px solid var(--line); border-radius: 12px; overflow: hidden;">${repliesHtml}</div>
      </div>
    `;

    const likeBtn = document.getElementById("like-topic-btn");
    if (likeBtn) {
      likeBtn.addEventListener("click", async () => {
        likeBtn.disabled = true;
        topic.likes = (topic.likes || 0) + 1;
        saveLocalTopics(forumTopics);
        likeBtn.textContent = `❤️ ${topic.likes} Likes`;
        playUiSound("react");
        try {
          await fetch("/api/forum", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "like_topic", topicId })
          });
        } catch (e) {}
      });
    }
  }

  if (backToTopicsBtn) {
    backToTopicsBtn.addEventListener("click", () => {
      if (forumTopicDetailView) forumTopicDetailView.classList.add("hidden");
      if (forumTopicsView) forumTopicsView.classList.remove("hidden");
      activeTopicId = null;
      fetchForumTopics();
    });
  }

  if (replySendBtn && replyInput) {
    replySendBtn.addEventListener("click", async () => {
      const content = (replyInput.value || "").trim();
      if (!content || !activeTopicId) return;

      replySendBtn.disabled = true;
      const newReply = {
        id: "rep_" + Date.now(),
        author: userProfile.name,
        avatar: userProfile.avatar,
        content,
        timestamp: Date.now(),
        likes: 0
      };

      const topic = forumTopics.find(t => t.id === activeTopicId);
      if (topic) {
        if (!topic.replies) topic.replies = [];
        topic.replies.push(newReply);
        topic.replyCount = topic.replies.length;
        saveLocalTopics(forumTopics);
      }

      replyInput.value = "";
      playUiSound("send");
      await viewTopic(activeTopicId);
      replySendBtn.disabled = false;

      try {
        await fetch("/api/forum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "post_reply",
            topicId: activeTopicId,
            content,
            author: userProfile.name,
            avatar: userProfile.avatar
          })
        });
      } catch (e) {}
    });
  }

  if (newTopicBtn) {
    newTopicBtn.addEventListener("click", () => {
      if (newTopicModal) newTopicModal.classList.add("open");
    });
  }
  if (closeNewTopicModalBtn) {
    closeNewTopicModalBtn.addEventListener("click", () => {
      if (newTopicModal) newTopicModal.classList.remove("open");
    });
  }
  if (newTopicForm) {
    newTopicForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = (document.getElementById("new-topic-title").value || "").trim();
      const category = document.getElementById("new-topic-category").value;
      const content = (document.getElementById("new-topic-content").value || "").trim();
      if (!title || !content) return;

      const submitBtn = newTopicForm.querySelector("button[type=submit]");
      if (submitBtn) submitBtn.disabled = true;

      const catLabels = {
        kayleigh: "🎸 Kayleigh Merez",
        leah: "🌾 Leah Carter",
        radio: "📻 KM Radio & Requests",
        news: "📢 News & Gigs",
        general: "💬 General Discussion"
      };

      const newTop = {
        id: "topic_" + Date.now(),
        category,
        categoryLabel: catLabels[category] || category,
        title,
        content,
        author: userProfile.name,
        avatar: userProfile.avatar,
        timestamp: Date.now(),
        likes: 1,
        replyCount: 0,
        snippet: content.slice(0, 100) + "...",
        replies: []
      };

      forumTopics.unshift(newTop);
      saveLocalTopics(forumTopics);
      newTopicForm.reset();
      if (newTopicModal) newTopicModal.classList.remove("open");
      playUiSound("send");
      fetchForumTopics();
      viewTopic(newTop.id);

      if (submitBtn) submitBtn.disabled = false;

      try {
        await fetch("/api/forum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_topic",
            title,
            category,
            content,
            author: userProfile.name,
            avatar: userProfile.avatar
          })
        });
      } catch (e) {}
    });
  }

  // Initial Boot
  chatMessages = loadLocalMessages();
  updateProfileUI();
  updateSoundUI();
  renderMessages(chatMessages, true);
  fetchChatMessages(true);
  syncRadioInfo();
  startDaisyConversationKeeper();

  setInterval(syncRadioInfo, 10000);
  setInterval(() => {
    if (activeTab === "chat") fetchChatMessages(false);
  }, 4000);

})();
