// KM Records Community Hub (The Green Room & Discussion Boards)
(function () {
  "use strict";

  const AVATARS = ["🎸", "🌾", "🎤", "📻", "⚡", "✨", "🎧", "🔥", "☕", "👏", "⭐", "🖤"];
  
  // Profile State
  let userProfile = {
    name: "Fan_" + Math.floor(100 + Math.random() * 900),
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    badge: "FAN"
  };

  // Load from localStorage if available
  try {
    const saved = localStorage.getItem("km_user_profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name) userProfile.name = parsed.name;
      if (parsed.avatar) userProfile.avatar = parsed.avatar;
    } else {
      localStorage.setItem("km_user_profile", JSON.stringify(userProfile));
    }
  } catch (e) {}

  // Active Tab
  let activeTab = "chat"; // 'chat' or 'forum'
  let currentCategory = "all";
  let activeTopicId = null;
  let chatPollTimer = null;
  let lastChatCount = 0;

  // DOM Elements
  const tabChatBtn = document.getElementById("tab-chat-btn");
  const tabForumBtn = document.getElementById("tab-forum-btn");
  const tabChatPane = document.getElementById("tab-chat-pane");
  const tabForumPane = document.getElementById("tab-forum-pane");
  
  const userAvatarDisplay = document.getElementById("user-avatar-display");
  const userNameDisplay = document.getElementById("user-name-display");
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const profileModal = document.getElementById("profile-modal");
  const profileNameInput = document.getElementById("profile-name-input");
  const avatarGrid = document.getElementById("avatar-grid");
  const saveProfileBtn = document.getElementById("save-profile-btn");
  const closeProfileModalBtn = document.getElementById("close-profile-modal-btn");

  // Chat Elements
  const chatMessagesList = document.getElementById("chat-messages-list");
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatCharCount = document.getElementById("chat-char-count");
  const chatRadioTrack = document.getElementById("chat-radio-track");

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
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return "just now";
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
    const authorPreview = document.getElementById("chat-author-preview");
    if (authorPreview) authorPreview.textContent = userProfile.avatar + " " + userProfile.name;
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
      tabForumBtn.classList.remove("active");
      tabChatPane.classList.remove("hidden");
      tabForumPane.classList.add("hidden");
      fetchChatMessages(true);
    });
    tabForumBtn.addEventListener("click", () => {
      activeTab = "forum";
      tabForumBtn.classList.add("active");
      tabChatBtn.classList.remove("active");
      tabForumPane.classList.remove("hidden");
      tabChatPane.classList.add("hidden");
      fetchForumTopics();
    });
  }

  // Quick Emoji Click in Chat
  document.querySelectorAll(".quick-emoji").forEach(em => {
    em.addEventListener("click", () => {
      chatInput.value += em.textContent;
      chatInput.focus();
      updateCharCount();
    });
  });

  function updateCharCount() {
    if (chatCharCount) {
      chatCharCount.textContent = (chatInput.value || "").length + " / 300";
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

  // Chat API Fetch
  async function fetchChatMessages(autoScroll) {
    try {
      const res = await fetch("/api/chat");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.messages) return;

      const isScrolledToBottom = chatMessagesList.scrollHeight - chatMessagesList.clientHeight <= chatMessagesList.scrollTop + 50;

      chatMessagesList.innerHTML = "";
      data.messages.forEach(msg => {
        const item = document.createElement("div");
        item.className = "chat-msg" + (msg.author === userProfile.name ? " self" : "");
        
        let badgeHtml = "";
        if (msg.badge === "MOD") badgeHtml = `<span class="badge mod">MOD</span>`;
        else if (msg.badge === "PRESENTER") badgeHtml = `<span class="badge presenter">ON AIR</span>`;
        else if (msg.badge === "LABEL") badgeHtml = `<span class="badge label">LABEL</span>`;
        else if (msg.badge === "VIP") badgeHtml = `<span class="badge vip">VIP</span>`;

        item.innerHTML = `
          <div class="msg-avatar">${msg.avatar || "🎸"}</div>
          <div class="msg-body">
            <div class="msg-header">
              <span class="msg-author">${msg.author}</span>
              ${badgeHtml}
              <span class="msg-time">${timeAgo(msg.timestamp)}</span>
            </div>
            <div class="msg-text">${msg.text}</div>
          </div>
        `;
        chatMessagesList.appendChild(item);
      });

      if (autoScroll || isScrolledToBottom || data.messages.length > lastChatCount) {
        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
      }
      lastChatCount = data.messages.length;
    } catch (e) {
      console.error("Chat fetch failed", e);
    }
  }

  // Send Chat Message
  async function sendChatMessage() {
    const text = (chatInput.value || "").trim();
    if (!text) return;
    
    chatSendBtn.disabled = true;
    chatInput.value = "";
    updateCharCount();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          author: userProfile.name,
          avatar: userProfile.avatar,
          badge: userProfile.badge
        })
      });
      if (res.ok) {
        await fetchChatMessages(true);
      }
    } catch (e) {
      console.error("Send message error", e);
    } finally {
      chatSendBtn.disabled = false;
      chatInput.focus();
    }
  }

  // Synchronize Live Radio info into Green Room
  async function syncRadioInfo() {
    try {
      const res = await fetch("/radio/now");
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.live && data.live.catalogue && chatRadioTrack) {
        chatRadioTrack.innerHTML = `
          <span class="live-dot"></span>
          <strong>Spinning Now:</strong> ${data.live.catalogue.title} — ${data.live.catalogue.artist}
          <span class="show-tag">(${data.title} with ${data.presenter})</span>
        `;
      }
    } catch (e) {}
  }

  // Forum Category Filters
  document.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.dataset.cat;
      fetchForumTopics();
    });
  });

  // Fetch Forum Topics
  async function fetchForumTopics() {
    try {
      const url = "/api/forum" + (currentCategory !== "all" ? "?category=" + currentCategory : "");
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.topics) return;

      forumTopicsList.innerHTML = "";
      if (data.topics.length === 0) {
        forumTopicsList.innerHTML = `<div class="empty-state">No discussions in this category yet. Start the conversation!</div>`;
        return;
      }

      data.topics.forEach(t => {
        const card = document.createElement("div");
        card.className = "topic-card";
        card.innerHTML = `
          <div class="topic-cat-badge">${t.categoryLabel}</div>
          <h3 class="topic-title"><a href="#topic-${t.id}">${t.title}</a></h3>
          <p class="topic-snippet">${t.snippet}</p>
          <div class="topic-meta">
            <span class="topic-author">${t.avatar} ${t.author}</span>
            <span class="topic-time">${timeAgo(t.timestamp)}</span>
            <span class="topic-stats">💬 ${t.replyCount} replies &bull; ❤️ ${t.likes}</span>
          </div>
        `;
        card.addEventListener("click", (e) => {
          e.preventDefault();
          viewTopic(t.id);
        });
        forumTopicsList.appendChild(card);
      });
    } catch (e) {
      console.error("Forum topics error", e);
    }
  }

  // View Single Topic Detail
  async function viewTopic(topicId) {
    activeTopicId = topicId;
    forumTopicsView.classList.add("hidden");
    forumTopicDetailView.classList.remove("hidden");
    topicDetailContainer.innerHTML = `<div class="loading">Loading discussion...</div>`;

    try {
      const res = await fetch("/api/forum?topicId=" + topicId);
      if (!res.ok) return;
      const data = await res.json();
      const topic = data.topic;
      if (!topic) return;

      let repliesHtml = "";
      if (topic.replies && topic.replies.length > 0) {
        topic.replies.forEach(r => {
          repliesHtml += `
            <div class="reply-card">
              <div class="reply-header">
                <span class="reply-avatar">${r.avatar}</span>
                <span class="reply-author">${r.author}</span>
                <span class="reply-time">${timeAgo(r.timestamp)}</span>
              </div>
              <div class="reply-text">${r.content}</div>
            </div>
          `;
        });
      } else {
        repliesHtml = `<div class="empty-replies">No replies yet. Be the first to chime in!</div>`;
      }

      topicDetailContainer.innerHTML = `
        <div class="topic-main-post">
          <div class="topic-cat-badge">${topic.categoryLabel}</div>
          <h2>${topic.title}</h2>
          <div class="post-meta">
            <span>${topic.avatar} ${topic.author}</span>
            <span>&bull; ${timeAgo(topic.timestamp)}</span>
            <button type="button" class="like-topic-btn" id="like-topic-btn">❤️ ${topic.likes || 0} Likes</button>
          </div>
          <div class="post-content">${topic.content}</div>
        </div>
        <div class="replies-section">
          <h3>Replies (${topic.replies ? topic.replies.length : 0})</h3>
          <div class="replies-list">${repliesHtml}</div>
        </div>
      `;

      const likeBtn = document.getElementById("like-topic-btn");
      if (likeBtn) {
        likeBtn.addEventListener("click", async () => {
          likeBtn.disabled = true;
          try {
            const lRes = await fetch("/api/forum", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "like_topic", topicId })
            });
            if (lRes.ok) {
              const lData = await lRes.json();
              likeBtn.textContent = `❤️ ${lData.likes} Likes`;
            }
          } catch (e) {}
        });
      }
    } catch (e) {
      console.error("View topic error", e);
    }
  }

  // Back to Topics list
  if (backToTopicsBtn) {
    backToTopicsBtn.addEventListener("click", () => {
      forumTopicDetailView.classList.add("hidden");
      forumTopicsView.classList.remove("hidden");
      activeTopicId = null;
      fetchForumTopics();
    });
  }

  // Post Reply
  if (replySendBtn && replyInput) {
    replySendBtn.addEventListener("click", async () => {
      const content = (replyInput.value || "").trim();
      if (!content || !activeTopicId) return;

      replySendBtn.disabled = true;
      try {
        const res = await fetch("/api/forum", {
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
        if (res.ok) {
          replyInput.value = "";
          await viewTopic(activeTopicId);
        }
      } catch (e) {
        console.error("Post reply error", e);
      } finally {
        replySendBtn.disabled = false;
      }
    });
  }

  // New Topic Modal
  if (newTopicBtn) {
    newTopicBtn.addEventListener("click", () => {
      newTopicModal.classList.add("open");
    });
  }
  if (closeNewTopicModalBtn) {
    closeNewTopicModalBtn.addEventListener("click", () => {
      newTopicModal.classList.remove("open");
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

      try {
        const res = await fetch("/api/forum", {
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
        if (res.ok) {
          const data = await res.json();
          newTopicForm.reset();
          newTopicModal.classList.remove("open");
          fetchForumTopics();
          if (data.topic) viewTopic(data.topic.id);
        }
      } catch (e) {
        console.error("Create topic error", e);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Radio Floating Reactions
  document.querySelectorAll(".react-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const em = btn.dataset.emoji || "🔥";
      // Send quick message in chat
      if (chatInput) {
        chatInput.value = em + " Loving this track!";
        sendChatMessage();
      }
      btn.style.transform = "scale(1.3)";
      setTimeout(() => { btn.style.transform = "scale(1)"; }, 250);
    });
  });

  // Init
  updateProfileUI();
  fetchChatMessages(true);
  syncRadioInfo();
  setInterval(syncRadioInfo, 10000);
  chatPollTimer = setInterval(() => {
    if (activeTab === "chat") {
      fetchChatMessages(false);
    }
  }, 3500);

})();
