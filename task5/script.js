'use strict';

const sectors = Array.from(document.querySelectorAll('.sector'));
const startBtn = document.getElementById('start');
const levelEl = document.getElementById('level');
const statusEl = document.getElementById('status');

const SECTOR_COUNT = sectors.length;

let audioCtx = null;

function ensureAudio() {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

const TONES = [329.63, 261.63, 220.0, 190.81];

function playTone(freq, duration = 0.35, type = 'sine') {
    const ctx = ensureAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
}

function playSectorSound(index) {
    playTone(TONES[index], 0.35, 'sine');
}

function playErrorSound() {
    playTone(110, 0.5, 'sawtooth');
}

const state = {
    sequence: [],
    playerIndex: 0,
    level: 0,
    phase: 'idle',
    timeouts: []
};

function clearHighlight() {
    sectors.forEach(s => s.classList.remove('active'));
}

function clearAllTimeouts() {
    state.timeouts.forEach(id => clearTimeout(id));
    state.timeouts = [];
    clearHighlight();
}

function safeTimeout(fn, delay) {
    const id = setTimeout(() => {
        state.timeouts = state.timeouts.filter(t => t !== id);
        fn();
    }, delay);
    state.timeouts.push(id);
    return id;
}

function randomStep() {
    return Math.floor(Math.random() * SECTOR_COUNT);
}

function isCorrectStep(shown, index) {
    return index === shown;
}

function flashSector(index, duration = 500) {
    const el = sectors[index];
    el.classList.add('active');
    playSectorSound(index);
    safeTimeout(() => el.classList.remove('active'), duration);
}

function setSectorsEnabled(enabled) {
    sectors.forEach(s => (s.disabled = !enabled));
}

function playSequence() {
    state.phase = 'showing';
    setSectorsEnabled(false);
    statusEl.textContent = 'Смотрите...';

    state.sequence.forEach((step, i) => {
        const startDelay = i * 800;
        safeTimeout(() => flashSector(step, 500), startDelay);
    });

    const totalTime = state.sequence.length * 800;
    safeTimeout(() => {
        state.phase = 'input';
        state.playerIndex = 0;
        setSectorsEnabled(true);
        statusEl.textContent = 'Ваш ход';
    }, totalTime);
}

function nextRound() {
    state.level += 1;
    levelEl.textContent = state.level;

    state.sequence.push(randomStep());
    playSequence();
}

function onSectorClick(e) {
    if (state.phase !== 'input') return;

    const index = Number(e.currentTarget.dataset.index);
    flashSector(index, 250);

    const shown = state.sequence[state.playerIndex];

    if (!isCorrectStep(shown, index)) {
        gameOver();
        return;
    }

    state.playerIndex += 1;

    if (state.playerIndex === state.sequence.length) {
        state.phase = 'waiting';
        setSectorsEnabled(false);
        safeTimeout(nextRound, 800);
    }
}

function gameOver() {
    clearAllTimeouts();
    state.phase = 'gameover';
    setSectorsEnabled(false);
    playErrorSound();
    statusEl.textContent = `Вы дошли до уровня ${state.level}`;
}

function startGame() {
    clearAllTimeouts();
    ensureAudio();

    state.sequence = [];
    state.playerIndex = 0;
    state.level = 0;
    state.phase = 'idle';

    levelEl.textContent = '0';
    setSectorsEnabled(false);
    statusEl.textContent = 'Приготовьтесь...';

    safeTimeout(nextRound, 600);
}

sectors.forEach(s => s.addEventListener('click', onSectorClick));
startBtn.addEventListener('click', startGame);

setSectorsEnabled(false);