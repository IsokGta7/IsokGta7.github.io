(function() {
  const AGENDA_PATH = '/agenda/';
  const shortcut = { first: 'k', second: 'l', windowMs: 900 };
  let awaitingSecond = false;
  let timerId = null;

  function isTypingTarget(target) {
    return !!(target?.closest('input, textarea, select, option') || target?.isContentEditable);
  }

  function resetSequence() {
    awaitingSecond = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function handleShortcut(event) {
    if (event.metaKey || event.altKey) {
      resetSequence();
      return;
    }

    if (event.ctrlKey) {
      const key = event.key?.toLowerCase();
      if (key === shortcut.first && !isTypingTarget(event.target)) {
        awaitingSecond = true;
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(resetSequence, shortcut.windowMs);
        event.preventDefault();
      } else if (awaitingSecond && key === shortcut.second && !isTypingTarget(event.target)) {
        event.preventDefault();
        resetSequence();
        window.location.href = AGENDA_PATH;
      }
    } else if (event.key !== 'Control') {
      resetSequence();
    }
  }

  document.addEventListener('keydown', handleShortcut, { passive: false });

  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('[data-agenda-login]');
    const calendarContainer = document.querySelector('[data-agenda-calendar]');
    const statusMessage = document.querySelector('[data-agenda-status]');
    const userBadge = document.querySelector('[data-agenda-user]');
    let isAuthenticated = false;

    if (!loginForm || !calendarContainer || !statusMessage) return;

    const credentials = [
      { email: 'agenda@demo.com', password: 'agenda123', name: 'Agenda Demo' },
      { email: 'cliente@demo.com', password: 'cliente2024', name: 'Cliente Demo' }
    ];

    const events = [
      {
        date: '2024-07-08',
        time: '09:30',
        type: 'meeting',
        title: { es: 'Revisión de roadmap', en: 'Roadmap review' },
        description: {
          es: 'Alineación trimestral con el equipo de producto.',
          en: 'Quarterly alignment with the product team.'
        }
      },
      {
        date: '2024-07-08',
        time: '15:00',
        type: 'call',
        title: { es: 'Llamada con cliente', en: 'Client call' },
        description: {
          es: 'Seguimiento de entregables y próximos hitos.',
          en: 'Follow-up on deliverables and upcoming milestones.'
        }
      },
      {
        date: '2024-07-10',
        time: '11:00',
        type: 'meeting',
        title: { es: 'Demo interna', en: 'Internal demo' },
        description: {
          es: 'Presentación de mejoras en el flujo de inferencia.',
          en: 'Showcasing improvements to the inference flow.'
        }
      },
      {
        date: '2024-07-12',
        time: '13:30',
        type: 'call',
        title: { es: 'Llamada de soporte', en: 'Support call' },
        description: {
          es: 'Revisión de métricas y tickets críticos.',
          en: 'Reviewing metrics and critical tickets.'
        }
      }
    ];

    function currentLang() {
      return window.SiteI18n?.getLanguage?.() || document.documentElement.lang || 'es';
    }

    function translate(map) {
      const lang = currentLang();
      return map?.[lang] ?? map?.es ?? map?.en ?? '';
    }

    function formatDate(dateStr) {
      const lang = currentLang();
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }

    function renderCalendar() {
      if (!isAuthenticated) return;
      const lang = currentLang();
      const grouped = events.reduce((acc, evt) => {
        (acc[evt.date] = acc[evt.date] || []).push(evt);
        return acc;
      }, {});

      const sortedDates = Object.keys(grouped).sort();
      const labels = {
        heading: lang === 'en' ? 'Scheduled meetings and calls' : 'Reuniones y llamadas agendadas',
        empty: lang === 'en' ? 'No events pending.' : 'Sin eventos pendientes.'
      };

      calendarContainer.innerHTML = `
        <div class="agenda-header">
          <div>
            <p class="eyebrow" data-i18n-en="Agenda">${lang === 'en' ? 'Agenda' : 'Agenda'}</p>
            <h3>${labels.heading}</h3>
          </div>
          <div class="agenda-legend" aria-hidden="true">
            <span class="legend-dot call"></span><span>${lang === 'en' ? 'Call' : 'Llamada'}</span>
            <span class="legend-dot meeting"></span><span>${lang === 'en' ? 'Meeting' : 'Reunión'}</span>
          </div>
        </div>
      `;

      const listWrapper = document.createElement('div');
      listWrapper.className = 'agenda-list';

      if (sortedDates.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'subtle-text';
        empty.textContent = labels.empty;
        listWrapper.appendChild(empty);
      }

      sortedDates.forEach(date => {
        const daySection = document.createElement('section');
        daySection.className = 'agenda-day';
        const heading = document.createElement('h4');
        heading.className = 'agenda-day__title';
        heading.textContent = formatDate(date);
        daySection.appendChild(heading);

        grouped[date]
          .sort((a, b) => a.time.localeCompare(b.time))
          .forEach(evt => {
            const item = document.createElement('article');
            item.className = `agenda-item ${evt.type}`;
            item.innerHTML = `
              <div>
                <p class="agenda-item__time">${evt.time}</p>
                <h5>${translate(evt.title)}</h5>
                <p class="subtle-text">${translate(evt.description)}</p>
              </div>
              <span class="agenda-chip ${evt.type}">${evt.type === 'call' ? (lang === 'en' ? 'Call' : 'Llamada') : (lang === 'en' ? 'Meeting' : 'Reunión')}</span>
            `;
            daySection.appendChild(item);
          });

        listWrapper.appendChild(daySection);
      });

      calendarContainer.appendChild(listWrapper);
      calendarContainer.hidden = false;
    }

    function showStatus(message, variant = 'info') {
      statusMessage.textContent = message;
      statusMessage.dataset.variant = variant;
    }

    function applySession(user) {
      isAuthenticated = true;
      loginForm.hidden = true;
      userBadge.textContent = user.name;
      userBadge.hidden = false;
      renderCalendar();
    }

    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const password = String(formData.get('password') || '').trim();

      const matched = credentials.find(user => user.email.toLowerCase() === email && user.password === password);

      if (matched) {
        localStorage.setItem('agenda-auth', matched.email);
        showStatus(currentLang() === 'en' ? 'Login successful. Loading schedule…' : 'Inicio de sesión correcto. Cargando agenda…', 'success');
        applySession(matched);
      } else {
        showStatus(currentLang() === 'en' ? 'Invalid credentials. Try again.' : 'Credenciales inválidas. Inténtalo de nuevo.', 'error');
      }
    });

    const storedEmail = localStorage.getItem('agenda-auth');
    if (storedEmail) {
      const savedUser = credentials.find(user => user.email === storedEmail);
      if (savedUser) {
        applySession(savedUser);
        showStatus(currentLang() === 'en' ? 'Restored session from this device.' : 'Sesión restaurada en este dispositivo.', 'info');
      }
    }

    document.addEventListener('language:change', renderCalendar);
  });
})();
