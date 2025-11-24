import type { ConversionResult } from '../algorithms/ConversionAFNDtoAFD';

export function generateAFDDot(
  result: ConversionResult,
  initialState: string,
  symbols: string
): string {
  let dot = 'digraph AFD {\n';
  dot += '  rankdir=LR;\n';
  dot += '  graph [pad="0.2", ranksep="0.8", nodesep="0.6"];\n';
  dot += '  node [shape=circle, style=filled, fillcolor="#1e293b", fontcolor=white, color="#475569", fontname="Arial", fontsize=13, width=0.7, height=0.7];\n';
  dot += '  edge [color="#64748b", fontcolor="#94a3b8", fontname="Arial", fontsize=10];\n';
  dot += '  bgcolor="transparent";\n';
  dot += '  overlap=false;\n';
  dot += '  splines=true;\n\n';

  // Nodo inicial invisible
  dot += '  start [shape=point, width=0.1, height=0.1];\n';
  dot += `  start -> "${initialState}" [color="#3b82f6", penwidth=2.5];\n\n`;

  // Estados de aceptación (doble círculo)
  result.afdFinalStates.forEach(s => {
    dot += `  "${s}" [shape=doublecircle, fillcolor="#10b981", color="#059669", penwidth=2];\n`;
  });

  // Estado inicial (color especial si no es de aceptación)
  if (!result.afdFinalStates.includes(initialState)) {
    dot += `  "${initialState}" [fillcolor="#3b82f6", color="#2563eb", penwidth=2];\n`;
  }

  dot += '\n';

  // Agrupar transiciones por edge
  const transitionMap = new Map<string, string[]>();

  result.conversionSteps.forEach(step => {
    symbols.split('').forEach(symbol => {
      const target = step.transitions[symbol];
      if (target && target !== '∅') {
        const key = `${step.currentState}→${target}`;
        if (!transitionMap.has(key)) {
          transitionMap.set(key, []);
        }
        transitionMap.get(key)!.push(symbol);
      }
    });
  });

  // Renderizar transiciones
  transitionMap.forEach((symbolsList, key) => {
    const [from, to] = key.split('→');
    const label = symbolsList.join(', ');

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