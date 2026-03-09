// Generates call sounds using the Web Audio API — no external files needed

const STORAGE_KEY = "call-sound-settings";

interface CallSoundSettings {
  enabled: boolean;
  volume: number; // 0–100
}

function getSettings(): CallSoundSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabled: true, volume: 70 };
}

export function saveSettings(settings: CallSoundSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getCallSoundSettings(): CallSoundSettings {
  return getSettings();
}

function vol(): number {
  const s = getSettings();
  if (!s.enabled) return 0;
  return s.volume / 100;
}

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

// Master gain node
let masterGain: GainNode | null = null;

function getMasterGain() {
  const ctx = getAudioContext();
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
  }
  masterGain.gain.value = vol();
  return masterGain;
}

// -- Ringtone for incoming calls --
let ringtoneInterval: ReturnType<typeof setInterval> | null = null;
let ringtoneTimeout: ReturnType<typeof setTimeout> | null = null;

function playRingtoneBeep() {
  if (vol() === 0) return;
  const ctx = getAudioContext();
  const dest = getMasterGain();
  const now = ctx.currentTime;

  [0, 0.15].forEach((offset, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = i === 0 ? 440 : 580;
    gain.gain.setValueAtTime(0.35, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
    osc.connect(gain).connect(dest);
    osc.start(now + offset);
    osc.stop(now + offset + 0.12);
  });
}

export function startRingtone() {
  stopRingtone();
  playRingtoneBeep();
  ringtoneInterval = setInterval(playRingtoneBeep, 2000);
  ringtoneTimeout = setTimeout(stopRingtone, 35000);
}

export function stopRingtone() {
  if (ringtoneInterval) { clearInterval(ringtoneInterval); ringtoneInterval = null; }
  if (ringtoneTimeout) { clearTimeout(ringtoneTimeout); ringtoneTimeout = null; }
}

// -- Outgoing call "dialing" tone --
let dialingInterval: ReturnType<typeof setInterval> | null = null;
let dialingTimeout: ReturnType<typeof setTimeout> | null = null;

function playDialBeep() {
  if (vol() === 0) return;
  const ctx = getAudioContext();
  const dest = getMasterGain();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 425;
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.connect(gain).connect(dest);
  osc.start(now);
  osc.stop(now + 0.8);
}

export function startDialing() {
  stopDialing();
  playDialBeep();
  dialingInterval = setInterval(playDialBeep, 3000);
  dialingTimeout = setTimeout(stopDialing, 35000);
}

export function stopDialing() {
  if (dialingInterval) { clearInterval(dialingInterval); dialingInterval = null; }
  if (dialingTimeout) { clearTimeout(dialingTimeout); dialingTimeout = null; }
}

// -- Short notification beep --
export function playNotificationBeep() {
  if (vol() === 0) return;
  const ctx = getAudioContext();
  const dest = getMasterGain();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 520;
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(gain).connect(dest);
  osc.start(now);
  osc.stop(now + 0.3);
}

// -- Connected chime --
export function playConnectedChime() {
  if (vol() === 0) return;
  const ctx = getAudioContext();
  const dest = getMasterGain();
  const now = ctx.currentTime;

  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.1;
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}

// -- End call tone --
export function playEndCallTone() {
  if (vol() === 0) return;
  const ctx = getAudioContext();
  const dest = getMasterGain();
  const now = ctx.currentTime;

  [600, 450].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.12;
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}

// -- Test sound for settings preview --
export function playTestSound() {
  playConnectedChime();
}
