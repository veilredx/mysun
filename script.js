/* ==========================================================================
   С Днём Рождения, Солнце — логика сайта
   Vanilla JavaScript, без библиотек
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initIntroScreen();
  initScrollReveal();
  initWhyYouRotator();
  initCountdown();
  initEnvelope();
  initMusicToggle();
  initFinale();
});

/* ==========================================================================
   1. ФОНОВЫЕ ЧАСТИЦЫ (эффект ночного неба)
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = document.body.scrollHeight;
  }

  function createParticles() {
    const count = Math.floor((width * height) / 22000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.15 + 0.03,
      drift: (Math.random() - 0.5) * 0.06,
      opacity: Math.random() * 0.5 + 0.15,
      flicker: Math.random() * 0.015 + 0.003,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += p.drift;
      p.opacity += (Math.random() - 0.5) * p.flicker;
      p.opacity = Math.min(Math.max(p.opacity, 0.05), 0.65);

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 216, 107, ${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });
}

/* ==========================================================================
   2. ПЕРВЫЙ ЭКРАН — переход по кнопке "Открыть"
   ========================================================================== */
function initIntroScreen() {
  const introScreen = document.getElementById("screen-intro");
  const openBtn = document.getElementById("open-btn");

  openBtn.addEventListener("click", () => {
    introScreen.classList.add("is-hidden");
    document.body.style.overflow = "auto";

    // Небольшая задержка перед скроллом к следующему экрану
    setTimeout(() => {
      document.getElementById("screen-greeting").scrollIntoView({
        behavior: "smooth",
      });
    }, 500);
  });

  // Блокируем прокрутку, пока не открыт первый экран
  document.body.style.overflow = "hidden";
}

/* ==========================================================================
   3. ПЛАВНОЕ ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".fade-up, .fade-scale");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   4. ЭКРАН "ПОЧЕМУ ИМЕННО ТЫ" — смена фраз каждые 4 секунды
   ========================================================================== */
function initWhyYouRotator() {
  const phrases = [
    "Мне нравится твоя улыбка.",
    "Мне нравится, как ты смеёшься.",
    "Мне нравится проводить время рядом.",
    "Мне нравится смотреть на тебя.",
    "Мне нравится, когда ты счастлива.",
    "Мне нравится слушать твой голос.",
    "Мне нравится заботиться о тебе.",
    "Мне нравится, что рядом с тобой спокойно.",
    "Мне нравится всё, что связано с тобой.",
    "Мне нравится просто знать, что ты есть.",
  ];

  const textEl = document.getElementById("why-text");
  let index = 0;

  setInterval(() => {
    textEl.classList.add("is-changing");

    setTimeout(() => {
      index = (index + 1) % phrases.length;
      textEl.textContent = phrases[index];
      textEl.classList.remove("is-changing");
    }, 600);
  }, 4000);
}

/* ==========================================================================
   5. ТАЙМЕР "НАШЕ ВРЕМЯ" — считает от заданной даты
   ========================================================================== */
function initCountdown() {
  // Дата начала отношений — измени на свою
  const startDate = "2025-01-01";

  const start = new Date(startDate).getTime();

  const daysEl = document.getElementById("timer-days");
  const hoursEl = document.getElementById("timer-hours");
  const minutesEl = document.getElementById("timer-minutes");
  const secondsEl = document.getElementById("timer-seconds");

  function pad(num) {
    return String(num).padStart(2, "0");
  }

  function update() {
    const now = Date.now();
    let diff = Math.max(now - start, 0);

    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;

    const days = Math.floor(diff / day);
    const hours = Math.floor((diff % day) / hour);
    const minutes = Math.floor((diff % hour) / minute);
    const seconds = Math.floor((diff % minute) / 1000);

    daysEl.textContent = days;
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   6. КОНВЕРТ С ПИСЬМОМ
   ========================================================================== */
function initEnvelope() {
  const envelope = document.getElementById("envelope");

  function toggleEnvelope() {
    envelope.classList.toggle("is-open");
  }

  envelope.addEventListener("click", toggleEnvelope);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleEnvelope();
    }
  });
}

/* ==========================================================================
   7. КНОПКА МУЗЫКИ
   ========================================================================== */
function initMusicToggle() {
  const musicBtn = document.getElementById("music-toggle");
  const audio = document.getElementById("bg-audio");

  musicBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {
        /* Автовоспроизведение может быть заблокировано браузером —
           игнорируем ошибку, пользователь запустит музыку вручную */
      });
      musicBtn.classList.add("is-playing");
      musicBtn.setAttribute("aria-label", "Поставить музыку на паузу");
    } else {
      audio.pause();
      musicBtn.classList.remove("is-playing");
      musicBtn.setAttribute("aria-label", "Включить музыку");
    }
  });
}

/* ==========================================================================
   8. ФИНАЛ — дождь из золотых сердечек + финальный текст
   ========================================================================== */
function initFinale() {
  const finaleBtn = document.getElementById("finale-btn");
  const heartsContainer = document.getElementById("hearts-container");
  const finaleScreen = document.getElementById("screen-finale");

  finaleBtn.addEventListener("click", () => {
    finaleBtn.disabled = true;
    finaleScreen.scrollIntoView({ behavior: "smooth" });

    startHeartRain(heartsContainer, 6000);

    // Через 6 секунд дождь останавливается, финальный текст уже виден
    setTimeout(() => {
      // Через несколько секунд после финала — плавное растворение
      setTimeout(() => {
        finaleScreen.classList.add("is-fading");
      }, 4000);
    }, 6000);
  });
}

function startHeartRain(container, duration) {
  const heartSymbol = "❤";
  const spawnInterval = setInterval(() => {
    const heart = document.createElement("span");
    heart.className = "falling-heart";
    heart.textContent = heartSymbol;
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = 0.8 + Math.random() * 1.2 + "rem";
    heart.style.animationDuration = 3.5 + Math.random() * 2.5 + "s";
    container.appendChild(heart);

    // Удаляем сердечко после завершения анимации, чтобы не засорять DOM
    heart.addEventListener("animationend", () => heart.remove());
  }, 120);

  setTimeout(() => clearInterval(spawnInterval), duration);
}
