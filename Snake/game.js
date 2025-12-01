// Snake Game — JS separado
(() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');
    const speedRange = document.getElementById('speedRange');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const wrapBtn = document.getElementById('wrapBtn');
    const btnSound = document.getElementById('btnSound');
    const btnGrid = document.getElementById('btnGrid');
  
    const CELL = 20;
    const COLS = Math.floor(canvas.width / CELL);
    const ROWS = Math.floor(canvas.height / CELL);
  
    let snake = [];
    let dir = {x:1, y:0};
    let nextDir = null;
    let food = null;
    let running = false;
    let paused = false;
    let speed = Number(speedRange.value);
    let intervalId = null;
    let score = 0;
    let best = Number(localStorage.getItem('snake_best') || 0);
    let useWrap = false;
    let showGrid = false;
    let soundOn = false;
  
    bestEl.textContent = best;
  
    function reset() {
      snake = [{x:Math.floor(COLS / 2), y:Math.floor(ROWS / 2)}];
      dir = {x:1, y:0};
      nextDir = null;
      placeFood();
      score = 0;
      scoreEl.textContent = `Score: ${score}`;
    }
  
    function placeFood() {
      while (true) {
        const pos = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS)
        };
        if (!snake.some(s => s.x === pos.x && s.y === pos.y)) {
          food = pos;
          break;
        }
      }
    }
  
    function step() {
      if (paused || !running) return;
  
      if (nextDir && !(nextDir.x === -dir.x && nextDir.y === -dir.y)) {
        dir = nextDir;
        nextDir = null;
      }
  
      const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  
      if (useWrap) {
        head.x = (head.x + COLS) % COLS;
        head.y = (head.y + ROWS) % ROWS;
      } else if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        return gameOver();
      }
  
      if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
  
      snake.unshift(head);
  
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = `Score: ${score}`;
        if (soundOn) beep();
        placeFood();
        if (score > best) {
          best = score;
          localStorage.setItem('snake_best', best);
          bestEl.textContent = best;
        }
      } else {
        snake.pop();
      }
  
      draw();
    }
  
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let x = 0; x <= COLS; x++) {
          ctx.beginPath();
          ctx.moveTo(x * CELL, 0);
          ctx.lineTo(x * CELL, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * CELL);
          ctx.lineTo(canvas.width, y * CELL);
          ctx.stroke();
        }
      }
  
      ctx.fillStyle = '#ff595e';
      drawRect(food.x, food.y, '#ff595e');
  
      snake.forEach((s, i) => {
        drawRect(s.x, s.y, i === 0 ? '#22c55e' : '#16a34a');
      });
    }
  
    function drawRect(x, y, color) {
      const gx = x * CELL;
      const gy = y * CELL;
      const grad = ctx.createLinearGradient(gx, gy, gx + CELL, gy + CELL);
      grad.addColorStop(0, color);
      grad.addColorStop(1, '#0a3d1a');
      ctx.fillStyle = grad;
      ctx.fillRect(gx + 2, gy + 2, CELL - 4, CELL - 4);
  }
  
    function gameOver() {
      running = false;
      clearInterval(intervalId);
      intervalId = null;
  
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over — Clique em Iniciar', canvas.width / 2, canvas.height / 2);
  
      if (soundOn) buzz();
    }
  
    function start() {
      if (intervalId) clearInterval(intervalId);
      running = true;
      paused = false;
      speed = Number(speedRange.value);
      intervalId = setInterval(step, 1000 / speed);
      draw();
    }
  
    function beep() {
      try {
        const ctxA = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctxA.createOscillator();
        const g = ctxA.createGain();
        o.connect(g);
        g.connect(ctxA.destination);
        o.type = 'sine';
        o.frequency.value = 880;
        g.gain.value = 0.02;
        o.start();
        setTimeout(() => { o.stop(); ctxA.close(); }, 80);
      } catch (e) {}
    }
  
    function buzz() {
      try {
        const ctxA = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctxA.createOscillator();
        const g = ctxA.createGain();
        o.connect(g);
        g.connect(ctxA.destination);
        o.type = 'sawtooth';
        o.frequency.value = 120;
        g.gain.value = 0.05;
        o.start();
        setTimeout(() => { o.stop(); ctxA.close(); }, 200);
      } catch (e) {}
    }
  
    startBtn.addEventListener('click', () => { reset(); start(); });
    pauseBtn.addEventListener('click', () => { paused = !paused; pauseBtn.textContent = paused ? 'Continuar' : 'Pausar'; });
    wrapBtn.addEventListener('click', () => { useWrap = !useWrap; wrapBtn.textContent = useWrap ? 'Wrap' : 'Parede'; });
  
    speedRange.addEventListener('input', () => {
      speed = Number(speedRange.value);
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = setInterval(step, 1000 / speed);
      }
    });
  
    btnGrid.addEventListener('click', () => { showGrid = !showGrid; draw(); });
    btnSound.addEventListener('click', () => { soundOn = !soundOn; btnSound.textContent = soundOn ? '🔈' : '🔊'; });
  
    window.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
  
      if (['arrowup','w'].includes(key)) nextDir = {x:0,y:-1};
      if (['arrowdown','s'].includes(key)) nextDir = {x:0,y:1};
      if (['arrowleft','a'].includes(key)) nextDir = {x:-1,y:0};
      if (['arrowright','d'].includes(key)) nextDir = {x:1,y:0};
    });
  
    document.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.getAttribute('data-dir');
        if (d === 'up') nextDir = {x:0,y:-1};
        if (d === 'down') nextDir = {x:0,y:1};
        if (d === 'left') nextDir = {x:-1,y:0};
        if (d === 'right') nextDir = {x:1,y:0};
      });
    });
  
    reset();
    draw();
  })();
  