export const AUDIO_MARKER = '// ===== AUDIO =====';
export const VISUAL_MARKER = '// ===== VISUAL =====';

const AUDIO_KEY = 'membrillo:ambient:audio';
const VISUAL_KEY = 'membrillo:ambient:visual';

const AUDIO_RE = /^\s*\/\/\s*=*\s*AUDIO\s*=*\s*$/im;
const VISUAL_RE = /^\s*\/\/\s*=*\s*VISUAL\s*=*\s*$/im;

export interface AmbientPresetResult {
  audio: boolean;
  visual: boolean;
}

export interface LabCode {
  audio: string;
  visual: string | null;
}

export function splitLabCode(code: string): LabCode {
  const audioMatch = AUDIO_RE.exec(code);
  const visualMatch = VISUAL_RE.exec(code);

  if (audioMatch && visualMatch) {
    const audioFirst = audioMatch.index < visualMatch.index;
    if (audioFirst) {
      return {
        audio: code
          .slice(audioMatch.index + audioMatch[0].length, visualMatch.index)
          .trim(),
        visual:
          code.slice(visualMatch.index + visualMatch[0].length).trim() || null,
      };
    }
    return {
      audio: code.slice(audioMatch.index + audioMatch[0].length).trim(),
      visual:
        code
          .slice(visualMatch.index + visualMatch[0].length, audioMatch.index)
          .trim() || null,
    };
  }

  const hydraIndex = code.search(/^\s*(?:await\s+)?initHydra\s*\(/m);
  if (hydraIndex > 0) {
    return {
      audio: code.slice(0, hydraIndex).trim(),
      visual: code.slice(hydraIndex).trim(),
    };
  }
  if (hydraIndex === 0) {
    return { audio: '', visual: code.trim() };
  }

  return { audio: code.trim(), visual: null };
}

export function readStoredAudio(): string | null {
  try {
    return localStorage.getItem(AUDIO_KEY);
  } catch {
    return null;
  }
}

export function readStoredVisual(): string | null {
  try {
    return localStorage.getItem(VISUAL_KEY);
  } catch {
    return null;
  }
}

export function saveAmbientPreset(code: string): AmbientPresetResult {
  const { audio, visual } = splitLabCode(code);
  const hasAudio = audio.replace(/^\s*\/\/.*$/gm, '').trim().length > 0;

  if (!hasAudio) return { audio: false, visual: false };

  try {
    localStorage.setItem(AUDIO_KEY, audio);
    if (visual) {
      localStorage.setItem(VISUAL_KEY, visual);
    } else {
      localStorage.removeItem(VISUAL_KEY);
    }
  } catch {
    return { audio: false, visual: false };
  }

  return { audio: true, visual: Boolean(visual) };
}

export function resetAmbientPreset(): void {
  try {
    localStorage.removeItem(AUDIO_KEY);
    localStorage.removeItem(VISUAL_KEY);
  } catch {
    return;
  }
}
