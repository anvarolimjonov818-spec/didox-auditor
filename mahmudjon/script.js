/* ==========================================================================
   MAHMUDJON PRO // CYBER ENGINE & INTERACTIVE LOGIC
   3D Card Tilt, SFX Audio, Terminal Runner, Penalty Mini-Game, Share
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. CYBER BACKGROUND CANVAS
  // ==========================================
  const canvas = document.getElementById('cyberCanvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const cyberParticles = [];
  const emojis = ['⚽', '💻', '🪂', '🎮', '⚡', '🍗', '🍼', '🍭'];

  for (let i = 0; i < 25; i++) {
    cyberParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      char: emojis[Math.floor(Math.random() * emojis.length)],
      size: Math.random() * 12 + 14,
      speedY: Math.random() * 0.8 + 0.3,
      alpha: Math.random() * 0.4 + 0.2
    });
  }

  function renderCyberCanvas() {
    ctx.clearRect(0, 0, width, height);

    for (let p of cyberParticles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.font = `${p.size}px sans-serif`;
      ctx.fillText(p.char, p.x, p.y);
      ctx.restore();

      p.y += p.speedY;
      if (p.y > height + 30) {
        p.y = -30;
        p.x = Math.random() * width;
      }
    }

    requestAnimationFrame(renderCyberCanvas);
  }
  renderCyberCanvas();


  // ==========================================
  // 2. WEB AUDIO SFX SYNTHESIZER
  // ==========================================
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playCyberTone(freq, type = 'sine', duration = 0.2, gainVal = 0.15) {
    if (!isSoundEnabled) return;
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

  // Football Whistle SFX
  function playWhistle() {
    if (!isSoundEnabled) return;
    playCyberTone(2400, 'triangle', 0.15, 0.2);
    setTimeout(() => playCyberTone(2800, 'triangle', 0.25, 0.25), 100);
  }

  // Victory Goal Chime
  function playGoalChime() {
    if (!isSoundEnabled) return;
    playCyberTone(523.25, 'sine', 0.15, 0.2);
    setTimeout(() => playCyberTone(659.25, 'sine', 0.15, 0.2), 100);
    setTimeout(() => playCyberTone(783.99, 'sine', 0.15, 0.2), 200);
    setTimeout(() => playCyberTone(1046.50, 'sine', 0.4, 0.25), 300);
  }

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  soundToggleBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundToggleBtn.textContent = isSoundEnabled ? "🔊 SFX: ON" : "🔇 SFX: OFF";
    showToast(isSoundEnabled ? "Ovozlar yoqildi! 🔊" : "Ovozlar o'chirildi! 🔇");
  });


  // ==========================================
  // 3. 3D TILT EFFECT ON FUT CARD
  // ==========================================
  const futCard = document.getElementById('futCard');
  if (futCard) {
    futCard.addEventListener('mousemove', (e) => {
      const rect = futCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = (y / (rect.height / 2)) * -18;
      const rotY = (x / (rect.width / 2)) * 18;

      futCard.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    });

    futCard.addEventListener('mouseleave', () => {
      futCard.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
    });

    futCard.addEventListener('click', () => {
      playCyberTone(880, 'triangle', 0.3, 0.2);
      showToast("🏆 Mahmudjon: Doniyor do'sting senga omad tilaydi!");
    });
  }


  // ==========================================
  // 4. BIG BOY METER (QACHON KATTA BOLA BO'LASAN)
  // ==========================================
  const btnLevelUp = document.getElementById('btnLevelUp');
  const meterFill = document.getElementById('meterFill');
  const meterVal = document.getElementById('meterVal');

  let bigBoyPercent = 1;

  if (btnLevelUp) {
    btnLevelUp.addEventListener('click', () => {
      initAudio();
      playCyberTone(440 + bigBoyPercent * 5, 'sine', 0.2, 0.15);

      if (bigBoyPercent < 90) {
        bigBoyPercent += 20;
        meterFill.style.width = `${bigBoyPercent}%`;
        meterVal.textContent = `${bigBoyPercent}% (Dars qilishga oz qoldi...)`;
        showToast(`Katta bola bo'lish darajasi: ${bigBoyPercent}%!`);
      } else if (bigBoyPercent >= 90 && bigBoyPercent < 100) {
        bigBoyPercent = 99;
        meterFill.style.width = `99%`;
        meterVal.textContent = `99% (Deyarli katta bola!)`;
        showToast("Deyarli katta bola bo'ldi! Lekin...");
      } else {
        // Reset joke
        bigBoyPercent = 1;
        meterFill.style.width = `1%`;
        meterVal.textContent = `1% (Yana PUBGga kirib ketdi! 😂)`;
        playCyberTone(220, 'square', 0.4, 0.2);
        showToast("🚨 Xatolik: Mahmudjon yana PUBGga kirib ketdi! Qachon katta bola bo'lasan?! 😂");
      }
    });
  }


  // ==========================================
  // 5. CODE TERMINAL RUNNER & EXCUSES
  // ==========================================
  const btnRunCode = document.getElementById('btnRunCode');
  const btnMakeExcuse = document.getElementById('btnMakeExcuse');
  const outText = document.getElementById('outText');

  const excuses = [
    "Kechirasiz ustoz, PUBGda Pochinki qamalib qoldi, vazifani qilib ulgurmadim! 🪂",
    "Ustoz, mahallaning 3-sinflari bilan chempionat finali bor edi, penalti tepishim kerak edi! ⚽",
    "CSS yozayotgandim, to'satdan telefonimda PUBG 'Squad Invite' kelib qoldi... 🎮",
    "Ustoz, kompyuterim qizib ketdi, PUBG o'ynab sovitib oldim 😂",
    "Bugun 10-sinfda charchab keldim, keyingi oy aniq dars qilaman! 🥱",
    "Doniyor do'stim chaqirib qoldi, 'Sayt quryapmiz' deb aytmadi! 😂"
  ];
  let excuseIdx = 0;

  btnRunCode.addEventListener('click', () => {
    playCyberTone(440, 'square', 0.15, 0.1);
    outText.innerHTML = `<span style="color: #ff2a5f;">❌ CRITICAL ERROR (Najot Ta'lim):</span> Mahmudjon uy vazifasini topshirmadi! Oxirgi marta VS Code ochilganiga 23 kun bo'lgan! 😅`;
    showToast("⚠️ Vazifa topilmadi: Mahmudjon PUBGda!");
  });

  btnMakeExcuse.addEventListener('click', () => {
    playCyberTone(660, 'sine', 0.2, 0.15);
    const exc = excuses[excuseIdx % excuses.length];
    outText.innerHTML = `<span style="color: #ffd700;">🎲 Mahmudjonning bahonasi:</span> "${exc}"`;
    excuseIdx++;
    showToast("Mahmudjon yangi bahona o'ylab topdi! 😂");
  });


  // ==========================================
  // 6. PENALTY SHOOTOUT ON 8-YEAR-OLDS
  // ==========================================
  const btnShootBall = document.getElementById('btnShootBall');
  const soccerBall = document.getElementById('soccerBall');
  const playerScore = document.getElementById('playerScore');
  const gameCheer = document.getElementById('gameCheer');

  let score = 15;
  const cheers = [
    "GOOOL! 10-sinf Mahmudjon 8 yoshli bolakayni yana dog'da qoldirdi! ⚽🏆",
    "Mbappe, Holand va Mahmudjon — dunyoning eng xavfli hujumchilari! 😎",
    "Darvozabon yig'lab yubordi: 'Aka, 10-sinfsiz-ku, sekinroq teping!' 😭",
    "GOL! Mahmudjon o'zini Real Madridda o'ynayotgandek his qilyapti! 🌟",
    "Mahalla stadioni larzaga keldi: 'Mahmudjon — Yosh Bolalar Qiroli!' 👑"
  ];
  let cheerIdx = 0;

  btnShootBall.addEventListener('click', () => {
    playWhistle();
    soccerBall.classList.add('kicked');

    setTimeout(() => {
      playGoalChime();
      score++;
      playerScore.textContent = score;
      gameCheer.textContent = `"${cheers[cheerIdx % cheers.length]}"`;
      cheerIdx++;
      showToast(`⚽ GOOOL! Mahmudjon hisobni ${score}-0 qildi!`);
    }, 400);

    setTimeout(() => {
      soccerBall.classList.remove('kicked');
    }, 1000);
  });


  // ==========================================
  // 7. PUBG AIRDROP OPENER
  // ==========================================
  const btnOpenAirdrop = document.getElementById('btnOpenAirdrop');
  const airdropLoot = document.getElementById('airdropLoot');

  btnOpenAirdrop.addEventListener('click', () => {
    playGoalChime();
    airdropLoot.style.display = 'block';
    showToast("🍗 Winner Winner Chicken Dinner! Airdrop ochildi!");
  });


  // ==========================================
  // 8. TELEGRAM & INSTAGRAM SHARE
  // ==========================================
  const btnShareTG = document.getElementById('btnShareTG');
  const btnShareInsta = document.getElementById('btnShareInsta');

  const shareMessage = "Mahmudjon, Doniyor senga maxsus sayt yasabdi! 😂 10-sinf bo'lding-ku, qachon katta bola bo'lasan?! PUBG va yosh bolalar bilan futbolni yig'ishtirib, Najot Ta'limdagi darslaringni qil! 💻⚡ Sayting:";

  btnShareTG.addEventListener('click', () => {
    playCyberTone(784, 'sine', 0.2, 0.15);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareMessage)}`;
    window.open(tgUrl, '_blank');
    showToast("Telegramga yo'naltirilmoqda... ✈️");
  });

  btnShareInsta.addEventListener('click', () => {
    playCyberTone(784, 'sine', 0.2, 0.15);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`${shareMessage} ${window.location.href}`).catch(() => {});
    }
    showToast("Xabar nusxalandi! Instagram ochilmoqda... 📸");
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank');
    }, 1200);
  });


  // ==========================================
  // 9. TOAST HUD
  // ==========================================
  const cyberToast = document.getElementById('cyberToast');
  let toastTimer = null;

  function showToast(msg) {
    cyberToast.textContent = msg;
    cyberToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      cyberToast.classList.remove('show');
    }, 2800);
  }

});
