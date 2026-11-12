// ieAutom8n White-Label & Landing Page Controller
(function() {
  const LOGO_URL = "https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png";
  const APP_NAME = "ieAutom8n";

  // 1. Landing Page Redirection logic
  const path = window.location.pathname;
  const isRoot = path === '/' || path === '';
  const hasAppParam = window.location.search.includes('app=1');

  // If visitor lands on root without explicit app param or auth cookie, show landing page
  if (isRoot && !hasAppParam && !document.cookie.includes('n8n-auth')) {
    window.location.replace('/landing.html');
    return;
  }

  // 2. Continuous branding & text sanitizer
  function applyBranding() {
    // Document Title
    if (!document.title.includes(APP_NAME)) {
      document.title = document.title.replace(/n8n(\.io)?/gi, APP_NAME);
      if (!document.title.includes(APP_NAME)) {
        document.title = APP_NAME + " - Workflow Automation";
      }
    }

    // Favicon
    let favicon = document.querySelector("link[rel*='icon']");
    if (favicon && favicon.href !== LOGO_URL) {
      favicon.href = LOGO_URL;
    }

    // Replace text in modals, headers, dialogs
    const textContainers = document.querySelectorAll(
      'div[role="dialog"], div[class*="modal"], div[class*="container"], h1, h2, h3, p, label, .el-dialog'
    );
    textContainers.forEach(el => {
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.includes('n8n')) {
          node.nodeValue = node.nodeValue.replace(/n8n/gi, APP_NAME);
        }
      }
    });

    // Replace SVG logos with Company Logo
    const logoContainers = document.querySelectorAll('[data-test-id="n8n-logo"], div[class*="logoContainer"]');
    logoContainers.forEach(container => {
      if (container.dataset.ieBranded === "true") return;

      container.querySelectorAll('svg').forEach(svg => {
        svg.style.setProperty('display', 'none', 'important');
      });

      if (!container.querySelector('.ie-brand-rendered')) {
        const brandWrapper = document.createElement('div');
        brandWrapper.className = 'ie-brand-rendered';
        brandWrapper.style.cssText = 'display: inline-flex; align-items: center; gap: 10px; cursor: pointer;';

        const img = document.createElement('img');
        img.src = LOGO_URL;
        img.alt = APP_NAME + ' Logo';
        img.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; object-fit: contain; flex-shrink: 0;';

        const label = document.createElement('span');
        label.textContent = APP_NAME;
        label.style.cssText = 'font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: inherit;';

        brandWrapper.appendChild(img);
        brandWrapper.appendChild(label);
        container.appendChild(brandWrapper);
      }

      container.dataset.ieBranded = "true";
    });
  }

  // Run on load and on every DOM mutation (Vue reactive updates)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyBranding);
  } else {
    applyBranding();
  }

  const observer = new MutationObserver(applyBranding);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
