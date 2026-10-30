import { useEffect, useRef, useState } from 'react';
import type { AmbientVisual } from '../lib/ambientVisual';
import { startAmbient, stopAmbient } from '../lib/ambientAudio';
import { startAmbientVisual } from '../lib/ambientVisual';
import { withBase } from '../lib/paths';

type AudioState = 'idle' | 'loading' | 'playing' | 'error';

export default function AmbientDock() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audio, setAudio] = useState<AudioState>('idle');
  const [visualOn, setVisualOn] = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);

  useEffect(() => {
    if (!visualOn) return;

    const canvas = canvasRef.current;
    if (!canvas) {
      setVisualOn(false);
      return;
    }

    let alive = true;
    let visual: AmbientVisual | null = null;
    setVisualLoading(true);

    startAmbientVisual(canvas)
      .then((instance) => {
        if (!alive) {
          instance.destroy();
          return;
        }
        visual = instance;
        setVisualLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setVisualLoading(false);
        setVisualOn(false);
      });

    return () => {
      alive = false;
      setVisualLoading(false);
      visual?.destroy();
    };
  }, [visualOn]);

  useEffect(() => {
    const stopOnExit = () => stopAmbient();

    window.addEventListener('pagehide', stopOnExit);
    return () => {
      window.removeEventListener('pagehide', stopOnExit);
      stopAmbient();
    };
  }, []);

  const toggleAudio = async () => {
    if (audio === 'playing') {
      stopAmbient();
      setAudio('idle');
      return;
    }

    if (audio === 'loading') return;

    setAudio('loading');
    try {
      await startAmbient();
      setAudio('playing');
    } catch {
      setAudio('error');
    }
  };

  const toggleVisual = () => {
    if (visualLoading) return;
    setVisualOn((current) => !current);
  };

  const audioLabel =
    audio === 'loading'
      ? 'Cargando'
      : audio === 'playing'
        ? 'Sonando'
        : audio === 'error'
          ? 'Reintentar'
          : 'Ambiente';

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ${
          visualOn && !visualLoading ? 'opacity-20' : 'opacity-0'
        }`}
      />

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1 rounded-full border border-ink-line bg-ink-soft/90 p-1 shadow-lg shadow-black/40 backdrop-blur">
          <button
            type="button"
            onClick={toggleAudio}
            aria-pressed={audio === 'playing'}
            title="Activar o desactivar el ambiente sonoro"
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors ${
              audio === 'playing'
                ? 'bg-quince text-ink'
                : 'text-cream-dim hover:text-quince'
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                audio === 'playing'
                  ? 'bg-ink'
                  : audio === 'error'
                    ? 'bg-guinda'
                    : 'bg-quince'
              }`}
            />
            {audioLabel}
          </button>

          <button
            type="button"
            onClick={toggleVisual}
            aria-pressed={visualOn}
            title="Activar o desactivar el fondo generativo"
            className={`rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors ${
              visualOn
                ? 'bg-guinda text-cream'
                : 'text-cream-dim hover:text-quince'
            }`}
          >
            {visualLoading ? 'Cargando' : 'Visual'}
          </button>

          <a
            href={withBase('/laboratorio')}
            title="Abrir el laboratorio de live coding"
            className="rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-cream-dim transition-colors hover:text-quince"
          >
            Lab
          </a>
        </div>

        <p className="sr-only" role="status">
          {audio === 'playing'
            ? 'Ambiente sonoro activado'
            : audio === 'error'
              ? 'No se pudo iniciar el audio'
              : 'Ambiente sonoro detenido'}
        </p>
      </div>
    </>
  );
}
