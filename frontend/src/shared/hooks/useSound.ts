import { useCallback } from 'react';

export type SoundName = 'alarm-end' | 'alarm-break' | 'complete' | 'tick';

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

function resumeCtx() {
  if (sharedCtx?.state === 'suspended') sharedCtx.resume();
}

function playBeep(ctx: AudioContext, freq: number, dur: number, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

function playAlarmEnd(ctx: AudioContext) {
  playBeep(ctx, 880, 0.14);
  setTimeout(() => playBeep(ctx, 660, 0.14), 180);
  setTimeout(() => playBeep(ctx, 440, 0.28), 360);
}

function playAlarmBreak(ctx: AudioContext) {
  playBeep(ctx, 440, 0.18, 'triangle');
  setTimeout(() => playBeep(ctx, 660, 0.28, 'triangle'), 230);
}

function playComplete(ctx: AudioContext) {
  playBeep(ctx, 523, 0.14);
  setTimeout(() => playBeep(ctx, 659, 0.14), 140);
  setTimeout(() => playBeep(ctx, 784, 0.36), 280);
}

function playTick(ctx: AudioContext) {
  const length = Math.floor(ctx.sampleRate * 0.012);
  const buf = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (length * 0.25));
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.value = 0.18;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

export function useSound() {
  const isSoundEnabled = useCallback(() => {
    return localStorage.getItem('sound_enabled') !== 'false';
  }, []);

  const play = useCallback((name: SoundName) => {
    if (!isSoundEnabled()) return;
    try {
      const ctx = getCtx();
      resumeCtx();
      switch (name) {
        case 'alarm-end':   playAlarmEnd(ctx); break;
        case 'alarm-break': playAlarmBreak(ctx); break;
        case 'complete':    playComplete(ctx); break;
        case 'tick':        playTick(ctx); break;
      }
    } catch { /* ignorar errores de autoplay */ }
  }, [isSoundEnabled]);

  return { play };
}
