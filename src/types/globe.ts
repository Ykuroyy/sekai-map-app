import * as THREE from 'three';
import React from 'react';

// Globe3D関連の型定義

export interface Globe3DProps {
  targetCountry?: string;
  selectedCountry?: string;
  isCorrect?: boolean;
  onGlobeReady?: () => void;
}

export interface CountryCoordinate {
  lat: number;
  lng: number;
  name: string;
}

export interface CountryCoordinates {
  [key: string]: CountryCoordinate;
}

export interface RotationTarget {
  x: number;
  y: number;
}

export interface AnimationState {
  isSpinning: boolean;
  isReady: boolean;
  startTime: number;
  targetRotation: RotationTarget;
}

// Three.js関連の型定義
export interface GlobeRefs {
  mount: React.RefObject<HTMLDivElement>;
  scene: React.RefObject<THREE.Scene | null>;
  renderer: React.RefObject<THREE.WebGLRenderer | null>;
  camera: React.RefObject<THREE.Camera | null>;
  globe: React.RefObject<THREE.Mesh | null>;
  markers: React.RefObject<THREE.Group | null>;
  raycaster: React.RefObject<THREE.Raycaster | null>;
  mouse: React.RefObject<THREE.Vector2 | null>;
  spinning: React.RefObject<boolean>;
}