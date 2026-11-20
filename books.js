// KM Records Books & Stories Engine
(function () {
  "use strict";

  let books = [];
  let currentBook = null;
  let currentChapterIdx = 0;
  let currentTheme = "parchment"; // parchment, midnight, ivory
  let currentFont = "serif"; // serif, sans
  let currentFontSize = 17; // px

  // DOM Elements
  const booksGrid = document.getElementById("books-grid");
  const bookFilterButtons = document.querySelectorAll(".book-filter-btn");

  // Reader Modal Elements
  const readerModal = document.getElementById("book-reader-modal");
  const readerCloseBtn = document.getElementById("reader-close-btn");
  const readerBookTitle = document.getElementById("reader-book-title");
  const readerAuthor = document.getElementById("reader-author");
  const readerChapterSelect = document.getElementById("reader-chapter-select");
  const readerBody = document.getElementById("reader-body");
  const readerChapTitle = document.getElementById("reader-chap-title");
  const readerChapSubtitle = document.getElementById("reader-chap-subtitle");
  const readerText = document.getElementById("reader-text");
  const readerPrevBtn = document.getElementById("reader-prev-btn");
  const readerNextBtn = document.getElementById("reader-next-btn");
  const readerPdfDownload = document.getElementById("reader-pdf-download");
  const readerFontSizeDec = document.getElementById("reader-font-dec");
  const readerFontSizeInc = document.getElementById("reader-font-inc");
  const readerThemeToggles = document.querySelectorAll(".reader-theme-btn");
  const readerFontToggle = document.getElementById("reader-font-toggle");

  async function initBooks() {
    try {
      const res = await fetch("books/books_data.json");
      if (!res.ok) return;
      books = await res.json();
      if (!books || books.length === 0) return;

      renderShelf("all");
      setupFilterEvents();
      setupReaderEvents();
    } catch (e) {
      console.error("Failed to load books catalog", e);
    }
  }

  function renderShelf(filter) {
    if (!booksGrid) return;
    booksGrid.innerHTML = "";

    const f = (filter || "").toLowerCase();

    books.forEach((book, idx) => {
      if (f === "graphic" && !book.tag.toLowerCase().includes("graphic")) return;
      if (f === "memoir" && !book.tag.toLowerCase().includes("memoir") && !book.tag.toLowerCase().includes("essay") && !book.tag.toLowerCase().includes("heritage")) return;
      if (f === "songbook" && !book.tag.toLowerCase().includes("songbook")) return;

      const card = document.createElement("article");
      card.className = "book-shelf-card";
      card.dataset.id = book.id;

      card.innerHTML = `
        <div class="book-cover-3d-wrap">
          <div class="book-cover-3d">
            <img src="${book.cover}" alt="${book.title} cover" class="book-cover-img" loading="lazy">
            <div class="book-spine-effect"></div>
            <div class="book-sheen"></div>
          </div>
          <span class="book-card-badge">${book.badge || book.tag}</span>
        </div>
        <div class="book-meta">
          <div class="book-tag-row">
            <span class="book-tag">${book.tag}</span>
            <span class="book-pages">${book.pages}</span>
          </div>
          <h3 class="book-title">${book.title}</h3>
          <p class="book-author">By ${book.author}</p>
          <p class="book-synopsis">${book.synopsis}</p>
          <div class="book-actions">
            <button type="button" class="pill solid book-read-btn" data-id="${book.id}">Read Online</button>
            <a href="${book.pdf}" download class="pill ghost book-pdf-btn" title="Download PDF (${book.pdf_size})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: -2px; margin-right: 4px;"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>PDF (${book.pdf_size})
            </a>
          </div>
        </div>
      `;

      // Read button click
      const readBtn = card.querySelector(".book-read-btn");
      if (readBtn) {
        readBtn.addEventListener("click", () => openReader(book.id, 0));
      }

      // Also click on cover to read
      const coverWrap = card.querySelector(".book-cover-3d");
      if (coverWrap) {
        coverWrap.addEventListener("click", () => openReader(book.id, 0));
      }

      booksGrid.appendChild(card);
    });
  }

  function setupFilterEvents() {
    bookFilterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        bookFilterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderShelf(btn.dataset.filter);
      });
    });
  }

  // Reader Open & Close
  function openReader(bookId, chapterIdx = 0) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    currentBook = book;
    currentChapterIdx = chapterIdx;

    if (readerBookTitle) readerBookTitle.textContent = book.title;
    if (readerAuthor) readerAuthor.textContent = "By " + book.author;
    if (readerPdfDownload) {
      readerPdfDownload.href = book.pdf;
      readerPdfDownload.setAttribute("download", "");
    }

    // Populate Chapter dropdown
    if (readerChapterSelect) {
      readerChapterSelect.innerHTML = "";
      book.chapters.forEach((chap, idx) => {
        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = `${idx + 1}. ${chap.title.replace(/^Chapter \d+:\s*/, "")}`;
        readerChapterSelect.appendChild(opt);
      });
      readerChapterSelect.value = chapterIdx;
    }

    displayChapter(chapterIdx);
    applyReaderStyles();

    if (readerModal) {
      readerModal.removeAttribute("hidden");
      readerModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeReader() {
    if (readerModal) {
      readerModal.classList.remove("active");
      readerModal.setAttribute("hidden", "");
      document.body.style.overflow = "";
    }
  }

  function displayChapter(idx) {
    if (!currentBook || !currentBook.chapters[idx]) return;
    currentChapterIdx = idx;

    const chap = currentBook.chapters[idx];
    if (readerChapterSelect) readerChapterSelect.value = idx;
    if (readerChapTitle) readerChapTitle.textContent = chap.title;
    if (readerChapSubtitle) readerChapSubtitle.textContent = chap.subtitle || "";

    if (readerText) {
      readerText.innerHTML = "";
      const raw = chap.content || "";
      const paras = raw.split(/\n\n+/);

      paras.forEach((p, pIdx) => {
        const clean = p.trim();
        if (!clean) return;

        // Check for verse/block
        if (clean.startsWith("[") || clean.startsWith("CHORDS:") || clean.startsWith("STUDIO NOTE:")) {
          const pre = document.createElement("pre");
          pre.className = "reader-codeblock";
          pre.textContent = clean;
          readerText.appendChild(pre);
        } else {
          const pElem = document.createElement("p");
          pElem.className = "reader-para" + (pIdx === 0 ? " drop-cap" : "");
          pElem.textContent = clean;
          readerText.appendChild(pElem);
        }
      });
    }

    // Update Prev / Next buttons
    if (readerPrevBtn) {
      readerPrevBtn.disabled = idx === 0;
      readerPrevBtn.style.opacity = idx === 0 ? "0.35" : "1";
    }
    if (readerNextBtn) {
      const isLast = idx >= currentBook.chapters.length - 1;
      readerNextBtn.disabled = isLast;
      readerNextBtn.style.opacity = isLast ? "0.35" : "1";
    }

    // Scroll reader text to top
    if (readerBody) readerBody.scrollTop = 0;
  }

  function applyReaderStyles() {
    if (!readerBody) return;
    readerBody.className = `reader-body theme-${currentTheme} font-${currentFont}`;
    readerBody.style.fontSize = `${currentFontSize}px`;
  }

  function setupReaderEvents() {
    if (readerCloseBtn) readerCloseBtn.addEventListener("click", closeReader);

    // Click outside modal pane to close
    if (readerModal) {
      readerModal.addEventListener("click", (e) => {
        if (e.target === readerModal) closeReader();
      });
    }

    // Prev / Next Chapter Buttons
    if (readerPrevBtn) {
      readerPrevBtn.addEventListener("click", () => {
        if (currentChapterIdx > 0) displayChapter(currentChapterIdx - 1);
      });
    }
    if (readerNextBtn) {
      readerNextBtn.addEventListener("click", () => {
        if (currentBook && currentChapterIdx < currentBook.chapters.length - 1) {
          displayChapter(currentChapterIdx + 1);
        }
      });
    }

    // Chapter Select Change
    if (readerChapterSelect) {
      readerChapterSelect.addEventListener("change", (e) => {
        displayChapter(parseInt(e.target.value, 10));
      });
    }

    // Font size controls
    if (readerFontSizeDec) {
      readerFontSizeDec.addEventListener("click", () => {
        if (currentFontSize > 13) {
          currentFontSize -= 1;
          applyReaderStyles();
        }
      });
    }
    if (readerFontSizeInc) {
      readerFontSizeInc.addEventListener("click", () => {
        if (currentFontSize < 25) {
          currentFontSize += 1;
          applyReaderStyles();
        }
      });
    }

    // Theme controls
    readerThemeToggles.forEach(btn => {
      btn.addEventListener("click", () => {
        readerThemeToggles.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentTheme = btn.dataset.theme;
        applyReaderStyles();
      });
    });

    // Font family toggle (Serif vs Sans)
    if (readerFontToggle) {
      readerFontToggle.addEventListener("click", () => {
        currentFont = currentFont === "serif" ? "sans" : "serif";
        readerFontToggle.textContent = currentFont === "serif" ? "Serif" : "Sans";
        applyReaderStyles();
      });
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!readerModal || readerModal.hasAttribute("hidden")) return;
      if (e.key === "Escape") closeReader();
      if (e.key === "ArrowLeft" && currentChapterIdx > 0) {
        displayChapter(currentChapterIdx - 1);
      }
      if (e.key === "ArrowRight" && currentBook && currentChapterIdx < currentBook.chapters.length - 1) {
        displayChapter(currentChapterIdx + 1);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBooks);
  } else {
    initBooks();
  }
})();
