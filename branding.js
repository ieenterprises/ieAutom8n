// ieAutom8n Branding & White-Label Injector
(function() {
  const LOGO_URL = "https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png";
  const APP_NAME = "ieAutom8n";

  function applyBranding() {
    // 1. Update document title
    if (!document.title.includes(APP_NAME)) {
      document.title = document.title.replace(/n8n(\.io)?/gi, APP_NAME);
      if (!document.title.includes(APP_NAME)) {
        document.title = APP_NAME + " - Workflow Automation";
      }
    }

    // 2. Update favicon
    let favicon = document.querySelector("link[rel*='icon']");
    if (favicon && favicon.href !== LOGO_URL) {
      favicon.href = LOGO_URL;
    }

    // 3. Find and brand all logo containers
    const logoContainers = document.querySelectorAll('[data-test-id="n8n-logo"], .logoContainer');
    logoContainers.forEach(container => {
      if (container.dataset.ieBranded === "true") return;

      // Hide SVGs
      const svgs = container.querySelectorAll('svg');
      svgs.forEach(svg => svg.style.setProperty('display', 'none', 'important'));

      // If already has custom element, don't re-add
      if (!container.querySelector('.ie-brand-container')) {
        const brandWrapper = document.createElement('div');
        brandWrapper.className = 'ie-brand-container';
        brandWrapper.style.cssText = 'display: inline-flex; align-items: center; gap: 10px; cursor: pointer;';

        const img = document.createElement('img');
        img.src = LOGO_URL;
        img.alt = APP_NAME + ' Logo';
        img.style.cssText = 'width: 36px; height: 36px; border-radius: 50%; object-fit: contain; flex-shrink: 0;';

        const label = document.createElement('span');
        label.textContent = APP_NAME;
        label.style.cssText = 'font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: inherit;';

        brandWrapper.appendChild(img);
        brandWrapper.appendChild(label);

        // Clear existing text/nodes except hidden svgs
        Array.from(container.childNodes).forEach(node => {
          if (node.nodeName !== 'SVG') node.remove();
        });

        container.appendChild(brandWrapper);
      }

      container.dataset.ieBranded = "true";
    });
  }

  // Run immediately and observe dynamic changes in Vue
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyBranding);
  } else {
    applyBranding();
  }

  const observer = new MutationObserver(() => {
    applyBranding();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
