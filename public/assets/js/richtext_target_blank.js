      (function () {
        function updateRichTextLinks() {
          const anchors = document.querySelectorAll('.rich-text a[href^="http"]');
          anchors.forEach((a) => {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          });
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', updateRichTextLinks);
        } else {
          updateRichTextLinks();
        }
      })();
