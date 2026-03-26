// Sree Narayana Guru Website - Main JS

// Particle background
(function() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '200,149,42' : '232,88,26'
    });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
})();

// Navbar scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) navLinks.classList.remove('open');
  });
}

// Daily quotes
const quotes = [
  { en: '"Education that does not build character is no education at all."', ml: '"സ്വഭാവ ഗഠനം ചെയ്യാത്ത വിദ്യ, വിദ്യയല്ല."' },
  { en: '"Whatever be the religion of a man, it is enough that he becomes a good human being."', ml: '"മനുഷ്യൻ നല്ലവനായാൽ മതി, ഏതു മതത്തിലുള്ളവനായാലും."' },
  { en: '"One Caste, One Religion, One God for Humanity."', ml: '"ഒരു ജാതി, ഒരു മതം, ഒരു ദൈവം, മനുഷ്യന്."' },
  { en: '"Freedom through education; strength through organization; economic independence through industry."', ml: '"വിദ്യകൊണ്ട് സ്വതന്ത്രരാകുക; സംഘടനകൊണ്ട് ശക്തരാകുക; വ്യവസായം കൊണ്ട് സ്വാശ്രയ ശ്രമം ചെയ്യുക."' },
  { en: '"Do not quarrel over religion; do not destroy through argument; do not differ in understanding."', ml: '"ജാതി ഭേദം മത ദ്വേഷം ഏതുമില്ലാതെ, ഒരു ദൈവം ഒരു ആചാരം ഒരു ജാതി മനുഷ്യൻ."' },
  { en: '"The light of wisdom dispels the darkness of ignorance."', ml: '"ജ്ഞാനജ്യോതി അജ്ഞാനതമസ്സിനെ നീക്കുന്നു."' },
  { en: '"We are not competing; we are all advancing together toward the light."', ml: '"നാം മത്സരിക്കുകയല്ല; ഒരുമിച്ച് വെളിച്ചത്തിലേക്ക് പ്രയാണം ചെയ്യുകയാണ്."' },
  { en: '"The Supreme Being dwells in every heart — serve man, serve God."', ml: '"ദൈവം ഓരോ ഹൃദയത്തിലും വസിക്കുന്നു — മനുഷ്യനെ സേവിക്കൽ ദൈവത്തെ സേവിക്കലാണ്."' },
];
let qIndex = 0;
window.nextQuote = function() {
  qIndex = (qIndex + 1) % quotes.length;
  const qEl = document.getElementById('dailyQuote');
  const qMl = document.getElementById('dailyQuoteMl');
  if (qEl) { qEl.style.opacity = 0; setTimeout(() => { qEl.textContent = quotes[qIndex].en; qEl.style.opacity = 1; }, 300); }
  if (qMl) { qMl.style.opacity = 0; setTimeout(() => { qMl.textContent = quotes[qIndex].ml; qMl.style.opacity = 1; }, 300); }
};
// Cycle quote daily
if (document.getElementById('dailyQuote')) {
  const day = new Date().getDay();
  qIndex = day % quotes.length;
  document.getElementById('dailyQuote').textContent = quotes[qIndex].en;
  if (document.getElementById('dailyQuoteMl')) document.getElementById('dailyQuoteMl').textContent = quotes[qIndex].ml;
}

// Tabs
window.showTab = function(panelId, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
};

// Fade in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('fade-in'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.nav-card, .kriti-card, .temple-card, .quote-card, .verse-block, .pooja-card, .info-box').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

// Audio simulation (placeholder)
window.playAudio = function(title) {
  alert('🎵 Audio recital for "' + title + '" — Audio files can be added to the /audio folder and linked here. Please upload MP3 files to enable playback.');
};

// Hash navigation for language page
if (window.location.hash) {
  const target = document.querySelector(window.location.hash);
  if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}
