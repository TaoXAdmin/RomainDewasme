const ACTUS_DATA_URL = '/data/events.json';


document.addEventListener('DOMContentLoaded', () => {
  const loaderEl = document.getElementById('actusLoader');
  const listEl = document.getElementById('actusList');
  const emptyEl = document.getElementById('actusEmpty');

  if (!listEl || !emptyEl) return;

  injectScheduleStyles();
  initActusPage();

  async function initActusPage() {
    try {
      const data = await fetchActusData();
      const events = normalizeEvents(data)
        .filter((event) => !isPastEvent(event))
        .sort(sortEventsByDate);

      if (!events.length) {
        emptyEl.hidden = false;
      } else {
        renderEvents(events);
      }
    } catch (error) {
      console.error('Erreur chargement dates spectacles :', error);
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

  function normalizeEvents(data) {
    const shows = Array.isArray(data)
      ? data
      : (data && Array.isArray(data.shows) ? data.shows : []);

    return shows.flatMap((show) => {
      const showName = String(show.name || show.title || show.titre || 'Spectacle').trim();
      const audience = String(show.audience || '').trim().toUpperCase();
      const artists = normalizeArtists(show.artists);
      const events = Array.isArray(show.events) ? show.events : [];

      return events.map((event) => {
        const displayDate = String(event.displayDate || event.date || '').trim();
        const venue = String(event.venue || event.lieu || event.place || '').trim();
        const ticketUrl = normalizeTicketUrl(event.ticketUrl || event.billetterie || event.ticket || event.url || '');
        const parsedDate = parseDate(displayDate);

        return {
          showName,
          audience,
          artists,
          displayDate,
          venue,
          ticketUrl,
          parsedDate
        };
      });
    }).filter((event) => event.showName && event.displayDate && event.venue);
  }

  function normalizeArtists(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
  }

  function normalizeTicketUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  }

  function parseDate(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return null;

    const cleaned = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const numericMatch = cleaned.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2,4})$/);
    if (numericMatch) {
      const day = Number(numericMatch[1]);
      const month = Number(numericMatch[2]);
      const year = normalizeYear(Number(numericMatch[3]));
      return makeDate(year, month, day);
    }

    const isoMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]);
      const day = Number(isoMatch[3]);
      return makeDate(year, month, day);
    }

    const months = {
      janvier: 1,
      fevrier: 2,
      mars: 3,
      avril: 4,
      mai: 5,
      juin: 6,
      juillet: 7,
      aout: 8,
      septembre: 9,
      octobre: 10,
      novembre: 11,
      decembre: 12
    };

    const textMatch = cleaned.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{2,4})$/);
    if (textMatch && months[textMatch[2]]) {
      const day = Number(textMatch[1]);
      const month = months[textMatch[2]];
      const year = normalizeYear(Number(textMatch[3]));
      return makeDate(year, month, day);
    }

    return null;
  }

  function normalizeYear(year) {
    return year < 100 ? 2000 + year : year;
  }

  function makeDate(year, month, day) {
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function todayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function isPastEvent(event) {
    if (!event.parsedDate) return false;
    return event.parsedDate < todayStart();
  }

  function sortEventsByDate(a, b) {
    if (a.parsedDate && b.parsedDate) return a.parsedDate - b.parsedDate;
    if (a.parsedDate && !b.parsedDate) return -1;
    if (!a.parsedDate && b.parsedDate) return 1;
    return a.displayDate.localeCompare(b.displayDate, 'fr');
  }

  function formatDateParts(event) {
    if (!event.parsedDate) {
      return { day: event.displayDate, month: '', year: '' };
    }

    const month = event.parsedDate.toLocaleDateString('fr-BE', { month: 'short' }).replace('.', '');
    return {
      day: String(event.parsedDate.getDate()).padStart(2, '0'),
      month: month.toUpperCase(),
      year: String(event.parsedDate.getFullYear())
    };
  }

  function renderEvents(events) {
    const wrapper = document.createElement('section');
    wrapper.className = 'actus-schedule';
    wrapper.setAttribute('aria-label', 'Dates des spectacles à venir');

    const intro = document.createElement('div');
    intro.className = 'actus-schedule__intro';
    intro.innerHTML = `
      <h2 class="actus-schedule__title">Réserver ma place</h2>
      <p class="actus-schedule__text">Choisissez votre date et accédez directement à la billetterie.</p>
    `;
    wrapper.appendChild(intro);

    const list = document.createElement('div');
    list.className = 'actus-schedule__list';

    events.forEach((event) => {
      list.appendChild(buildEventRow(event));
    });

    wrapper.appendChild(list);
    listEl.innerHTML = '';
    listEl.appendChild(wrapper);
  }

  function buildEventRow(event) {
    const parts = formatDateParts(event);
    const row = document.createElement('article');
    row.className = 'actus-date-row';

    const date = document.createElement('div');
    date.className = event.parsedDate ? 'actus-date-row__date' : 'actus-date-row__date actus-date-row__date--wide';
    date.innerHTML = `
      <span class="actus-date-row__day">${escapeHtml(parts.day)}</span>
      ${parts.month ? `<span class="actus-date-row__month">${escapeHtml(parts.month)}</span>` : ''}
      ${parts.year ? `<span class="actus-date-row__year">${escapeHtml(parts.year)}</span>` : ''}
    `;

    const content = document.createElement('div');
    content.className = 'actus-date-row__content';

    const title = document.createElement('h3');
    title.className = 'actus-date-row__title';
    title.textContent = event.showName;

    const meta = document.createElement('div');
    meta.className = 'actus-date-row__meta';

    const fullDate = document.createElement('span');
    fullDate.className = 'actus-date-row__meta-item';
    fullDate.innerHTML = `<span class="actus-date-row__meta-label">Date</span><span>${escapeHtml(event.displayDate)}</span>`;

    const venue = document.createElement('span');
    venue.className = 'actus-date-row__meta-item';
    venue.innerHTML = `<span class="actus-date-row__meta-label">Lieu</span><span>${escapeHtml(event.venue)}</span>`;

    meta.appendChild(fullDate);
    meta.appendChild(venue);

    if (event.audience) {
      const audience = document.createElement('span');
      audience.className = 'actus-date-row__badge';
      audience.textContent = event.audience;
      meta.appendChild(audience);
    }

    content.appendChild(title);
    content.appendChild(meta);

    if (event.artists.length) {
      const artists = document.createElement('p');
      artists.className = 'actus-date-row__artists';
      artists.textContent = `Avec ${event.artists.join(', ')}`;
      content.appendChild(artists);
    }

    const action = document.createElement('div');
    action.className = 'actus-date-row__action';

    if (event.ticketUrl) {
      const link = document.createElement('a');
      link.className = 'actus-date-row__ticket';
      link.href = event.ticketUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = `
        <span class="actus-date-row__ticket-text">Billetterie</span>
        <span class="actus-date-row__ticket-icon" aria-hidden="true"><img src="assets/images/ticket.svg" alt=""></span>
      `;
      action.appendChild(link);
    } else {
      const noTicket = document.createElement('span');
      noTicket.className = 'actus-date-row__ticket actus-date-row__ticket--disabled';
      noTicket.textContent = 'Billetterie bientôt';
      action.appendChild(noTicket);
    }

    row.appendChild(date);
    row.appendChild(content);
    row.appendChild(action);

    return row;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function injectScheduleStyles() {
    if (document.getElementById('actus-schedule-styles')) return;

    const style = document.createElement('style');
    style.id = 'actus-schedule-styles';
    style.textContent = `
      .actus-page {
        position: relative;
        padding: clamp(10rem, 10vw, 14rem) 0 clamp(7rem, 10vw, 12rem);
        background:
          radial-gradient(circle at top right, rgba(166,124,82,0.14), transparent 38rem),
          linear-gradient(180deg, rgba(18,18,18,0.98), rgba(7,7,7,1));
        color: #fff;
        overflow: hidden;
      }

      .actus-page::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url('assets/images_opt/stone.jpg');
        background-size: cover;
        opacity: 0.07;
        pointer-events: none;
      }

      .actus-page .container {
        position: relative;
        z-index: 1;
      }

      .actus-schedule {
        width: min(116rem, 100%);
        margin: 0 auto;
      }

      .actus-schedule__intro {
        max-width: 76rem;
        margin: 0 auto clamp(3.2rem, 5vw, 5rem);
        text-align: center;
      }

      .actus-schedule__title {
        margin: 0;
        color: #fff;
        font-family: var(--font-primary);
        font-size: clamp(4rem, 7vw, 7.8rem);
        font-weight: 900;
        letter-spacing: 0.05em;
        line-height: 0.96;
        text-transform: uppercase;
        text-shadow: 0 18px 48px rgba(0,0,0,0.45);
      }

      .actus-schedule__text {
        max-width: 64rem;
        margin: 1.8rem auto 0;
        color: rgba(255,255,255,0.72);
        font-size: clamp(1.55rem, 1.6vw, 1.85rem);
        line-height: 1.75;
      }

      .actus-schedule__list {
        display: grid;
        gap: 1.4rem;
      }

      .actus-date-row {
        position: relative;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: clamp(1.8rem, 3vw, 3.4rem);
        align-items: center;
        width: 100%;
        padding: clamp(1.9rem, 2.7vw, 2.8rem);
        border: 1px solid rgba(255,255,255,0.11);
        border-radius: 2.2rem;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.085), rgba(255,255,255,0.028)),
          rgba(13,13,13,0.78);
        box-shadow:
          0 24px 68px rgba(0,0,0,0.32),
          inset 0 1px 0 rgba(255,255,255,0.09);
        overflow: hidden;
        isolation: isolate;
        transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
      }

      .actus-date-row::before {
        content: '';
        position: absolute;
        inset: 0 auto 0 0;
        width: 0.36rem;
        background: linear-gradient(180deg, #e6c555, #7a5c28);
        opacity: 0.92;
      }

      .actus-date-row:hover {
        transform: translateY(-3px);
        border-color: rgba(230,197,85,0.28);
        box-shadow:
          0 30px 82px rgba(0,0,0,0.42),
          inset 0 1px 0 rgba(255,255,255,0.13);
      }

      .actus-date-row__date {
        width: clamp(8.2rem, 8.5vw, 10.4rem);
        min-height: clamp(8.2rem, 8.5vw, 10.4rem);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 1.8rem;
        background:
          linear-gradient(145deg, rgba(230,197,85,0.18), rgba(255,255,255,0.052));
        border: 1px solid rgba(230,197,85,0.30);
        box-shadow:
          0 16px 36px rgba(0,0,0,0.26),
          inset 0 1px 0 rgba(255,255,255,0.16);
        text-align: center;
        flex-shrink: 0;
      }

      .actus-date-row__date--wide {
        width: clamp(12rem, 16vw, 18rem);
        padding: 1rem;
      }

      .actus-date-row__day {
        display: block;
        color: #fff;
        font-size: clamp(2.8rem, 4vw, 4.4rem);
        font-weight: 900;
        letter-spacing: 0.02em;
        line-height: 0.9;
      }

      .actus-date-row__date--wide .actus-date-row__day {
        font-size: clamp(1.35rem, 1.9vw, 1.8rem);
        line-height: 1.2;
      }

      .actus-date-row__month,
      .actus-date-row__year {
        display: block;
        color: #e6c555;
        font-size: 1.1rem;
        font-weight: 900;
        letter-spacing: 0.18em;
        line-height: 1.25;
      }

      .actus-date-row__year {
        color: rgba(255,255,255,0.62);
        letter-spacing: 0.08em;
        margin-top: 0.25rem;
      }

      .actus-date-row__content {
        min-width: 0;
      }

      .actus-date-row__title {
        margin: 0 0 1.05rem;
        color: #fff;
        font-family: var(--font-primary);
        font-size: clamp(2.3rem, 3vw, 3.9rem);
        font-weight: 900;
        letter-spacing: 0.06em;
        line-height: 1;
        text-transform: uppercase;
      }

      .actus-date-row__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.9rem 1.2rem;
        align-items: center;
      }

      .actus-date-row__meta-item {
        display: inline-flex;
        gap: 0.7rem;
        align-items: baseline;
        color: rgba(255,255,255,0.78);
        font-size: clamp(1.35rem, 1.4vw, 1.6rem);
        font-weight: 600;
      }

      .actus-date-row__meta-label {
        color: #e6c555;
        font-size: 1rem;
        font-weight: 900;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .actus-date-row__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.45rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(230,197,85,0.24);
        background: rgba(230,197,85,0.075);
        color: #e6c555;
        font-size: 1.05rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .actus-date-row__artists {
        margin: 1rem 0 0;
        color: rgba(255,255,255,0.58);
        font-size: 1.35rem;
        font-weight: 500;
      }

      .actus-date-row__action {
        display: flex;
        justify-content: flex-end;
      }

      .actus-date-row__ticket {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        min-width: 18rem;
        padding: 1.25rem 1.5rem 1.25rem 2rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #e6c555, #a48851);
        color: #121212;
        font-size: 1.32rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 16px 36px rgba(0,0,0,0.34);
        overflow: hidden;
      }

      .actus-date-row__ticket::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
        transform: translateX(-130%);
        transition: transform 0.55s ease;
      }

      .actus-date-row__ticket:hover::before {
        transform: translateX(130%);
      }

      .actus-date-row__ticket-text,
      .actus-date-row__ticket-icon {
        position: relative;
        z-index: 1;
      }

      .actus-date-row__ticket-icon {
        width: 3rem;
        height: 3rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(18,18,18,0.13);
        border: 1px solid rgba(18,18,18,0.12);
      }

      .actus-date-row__ticket-icon img {
        width: 1.65rem;
        height: 1.65rem;
        display: block;
        filter: brightness(0) saturate(100%);
      }

      .actus-date-row__ticket--disabled {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.58);
        box-shadow: none;
      }

      .actus-empty__box {
        max-width: 72rem;
        margin: 0 auto;
        padding: clamp(3rem, 5vw, 5rem);
        border-radius: 2.4rem;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.045);
        text-align: center;
      }

      .actus-empty__title {
        color: #fff;
        font-size: clamp(2.2rem, 4vw, 4rem);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      @media (max-width: 760px) {
        .actus-page {
          padding-top: 9rem;
        }

        .actus-date-row {
          grid-template-columns: 1fr;
          gap: 1.6rem;
          padding: 2rem;
        }

        .actus-date-row__date {
          width: 100%;
          min-height: auto;
          padding: 1.4rem;
          flex-direction: row;
          gap: 0.8rem;
          justify-content: flex-start;
          border-radius: 1.6rem;
        }

        .actus-date-row__day {
          font-size: 3rem;
        }

        .actus-date-row__action,
        .actus-date-row__ticket {
          width: 100%;
        }

        .actus-date-row__ticket {
          min-width: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }
});
