(() => {
  // --- Configure your site pages here ---
  const PAGES = [
    { title: 'Home',              url: 'CampusLink.html',     keywords: ['home','campuslink','landing'] },
    { title: 'Job Portal',        url: 'jobs.html',           keywords: ['jobs','careers','internship'] },
    { title: 'Assessment Helper', url: 'assignment.html',     keywords: ['assignment','exam','grade','templates'] },
    { title: 'Resources',         url: 'resources.html',      keywords: ['library','articles','databases','resources'] },
    { title: 'Student Forum',     url: 'forum.html',          keywords: ['forum','groups','posts','community'] },
    { title: 'Lost & Found',      url: 'lost-found.html',     keywords: ['lost','found','items'] },
    { title: 'FAQ',               url: 'faq.html',            keywords: ['faq','help','support','questions'] }
  ];

  // --- Grab the search input in the header ---
  const input =
    document.getElementById('siteSearch') ||
    document.querySelector('header .group input[type="search"]');

  if (!input) return;

  // suggestions container
  const wrapper = input.closest('.group') || input.parentElement;
  const sug = document.createElement('div');
  sug.className = 'search-suggestions';
  sug.style.display = 'none';
  wrapper.style.position = 'relative';
  wrapper.appendChild(sug);

  let activeIndex = -1;

  function normalize(s){ return (s || '').toLowerCase().trim(); }

  function findPageMatches(q){
    const n = normalize(q);
    if (!n) return [];
    return PAGES
      .map(p => {
        const hay = [p.title, ...(p.keywords || [])].join(' ').toLowerCase();
        // simple score: startsWith > includes
        const starts = p.title.toLowerCase().startsWith(n) ? 2 : 0;
        const inc = hay.includes(n) ? 1 : 0;
        return { ...p, score: starts + inc };
      })
      .filter(p => p.score > 0)
      .sort((a,b) => b.score - a.score);
  }

  function openPage(url){
    window.location.href = url;
  }

  // --- In-page search + highlight ---
  function clearHighlights(){
    document.querySelectorAll('.search-highlight').forEach(mark => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  function highlightFirst(query){
    clearHighlights();
    const q = normalize(query);
    if (!q) return;

    const root = document.querySelector('main') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const tag = (node.parentElement?.tagName || '').toLowerCase();
        if (['script','style','noscript','input','textarea'].includes(tag)) return NodeFilter.FILTER_REJECT;
        const t = node.nodeValue;
        if (!t || !t.trim()) return NodeFilter.FILTER_REJECT;
        return t.toLowerCase().includes(q) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    let firstEl = null;
    while (walker.nextNode()){
      const node = walker.currentNode;
      const idx = node.nodeValue.toLowerCase().indexOf(q);
      if (idx === -1) continue;

      const before = node.nodeValue.slice(0, idx);
      const match  = node.nodeValue.slice(idx, idx + q.length);
      const after  = node.nodeValue.slice(idx + q.length);

      const span = document.createElement('span');
      span.innerHTML = `${escapeHtml(before)}<mark class="search-highlight">${escapeHtml(match)}</mark>${escapeHtml(after)}`;

      node.parentNode.replaceChild(span, node);

      if (!firstEl) firstEl = span.querySelector('.search-highlight');
    }

    if (firstEl){
      firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // --- Suggestions UI ---
  function renderSuggestions(list){
    if (!list.length){ sug.style.display = 'none'; activeIndex = -1; return; }
    sug.innerHTML = list.map((p,i) =>
      `<button data-i="${i}" ${i===activeIndex?'class="active"':''}>
         ${p.title}
       </button>`
    ).join('');
    sug.style.display = 'block';

    // click to open
    sug.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', e => {
        const i = Number(e.currentTarget.dataset.i);
        openPage(list[i].url);
      });
    });
  }

  function updateSuggestions(){
    const q = input.value;
    renderSuggestions(findPageMatches(q).slice(0,6));
  }

  input.addEventListener('input', updateSuggestions);

  input.addEventListener('keydown', (e) => {
    const matches = findPageMatches(input.value).slice(0,6);

    if (e.key === 'ArrowDown' && matches.length){
      e.preventDefault();
      activeIndex = (activeIndex + 1) % matches.length;
      renderSuggestions(matches);
      return;
    }
    if (e.key === 'ArrowUp' && matches.length){
      e.preventDefault();
      activeIndex = (activeIndex - 1 + matches.length) % matches.length;
      renderSuggestions(matches);
      return;
    }
    if (e.key === 'Escape'){
      sug.style.display = 'none';
      clearHighlights();
      input.blur();
      return;
    }
    if (e.key === 'Enter'){
      e.preventDefault();
      // Prefer site match, otherwise do in-page highlight
      if (matches.length){
        const choice = matches[activeIndex >=0 ? activeIndex : 0];
        openPage(choice.url);
      } else {
        highlightFirst(input.value);
        sug.style.display = 'none';
      }
    }
  });

  // close suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) sug.style.display = 'none';
  });
})();

