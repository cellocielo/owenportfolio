import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import { RacketZone } from '../types';
import { playTennisPop } from '../utils/audio';

interface Racket3DProps {
  activeZone: RacketZone;
  onSelectZone: (zone: RacketZone) => void;
  hoveredZone: RacketZone | null;
  onHoverZone: (zone: RacketZone | null) => void;
  interactive?: boolean;
}

export const Racket3D: React.FC<Racket3DProps> = ({
  activeZone,
  onSelectZone,
  hoveredZone,
  onHoverZone,
  interactive = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const sweetSpotMeshRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const [internalHover, setInternalHover] = useState<RacketZone | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const effectiveHover = hoveredZone || internalHover;
  const isSweetSpotActive = activeZone === 'sweetSpot' || effectiveHover === 'sweetSpot';
  const isStringsActive = activeZone === 'strings' || effectiveHover === 'strings';
  const isDampenerActive = activeZone === 'dampener' || effectiveHover === 'dampener' || !interactive;
  const isFrameActive = activeZone === 'frame' || effectiveHover === 'frame';
  const isGripActive = activeZone === 'grip' || effectiveHover === 'grip';

  // Minimalist hover state: ONLY show label when hovered
  const isFrameHovered = effectiveHover === 'frame';
  const isStringsHovered = effectiveHover === 'strings';
  const isSweetSpotHovered = effectiveHover === 'sweetSpot';
  const isDampenerHovered = effectiveHover === 'dampener';
  const isGripHovered = effectiveHover === 'grip';

  // Clear any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Smooth hover tilt & idle floating with dynamic orientation
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Sweet spot pulse
    if (sweetSpotMeshRef.current) {
      const scaleFactor = 1 + Math.sin(time * 4.5) * (isSweetSpotActive ? 0.09 : 0.035);
      sweetSpotMeshRef.current.scale.set(scaleFactor, scaleFactor, 1);
    }

    if (auraRef.current) {
      auraRef.current.rotation.z += delta * 0.6;
    }

    // Interactive mouse parallax tilt (locked strictly to 0 when dampener is active to keep dampener dead centered)
    const targetRotY = isDampenerActive ? 0 : (state.pointer.x * 0.45);
    const targetRotX = isDampenerActive ? 0 : (-state.pointer.y * 0.35);

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * (isDampenerActive ? 8.0 : 3.5));
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * (isDampenerActive ? 8.0 : 3.5));
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * (isDampenerActive ? 8.0 : 3.5));
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.15, delta * 8.0);
  });

  const handlePointerEnter = (e: any, zone: RacketZone) => {
    e.stopPropagation();
    if (!interactive) return;
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    document.body.style.cursor = 'pointer';
    setInternalHover(zone);
    onHoverZone(zone);
  };

  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    // 60ms stabilization delay prevents rapid flicker when crossing borders
    hoverTimeoutRef.current = window.setTimeout(() => {
      document.body.style.cursor = 'auto';
      setInternalHover(null);
      onHoverZone(null);
      hoverTimeoutRef.current = null;
    }, 60);
  };

  const handleClick = (e: any, zone: RacketZone) => {
    e.stopPropagation();
    if (!interactive) return;
    playTennisPop(
      zone === 'sweetSpot'
        ? 660
        : zone === 'strings'
        ? 540
        : zone === 'dampener'
        ? 480
        : zone === 'frame'
        ? 440
        : 360
    );
    onSelectZone(zone);
  };

  // Generate RPM Blast Stringbed Lattice (16x19 pattern)
  const { mains, crosses } = useMemo(() => {
    const rx = 1.18;
    const ry = 1.58;
    const centerY = 1.65;
    const mainList: { x: number; y1: number; y2: number }[] = [];
    const crossList: { y: number; x1: number; x2: number }[] = [];

    // 16 Mains (Vertical)
    const mainSpacing = 0.145;
    for (let x = -0.95; x <= 0.95; x += mainSpacing) {
      const normX = x / rx;
      if (Math.abs(normX) < 0.97) {
        const spanY = Math.sqrt(1 - normX * normX) * ry;
        mainList.push({
          x,
          y1: centerY - spanY * 0.95,
          y2: centerY + spanY * 0.95,
        });
      }
    }

    // 19 Crosses (Horizontal)
    const crossSpacing = 0.155;
    for (let y = centerY - 1.42; y <= centerY + 1.42; y += crossSpacing) {
      const normY = (y - centerY) / ry;
      if (Math.abs(normY) < 0.97) {
        const spanX = Math.sqrt(1 - normY * normY) * rx;
        crossList.push({
          y,
          x1: -spanX * 0.95,
          x2: spanX * 0.95,
        });
      }
    }

    return { mains: mainList, crosses: crossList };
  }, []);

  // Heritage tournament colors (lived-in, warm, refined)
  const aeroYellow = '#C8A462'; // Warm tournament gold / clay ochre
  const onyxCarbon = '#1D1C19'; // Warm deep graphite
  const carbonGrey = '#2A2722'; // Warm stone grey

  return (
    <Float
      speed={isDampenerActive ? 0 : 1.6}
      rotationIntensity={isDampenerActive ? 0 : 0.12}
      floatIntensity={isDampenerActive ? 0 : 0.2}
    >
      <group ref={groupRef} position={[0, -0.15, 0]}>
        {/* ========================================================= */}
        {/* 1. THE BABOLAT PURE AERO FRAME (Aeromodular Beam, Throat, Bumper) */}
        {/* ========================================================= */}
        <group>
          {/* Upper Hoop Crown (Fluo Aero Yellow at 10-2 o'clock) */}
          <mesh position={[0, 1.65, 0]} scale={[0.88, 1.2, 1.0]}>
            <torusGeometry args={[1.38, 0.08, 20, 64, Math.PI]} />
            <meshStandardMaterial
              color={isFrameActive ? '#FFFFFF' : aeroYellow}
              metalness={0.65}
              roughness={isFrameActive ? 0.15 : 0.25}
              emissive={isFrameActive ? aeroYellow : '#445500'}
              emissiveIntensity={isFrameActive ? 2.0 : 0.4}
            />
          </mesh>

          {/* Lower Hoop / Flanks (Carbon Black at 4-8 o'clock) */}
          <mesh position={[0, 1.65, 0]} scale={[0.88, 1.2, 1.0]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[1.38, 0.08, 20, 64, Math.PI]} />
            <meshStandardMaterial
              color={isFrameActive ? aeroYellow : onyxCarbon}
              metalness={0.92}
              roughness={isFrameActive ? 0.2 : 0.3}
              emissive={isFrameActive ? aeroYellow : '#05070A'}
              emissiveIntensity={isFrameActive ? 1.8 : 0.1}
            />
          </mesh>

          {/* Babolat Aeromodular Shoulder Decals (Left & Right Fluo Yellow Accents at 3 & 9 o'clock) */}
          <mesh position={[-1.18, 1.65, 0]} scale={[0.08, 0.65, 0.085]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
            <meshStandardMaterial
              color={aeroYellow}
              emissive={aeroYellow}
              emissiveIntensity={isFrameActive ? 2.5 : 0.8}
            />
          </mesh>
          <mesh position={[1.18, 1.65, 0]} scale={[0.08, 0.65, 0.085]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
            <meshStandardMaterial
              color={aeroYellow}
              emissive={aeroYellow}
              emissiveIntensity={isFrameActive ? 2.5 : 0.8}
            />
          </mesh>

          {/* Aerodynamic Bumper Guard along Top Hoop */}
          <mesh position={[0, 2.98, 0]} scale={[0.82, 0.35, 1.05]} rotation={[0, 0, Math.PI * 0.15]}>
            <torusGeometry args={[1.22, 0.05, 12, 32, Math.PI * 0.7]} />
            <meshStandardMaterial
              color="#090B0E"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          {/* Inner Woofer Grommets Accent Layer */}
          <mesh position={[0, 1.65, 0]} scale={[0.84, 1.15, 0.95]}>
            <torusGeometry args={[1.32, 0.025, 16, 48]} />
            <meshStandardMaterial
              color={isFrameActive ? aeroYellow : '#2A2E3D'}
              metalness={0.7}
              roughness={0.4}
              emissive={isFrameActive ? aeroYellow : '#000000'}
              emissiveIntensity={isFrameActive ? 1.5 : 0}
            />
          </mesh>

          {/* Aeromodular Left Throat Arm (Wing-like Aerodynamic Taper) */}
          <mesh position={[-0.43, 0.1, 0]} rotation={[0, 0, 0.28]}>
            <cylinderGeometry args={[0.06, 0.085, 1.38, 16]} />
            <meshStandardMaterial
              color={isFrameActive ? aeroYellow : onyxCarbon}
              metalness={0.88}
              roughness={0.25}
              emissive={isFrameActive ? aeroYellow : '#07090F'}
              emissiveIntensity={isFrameActive ? 1.6 : 0.05}
            />
          </mesh>

          {/* Aeromodular Right Throat Arm */}
          <mesh position={[0.43, 0.1, 0]} rotation={[0, 0, -0.28]}>
            <cylinderGeometry args={[0.06, 0.085, 1.38, 16]} />
            <meshStandardMaterial
              color={isFrameActive ? aeroYellow : onyxCarbon}
              metalness={0.88}
              roughness={0.25}
              emissive={isFrameActive ? aeroYellow : '#07090F'}
              emissiveIntensity={isFrameActive ? 1.6 : 0.05}
            />
          </mesh>

          {/* Yellow Aero Accent Flares on Inside Throat */}
          <mesh position={[-0.34, 0.15, 0.02]} rotation={[0, 0, 0.28]} scale={[0.025, 0.85, 0.05]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={aeroYellow}
              emissive={aeroYellow}
              emissiveIntensity={isFrameActive ? 2.5 : 1.0}
            />
          </mesh>
          <mesh position={[0.34, 0.15, 0.02]} rotation={[0, 0, -0.28]} scale={[0.025, 0.85, 0.05]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={aeroYellow}
              emissive={aeroYellow}
              emissiveIntensity={isFrameActive ? 2.5 : 1.0}
            />
          </mesh>

          {/* Aerodynamic Throat Bridge (Inverted Arch connecting head to throat void) */}
          <mesh position={[0, 0.38, 0]} scale={[1.24, 0.46, 1]}>
            <torusGeometry args={[0.48, 0.065, 16, 32, Math.PI]} />
            <meshStandardMaterial
              color={isFrameActive ? aeroYellow : aeroYellow}
              metalness={0.65}
              roughness={0.3}
              emissive={isFrameActive ? '#FFFFFF' : aeroYellow}
              emissiveIntensity={isFrameActive ? 2.0 : 0.5}
            />
          </mesh>

          {/* Cortex Pure Feel / NF²-Tech Dampener Badge in Throat Bridge */}
          <mesh position={[0, 0.34, 0]}>
            <boxGeometry args={[0.26, 0.14, 0.09]} />
            <meshStandardMaterial
              color="#F0F3F8"
              metalness={0.3}
              roughness={0.4}
              emissive={isFrameActive ? aeroYellow : '#111520'}
              emissiveIntensity={isFrameActive ? 1.5 : 0.1}
            />
          </mesh>

          {/* Shaft Collar / Joint (Pure Aero Branding Zone) */}
          <mesh position={[0, -0.62, 0]}>
            <cylinderGeometry args={[0.155, 0.165, 0.36, 16]} />
            <meshStandardMaterial
              color={isFrameActive ? aeroYellow : onyxCarbon}
              metalness={0.9}
              roughness={0.25}
              emissive={isFrameActive ? aeroYellow : '#07090F'}
              emissiveIntensity={isFrameActive ? 1.4 : 0.05}
            />
          </mesh>

          {/* Yellow Chevron Stripe on Shaft */}
          <mesh position={[0, -0.58, 0.08]} scale={[0.16, 0.04, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={aeroYellow} emissive={aeroYellow} emissiveIntensity={1.8} />
          </mesh>
        </group>

        {/* ========================================================= */}
        {/* 2. THE STRINGS (Babolat RPM Blast + Double-Line Stencil) */}
        {/* ========================================================= */}
        <group>
          {/* RPM Blast Mains (Vertical Strings - Sleek Black Poly) */}
          {mains.map((m, idx) => (
            <mesh
              key={`main-${idx}`}
              position={[m.x, (m.y1 + m.y2) / 2, 0]}
              scale={[1, m.y2 - m.y1, 1]}
            >
              <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
              <meshStandardMaterial
                color={isStringsActive ? aeroYellow : '#262933'}
                emissive={isStringsActive ? aeroYellow : '#11131A'}
                emissiveIntensity={isStringsActive ? 1.5 : 0.08}
                roughness={0.2}
                metalness={0.6}
              />
            </mesh>
          ))}

          {/* RPM Blast Crosses (Horizontal Strings) */}
          {crosses.map((c, idx) => (
            <mesh
              key={`cross-${idx}`}
              position={[(c.x1 + c.x2) / 2, c.y, 0]}
              rotation={[0, 0, Math.PI / 2]}
              scale={[1, c.x2 - c.x1, 1]}
            >
              <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
              <meshStandardMaterial
                color={isStringsActive ? aeroYellow : '#262933'}
                emissive={isStringsActive ? aeroYellow : '#11131A'}
                emissiveIntensity={isStringsActive ? 1.5 : 0.08}
                roughness={0.2}
                metalness={0.6}
              />
            </mesh>
          ))}

          {/* ========================================================= */}
          {/* THE VIBRATION DAMPENER (Silicone Insert at base of strings) */}
          {/* ========================================================= */}
          <group position={[0, 0.52, 0]} scale={isDampenerActive ? 1.25 : 1}>
            {/* Outer Silicone O-Ring */}
            <mesh>
              <torusGeometry args={[0.095, 0.032, 16, 32]} />
              <meshStandardMaterial
                color={isDampenerActive ? aeroYellow : '#C8A462'}
                emissive={isDampenerActive ? aeroYellow : '#C8A462'}
                emissiveIntensity={isDampenerActive ? 2.5 : 0.9}
                roughness={0.3}
              />
            </mesh>
            {/* Center Core Silicone Disc with Groove Lock */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.045, 24]} />
              <meshStandardMaterial
                color={isDampenerActive ? '#FAFAFA' : '#1F1E1B'}
                emissive={isDampenerActive ? aeroYellow : '#3A362E'}
                emissiveIntensity={isDampenerActive ? 1.8 : 0.2}
                roughness={0.2}
              />
            </mesh>
            {/* Subtle glow light when dampener is active or hovered */}
            {isDampenerActive && (
              <pointLight
                color={aeroYellow}
                intensity={2.8}
                distance={1.6}
                decay={2}
                position={[0, 0, 0.1]}
              />
            )}
          </group>
        </group>

        {/* ========================================================= */}
        {/* 3. THE SWEET SPOT (Center Percussion & Kinetic Energy) */}
        {/* ========================================================= */}
        <group position={[0, 1.65, 0]}>
          {/* Pulsing Concentric Impact Rings */}
          <mesh ref={sweetSpotMeshRef}>
            <ringGeometry args={[0.34, 0.52, 36]} />
            <meshStandardMaterial
              color={aeroYellow}
              emissive={aeroYellow}
              emissiveIntensity={isSweetSpotActive ? 2.8 : 0.8}
              transparent
              opacity={isSweetSpotActive ? 0.9 : 0.35}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Outer Rotating Radar Ring */}
          <mesh ref={auraRef}>
            <ringGeometry args={[0.58, 0.62, 48]} />
            <meshStandardMaterial
              color={aeroYellow}
              emissive={aeroYellow}
              emissiveIntensity={isSweetSpotActive ? 2.2 : 0.4}
              transparent
              opacity={isSweetSpotActive ? 0.8 : 0.25}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Center Point Light emitting Fluo Aero Yellow radiance */}
          <pointLight
            color={aeroYellow}
            intensity={isSweetSpotActive ? 5.0 : 1.5}
            distance={4.5}
            decay={2}
            position={[0, 0, 0.25]}
          />
        </group>

        {/* ========================================================= */}
        {/* 4. THE GRIP (Babolat Syntec Pro, Perforated Wrap & Double-Stripe Butt Cap) */}
        {/* ========================================================= */}
        <group position={[0, -2.1, 0]}>
          {/* Octagonal Handle Body */}
          <mesh>
            <cylinderGeometry args={[0.18, 0.21, 2.4, 8]} />
            <meshStandardMaterial
              color={isGripActive ? aeroYellow : '#15171F'}
              metalness={0.4}
              roughness={isGripActive ? 0.25 : 0.65}
              emissive={isGripActive ? aeroYellow : '#0A0C11'}
              emissiveIntensity={isGripActive ? 1.5 : 0.05}
            />
          </mesh>

          {/* Babolat Perforated Spiral Grip Wrap Ribbons */}
          {[-0.95, -0.65, -0.35, -0.05, 0.25, 0.55, 0.85].map((yPos, idx) => (
            <mesh key={`wrap-${idx}`} position={[0, yPos, 0]} rotation={[0.12, 0, 0]}>
              <torusGeometry args={[0.192, 0.016, 12, 32]} />
              <meshStandardMaterial
                color={isGripActive ? aeroYellow : '#262A38'}
                emissive={isGripActive ? aeroYellow : '#000000'}
                emissiveIntensity={isGripActive ? 1.8 : 0}
                roughness={0.5}
              />
            </mesh>
          ))}

          {/* Babolat White Collar Tape with Yellow Accent Band at Top of Grip */}
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.186, 0.186, 0.18, 16]} />
            <meshStandardMaterial
              color="#F8FAFC"
              metalness={0.2}
              roughness={0.4}
              emissive={isGripActive ? aeroYellow : '#FFFFFF'}
              emissiveIntensity={isGripActive ? 1.2 : 0.1}
            />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <torusGeometry args={[0.192, 0.014, 12, 32]} />
            <meshStandardMaterial
              color={aeroYellow}
              emissive={aeroYellow}
              emissiveIntensity={2.0}
            />
          </mesh>

          {/* Babolat Flared Butt Cap at Bottom (Pure Aero Signature) */}
          <mesh position={[0, -1.25, 0]}>
            <cylinderGeometry args={[0.24, 0.22, 0.18, 8]} />
            <meshStandardMaterial
              color={isGripActive ? aeroYellow : onyxCarbon}
              metalness={0.8}
              roughness={0.35}
              emissive={isGripActive ? aeroYellow : '#05070B'}
              emissiveIntensity={isGripActive ? 1.6 : 0.05}
            />
          </mesh>

          {/* Babolat Double-Line Logo Stamped on Butt Cap Bottom Base */}
          <group position={[0, -1.345, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.14, 0.024, 0.005]} />
              <meshStandardMaterial color={aeroYellow} emissive={aeroYellow} emissiveIntensity={2.2} />
            </mesh>
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.14, 0.024, 0.005]} />
              <meshStandardMaterial color={aeroYellow} emissive={aeroYellow} emissiveIntensity={2.2} />
            </mesh>
          </group>
        </group>

        {/* ========================================================= */}
        {/* INTERACTIVE RAYCAST HITBOXES (Dedicated, Solid, Stable) */}
        {/* ========================================================= */}
        <group name="interactive-hitboxes">
          {/* Grip Hitbox (Full handle coverage) */}
          <mesh
            position={[0, -2.1, 0]}
            onClick={(e) => handleClick(e, 'grip')}
            onPointerEnter={(e) => handlePointerEnter(e, 'grip')}
            onPointerLeave={handlePointerLeave}
          >
            <cylinderGeometry args={[0.38, 0.38, 2.7, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Frame Hoop Hitbox (Toroidal rim around perimeter) */}
          <mesh
            position={[0, 1.65, 0]}
            scale={[0.88, 1.2, 1.2]}
            onClick={(e) => handleClick(e, 'frame')}
            onPointerEnter={(e) => handlePointerEnter(e, 'frame')}
            onPointerLeave={handlePointerLeave}
          >
            <torusGeometry args={[1.36, 0.22, 16, 48]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Frame Throat & Shaft Hitbox */}
          <mesh
            position={[0, 0.05, 0]}
            onClick={(e) => handleClick(e, 'frame')}
            onPointerEnter={(e) => handlePointerEnter(e, 'frame')}
            onPointerLeave={handlePointerLeave}
          >
            <boxGeometry args={[0.9, 1.3, 0.3]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Strings Hitbox (Cylinder disc spanning the inside stringbed) */}
          <mesh
            position={[0, 1.65, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.84, 1.18, 1]}
            onClick={(e) => handleClick(e, 'strings')}
            onPointerEnter={(e) => handlePointerEnter(e, 'strings')}
            onPointerLeave={handlePointerLeave}
          >
            <cylinderGeometry args={[1.18, 1.18, 0.12, 32]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Sweet Spot Hitbox (Depth-extended cylinder centered in head, always hit first within its radius) */}
          <mesh
            position={[0, 1.65, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            onClick={(e) => handleClick(e, 'sweetSpot')}
            onPointerEnter={(e) => handlePointerEnter(e, 'sweetSpot')}
            onPointerLeave={handlePointerLeave}
          >
            <cylinderGeometry args={[0.7, 0.7, 0.36, 32]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Dampener Hitbox (Depth-extended disc positioned at [0, 0.52, 0]) */}
          <mesh
            position={[0, 0.52, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            onClick={(e) => handleClick(e, 'dampener')}
            onPointerEnter={(e) => handlePointerEnter(e, 'dampener')}
            onPointerLeave={handlePointerLeave}
          >
            <cylinderGeometry args={[0.26, 0.26, 0.42, 24]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>

        {/* ========================================================= */}
        {/* MINIMALIST HOVER LABELS (pointerEvents="none" prevents event steal) */}
        {/* ========================================================= */}
        {isFrameHovered && (
          <Html
            position={[-1.2, 1.8, 0]}
            center
            distanceFactor={8}
            pointerEvents="none"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div className="px-3.5 py-1.5 rounded-full bg-[#1A1916]/95 border border-[#C8A462]/60 shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-none select-none">
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#C8A462] uppercase">
                THE FRAME
              </span>
            </div>
          </Html>
        )}

        {isStringsHovered && (
          <Html
            position={[1.2, 2.0, 0]}
            center
            distanceFactor={8}
            pointerEvents="none"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div className="px-3.5 py-1.5 rounded-full bg-[#1A1916]/95 border border-[#C8A462]/60 shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-none select-none">
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#C8A462] uppercase">
                THE STRINGS
              </span>
            </div>
          </Html>
        )}

        {isSweetSpotHovered && (
          <Html
            position={[0, 1.65, 0.4]}
            center
            distanceFactor={8}
            pointerEvents="none"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div className="px-3.5 py-1.5 rounded-full bg-[#1A1916]/95 border border-[#C8A462]/80 shadow-[0_4px_20px_rgba(200,164,98,0.3)] backdrop-blur-md pointer-events-none select-none">
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#C8A462] uppercase">
                THE SWEET SPOT
              </span>
            </div>
          </Html>
        )}

        {isDampenerHovered && (
          <Html
            position={[0.85, 0.52, 0]}
            center
            distanceFactor={8}
            pointerEvents="none"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div className="px-3.5 py-1.5 rounded-full bg-[#1A1916]/95 border border-[#C8A462]/80 shadow-[0_4px_20px_rgba(200,164,98,0.3)] backdrop-blur-md pointer-events-none select-none whitespace-nowrap">
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#C8A462] uppercase">
                THE DAMPENER
              </span>
            </div>
          </Html>
        )}

        {isGripHovered && (
          <Html
            position={[-1.1, -1.8, 0]}
            center
            distanceFactor={8}
            pointerEvents="none"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div className="px-3.5 py-1.5 rounded-full bg-[#1A1916]/95 border border-[#C8A462]/60 shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-none select-none">
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#C8A462] uppercase">
                THE GRIP
              </span>
            </div>
          </Html>
        )}


      </group>
    </Float>
  );
};
