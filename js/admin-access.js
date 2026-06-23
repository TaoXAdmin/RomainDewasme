(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.querySelector('.footer .footer__logo .logo__text');
    if (!trigger) return;

    let clickCount = 0;
    let resetTimer = null;

    trigger.addEventListener('click', () => {
      clickCount += 1;
      window.clearTimeout(resetTimer);

      if (clickCount >= 4) {
        window.location.href = 'gestion-spectacles.php';
        return;
      }

      resetTimer = window.setTimeout(() => {
        clickCount = 0;
      }, 1400);
    });
  });
})();
