// ieAutom8n Complete White-Label & Branding Controller
(function() {
  const LOGO_URL = "https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png";
  const APP_NAME = "ieAutom8n";

  // 1. Landing page routing for root path
  const path = window.location.pathname;
  const isRoot = path === '/' || path === '';
  const hasAppParam = window.location.search.includes('app=1');

  if (isRoot && !hasAppParam && !document.cookie.includes('n8n-auth')) {
    window.location.replace('/landing.html');
    return;
  }

  // 2. Comprehensive text sanitization (replaces 'n8n' with 'ieAutom8n' everywhere)
  function sanitizeNodeText(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue && /\bn8n\b/i.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(/\bn8n\b/gi, APP_NAME);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'CODE') {
        for (const child of node.childNodes) {
          sanitizeNodeText(child);
        }
      }
    }
  }

  // 3. Logo replacement everywhere
  function replaceLogos() {
    // Target any n8n logo containers or SVG logos
    const logoContainers = document.querySelectorAll(
      '[data-test-id="n8n-logo"], div[class*="logoContainer"], div[class*="headerLogo"], .n8n-logo'
    );

    logoContainers.forEach(container => {
      if (container.dataset.ieBranded === "true") return;

      // Hide default SVGs
      container.querySelectorAll('svg').forEach(svg => {
        svg.style.setProperty('display', 'none', 'important');
      });

      if (!container.querySelector('.ie-custom-logo-pill')) {
        const brandBox = document.createElement('div');
        brandBox.className = 'ie-custom-logo-pill';
        brandBox.style.cssText = 'display: inline-flex; align-items: center; gap: 10px; cursor: pointer;';

        const img = document.createElement('img');
        img.src = LOGO_URL;
        img.alt = APP_NAME + ' Logo';
        img.style.cssText = 'width: 38px; height: 38px; border-radius: 50%; object-fit: contain; flex-shrink: 0;';

        const text = document.createElement('span');
        text.textContent = APP_NAME;
        text.style.cssText = 'font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: inherit;';

        brandBox.appendChild(img);
        brandBox.appendChild(text);
        container.appendChild(brandBox);
      }

      container.dataset.ieBranded = "true";
    });
  }

  // 4. Favicon & Document Title
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

  // Master branding runner
  function applyEverything() {
    updateMetadata();
    replaceLogos();
    if (document.body) {
      sanitizeNodeText(document.body);
    }
  }

  // Execution triggers
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyEverything);
  } else {
    applyEverything();
  }

  window.addEventListener("load", applyEverything);

  // Periodic check to capture async Vue renders and modals
  let count = 0;
  const timer = setInterval(() => {
    applyEverything();
    count++;
    if (count > 40) clearInterval(timer); // Runs for 20 seconds
  }, 500);

  // MutationObserver for continuous reactive changes
  const observer = new MutationObserver(() => {
    applyEverything();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
