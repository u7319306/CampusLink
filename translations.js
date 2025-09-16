document.addEventListener("DOMContentLoaded", () => {
  /* 1) Translations */
  const translations = {
    en: { title: "CampusLink", quickLinks: "Quick Links", news: "News"},
    es: { title: "CampusEnlace", quickLinks: "Accesos rápidos", news: "Noticias" },
    zh: { title: "校园链接",        quickLinks: "快捷链接",       news: "公告" },
    fr: { title: "CampusLien",    quickLinks: "Liens rapides",  news: "Actualités" },
  };

  /* 2) Helper: apply language */
  function applyLanguage(lang) {
    const dict = translations[lang] || translations.en;
    document.documentElement.lang = lang;
    const rtlLangs = ["ar","he","fa","ur"];
    document.documentElement.dir = rtlLangs.includes(lang) ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });
    localStorage.setItem("lang", lang);
  }

  /* 3) UI wiring (safe after DOM ready) */
  const btn  = document.getElementById("langBtn");
  const menu = document.getElementById("langMenu");

  if (!btn || !menu) return; // guard if IDs missing

  // Link ARIA
  btn.setAttribute("aria-controls", "langMenu");

  function openMenu()  { menu.classList.add("open");  btn.setAttribute("aria-expanded", "true"); }
  function closeMenu() { menu.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  function toggleMenu(){ menu.classList.contains("open") ? closeMenu() : openMenu(); }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();            // prevent immediate "outside click" close
    toggleMenu();
  });

  menu.addEventListener("click", (e) => {
    const item = e.target.closest("[data-lang]");
    if (!item) return;
    applyLanguage(item.dataset.lang);
    closeMenu();
  });

  // Close on outside click (use .contains for SVG inside the button)
  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    if (btn.contains(e.target) || menu.contains(e.target)) return;
    closeMenu();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* 4) On load: use saved language or browser default */
  const saved = localStorage.getItem("lang") || (navigator.language || "en").split("-")[0];
  applyLanguage(saved);
});
