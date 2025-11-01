import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import { Bubble } from './Bubble';
import { useFrame } from '@react-three/fiber';

const force = new THREE.Vector3();
const vecA = new THREE.Vector3();
const vecB = new THREE.Vector3();

type BubblesProps = {
  nodes: any[]; 
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
};

export const Bubbles = ({ nodes, selectedNodeId, setSelectedNodeId }: BubblesProps) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useFrame((state, delta) => {
    const simulationSteps = 5;
    const substepDelta = delta / simulationSteps;

    for (let step = 0; step < simulationSteps; step++) {
      for (const nodeA of nodes) {
        force.copy(nodeA.position).multiplyScalar(-0.01); 
        nodeA.velocity.add(force.multiplyScalar(substepDelta));

        for (const nodeB of nodes) {
          if (nodeA === nodeB) continue;
          vecA.copy(nodeA.position);
          vecB.copy(nodeB.position);
          const distance = vecA.distanceTo(vecB);
          
          const minDistance = nodeA.radius + nodeB.radius + 8; 
          
          if (distance < minDistance && distance > 0) {
            force.subVectors(vecA, vecB).normalize().multiplyScalar(2 * (1 - distance / minDistance));
            nodeA.velocity.add(force.multiplyScalar(substepDelta));
          }
        }
      }
      for (const node of nodes) {
        node.velocity.multiplyScalar(0.98); 
        node.position.add(node.velocity.clone().multiplyScalar(substepDelta));
      }
    }

  });

  return (
    <group>
      {nodes.map((node) => (
        <Bubble
          key={node.id}
          node={node}
          selectedId={selectedNodeId}
          onSelect={setSelectedNodeId}
          onHover={setHoveredNodeId}
        />
      ))}
    </group>
  );
};