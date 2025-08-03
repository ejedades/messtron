window.addEventListener('DOMContentLoaded', () => {
  
  const isLoginPage = () => {
      return window.location.pathname.includes('/login') || !!document.querySelector('#login_form');
  };

  const hideElements = () => {
    // Hide footer if it contains © Meta
    const footer = document.querySelector('footer[role="contentinfo"]');
    if (footer instanceof HTMLElement && footer.textContent?.includes('© Meta')) {
      footer.style.display = 'none';

      // Reset siblings on the same level
      const siblings = Array.from(footer.parentElement?.children || []);
      siblings.forEach(sibling => {
        if (sibling instanceof HTMLElement && sibling !== footer) {
          sibling.style.margin = '0';
          sibling.style.padding = '0';
          sibling.style.overflow = 'hidden';
        }
      });
    }

    // Hide download link containers
    document.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (
        href.includes('apps.apple.com') ||
        href.includes('microsoft.com') ||
        href.includes('play.google.com')
      ) {
        const container = a.closest('div');
        if (container instanceof HTMLElement) {
          container.style.display = 'none';
        }
      }
    });

    // Hide nav labels and parent sections
    const navTexts = [
      'Messenger',
      'Features',
      'Privacy and Safety',
      'Desktop App',
      'For Developers',
      'Help Center'
    ];
    navTexts.forEach(text => {
      const el = Array.from(document.querySelectorAll('a, span, div, button')).find(
        e => e.textContent?.trim() === text
      );
      if (el instanceof HTMLElement) {
        el.style.display = 'none';

        // Walk upward and hide container element
        let parent = el.parentElement;
        while (parent && !['DIV', 'NAV', 'HEADER'].includes(parent.tagName)) {
          parent = parent.parentElement;
        }
        if (parent instanceof HTMLElement) {
          parent.style.display = 'none';
        }
      }
    });

    // Hide main header and fix siblings
    const mainHeader = document.querySelector('header[role="banner"][aria-label="Header"]');
    if (mainHeader instanceof HTMLElement) {
      mainHeader.style.display = 'none';

      const siblings = Array.from(mainHeader.parentElement?.children || []);
      siblings.forEach(sibling => {
        if (sibling instanceof HTMLElement && sibling !== mainHeader) {
          sibling.style.margin = '0';
          sibling.style.padding = '0';
          sibling.style.overflow = 'hidden';
        }
      });
    }

    // Safety fallback
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  };

  if (isLoginPage()) {
    hideElements();
    setTimeout(hideElements, 1000);
  }
});
