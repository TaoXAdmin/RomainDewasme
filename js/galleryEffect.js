// gallery.js
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.gallery__item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      target.classList.toggle('is-active', isIntersecting);
    });
  }, { threshold: 1 });

  items.forEach(item => {
    observer.observe(item);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const next = item.nextElementSibling;
        if (next) next.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
});
