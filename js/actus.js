const ACTUS_DATA_URL = '/data/events.json';


document.addEventListener('DOMContentLoaded', () => {
  const loaderEl = document.getElementById('actusLoader');
  const listEl = document.getElementById('actusList');
  const emptyEl = document.getElementById('actusEmpty');
  const showTpl = document.getElementById('actusShowTemplate');
  const eventTpl = document.getElementById('actusEventTemplate');

  if (!listEl || !emptyEl || !showTpl || !eventTpl) return;

  initActusPage();

  async function initActusPage() {
    try {
      const data = await fetchActusData();
      const shows = normalizeShows(data);

      if (!shows.length) {
        emptyEl.hidden = false;
      } else {
        renderShows(shows);
        initTeaserModal();
      }
    } catch (error) {
      console.error('Erreur chargement spectacles :', error);
      emptyEl.hidden = false;
    } finally {
      if (loaderEl) {
        setTimeout(() => {
          loaderEl.classList.add('hidden');
        }, 120);
      }
    }
  }

  async function fetchActusData() {
    const separator = ACTUS_DATA_URL.includes('?') ? '&' : '?';
    const response = await fetch(`${ACTUS_DATA_URL}${separator}v=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  function normalizeTicketUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';

    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    return `https://${raw}`;
  }

  function hasRealMediaValue(value) {
    const raw = String(value || '').trim().toLowerCase();

    if (!raw) return false;
    if (raw === 'null' || raw === 'undefined' || raw === 'false') return false;

    return true;
  }

  function normalizeShows(data) {
    const rawShows = Array.isArray(data)
      ? data
      : (data && Array.isArray(data.shows) ? data.shows : []);

    return rawShows
      .map((show) => {
        const events = Array.isArray(show.events)
          ? [...show.events]
              .map(normalizeEvent)
              .filter(Boolean)
          : [];

        return {
          name: String(show.name || show.title || show.titre || '').trim(),
          poster: String(show.poster || show.affiche || '').trim(),
          audience: String(show.audience || '').trim().toUpperCase(),
          artists: normalizeArtists(show.artists),
          teaserDesktop: String(show.teaserDesktop || '').trim(),
          teaserMobile: String(show.teaserMobile || '').trim(),
          events
        };
      })
      .filter((show) => show.name && show.events.length);
  }

  function normalizeEvent(event) {
    if (!event || typeof event !== 'object') return null;

    const displayDate = String(event.displayDate || event.date || '').trim();
    const venue = String(event.venue || event.lieu || event.place || '').trim();
    const ticketUrl = String(event.ticketUrl || event.billetterie || event.ticket || event.url || '').trim();

    if (!displayDate || !venue) return null;

    return { displayDate, venue, ticketUrl };
  }

  function normalizeArtists(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function renderShows(shows) {
    const fragment = document.createDocumentFragment();

    shows.forEach((show) => {
      const showNode = buildShowNode(show);
      fragment.appendChild(showNode);
    });

    listEl.innerHTML = '';
    listEl.appendChild(fragment);
  }

  function buildShowNode(show) {
    const fragment = showTpl.content.cloneNode(true);

    const article = fragment.querySelector('.actus-show');
    const poster = fragment.querySelector('.actus-show__poster');
    const posterVisual = fragment.querySelector('.actus-show__poster-visual');
    const title = fragment.querySelector('.actus-show__title');
    const audience = fragment.querySelector('.actus-show__audience');
    const featuring = fragment.querySelector('.actus-show__featuring');
    const featuringText = fragment.querySelector('.actus-show__featuring-text');
    const teaserWrap = fragment.querySelector('.actus-show__teaser-wrap');
    const teaserBtn = fragment.querySelector('.actus-show__teaser-btn');
    const eventsList = fragment.querySelector('.actus-show__events');

    if (show.poster) {
      posterVisual.style.backgroundImage = `url("${show.poster}")`;
    } else {
      posterVisual.removeAttribute('style');
      posterVisual.setAttribute('aria-hidden', 'true');
    }

    poster.setAttribute('aria-label', `Affiche du spectacle ${show.name}`);
    title.textContent = show.name;
    audience.textContent = show.audience || 'TOUT PUBLIC';

    if (Array.isArray(show.artists) && show.artists.length) {
      featuring.hidden = false;
      featuring.removeAttribute('hidden');
      featuringText.textContent = show.artists.join(', ');
    } else {
      featuring.hidden = true;
      featuring.setAttribute('hidden', '');
      featuringText.textContent = '';
    }

    const desktopTeaser = String(show.teaserDesktop || '').trim();
    const mobileTeaser = String(show.teaserMobile || '').trim();
    const hasDesktopTeaser = hasRealMediaValue(desktopTeaser);
    const hasMobileTeaser = hasRealMediaValue(mobileTeaser);
    const hasTeaser = Boolean(hasDesktopTeaser || hasMobileTeaser);

    teaserWrap.hidden = true;
    teaserWrap.setAttribute('hidden', '');
    teaserWrap.style.display = 'none';
    poster.classList.remove('spectacles-card--interactive');

    delete poster.dataset.videoDesktop;
    delete poster.dataset.videoMobile;
    delete poster.dataset.spectacleName;
    delete teaserBtn.dataset.videoDesktop;
    delete teaserBtn.dataset.videoMobile;
    delete teaserBtn.dataset.spectacleName;

    if (hasTeaser) {
      const finalDesktopTeaser = hasDesktopTeaser ? desktopTeaser : mobileTeaser;
      const finalMobileTeaser = hasMobileTeaser ? mobileTeaser : desktopTeaser;

      teaserWrap.hidden = false;
      teaserWrap.removeAttribute('hidden');
      teaserWrap.style.display = '';
      poster.classList.add('spectacles-card--interactive');

      poster.dataset.videoDesktop = finalDesktopTeaser;
      poster.dataset.videoMobile = finalMobileTeaser;
      poster.dataset.spectacleName = show.name;

      teaserBtn.dataset.videoDesktop = finalDesktopTeaser;
      teaserBtn.dataset.videoMobile = finalMobileTeaser;
      teaserBtn.dataset.spectacleName = show.name;
    }

    const eventsFragment = document.createDocumentFragment();

    show.events.forEach((event) => {
      const eventNode = buildEventNode(event);
      if (eventNode) {
        eventsFragment.appendChild(eventNode);
      }
    });

    eventsList.appendChild(eventsFragment);

    return article;
  }

  function buildEventNode(event) {
    const displayDate = String(event.displayDate || '').trim();
    const venue = String(event.venue || '').trim();
    const ticketUrl = normalizeTicketUrl(event.ticketUrl);

    if (!displayDate || !venue) return null;

    const fragment = eventTpl.content.cloneNode(true);
    const link = fragment.querySelector('.actus-show__event-link');
    const date = fragment.querySelector('.actus-show__event-date');
    const place = fragment.querySelector('.actus-show__event-place');

    date.textContent = displayDate;
    place.textContent = venue;

    if (ticketUrl) {
      link.href = ticketUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      const staticCard = document.createElement('div');
      staticCard.className = 'actus-show__event-link actus-show__event-link--static';

      const textWrap = document.createElement('div');
      textWrap.className = 'actus-show__event-text';
      textWrap.appendChild(date.cloneNode(true));
      textWrap.appendChild(place.cloneNode(true));

      staticCard.appendChild(textWrap);
      link.replaceWith(staticCard);
    }

    return fragment;
  }

  function initTeaserModal() {
    const modal = document.getElementById('spectacleModal');
    const video = document.getElementById('spectacleModalVideo');
    const replayBtn = document.getElementById('spectacleModalReplay');

    if (!modal || !video || !replayBtn) return;

    const closeBtn = modal.querySelector('.spectacle-modal__close');
    const backdrop = modal.querySelector('.spectacle-modal__backdrop');
    const sources = modal.querySelectorAll('source');
    const clickableItems = document.querySelectorAll('[data-video-desktop], [data-video-mobile]');
    let lastTrigger = null;

    clickableItems.forEach((item) => {
      item.addEventListener('click', () => openModal(item));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    replayBtn.addEventListener('click', () => {
      video.currentTime = 0;
      video.play();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });

    function openModal(trigger) {
      const desktopVideo = trigger.dataset.videoDesktop;
      const mobileVideo = trigger.dataset.videoMobile || desktopVideo;
      const name = trigger.dataset.spectacleName || 'le spectacle';

      if (!hasRealMediaValue(desktopVideo) && !hasRealMediaValue(mobileVideo)) return;

      lastTrigger = trigger;
      video.pause();
      video.removeAttribute('src');

      sources.forEach((source) => {
        const isMobileSource = source.media && source.media.includes('max-width');
        source.src = isMobileSource ? mobileVideo : desktopVideo;
      });

      video.load();
      video.setAttribute('aria-label', `Teaser du spectacle ${name}`);

      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }

      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      video.pause();
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');

      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
      }
    }
  }
});
