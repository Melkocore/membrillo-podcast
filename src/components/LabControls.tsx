import { useState } from 'react';
import {
  resetAmbientPreset,
  saveAmbientPreset,
} from '../lib/ambientPreset';

interface StrudelEditorElement extends HTMLElement {
  editor?: {
    code?: string;
    evaluate?: () => Promise<unknown>;
    stop?: () => void;
  };
}

interface StrudelWindow extends Window {
  getAudioContext?: () => AudioContext;
}

type Status = { tone: 'idle' | 'ok' | 'error'; text: string };

function getEditor() {
  return document.querySelector<StrudelEditorElement>('strudel-editor')
    ?.editor;
}

export default function LabControls() {
  const [status, setStatus] = useState<Status>({ tone: 'idle', text: '' });

  const play = async () => {
    const editor = getEditor();
    if (!editor?.evaluate) {
      setStatus({
        tone: 'error',
        text: 'El REPL todavía está cargando. Probá de nuevo en un momento.',
      });
      return;
    }

    try {
      const audioWindow = window as StrudelWindow;
      const context = audioWindow.getAudioContext?.();
      if (context?.state === 'suspended') await context.resume();
      await editor.evaluate();
      setStatus({
        tone: 'ok',
        text: 'Reproduciendo el código del editor.',
      });
    } catch {
      setStatus({
        tone: 'error',
        text: 'No se pudo evaluar. Revisá el código y la consola del REPL.',
      });
    }
  };

  const stop = () => {
    const editor = getEditor();
    if (!editor?.stop) {
      setStatus({ tone: 'error', text: 'El REPL todavía está cargando.' });
      return;
    }
    editor.stop();
    setStatus({ tone: 'ok', text: 'Audio detenido.' });
  };

  const sync = () => {
    const code = getEditor()?.code;
    if (!code) {
      setStatus({ tone: 'error', text: 'No pude leer el código del editor.' });
      return;
    }

    const saved = saveAmbientPreset(code);
    if (!saved.audio) {
      setStatus({
        tone: 'error',
        text: 'No encontré un bloque de audio con contenido.',
      });
      return;
    }

    setStatus({
      tone: 'ok',
      text: saved.visual
        ? 'Guardado: Ambiente y Visual del sitio usarán tu versión.'
        : 'Guardado el audio. No encontré el bloque VISUAL, así que el fondo sigue siendo el original.',
    });
  };

  const reset = () => {
    resetAmbientPreset();
    setStatus({
      tone: 'ok',
      text: 'Preset original restablecido para Ambiente y Visual.',
    });
  };

  return (
    <div className="mt-6 max-w-2xl border border-ink-line bg-ink-soft/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={play}
          className="rounded-full bg-quince px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-90"
        >
          Reproducir
        </button>
        <button
          type="button"
          onClick={stop}
          className="rounded-full border border-ink-line px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-cream-dim transition-colors hover:border-quince hover:text-quince"
        >
          Detener
        </button>
        <button
          type="button"
          onClick={sync}
          className="rounded-full border border-guinda px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-cream transition-colors hover:bg-guinda"
        >
          Usar como ambiente
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-cream-dim/70 transition-colors hover:text-quince"
        >
          Restablecer
        </button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`mt-3 text-[11px] leading-relaxed ${
          status.tone === 'error'
            ? 'text-guinda'
            : status.tone === 'ok'
              ? 'text-quince'
              : 'text-cream-dim/70'
        }`}
      >
        {status.text ||
          'Reproducir usa el código actual. “Usar como ambiente” guarda el audio y el fondo para el sitio.'}
      </p>
    </div>
  );
}
