import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sparkles, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Racket3D } from './Racket3D';
import { RacketZone } from '../types';

interface RacketCanvasProps {
  activeZone: RacketZone;
  onSelectZone: (zone: RacketZone) => void;
  hoveredZone: RacketZone | null;
  onHoverZone: (zone: RacketZone | null) => void;
  enableOrbit?: boolean;
  isMacroZoom?: boolean;
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function getSphericalCoords(camPos: THREE.Vector3, target: THREE.Vector3) {
  const dx = camPos.x - target.x;
  const dy = camPos.y - target.y;
  const dz = camPos.z - target.z;
  const radius = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const safeRadius = Math.max(radius, 0.0001);
  const phi = Math.acos(Math.max(-1, Math.min(1, dy / safeRadius)));
  const theta = Math.atan2(dx, dz);
  return { radius, phi, theta };
}

const ZONE_CAMERA_TARGETS: Record<RacketZone, { target: [number, number, number]; radius: number }> = {
  dampener: { target: [0, 0.37, 0], radius: 2.1 },
  sweetSpot: { target: [0, 1.65, 0], radius: 2.5 },
  strings: { target: [0, 1.65, 0], radius: 2.9 },
  frame: { target: [0, 1.55, 0], radius: 3.3 },
  grip: { target: [0, -2.1, 0], radius: 2.5 },
};

function MacroCameraController({
  isMacroZoom,
  activeZone,
  controlsRef,
  resetTrigger,
  onTransitionStateChange,
}: {
  isMacroZoom: boolean;
  activeZone?: RacketZone | null;
  controlsRef: React.RefObject<any>;
  resetTrigger?: number;
  onTransitionStateChange?: (isTransitioning: boolean) => void;
}) {
  const { camera } = useThree();

  // Neutral full-racket view: position [0, 0.1, 7.2], target [0, 0, 0]
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));
  const defaultRadius = useRef(Math.sqrt(0.1 * 0.1 + 7.2 * 7.2));
  const defaultPhi = useRef(Math.acos(0.1 / Math.sqrt(0.1 * 0.1 + 7.2 * 7.2)));
  const defaultTheta = 0;

  const getZoneConfig = (zone?: RacketZone | null) => {
    return (zone && ZONE_CAMERA_TARGETS[zone]) || ZONE_CAMERA_TARGETS.dampener;
  };

  const animRef = useRef<{
    active: boolean;
    mode: 'zooming_in' | 'zooming_out';
    startRadius: number;
    startPhi: number;
    startTheta: number;
    startTarget: THREE.Vector3;
    destRadius: number;
    destPhi: number;
    destTheta: number;
    destTarget: THREE.Vector3;
    duration: number;
    elapsed: number;
  }>({
    active: false,
    mode: 'zooming_in',
    startRadius: 7.2,
    startPhi: Math.PI / 2,
    startTheta: 0,
    startTarget: new THREE.Vector3(0, 0, 0),
    destRadius: 2.1,
    destPhi: Math.PI / 2,
    destTheta: 0,
    destTarget: new THREE.Vector3(0, 0.37, 0),
    duration: 1.15,
    elapsed: 0,
  });

  const prevMacroZoom = useRef(isMacroZoom);
  const prevActiveZone = useRef(activeZone);
  const prevResetTrigger = useRef(resetTrigger);

  // Trigger spherical camera zoom when isMacroZoom changes
  React.useEffect(() => {
    const zoneCfg = getZoneConfig(activeZone);
    const destTargetVec = new THREE.Vector3(...zoneCfg.target);

    if (!prevMacroZoom.current && isMacroZoom) {
      // Initiate gradual transition back to front-facing angle and zoom onto the zone
      const currentTarget = controlsRef.current?.target
        ? controlsRef.current.target.clone()
        : new THREE.Vector3(0, 0, 0);
      const currentCamPos = camera.position.clone();
      const spherical = getSphericalCoords(currentCamPos, currentTarget);

      animRef.current = {
        active: true,
        mode: 'zooming_in',
        startRadius: spherical.radius,
        startPhi: spherical.phi,
        startTheta: spherical.theta,
        startTarget: currentTarget,
        destRadius: zoneCfg.radius,
        destPhi: Math.PI / 2,
        destTheta: 0,
        destTarget: destTargetVec,
        duration: 1.15,
        elapsed: 0,
      };
      onTransitionStateChange?.(true);
    } else if (prevMacroZoom.current && !isMacroZoom) {
      // Zoom out back to default neutral view
      const currentTarget = controlsRef.current?.target
        ? controlsRef.current.target.clone()
        : destTargetVec;
      const currentCamPos = camera.position.clone();
      const spherical = getSphericalCoords(currentCamPos, currentTarget);

      animRef.current = {
        active: true,
        mode: 'zooming_out',
        startRadius: spherical.radius,
        startPhi: spherical.phi,
        startTheta: spherical.theta,
        startTarget: currentTarget,
        destRadius: defaultRadius.current,
        destPhi: defaultPhi.current,
        destTheta: defaultTheta,
        destTarget: defaultTarget.current.clone(),
        duration: 0.9,
        elapsed: 0,
      };
      onTransitionStateChange?.(true);
    }
    prevMacroZoom.current = isMacroZoom;
    prevActiveZone.current = activeZone;
  }, [isMacroZoom, activeZone, camera, controlsRef, onTransitionStateChange]);

  // Handle reset camera button
  React.useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger !== prevResetTrigger.current) {
      const currentTarget = controlsRef.current?.target
        ? controlsRef.current.target.clone()
        : new THREE.Vector3(0, 0, 0);
      const currentCamPos = camera.position.clone();
      const spherical = getSphericalCoords(currentCamPos, currentTarget);

      animRef.current = {
        active: true,
        mode: 'zooming_out',
        startRadius: spherical.radius,
        startPhi: spherical.phi,
        startTheta: spherical.theta,
        startTarget: currentTarget,
        destRadius: defaultRadius.current,
        destPhi: defaultPhi.current,
        destTheta: defaultTheta,
        destTarget: defaultTarget.current.clone(),
        duration: 0.85,
        elapsed: 0,
      };
      onTransitionStateChange?.(true);
      prevResetTrigger.current = resetTrigger;
    }
  }, [resetTrigger, camera, controlsRef, onTransitionStateChange]);

  useFrame((_, delta) => {
    const anim = animRef.current;
    if (anim.active) {
      anim.elapsed += delta;
      const progress = Math.min(1.0, anim.elapsed / anim.duration);
      const eased = easeInOutCubic(progress);

      // Smoothly interpolate spherical coordinates around the target (gradual angle reset + zoom)
      const curRadius = anim.startRadius + (anim.destRadius - anim.startRadius) * eased;
      const curPhi = anim.startPhi + (anim.destPhi - anim.startPhi) * eased;
      const curTheta = anim.startTheta + (anim.destTheta - anim.startTheta) * eased;

      // Smoothly interpolate target position
      const curTarget = new THREE.Vector3().lerpVectors(anim.startTarget, anim.destTarget, eased);

      // Derive Cartesian camera position
      const sinPhi = Math.sin(curPhi);
      const camX = curTarget.x + curRadius * sinPhi * Math.sin(curTheta);
      const camY = curTarget.y + curRadius * Math.cos(curPhi);
      const camZ = curTarget.z + curRadius * sinPhi * Math.cos(curTheta);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(curTarget);

      if (controlsRef.current) {
        controlsRef.current.target.copy(curTarget);
      }

      if (progress >= 1.0) {
        anim.active = false;
        if (anim.mode === 'zooming_in') {
          camera.position.set(0, anim.destTarget.y, anim.destRadius);
          camera.lookAt(anim.destTarget);
          if (controlsRef.current) {
            controlsRef.current.target.copy(anim.destTarget);
          }
          onTransitionStateChange?.(false);
        } else {
          camera.position.set(0, 0.1, 7.2);
          camera.lookAt(0, 0, 0);
          if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }
          onTransitionStateChange?.(false);
        }
      }
    } else if (isMacroZoom) {
      // When macro zoom is settled, keep camera rigidly locked onto the active zone
      const zoneCfg = getZoneConfig(activeZone);
      const targetVec = new THREE.Vector3(...zoneCfg.target);
      camera.position.set(0, targetVec.y, zoneCfg.radius);
      camera.lookAt(targetVec);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetVec);
      }
    }
  });

  return null;
}

export const RacketCanvas: React.FC<RacketCanvasProps & { resetTrigger?: number }> = ({
  activeZone,
  onSelectZone,
  hoveredZone,
  onHoverZone,
  enableOrbit = true,
  isMacroZoom = false,
  resetTrigger,
}) => {
  const controlsRef = useRef<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        className="w-full h-full"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.1, 7.2]} fov={42} />

        {/* Ambient Dark Court Illumination */}
        <ambientLight intensity={0.45} color="#151A26" />

        {/* Crisp Key Light */}
        <directionalLight position={[3, 5, 5]} intensity={2.2} color="#FAFAFA" />

        {/* Dramatic Court Green Rim Lighting from Back Right */}
        <directionalLight
          position={[4, 4, -3.5]}
          intensity={4.0}
          color="#CCFF00"
        />

        {/* Secondary Rim Light from Back Left */}
        <directionalLight
          position={[-4, -2, -3]}
          intensity={2.5}
          color="#CCFF00"
        />

        {/* Cool Fill Light from Bottom */}
        <directionalLight
          position={[-3, -4, 3]}
          intensity={0.8}
          color="#253555"
        />

        {/* Subtle glowing particles in 3D space */}
        <Sparkles
          count={40}
          scale={7}
          size={1.8}
          speed={0.4}
          opacity={0.35}
          color="#CCFF00"
        />

        {/* Camera Controller for Macro Zoom and Zoom Reset */}
        <MacroCameraController
          isMacroZoom={isMacroZoom}
          activeZone={activeZone}
          controlsRef={controlsRef}
          resetTrigger={resetTrigger}
          onTransitionStateChange={setIsTransitioning}
        />

        {/* 3D Tennis Racket Engine */}
        <Suspense fallback={null}>
          <Racket3D
            activeZone={activeZone}
            onSelectZone={onSelectZone}
            hoveredZone={hoveredZone}
            onHoverZone={onHoverZone}
            interactive={!isMacroZoom && !isTransitioning}
          />
        </Suspense>

        {/* Camera Orbit & Controls */}
        {enableOrbit && (
          <OrbitControls
            ref={controlsRef}
            enabled={!isMacroZoom && !isTransitioning}
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI * 0.78}
            minPolarAngle={Math.PI * 0.22}
            maxAzimuthAngle={Math.PI * 0.65}
            minAzimuthAngle={-Math.PI * 0.65}
            dampingFactor={0.08}
          />
        )}
      </Canvas>
    </div>
  );
};
