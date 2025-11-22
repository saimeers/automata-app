import React from "react";
import { type EdgeProps } from "reactflow";

/**
 * SelfLoopEdge: dibuja un loop encima/del lado del nodo.
 * Usa la posición sourceX/sourceY para generar una curva en forma de loop.
 */
export default function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
  label,
  labelStyle,
}: EdgeProps) {
  // offset controla el tamaño del loop
  const offsetX = 0;
  const offsetY = -48; // se desplaza hacia arriba para no tapar el nodo
  const controlOffset = 56;

  // ruta cubic bezier para loop
  const path = `
    M ${sourceX} ${sourceY}
    C ${sourceX + controlOffset} ${sourceY + offsetY - controlOffset},
      ${targetX - controlOffset} ${targetY + offsetY - controlOffset},
      ${targetX} ${targetY}
  `;

  return (
    <>
      <path id={id} d={path} style={style} markerEnd={markerEnd} />
      {label && (
        <text>
          <textPath href={`#${id}`} startOffset="35%" style={{ ...labelStyle, userSelect: "none" }}>
            {label}
          </textPath>
        </text>
      )}
    </>
  );
}
