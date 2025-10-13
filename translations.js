// ===============================
// CampusLink UI Script
// Handles: Language translation, dropdown menu, side navigation
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     i18n: TRANSLATION DICTIONARY & LANGUAGE HANDLING
  ======================================== */

  // Define supported translations for different languages
  const translations = {
    en: { title: "CampusLink", quickLinks: "Quick Links", news: "News" },
    es: { title: "CampusEnlace", quickLinks: "Accesos rápidos", news: "Noticias" },
    zh: { title: "校园链接", quickLinks: "快捷链接", news: "公告" },
    fr: { title: "CampusLien", quickLinks: "Liens rapides", news: "Actualités" }
  };

  /**
   * Apply a given language to the interface
   * @param {string} lang - Language code (e.g., "en", "es", "zh", "fr")
   */
  function applyLanguage(lang) {
    const dict = translations[lang] || translations.en;  // fallback to English
    document.documentElement.lang = lang;

    // Check if the language is Right-To-Left (e.g. Arabic, Hebrew)
    const rtlLangs = ["ar", "he", "fa", "ur"];
    document.documentElement.dir = rtlLangs.includes(lang) ? "rtl" : "ltr";

    // Replace all text marked with data-i18n attributes
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });

    // Save selected language for next visit
    localStorage.setItem("lang", lang);
  }

  // Detect browser language or use saved preference
  const normalize = l => (l || "en").toLowerCase().split("-")[0];
  applyLanguage(localStorage.getItem("lang") || normalize(navigator.language));

  /* ========================================
     LANGUAGE DROPDOWN MENU (UNDER GLOBE ICON)
  ======================================== */

  const langBtn  = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");

  // Helper functions to show/hide/toggle language menu
  function openLang() {
    langMenu?.classList.add("open");
    langBtn?.setAttribute("aria-expanded", "true");
  }

  function closeLang() {
    langMenu?.classList.remove("open");
    langBtn?.setAttribute("aria-expanded", "false");
  }

  function toggleLang() {
    langMenu?.classList.contains("open") ? closeLang() : openLang();
  }

  // Toggle menu when clicking the globe icon
  langBtn?.addEventListener("click", (e) => {
    e.stopPropagation();   // prevent document click handler from immediately closing it
    toggleLang();
  });

  // Change language when selecting from dropdown
  langMenu?.addEventListener("click", (e) => {
    const item = e.target.closest("[data-lang]");
    if (!item) return;                     // ignore clicks not on buttons
    applyLanguage(item.dataset.lang);      // apply chosen language
    closeLang();                           // close dropdown
  });

  /* ========================================
     RIGHT-SIDE NAVIGATION DRAWER (HAMBURGER MENU)
  ======================================== */

  const sidenav  = document.getElementById("mySidenav"); // Side navigation container
  const menuBtn  = document.getElementById("menuBtn");   // Hamburger button
  const closeBtn = sidenav?.querySelector(".closebtn");  // “×” button inside sidenav
  const main     = document.getElementById("main");      // Optional: shift main content when nav opens

  // Open navigation drawer
  function openNav() {
    sidenav?.classList.add("open");
    menuBtn?.setAttribute("aria-expanded", "true");
    sidenav?.setAttribute("aria-hidden", "false");
    if (main) main.style.marginRight = "280px";  // Match sidenav width
  }

  // Close navigation drawer
  function closeNav() {
    sidenav?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    sidenav?.setAttribute("aria-hidden", "true");
    if (main) main.style.marginRight = "0";
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

});
