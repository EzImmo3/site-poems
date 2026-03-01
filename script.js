let poems = [];

fetch("poems/poems.json")
  .then(r => r.json())
  .then(data => {
    poems = data.sort((a, b) => a.ordre - b.ordre);
    renderList();
  });

const listSection = document.getElementById("list-section");
const poemSection = document.getElementById("poem-section");
const favSection = document.getElementById("fav-section");
const topSection = document.getElementById("top-section");
const authorSection = document.getElementById("author-section");

const poemListEl = document.getElementById("poemList");
const favListEl = document.getElementById("favList");
const topListEl = document.getElementById("topList");

const poemTitleEl = document.getElementById("poemTitle");
const poemMetaEl = document.getElementById("poemMeta");
const poemContentEl = document.getElementById("poemContent");
const likeBtn = document.getElementById("likeBtn");
const likeCountEl = document.getElementById("likeCount");
const viewCountEl = document.getElementById("viewCount");
const favBtn = document.getElementById("favBtn");
const favCountEl = document.getElementById("favCount");
const backBtn = document.getElementById("backBtn");

const immersiveOverlay = document.getElementById("immersive-overlay");
const immTitleEl = document.getElementById("immTitle");
const immContentEl = document.getElementById("immContent");
const immersiveBtn = document.getElementById("immersiveBtn");
const closeImmersiveBtn = document.getElementById("closeImmersive");
const immPrev = document.getElementById("immPrev");
const immNext = document.getElementById("immNext");

const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const toggleThemeBtn = document.getElementById("toggleTheme");

const goFavBtn = document.getElementById("goFav");
const goTopBtn = document.getElementById("goTop");
const goAuthorBtn = document.getElementById("goAuthor");
const backFavBtn = document.getElementById("backFav");
const backTopBtn = document.getElementById("backTop");
const backAuthorBtn = document.getElementById("backAuthor");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const LIKE_KEY = "poem_likes";
const VIEW_KEY = "poem_views";
const FAV_KEY = "poem_favorites";
const THEME_KEY = "poem_theme";

function loadMap(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function saveMap(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}

let likes = loadMap(LIKE_KEY);
let views = loadMap(VIEW_KEY);
let favorites = loadMap(FAV_KEY);
let currentPoem = null;

function renderList() {
  poemListEl.innerHTML = "";
  poems.forEach(p => {
    const card = document.createElement("article");
    card.className = "poem-card-mini";
    card.innerHTML = `<h3>${p.titre}</h3>`;
    card.addEventListener("click", () => openPoem(p.id));
    poemListEl.appendChild(card);
  });
}

function showScreen(section) {
  [listSection, poemSection, favSection, topSection, authorSection].forEach(s =>
    s.classList.remove("active")
  );
  section.classList.add("active");
}

backBtn.addEventListener("click", () => showScreen(listSection));
backFavBtn.addEventListener("click", () => showScreen(listSection));
backTopBtn.addEventListener("click", () => showScreen(listSection));
backAuthorBtn.addEventListener("click", () => showScreen(listSection));

goFavBtn.addEventListener("click", () => {
  renderFavorites();
  showScreen(favSection);
});

goTopBtn.addEventListener("click", () => {
  renderTopPoems();
  showScreen(topSection);
});

goAuthorBtn.addEventListener("click", () => showScreen(authorSection));

function openPoem(id) {
  const poem = poems.find(p => p.id === id);
  if (!poem) return;
  currentPoem = poem;

  poemTitleEl.textContent = poem.titre;
  poemMetaEl.textContent = `Poème ${poem.ordre}`;
  poemContentEl.textContent = poem.contenu;

  views[id] = (views[id] || 0) + 1;
  saveMap(VIEW_KEY, views);
  viewCountEl.textContent = views[id];

  if (!likes[id]) likes[id] = { count: 0, liked: false };
  likeCountEl.textContent = likes[id].count;
  updateLikeButton();

  if (!favorites[id]) favorites[id] = { count: 0, saved: false };
  favCountEl.textContent = favorites[id].count;
  updateFavButton();

  showScreen(poemSection);
}

function updateLikeButton() {
  const state = likes[currentPoem.id];
  likeBtn.style.background = state.liked ? "var(--accent)" : "var(--accent-soft)";
  likeBtn.style.color = state.liked ? "#fff" : "var(--accent)";
}

likeBtn.addEventListener("click", () => {
  const id = currentPoem.id;
  const state = likes[id];

  state.liked = !state.liked;
  state.count += state.liked ? 1 : -1;

  likeCountEl.textContent = state.count;
  saveMap(LIKE_KEY, likes);
  updateLikeButton();
});

function updateFavButton() {
  const state = favorites[currentPoem.id];
  favBtn.style.background = state.saved ? "gold" : "var(--accent-soft)";
  favBtn.style.color = state.saved ? "#000" : "var(--accent)";
}

favBtn.addEventListener("click", () => {
  const id = currentPoem.id;
  const state = favorites[id];

  state.saved = !state.saved;
  state.count += state.saved ? 1 : -1;

  favCountEl.textContent = state.count;
  saveMap(FAV_KEY, favorites);
  updateFavButton();
});

function renderFavorites() {
  favListEl.innerHTML = "";

  const favIds = Object.keys(favorites).filter(id => favorites[id].saved);

  if (favIds.length === 0) {
    favListEl.innerHTML = "<p>Aucun poème en favori pour le moment.</p>";
    return;
  }

  favIds.forEach(id => {
    const poem = poems.find(p => p.id === id);
    if (!poem) return;

    const card = document.createElement("article");
    card.className = "poem-card-mini";
    card.innerHTML = `<h3>${poem.titre}</h3>`;
    card.addEventListener("click", () => openPoem(poem.id));

    favListEl.appendChild(card);
  });
}

function renderTopPoems() {
  topListEl.innerHTML = "";

  const sorted = [...poems].sort((a, b) => {
    const la = likes[a.id]?.count || 0;
    const lb = likes[b.id]?.count || 0;
    return lb - la;
  });

  sorted.forEach(poem => {
    const count = likes[poem.id]?.count || 0;

    const card = document.createElement("article");
    card.className = "poem-card-mini";
    card.innerHTML = `
      <h3>${poem.titre}</h3>
      <p class="meta">❤️ ${count} likes</p>
    `;
    card.addEventListener("click", () => openPoem(poem.id));

    topListEl.appendChild(card);
  });
}

prevBtn.addEventListener("click", () => {
  const index = poems.findIndex(p => p.id === currentPoem.id);
  if (index > 0) openPoem(poems[index - 1].id);
});

nextBtn.addEventListener("click", () => {
  const index = poems.findIndex(p => p.id === currentPoem.id);
  if (index < poems.length - 1) openPoem(poems[index + 1].id);
});

immersiveBtn.addEventListener("click", () => {
  immTitleEl.textContent = currentPoem.titre;
  immContentEl.textContent = currentPoem.contenu;
  immersiveOverlay.classList.add("active");
});

closeImmersiveBtn.addEventListener("click", () => {
  immersiveOverlay.classList.remove("active");
});

immPrev.addEventListener("click", () => {
  const index = poems.findIndex(p => p.id === currentPoem.id);
  if (index > 0) {
    openPoem(poems[index - 1].id);
    immersiveBtn.click();
  }
});

immNext.addEventListener("click", () => {
  const index = poems.findIndex(p => p.id === currentPoem.id);
  if (index < poems.length - 1) {
    openPoem(poems[index + 1].id);
    immersiveBtn.click();
  }
});

copyBtn.addEventListener("click", async () => {
  const text = `${currentPoem.titre}\n\n${currentPoem.contenu}`;
  await navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copié ✔";
  setTimeout(() => (copyBtn.textContent = "Copier"), 1500);
});

shareBtn.addEventListener("click", async () => {
  const text = `${currentPoem.titre}\n\n${currentPoem.contenu}`;

  if (navigator.share) {
    await navigator.share({
      title: currentPoem.titre,
      text: text
    });
  } else {
    await navigator.clipboard.writeText(text);
    shareBtn.textContent = "Copié ✔";
    setTimeout(() => (shareBtn.textContent = "Partager"), 1500);
  }
});

if (localStorage.getItem(THEME_KEY) === "light") {
  document.body.classList.add("light");
  toggleThemeBtn.textContent = "🌙";
}

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  toggleThemeBtn.textContent = isLight ? "🌙" : "☀️";
  localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
});

/* Fond animé */
const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createParticles() {
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.6 + 0.2
    });
  }
}

function animateParticles() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = bgCanvas.width;
    if (p.x > bgCanvas.width) p.x = 0;
    if (p.y < 0) p.y = bgCanvas.height;
    if (p.y > bgCanvas.height) p.y = 0;

    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(148,163,184,${p.alpha})`;
    bgCtx.fill();
  });

  requestAnimationFrame(animateParticles);
}

createParticles();
animateParticles();