document.addEventListener("DOMContentLoaded", () => {
  /* ========= i18n ========= */
  const translations = {
    en: { title: "CampusLink", quickLinks: "Quick Links", news: "News" },
    es: { title: "CampusEnlace", quickLinks: "Accesos rápidos", news: "Noticias" },
    zh: { title: "校园链接",        quickLinks: "快捷链接",       news: "公告" },
    fr: { title: "CampusLien",    quickLinks: "Liens rapides",  news: "Actualités" }
  };

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

  // initial language
  const normalize = l => (l || "en").toLowerCase().split("-")[0];
  applyLanguage(localStorage.getItem("lang") || normalize(navigator.language));

  /* ========= Language menu (under globe) ========= */
  const langBtn  = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");

  function openLang()  { langMenu?.classList.add("open");  langBtn?.setAttribute("aria-expanded","true"); }
  function closeLang() { langMenu?.classList.remove("open");langBtn?.setAttribute("aria-expanded","false"); }
  function toggleLang(){ langMenu?.classList.contains("open") ? closeLang() : openLang(); }

  langBtn?.addEventListener("click", (e) => { e.stopPropagation(); toggleLang(); });
  langMenu?.addEventListener("click", (e) => {
    const item = e.target.closest("[data-lang]");
    if (!item) return;
    applyLanguage(item.dataset.lang);
    closeLang();
  });

  /* ========= Right-side drawer (hamburger) ========= */
  const sidenav  = document.getElementById("mySidenav");     // <div id="mySidenav" class="sidenav">
  const menuBtn  = document.getElementById("menuBtn");       // <button id="menuBtn" ...>
  const closeBtn = sidenav?.querySelector(".closebtn");      // the × link/button inside
  const main     = document.getElementById("main");          // optional; shift content

  function openNav() {
    sidenav?.classList.add("open");                          // CSS .sidenav.open { transform: translateX(0) }
    menuBtn?.setAttribute("aria-expanded","true");
    sidenav?.setAttribute("aria-hidden","false");
    if (main) main.style.marginRight = "280px";              // match .sidenav width
  }
  function closeNav() {
    sidenav?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded","false");
    sidenav?.setAttribute("aria-hidden","true");
    if (main) main.style.marginRight = "0";
  }
  function toggleNav() {
    sidenav?.classList.contains("open") ? closeNav() : openNav();
  }

  menuBtn?.addEventListener("click", (e) => { e.stopPropagation(); toggleNav(); });
  closeBtn?.addEventListener("click", (e) => { e.preventDefault(); closeNav(); });

  /* ========= Global close handlers ========= */
  document.addEventListener("click", (e) => {
    // close language menu if clicking outside
    if (langMenu?.classList.contains("open") &&
        !langMenu.contains(e.target) && !langBtn?.contains(e.target)) {
      closeLang();
    }
    // close drawer if clicking outside it and not on the hamburger
    if (sidenav?.classList.contains("open") &&
        !sidenav.contains(e.target) && !menuBtn?.contains(e.target)) {
      closeNav();
    }
  });
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeLang(); closeNav(); }
  });
});
