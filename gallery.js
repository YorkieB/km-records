// KM Records Official Photo Gallery & Lightbox
(function () {
  "use strict";

  let galleryPhotos = [];
  let currentFilter = "all";
  let activeIndex = 0;
  let filteredIndices = [];

  const gridContainer = document.getElementById("gallery-grid");
  const filterButtons = document.querySelectorAll(".gallery-filter-btn");

  // Lightbox DOM Elements
  const lightboxModal = document.getElementById("gallery-lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxLocation = document.getElementById("lightbox-location");
  const lightboxArtistTag = document.getElementById("lightbox-artist-tag");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const lightboxPrevBtn = document.getElementById("lightbox-prev-btn");
  const lightboxNextBtn = document.getElementById("lightbox-next-btn");
  const lightboxCloseBtn = document.getElementById("lightbox-close-btn");

  // Load photos from gallery_data.json
  async function loadGalleryData() {
    try {
      const res = await fetch("gallery_data.json");
      if (!res.ok) return;
      galleryPhotos = await res.json();
      renderGallery();
    } catch (e) {
      console.error("Failed to load gallery data", e);
    }
  }

  // Render Grid
  function renderGallery() {
    if (!gridContainer) return;
    gridContainer.innerHTML = "";

    filteredIndices = [];
    galleryPhotos.forEach((photo, idx) => {
      if (currentFilter !== "all") {
        if (currentFilter === "kayleigh" && photo.artist !== "kayleigh") return;
        if (currentFilter === "leah" && photo.artist !== "leah") return;
        if (currentFilter === "studio" && !["studio", "tour", "live"].includes(photo.category)) return;
      }
      filteredIndices.push(idx);

      const card = document.createElement("article");
      card.className = "gallery-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${photo.title} by ${photo.artist === "kayleigh" ? "Kayleigh Merez" : "Leah Carter"}`);

      const artistName = photo.artist === "kayleigh" ? "Kayleigh Merez" : "Leah Carter";
      const artistClass = photo.artist === "kayleigh" ? "tag-kayleigh" : "tag-leah";

      card.innerHTML = `
        <div class="gallery-thumb-wrapper">
          <img src="${photo.image}" alt="${photo.title}" loading="lazy" class="gallery-thumb">
          <span class="gallery-badge ${artistClass}">${photo.categoryLabel}</span>
          <div class="gallery-overlay">
            <span class="view-btn">View Photo</span>
          </div>
        </div>
        <div class="gallery-info">
          <h3 class="gallery-photo-title">${photo.title}</h3>
          <p class="gallery-artist">${artistName}</p>
          <p class="gallery-location">📍 ${photo.location}</p>
        </div>
      `;

      const openFn = () => openLightbox(filteredIndices.indexOf(idx));
      card.addEventListener("click", openFn);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFn();
        }
      });

      gridContainer.appendChild(card);
    });
  }

  // Filter switching
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter || "all";
      renderGallery();
    });
  });

  // Open Lightbox
  function openLightbox(filterIdx) {
    if (filterIdx < 0 || filterIdx >= filteredIndices.length) return;
    activeIndex = filterIdx;
    updateLightbox();
    lightboxModal.classList.add("open");
    lightboxModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  // Close Lightbox
  function closeLightbox() {
    lightboxModal.classList.remove("open");
    lightboxModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Update Lightbox Content
  function updateLightbox() {
    const photoIdx = filteredIndices[activeIndex];
    const photo = galleryPhotos[photoIdx];
    if (!photo) return;

    lightboxImg.src = photo.image;
    lightboxImg.alt = photo.title;
    lightboxTitle.textContent = photo.title;
    lightboxCaption.textContent = photo.caption;
    lightboxLocation.textContent = "📍 " + photo.location;

    const artistName = photo.artist === "kayleigh" ? "Kayleigh Merez" : "Leah Carter";
    lightboxArtistTag.textContent = `${artistName} &bull; ${photo.categoryLabel}`;
    lightboxArtistTag.className = "lightbox-artist " + (photo.artist === "kayleigh" ? "kayleigh-text" : "leah-text");

    lightboxCounter.textContent = `${activeIndex + 1} / ${filteredIndices.length}`;
  }

  // Next / Prev
  function nextPhoto() {
    if (filteredIndices.length === 0) return;
    activeIndex = (activeIndex + 1) % filteredIndices.length;
    updateLightbox();
  }

  function prevPhoto() {
    if (filteredIndices.length === 0) return;
    activeIndex = (activeIndex - 1 + filteredIndices.length) % filteredIndices.length;
    updateLightbox();
  }

  if (lightboxNextBtn) lightboxNextBtn.addEventListener("click", nextPhoto);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener("click", prevPhoto);
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);

  // Close on backdrop click
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // Keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (!lightboxModal.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") nextPhoto();
    else if (e.key === "ArrowLeft") prevPhoto();
  });

  // Init
  loadGalleryData();
})();
