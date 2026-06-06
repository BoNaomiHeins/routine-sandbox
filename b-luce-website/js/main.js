/* B-Luce — main.js */

// --- Current year in footer ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Sticky header shadow on scroll ---
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,.08)' : '';
}, { passive: true });

// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Menu sluiten' : 'Menu openen');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close nav when a link is clicked
nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Menu openen');
    document.body.style.overflow = '';
  });
});

// --- Scroll reveal ---
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// --- Contact form validation ---
const form = document.getElementById('contactForm');
const successMsg = document.getElementById('formSuccess');

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.add('is-error');
  error.textContent = message;
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.remove('is-error');
  error.textContent = '';
}

// Clear errors on input
['name', 'email', 'bericht'].forEach(id => {
  const el = document.getElementById(id);
  const errorId = id === 'bericht' ? 'berichtError' : id + 'Error';
  el.addEventListener('input', () => clearError(id, errorId));
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const bericht = document.getElementById('bericht').value.trim();

  if (!name) {
    showError('name', 'nameError', 'Vul jouw naam in.');
    valid = false;
  } else {
    clearError('name', 'nameError');
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showError('email', 'emailError', 'Vul een e-mailadres in.');
    valid = false;
  } else if (!emailRe.test(email)) {
    showError('email', 'emailError', 'Voer een geldig e-mailadres in.');
    valid = false;
  } else {
    clearError('email', 'emailError');
  }

  if (!bericht) {
    showError('bericht', 'berichtError', 'Schrijf een bericht.');
    valid = false;
  } else {
    clearError('bericht', 'berichtError');
  }

  if (!valid) return;

  // Build mailto link (no backend needed)
  const bedrijf = document.getElementById('bedrijf').value.trim();
  const subject = encodeURIComponent(`Contactformulier website — ${name}`);
  const body    = encodeURIComponent(
    `Naam: ${name}\nE-mail: ${email}${bedrijf ? `\nBedrijf: ${bedrijf}` : ''}\n\n${bericht}`
  );
  window.location.href = `mailto:Bo@b-luce.nl?subject=${subject}&body=${body}`;

  // Show success message
  form.querySelectorAll('.form-input, .form-textarea').forEach(el => el.value = '');
  successMsg.hidden = false;
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
