import type { PushdownAutomaton } from '../core/PushdownAutomaton';

export function generateDOT(pda: PushdownAutomaton): string {
  const states = pda.getStates();
  const transitions = pda.getTransitions();
  const initial = pda.getInitialState();
  const accept = pda.getAcceptStates();

  let dot = 'digraph PDA {\n';
  dot += '  rankdir=LR;\n';
  dot += '  size="12,8";\n'; // Tamaño más grande
  dot += '  ratio=fill;\n';
  dot += '  node [shape=circle, style=filled, fillcolor="#1e293b", fontcolor=white, color="#475569", fontname="Arial", fontsize=12];\n';
  dot += '  edge [color="#64748b", fontcolor="#94a3b8", fontname="Arial", fontsize=9];\n';
  dot += '  bgcolor="transparent";\n';
  dot += '  overlap=false;\n';
  dot += '  splines=true;\n\n';
  
  // Start node
  dot += '  start [shape=none, label="", width=0, height=0];\n';
  dot += `  start -> "${initial}" [color="#3b82f6", penwidth=2];\n\n`;
  
  // Accept states (double circle)
  accept.forEach(s => {
    dot += `  "${s}" [shape=doublecircle, fillcolor="#10b981", color="#059669", penwidth=2];\n`;
  });
  
  // Initial state (special color)
  if (!accept.includes(initial)) {
    dot += `  "${initial}" [fillcolor="#3b82f6", color="#2563eb", penwidth=2];\n`;
  }
  
  dot += '\n';

  // Group transitions by edge (from -> to)
  const edgeMap = new Map<string, string[]>();
  transitions.forEach(t => {
    const key = `${t.from}→${t.to}`;
    const label = `${t.read}, [${t.pop.join(',')}]→[${t.push.join(',')}]`;
    if (!edgeMap.has(key)) {
      edgeMap.set(key, []);
    }
    edgeMap.get(key)!.push(label);
  });

  // Generate edges - Show more transitions
  edgeMap.forEach((labels, key) => {
    const [from, to] = key.split('→');
    
    // Mostrar hasta 5 transiciones por arista
    const displayLabels = labels.slice(0, 5);
    const hasMore = labels.length > 5;
    
    const combinedLabel = displayLabels.join('\\n') + (hasMore ? `\\n... (+${labels.length - 5} más)` : '');
    
    // Self-loops get special treatment
    if (from === to) {
      dot += `  "${from}" -> "${to}" [label="${combinedLabel}", color="#8b5cf6", labelfontsize=8];\n`;
    } else {
      dot += `  "${from}" -> "${to}" [label="${combinedLabel}", labelfontsize=8];\n`;
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