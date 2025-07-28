import * as THREE from 'three';

// 3D座標変換ユーティリティ
export const latLngToVector3 = (lat: number, lng: number, radius: number = 1): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
};

// 回転計算ユーティリティ
export const calculateTargetRotation = (countryId: string, countryCoordinates: { [key: string]: { lat: number; lng: number; name: string } }) => {
  const coord = countryCoordinates[countryId];
  if (!coord) return { x: 0, y: 0 };
  
  // 経度を地球儀のY軸回転に変換（西経は正の値、東経は負の値）
  const targetY = -coord.lng * (Math.PI / 180);
  
  // 緯度を地球儀のX軸回転に変換（北緯は負の値、南緯は正の値）  
  const targetX = -coord.lat * (Math.PI / 180);
  
  return { x: targetX, y: targetY };
};

// 高品質ライティングシステムの設定
export const setupLighting = (scene: THREE.Scene) => {
  // 宇宙空間の微弱な環境光
  const spaceAmbient = new THREE.AmbientLight(0x1a1a2e, 0.15);
  scene.add(spaceAmbient);
  
  // 太陽光（現実的な位置と強度）
  const sunLight = new THREE.DirectionalLight(0xfff8dc, 2.5);
  sunLight.position.set(5, 2, 3);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -5;
  sunLight.shadow.camera.right = 5;
  sunLight.shadow.camera.top = 5;
  sunLight.shadow.camera.bottom = -5;
  sunLight.shadow.bias = -0.0001;
  scene.add(sunLight);
  
  // 地球の反射光（大気散乱を模擬）
  const earthReflection = new THREE.DirectionalLight(0x4a90e2, 0.3);
  earthReflection.position.set(-2, -1, -1);
  scene.add(earthReflection);
  
  // 月明かり（微弱な青い光）
  const moonLight = new THREE.DirectionalLight(0x9bb5ff, 0.1);
  moonLight.position.set(-3, 1, -2);
  scene.add(moonLight);
  
  // 星の光の集合（ヘミスフェアライト）
  const starlight = new THREE.HemisphereLight(0x0c1445, 0x000000, 0.05);
  scene.add(starlight);
};

// 大気圏エフェクトの作成
export const createAtmosphere = (scene: THREE.Scene) => {
  const atmosphereGeometry = new THREE.SphereGeometry(1.03, 64, 32);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
        gl_FragColor = vec4(atmosphere, intensity * 0.8);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);
  
  return atmosphere;
};

// 国のハイライト作成
export const createCountryHighlight = (
  countryId: string,
  countryCoordinates: { [key: string]: { lat: number; lng: number; name: string } },
  isCorrect?: boolean
): { highlight: THREE.Mesh; ring: THREE.Mesh } | null => {
  const coord = countryCoordinates[countryId];
  if (!coord) return null;
  
  const position = latLngToVector3(coord.lat, coord.lng, 1.02);
  
  // 結果に応じて色を決定
  let color = 0x3b82f6; // デフォルトは青
  if (isCorrect !== undefined) {
    color = isCorrect ? 0x22c55e : 0xef4444; // 緑または赤
  }
  
  // ハイライト用の光る球体
  const highlightGeometry = new THREE.SphereGeometry(0.08, 32, 32);
  const highlightMaterial = new THREE.MeshLambertMaterial({ 
    color,
    emissive: color,
    emissiveIntensity: 0.8
  });
  const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
  highlight.position.copy(position);
  
  // パルス効果
  const ringGeometry = new THREE.RingGeometry(0.1, 0.15, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({ 
    color,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.copy(position);
  ring.lookAt(new THREE.Vector3(0, 0, 3));
  
  return { highlight, ring };
};

// レンダラーの設定
export const setupRenderer = (container: HTMLDivElement): THREE.WebGLRenderer => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000611, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  return renderer;
};

// カメラの設定
export const setupCamera = (container: HTMLDivElement): THREE.PerspectiveCamera => {
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 3;
  return camera;
};

// リサイズハンドラー
export const createResizeHandler = (
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  container: HTMLDivElement
) => {
  return () => {
    if (!container) return;
    
    (camera as THREE.PerspectiveCamera).aspect = container.clientWidth / container.clientHeight;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
};