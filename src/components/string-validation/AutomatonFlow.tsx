import { useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position
} from 'reactflow';
import type { Node, Edge } from 'reactflow'; // ← Cambio: import type
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import type { Automaton, ValidationResult } from '@/types/automaton';
import StateNode from './StateNode';

interface AutomatonFlowProps {
  automaton: Automaton | null;
  currentStep: number;
  validationResult: ValidationResult | null;
}

const nodeTypes = {
  stateNode: StateNode,
};

const AutomatonFlow = ({ automaton, currentStep, validationResult }: AutomatonFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Obtener el estado actual basado en el paso
  const getCurrentState = useCallback(() => {
    if (!validationResult || currentStep === 0) {
      return automaton?.states.find(s => s.isInitial)?.id || null;
    }
    if (currentStep <= validationResult.steps.length) {
      return validationResult.steps[currentStep - 1]?.nextState || null;
    }
    return null;
  }, [automaton, validationResult, currentStep]);

  const currentStateId = getCurrentState();

  // Convertir autómata a nodos y aristas de React Flow
  useEffect(() => {
    if (!automaton) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Crear nodos en disposición circular
    const centerX = 400;
    const centerY = 250;
    const radius = 200;

    const newNodes: Node[] = automaton.states.map((state, index) => {
      const angle = (2 * Math.PI * index) / automaton.states.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        id: state.id,
        type: 'stateNode',
        position: { x, y },
        data: {
          label: state.label,
          isInitial: state.isInitial,
          isFinal: state.isFinal,
          isActive: state.id === currentStateId
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    // Crear aristas
    const newEdges: Edge[] = automaton.transitions.map((transition) => {
      const isSelfLoop = transition.from === transition.to;
      
      return {
        id: transition.id,
        source: transition.from,
        target: transition.to,
        label: transition.symbol,
        type: isSelfLoop ? 'default' : 'smoothstep',
        animated: false,
        style: {
          stroke: '#3b82f6',
          strokeWidth: 2,
        },
        labelStyle: {
          fill: '#3b82f6',
          fontWeight: 600,
          fontSize: 14,
        },
        labelBgStyle: {
          fill: '#1e293b',
          fillOpacity: 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
          width: 20,
          height: 20,
        },
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [automaton, currentStateId, setNodes, setEdges]);

  // Actualizar estado activo cuando cambia el paso
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isActive: node.id === currentStateId
        }
      }))
    );
  }, [currentStateId, setNodes]);

  if (!automaton) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6"
      >
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-slate-400 font-medium">
              Genera un autómata para comenzar la visualización
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-bold text-white">Visualización del Autómata</h3>
        <p className="text-sm text-slate-400">
          {validationResult 
            ? `Ejecutando: Paso ${currentStep} de ${validationResult.steps.length}`
            : 'Ingresa una cadena para validar'
          }
        </p>
      </div>
      <div className="h-[500px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-slate-900/50"
        >
          <Background color="#334155" gap={16} />
          <Controls className="bg-slate-800 border-slate-600" />
          <MiniMap
            className="bg-slate-800 border border-slate-600"
            nodeColor={(node) => {
              if (node.data.isActive) return '#3b82f6';
              if (node.data.isFinal) return '#10b981';
              return '#64748b';
            }}
          />
        </ReactFlow>
      </div>
    </motion.div>
  );
};

export default AutomatonFlow;