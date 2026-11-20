// Scroll interactions for the landing page. No dependencies.
// Everything degrades to a fully visible, static page when JS is off or reduced motion is requested.

const root = document.documentElement;
const motion = root.classList.contains('motion');
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/* ---------- Nav: background after scrolling, mobile menu ---------- */
const nav = document.querySelector<HTMLElement>('[data-nav]');
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');

function setMenu(open: boolean) {
  if (!toggle || !menu || !nav) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.hidden = !open;
  nav.classList.toggle('is-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});
matchMedia('(min-width: 721px)').addEventListener('change', (e) => e.matches && setMenu(false));

/* ---------- Reveal on scroll ---------- */
if (motion) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

/* ---------- Scroll-linked effects ---------- */
const parallax = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
const words = [...document.querySelectorAll<HTMLElement>('[data-words] .w')];
const wordsBox = document.querySelector<HTMLElement>('[data-words]');
const expand = document.querySelector<HTMLElement>('[data-expand]');
const expandPanel = expand?.firstElementChild as HTMLElement | null;
const spin = document.querySelector<HTMLElement>('[data-spin]');
const heroStage = document.querySelector<HTMLElement>('[data-hero-stage]');

const how = document.querySelector<HTMLElement>('[data-how]');
const steps = [...document.querySelectorAll<HTMLElement>('[data-step]')];
const screens = [...document.querySelectorAll<HTMLElement>('[data-screen]')];
const howSteps = how?.querySelector<HTMLElement>('.how__steps');
const howStage = how?.querySelector<HTMLElement>('.how__sticky');

const hs = document.querySelector<HTMLElement>('[data-hscroll]');
const hsTrack = hs?.querySelector<HTMLElement>('[data-hscroll-track]');
const hsProgress = hs?.querySelector<HTMLElement>('.progress');
const wide = matchMedia('(min-width: 861px)');
let hsDistance = 0;

function layoutHScroll() {
  if (!hs || !hsTrack) return;
  const pin = motion && wide.matches;
  hs.classList.toggle('is-pinned', pin);
  if (!pin) {
    hs.style.height = '';
    hsTrack.style.transform = '';
    return;
  }
  // Measure the last card rather than scrollWidth, which can drop the track's end padding.
  const last = hsTrack.lastElementChild as HTMLElement | null;
  const gutter = parseFloat(getComputedStyle(hsTrack).paddingLeft) || 0;
  const end = last ? last.offsetLeft + last.offsetWidth + gutter : hsTrack.scrollWidth;
  hsDistance = Math.max(0, end - root.clientWidth);
  hs.style.height = `${window.innerHeight + hsDistance}px`;
}

let activeStep = -1;
function setStep(i: number) {
  if (i === activeStep) return;
  activeStep = i;
  steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
  screens.forEach((s, n) => s.classList.toggle('is-active', n === i));
}

function update() {
  const vh = window.innerHeight;
  nav?.classList.toggle('is-scrolled', window.scrollY > 24);

  // Steps are highlighted even without motion so the pinned phone always matches the text.
  if (steps.length) {
    let current = 0;
    steps.forEach((s, i) => {
      if (s.getBoundingClientRect().top < vh * 0.55) current = i;
    });
    setStep(current);
  }

  if (!motion) return;

  for (const el of parallax) {
    const speed = parseFloat(el.dataset.parallax || '0');
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;
    const offset = (r.top + r.height / 2 - vh / 2) * speed;
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
  }

  if (heroStage) {
    // 0 when the page loads, 1 once the stage has scrolled about halfway up the screen.
    const r = heroStage.getBoundingClientRect();
    const p = clamp((vh - r.top) / (vh * 0.75) - 0.35);
    heroStage.style.setProperty('--p', p.toFixed(3));
  }

  if (wordsBox && words.length) {
    const r = wordsBox.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < lit));
  }

  if (howSteps && howStage) {
    const r = howSteps.getBoundingClientRect();
    const p = clamp((vh * 0.55 - r.top) / r.height);
    howSteps.style.setProperty('--p', p.toFixed(3));
    howStage.style.setProperty('--p', p.toFixed(3));
  }

  if (expand && expandPanel) {
    const r = expand.getBoundingClientRect();
    const p = clamp((vh - r.top) / (vh * 0.75));
    expandPanel.style.setProperty('--p', p.toFixed(3));
  }

  if (spin) {
    const r = spin.getBoundingClientRect();
    spin.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height)).toFixed(3));
  }

  if (hs && hsTrack && hs.classList.contains('is-pinned')) {
    const r = hs.getBoundingClientRect();
    const p = hsDistance ? clamp(-r.top / hsDistance) : 0;
    hsTrack.style.transform = `translate3d(${(-p * hsDistance).toFixed(1)}px, 0, 0)`;
    hsProgress?.style.setProperty('--p', p.toFixed(3));
  }
}

let ticking = false;
function requestUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    update();
  });
}

layoutHScroll();
update();
window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', () => {
  layoutHScroll();
  requestUpdate();
});
wide.addEventListener('change', () => {
  layoutHScroll();
  requestUpdate();
});
// Fonts change the track width; re-measure once they're in.
document.fonts?.ready.then(() => {
  layoutHScroll();
  requestUpdate();
});
