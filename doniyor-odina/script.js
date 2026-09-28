/* ==========================================================================
   DONIYOR & ODINA — INTERACTIVE EXPERIENCE ENGINE
   Web Audio API, Stardust Particles, Voice Note, Scanner & DM Integration
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. COSMIC BACKGROUND & STARDUST CANVAS
  // ==========================================
  const cosmosCanvas = document.getElementById('cosmosCanvas');
  const cosmosCtx = cosmosCanvas.getContext('2d');
  const stardustCanvas = document.getElementById('stardustCanvas');
  const stardustCtx = stardustCanvas.getContext('2d');

  let width = (cosmosCanvas.width = stardustCanvas.width = window.innerWidth);
  let height = (cosmosCanvas.height = stardustCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = cosmosCanvas.width = stardustCanvas.width = window.innerWidth;
    height = cosmosCanvas.height = stardustCanvas.height = window.innerHeight;
    initStars();
  });

  // Background ambient stars
  let stars = [];
  function initStars() {
    stars = [];
    const count = Math.floor((width * height) / 9000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: ['#ffffff', '#ff9ebb', '#ffd166', '#a78bfa'][Math.floor(Math.random() * 4)]
      });
    }
  }
  initStars();

  // Touch / Interactive Stardust particles
  let touchParticles = [];
  function addTouchSpark(x, y, isHeart = false) {
    const count = isHeart ? 12 : 3;
    for (let i = 0; i < count; i++) {
      touchParticles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * (isHeart ? 6 : 2),
        vy: (Math.random() - 0.5) * (isHeart ? 6 : 2) - 0.5,
        size: Math.random() * (isHeart ? 12 : 5) + 3,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        color: ['#ff2d75', '#ffd166', '#ff85a2', '#4ecdc4', '#ffffff'][Math.floor(Math.random() * 5)],
        isHeart: isHeart || Math.random() > 0.6
      });
    }
  }

  window.addEventListener('pointermove', (e) => {
    if (Math.random() > 0.4) {
      addTouchSpark(e.clientX, e.clientY, false);
    }
  });

  window.addEventListener('pointerdown', (e) => {
    addTouchSpark(e.clientX, e.clientY, true);
  });

  function renderParticles() {
    // Render Cosmos
    cosmosCtx.clearRect(0, 0, width, height);
    for (let star of stars) {
      star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
      star.alpha = Math.max(0.2, Math.min(1, star.alpha));
      cosmosCtx.save();
      cosmosCtx.globalAlpha = star.alpha;
      cosmosCtx.fillStyle = star.color;
      cosmosCtx.beginPath();
      cosmosCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      cosmosCtx.fill();
      cosmosCtx.restore();
    }

    // Render Stardust
    stardustCtx.clearRect(0, 0, width, height);
    for (let i = touchParticles.length - 1; i >= 0; i--) {
      const p = touchParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        touchParticles.splice(i, 1);
        continue;
      }

      stardustCtx.save();
      stardustCtx.globalAlpha = p.alpha;
      stardustCtx.fillStyle = p.color;

      if (p.isHeart) {
        stardustCtx.font = `${p.size}px sans-serif`;
        stardustCtx.fillText('❤️', p.x, p.y);
      } else {
        stardustCtx.beginPath();
        stardustCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        stardustCtx.fill();
      }
      stardustCtx.restore();
    }

    requestAnimationFrame(renderParticles);
  }
  renderParticles();


  // ==========================================
  // 2. WEB AUDIO API SYNTHESIZER (MUSIC & SFX)
  // ==========================================
  let audioCtx = null;
  let isPlayingMusic = false;
  let musicInterval = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.5, gainLevel = 0.15) {
    initAudio();
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // Ambient Romantic Melody Notes (Celeste / Music Box Chords)
  const melodyChords = [
    [523.25, 659.25, 783.99], // C Major (C5, E5, G5)
    [587.33, 739.99, 880.00], // D Major (D5, F#5, A5)
    [440.00, 554.37, 659.25], // A Major (A4, C#5, E5)
    [392.00, 493.88, 587.33], // G Major (G4, B4, D5)
    [659.25, 830.61, 987.77]  // E Major
  ];
  let chordIndex = 0;

  function playNextMelodyStep() {
    if (!isPlayingMusic) return;
    const chord = melodyChords[chordIndex % melodyChords.length];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        if (isPlayingMusic) playTone(freq, 'sine', 1.8, 0.08);
      }, idx * 280);
    });
    chordIndex++;
  }

  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIsland = document.getElementById('audioIsland');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const musicWave = document.getElementById('musicWave');
  const musicTitle = document.getElementById('musicTitle');

  function toggleMusic() {
    initAudio();
    isPlayingMusic = !isPlayingMusic;

    if (isPlayingMusic) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      musicWave.classList.add('playing');
      musicTitle.textContent = "Kuy Yangramoqda 🎵";
      playNextMelodyStep();
      musicInterval = setInterval(playNextMelodyStep, 2200);
      showToast("Musiqa yoqildi 🎶");
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      musicWave.classList.remove('playing');
      musicTitle.textContent = "Romantik Kuyni Yoqish";
      clearInterval(musicInterval);
    }
  }

  audioIsland.addEventListener('click', toggleMusic);


  // ==========================================
  // 3. SIMULATED VOICE NOTE PLAYER
  // ==========================================
  const voicePlayBtn = document.getElementById('voicePlayBtn');
  const voiceWaveform = document.getElementById('voiceWaveform');
  const voiceSubtitle = document.getElementById('voiceSubtitle');
  const voiceDuration = document.getElementById('voiceDuration');

  // Generate 28 dynamic waveform bars
  const totalBars = 28;
  const bars = [];
  for (let i = 0; i < totalBars; i++) {
    const bar = document.createElement('div');
    bar.classList.add('voice-bar');
    bar.style.height = `${Math.floor(Math.random() * 16) + 4}px`;
    voiceWaveform.appendChild(bar);
    bars.push(bar);
  }

  let isVoicePlaying = false;
  let voiceTimer = null;
  let voiceSec = 0;
  const maxVoiceSec = 15;

  const voiceQuotes = [
    "Odina, eshitayapsanmi...",
    "Bilmasdan xafa qilib qo'ygan bo'lsam, ming bor uzr so'rayman...",
    "Sening tabassuming men uchun butun dunyodan qimmat...",
    "Kechir meni jonim, kel yarashaylik... ❤️",
    "Seni juda qadrlayman va yaxshi ko'raman! 🥰"
  ];

  voicePlayBtn.addEventListener('click', () => {
    initAudio();
    isVoicePlaying = !isVoicePlaying;

    if (isVoicePlaying) {
      voicePlayBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
      voiceSec = 0;
      updateVoicePlay();
      voiceTimer = setInterval(updateVoicePlay, 1000);
      playTone(587.33, 'triangle', 0.6, 0.15); // soft chime
    } else {
      stopVoicePlay();
    }
  });

  function updateVoicePlay() {
    voiceSec++;
    const remaining = Math.max(0, maxVoiceSec - voiceSec);
    const mm = String(Math.floor(remaining / 60)).padStart(1, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    voiceDuration.textContent = `${mm}:${ss}`;

    // Update active waveform bars
    const progressIdx = Math.floor((voiceSec / maxVoiceSec) * totalBars);
    bars.forEach((b, idx) => {
      if (idx <= progressIdx) {
        b.classList.add('active');
        b.style.height = `${Math.floor(Math.random() * 18) + 6}px`;
      } else {
        b.classList.remove('active');
      }
    });

    // Subtitle typewriter sequence
    const quoteIdx = Math.min(voiceQuotes.length - 1, Math.floor((voiceSec / maxVoiceSec) * voiceQuotes.length));
    voiceSubtitle.textContent = voiceQuotes[quoteIdx];
    voiceSubtitle.style.color = '#ffd166';

    // Soft heart note
    playTone(440 + voiceSec * 25, 'sine', 0.4, 0.05);

    if (voiceSec >= maxVoiceSec) {
      stopVoicePlay();
      voiceDuration.textContent = "0:00";
      voiceSubtitle.textContent = "Odina, seni juda qadrlayman! ❤️";
    }
  }

  function stopVoicePlay() {
    clearInterval(voiceTimer);
    isVoicePlaying = false;
    voicePlayBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  }


  // ==========================================
  // 4. LOVE & FORGIVENESS SYNC TUNER
  // ==========================================
  const loveSlider = document.getElementById('loveSlider');
  const syncPercent = document.getElementById('syncPercent');
  const syncMoodLabel = document.getElementById('syncMoodLabel');

  loveSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    syncPercent.textContent = `${val}%`;

    if (val === 0) {
      syncMoodLabel.textContent = "Ozroq xafaman 🥺";
      syncMoodLabel.style.color = "#ff85a2";
    } else if (val < 40) {
      syncMoodLabel.textContent = "Yarashishga yaqinlashyapman... 🤔";
      syncMoodLabel.style.color = "#ffd166";
    } else if (val < 80) {
      syncMoodLabel.textContent = "Kechirdim, lekin shirinlik kutaman! 🍰";
      syncMoodLabel.style.color = "#ff6584";
    } else {
      syncMoodLabel.textContent = "To'liq Kechirdim & Cheksiz Sevgi! ❤️✨";
      syncMoodLabel.style.color = "#10b981";
    }

    if (val % 20 === 0) {
      playTone(300 + val * 5, 'sine', 0.15, 0.08);
      addTouchSpark(window.innerWidth / 2, window.innerHeight / 2, val > 70);
    }
  });


  // ==========================================
  // 5. HOLOGRAPHIC STORY CARDS
  // ==========================================
  const holoCards = document.querySelectorAll('.holo-card');

  holoCards.forEach((card) => {
    card.addEventListener('click', () => {
      initAudio();
      const isOpen = card.classList.contains('open');

      // Close all others
      holoCards.forEach(c => {
        c.classList.remove('open');
        const btn = c.querySelector('.card-action-btn');
        if (btn) btn.textContent = "Ochib o'qish 💌";
      });

      if (!isOpen) {
        card.classList.add('open');
        const btn = card.querySelector('.card-action-btn');
        if (btn) btn.textContent = "Yopish ✨";
        playTone(659.25, 'triangle', 0.4, 0.12);
        showToast("Sehrli xotira ochildi ✨");
      }
    });
  });


  // ==========================================
  // 6. 3 MYSTERY GIFT BOXES
  // ==========================================
  const giftBoxes = document.querySelectorAll('.gift-box');

  giftBoxes.forEach((box) => {
    box.addEventListener('click', () => {
      initAudio();
      if (!box.classList.contains('opened')) {
        box.classList.add('opened');
        playTone(880, 'sine', 0.6, 0.2);
        setTimeout(() => playTone(1046.50, 'sine', 0.8, 0.25), 150);
        showToast("Kutilmagan sovg'a ochildi! 🎉");
        addTouchSpark(window.innerWidth / 2, window.innerHeight / 2, true);
      }
    });
  });


  // ==========================================
  // 7. BIOMETRIC SCANNER (PRESS & HOLD)
  // ==========================================
  const scannerBtn = document.getElementById('scannerBtn');
  const scanProgressFill = document.getElementById('scanProgressFill');
  const scanStatusText = document.getElementById('scanStatusText');

  let scanHoldTimer = null;
  let scanProgress = 0;

  function startScan(e) {
    e.preventDefault();
    initAudio();
    scannerBtn.classList.add('scanning');
    scanStatusText.textContent = "Yarashish tasdiqlanmoqda... (Ushlab turing) 💖";
    scanProgress = 0;

    scanHoldTimer = setInterval(() => {
      scanProgress += 4;
      scanProgressFill.style.width = `${scanProgress}%`;
      playTone(350 + scanProgress * 6, 'sine', 0.08, 0.05);

      if (scanProgress >= 100) {
        clearInterval(scanHoldTimer);
        completeScan();
      }
    }, 60);
  }

  function stopScan() {
    if (scanProgress < 100) {
      clearInterval(scanHoldTimer);
      scannerBtn.classList.remove('scanning');
      scanProgress = 0;
      scanProgressFill.style.width = '0%';
      scanStatusText.textContent = "Barmog'ingizni bosing va ushlab turing ✨";
    }
  }

  function completeScan() {
    scannerBtn.classList.remove('scanning');
    scanStatusText.textContent = "TASDIQLANDI! 🎉";
    playTone(1046.5, 'triangle', 0.8, 0.3);
    setTimeout(triggerVictory, 300);
  }

  scannerBtn.addEventListener('mousedown', startScan);
  scannerBtn.addEventListener('touchstart', startScan, { passive: false });
  window.addEventListener('mouseup', stopScan);
  window.addEventListener('touchend', stopScan);


  // ==========================================
  // 8. DODGING "YO'Q" BUTTON & DIRECT FORGIVE
  // ==========================================
  const btnDecline = document.getElementById('btnDecline');
  const btnForgiveDirect = document.getElementById('btnForgiveDirect');
  const dodgeBubble = document.getElementById('dodgeBubble');

  const dodgeTexts = [
    "Qochib ketdim! 😂",
    "Iltimos kechiraqol 🥺",
    "Xafa bo'lma jonim ❤️",
    "Ushlay olmaysan 😜",
    "Faqat 'Ha' deysan baribir! 🥰"
  ];
  let dodgeCount = 0;

  function dodgeButton(e) {
    if (e) e.preventDefault();
    initAudio();
    dodgeCount++;
    playTone(320, 'sine', 0.2, 0.1);

    const maxX = window.innerWidth - btnDecline.offsetWidth - 40;
    const maxY = window.innerHeight - btnDecline.offsetHeight - 40;

    const randX = Math.max(20, Math.floor(Math.random() * maxX));
    const randY = Math.max(60, Math.floor(Math.random() * maxY));

    btnDecline.style.position = 'fixed';
    btnDecline.style.left = `${randX}px`;
    btnDecline.style.top = `${randY}px`;
    btnDecline.style.zIndex = '999';

    // Show funny speech bubble
    dodgeBubble.textContent = dodgeTexts[dodgeCount % dodgeTexts.length];
    dodgeBubble.style.left = `${randX}px`;
    dodgeBubble.style.top = `${Math.max(10, randY - 40)}px`;
    dodgeBubble.classList.add('show');

    setTimeout(() => dodgeBubble.classList.remove('show'), 1500);

    if (dodgeCount >= 5) {
      btnDecline.textContent = "Mayli, kechirdim! ❤️";
      btnDecline.style.background = "#ff2d75";
      btnDecline.style.color = "#fff";
      btnDecline.onclick = triggerVictory;
    }
  }

  btnDecline.addEventListener('mouseenter', dodgeButton);
  btnDecline.addEventListener('touchstart', dodgeButton, { passive: false });

  btnForgiveDirect.addEventListener('click', () => {
    initAudio();
    triggerVictory();
  });


  // ==========================================
  // 9. VICTORY MODAL & INSTAGRAM DM
  // ==========================================
  const victoryModal = document.getElementById('victoryModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnInstaDM = document.getElementById('btnInstaDM');

  function triggerVictory() {
    victoryModal.classList.add('active');
    playTone(523.25, 'sine', 0.4, 0.2);
    setTimeout(() => playTone(659.25, 'sine', 0.4, 0.2), 120);
    setTimeout(() => playTone(783.99, 'sine', 0.4, 0.2), 240);
    setTimeout(() => playTone(1046.50, 'sine', 1.2, 0.3), 360);

    // Blast hearts
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        addTouchSpark(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          true
        );
      }, i * 60);
    }
  }

  btnCloseModal.addEventListener('click', () => {
    victoryModal.classList.remove('active');
  });

  btnInstaDM.addEventListener('click', () => {
    const textToSend = "Doniyor, saytingni ko'rdim va juda ta'sirlandim... Men seni kechirdim ❤️🥰 Kel, yarashaylik!";
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToSend).catch(() => {});
    }

    showToast("Xabar nusxalandi! Instagram ochilmoqda... 💖");

    setTimeout(() => {
      window.open('https://www.instagram.com/direct/inbox/', '_blank');
    }, 1200);
  });


  // ==========================================
  // 10. TOAST NOTIFICATION UTILITY
  // ==========================================
  const toastNotify = document.getElementById('toastNotify');
  let toastTimer = null;

  function showToast(msg) {
    toastNotify.textContent = msg;
    toastNotify.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotify.classList.remove('show');
    }, 2800);
  }

});
