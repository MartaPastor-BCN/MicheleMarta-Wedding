// Michele & Marta wedding website — interactivity, i18n switching, RSVP handling
(function () {
  const WEDDING_DATE = new Date('2026-09-19T15:30:00+02:00');
  const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxR2zmao95l131PquSQFo2tAth-BoXTF5a4h3-DuGvO4VdanVhVBUt-fx2PUjfv5s5TfA/exec';

  /* ---------------- i18n ---------------- */
  let currentLang = 'it';

  function applyTranslations(lang) {
    const dict = window.I18N[lang];
    if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const path = el.getAttribute('data-i18n').split('.');
      let val = dict;
      for (const p of path) val = val && val[p];
      if (typeof val === 'string') el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const path = el.getAttribute('data-i18n-placeholder').split('.');
      let val = dict;
      for (const p of path) val = val && val[p];
      if (typeof val === 'string') el.setAttribute('placeholder', val);
    });
    document.documentElement.lang = lang;
    currentLang = lang;
  }

  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyTranslations(btn.getAttribute('data-lang'));
    });
  });

  /* ---------------- mobile nav ---------------- */
  const burger = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  burger && burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks && navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  /* ---------------- countdown ---------------- */
  function updateCountdown() {
    const now = new Date();
    const diffMs = WEDDING_DATE - now;
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const el = document.getElementById('countdownDays');
    if (el) el.textContent = days;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000 * 60 * 60);

  /* ---------------- scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------------- conditional RSVP fields ---------------- */
  document.querySelectorAll('input[name="allergyFlag"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('allergyBox').classList.toggle('show', r.value === 'yes' && r.checked);
    });
  });
  document.querySelectorAll('input[name="speech"]').forEach(r => {
    r.addEventListener('change', () => {
      const show = (r.value === 'yes' || r.value === 'maybe') && r.checked;
      if (show) document.getElementById('speechBox').classList.add('show');
    });
  });
  document.querySelectorAll('input[name="speech"][value="no"]').forEach(r => {
    r.addEventListener('change', () => { if (r.checked) document.getElementById('speechBox').classList.remove('show'); });
  });

  /* ---------------- local guest (from Acireale) toggles arrival date ---------------- */
  const localGuest = document.getElementById('localGuest');
  const arriveDate = document.getElementById('arriveDate');
  if (localGuest && arriveDate) {
    localGuest.addEventListener('change', () => {
      if (localGuest.checked) {
        arriveDate.value = '';
        arriveDate.required = false;
        arriveDate.disabled = true;
      } else {
        arriveDate.required = true;
        arriveDate.disabled = false;
      }
    });
  }

  /* ---------------- attending = No hides the rest of the form ---------------- */
  const attendingFields = document.getElementById('attendingFields');
  if (attendingFields) {
    // Remember which fields were originally required
    const reqFields = Array.prototype.slice.call(
      attendingFields.querySelectorAll('[required]')
    );
    reqFields.forEach(el => el.setAttribute('data-was-required', '1'));

    const applyAttending = () => {
      const sel = document.querySelector('input[name="attending"]:checked');
      const notComing = sel && sel.value === 'no';
      attendingFields.style.display = notComing ? 'none' : '';
      reqFields.forEach(el => {
        if (notComing) el.removeAttribute('required');
        else if (el.getAttribute('data-was-required')) el.setAttribute('required', '');
      });
    };
    document.querySelectorAll('input[name="attending"]').forEach(r => {
      r.addEventListener('change', applyAttending);
    });
    applyAttending();
  }

  /* ---------------- honeymoon IBAN reveal / copy ---------------- */
  const showIbanBtn = document.getElementById('showIbanBtn');
  const ibanBox = document.getElementById('ibanBox');
  showIbanBtn && showIbanBtn.addEventListener('click', () => {
    ibanBox.classList.toggle('show');
    showIbanBtn.style.display = ibanBox.classList.contains('show') ? 'none' : 'inline-block';
  });
  const copyIbanBtn = document.getElementById('copyIbanBtn');
  copyIbanBtn && copyIbanBtn.addEventListener('click', () => {
    const ibanText = 'ES44 2100 0803 9302 0193 9827';
    navigator.clipboard && navigator.clipboard.writeText(ibanText.replace(/\s/g, ''));
    const note = document.getElementById('copyNote');
    note.classList.add('show');
    setTimeout(() => note.classList.remove('show'), 2500);
  });

  /* ---------------- RSVP form submit ---------------- */
  const form = document.getElementById('rsvpForm');
  form && form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {};
    for (const [key, value] of data.entries()) {
      if (payload[key]) {
        payload[key] = Array.isArray(payload[key]) ? [...payload[key], value] : [payload[key], value];
      } else {
        payload[key] = value;
      }
    }
    payload.submittedAt = new Date().toISOString();
    payload.language = currentLang;
    // Flatten any multi-value fields (e.g. dietary checkboxes) into one string
    Object.keys(payload).forEach(k => {
      if (Array.isArray(payload[k])) payload[k] = payload[k].join(', ');
    });

    // Send to Power Automate flow (writes a row into RSVP_Responses table in
    // Michele_Marta_Wedding_RSVP_2026.xlsx on OneDrive, and emails both couple addresses).
    if (RSVP_ENDPOINT) {
      try {
        await fetch(RSVP_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error('RSVP submission failed', err);
      }
    } else {
      console.warn('RSVP_ENDPOINT not configured yet — form data captured locally only:', payload);
    }

    document.querySelectorAll('.form-msg').forEach(m => m.classList.remove('show'));
    const attending = payload.attending;
    let shownMsg;
    if (attending === 'yes') shownMsg = document.getElementById('msgYes');
    else if (attending === 'no') shownMsg = document.getElementById('msgNo');
    else shownMsg = document.getElementById('msgMaybe');
    shownMsg.classList.add('show');

    form.reset();
    document.getElementById('allergyBox').classList.remove('show');
    document.getElementById('speechBox').classList.remove('show');
    if (attendingFields) attendingFields.style.display = '';
    shownMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // For attending guests, gently surface the honeymoon section afterwards
    if (attending === 'yes') {
      const nozze = document.getElementById('nozze');
      if (nozze) setTimeout(() => nozze.scrollIntoView({ behavior: 'smooth', block: 'start' }), 2600);
    }
  });

  /* ---------------- init ---------------- */
  const pageLang = (document.documentElement.getAttribute('lang') || 'it').slice(0, 2);
  currentLang = window.I18N[pageLang] ? pageLang : 'it';
  applyTranslations(currentLang);
})();
