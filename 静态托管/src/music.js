// 配乐引擎：柔和五声音阶氛围音，模拟古琴/钢琴意境
// 有真实音频 url 时用 <audio>，否则用 Web Audio 合成

// 五声音阶旋律序列（C D E G A），不同风格用不同八度和节奏
const PRESETS = {
  warm: {
    // C4 D4 E4 G4 A4 C5 — 温暖中音区
    melody: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    pad: 130.81, // C3 铺底
    beat: 900,
    gain: 0.08,
    padGain: 0.04,
  },
  fun: {
    // 稍高一点，轻快但柔和
    melody: [329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
    pad: 164.81, // E3
    beat: 700,
    gain: 0.07,
    padGain: 0.03,
  },
  formal: {
    // 低沉庄重
    melody: [196.00, 220.00, 261.63, 293.66, 329.63, 392.00],
    pad: 98.00, // G2
    beat: 1100,
    gain: 0.09,
    padGain: 0.045,
  },
};

let ctx, master, timer, audioEl, padOsc, padGain;
let playing = false;

function ensure() {
  if (!ctx) {
    // @ts-ignore — Safari 旧版兼容
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
}

// 柔和的拨弦音：慢起慢落，长衰减
function softNote(freq, t, dur, peak) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  // 缓慢起音
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.12);
  // 长衰减，自然消退
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.1);
}

// 启动持续的低频 pad 铺底音
function startPad(freq, gain) {
  padOsc = ctx.createOscillator();
  padGain = ctx.createGain();
  padOsc.type = 'sine';
  padOsc.frequency.value = freq;
  padGain.gain.setValueAtTime(0, ctx.currentTime);
  padGain.gain.linearRampToValueAtTime(gain, ctx.currentTime + 2);
  padOsc.connect(padGain);
  padGain.connect(master);
  padOsc.start();
}

function stopPad() {
  if (padGain && padOsc) {
    try {
      padGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      padOsc.stop(ctx.currentTime + 1.2);
    } catch (e) {}
    padOsc = null;
    padGain = null;
  }
}

function startSynth(styleKey) {
  ensure();
  if (ctx.state === 'suspended') ctx.resume();
  const p = PRESETS[styleKey] || PRESETS.warm;
  let idx = 0;
  const melody = p.melody;

  startPad(p.pad, p.padGain);

  const tick = () => {
    const now = ctx.currentTime;
    const note = melody[idx % melody.length];
    // 主旋律音，长衰减
    softNote(note, now, (p.beat / 1000) * 2.5, p.gain);
    // 隔一个音加一个高八度泛音，非常轻
    if (idx % 3 === 0) {
      softNote(note * 2, now + 0.05, (p.beat / 1000) * 1.8, p.gain * 0.3);
    }
    idx++;
  };
  tick();
  timer = setInterval(tick, p.beat);
}

export function start(styleKey, url) {
  stop();
  if (url) {
    audioEl = new Audio(url);
    audioEl.loop = true;
    audioEl.play().catch(() => {});
  } else {
    startSynth(styleKey);
  }
  playing = true;
}

export function stop() {
  if (timer) { clearInterval(timer); timer = null; }
  stopPad();
  if (audioEl) { audioEl.pause(); audioEl = null; }
  playing = false;
}

export function toggle(styleKey, url) {
  if (playing) stop();
  else start(styleKey, url);
  return playing;
}

export function isPlaying() {
  return playing;
}
