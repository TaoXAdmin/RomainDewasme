const ACTUS_API_URL = 'https://script.google.com/macros/s/AKfycbyub3b6NUBaQU3VqFUck5pRA0hJoJRU8MORJebEtqxV9OnyWX9OAexOPHlki_V2ENDE/exec'; // À remplacer plus tard par l’URL Apps Script

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
    console.error('Erreur chargement actus :', error);
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
    if (!ACTUS_API_URL) {
      return { success: true, shows: [] };
    }

    const response = await fetch(ACTUS_API_URL, {
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
    if (!data || data.success !== true || !Array.isArray(data.shows)) {
      return [];
    }

    return data.shows
      .map((show) => {
        const events = Array.isArray(show.events)
          ? [...show.events].sort((a, b) => {
              const da = new Date(a.date || a.displayDate || 0).getTime();
              const db = new Date(b.date || b.displayDate || 0).getTime();
              return da - db;
            })
          : [];

        return {
          name: String(show.name || '').trim(),
          poster: String(show.poster || '').trim(),
          audience: String(show.audience || '').trim().toUpperCase(),
          artists: normalizeArtists(show.artists),
          teaserDesktop: String(show.teaserDesktop || '').trim(),
          teaserMobile: String(show.teaserMobile || '').trim(),	
          events
        };
      })
      .filter((show) => show.name && show.poster && show.events.length);
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

  posterVisual.style.backgroundImage = `url("${show.poster}")`;
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

  const hasDesktopTeaser =
    desktopTeaser &&
    desktopTeaser !== 'null' &&
    desktopTeaser !== 'undefined' &&
    desktopTeaser !== 'false';

  const hasMobileTeaser =
    mobileTeaser &&
    mobileTeaser !== 'null' &&
    mobileTeaser !== 'undefined' &&
    mobileTeaser !== 'false';

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
  } else {
    const staticCard = document.createElement('div');
    staticCard.className = 'actus-show__event-link actus-show__event-link--static';

    const dateClone = date.cloneNode(true);
    const placeClone = place.cloneNode(true);

    staticCard.appendChild(dateClone);
    staticCard.appendChild(placeClone);

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
    const mqMobile = window.matchMedia('(max-width: 1249px)');

    let isOpen = false;
    let isClosing = false;

    function getVideoSrc(trigger) {
      return mqMobile.matches
        ? trigger.dataset.videoMobile
        : trigger.dataset.videoDesktop;
    }

    function prepareVideo(trigger) {
      const src = getVideoSrc(trigger);
      if (!src) return false;

      if (video.dataset.currentSrc !== src) {
        video.src = src;
        video.dataset.currentSrc = src;
        video.load();
      }

      video.volume = 0.65;
      replayBtn.hidden = true;
      modal.classList.remove('is-ended');
      return true;
    }

    async function openModal(trigger) {
      if (isOpen || isClosing) return;
      if (!prepareVideo(trigger)) return;

      video.currentTime = 0;
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('spectacle-modal-open');

      void modal.offsetWidth;

      requestAnimationFrame(() => {
        modal.classList.add('is-open');
      });

      isOpen = true;

      try {
        await video.play();
      } catch (err) {
        console.warn('Lecture bloquée :', err);
      }
    }

    function closeModal() {
      if (!isOpen || isClosing) return;

      isClosing = true;
      modal.classList.remove('is-open', 'is-ended');

      setTimeout(() => {
        video.pause();
        video.currentTime = 0;
        replayBtn.hidden = true;
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('spectacle-modal-open');
        isOpen = false;
        isClosing = false;
      }, 420);
    }

    async function replayVideo() {
      replayBtn.hidden = true;
      modal.classList.remove('is-ended');
      video.currentTime = 0;

      try {
        await video.play();
      } catch (err) {
        console.warn('Replay bloqué :', err);
      }
    }

    async function togglePlayback() {
      if (video.ended) return;

      if (video.paused) {
        try {
          await video.play();
        } catch (err) {
          console.warn('Reprise bloquée :', err);
        }
      } else {
        video.pause();
      }
    }

    document.addEventListener('click', (event) => {
      const posterTrigger = event.target.closest('.actus-show__poster.spectacles-card--interactive');
      const teaserTrigger = event.target.closest('.actus-show__teaser-btn');

      if (posterTrigger) {
        openModal(posterTrigger);
        return;
      }

      if (teaserTrigger) {
        openModal(teaserTrigger);
      }
    });

    document.addEventListener('keydown', (event) => {
      const trigger = event.target.closest('.actus-show__poster.spectacles-card--interactive');
      if (!trigger) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(trigger);
      }
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    replayBtn.addEventListener('click', replayVideo);
    video.addEventListener('click', togglePlayback);

    video.addEventListener('ended', () => {
      modal.classList.add('is-ended');
      replayBtn.hidden = false;
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    });
  }
});