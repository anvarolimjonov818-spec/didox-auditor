// ========================================================
// DONIYOR & ODINA: ULTRA-PREMIUM ROMANTIC ENGINE
// ========================================================

document.addEventListener("DOMContentLoaded", () => {

  // 1. DATE FORMATTER IN UZBEK
  initLiveDate();

  // 2. AMBIENT CANVAS (STARS, STARDUST & FIREFLIES)
  initAmbientCanvas();

  // 3. FLOATING HEARTS GENERATOR
  initFloatingHearts();

  // 4. CRYSTALLINE AUDIO ENGINE (MUSIC BOX & CHIMES)
  const audio = initAudioEngine();

  // 5. 3D WAX-SEAL ENVELOPE OPENING
  initEnvelope(audio);

  // 6. 3D FLIP CARDS WITH CHIME EFFECT
  initFlipCards(audio);

  // 7. VIRTUAL 101 ROSE GARDEN WITH MILESTONES
  initRoseGarden(audio);

  // 8. PLAYFUL FORGIVENESS GAME ARENA
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

// --- 2. AMBIENT CANVAS (STARS & FIREFLIES) ---
function initAmbientCanvas() {
  const canvas = document.getElementById("ambientCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height;
  let stars = [];
  let fireflies = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Generate Stars
    stars = [];
    const starCount = Math.floor((width * height) / 3800);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random(),
        speed: Math.random() * 0.018 + 0.006
      });
    }

    // Generate Fireflies
    fireflies = [];
    const fireflyCount = Math.min(25, Math.floor(width / 35));
    for (let i = 0; i < fireflyCount; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 1.2,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        color: Math.random() > 0.5 ? '#f59e0b' : '#ff75a0'
      });
    }
  }

  resize();
  window.addEventListener("resize", resize);

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Render Twinkling Stars
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

    // Render Drifting Fireflies
    fireflies.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;

      if (f.x < 0) f.x = width;
      if (f.x > width) f.x = 0;
      if (f.y < 0) f.y = height;
      if (f.y > height) f.y = 0;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = f.color;
      ctx.globalAlpha = f.alpha;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// --- 3. FLOATING HEARTS GENERATOR ---
function initFloatingHearts() {
  const container = document.getElementById("heartsContainer");
  if (!container) return;

  const heartIcons = ["❤️", "💖", "🌸", "✨", "💕", "🌹", "💫"];

  function createHeart() {
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
    heart.style.left = Math.random() * 94 + "vw";
    heart.style.fontSize = Math.floor(Math.random() * 18 + 14) + "px";
    heart.style.animationDuration = (Math.random() * 3 + 4.5) + "s";
    container.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 8000);
  }

  setInterval(createHeart, 900);
}

// --- 4. CRYSTALLINE AUDIO ENGINE (Web Audio API) ---
function initAudioEngine() {
  const toggle = document.getElementById("musicToggle");
  let audioCtx = null;
  let isPlaying = false;
  let melodyInterval = null;

  function getContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Musical notes in Hertz (Romantic pentatonic lullaby in C / Am)
  const melodyNotes = [
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

  // Play gentle music box tone
  function playMusicBoxTone(freq, time, duration = 1.8) {
    const ctx = getContext();
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

  // Play soft chime on card flip
  function playCardChime() {
    try {
      const ctx = getContext();
      const now = ctx.currentTime;
      const chimeNotes = [783.99, 1046.50];
      chimeNotes.forEach((freq, idx) => {
        playMusicBoxTone(freq, now + idx * 0.08, 0.8);
      });
    } catch (e) {}
  }

  function startMelody() {
    const ctx = getContext();
    let step = 0;
    
    melodyInterval = setInterval(() => {
      const now = ctx.currentTime;
      const freq = melodyNotes[step % melodyNotes.length];
      playMusicBoxTone(freq, now, 1.8);

      // Warm octave bass on alternate beats
      if (step % 2 === 0) {
        playMusicBoxTone(freq / 2, now, 2.4);
      }
      step++;
    }, 650);

    isPlaying = true;
    toggle?.classList.remove("paused");
  }

  function stopMelody() {
    if (melodyInterval) clearInterval(melodyInterval);
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

  // Autoplay on first tap/click anywhere
  const userGestureHandler = () => {
    if (!isPlaying) {
      startMelody();
    }
    window.removeEventListener("click", userGestureHandler);
    window.removeEventListener("touchstart", userGestureHandler);
  };
  window.addEventListener("click", userGestureHandler, { once: true });
  window.addEventListener("touchstart", userGestureHandler, { once: true });

  return {
    playChime: playCardChime,
    startMelody: startMelody
  };
}

// --- 5. 3D WAX-SEAL ENVELOPE OPENING ---
function initEnvelope(audio) {
  const envelope = document.getElementById("envelope");
  const waxSeal = document.getElementById("waxSeal");
  const openCue = document.getElementById("openCue");
  const revealedContent = document.getElementById("revealedContent");
  let isOpened = false;

  function triggerOpen(e) {
    if (e) e.stopPropagation();
    if (isOpened) return;
    isOpened = true;

    envelope.classList.add("opened");
    if (openCue) openCue.style.display = "none";

    // Play pleasant burst tone
    if (audio) audio.playChime();

    // Spawn golden particles from wax seal center
    const rect = waxSeal.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);

    // Smooth reveal of main content
    setTimeout(() => {
      revealedContent.classList.add("active");
      revealedContent.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 950);
  }

  waxSeal?.addEventListener("click", triggerOpen);
  waxSeal?.addEventListener("pointerdown", triggerOpen);
  envelope?.addEventListener("click", triggerOpen);
}

// --- 6. 3D FLIP CARDS WITH CHIME EFFECT ---
function initFlipCards(audio) {
  const cards = document.querySelectorAll(".reason-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      if (card.classList.contains("flipped") && audio) {
        audio.playChime();
      }
    });
  });
}

// --- 7. VIRTUAL 101 ROSE GARDEN WITH MILESTONES ---
function initRoseGarden(audio) {
  const plantBtn = document.getElementById("plantRoseBtn");
  const autoPlantBtn = document.getElementById("autoPlantBtn");
  const stage = document.getElementById("gardenStage");
  const counterEl = document.getElementById("roseCount");
  const progressEl = document.getElementById("roseProgress");
  const cue = document.getElementById("emptyStageCue");

  let currentRoses = 0;
  const maxRoses = 101;
  const roseEmojis = ["🌹", "🌸", "🌺", "🌷", "💐", "🥀"];

  function addSingleRose() {
    if (currentRoses >= maxRoses) return;

    currentRoses++;
    counterEl.textContent = currentRoses;
    progressEl.style.width = (currentRoses / maxRoses * 100) + "%";

    if (cue) cue.style.display = "none";

    const rose = document.createElement("span");
    rose.className = "bloomed-rose";
    rose.textContent = roseEmojis[Math.floor(Math.random() * roseEmojis.length)];
    stage.appendChild(rose);
    stage.scrollTop = stage.scrollHeight;

    // Small sparkle burst
    const rect = plantBtn.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top, 6);

    // Milestones Check
    if (currentRoses === 25) {
      showMiniPraise("25 ta atirgul ochildi! 🌸 Har bir gul sizning tabassumingiz!");
    } else if (currentRoses === 50) {
      showMiniPraise("50 ta atirgul! 💖 Bog'ingiz yanada go'zallashmoqda!");
    } else if (currentRoses === 75) {
      showMiniPraise("75 ta atirgul! ✨ Qalbingiz kabi go'zal bog'!");
    } else if (currentRoses === maxRoses) {
      completeGarden();
    }
  }

  function completeGarden() {
    plantBtn.textContent = "🌹 101 Ta Atirgul To'liq Yig'ildi! 💖";
    plantBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
    if (autoPlantBtn) autoPlantBtn.style.display = "none";
    launchConfetti();
  }

  plantBtn?.addEventListener("click", () => {
    if (currentRoses >= maxRoses) {
      alert("Odina uchun 101 ta atirgul to'liq ekildi! Siz dunyodagi eng go'zal insonsiz! 🌹✨");
      return;
    }
    addSingleRose();
  });

  autoPlantBtn?.addEventListener("click", () => {
    if (currentRoses >= maxRoses) return;
    const interval = setInterval(() => {
      if (currentRoses >= maxRoses) {
        clearInterval(interval);
      } else {
        addSingleRose();
      }
    }, 40);
  });
}

function showMiniPraise(text) {
  const toast = document.createElement("div");
  toast.className = "ig-toast visible";
  toast.style.position = "fixed";
  toast.style.bottom = "30px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.zIndex = "99999";
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// --- 8. PLAYFUL FORGIVENESS GAME ARENA ---
function initForgivenessGame(audio) {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const arena = document.getElementById("buttonsArena");
  const commentEl = document.getElementById("attemptsComment");
  const victoryModal = document.getElementById("victoryModal");
  const closeVictoryBtn = document.getElementById("closeVictoryBtn");
  const igBtn = document.getElementById("instagramSendBtn");
  const igToast = document.getElementById("igCopyToast");

  let noAttempts = 0;
  let yesScale = 1;

  const beggingPhrases = [
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
    noAttempts++;

    // Phrase rotation
    const phrase = beggingPhrases[(noAttempts - 1) % beggingPhrases.length];
    noBtn.textContent = phrase;
    commentEl.textContent = `Odina, axir Doniyor chin dildan kechirim so'rayapti-ku... 🥺 (Urinish: ${noAttempts})`;

    // Scale up "Yes" button within safe mobile limits
    const isMobile = window.innerWidth <= 600;
    const maxScale = isMobile ? 1.25 : 1.45;
    yesScale = Math.min(maxScale, yesScale + (isMobile ? 0.05 : 0.1));
    yesBtn.style.transform = `scale(${yesScale})`;

    // Move "No" button safely within arena
    const arenaRect = arena.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const spanX = Math.max(25, (arenaRect.width - btnRect.width) / 2 - 12);
    const spanY = Math.max(18, (arenaRect.height - btnRect.height) / 2 - 12);

    const randomX = (Math.random() - 0.5) * 2 * Math.min(spanX, 95);
    const randomY = (Math.random() - 0.5) * 2 * Math.min(spanY, 40);

    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.92)`;

    // After 7 attempts, turn into loving surrender button
    if (noAttempts >= 7) {
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

  // Instagram Send Action with Auto-Copy
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
function createBurst(x, y, count = 15) {
  const icons = ["✨", "💖", "🌸", "🌹", "⭐", "💫"];
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
