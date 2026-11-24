/* =====================================================
   app.js — Birthday Surprise Interactive Engine
   ===================================================== */

// ====== STATE ======
let currentStage = 1;
let giftOpened = false;
let musicPlaying = false;
let audioCtx = null;
let confettiAnimId = null;
let fireworksAnimId = null;
let sparkleCanvas, sparkleCtx;
let confettiCanvas, confettiCtx;
let fireworksCanvas, fireworksCtx;
let confettiParticles = [];
let fireworkParticles = [];
let mouseX = 0, mouseY = 0;
let sparkleParticles = [];
let stage4Triggered = false;

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  initFairyLights();
  initAmbientLayer();
  initSparkleCanvas();
  initConfettiCanvas();
  initMusicButton();
  updateProgressDots(1);
  initGiftBoxInteraction();
  initStage2Observer();
  initStage3Observer();
  initStage4();
  initMouseSparkle();
});

// ====== FAIRY LIGHTS ======
function initFairyLights() {
  const container = document.getElementById('fairyLights');
  if (!container) return;
  const colors = ['#f472b6','#c084fc','#fbbf24','#60a5fa','#34d399','#fb923c','#a78bfa'];
  for (let i = 0; i < 28; i++) {
    const light = document.createElement('div');
    light.className = 'fairy-light';
    const c = colors[i % colors.length];
    light.style.cssText = `
      background: ${c};
      color: ${c};
      animation-duration: ${0.8 + Math.random() * 1.5}s;
      animation-delay: ${Math.random() * 2}s;
    `;
    container.appendChild(light);
  }
}

// ====== AMBIENT LAYER — FLOATING ELEMENTS ======
function initAmbientLayer() {
  const layer = document.getElementById('ambientLayer');
  if (!layer) return;
  const emojis = ['🎈','🎀','✨','⭐','💫','🌸','💖','🎊','🎉','🌟','💜','🎁'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'ambient-balloon';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${8 + Math.random() * 12}s;
      animation-delay: ${Math.random() * 10}s;
      font-size: ${16 + Math.random() * 16}px;
    `;
    layer.appendChild(el);
  }
}

// ====== SPARKLE CANVAS (Mouse Trail) ======
function initSparkleCanvas() {
  sparkleCanvas = document.getElementById('sparkleCanvas');
  if (!sparkleCanvas) return;
  sparkleCtx = sparkleCanvas.getContext('2d');
  resizeSparkleCanvas();
  window.addEventListener('resize', resizeSparkleCanvas);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (Math.random() < 0.4) addSparkleParticle(mouseX, mouseY);
  });

  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    mouseX = t.clientX;
    mouseY = t.clientY;
    if (Math.random() < 0.3) addSparkleParticle(mouseX, mouseY);
  }, { passive: true });

  requestAnimationFrame(animateSparkles);
}

function resizeSparkleCanvas() {
  sparkleCanvas.width = window.innerWidth;
  sparkleCanvas.height = window.innerHeight;
}

function addSparkleParticle(x, y) {
  const colors = ['#fbbf24','#f472b6','#c084fc','#fde68a','#ffffff'];
  sparkleParticles.push({
    x, y,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3 - 1,
    life: 1,
    decay: 0.04 + Math.random() * 0.04,
    size: 2 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)]
  });
}

function animateSparkles() {
  sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
  sparkleParticles = sparkleParticles.filter(p => p.life > 0);
  sparkleParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= p.decay;
    sparkleCtx.beginPath();
    sparkleCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    sparkleCtx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2,'0');
    sparkleCtx.fill();
  });
  requestAnimationFrame(animateSparkles);
}

function initMouseSparkle() {
  document.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) addSparkleParticle(e.clientX, e.clientY);
  });
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    for (let i = 0; i < 6; i++) addSparkleParticle(t.clientX, t.clientY);
  }, { passive: true });
}

// ====== CONFETTI CANVAS ======
function initConfettiCanvas() {
  confettiCanvas = document.getElementById('confettiCanvas');
  confettiCtx = confettiCanvas.getContext('2d');
  resizeConfettiCanvas();
  window.addEventListener('resize', resizeConfettiCanvas);
}

function resizeConfettiCanvas() {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  if (fireworksCanvas) {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  }
}

function launchConfetti(duration = 5000) {
  confettiParticles = [];
  const colors = ['#f472b6','#c084fc','#fbbf24','#60a5fa','#34d399','#fb923c','#a78bfa','#fde68a','#f9a8d4'];
  const shapes = ['rect', 'circle', 'star'];

  for (let i = 0; i < 180; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      life: 1,
      wave: Math.random() * Math.PI * 2,
      waveSpeed: 0.05 + Math.random() * 0.05
    });
  }

  const startTime = Date.now();
  function loop() {
    if (Date.now() - startTime > duration) {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      return;
    }
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.wave) * 1.5;
      p.wave += p.waveSpeed;
      p.rotation += p.rotSpeed;
      if (p.y > confettiCanvas.height) p.y = -20;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.globalAlpha = 0.9;
      if (p.shape === 'circle') {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      } else if (p.shape === 'star') {
        drawStar(confettiCtx, 0, 0, 5, p.size / 2, p.size / 4);
      } else {
        confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      confettiCtx.restore();
    });
    confettiAnimId = requestAnimationFrame(loop);
  }
  loop();
}

function drawStar(ctx, cx, cy, spikes, outer, inner) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
    rot += step;
  }
  ctx.lineTo(cx, cy - outer);
  ctx.closePath();
  ctx.fill();
}

// ====== FIREWORKS ======
function initFireworks() {
  fireworksCanvas = document.getElementById('fireworksCanvas');
  if (!fireworksCanvas) return;
  fireworksCtx = fireworksCanvas.getContext('2d');
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
  launchFireworks();
}

function launchFireworks() {
  fireworkParticles = [];
  let launchInterval = setInterval(() => {
    launchSingleFirework();
  }, 600);

  setTimeout(() => {
    clearInterval(launchInterval);
    setInterval(() => { launchSingleFirework(); }, 2000);
  }, 6000);

  animateFireworks();
}

function launchSingleFirework() {
  const x = 0.1 * window.innerWidth + Math.random() * 0.8 * window.innerWidth;
  const y = 0.1 * window.innerHeight + Math.random() * 0.5 * window.innerHeight;
  const colors = ['#f472b6','#c084fc','#fbbf24','#60a5fa','#34d399','#fb923c','#fde68a','#ffffff'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const count = 60 + Math.floor(Math.random() * 40);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    fireworkParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.015 + Math.random() * 0.015,
      size: 2 + Math.random() * 3,
      color,
      trail: []
    });
  }
}

function animateFireworks() {
  if (!fireworksCtx) return;
  fireworksCtx.fillStyle = 'rgba(10, 0, 31, 0.2)';
  fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  fireworkParticles = fireworkParticles.filter(p => p.life > 0);
  fireworkParticles.forEach(p => {
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 5) p.trail.shift();

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.vx *= 0.99;
    p.life -= p.decay;

    // Trail
    p.trail.forEach((pt, i) => {
      const alpha = (i / p.trail.length) * p.life * 0.5;
      fireworksCtx.beginPath();
      fireworksCtx.arc(pt.x, pt.y, p.size * (i / p.trail.length), 0, Math.PI * 2);
      fireworksCtx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2,'0');
      fireworksCtx.fill();
    });

    fireworksCtx.beginPath();
    fireworksCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fireworksCtx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2,'0');
    fireworksCtx.fill();
  });

  fireworksAnimId = requestAnimationFrame(animateFireworks);
}

// ====== MUSIC SYSTEM ======
function initMusicButton() {
  const btn = document.getElementById('musicBtn');
  btn.addEventListener('click', toggleMusic);
}

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return null; }
  }
  return audioCtx;
}

// Generate a simple birthday melody using Web Audio API
let musicNodes = [];
let musicGainNode = null;
let musicTimeout = null;

function playBirthdayMelody() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  musicGainNode = ctx.createGain();
  musicGainNode.gain.setValueAtTime(0.08, ctx.currentTime);
  musicGainNode.connect(ctx.destination);

  // Happy Birthday notes (C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392, A4=440, B4=493.88, C5=523.25)
  const notes = [
    // Happy Birthday to You
    {f:261.63,d:0.4},{f:261.63,d:0.2},{f:293.66,d:0.6},{f:261.63,d:0.6},{f:349.23,d:0.6},{f:329.63,d:1.0},{r:0.2},
    {f:261.63,d:0.4},{f:261.63,d:0.2},{f:293.66,d:0.6},{f:261.63,d:0.6},{f:392,d:0.6},{f:349.23,d:1.0},{r:0.2},
    {f:261.63,d:0.4},{f:261.63,d:0.2},{f:523.25,d:0.6},{f:440,d:0.6},{f:349.23,d:0.6},{f:329.63,d:0.6},{f:293.66,d:1.0},{r:0.2},
    {f:466.16,d:0.4},{f:466.16,d:0.2},{f:440,d:0.6},{f:349.23,d:0.6},{f:392,d:0.6},{f:349.23,d:1.2},
  ];

  let time = ctx.currentTime + 0.1;
  musicNodes = [];

  function scheduleNotes() {
    notes.forEach(note => {
      if (note.r) { time += note.r; return; }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(musicGainNode);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(1, time + 0.03);
      gain.gain.linearRampToValueAtTime(0.7, time + note.d * 0.5);
      gain.gain.linearRampToValueAtTime(0, time + note.d - 0.05);
      osc.start(time);
      osc.stop(time + note.d);
      musicNodes.push(osc);
      time += note.d;
    });
    // Loop
    musicTimeout = setTimeout(() => {
      if (musicPlaying) {
        time = ctx.currentTime + 0.3;
        scheduleNotes();
      }
    }, (time - ctx.currentTime) * 1000 - 200);
  }

  scheduleNotes();
}

function stopMusic() {
  if (musicTimeout) clearTimeout(musicTimeout);
  musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
  musicNodes = [];
  if (musicGainNode) {
    musicGainNode.gain.linearRampToValueAtTime(0, getAudioContext().currentTime + 0.3);
  }
}

function toggleMusic() {
  musicPlaying = !musicPlaying;
  const btn = document.getElementById('musicBtn');
  const icon = btn.querySelector('.music-icon');
  const label = btn.querySelector('.music-label');

  if (musicPlaying) {
    icon.textContent = '🎵';
    label.textContent = 'Music';
    playBirthdayMelody();
  } else {
    icon.textContent = '🔇';
    label.textContent = 'Muted';
    stopMusic();
  }
}

// ====== PROGRESS DOTS ======
function updateProgressDots(stage) {
  document.querySelectorAll('.progress-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'completed');
    if (i + 1 < stage) dot.classList.add('completed');
    else if (i + 1 === stage) dot.classList.add('active');
  });
}

// ====== STAGE TRANSITIONS ======
function goToStage(next) {
  if (next === currentStage) return;

  // Start music on first interaction if not started
  if (!musicPlaying && next >= 2) {
    musicPlaying = true;
    const btn = document.getElementById('musicBtn');
    btn.querySelector('.music-icon').textContent = '🎵';
    btn.querySelector('.music-label').textContent = 'Music';
    playBirthdayMelody();
  }

  const overlay = document.getElementById('transitionOverlay');
  const currentEl = document.getElementById('stage' + currentStage);
  const nextEl = document.getElementById('stage' + next);

  // Flash overlay
  overlay.classList.add('active');

  // Launch quick confetti burst on key transitions
  if (next === 2 || next === 5) launchConfetti(next === 5 ? 8000 : 3000);

  setTimeout(() => {
    currentEl.classList.remove('active');
    currentEl.classList.add('exiting');

    nextEl.classList.add('active');
    nextEl.scrollTo(0, 0);

    setTimeout(() => {
      currentEl.classList.remove('exiting');
      overlay.classList.remove('active');
    }, 300);

    currentStage = next;
    updateProgressDots(next);
    triggerStageEntry(next);
  }, 400);
}

function triggerStageEntry(stage) {
  if (stage === 2) triggerStage2();
  if (stage === 3) triggerStage3();
  if (stage === 4) triggerStage4();
  if (stage === 5) triggerStage5();
}

// ====== STAGE 2 — BIRTHDAY REVEAL ======
function initStage2Observer() {}

function triggerStage2() {
  const teaser = document.getElementById('revealTeaser');
  const main = document.getElementById('revealMain');

  teaser.style.opacity = '0';
  main.classList.add('hidden');

  // Animate teaser in
  setTimeout(() => {
    teaser.style.transition = 'opacity 0.8s ease';
    teaser.style.opacity = '1';
  }, 300);

  // Then reveal main birthday message
  setTimeout(() => {
    teaser.style.opacity = '0';
    setTimeout(() => {
      main.classList.remove('hidden');
      main.style.opacity = '0';
      main.style.transition = 'opacity 0.8s ease';
      setTimeout(() => { main.style.opacity = '1'; }, 50);
    }, 500);
  }, 2800);

  // Extra confetti
  setTimeout(() => launchConfetti(3000), 3800);
}

// ====== STAGE 3 — MEMORY WALL ======
function initStage3Observer() {}

function triggerStage3() {
  const cards = document.querySelectorAll('.memory-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.classList.remove('card-visible');
    setTimeout(() => {
      card.classList.add('card-visible');
    }, 200 + i * 180);
  });
}

// ====== STAGE 4 — CUTE MOMENT ======
function initStage4() {}

function triggerStage4() {
  const teaser = document.getElementById('stage4Teaser');
  const reveal = document.getElementById('stage4Reveal');
  const msgs = document.querySelectorAll('.s4-msg');
  const shrugBubble = document.getElementById('shrugBubble');

  teaser.style.opacity = '0';
  reveal.classList.add('hidden');
  msgs.forEach(m => m.classList.remove('visible'));

  setTimeout(() => {
    teaser.style.transition = 'opacity 0.8s ease';
    teaser.style.opacity = '1';
  }, 300);

  setTimeout(() => {
    teaser.style.opacity = '0';
    setTimeout(() => {
      reveal.classList.remove('hidden');
      reveal.style.opacity = '0';
      reveal.style.transition = 'opacity 0.8s ease';
      setTimeout(() => { reveal.style.opacity = '1'; }, 50);

      // Stagger messages
      msgs.forEach((msg, i) => {
        setTimeout(() => {
          msg.classList.add('visible');
        }, 600 + i * 700);
      });

      // Shrug animation
      setTimeout(() => {
        if (shrugBubble) shrugBubble.classList.add('visible');
      }, 1800);
    }, 500);
  }, 2500);
}

// ====== STAGE 5 — GRAND CELEBRATION ======
function triggerStage5() {
  initFireworks();
  launchConfetti(10000);
  createBalloonReleaseLoop();

  // Ensure music plays
  if (!musicPlaying) {
    musicPlaying = true;
    const btn = document.getElementById('musicBtn');
    btn.querySelector('.music-icon').textContent = '🎵';
    btn.querySelector('.music-label').textContent = 'Music';
    playBirthdayMelody();
  }
}

function createBalloonReleaseLoop() {
  setInterval(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => addAmbientBalloon(), i * 300);
    }
  }, 2000);
}

function addAmbientBalloon() {
  const layer = document.getElementById('ambientLayer');
  if (!layer) return;
  const emojis = ['🎈','🎉','🎊','💜','🌟','✨','💖','🎀'];
  const el = document.createElement('div');
  el.className = 'ambient-balloon';
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  el.style.cssText = `
    left: ${Math.random() * 100}%;
    animation-duration: ${6 + Math.random() * 8}s;
    animation-delay: 0s;
    font-size: ${18 + Math.random() * 20}px;
  `;
  layer.appendChild(el);
  setTimeout(() => { el.remove(); }, 14000);
}

// ====== GIFT BOX INTERACTION ======
function initGiftBoxInteraction() {
  const giftBox = document.getElementById('giftBox');
  const giftBoxContainer = document.getElementById('giftBoxContainer');

  function openGift() {
    if (giftOpened) return;
    giftOpened = true;

    const lid = document.getElementById('giftLid');
    const boxGlow = document.getElementById('boxGlow');
    const popup = document.getElementById('bhaiyooPopup');
    const burstContainer = document.getElementById('burstContainer');
    const tapHint = document.getElementById('tapHint');
    const tapLabel = document.getElementById('tapLabel');
    const btn = document.getElementById('stage1Btn');

    // Step 1: Shake
    giftBox.classList.add('shaking');
    setTimeout(() => {
      giftBox.classList.remove('shaking');

      // Step 2: Ribbon loosens / lid opens
      giftBox.classList.add('opening');

      // Step 3: Glow
      setTimeout(() => {
        boxGlow.classList.add('active');

        // Step 4: Burst particles
        const bursts = ['🎉','🎊','💫','⭐','💜','🎈','✨','❤️','🌸','🎀'];
        const angles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
        angles.forEach((angle, i) => {
          const particle = document.createElement('div');
          particle.className = 'burst-particle';
          const rad = (angle * Math.PI) / 180;
          const dist = 120 + Math.random() * 80;
          particle.textContent = bursts[i % bursts.length];
          particle.style.setProperty('--bx', `${Math.cos(rad) * dist}px`);
          particle.style.setProperty('--by', `${Math.sin(rad) * dist}px`);
          particle.style.setProperty('--rot', `${Math.random() * 360}deg`);
          particle.style.animationDelay = `${Math.random() * 0.3}s`;
          burstContainer.appendChild(particle);
        });

        // Step 5: Bhaiyoo pops out
        setTimeout(() => {
          popup.classList.add('visible');
          tapHint.classList.add('hidden');
          tapLabel.classList.add('hidden');

          // Add shake to sparkles
          for (let i = 0; i < 20; i++) {
            setTimeout(() => {
              const angle = Math.random() * Math.PI * 2;
              const rect = giftBoxContainer.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              addSparkleParticle(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60);
            }, i * 80);
          }

          // Show CTA button
          setTimeout(() => {
            btn.classList.remove('hidden');
            btn.style.animation = 'fadeInUp 0.6s ease both, btnPulse 2.5s ease-in-out infinite';
          }, 800);
        }, 500);
      }, 600);
    }, 600);
  }

  giftBox.addEventListener('click', openGift);
  giftBox.addEventListener('touchend', (e) => { e.preventDefault(); openGift(); });
}

// ====== STAGE 2 OBSERVER (auto-trigger if stage 2 is visible) ======
function initStage2Observer() {
  // Trigger when stage 2 becomes active - handled by goToStage
}

// ====== REPLAY ======
function replayExperience() {
  // Stop fireworks
  if (fireworksAnimId) cancelAnimationFrame(fireworksAnimId);
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  if (fireworksCanvas && fireworksCtx) {
    fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  }
  if (confettiCanvas && confettiCtx) {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
  fireworkParticles = [];
  confettiParticles = [];

  // Stop music
  if (musicPlaying) {
    stopMusic();
    musicPlaying = false;
    const btn = document.getElementById('musicBtn');
    btn.querySelector('.music-icon').textContent = '🎵';
    btn.querySelector('.music-label').textContent = 'Music';
  }

  // Reset gift box
  giftOpened = false;
  const giftBox = document.getElementById('giftBox');
  giftBox.classList.remove('opening', 'opened', 'shaking');
  const lid = document.getElementById('giftLid');
  lid.style.transform = '';
  const boxGlow = document.getElementById('boxGlow');
  boxGlow.classList.remove('active');
  const popup = document.getElementById('bhaiyooPopup');
  popup.classList.remove('visible');
  const tapHint = document.getElementById('tapHint');
  const tapLabel = document.getElementById('tapLabel');
  tapHint.classList.remove('hidden');
  tapLabel.classList.remove('hidden');
  const btn = document.getElementById('stage1Btn');
  btn.classList.add('hidden');
  document.getElementById('burstContainer').innerHTML = '';

  // Reset stage 2
  const revealMain = document.getElementById('revealMain');
  revealMain.classList.add('hidden');
  const revealTeaser = document.getElementById('revealTeaser');
  revealTeaser.style.opacity = '0';

  // Reset stage 4
  const stage4Reveal = document.getElementById('stage4Reveal');
  stage4Reveal.classList.add('hidden');
  const shrugBubble = document.getElementById('shrugBubble');
  if (shrugBubble) shrugBubble.classList.remove('visible');
  document.querySelectorAll('.s4-msg').forEach(m => m.classList.remove('visible'));
  stage4Triggered = false;

  // Reset memory cards
  document.querySelectorAll('.memory-card').forEach(c => {
    c.classList.remove('card-visible');
    c.style.opacity = '0';
    c.style.transform = 'translateY(30px)';
  });

  // Go back to stage 1
  const overlay = document.getElementById('transitionOverlay');
  overlay.classList.add('active');
  setTimeout(() => {
    // Hide all stages
    document.querySelectorAll('.stage').forEach(s => {
      s.classList.remove('active', 'exiting');
    });
    // Show stage 1
    document.getElementById('stage1').classList.add('active');
    currentStage = 1;
    updateProgressDots(1);

    setTimeout(() => {
      overlay.classList.remove('active');
    }, 400);
  }, 400);
}

// ====== WINDOW RESIZE ======
window.addEventListener('resize', () => {
  resizeConfettiCanvas();
  if (sparkleCanvas) {
    sparkleCanvas.width = window.innerWidth;
    sparkleCanvas.height = window.innerHeight;
  }
});
