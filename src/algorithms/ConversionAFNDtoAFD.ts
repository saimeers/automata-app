// src/algorithms/ConversionAFNDtoAFD.ts

export type AFNDTable = Record<string, Record<string, string[]>>;

export interface AFNDConfig {
  table: AFNDTable;
  alphabet: string[];
  initialState: string;
  finalStates: string[];
}

export interface ConversionStep {
  currentState: string;
  transitions: Record<string, string>;
  isNew: boolean;
  isFinal: boolean;
}

export interface ConversionResult {
  afdTable: Record<string, Record<string, string>>;
  afdFinalStates: string[];
  conversionSteps: ConversionStep[];
  totalStates: number;
}

/* -------------------------------------------------------------
   Clase EjercicioAutomata (compatible con matriz)
--------------------------------------------------------------*/
export class EjercicioAutomata {
  estados: string[];
  terminales: string[];
  letras: string;
  inicial: string;
  AFD: string[][];

  constructor(estados?: string[], terminales?: string[], inicial?: string) {
    this.estados = estados || [];
    this.terminales = terminales || [];
    this.letras = "";
    this.inicial = inicial || "";
    this.AFD = [[]];
  }

  setLetras(letras: string): void {
    this.letras = letras;
  }

  createTransitionsMatrix(transitions: string[]): string[][] {
    const rows = transitions.length;
    const matrix = Array(rows)
      .fill(null)
      .map(() => Array(this.letras.length + 1).fill(""));

    for (let i = 0; i < rows; i++) {
      const [state, transStr] = transitions[i].split("-");
      matrix[i][0] = state;

      const parts = transStr.split(",");
      for (let j = 0; j < parts.length && j < this.letras.length; j++) {
        matrix[i][j + 1] = parts[j];
      }
    }
    return matrix;
  }

  transformar(AFND: string[][]): string[][] {
    const rows = AFND.length;
    const cols = AFND[0].length;

    this.AFD = Array(300)
      .fill(null)
      .map(() => Array(cols).fill(null));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.AFD[r][c] = AFND[r][c];
      }
    }

    const symbols = this.letras.split("");
    let extraRow = 0;

    for (let i = 0; i < this.AFD.length; i++) {
      const baseLabel = this.AFD[i][0];
      if (!baseLabel) break;

      for (let col = 1; col < cols; col++) {
        const cell = this.AFD[i][col];
        if (!cell) continue;

        if (cell.length > 1 && !this.existeCadena(this.AFD, cell)) {
          const estados = cell.split("");
          const newRow = rows + extraRow;
          this.AFD[newRow][0] = cell;

          for (let s = 0; s < symbols.length; s++) {
            const transiciones = estados.map((e) =>
              this.buscarEnMatriz(this.AFD, e, symbols[s], this.letras)
            );
            this.AFD[newRow][s + 1] =
              EjercicioAutomata.combinarLetrasSinDuplicados(transiciones);
          }

          extraRow++;
        }
      }
    }

    return this.AFD;
  }

  existeCadena(matriz: string[][], cadena: string): boolean {
    for (const fila of matriz) {
      if (!fila[0]) continue;
      if (fila[0].split("").sort().join("") === cadena.split("").sort().join("")) {
        return true;
      }
    }
    return false;
  }

  buscarEnMatriz(
    matriz: string[][],
    estado: string,
    simbolo: string,
    simbolos: string
  ): string {
    const row = matriz.find((f) => f[0] === estado);
    if (!row) return "";
    const col = simbolos.indexOf(simbolo) + 1;
    return row[col] || "";
  }

  static combinarLetrasSinDuplicados(values: string[]): string {
    return [...new Set(values.join("").split(""))].sort().join("");
  }

  buscarEstadosEnTerminales(matriz: string[][], terminales: string): string[] {
    const result: string[] = [];
    const regex = new RegExp(`[${terminales}]`);
    for (const fila of matriz) {
      if (fila?.[0] && regex.test(fila[0])) result.push(fila[0]);
    }
    return result;
  }
}

/* -------------------------------------------------------------
   Conversor AFND → AFD basado en tabla
--------------------------------------------------------------*/
export class AFNDtoAFDConverter {
  config: AFNDConfig;

  constructor(config: AFNDConfig) {
    this.config = config;
  }

  join(states: string[]): string {
    return states.length === 0 ? "∅" : [...states].sort().join("");
  }

  split(state: string): string[] {
    return state === "∅" ? [] : state.split("");
  }

  transition(from: string, symbol: string): string {
    const states = this.split(from);
    const result: string[] = [];

    for (const s of states) {
      const next = this.config.table[s]?.[symbol] ?? [];
      for (const t of next) {
        if (!result.includes(t)) result.push(t);
      }
    }
    return this.join(result);
  }

  isFinal(state: string): boolean {
    return this.split(state).some((s) => this.config.finalStates.includes(s));
  }

  convert(): ConversionResult {
    const steps: ConversionStep[] = [];
    const processed: string[] = [];
    const pending: string[] = [this.config.initialState];
    const finalStates: string[] = [];

    while (pending.length > 0) {
      const current = pending.shift();
      if (!current || processed.includes(current)) continue;

      processed.push(current);

      const step: ConversionStep = {
        currentState: current,
        transitions: {},
        isNew: steps.length > 0,
        isFinal: this.isFinal(current),
      };

      for (const sym of this.config.alphabet) {
        const next = this.transition(current, sym);
        step.transitions[sym] = next;

        if (next !== "∅" && !processed.includes(next)) pending.push(next);
      }

      if (step.isFinal) finalStates.push(step.currentState);

      steps.push(step);
    }

    const afdTable: Record<string, Record<string, string>> = {};
    for (const s of steps) afdTable[s.currentState] = s.transitions;

    return {
      afdTable,
      afdFinalStates: finalStates,
      conversionSteps: steps,
      totalStates: steps.length,
    };
  }

  getConfig(): AFNDConfig {
    return this.config;
  }
}

/* -------------------------------------------------------------
   Helpers
--------------------------------------------------------------*/
export function createConverterFromStrings(
  transitionsInput: string[],
  simbolos: string,
  inicial: string,
  terminales: string
): ConversionResult {
  const T = new EjercicioAutomata();
  T.setLetras(simbolos);

  // ✔️ USO REAL DEL ESTADO INICIAL
  T.inicial = inicial;

  const afnd = T.createTransitionsMatrix(transitionsInput);
  const afd = T.transformar(afnd);
  const filtrada = filtrar(afd);
  const finales = T.buscarEstadosEnTerminales(filtrada, terminales);
  const ordenada = ordenar(filtrada);

  const steps: ConversionStep[] = [];
  const table: Record<string, Record<string, string>> = {};

  for (const fila of ordenada) {
    const estado = fila[0];
    if (!estado) continue;

    const trans: Record<string, string> = {};

    for (let i = 0; i < simbolos.length; i++) {
      trans[simbolos[i]] = fila[i + 1] || "∅";
    }

    steps.push({
      currentState: estado,
      transitions: trans,
      isNew: steps.length > 0,
      isFinal: finales.includes(estado),
    });

    table[estado] = trans;
  }

  return {
    afdTable: table,
    afdFinalStates: finales,
    conversionSteps: steps,
    totalStates: steps.length,
  };
}

function filtrar(matriz: string[][]): string[][] {
  return matriz
    .map((row) => row.filter((v) => v && v !== ""))
    .filter((row) => row.length > 0);
}

function ordenar(matriz: string[][]): string[][] {
  return matriz.map((row) =>
    row.map((v) => (v ? v.split("").sort().join("") : v))
  );
}

export function createConverter(cfg: AFNDConfig): AFNDtoAFDConverter {
  return new AFNDtoAFDConverter(cfg);
}

export function convertAFNDtoAFD(cfg: AFNDConfig): ConversionResult {
  return new AFNDtoAFDConverter(cfg).convert();
}
