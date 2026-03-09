// Generates call sounds using the Web Audio API — no external files needed

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

// -- Ringtone for incoming calls (repeating two-tone pattern) --
let ringtoneInterval: ReturnType<typeof setInterval> | null = null;
let ringtoneTimeout: ReturnType<typeof setTimeout> | null = null;

function playRingtoneBeep() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Two rising tones
  [0, 0.15].forEach((offset, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = i === 0 ? 440 : 580;
    gain.gain.setValueAtTime(0.25, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.12);
  });
}

export function startRingtone() {
  stopRingtone();
  playRingtoneBeep();
  ringtoneInterval = setInterval(playRingtoneBeep, 2000);
  // Safety: auto-stop after 35s
  ringtoneTimeout = setTimeout(stopRingtone, 35000);
}

export function stopRingtone() {
  if (ringtoneInterval) { clearInterval(ringtoneInterval); ringtoneInterval = null; }
  if (ringtoneTimeout) { clearTimeout(ringtoneTimeout); ringtoneTimeout = null; }
}

// -- Outgoing call "dialing" tone (repeating single tone) --
let dialingInterval: ReturnType<typeof setInterval> | null = null;
let dialingTimeout: ReturnType<typeof setTimeout> | null = null;

function playDialBeep() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 425;
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.connect(gain).connect(ctx.destination);
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

// -- Short notification beep (missed call, call ended) --
export function playNotificationBeep() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 520;
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

// -- Connected chime (call accepted) --
export function playConnectedChime() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.1;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}

// -- End call tone (descending) --
export function playEndCallTone() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  [600, 450].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.12;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}
