// ========================================================
// DONIYOR & ODINA: ROMANTIC INTERACTIVE SCRIPT
// ========================================================

document.addEventListener("DOMContentLoaded", () => {

  // 1. DATE FORMATTER
  const dateEl = document.getElementById("currentDate");
  if (dateEl) {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('uz-UZ', options);
  }

  // 2. STARRY BACKGROUND CANVAS
  initStarrySky();

  // 3. FLOATING HEARTS GENERATOR
  initFloatingHearts();

  // 4. MUSIC CONTROLLER (Synthesized Ethereal Love Melody using Web Audio API)
  initRomanticAudio();

  // 5. ENVELOPE OPENING MECHANIC
  initEnvelope();

  // 6. 3D FLIP CARDS CLICK SUPPORT (For Mobile & Touch)
  initFlipCards();

  // 7. VIRTUAL ROSE GARDEN
  initRoseGarden();

  // 8. PLAYFUL FORGIVENESS GAME ("Yo'q" run away & "Ha" celebrate)
  initForgivenessGame();

});

// --- STARRY SKY CANVAS ---
function initStarrySky() {
  const canvas = document.getElementById("starsCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height;
  let stars = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = [];
    const count = Math.floor((width * height) / 3500);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005
      });
    }
  }

  resize();
  window.addEventListener("resize", resize);

  function animate() {
    ctx.clearRect(0, 0, width, height);

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

    requestAnimationFrame(animate);
  }

  animate();
}

// --- FLOATING HEARTS ---
function initFloatingHearts() {
  const container = document.getElementById("heartsContainer");
  if (!container) return;

  const heartIcons = ["❤️", "💖", "🌸", "✨", "💕", "🌹"];

  function createHeart() {
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
    heart.style.left = Math.random() * 95 + "vw";
    heart.style.fontSize = Math.floor(Math.random() * 16 + 14) + "px";
    heart.style.animationDuration = (Math.random() * 3 + 4) + "s";
    container.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 7000);
  }

  setInterval(createHeart, 800);
}

// --- SYNTHESIZED ROMANTIC PIANO MUSIC (Web Audio API) ---
function initRomanticAudio() {
  const toggle = document.getElementById("musicToggle");
  let audioCtx = null;
  let isPlaying = false;
  let timerId = null;

  // Romantic chord progression frequencies (C major / A minor sweet lullaby):
  // Notes: C4, E4, G4, B4, C5, D5, E5
  const notes = [
    261.63, 329.63, 392.00, 493.88, 523.25, 587.33, 659.25,
    392.00, 440.00, 523.25, 349.23, 440.00, 523.25, 392.00
  ];

  function playTone(freq, time, duration = 1.6) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    // Smooth envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  function startMelody() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    let step = 0;
    timerId = setInterval(() => {
      const now = audioCtx.currentTime;
      const freq = notes[step % notes.length];
      playTone(freq, now, 2.0);
      // Soft bass harmony
      if (step % 2 === 0) {
        playTone(freq / 2, now, 3.0);
      }
      step++;
    }, 700);

    isPlaying = true;
    toggle.classList.remove("paused");
  }

  function stopMelody() {
    if (timerId) clearInterval(timerId);
    isPlaying = false;
    toggle.classList.add("paused");
  }

  toggle?.addEventListener("click", () => {
    if (isPlaying) {
      stopMelody();
    } else {
      startMelody();
    }
  });

  // Autoplay attempt on first user interaction
  const autoPlayHandler = () => {
    if (!isPlaying) {
      startMelody();
    }
    window.removeEventListener("click", autoPlayHandler);
  };
  window.addEventListener("click", autoPlayHandler, { once: true });
}

// --- ENVELOPE OPENING ---
function initEnvelope() {
  const envelope = document.getElementById("envelope");
  const waxSeal = document.getElementById("waxSeal");
  const revealedContent = document.getElementById("revealedContent");
  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    envelope.classList.add("opened");

    // Dynamic center burst of hearts around seal
    const rect = envelope.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);

    setTimeout(() => {
      revealedContent.classList.add("active");
      revealedContent.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1000);
  }

  waxSeal?.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  waxSeal?.addEventListener("click", (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  envelope?.addEventListener("click", openEnvelope);
}

// --- FLIP CARDS CLICK SUPPORT (For Mobile) ---
function initFlipCards() {
  const cards = document.querySelectorAll(".flip-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
  });
}

// --- VIRTUAL ROSE GARDEN ---
function initRoseGarden() {
  const plantBtn = document.getElementById("plantRoseBtn");
  const stage = document.getElementById("gardenStage");
  const counterEl = document.getElementById("roseCount");
  const progressEl = document.getElementById("roseProgress");

  let currentCount = 0;
  const maxRoses = 101;

  plantBtn?.addEventListener("click", () => {
    if (currentCount >= maxRoses) {
      alert("Odina uchun barcha 101 ta atirgul to'liq ekildi! Siz dunyodagi eng go'zalisiz! 🌹✨");
      return;
    }

    currentCount++;
    counterEl.textContent = currentCount;
    progressEl.style.width = (currentCount / maxRoses * 100) + "%";

    const hint = stage.querySelector(".empty-garden-hint");
    if (hint) hint.remove();

    const rose = document.createElement("span");
    rose.className = "rose-item";
    const roseEmojis = ["🌹", "🌸", "🌺", "🌷", "💐"];
    rose.textContent = roseEmojis[Math.floor(Math.random() * roseEmojis.length)];
    stage.appendChild(rose);
    stage.scrollTop = stage.scrollHeight;

    // Small heart burst on button
    const rect = plantBtn.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top, 5);

    if (currentCount === maxRoses) {
      plantBtn.textContent = "🌹 101 Ta Atirgul To'liq Yig'ildi! 💖";
      plantBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
      launchConfetti();
    }
  });
}

// --- PLAYFUL FORGIVENESS GAME ---
function initForgivenessGame() {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const arena = document.getElementById("buttonsArena");
  const commentEl = document.getElementById("attemptsComment");
  const victoryModal = document.getElementById("victoryModal");
  const closeVictoryBtn = document.getElementById("closeVictoryBtn");

  let noHoverCount = 0;
  let yesScale = 1;

  const noPhrases = [
    "Rostdanmi? 🥺",
    "Yana bir bor o'ylab ko'ring...",
    "Meni kechirmasdan ketolmaysiz 🙈",
    "Uzur so'rayapman-ku 🥺",
    "Qochdim! 🏃‍♂️💨",
    "Iltimos, kechiraqoling... 🥺",
    "Ushlay olmadingiz 😜",
    "Baribir 'HA'ni bosasiz! ❤️"
  ];

  function runAway(e) {
    if (e && e.type === "touchstart") {
      e.preventDefault();
    }
    noHoverCount++;

    // Cycle funny text
    const phrase = noPhrases[(noHoverCount - 1) % noPhrases.length];
    noBtn.textContent = phrase;
    commentEl.textContent = `Odina, axir Doniyor chin dildan kechirim so'rayapti-ku... 🥺 (Urinish: ${noHoverCount})`;

    // Scale up "Yes" button (capped for mobile so it never causes page overflow)
    const isMobile = window.innerWidth <= 600;
    const maxScale = isMobile ? 1.25 : 1.5;
    yesScale = Math.min(maxScale, yesScale + (isMobile ? 0.05 : 0.12));
    yesBtn.style.transform = `scale(${yesScale})`;
    yesBtn.style.boxShadow = `0 15px 40px rgba(16, 185, 129, ${Math.min(0.9, 0.4 + yesScale * 0.1)})`;

    // Move "No" button safely within arena bounds
    const arenaRect = arena.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const spanX = Math.max(30, (arenaRect.width - btnRect.width) / 2 - 10);
    const spanY = Math.max(20, (arenaRect.height - btnRect.height) / 2 - 10);

    const randomX = (Math.random() - 0.5) * 2 * Math.min(spanX, 90);
    const randomY = (Math.random() - 0.5) * 2 * Math.min(spanY, 40);

    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.92)`;

    // If 8+ attempts, turn No button into another YES button!
    if (noHoverCount >= 8) {
      noBtn.textContent = "Mayli, kechirdim! ❤️";
      noBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      noBtn.style.color = "#fff";
      noBtn.style.transform = "none";
      noBtn.removeEventListener("mouseover", runAway);
      noBtn.removeEventListener("touchstart", runAway);
      noBtn.onclick = celebrateVictory;
    }
  }

  // Hover on desktop
  noBtn?.addEventListener("mouseover", runAway);
  // Touch on mobile
  noBtn?.addEventListener("touchstart", runAway, { passive: false });

  // Click on Yes
  yesBtn?.addEventListener("click", celebrateVictory);

  function celebrateVictory() {
    launchConfetti();
    launchFireworks();
    victoryModal.classList.add("active");
  }

  // Instagram Send Action
  const igBtn = document.getElementById("instagramSendBtn");
  const igToast = document.getElementById("igCopyToast");

  igBtn?.addEventListener("click", () => {
    const message = "Doniyor, saytingni ko'rdim va seni kechirdim ❤️🥰";

    // 1. Copy message to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).catch(() => {
        fallbackCopyText(message);
      });
    } else {
      fallbackCopyText(message);
    }

    // 2. Show toast
    if (igToast) {
      igToast.classList.add("visible");
      setTimeout(() => {
        igToast.classList.remove("visible");
      }, 5000);
    }

    // 3. Open Instagram Direct
    setTimeout(() => {
      window.open("https://www.instagram.com/direct/inbox/", "_blank");
    }, 400);
  });

  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {}
    document.body.removeChild(textArea);
  }

  closeVictoryBtn?.addEventListener("click", () => {
    victoryModal.classList.remove("active");
  });
}

// --- BURST OF PARTICLES ---
function createBurst(x, y, count = 10) {
  const container = document.body;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.textContent = ["💖", "✨", "🌸", "❤️"][Math.floor(Math.random() * 4)];
    p.style.position = "fixed";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.pointerEvents = "none";
    p.style.zIndex = "9999";
    p.style.fontSize = "20px";
    p.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
    container.appendChild(p);

    const destX = (Math.random() - 0.5) * 160;
    const destY = (Math.random() - 0.5) * 160 - 30;

    setTimeout(() => {
      p.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
      p.style.opacity = "0";
    }, 20);

    setTimeout(() => p.remove(), 850);
  }
}

// --- CONFETTI & FIREWORKS ---
function launchConfetti() {
  const colors = ["#ff3377", "#ff75a0", "#f59e0b", "#10b981", "#7000ff", "#ffffff"];
  for (let i = 0; i < 70; i++) {
    const c = document.createElement("div");
    c.style.position = "fixed";
    c.style.left = Math.random() * 100 + "vw";
    c.style.top = "-20px";
    c.style.width = Math.random() * 10 + 6 + "px";
    c.style.height = Math.random() * 12 + 6 + "px";
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    c.style.borderRadius = "3px";
    c.style.pointerEvents = "none";
    c.style.zIndex = "100000";
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    c.style.transition = `top ${Math.random() * 2 + 2}s cubic-bezier(0.25, 1, 0.5, 1), transform 3s ease`;

    document.body.appendChild(c);

    setTimeout(() => {
      c.style.top = "105vh";
      c.style.transform = `rotate(${Math.random() * 720}deg) scale(0.5)`;
    }, 30);

    setTimeout(() => c.remove(), 4000);
  }
}

function launchFireworks() {
  for (let b = 0; b < 5; b++) {
    setTimeout(() => {
      const rx = Math.random() * (window.innerWidth - 100) + 50;
      const ry = Math.random() * (window.innerHeight / 2) + 50;
      createBurst(rx, ry, 25);
    }, b * 300);
  }
}
