(function () {
  function initCarousel(container) {
    const track = container.querySelector('[data-carousel-track]');
    if (!track) return;

    const slides = track.children;
    const total = slides.length;
    if (total === 0) return;

    let index = 0;
    let timer;
    const autoPlay = true;
    const interval = 8000;              // ms between auto-advances
    const pauseAfterInteraction = 5000; // ms before resuming after a click

    function update() {
      track.style.transform = 'translateX(-' + index * 100 + '%)';
    }

    function startAutoPlay() {
      if (!autoPlay || total <= 1) return;
      clearInterval(timer);
      timer = setInterval(function () {
        index = (index + 1) % total;
        update();
      }, interval);
    }

    // Initial state
    update();
    startAutoPlay();

    // Handle clicks
    var buttons = container.querySelectorAll('[data-carousel-dir]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-carousel-dir');
        if (dir === 'prev') {
          index = (index - 1 + total) % total;
        } else {
          index = (index + 1) % total;
        }
        update();

        // Pause auto-play after interaction, then resume
        clearInterval(timer);
        if (autoPlay && total > 1) {
          setTimeout(startAutoPlay, pauseAfterInteraction);
        }
      });
    });
  }

  function initAllCarousels(root) {
    // Default to document if no root provided
    var containers = (root || document).querySelectorAll('[data-carousel]');
    containers.forEach(function (container) {
      // Avoid initialising the same carousel twice
      if (container.dataset.carouselInit === 'true') return;

      container.dataset.carouselInit = 'true';
      initCarousel(container);
    });
  }

  if (typeof window !== 'undefined') {
    // Initial page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        initAllCarousels(document);
      });
    } else {
      initAllCarousels(document);
    }

    // Watch for DOM changes (Astro ClientRouter swaps content without full reload)
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (!(node instanceof HTMLElement)) return;
          // Initialise carousels in this subtree
          initAllCarousels(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
