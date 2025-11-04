import React, { useRef } from 'react';
import * as THREE from 'three';

import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Bubbles } from './Bubbles';
import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

type CryptoSceneProps = {
  nodes: any[];
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  isInteracting: boolean;
  setIsInteracting: (val: boolean) => void;
  isCameraLocked: boolean;
  setIsCameraLocked: (val: boolean) => void;
};

const targetCamPos = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();

const CameraAnimator = ({ selectedNodeId, nodes, controlsRef, isInteracting, isCameraLocked }: any) => {
  const { viewport, size } = useThree();

  useFrame((state) => {
    if (isInteracting || !isCameraLocked || !controlsRef.current) return;
    const node = nodes.find((n: any) => n.id === selectedNodeId);

    const defaultZ = viewport.aspect < 1 ? 60 : 30;
    
    if (node) {
      const aspect = viewport.aspect;
      const isMobileScreen = size.width <= 768 || aspect < 1; 
      const screenMultiplier = isMobileScreen ? 1.0 : 1.0; 

      const baseFactor = 6; 
      const zoomOffset = Math.max(6, node.radius * baseFactor * screenMultiplier);

      targetCamPos.set(node.position.x, node.position.y, node.position.z + zoomOffset);
      targetLookAt.copy(node.position);
    } else {
      targetCamPos.set(0, 0, defaultZ); 
      targetLookAt.set(0, 0, 0);
    }
      state.camera.position.lerp(targetCamPos, 0.1);
      controlsRef.current.target.lerp(targetLookAt, 0.1);
      controlsRef.current.update();
  });
  return null; 
};

export const CryptoScene = ({
  nodes,
  selectedNodeId,
  setSelectedNodeId,
  isInteracting,
  setIsInteracting,
  isCameraLocked,
  setIsCameraLocked,
}: CryptoSceneProps) => { 
  
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null!);
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#030014' }}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 50 }} 
        onPointerMissed={() => {
          setSelectedNodeId(null);
          setIsCameraLocked(true); 
        }} 
      >

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <ambientLight intensity={0.8} />
        <pointLight position={[15, 15, 15]} intensity={2} color="#fff" />
        <pointLight position={[-15, -15, -15]} intensity={1} color="#e0f2f7" />

        <Bubbles
          nodes={nodes} 
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={(id) => {
            setSelectedNodeId(id);
            setIsCameraLocked(true); 
          }}
        />

        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan
          enableRotate={true}
          minDistance={10}
          maxDistance={150} 
          makeDefault 
          onStart={() => {
            setIsInteracting(true);
            setIsCameraLocked(false);
          }}
          onEnd={() => setIsInteracting(false)}
        />

        <CameraAnimator
          selectedNodeId={selectedNodeId}
          nodes={nodes}
          controlsRef={controlsRef}
          isInteracting={isInteracting}
          isCameraLocked={isCameraLocked}
        />

        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.2}
            height={1000}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};