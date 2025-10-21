// ===============================
// CampusLink UI Script
// Handles: Language translation, dropdown menu, side navigation, lost & found form, campus map
// ===============================

document.addEventListener("DOMContentLoaded", () => {

// ===============================================
// CampusLink Automatic Translator (Google Cloud)
// ===============================================


const GOOGLE_API_KEY = "AIzaSyBQ-w7x6MGETNMLpJ_6C6dl717l75k5DWY";

// Supported languages and their labels
const SUPPORTED_LANGS = {
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  vi: "Tiếng Việt",
  hi: "हिन्दी" 
};

// --- Grab all visible text nodes ---
function getTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Ignore scripts, styles, and empty whitespace
      if (!node.parentElement) return NodeFilter.FILTER_REJECT;
      const tag = node.parentElement.tagName.toLowerCase();
      if (["script","style","noscript"].includes(tag)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

// --- Translate page text ---
async function translatePage(targetLang) {
  if (targetLang === "en") {
    location.reload(); // reload original page
    return;
  }

  const nodes = getTextNodes();
  const originalText = nodes.map(n => n.nodeValue);

  // Send text chunks in batches (API limit ~5 k chars)
  const BATCH_SIZE = 100;
  const translated = [];

  for (let i = 0; i < originalText.length; i += BATCH_SIZE) {
    const batch = originalText.slice(i, i + BATCH_SIZE);
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: batch,
          target: targetLang,
          format: "text"
        })
      }
    );
    const data = await res.json();
    const t = data.data?.translations?.map(o => o.translatedText) || batch;
    translated.push(...t);
  }

  // Apply translations
  nodes.forEach((n, i) => { n.nodeValue = translated[i]; });

  // Persist language
  localStorage.setItem("preferredLang", targetLang);
}

// --- Restore saved language on load ---
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("preferredLang");
  if (saved && saved !== "en") translatePage(saved);
});

// --- Hook up existing language buttons ---
document.querySelectorAll("[data-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    translatePage(lang);
  });
});


const langBtn  = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");

// Open/close your custom menu
function openLang()  { langMenu?.classList.add("open");  langBtn?.setAttribute("aria-expanded","true"); }
function closeLang() { langMenu?.classList.remove("open");langBtn?.setAttribute("aria-expanded","false"); }
function toggleLang(){ langMenu?.classList.contains("open") ? closeLang() : openLang(); }

langBtn?.addEventListener("click", (e) => { e.stopPropagation(); toggleLang(); });

// Handle clicks on buttons
langMenu?.querySelectorAll("button[data-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;                 // e.g. 'es', 'zh-CN'
    localStorage.setItem("preferredLang", lang);   // persist
    whenTranslateReady(() => setLangViaCombo(lang));
    closeLang();
  });
});

// Auto-apply saved language on load
const savedLang = localStorage.getItem("preferredLang");
if (savedLang && savedLang !== "en") {
  // give Google a moment to inject the combo, then set it
  whenTranslateReady(() => setLangViaCombo(savedLang));
}

// Close language menu if clicking outside
document.addEventListener("click", (e) => {
  if (langMenu?.classList.contains("open") &&
      !langMenu.contains(e.target) && !langBtn?.contains(e.target)) {
    closeLang();
  }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLang(); });


  /* ========================================
     RIGHT-SIDE NAVIGATION DRAWER (HAMBURGER MENU)
  ======================================== */

  const sidenav  = document.getElementById("mySidenav"); // Side navigation container
  const menuBtn  = document.getElementById("menuBtn");   // Hamburger button
  const closeBtn = sidenav?.querySelector(".closebtn");  // “×” button inside sidenav

  // Open navigation drawer
  function openNav() {
    sidenav?.classList.add("open");
    menuBtn?.setAttribute("aria-expanded", "true");
    sidenav?.setAttribute("aria-hidden", "false");
  }

  // Close navigation drawer
  function closeNav() {
    sidenav?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    sidenav?.setAttribute("aria-hidden", "true");
  }

  // Toggle drawer open/close
  function toggleNav() {
    sidenav?.classList.contains("open") ? closeNav() : openNav();
  }

  // Click hamburger to toggle menu
  menuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNav();
  });

  // Click × inside sidenav to close
  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeNav();
  });

  /* ========================================
     GLOBAL CLICK & KEYBOARD HANDLERS
     (Close dropdowns and drawers when clicking outside or pressing ESC)
  ======================================== */

  document.addEventListener("click", (e) => {
    // Close language menu if clicking outside
    if (langMenu?.classList.contains("open") &&
        !langMenu.contains(e.target) &&
        !langBtn?.contains(e.target)) {
      closeLang();
    }

    // Close sidenav if clicking outside it and not on hamburger
    if (sidenav?.classList.contains("open") &&
        !sidenav.contains(e.target) &&
        !menuBtn?.contains(e.target)) {
      closeNav();
    }
  });

  // Close menus when pressing the Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLang();
      closeNav();
    }
  });

    /* ========================================
     CAMPUS MAP SECTION (Leaflet.js)
  ======================================== */

  // Make sure a map container exists before initializing (so it doesn’t run on other pages)
  const mapContainer = document.getElementById("map");
  if (mapContainer) {
    // Create the map and set the initial view to ANU Acton coordinates
    const map = L.map('map').setView([-35.2777, 149.1185], 15); // [lat, lon], zoom level

    // Add the OpenStreetMap tile layer (the actual map tiles)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Markers for ANU buildings
    const buildings = [
      { name: "Chifley Library", lat: -35.2775560871438, lon:  149.12057360026606 },
      { name: "Manning Clark Centre", lat: -35.27661373305906, lon: 149.12270914393082 },
      { name: "Menzies Library", lat: -35.28202390521654, lon: 149.1181715965589 },
      { name: "Fellows Oval", lat: -35.27860711641909, lon: 149.11943634362598 },
      { name: "Hancock Library", lat: -35.27709314459486, lon: 149.1183454867746 },
      { name: "Law Library", lat: -35.28090340734622, lon: 149.11883273705394 }
    ];

    // Loop through the list and create markers for each building
    buildings.forEach(b => {
      L.marker([b.lat, b.lon])
        .addTo(map)
        .bindPopup(`<b>${b.name}</b>`);
    });
  }

  /* ========================================
   LOST & FOUND SECTION
======================================== */

const lostForm = document.getElementById('lost-found-form');
const lostContainer = document.getElementById('lost-found-posts');

if (lostForm && lostContainer) {
  const noPostsMsg = lostContainer.querySelector('p'); // the “No posts yet” message

  lostForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const item = document.getElementById('item-type').value;
    const location = document.getElementById('location').value;
    const details = document.getElementById('details').value;
    const photo = document.getElementById('photo').files[0];

    // Remove "No posts yet" message if it exists
    if (noPostsMsg && noPostsMsg.parentElement) {
      noPostsMsg.remove();
    }

    // Create post container
    const postDiv = document.createElement('div');
    postDiv.className = 'lost-item';

    // Create image
    const img = document.createElement('img');
    if (photo) img.src = URL.createObjectURL(photo);
    else img.src = 'images/placeholder.png';

    // Create info text
    const info = document.createElement('div');
    info.innerHTML = `
      <h4>${item}</h4>
      <p><strong>Location:</strong> ${location}</p>
      <p>${details}</p>
    `;

    // Append to container
    postDiv.appendChild(img);
    postDiv.appendChild(info);
    lostContainer.appendChild(postDiv);

    // Reset form
    lostForm.reset();
  });
  }



});
