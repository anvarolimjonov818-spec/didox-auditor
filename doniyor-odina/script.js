// ========================================================
// DONIYOR & ODINA: ROSE-GOLD & VELVET ROMANTIC ENGINE
// ========================================================

document.addEventListener("DOMContentLoaded", () => {

  // 1. LIVE DATE IN UZBEK
  initLiveDate();

  // 2. AMBIENT CANVAS (STARS, GLOWING BOKEH & ROSE PETALS)
  initAmbientCanvas();

  // 3. FLOATING ROSE PETALS GENERATOR
  initFloatingPetals();

  // 4. CRYSTALLINE WEB AUDIO API ENGINE
  const audio = initAudioEngine();

  // 5. 3D CRYSTAL HEART PORTAL UNLOCK
  initHeartPortal(audio);

  // 6. LUXURY TAB SWITCHER & PANEL ROUTING
  initTabSwitcher(audio);

  // 7. 3D HOLOGRAM FLIP CARDS WITH HARMONIC CHIMES
  initHologramCards(audio);

  // 8. 101 MAGIC ROSES MEADOW WITH MILESTONES
  initRoseGarden(audio);

  // 9. FORGIVENESS ARENA WITH DODGING PHYSICS
  initForgivenessGame(audio);

});

// --- 1. LIVE DATE FORMATTER ---
function initLiveDate() {
  const dateEl = document.getElementById("currentDate");
  if (!dateEl) return;
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    dateEl.textContent = now.toLocaleDateString('uz-UZ', options);
  } catch (e) {
    dateEl.textContent = `${now.getDate()}-kun, ${now.getFullYear()}-yil`;
  }
}

// --- 2. AMBIENT CANVAS (STARS & BOKEH) ---
function initAmbientCanvas() {
  const canvas = document.getElementById("ambientCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height;
  let stars = [];
  let bokehOrbs = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Stars
    stars = [];
    const count = Math.floor((width * height) / 3600);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random(),
        speed: Math.random() * 0.016 + 0.006
      });
    }

    // Glowing Bokeh Orbs
    bokehOrbs = [];
    const orbCount = Math.min(25, Math.floor(width / 32));
    for (let i = 0; i < orbCount; i++) {
      bokehOrbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.8 + 1.2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        color: Math.random() > 0.5 ? '#f59e0b' : '#ff75a0'
      });
    }
  }

  resize();
  window.addEventListener("resize", resize);

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Stars
    stars.forEach(star => {
      star.alpha += star.speed;
      if (star.alpha > 1 || star.alpha < 0) {
        star.speed = -star.speed;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
      ctx.fill();
    });

    // Bokeh Orbs
    bokehOrbs.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// --- 3. FLOATING ROSE PETALS ---
function initFloatingPetals() {
  const container = document.getElementById("petalContainer");
  if (!container) return;

  const petals = ["🌸", "🌹", "💖", "✨", "💫", "❤️", "🌺"];

  function spawnPetal() {
    const el = document.createElement("div");
    el.className = "falling-rose-petal";
    el.textContent = petals[Math.floor(Math.random() * petals.length)];
    el.style.left = Math.random() * 94 + "vw";
    el.style.fontSize = Math.floor(Math.random() * 16 + 14) + "px";
    el.style.animationDuration = (Math.random() * 3 + 4.5) + "s";
    container.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 8000);
  }

  setInterval(spawnPetal, 900);
}

// --- 4. CRYSTALLINE WEB AUDIO API ENGINE ---
function initAudioEngine() {
  const toggle = document.getElementById("musicToggle");
  let audioCtx = null;
  let isPlaying = false;
  let melodyTimer = null;

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Romantic Pentatonic Music Box Notes in Hertz
  const notes = [
    523.25, // C5
    659.25, // E5
    783.99, // G5
    987.77, // B5
    1046.50, // C6
    880.00, // A5
    783.99, // G5
    659.25, // E5
    587.33, // D5
    523.25, // C5
    440.00, // A4
    523.25  // C5
  ];

  function playTone(freq, time, duration = 1.8) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.09, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  function playChime() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      [783.99, 1046.50].forEach((freq, i) => {
        playTone(freq, now + i * 0.08, 0.9);
      });
    } catch (e) {}
  }

  function startMelody() {
    const ctx = getCtx();
    let step = 0;

    melodyTimer = setInterval(() => {
      const now = ctx.currentTime;
      const freq = notes[step % notes.length];
      playTone(freq, now, 1.8);

      if (step % 2 === 0) {
        playTone(freq / 2, now, 2.4);
      }
      step++;
    }, 650);

    isPlaying = true;
    toggle?.classList.remove("paused");
  }

  function stopMelody() {
    if (melodyTimer) clearInterval(melodyTimer);
    isPlaying = false;
    toggle?.classList.add("paused");
  }

  toggle?.addEventListener("click", () => {
    if (isPlaying) {
      stopMelody();
    } else {
      startMelody();
    }
  });

  // Autoplay on first user interaction
  const autoPlayTrigger = () => {
    if (!isPlaying) {
      startMelody();
    }
    window.removeEventListener("click", autoPlayTrigger);
    window.removeEventListener("touchstart", autoPlayTrigger);
  };
  window.addEventListener("click", autoPlayTrigger, { once: true });
  window.addEventListener("touchstart", autoPlayTrigger, { once: true });

  return {
    playChime: playChime,
    startMelody: startMelody
  };
}

// --- 5. 3D CRYSTAL HEART PORTAL UNLOCK ---
function initHeartPortal(audio) {
  const portal = document.getElementById("heartPortal");
  const portalSection = document.getElementById("portalSection");
  const showcase = document.getElementById("experienceShowcase");
  const cue = document.getElementById("portalTapCue");
  let unlocked = false;

  function unlockHeart(e) {
    if (e) e.stopPropagation();
    if (unlocked) return;
    unlocked = true;

    if (cue) cue.style.display = "none";
    if (audio) audio.playChime();

    // Massive Rose Petal Burst from Portal
    const rect = portal.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);

    // Smooth reveal showcase
    setTimeout(() => {
      portalSection.style.display = "none";
      showcase.classList.add("active");
      showcase.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 850);
  }

  portal?.addEventListener("click", unlockHeart);
  portal?.addEventListener("pointerdown", unlockHeart);
}

// --- 6. LUXURY TAB SWITCHER ---
function initTabSwitcher(audio) {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const navForwardButtons = document.querySelectorAll(".nav-forward-btn");

  function switchTab(tabId) {
    const targetPanel = document.getElementById(tabId);
    if (!targetPanel) return;

    tabPanels.forEach(panel => panel.classList.remove("active"));
    targetPanel.classList.add("active");

    tabButtons.forEach(btn => {
      const isActive = btn.getAttribute("data-tab") === tabId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive);
    });

    targetPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    if (audio) audio.playChime();
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  navForwardButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const nextTabId = btn.getAttribute("data-next");
      switchTab(nextTabId);
    });
  });

  window.switchTab = switchTab;
}

// --- 7. 3D HOLOGRAM CARDS ---
function initHologramCards(audio) {
  const cards = document.querySelectorAll(".hologram-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      if (card.classList.contains("flipped") && audio) {
        audio.playChime();
      }
    });
  });
}

// --- 8. 101 MAGIC ROSES MEADOW ---
function initRoseGarden(audio) {
  const plantBtn = document.getElementById("plantRoseBtn");
  const autoPlantBtn = document.getElementById("autoPlantBtn");
  const stage = document.getElementById("gardenStage");
  const counterEl = document.getElementById("roseCount");
  const progressEl = document.getElementById("roseProgress");
  const prompt = document.getElementById("gardenPrompt");

  let currentRoses = 0;
  const maxRoses = 101;
  const emojis = ["🌹", "🌸", "🌺", "🌷", "💐", "🥀", "💮"];

  function addRose() {
    if (currentRoses >= maxRoses) return;

    currentRoses++;
    counterEl.textContent = currentRoses;
    progressEl.style.width = (currentRoses / maxRoses * 100) + "%";

    if (prompt) prompt.style.display = "none";

    const rose = document.createElement("span");
    rose.className = "bloomed-rose-leaf";
    rose.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    stage.appendChild(rose);
    stage.scrollTop = stage.scrollHeight;

    // Small sparkle on button
    const rect = plantBtn.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top, 5);

    // Milestones feedback
    if (currentRoses === 25) {
      showMiniToast("🌸 25 ta atirgul! Har bir gul sening tabassuming!");
    } else if (currentRoses === 50) {
      showMiniToast("💖 50 ta atirgul! Bog'imiz tobora go'zallashmoqda!");
    } else if (currentRoses === 75) {
      showMiniToast("✨ 75 ta atirgul! Qalbing kabi chiroyli!");
    } else if (currentRoses === maxRoses) {
      plantBtn.textContent = "🌹 101 Ta Atirgul To'liq Yig'ildi! 💖";
      plantBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
      if (autoPlantBtn) autoPlantBtn.style.display = "none";
      launchConfetti();
    }
  }

  stage?.addEventListener("click", () => {
    addRose();
  });

  plantBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentRoses >= maxRoses) {
      alert("Odina uchun barcha 101 ta atirgul ekildi! Siz dunyodagi eng go'zalsiz! 🌹✨");
      return;
    }
    addRose();
  });

  autoPlantBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentRoses >= maxRoses) return;

    const timer = setInterval(() => {
      if (currentRoses >= maxRoses) {
        clearInterval(timer);
      } else {
        addRose();
      }
    }, 35);
  });
}

function showMiniToast(msg) {
  const toast = document.createElement("div");
  toast.className = "ig-copy-feedback visible";
  toast.style.position = "fixed";
  toast.style.bottom = "80px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.zIndex = "99999";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// --- 9. FORGIVENESS ARENA ---
function initForgivenessGame(audio) {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const arena = document.getElementById("buttonsArena");
  const commentEl = document.getElementById("attemptsComment");
  const victoryModal = document.getElementById("victoryModal");
  const closeVictoryBtn = document.getElementById("closeVictoryBtn");
  const igBtn = document.getElementById("instagramSendBtn");
  const igToast = document.getElementById("igCopyToast");

  let attempts = 0;
  let yesScale = 1;

  const phrases = [
    "Rostdanmi? 🥺",
    "Yana bir bor o'ylab ko'ring...",
    "Meni kechirmasdan ketolmaysiz 🙈",
    "Chin dildan uzr so'rayapman-ku 🥺",
    "Qochdim! 🏃‍♂️💨",
    "Iltimos, kechiraqoling... 🥺",
    "Ushlay olmadingiz 😜",
    "Baribir 'HA'ni bosasiz! ❤️",
    "Xafa bo'lish sizga aslo yarashmaydi! 😊",
    "Bo'ldi, taslim bo'ldim! ✨"
  ];

  function runAway(e) {
    if (e && e.type === "touchstart") {
      e.preventDefault();
    }
    attempts++;

    // Expressive phrase
    const phrase = phrases[(attempts - 1) % phrases.length];
    noBtn.textContent = phrase;
    commentEl.textContent = `Odina, axir Doniyor chin dildan kechirim so'rayapti-ku... 🥺 (Urinish: ${attempts})`;

    // Scale up "Yes" button safely
    const isMobile = window.innerWidth <= 600;
    const maxScale = isMobile ? 1.25 : 1.45;
    yesScale = Math.min(maxScale, yesScale + (isMobile ? 0.05 : 0.1));
    yesBtn.style.transform = `scale(${yesScale})`;

    // Safe physics inside arena
    const arenaRect = arena.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const spanX = Math.max(25, (arenaRect.width - btnRect.width) / 2 - 12);
    const spanY = Math.max(18, (arenaRect.height - btnRect.height) / 2 - 12);

    const randomX = (Math.random() - 0.5) * 2 * Math.min(spanX, 95);
    const randomY = (Math.random() - 0.5) * 2 * Math.min(spanY, 40);

    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.92)`;

    // Surrender after 7 attempts
    if (attempts >= 7) {
      noBtn.textContent = "Mayli, kechirdim! ❤️";
      noBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      noBtn.style.color = "#ffffff";
      noBtn.style.transform = "none";
      noBtn.removeEventListener("mouseover", runAway);
      noBtn.removeEventListener("touchstart", runAway);
      noBtn.onclick = celebrateVictory;
    }
  }

  noBtn?.addEventListener("mouseover", runAway);
  noBtn?.addEventListener("touchstart", runAway, { passive: false });

  yesBtn?.addEventListener("click", celebrateVictory);

  function celebrateVictory() {
    launchConfetti();
    launchFireworks();
    victoryModal.classList.add("active");
    if (audio) audio.playChime();
  }

  closeVictoryBtn?.addEventListener("click", () => {
    victoryModal.classList.remove("active");
  });

  // Instagram Send Action with 1-Tap Copy
  igBtn?.addEventListener("click", () => {
    const message = "Doniyor, saytingni ko'rdim va seni kechirdim ❤️🥰";

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).catch(() => {
        fallbackCopy(message);
      });
    } else {
      fallbackCopy(message);
    }

    if (igToast) {
      igToast.classList.add("visible");
      setTimeout(() => {
        igToast.classList.remove("visible");
      }, 5000);
    }

    setTimeout(() => {
      window.open("https://www.instagram.com/direct/inbox/", "_blank");
    }, 450);
  });

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); } catch (err) {}
    document.body.removeChild(ta);
  }
}

// --- PARTICLE BURST HELPER ---
function createBurst(x, y, count = 16) {
  const icons = ["✨", "💖", "🌸", "🌹", "⭐", "💫", "👑"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.textContent = icons[Math.floor(Math.random() * icons.length)];
    p.style.position = "fixed";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.pointerEvents = "none";
    p.style.zIndex = "99999";
    p.style.fontSize = Math.floor(Math.random() * 10 + 16) + "px";
    p.style.transition = "all 0.85s cubic-bezier(0.25, 1, 0.5, 1)";
    document.body.appendChild(p);

    const destX = (Math.random() - 0.5) * 200;
    const destY = (Math.random() - 0.5) * 200 - 30;

    setTimeout(() => {
      p.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
      p.style.opacity = "0";
    }, 20);

    setTimeout(() => p.remove(), 900);
  }
}

// --- CONFETTI STORM ---
function launchConfetti() {
  const colors = ["#ff2d6d", "#ff75a0", "#f59e0b", "#10b981", "#a855f7", "#ffffff", "#ffd700"];
  for (let i = 0; i < 85; i++) {
    const c = document.createElement("div");
    c.style.position = "fixed";
    c.style.left = Math.random() * 100 + "vw";
    c.style.top = "-25px";
    c.style.width = Math.random() * 12 + 6 + "px";
    c.style.height = Math.random() * 14 + 6 + "px";
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    c.style.borderRadius = Math.random() > 0.5 ? "50%" : "3px";
    c.style.pointerEvents = "none";
    c.style.zIndex = "100000";
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    c.style.transition = `top ${Math.random() * 2.5 + 2}s cubic-bezier(0.25, 1, 0.5, 1), transform 3.5s ease`;

    document.body.appendChild(c);

    setTimeout(() => {
      c.style.top = "105vh";
      c.style.transform = `rotate(${Math.random() * 900}deg) scale(0.6)`;
    }, 30);

    setTimeout(() => c.remove(), 4500);
  }
}

// --- FIREWORKS BLASTS ---
function launchFireworks() {
  for (let b = 0; b < 6; b++) {
    setTimeout(() => {
      const rx = Math.random() * (window.innerWidth - 80) + 40;
      const ry = Math.random() * (window.innerHeight / 2.2) + 60;
      createBurst(rx, ry, 25);
    }, b * 260);
  }
}
