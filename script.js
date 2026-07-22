/* =========================================================================
   С ДНЁМ РОЖДЕНИЯ, СОЛНЦЕ — script.js
   Vanilla JS: интро, код-дождь, reveal-анимации, интерактив
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initCodeRain();
  initRevealObserver();
  initHeroButton();
  initWhyCard();
  initEnvelope();
  initMusicToggle();
  initFinalHeartsRain();
});

/* =========================================================================
   ИНТРО-АНИМАЦИЯ
   3 → 2 → 1 → HAPPY → BIRTHDAY → TO → MY SUN → сердце → сайт
   ========================================================================= */
function initIntro() {
  const intro = document.getElementById('intro');
  const stage = document.getElementById('introStage');
  const textEl = document.getElementById('introText');
  const heartEl = document.getElementById('introHeart');
  const skipBtn = document.getElementById('skipIntro');
  const site = document.getElementById('site');

  const sequence = ['3', '2', '1', 'HAPPY', 'BIRTHDAY', 'TO', 'MY SUN'];
  const STEP_DURATION = 900; // время показа каждого слова/цифры
  let finished = false;

  function showWord(word, glitch) {
    textEl.textContent = word;
    textEl.className = 'intro-text pixel-font ' + (glitch ? 'glitch' : 'show');
  }

  function hideWord() {
    textEl.className = 'intro-text pixel-font hide';
  }

  function runSequence() {
    let delay = 200;

    sequence.forEach((word, i) => {
      const isDigit = !isNaN(parseInt(word, 10)) && word.length === 1;
      setTimeout(() => showWord(word, isDigit), delay);
      delay += STEP_DURATION - 150;
      setTimeout(hideWord, delay);
      delay += 150;
    });

    // Сердце
    setTimeout(() => {
      textEl.style.display = 'none';
      heartEl.className = 'intro-heart show';
    }, delay + 100);

    delay += 1700;

    setTimeout(() => {
      heartEl.className = 'intro-heart dissolve';
    }, delay);

    delay += 1300;

    setTimeout(finishIntro, delay);
  }

  function finishIntro() {
    if (finished) return;
    finished = true;
    intro.classList.add('intro-hidden');
    site.classList.add('site-visible');
    site.removeAttribute('aria-hidden');
    document.body.style.overflow = '';
    setTimeout(() => { intro.style.display = 'none'; }, 1200);
  }

  // Блокируем скролл во время интро
  document.body.style.overflow = 'hidden';

  skipBtn.addEventListener('click', finishIntro);

  runSequence();
}

/* =========================================================================
   ФОН: ПАДАЮЩИЙ КОД (Matrix-style, розовый, медленный)
   ========================================================================= */
function initCodeRain() {
  const canvas = document.getElementById('codeRain');
  const ctx = canvas.getContext('2d');

  const codeFragments = [
    'const', 'let', 'function', 'return', '=>', 'class', 'display:flex',
    '<div>', '</div>', 'opacity', 'document.querySelector', '{}', '()',
    'import', 'export', 'align-items', 'transition', 'position:absolute',
    'this.state', 'async', 'await', 'null', 'true', 'false', '<style>',
    'margin:0', '.reveal', '#id', 'background', 'border-radius',
    'addEventListener', 'new Promise', 'export default', 'padding:0'
  ];

  let columns = [];
  let fontSize = 15;
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const columnCount = Math.floor(width / (fontSize * 6.5));
    columns = new Array(Math.max(columnCount, 4)).fill(0).map((_, i) => ({
      x: i * (width / Math.max(columnCount, 4)),
      y: Math.random() * -height,
      speed: 0.4 + Math.random() * 0.6,
      text: randomFragment(),
      opacity: 0.06 + Math.random() * 0.09
    }));
  }

  function randomFragment() {
    return codeFragments[Math.floor(Math.random() * codeFragments.length)];
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px 'Poppins', monospace`;
    ctx.textBaseline = 'top';

    columns.forEach((col) => {
      ctx.fillStyle = `rgba(255, 126, 184, ${col.opacity})`;
      ctx.fillText(col.text, col.x, col.y);

      col.y += col.speed;

      if (col.y > height + 30) {
        col.y = Math.random() * -200 - 30;
        col.text = randomFragment();
        col.opacity = 0.06 + Math.random() * 0.09;
      }
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', debounce(resize, 200));
  draw();
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* =========================================================================
   REVEAL-АНИМАЦИИ ПРИ ПРОКРУТКЕ (Intersection Observer)
   ========================================================================= */
function initRevealObserver() {
  const items = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = Array.from(el.parentElement?.children || [])
          .filter((c) => c.classList.contains('reveal'))
          .indexOf(el);
        el.style.transitionDelay = `${Math.min(delay, 6) * 0.12}s`;
        el.classList.add('in-view');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach((item) => observer.observe(item));
}

/* =========================================================================
   ЭКРАН 1 — Кнопка "Открыть", плавный скролл
   ========================================================================= */
function initHeroButton() {
  const btn = document.getElementById('openGiftBtn');
  const target = document.getElementById('screen-message');

  btn.addEventListener('click', () => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* =========================================================================
   ЭКРАН 4 — Циклический текст "Почему именно ты?"
   ========================================================================= */
function initWhyCard() {
  const el = document.getElementById('whyText');
  if (!el) return;

  const reasons = [
    'Мне нравится твоя улыбка.',
    'Мне нравится смотреть на тебя.',
    'Мне нравится проводить время рядом.',
    'Мне нравится слушать твой голос.',
    'Мне нравится, когда ты счастлива.',
    'Мне нравится заботиться о тебе.',
    'Мне нравится всё, что связано с тобой.',
    'Мне нравится, что рядом с тобой спокойно.',
    'Мне нравится просто знать, что ты есть.'
  ];

  let index = 0;

  setInterval(() => {
    el.classList.add('fade-out');

    setTimeout(() => {
      index = (index + 1) % reasons.length;
      el.textContent = reasons[index];
      el.classList.remove('fade-out');
    }, 550);
  }, 4000);
}

/* =========================================================================
   ЭКРАН 5 — Конверт с письмом
   ========================================================================= */
function initEnvelope() {
  const envelope = document.getElementById('envelope');
  if (!envelope) return;

  function toggle() {
    envelope.classList.toggle('opened');
  }

  envelope.addEventListener('click', toggle);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
}

/* =========================================================================
   КНОПКА МУЗЫКИ
   ========================================================================= */
function initMusicToggle() {
  const btn = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  if (!btn || !audio) return;

  let isPlaying = false;

  btn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Включить музыку');
    } else {
      audio.play().catch(() => {
        /* Автовоспроизведение может быть заблокировано браузером —
           требуется явный клик пользователя, который уже произошёл */
      });
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Поставить музыку на паузу');
    }
    isPlaying = !isPlaying;
  });
}

/* =========================================================================
   ФИНАЛ — Дождь из розовых сердечек (~6 секунд)
   ========================================================================= */
function initFinalHeartsRain() {
  const finalScreen = document.getElementById('screen-final');
  const rainContainer = document.getElementById('heartsRain');
  if (!finalScreen || !rainContainer) return;

  let triggered = false;
  const DURATION = 6000;
  let spawnInterval = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        startHeartsRain();
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(finalScreen);

  function startHeartsRain() {
    rainContainer.classList.add('active');

    spawnInterval = setInterval(spawnHeart, 140);

    setTimeout(() => {
      clearInterval(spawnInterval);
      setTimeout(() => rainContainer.classList.remove('active'), 1500);
    }, DURATION);
  }

  function spawnHeart() {
    const heart = document.createElement('span');
    heart.className = 'falling-heart';
    heart.textContent = '❤';
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${12 + Math.random() * 16}px`;
    const duration = 4 + Math.random() * 3;
    heart.style.animationDuration = `${duration}s`;
    heart.style.opacity = `${0.5 + Math.random() * 0.5}`;

    rainContainer.appendChild(heart);

    setTimeout(() => heart.remove(), duration * 1000 + 200);
  }
}
