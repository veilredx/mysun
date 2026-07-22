/* =====================================================================
   BIRTHDAY SITE — SCRIPT
   Vanilla JS only. No dependencies.
   Sections:
     1. Digital Rain (intro background)
     2. Intro sequence (countdown → words → pixel heart → reveal site)
     3. Scroll reveal (Intersection Observer)
     4. "Why you" rotating card
     5. Envelope open/close
     6. Music player
     7. Finale (heart rain + closing message)
   ===================================================================== */

(() => {
  "use strict";

  /* ---------------------------------------------------------------
     Small helpers
  --------------------------------------------------------------- */
  const $ = (selector) => document.querySelector(selector);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const RAIN_COLORS = ["#ff4fa0", "#ff6db7", "#ff88c8", "#ff9fd5", "#ffb9e8"];

  /* =================================================================
     1. DIGITAL RAIN
     Vertical columns of soft glowing dots falling top to bottom.
  ================================================================= */
  class DigitalRain {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.columns = [];
      this.running = false;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.resize = this.resize.bind(this);
      this.loop = this.loop.bind(this);

      window.addEventListener("resize", this.resize);
      this.resize();
    }

    resize() {
      const { innerWidth: w, innerHeight: h } = window;
      this.canvas.width = w * this.dpr;
      this.canvas.height = h * this.dpr;
      this.canvas.style.width = w + "px";
      this.canvas.style.height = h + "px";
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.width = w;
      this.height = h;
      this.buildColumns();
    }

    buildColumns() {
      const spacing = 22; // px between columns
      const count = Math.ceil(this.width / spacing);
      this.columns = [];

      for (let i = 0; i < count; i++) {
        this.columns.push(this.makeColumn(i * spacing));
      }
    }

    makeColumn(x) {
      const dotGap = 18 + Math.random() * 6;
      const dotCount = 6 + Math.floor(Math.random() * 14);
      return {
        x,
        dotGap,
        dotCount,
        size: 2.5 + Math.random() * 2, // 3–5px roughly
        speed: 60 + Math.random() * 140, // px per second
        y: -Math.random() * this.height, // stagger start position
        color: RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)],
        opacity: 0.35 + Math.random() * 0.5,
      };
    }

    start() {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop);
    }

    stop() {
      this.running = false;
    }

    loop(now) {
      if (!this.running) return;
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.globalCompositeOperation = "lighter";

      for (const col of this.columns) {
        col.y += col.speed * dt;
        const totalLength = col.dotGap * col.dotCount;

        // Recycle column once it has fully passed the bottom
        if (col.y - totalLength > this.height) {
          Object.assign(col, this.makeColumn(col.x));
          col.y = -totalLength;
        }

        for (let i = 0; i < col.dotCount; i++) {
          const dotY = col.y - i * col.dotGap;
          if (dotY < -10 || dotY > this.height + 10) continue;

          // Dots near the "head" of the column glow brighter
          const fade = 1 - i / col.dotCount;
          const alpha = col.opacity * fade;

          this.ctx.beginPath();
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = col.color;
          this.ctx.fillStyle = this.hexToRgba(col.color, alpha);
          this.ctx.arc(col.x, dotY, col.size * (0.6 + fade * 0.4), 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      this.ctx.shadowBlur = 0;
      requestAnimationFrame(this.loop);
    }

    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  /* =================================================================
     2. PIXEL HEART
     Draws a heart made of small pixel squares, pulses, then
     explodes into scattered particles.
  ================================================================= */
  class PixelHeart {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.resize();
      window.addEventListener("resize", () => this.resize());
    }

    resize() {
      const { innerWidth: w, innerHeight: h } = window;
      this.canvas.width = w * this.dpr;
      this.canvas.height = h * this.dpr;
      this.canvas.style.width = w + "px";
      this.canvas.style.height = h + "px";
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.width = w;
      this.height = h;
      this.buildPoints();
    }

    // Generate heart-shape pixel coordinates using the classic
    // parametric heart curve, sampled onto a small pixel grid.
    buildPoints() {
      const scale = Math.min(this.width, this.height) * 0.02;
      const cx = this.width / 2;
      const cy = this.height / 2;
      this.points = [];

      for (let t = 0; t < Math.PI * 2; t += 0.06) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        // Fill the outline with a few interpolated inner layers for a solid look
        for (let layer = 0.2; layer <= 1; layer += 0.2) {
          this.points.push({
            baseX: cx + x * scale * layer,
            baseY: cy + y * scale * layer,
            x: cx + x * scale * layer,
            y: cy + y * scale * layer,
            vx: 0,
            vy: 0,
            size: 3 + Math.random() * 2,
            color: RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)],
          });
        }
      }
    }

    draw(alpha = 1) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.globalCompositeOperation = "lighter";
      for (const p of this.points) {
        this.ctx.beginPath();
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = p.color;
        this.ctx.fillStyle = this.hexToRgba(p.color, alpha);
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      this.ctx.shadowBlur = 0;
    }

    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Gentle pulsing scale animation for `duration` ms.
    async pulse(duration = 1400, beats = 2) {
      const start = performance.now();
      return new Promise((resolve) => {
        const animate = (now) => {
          const elapsed = now - start;
          const progress = elapsed / duration;
          const scale = 1 + Math.sin(progress * Math.PI * beats) * 0.08;

          for (const p of this.points) {
            const dx = p.baseX - this.width / 2;
            const dy = p.baseY - this.height / 2;
            p.x = this.width / 2 + dx * scale;
            p.y = this.height / 2 + dy * scale;
          }

          this.draw(1);

          if (elapsed < duration) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });
    }

    // Explode every point outward from center and fade to transparent.
    async explode(duration = 1200) {
      for (const p of this.points) {
        const dx = p.baseX - this.width / 2;
        const dy = p.baseY - this.height / 2;
        const dist = Math.hypot(dx, dy) || 1;
        const power = 4 + Math.random() * 6;
        p.vx = (dx / dist) * power + (Math.random() - 0.5) * 2;
        p.vy = (dy / dist) * power + (Math.random() - 0.5) * 2 - 2; // slight upward bias
      }

      const start = performance.now();
      return new Promise((resolve) => {
        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);

          for (const p of this.points) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // gentle gravity
          }

          this.draw(1 - progress);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            this.ctx.clearRect(0, 0, this.width, this.height);
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });
    }
  }

  /* =================================================================
     3. HEART RAIN (finale)
     Small pixel hearts falling like confetti.
  ================================================================= */
  class HeartRain {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.particles = [];
      this.running = false;
      this.resize = this.resize.bind(this);
      this.loop = this.loop.bind(this);
      window.addEventListener("resize", this.resize);
      this.resize();
    }

    resize() {
      const { innerWidth: w, innerHeight: h } = window;
      this.canvas.width = w * this.dpr;
      this.canvas.height = h * this.dpr;
      this.canvas.style.width = w + "px";
      this.canvas.style.height = h + "px";
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.width = w;
      this.height = h;
    }

    makeParticle() {
      return {
        x: Math.random() * this.width,
        y: -20 - Math.random() * this.height * 0.4,
        size: 6 + Math.random() * 10,
        speed: 40 + Math.random() * 90,
        drift: (Math.random() - 0.5) * 30,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 2,
        color: RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)],
        opacity: 0.6 + Math.random() * 0.4,
      };
    }

    drawPixelHeart(p) {
      const s = p.size / 6;
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fillStyle = this.hexToRgba(p.color, p.opacity);

      // Simple blocky heart made of squares (pixel-art feel)
      const map = [
        [0, 1, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
      ];
      for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
          if (map[row][col]) {
            this.ctx.fillRect((col - 3) * s, (row - 3) * s, s, s);
          }
        }
      }
      this.ctx.restore();
    }

    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    start(duration = 6000) {
      this.running = true;
      this.spawnUntil = performance.now() + duration;
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop);
    }

    stop() {
      this.running = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    loop(now) {
      if (!this.running) return;
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      if (now < this.spawnUntil && Math.random() < 0.6) {
        this.particles.push(this.makeParticle());
      }

      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.globalCompositeOperation = "lighter";

      this.particles = this.particles.filter((p) => p.y < this.height + 40);

      for (const p of this.particles) {
        p.y += p.speed * dt;
        p.x += Math.sin(p.y * 0.02) * p.drift * dt;
        p.rotation += p.spin * dt;
        this.drawPixelHeart(p);
      }

      this.ctx.shadowBlur = 0;

      if (now < this.spawnUntil || this.particles.length > 0) {
        requestAnimationFrame(this.loop);
      } else {
        this.running = false;
      }
    }
  }

  /* =================================================================
     INTRO SEQUENCE ORCHESTRATION
  ================================================================= */
  async function playIntroSequence() {
    const introEl = $("#intro");
    const rainCanvas = $("#rain-canvas");
    const countdownEl = $("#countdown");
    const wordsEl = $("#intro-words");
    const heartCanvas = $("#heart-canvas");
    const mainSite = $("#main-site");

    const rain = new DigitalRain(rainCanvas);
    rain.start();

    // Give the rain a moment on screen before the countdown starts
    await wait(1200);

    // --- Countdown: 3 → 2 → 1 ---
    const numbers = ["3", "2", "1"];
    for (const n of numbers) {
      countdownEl.textContent = n;
      countdownEl.classList.remove("show");
      // force reflow so the animation restarts each time
      void countdownEl.offsetWidth;
      countdownEl.classList.add("show");
      await wait(1000);
    }
    countdownEl.classList.remove("show");
    countdownEl.textContent = "";

    // --- Words: HAPPY / BIRTHDAY / TO / MY SUN ---
    const words = ["HAPPY", "BIRTHDAY", "TO", "MY SUN"];
    for (const word of words) {
      wordsEl.textContent = word;
      wordsEl.classList.remove("show");
      void wordsEl.offsetWidth;
      wordsEl.classList.add("show");
      await wait(1100);
    }
    wordsEl.classList.remove("show");
    wordsEl.textContent = "";

    // --- Pixel heart: pulse then explode ---
    const heart = new PixelHeart(heartCanvas);
    heartCanvas.classList.add("show");
    await heart.pulse(1300, 2);
    await heart.explode(1100);
    heartCanvas.classList.add("hide");

    // --- Dissolve rain, reveal main site ---
    rainCanvas.classList.add("fade-out");
    await wait(600);
    rain.stop();
    introEl.classList.add("hidden");
    mainSite.classList.add("visible");
    mainSite.removeAttribute("aria-hidden");
  }

  /* =================================================================
     SCROLL REVEAL (Intersection Observer)
  ================================================================= */
  function initScrollReveal() {
    const targets = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* =================================================================
     "WHY YOU" ROTATING CARD
  ================================================================= */
  function initWhyCard() {
    const reasons = [
      "Мне нравится твоя улыбка.",
      "Мне нравится, как ты смеешься.",
      "Мне нравится проводить время рядом.",
      "Мне нравится смотреть на тебя.",
      "Мне нравится, когда ты счастлива.",
      "Мне нравится слушать твой голос.",
      "Мне нравится заботиться о тебе.",
      "Мне нравится, что рядом с тобой спокойно.",
      "Мне нравится всё, что связано с тобой.",
      "Мне нравится просто знать, что ты есть.",
    ];

    const el = $("#why-text");
    if (!el) return;

    let index = 0;
    el.textContent = reasons[index];

    setInterval(() => {
      el.classList.add("fade");
      setTimeout(() => {
        index = (index + 1) % reasons.length;
        el.textContent = reasons[index];
        el.classList.remove("fade");
      }, 400);
    }, 4000);
  }

  /* =================================================================
     ENVELOPE
  ================================================================= */
  function initEnvelope() {
    const envelope = $("#envelope");
    if (!envelope) return;

    let opened = false;

    const toggle = () => {
      opened = !opened;
      envelope.classList.toggle("open", opened);

      if (opened) {
        // Give the reader time before the finale begins.
        scheduleFinale();
      }
    };

    envelope.addEventListener("click", toggle);
    envelope.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  }

  /* =================================================================
     MUSIC PLAYER
  ================================================================= */
  function initMusic() {
    const btn = $("#music-btn");
    const audio = $("#bg-audio");
    if (!btn || !audio) return;

    let playing = false;

    btn.addEventListener("click", async () => {
      try {
        if (!playing) {
          await audio.play();
          playing = true;
          btn.classList.add("playing");
        } else {
          audio.pause();
          playing = false;
          btn.classList.remove("playing");
        }
      } catch (err) {
        // Autoplay / decoding restrictions — fail silently and quietly.
        console.warn("Не удалось воспроизвести музыку:", err);
      }
    });
  }

  /* =================================================================
     FINALE
  ================================================================= */
  let finaleTriggered = false;

  function scheduleFinale() {
    if (finaleTriggered) return;
    finaleTriggered = true;

    setTimeout(runFinale, 3500);
  }

  async function runFinale() {
    const finale = $("#finale");
    const heartsCanvas = $("#hearts-canvas");
    if (!finale || !heartsCanvas) return;

    const rain = new HeartRain(heartsCanvas);

    finale.classList.add("show");
    rain.start(6000);

    // Hold the finale message on screen, then let everything dissolve.
    await wait(9000);
    finale.classList.add("fade-out");
    await wait(1500);
    rain.stop();
    finale.classList.remove("show", "fade-out");
  }

  /* =================================================================
     INIT
  ================================================================= */
  function init() {
    playIntroSequence();
    initScrollReveal();
    initWhyCard();
    initEnvelope();
    initMusic();

    const openBtn = $("#open-btn");
    const greetingScreen = document.querySelector(".greeting-screen");
    if (openBtn && greetingScreen) {
      openBtn.addEventListener("click", () => {
        greetingScreen.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
