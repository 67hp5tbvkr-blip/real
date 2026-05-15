let videosData = {};
let allVideos = [];
let filteredVideos = [];

let displayed = 0;
const STEP = 12;

const grid = document.getElementById("grid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const featuredRow = document.getElementById("featuredRow");

const lightbox = document.getElementById("lightbox");
const player = document.getElementById("player");
const closeBtn = document.getElementById("closeBtn");

/* -------------------------
   HERO SOUND
-------------------------- */
const unmuteBtn = document.getElementById("unmuteBtn");

if (unmuteBtn) {
  unmuteBtn.addEventListener("click", () => {
    const hero = document.getElementById("heroPlayer");
    if (!hero) return;

    hero.src = "https://www.youtube.com/embed/G3zP-RhcgAE?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1";
  });
}

/* -------------------------
   LIGHTBOX
-------------------------- */
function openVideo(id){
  if (!lightbox || !player) return;

  lightbox.style.display = "flex";
  player.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

function closeVideo(){
  if (!lightbox || !player) return;

  lightbox.style.display = "none";
  player.src = "";
}

if (closeBtn) {
  closeBtn.addEventListener("click", closeVideo);
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeVideo();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeVideo();
});

/* -------------------------
   DATA LOADING
   IMPORTANT :
   Garde ton JSON tel quel.
   Le fichier doit simplement s'appeler videos.json
   et être placé à la racine, à côté de index.html.
-------------------------- */
async function loadVideos(){
  try {
    const response = await fetch("videos.json");

    if (!response.ok) {
      throw new Error("Impossible de charger videos.json");
    }

    videosData = await response.json();
    prepareVideos();
    renderFeatured();
    applyFilter("all");

  } catch (error) {
    console.error(error);

    if (grid) {
      grid.innerHTML = `
        <p style="color:rgba(255,255,255,0.65);">
          Impossible de charger le catalogue vidéo. Vérifie que ton fichier <strong>videos.json</strong>
          est bien à la racine du site.
        </p>
      `;
    }

    if (loadMoreBtn) {
      loadMoreBtn.style.display = "none";
    }
  }
}

/* -------------------------
   PREPARE JSON
-------------------------- */
function prepareVideos(){
  allVideos = [];

  Object.entries(videosData).forEach(([category, videos]) => {
    if (!Array.isArray(videos)) return;

    videos.forEach((video) => {
      if (!video.id || !video.title) return;

      allVideos.push({
        id: video.id,
        title: video.title,
        category: category
      });
    });
  });
}

/* -------------------------
   FEATURED ROW
-------------------------- */
function renderFeatured(){

  if (!featuredRow) return;

  featuredRow.innerHTML = "";

  const selection = [
    { id: "FT0frI2LMtY", title: "BANDE ANNONCE" },
    { id: "mps9I3NBjeQ", title: "CAPTATION" },
    { id: "CELXcME_HkE", title: "MUSIQUE" },
    { id: "4c_jGWO1Bic", title: "MOTION DESIGN" }
  ];

  selection.forEach((video) => {

    const card = document.createElement("article");
    card.className = "featured-card";

    card.innerHTML = `
      <div class="featured-thumb">
        <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}">
      </div>

      <div class="featured-meta">
        <h3>${video.title}</h3>
      </div>
    `;

    card.addEventListener("click", () => openVideo(video.id));

    featuredRow.appendChild(card);
  });
}
  if (!featuredRow) return;

  featuredRow.innerHTML = "";

  const selection = [
  { id: "FT0frI2LMtY", title: "BANDE ANNONCE" },
  { id: "mps9I3NBjeQ", title: "CAPTATION" },
  { id: "CELXcME_HkE", title: "MUSIQUE" },
  { id: "4c_jGWO1Bic", title: "MOTION DESIGN" }
];

  selection.forEach((video) => {
    const card = document.createElement("article");
    card.className = "featured-card";
    card.innerHTML = `
      <div class="featured-thumb">
        <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${escapeHtml(video.title)}">
      </div>
      <div class="featured-meta">
        <h3>${escapeHtml(video.title)}</h3>
      </div>
    `;

    card.addEventListener("click", () => openVideo(video.id));
    featuredRow.appendChild(card);
  });
}

/* -------------------------
   FILTERS
-------------------------- */
const filterButtons = document.querySelectorAll(".filter");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    applyFilter(button.dataset.filter);
  });
});

function applyFilter(filter){
  displayed = 0;

  if (filter === "all") {
    filteredVideos = [...allVideos];
  } else {
    filteredVideos = allVideos.filter((video) => video.category === filter);
  }

  if (grid) grid.innerHTML = "";
  renderMore();
}

/* -------------------------
   GRID RENDER
-------------------------- */
function renderMore(){
  if (!grid) return;

  const nextVideos = filteredVideos.slice(displayed, displayed + STEP);

  nextVideos.forEach((video) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb">
        <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${escapeHtml(video.title)}">
      </div>
      <div class="meta">
        <h3>${escapeHtml(video.title)}</h3>
        <span>${formatCategory(video.category)}</span>
      </div>
    `;

    card.addEventListener("click", () => openVideo(video.id));
    grid.appendChild(card);
  });

  displayed += nextVideos.length;

  if (loadMoreBtn) {
    loadMoreBtn.style.display = displayed >= filteredVideos.length ? "none" : "inline-flex";
  }
}

if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", renderMore);
}

/* -------------------------
   HELPERS
-------------------------- */
function formatCategory(category){
  return category
    .replaceAll("_", " ")
    .replace("bandes annonces", "bandes-annonces")
    .replace("interviews reportages", "interviews / reportages");
}

function escapeHtml(text){
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadVideos();
