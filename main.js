/* Sivagiri Ashram — Main JS */

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.textContent = isOpen ? '✕' : '☰';
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      navToggle.textContent = '☰';
      document.body.style.overflow = '';
    }
  });
}

// Tab system
function showTab(panelId, btn) {
  const container = btn.closest('.tab-container') || document.querySelector('.tab-container') || document;
  container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
  btn.classList.add('active');
}

// Filter system (quotes page)
function filterItems(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('[data-category]').forEach(item => {
    item.style.display = (category === 'all' || item.dataset.category === category) ? '' : 'none';
  });
}

// Intersection Observer for fade-in
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.observe-fade').forEach(el => fadeObs.observe(el));

// Audio placeholder
function playAudio(title) {
  alert('Audio for "' + title + '" — add MP3 files to the /audio/ folder to enable playback.');
}

// Active nav link
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') && a.getAttribute('href').includes(currentPage)) {
    a.classList.add('active');
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
