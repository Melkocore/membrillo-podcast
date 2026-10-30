import { readStoredAudio } from './ambientPreset';

const PATTERN = `setcps(0.42)
stack(
  note("<[g3,a#3,d4] [f3,a3,c4] [d#3,g3,a#3] [d3,f3,a3]>")
    .s("sine")
    .attack(1.5)
    .release(3)
    .gain(0.22)
    .room(0.85),
  note("<g5 a#5 f5 d5>")
    .s("triangle")
    .attack(0.8)
    .release(2.5)
    .gain(0.06)
    .delay(0.45)
    .room(0.9)
    .slow(2),
  note("<g2 d2 f2 d2>")
    .s("sine")
    .attack(2)
    .release(4)
    .gain(0.12)
    .room(0.6)
)`;

type StrudelWeb = typeof import('@strudel/web');

let modulePromise: Promise<StrudelWeb> | null = null;
let loaded: StrudelWeb | null = null;
let initialized = false;

async function loadStrudel(): Promise<StrudelWeb> {
  if (!modulePromise) {
    modulePromise = import('@strudel/web');
  }
  const strudel = await modulePromise;

  if (!initialized) {
    await strudel.initStrudel();
    initialized = true;
  }

  loaded = strudel;
  return strudel;
}

export async function startAmbient(): Promise<void> {
  const strudel = await loadStrudel();
  const stored = readStoredAudio();
  await strudel.evaluate(stored?.trim() ? stored : PATTERN);
}

export function stopAmbient(): void {
  loaded?.hush();
}
