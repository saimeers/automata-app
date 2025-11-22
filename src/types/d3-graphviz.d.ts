declare module 'd3-graphviz' {
  export interface GraphvizOptions {
    useWorker?: boolean;
    engine?: 'dot' | 'neato' | 'circo' | 'fdp' | 'osage' | 'twopi';
  }

  export interface Graphviz {
    renderDot(dotSrc: string): this;
    zoom(enabled: boolean): this;
    fit(enabled: boolean): this;
    width(width: number): this;
    height(height: number): this;
    scale(scale: number): this;
    engine(engine: string): this;
    onerror(callback: (error: any) => void): this;
  }

  export function graphviz(
    selector: string | HTMLElement,
    options?: GraphvizOptions
  ): Graphviz;
}

declare module '@viz-js/viz' {
  export interface VizOptions {
    format?: string;
    engine?: string;
  }

  export default class Viz {
    constructor();
    renderString(src: string, options?: VizOptions): Promise<string>;
  }
}