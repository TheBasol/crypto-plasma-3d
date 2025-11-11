import * as THREE from 'three';
import { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';


type BubbleProps = {
  node: any;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
};

const targetScale = new THREE.Vector3();

export const Bubble = ({ node, selectedId, onSelect, onHover }: BubbleProps) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseColor = useMemo(() => new THREE.Color(node.color), [node.color]);
  const cloudTexture = useTexture('/textures/cloud.png');

  useMemo(() => {
    cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
  }, [cloudTexture]);

  const isSelected = selectedId === node.id;
  const isVisible = !selectedId || isSelected;
  const hovered = isMouseOver || isSelected; 


  useFrame((state, delta) => {
    cloudTexture.offset.x += delta * 0.005; 
    cloudTexture.offset.y -= delta * 0.0025;

    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const bobOffset = Math.sin(time * 0.8 + node.radius) * 0.4;
      meshRef.current.position.set(
        node.position.x,
        node.position.y + bobOffset,
        node.position.z
      );
      
      const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
      let targetEmissiveIntensity, targetRoughness, targetTransmission, targetOpacity;

      if (isVisible) {
        targetScale.set(hovered ? 1.2 : 1, hovered ? 1.2 : 1, hovered ? 1.2 : 1);
        targetEmissiveIntensity = hovered ? 0.8 : 0.6;
        targetRoughness = 0.1;
        targetTransmission = 0.7;
        targetOpacity = 1.0;
      } else {
        targetScale.set(0, 0, 0);
        targetEmissiveIntensity = 0.0;
        targetRoughness = 1.0;
        targetTransmission = 0.0;
        targetOpacity = 0.0;
      }

      const lerpFactor = 0.3;
      meshRef.current.scale.lerp(targetScale, lerpFactor);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissiveIntensity, lerpFactor);
      material.roughness = THREE.MathUtils.lerp(material.roughness, targetRoughness, lerpFactor);
      material.transmission = THREE.MathUtils.lerp(material.transmission, targetTransmission, lerpFactor);
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, lerpFactor);
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    try {
      if (e.target?.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }
    } catch {
      // Ignorar errores de pointer capture
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    try {
      if (e.target?.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignorar errores de pointer release
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    // Limpiar timeout anterior si existe
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsMouseOver(true);
    onHover(node.id);
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    // Agregar un pequeño delay antes de perder el hover
    // Esto permite que el mouse pase por el tooltip sin interrupciones
    hoverTimeoutRef.current = setTimeout(() => {
      setIsMouseOver(false);
      onHover(null);
      hoverTimeoutRef.current = null;
    }, 100); // 100ms de delay
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(isSelected ? null : node.id);
  };

  return (
    <mesh
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <sphereGeometry args={[node.radius, 32, 32]} />
      <meshPhysicalMaterial
        color={baseColor} transmission={0.7} transparent={true} roughness={0.1}         
        thickness={0.5} ior={1.2} emissive={baseColor} emissiveIntensity={0.6}
        metalness={0.0} envMapIntensity={1.0} alphaMap={cloudTexture} emissiveMap={cloudTexture}
      />
      <mesh>
        <sphereGeometry args={[node.radius * 0.4, 16, 16]} /> 
        <meshBasicMaterial color={baseColor} toneMapped={false} />
      </mesh>

      {/* Hitbox invisible para mejorar interacción en mobile */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <sphereGeometry args={[Math.max(node.radius * 0.5, 2.5), 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {isVisible && !hovered && node.radius > 0.5 && (
        <Html center zIndexRange={[100, 0]} style={{ pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none', position: 'relative' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{
              color: 'white', fontSize: `${Math.max(8, Math.min(18, node.radius * 5))}px`,
              background: 'rgba(0, 0, 0, 0.5)', padding: '2px 6px', borderRadius: '4px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            }}>
              {node.symbol.toUpperCase()}
            </div>
            <div style={{ 
              color: node.color.getStyle(), fontWeight: 'bold', fontSize: `${Math.max(7, Math.min(14, node.radius * 4))}px`,
              background: 'rgba(0, 0, 0, 0.5)', padding: '1px 5px', borderRadius: '4px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            }}>
              {node.displayChange > 0 ? '+' : ''}{node.displayChange.toFixed(1)}%
            </div>
          </div>
        </Html>
      )}

      {isVisible && hovered && (
        <Html distanceFactor={10} zIndexRange={[100, 0]} position={[0, node.radius + 0.5, 0]} style={{ zIndex: 5, position: 'relative' }}>
          {(() => {
            const TITLE_SCALE = 16; 
            const BODY_SCALE = 10; 
            const PADDING_BASE = 12;
            const MAX_TITLE_SIZE = 42;
            const MAX_BODY_SIZE = 30;
            const titleSize = Math.max(12, Math.min(MAX_TITLE_SIZE, Math.round(node.radius * TITLE_SCALE)));
            const bodySize = Math.max(11, Math.min(MAX_BODY_SIZE, Math.round(node.radius * BODY_SCALE)));
            const padding = Math.max(PADDING_BASE, Math.round(node.radius * 3));

            return (
              <div
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 18,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                  padding: `${padding}px`,
                  color: 'white',
                  lineHeight: 1.1,
                  pointerEvents: 'none',
                  width: 'min(90vw, 400px)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: `${titleSize}px`, marginBottom: 8 }}>
                  {node.id.toUpperCase()} ({node.symbol})
                </div>
                <div style={{ fontSize: `${bodySize}px`, marginBottom: 6 }}>
                  Price: $ {(node.marketCap * 10).toFixed(2)}
                </div>
                <div style={{ color: node.color.getStyle(), fontSize: `${bodySize}px`, marginBottom: 6 }}>
                  Change: {node.displayChange > 0 ? '+' : ''}{node.displayChange.toFixed(1)}%
                </div>
                <div style={{ fontSize: `${bodySize}px`, marginBottom: 6 }}>
                  Market Cap: ${node.marketCap} Billion
                </div>
                <div style={{ fontSize: `${bodySize}px`, marginBottom: 6 }}>
                  Volume (24h): ${node.volume24h} Million
                </div>

                {node.sizeMetric && (
                  <div style={{ fontSize: `${Math.max(12, Math.min(28, Math.round(node.radius * 5.5)))}px`, marginTop: 6 }}>
                    <strong>Size (by {String(node.sizeMetric)}):</strong>{' '}
                    {node.sizeMetric === 'performance' ? (
                      `${node.sizeRaw > 0 ? '+' : ''}${Number(node.sizeRaw).toFixed(1)}%`
                    ) : node.sizeMetric === 'volume24h' ? (
                      `$ ${Number(node.sizeRaw).toFixed(1)}M`
                    ) : (
                      `$ ${Number(node.sizeRaw).toFixed(1)}B`
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </Html>
      )}
    </mesh>
  );
};