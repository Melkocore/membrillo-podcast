declare module 'hydra-synth' {
  export interface HydraOptions {
    canvas?: HTMLCanvasElement;
    width?: number;
    height?: number;
    autoLoop?: boolean;
    makeGlobal?: boolean;
    detectAudio?: boolean;
    numSources?: number;
    numOutputs?: number;
    precision?: 'highp' | 'mediump' | 'lowp';
  }

  export default class Hydra {
    constructor(options?: HydraOptions);
    synth: Record<string, unknown>;
    tick(dt: number): void;
    hush(): void;
  }
}
