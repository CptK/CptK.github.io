// Masonry layout that places cards in shortest column
(function() {
  function initMasonry() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    const cards = Array.from(container.children);
    if (cards.length === 0) return;

    // Determine number of columns based on screen width
    function getColumnCount() {
      const width = window.innerWidth;
      if (width >= 1200) return 3;
      if (width >= 768) return 2;
      return 1;
    }

    function layoutMasonry() {
      const columnCount = getColumnCount();

      // Reset container
      container.style.display = 'block';
      container.style.position = 'relative';

      // Initialize column heights
      const columnHeights = new Array(columnCount).fill(0);
      const columnWidth = container.offsetWidth / columnCount;
      const gap = 20; // 1.25rem in pixels

      // Place each card in the shortest column
      cards.forEach((card, index) => {
        // Find shortest column
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

        // Position card
        card.style.position = 'absolute';
        card.style.width = `calc(${100 / columnCount}% - ${gap * (columnCount - 1) / columnCount}px)`;
        card.style.left = `${shortestColumnIndex * (100 / columnCount)}%`;
        card.style.top = `${columnHeights[shortestColumnIndex]}px`;

        // Update column height (wait for images to load)
        const cardHeight = card.offsetHeight;
        columnHeights[shortestColumnIndex] += cardHeight + gap;
      });

      // Set container height to tallest column
      container.style.height = `${Math.max(...columnHeights)}px`;
    }

    // Layout on load
    layoutMasonry();

    // Re-layout on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(layoutMasonry, 250);
    });

    // Re-layout after images load
    const images = container.querySelectorAll('img');
    let loadedImages = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      layoutMasonry();
    } else {
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
          if (loadedImages === totalImages) {
            layoutMasonry();
          }
        } else {
          img.addEventListener('load', function() {
            loadedImages++;
            if (loadedImages === totalImages) {
              layoutMasonry();
            }
          });
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMasonry);
  } else {
    initMasonry();
  }
})();
