import type { DFA, State } from '../types/dfa.types';

export function generateDFADot(dfa: DFA): string {
  let dot = 'digraph DFA {\n';
  dot += '  rankdir=LR;\n';
  dot += '  size="12,8";\n';
  dot += '  ratio=fill;\n';
  dot += '  node [shape=circle, style=filled, fillcolor="#1e293b", fontcolor=white, color="#475569", fontname="Arial", fontsize=14];\n';
  dot += '  edge [color="#64748b", fontcolor="#94a3b8", fontname="Arial", fontsize=11];\n';
  dot += '  bgcolor="transparent";\n';
  dot += '  overlap=false;\n';
  dot += '  splines=true;\n\n';

  // Nodo inicial invisible
  dot += '  start [shape=none, label="", width=0, height=0];\n';
  dot += `  start -> "${dfa.start}" [color="#3b82f6", penwidth=2];\n\n`;

  // Estados de aceptación (doble círculo)
  dfa.accept.forEach(s => {
    dot += `  "${s}" [shape=doublecircle, fillcolor="#10b981", color="#059669", penwidth=2];\n`;
  });

  // Estado inicial (color especial si no es de aceptación)
  if (!dfa.accept.has(dfa.start)) {
    dot += `  "${dfa.start}" [fillcolor="#3b82f6", color="#2563eb", penwidth=2];\n`;
  }

  dot += '\n';

  // Transiciones
  const transitionMap = new Map<string, string[]>();

  for (const state of dfa.states) {
    for (const symbol of dfa.alphabet) {
      const target = dfa.transition[state]?.[symbol];
      if (target) {
        const key = `${state}→${target}`;
        if (!transitionMap.has(key)) {
          transitionMap.set(key, []);
        }
        transitionMap.get(key)!.push(symbol);
      }
    }
  }

  transitionMap.forEach((symbols, key) => {
    const [from, to] = key.split('→');
    const label = symbols.join(', ');

    if (from === to) {
      // Auto-bucle
      dot += `  "${from}" -> "${to}" [label="${label}", color="#8b5cf6", penwidth=1.5];\n`;
    } else {
      dot += `  "${from}" -> "${to}" [label="${label}", penwidth=1.5];\n`;
    }
  });

  dot += '}';
  return dot;
}

export function downloadDOT(dot: string, filename = 'automaton.dot'): void {
  const blob = new Blob([dot], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSVG(svgElement: SVGSVGElement, filename = 'automaton.svg'): void {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgElement);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}