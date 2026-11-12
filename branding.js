// ieAutom8n Enterprise White-Label Controller
(function() {
  const LOGO_URL = "https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png";
  const APP_NAME = "ieAutom8n";

  // 1. Landing page redirect for root visitors who aren't logged in
  const path = window.location.pathname;
  const isRoot = path === '/' || path === '';
  const hasAppParam = window.location.search.includes('app=1');

  if (isRoot && !hasAppParam && !document.cookie.includes('n8n-auth')) {
    window.location.replace('/static/landing.html');
    return;
  }

  // 2. High-performance DOM text walker using TreeWalker
  function sanitizeAllText() {
    if (!document.body) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') {
            return NodeFilter.FILTER_REJECT;
          }
          if (/n8n/i.test(node.nodeValue)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      node.nodeValue = node.nodeValue.replace(/n8n/gi, APP_NAME);
    }
  }

  // 3. Universal logo replacement
  function replaceLogos() {
    const logoContainers = document.querySelectorAll(
      '[data-test-id="n8n-logo"], div[class*="logoContainer"], div[class*="headerLogo"], .n8n-logo'
    );

    logoContainers.forEach(container => {
      if (container.dataset.ieBranded === "true") return;

      container.querySelectorAll('svg').forEach(svg => {
        svg.style.setProperty('display', 'none', 'important');
      });

      if (!container.querySelector('.ie-brand-pill')) {
        const brand = document.createElement('div');
        brand.className = 'ie-brand-pill';
        brand.style.cssText = 'display: inline-flex; align-items: center; gap: 10px; cursor: pointer;';

        const img = document.createElement('img');
        img.src = LOGO_URL;
        img.alt = APP_NAME + ' Logo';
        img.style.cssText = 'width: 36px; height: 36px; border-radius: 50%; object-fit: contain; flex-shrink: 0;';

        const label = document.createElement('span');
        label.textContent = APP_NAME;
        label.style.cssText = 'font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: inherit;';

        brand.appendChild(img);
        brand.appendChild(label);
        container.appendChild(brand);
      }

      container.dataset.ieBranded = "true";
    });
  }

  // 4. Update Favicon & Document Title
  function updateMetadata() {
    if (!document.title.includes(APP_NAME)) {
      document.title = document.title.replace(/n8n(\.io)?/gi, APP_NAME);
      if (!document.title.includes(APP_NAME)) {
        document.title = APP_NAME + " - Workflow Automation";
      }
    }

    let favicon = document.querySelector("link[rel*='icon']");
    if (favicon && favicon.href !== LOGO_URL) {
      favicon.href = LOGO_URL;
    }
  }

  function applyBrand() {
    updateMetadata();
    replaceLogos();
    sanitizeAllText();
  }

  // Run on lifecycle events
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyBrand);
  } else {
    applyBrand();
  }

  window.addEventListener("load", applyBrand);

  // Poll regularly during initial mount
  let runs = 0;
  const poll = setInterval(() => {
    applyBrand();
    runs++;
    if (runs > 30) clearInterval(poll);
  }, 400);

  // Observer for reactive changes
  const observer = new MutationObserver(() => {
    applyBrand();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
