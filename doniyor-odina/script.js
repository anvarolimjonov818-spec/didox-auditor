/* ==========================================================================
   ODINA & DONIYOR — SWEET EMOTIONAL ENGINE
   Sakura Petals, Cute Mascot Interaction, 101 Roses, Audio & Instagram DM
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. FALLING SAKURA & ROSE PETALS CANVAS
  // ==========================================
  const canvas = document.getElementById('petalsCanvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initPetals();
  });

  let petals = [];
  const petalCount = 35;

  function initPetals() {
    petals = [];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 8 + 6,
        d: Math.random() * petalCount,
        dx: Math.random() * 1.5 - 0.7,
        dy: Math.random() * 1.2 + 0.8,
        angle: Math.random() * 360,
        tilt: Math.random() * 10 - 5,
        color: ['#ffb3c1', '#ffc2d1', '#ffe5ec', '#ff85a2', '#ffccd5'][Math.floor(Math.random() * 5)]
      });
    }
  }
  initPetals();

  function drawPetals() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      ctx.save();
      ctx.beginPath();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;

      // Draw soft petal shape
      ctx.ellipse(0, 0, p.r, p.r / 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      p.y += p.dy;
      p.x += Math.sin(p.d) * 1.2 + p.dx;
      p.angle += p.tilt * 0.2;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
    }

    requestAnimationFrame(drawPetals);
  }
  drawPetals();


  // ==========================================
  // 2. ROMANTIC AMBIENT AUDIO SYNTHESIZER
  // ==========================================
  let audioCtx = null;
  let isPlayingMusic = false;
  let musicTimer = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playNote(freq, duration = 0.6, type = 'sine', gainVal = 0.12) {
    initAudio();
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // Sweet lullaby / acoustic piano progression
  const chords = [
    [523.25, 659.25, 783.99], // C
    [440.00, 554.37, 659.25], // A
    [349.23, 440.00, 523.25], // F
    [392.00, 493.88, 587.33]  // G
  ];
  let chordIndex = 0;

  function playMelodyLoop() {
    if (!isPlayingMusic) return;
    const currentChord = chords[chordIndex % chords.length];
    currentChord.forEach((freq, idx) => {
      setTimeout(() => {
        if (isPlayingMusic) playNote(freq, 2.0, 'sine', 0.08);
      }, idx * 300);
    });
    chordIndex++;
  }

  const musicPill = document.getElementById('musicPill');
  const musicStatus = document.getElementById('musicStatus');

  function toggleMusic() {
    initAudio();
    isPlayingMusic = !isPlayingMusic;

    if (isPlayingMusic) {
      musicPill.classList.add('playing');
      musicStatus.textContent = "Kuy yangramoqda 🎵";
      playMelodyLoop();
      musicTimer = setInterval(playMelodyLoop, 2400);
      showToast("Romantik kuy yoqildi 🎶");
    } else {
      musicPill.classList.remove('playing');
      musicStatus.textContent = "Tinglash uchun bosing";
      clearInterval(musicTimer);
    }
  }

  musicPill.addEventListener('click', toggleMusic);


  // ==========================================
  // 3. CUTE MASCOT INTERACTION
  // ==========================================
  const mascotPatBtn = document.getElementById('mascotPatBtn');
  const mascotEmoji = document.getElementById('mascotEmoji');
  const mascotSpeech = document.getElementById('mascotSpeech');

  const mascotMoods = [
    { emoji: "🥰", text: "Rahmat Odina! Sening mehring dunyodagi eng katta mo'jiza! ❤️" },
    { emoji: "🥹💖", text: "Endi Doniyor har doim seni xursand qiladi, so'z beramiz!" },
    { emoji: "🌸✨", text: "Sen eng shirin, eng mehribon qizsan, Odinam!" },
    { emoji: "🥺👉👈", text: "Kechirganing uchun million marta rahmat! 🥰" }
  ];
  let moodIdx = 0;

  mascotPatBtn.addEventListener('click', () => {
    initAudio();
    playNote(659.25, 0.4, 'triangle', 0.15);
    setTimeout(() => playNote(880.00, 0.6, 'triangle', 0.2), 150);

    const m = mascotMoods[moodIdx % mascotMoods.length];
    mascotEmoji.textContent = m.emoji;
    mascotSpeech.textContent = `"${m.text}"`;
    moodIdx++;

    showToast("Mitti yurakcha xursand bo'ldi! 🥰");
  });


  // ==========================================
  // 4. 101 ATIRGUL GULDASTA YIG'ISH
  // ==========================================
  const btnAddRose = document.getElementById('btnAddRose');
  const roseCountNum = document.getElementById('roseCountNum');
  const roseFlowerDisplay = document.getElementById('roseFlowerDisplay');

  let roseCount = 0;
  const flowerEmojis = ["🌹", "🌸", "💐", "🌺", "🌷"];

  btnAddRose.addEventListener('click', () => {
    initAudio();
    roseCount += (roseCount < 90 ? 10 : 1);
    if (roseCount > 101) roseCount = 101;

    roseCountNum.textContent = roseCount;
    roseFlowerDisplay.textContent = flowerEmojis[roseCount % flowerEmojis.length];

    playNote(500 + roseCount * 5, 'sine', 0.2, 0.1);

    if (roseCount === 101) {
      btnAddRose.textContent = "🌹 101 ta Atirgul Odina Uchun Yig'ildi! 💖";
      btnAddRose.style.background = "#10b981";
      showToast("Tabriklaymiz! 101 ta atirgul Odina uchun taqdim etildi! 🌹");
    } else {
      showToast(`+10 ta atirgul qo'shildi! (${roseCount}/101)`);
    }
  });


  // ==========================================
  // 5. DODGING "YO'Q" BUTTON & FORGIVE ACTION
  // ==========================================
  const btnDecline = document.getElementById('btnDecline');
  const btnForgive = document.getElementById('btnForgive');
  const dodgeMsg = document.getElementById('dodgeMsg');

  const funnyDodges = [
    "Qochib ketdim! 😜",
    "Iltimos, arazlama 🥺",
    "Axir sevasan-ku 🥰",
    "Ushlay olmaysan 😂",
    "Baribir 'Ha' deysan! ❤️"
  ];
  let dodgeCount = 0;

  function dodgeDecline(e) {
    if (e) e.preventDefault();
    initAudio();
    dodgeCount++;
    playNote(300, 0.15, 'sine', 0.1);

    const maxX = window.innerWidth - btnDecline.offsetWidth - 40;
    const maxY = window.innerHeight - btnDecline.offsetHeight - 40;

    const randX = Math.max(20, Math.floor(Math.random() * maxX));
    const randY = Math.max(80, Math.floor(Math.random() * maxY));

    btnDecline.style.position = 'fixed';
    btnDecline.style.left = `${randX}px`;
    btnDecline.style.top = `${randY}px`;
    btnDecline.style.zIndex = '999';

    dodgeMsg.textContent = funnyDodges[dodgeCount % funnyDodges.length];
    dodgeMsg.style.left = `${randX}px`;
    dodgeMsg.style.top = `${Math.max(20, randY - 40)}px`;
    dodgeMsg.classList.add('active');

    setTimeout(() => dodgeMsg.classList.remove('active'), 1400);

    if (dodgeCount >= 5) {
      btnDecline.textContent = "Mayli, kechirdim! ❤️";
      btnDecline.style.background = "#ff4d6d";
      btnDecline.style.color = "#fff";
      btnDecline.onclick = celebrateForgiveness;
    }
  }

  btnDecline.addEventListener('mouseenter', dodgeDecline);
  btnDecline.addEventListener('touchstart', dodgeDecline, { passive: false });

  btnForgive.addEventListener('click', () => {
    celebrateForgiveness();
  });


  // ==========================================
  // 6. VICTORY MODAL & INSTAGRAM DM
  // ==========================================
  const modalOverlay = document.getElementById('modalOverlay');
  const btnClosePop = document.getElementById('btnClosePop');
  const btnSendInsta = document.getElementById('btnSendInsta');

  function celebrateForgiveness() {
    initAudio();
    modalOverlay.classList.add('active');

    // Play triumphant happy chime
    playNote(523.25, 0.4, 'sine', 0.2);
    setTimeout(() => playNote(659.25, 0.4, 'sine', 0.2), 120);
    setTimeout(() => playNote(783.99, 0.4, 'sine', 0.2), 240);
    setTimeout(() => playNote(1046.50, 1.2, 'sine', 0.3), 360);

    // Blast extra petals
    for (let i = 0; i < 30; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * (height / 2),
        r: Math.random() * 12 + 8,
        d: Math.random() * 10,
        dx: Math.random() * 3 - 1.5,
        dy: Math.random() * 2 + 1.5,
        angle: Math.random() * 360,
        tilt: Math.random() * 12 - 6,
        color: '#ff4d6d'
      });
    }
  }

  btnClosePop.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  btnSendInsta.addEventListener('click', () => {
    const message = "Doniyor, saytingni ko'rdim va juda ta'sirlandim... Men seni kechirdim ❤️🥰 Kel, yarashaylik!";
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).catch(() => {});
    }

    showToast("Xabar nusxalandi! Instagram ochilmoqda... 💌");

    setTimeout(() => {
      window.open('https://www.instagram.com/direct/inbox/', '_blank');
    }, 1200);
  });


  // ==========================================
  // 7. TOAST NOTIFICATION UTILITY
  // ==========================================
  const toastBox = document.getElementById('toastBox');
  let toastTimer = null;

  function showToast(msg) {
    toastBox.textContent = msg;
    toastBox.classList.add('active');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastBox.classList.remove('active');
    }, 2600);
  }

});
