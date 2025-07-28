import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Globe3DProps {
  highlightedCountry?: string;
  selectedCountry?: string;
  isCorrect?: boolean;
  onCountryClick?: (countryId: string) => void;
  options?: string[];
  onGlobeReady?: () => void;
}

// 国の座標データ（緯度経度）
const countryCoordinates: { [key: string]: { lat: number; lng: number; name: string } } = {
  'JP': { lat: 36, lng: 138, name: '日本' },
  'CN': { lat: 35, lng: 105, name: '中国' },
  'KR': { lat: 37, lng: 127.5, name: '韓国' },
  'IN': { lat: 20, lng: 77, name: 'インド' },
  'TH': { lat: 15, lng: 100, name: 'タイ' },
  'VN': { lat: 16, lng: 108, name: 'ベトナム' },
  'ID': { lat: -5, lng: 120, name: 'インドネシア' },
  'MY': { lat: 2.5, lng: 112.5, name: 'マレーシア' },
  'PH': { lat: 13, lng: 122, name: 'フィリピン' },
  'SG': { lat: 1.3, lng: 103.8, name: 'シンガポール' },
  'GB': { lat: 54, lng: -2, name: 'イギリス' },
  'FR': { lat: 46, lng: 2, name: 'フランス' },
  'DE': { lat: 51, lng: 9, name: 'ドイツ' },
  'IT': { lat: 42.8, lng: 12.8, name: 'イタリア' },
  'ES': { lat: 40, lng: -4, name: 'スペイン' },
  'RU': { lat: 60, lng: 100, name: 'ロシア' },
  'PL': { lat: 52, lng: 20, name: 'ポーランド' },
  'NL': { lat: 52.5, lng: 5.75, name: 'オランダ' },
  'CH': { lat: 47, lng: 8, name: 'スイス' },
  'SE': { lat: 62, lng: 15, name: 'スウェーデン' },
  'US': { lat: 38, lng: -97, name: 'アメリカ' },
  'CA': { lat: 60, lng: -95, name: 'カナダ' },
  'MX': { lat: 23, lng: -102, name: 'メキシコ' },
  'BR': { lat: -10, lng: -55, name: 'ブラジル' },
  'AR': { lat: -34, lng: -64, name: 'アルゼンチン' },
  'CL': { lat: -30, lng: -71, name: 'チリ' },
  'PE': { lat: -10, lng: -76, name: 'ペルー' },
  'CO': { lat: 4, lng: -72, name: 'コロンビア' },
  'EG': { lat: 27, lng: 30, name: 'エジプト' },
  'ZA': { lat: -29, lng: 24, name: '南アフリカ' },
  'NG': { lat: 10, lng: 8, name: 'ナイジェリア' },
  'KE': { lat: -1, lng: 38, name: 'ケニア' },
  'MA': { lat: 32, lng: -5, name: 'モロッコ' },
  'AU': { lat: -27, lng: 133, name: 'オーストラリア' },
  'NZ': { lat: -41, lng: 174, name: 'ニュージーランド' },
  'SA': { lat: 25, lng: 45, name: 'サウジアラビア' },
  'TR': { lat: 39, lng: 35, name: 'トルコ' },
  'IL': { lat: 31, lng: 35, name: 'イスラエル' }
};

export const Globe3D = ({
  highlightedCountry,
  selectedCountry,
  isCorrect,
  onCountryClick,
  options = [],
  onGlobeReady
}: Globe3DProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);
  const spinningRef = useRef<boolean>(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // 緯度経度を3D座標に変換
  const latLngToVector3 = (lat: number, lng: number, radius: number = 1): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
  };

  // 国マーカーを作成
  const createCountryMarker = (countryId: string, position: THREE.Vector3, camera: THREE.Camera, color: number = 0xffffff) => {
    // クリック用の大きな透明球体を作成
    const clickGeometry = new THREE.SphereGeometry(0.2, 32, 32); // サイズとセグメントを増加
    const clickMaterial = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0,
      color: 0x000000
    });
    const clickSphere = new THREE.Mesh(clickGeometry, clickMaterial);
    clickSphere.position.copy(position);
    (clickSphere as any).userData = { countryId };
    
    // 見た目用の小さな光る球体を作成
    const visualGeometry = new THREE.SphereGeometry(0.1, 32, 32); // サイズとセグメントを増加
    const visualMaterial = new THREE.MeshLambertMaterial({ 
      color,
      emissive: color,
      emissiveIntensity: 0.7 // 明度を上げる
    });
    const visualMarker = new THREE.Mesh(visualGeometry, visualMaterial);
    visualMarker.position.copy(position);
    
    // パルス効果用のリング
    const ringGeometry = new THREE.RingGeometry(0.12, 0.15, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.lookAt(camera.position);
    
    // グループにまとめる
    const markerGroup = new THREE.Group();
    markerGroup.add(clickSphere);
    markerGroup.add(visualMarker);
    markerGroup.add(ring);
    (markerGroup as any).userData = { countryId };
    
    console.log(`✅ Created marker for ${countryId} at position`, position, 'userData:', (markerGroup as any).userData);
    
    // 国名ラベル
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    context.font = 'Bold 24px Arial';
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.textAlign = 'center';
    context.strokeText(countryCoordinates[countryId]?.name || countryId, 128, 40);
    context.fillText(countryCoordinates[countryId]?.name || countryId, 128, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.4, 0.1, 1);
    sprite.position.copy(position);
    sprite.position.multiplyScalar(1.25);
    
    return { marker: markerGroup, sprite };
  };

  // マーカーを更新
  const updateMarkers = (camera: THREE.Camera) => {
    if (!markersRef.current) return;
    
    // 既存のマーカーをクリア
    while (markersRef.current.children.length > 0) {
      markersRef.current.remove(markersRef.current.children[0]);
    }

    console.log('🔄 Updating markers for options:', options, 'highlighted:', highlightedCountry);

    // 問題の国のマーカー
    if (highlightedCountry && countryCoordinates[highlightedCountry]) {
      const coord = countryCoordinates[highlightedCountry];
      const position = latLngToVector3(coord.lat, coord.lng, 1.02);
      let color = 0x3b82f6; // 青
      
      if (isCorrect !== undefined) {
        color = isCorrect ? 0x22c55e : 0xef4444; // 緑または赤
      }
      
      const { marker, sprite } = createCountryMarker(highlightedCountry, position, camera, color);
      marker.scale.setScalar(1.8); // 問題の国を大きくする
      markersRef.current?.add(marker);
      markersRef.current?.add(sprite);
      console.log(`✅ Added highlighted country marker: ${highlightedCountry}`);
    }

    // 選択肢の国のマーカー
    options.forEach(countryId => {
      if (countryId === highlightedCountry) return; // 問題の国は既に描画済み
      
      const coord = countryCoordinates[countryId];
      if (!coord) {
        console.warn(`❌ No coordinates found for ${countryId}`);
        return;
      }
      
      const position = latLngToVector3(coord.lat, coord.lng, 1.02);
      let color = 0xfbbf24; // 黄色
      
      if (countryId === selectedCountry) {
        color = isCorrect ? 0x22c55e : 0xef4444; // 緑または赤
      }
      
      const { marker, sprite } = createCountryMarker(countryId, position, camera, color);
      marker.scale.setScalar(1.5); // 選択肢の国も見やすくする
      markersRef.current?.add(marker);
      markersRef.current?.add(sprite);
      console.log(`✅ Added option marker: ${countryId} (clickable: ${options.includes(countryId)})`);
    });
    
    console.log(`📊 Total markers created: ${markersRef.current.children.length}`);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // シーンの初期化
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // カメラの設定
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;
    cameraRef.current = camera;

    // レンダラーの設定
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000611, 1); // 深い宇宙の色
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);
    
    // 星空背景の作成
    const createStarField = () => {
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 3000;
      
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      
      for (let i = 0; i < starCount; i++) {
        // ランダムな球面座標で星を配置
        const radius = 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // 星の色をランダムに設定
        const starColor = new THREE.Color().setHSL(
          Math.random() * 0.1 + 0.55, // 青白い色合い
          Math.random() * 0.3 + 0.1,
          Math.random() * 0.5 + 0.5
        );
        colors[i * 3] = starColor.r;
        colors[i * 3 + 1] = starColor.g;
        colors[i * 3 + 2] = starColor.b;
      }
      
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const starMaterial = new THREE.PointsMaterial({
        size: 2,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });
      
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
      
      return stars;
    };
    
    const starField = createStarField();

    // 高品質地球儀の作成
    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 4096;  // 4K解像度
      canvas.height = 2048;
      const ctx = canvas.getContext('2d')!;
      
      // リアルな海洋グラデーション
      const oceanGradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.height/2
      );
      oceanGradient.addColorStop(0, '#006994');
      oceanGradient.addColorStop(0.3, '#0077be');
      oceanGradient.addColorStop(0.6, '#004d6b');
      oceanGradient.addColorStop(1, '#002a3a');
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 詳細な大陸の描画
      const drawContinent = (path: [number, number][], color: string, shadowColor: string) => {
        ctx.save();
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = color;
        ctx.strokeStyle = '#1a4d3a';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };
      
      // アフリカ大陸 - より詳細な形状
      drawContinent([
        [850, 200], [900, 180], [950, 200], [980, 250],
        [1000, 300], [1020, 400], [1000, 500], [980, 600],
        [950, 700], [900, 750], [850, 720], [800, 650],
        [780, 550], [800, 450], [820, 350], [840, 250]
      ], '#2d5a2d', '#1a3d1a');
      
      // ヨーロッパ
      drawContinent([
        [820, 150], [880, 140], [920, 160], [940, 200],
        [920, 240], [880, 250], [840, 240], [810, 200]
      ], '#4a7c59', '#2d4a35');
      
      // アジア - 大きく詳細に
      drawContinent([
        [950, 140], [1300, 120], [1400, 150], [1450, 200],
        [1480, 300], [1460, 400], [1400, 450], [1300, 480],
        [1200, 460], [1100, 420], [1000, 380], [950, 300],
        [940, 200]
      ], '#3d6b3d', '#2a4a2a');
      
      // 北アメリカ
      drawContinent([
        [200, 100], [400, 80], [500, 120], [550, 200],
        [520, 300], [480, 350], [400, 380], [300, 360],
        [200, 320], [150, 250], [180, 180]
      ], '#5d8a5d', '#3a5a3a');
      
      // 南アメリカ
      drawContinent([
        [450, 450], [520, 440], [560, 480], [580, 550],
        [570, 650], [550, 750], [520, 820], [480, 850],
        [440, 840], [410, 800], [400, 700], [420, 600],
        [440, 500]
      ], '#4a7a4a', '#2d4d2d');
      
      // オーストラリア
      drawContinent([
        [1350, 650], [1450, 640], [1500, 670], [1510, 720],
        [1480, 760], [1420, 770], [1360, 750], [1340, 700]
      ], '#6b9b6b', '#4a6a4a');
      
      // 山脈と地形の詳細
      ctx.fillStyle = '#8FBC8F';
      ctx.globalAlpha = 0.6;
      
      // ヒマラヤ山脈
      for (let i = 0; i < 20; i++) {
        const x = 1100 + Math.random() * 200;
        const y = 250 + Math.random() * 100;
        const radius = Math.random() * 15 + 8;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // アンデス山脈
      for (let i = 0; i < 30; i++) {
        const x = 480 + Math.random() * 40;
        const y = 450 + i * 15 + Math.random() * 20;
        const radius = Math.random() * 12 + 6;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      
      // 緊張効果と雲の模様
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 30 + 10;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // 法線マップの作成（立体感を向上）
    const createNormalMap = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      
      // 基準となる青色
      ctx.fillStyle = '#8080ff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 山岳地帯の法線
      ctx.fillStyle = '#a0a0ff';
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 20 + 5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // 高解像度地球の作成
    const geometry = new THREE.SphereGeometry(1, 128, 64); // セグメント数を大幅増加
    
    const earthTexture = createEarthTexture();
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.RepeatWrapping;
    
    const normalMap = createNormalMap();
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.3, 0.3),
      shininess: 10,
      specular: new THREE.Color(0x333333),
      transparent: false
    });
    
    const globe = new THREE.Mesh(geometry, material);
    globeRef.current = globe;
    scene.add(globe);
    
    // 大気圏エフェクトの追加
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
    
    // 雲レイヤーの追加
    const createCloudTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      
      // 透明背景
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 雲のパターンを作成
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      
      // パーリンノイズ風の雲模様
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 100 + 50;
        const opacity = Math.random() * 0.4 + 0.2;
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // より大きな雲の塊
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 200 + 100;
        const opacity = Math.random() * 0.3 + 0.1;
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      return new THREE.CanvasTexture(canvas);
    };
    
    const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 32);
    const cloudTexture = createCloudTexture();
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.RepeatWrapping;
    
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);
    
    // 雲の回転アニメーション
    let cloudRotation = 0;
    const animateClouds = () => {
      cloudRotation += 0.001;
      clouds.rotation.y = cloudRotation;
    };

    // マーカーグループの作成
    const markers = new THREE.Group();
    markersRef.current = markers;
    scene.add(markers);

    // 高品質ライティングシステム
    // 環境光 - 全体的な明るさ
    const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
    scene.add(ambientLight);
    
    // メインの太陽光
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(2, 1, 1);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
    
    // リムライト（縁取り光）
    const rimLight = new THREE.DirectionalLight(0x8eb7e8, 0.6);
    rimLight.position.set(-1, 0.5, -1);
    scene.add(rimLight);
    
    // 点光源（宇宙からの反射光を模擬）
    const pointLight = new THREE.PointLight(0x4a90e2, 0.8, 100);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);
    
    // ヘミスフェアライト（空と地面の色を模擬）
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x2f4f4f, 0.5);
    scene.add(hemiLight);

    // レイキャスターとマウス位置の初期化
    raycasterRef.current = new THREE.Raycaster();
    mouseRef.current = new THREE.Vector2();

    // マウスクリックイベント
    const handleClick = (event: MouseEvent) => {
      console.log('🖱️ Globe clicked, isSpinning:', spinningRef.current, 'isReady:', isReady, 'options:', options);
      
      if (!raycasterRef.current || !mouseRef.current || !camera || spinningRef.current || !isReady) {
        console.log('❌ Click ignored - not ready');
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      console.log('📍 Mouse coordinates:', mouseRef.current.x, mouseRef.current.y);

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      if (!markersRef.current) {
        console.log('❌ No markers ref');
        return;
      }
      
      // レイキャスターの設定を最適化
      raycasterRef.current.far = 1000;
      raycasterRef.current.near = 0.01;
      
      const intersects = raycasterRef.current.intersectObjects(markersRef.current.children, true);
      console.log(`🎯 Found ${intersects.length} intersects:`, intersects.map(i => ({
        objectType: i.object.type,
        distance: i.distance.toFixed(3),
        userData: (i.object as any).userData,
        parentUserData: (i.object.parent as any)?.userData
      })));

      if (intersects.length > 0) {
        // 距離順にソートして最も近いものから処理
        intersects.sort((a, b) => a.distance - b.distance);
        
        for (const intersect of intersects) {
          let countryId = (intersect.object as any).userData?.countryId;
          
          // 親オブジェクトからもユーザーデータを確認
          if (!countryId && intersect.object.parent) {
            countryId = (intersect.object.parent as any).userData?.countryId;
          }
          
          console.log('🔍 Processing intersect:', { 
            countryId, 
            availableOptions: options, 
            isClickable: options.includes(countryId || ''),
            hasCallback: !!onCountryClick 
          });
          
          if (countryId && options.includes(countryId) && onCountryClick) {
            console.log('✅ SUCCESS: Calling onCountryClick for:', countryId);
            onCountryClick(countryId);
            return; // 最初の有効なクリックで終了
          }
        }
        
        console.log('❌ No valid clickable country found in intersects');
      } else {
        console.log('❌ No intersects found');
        
        // デバッグ用：全マーカーの状態を確認
        console.log('📊 Available markers debug info:');
        markersRef.current.children.forEach((child, index) => {
          console.log(`  Marker ${index}:`, {
            userData: (child as any).userData,
            position: `(${child.position.x.toFixed(2)}, ${child.position.y.toFixed(2)}, ${child.position.z.toFixed(2)})`,
            visible: child.visible,
            children: child.children.length
          });
        });
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // アニメーションループ
    let animationId: number;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (globeRef.current && spinningRef.current) {
        globeRef.current.rotation.y += 0.02;
      }
      
      // 雲の回転アニメーション
      animateClouds();
      
      // 星空の微細な回転
      if (starField) {
        starField.rotation.y += 0.0002;
        starField.rotation.x += 0.0001;
      }

      renderer.render(scene, camera);
    };
    animate();

    // リサイズハンドラー
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 初期化完了後に回転開始
    const startSpinning = () => {
      console.log('Globe initialized, starting rotation');
      spinningRef.current = true;
      setIsSpinning(true);
      
      // 3秒後に停止して準備完了にする
      const stopTimer = setTimeout(() => {
        console.log('Stopping globe rotation');
        spinningRef.current = false;
        setIsSpinning(false);
        setIsReady(true);
        if (onGlobeReady) {
          onGlobeReady();
        }
      }, 3000);
      
      return stopTimer;
    };
    
    // 少し遅延してから回転開始
    const initTimer = setTimeout(() => {
      const stopTimer = startSpinning();
      // クリーンアップ用にタイマーを保存
      (initTimer as any).stopTimer = stopTimer;
    }, 500);

    // クリーンアップ
    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(initTimer);
      if ((initTimer as any).stopTimer) {
        clearTimeout((initTimer as any).stopTimer);
      }
      spinningRef.current = false;
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {
          console.warn('Failed to remove renderer element:', e);
        }
      }
      renderer.dispose();
    };
  }, [onGlobeReady]);

  // マーカーの更新
  useEffect(() => {
    if (isReady && cameraRef.current) {
      updateMarkers(cameraRef.current);
    }
  }, [highlightedCountry, selectedCountry, isCorrect, options, isReady]);

  return (
    <div className="globe-container">
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '600px',
          border: 'none',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'transparent'
        }} 
      />
      
      {isSpinning && (
        <div className="spinning-message">
          <div className="spinner">🌍</div>
          <p>地球儀が回転しています...</p>
        </div>
      )}
      
      <div className="globe-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
          <span>問題の国</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#fbbf24' }}></span>
          <span>選択肢の国（クリック可能）</span>
        </div>
      </div>
    </div>
  );
};