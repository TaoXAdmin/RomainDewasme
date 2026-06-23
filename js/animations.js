/**
 * ANIMATIONS JAVASCRIPT
 * Site web magicien
 * Animations + comportements d'interface
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    initSimpleRevealEffects();
    initSpectaclesAnimations();
    initHomepageSpectacleLinks();
    initActusClickableRows();
    initFooterAdminAccess();
});

function initSimpleRevealEffects() {
    const elements = document.querySelectorAll('.reveal-element:not(.revealed), .reveal-text:not(.revealed)');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
}

function initSpectaclesAnimations() {
    const section = document.querySelector('.Spectacles');
    if (!section || typeof gsap === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const intro = section.querySelector('.Spectacles__intro');
    const cards = section.querySelectorAll('.spectacles-card');

    if (intro) {
        gsap.from(intro, {
            opacity: 0,
            y: 30,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: intro,
                start: 'top 84%',
                toggleActions: 'play none none none'
            }
        });
    }

    if (cards.length) {
        gsap.from(cards, {
            opacity: 0,
            y: 46,
            duration: 0.95,
            stagger: 0.16,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 72%',
                toggleActions: 'play none none none'
            }
        });
    }
}

function initHomepageSpectacleLinks() {
    const cards = document.querySelectorAll('.Spectacles .spectacles-card');
    if (!cards.length) return;

    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .Spectacles__cta-wrap { display: none !important; }
            .Spectacles .spectacles-card { cursor: pointer; }
            .Spectacles .spectacles-card__hint { display: none !important; }
        </style>
    `);

    cards.forEach((card) => {
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-haspopup', 'false');
        card.removeAttribute('aria-controls');
        card.removeAttribute('data-spectacle-trigger');
        card.removeAttribute('data-video-desktop');
        card.removeAttribute('data-video-mobile');

        card.addEventListener('click', goToActus, true);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopImmediatePropagation();
                window.location.href = 'actus.html';
            }
        }, true);
    });

    function goToActus(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.href = 'actus.html';
    }
}

function initActusClickableRows() {
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .actus-date-row[data-ticket-url] { cursor: pointer; }
            .actus-date-row[data-ticket-url]:focus-visible {
                outline: 2px solid #e6c555;
                outline-offset: 4px;
            }
        </style>
    `);

    function markRows() {
        document.querySelectorAll('.actus-date-row').forEach((row) => {
            const link = row.querySelector('.actus-date-row__ticket[href]');
            if (!link) return;

            row.dataset.ticketUrl = link.href;
            row.setAttribute('role', 'link');
            row.setAttribute('tabindex', '0');
            row.setAttribute('aria-label', `Ouvrir la billetterie - ${row.textContent.trim().replace(/\s+/g, ' ')}`);
        });
    }

    document.addEventListener('click', (event) => {
        const row = event.target.closest('.actus-date-row[data-ticket-url]');
        if (!row) return;
        if (event.target.closest('.actus-date-row__ticket')) return;

        window.open(row.dataset.ticketUrl, '_blank', 'noopener,noreferrer');
    }, true);

    document.addEventListener('keydown', (event) => {
        const row = event.target.closest('.actus-date-row[data-ticket-url]');
        if (!row) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        window.open(row.dataset.ticketUrl, '_blank', 'noopener,noreferrer');
    });

    markRows();

    const list = document.getElementById('actusList');
    if (list) {
        const observer = new MutationObserver(markRows);
        observer.observe(list, { childList: true, subtree: true });
    }
}

function initFooterAdminAccess() {
    const trigger = document.querySelector('.footer .footer__logo .logo__text');
    if (!trigger) return;

    let clickCount = 0;
    let resetTimer = null;

    trigger.addEventListener('click', () => {
        clickCount += 1;
        window.clearTimeout(resetTimer);

        if (clickCount >= 4) {
            window.location.href = 'gestion-events.php';
            return;
        }

        resetTimer = window.setTimeout(() => {
            clickCount = 0;
        }, 1400);
    });
}
