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

    // 超リアルな地球テクスチャの作成（NASA Blue Marble風）
    const createRealisticEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 8192;  // 8K解像度
      canvas.height = 4096;
      const ctx = canvas.getContext('2d')!;
      
      // 実際の地球の色に基づいた詳細な海洋
      const oceanData = ctx.createImageData(canvas.width, canvas.height);
      const data = oceanData.data;
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          
          // 緯度に基づく海洋色の変化
          const lat = ((y / canvas.height) - 0.5) * Math.PI;
          const lng = ((x / canvas.width) - 0.5) * 2 * Math.PI;
          
          // 深海の色（緯度による変化）
          const tempFactor = Math.cos(lat);
          const r = Math.floor(12 + tempFactor * 20 + Math.sin(lng * 10) * 5);
          const g = Math.floor(54 + tempFactor * 30 + Math.cos(lng * 8) * 8);
          const b = Math.floor(85 + tempFactor * 40 + Math.sin(lng * 6) * 10);
          
          data[idx] = Math.max(0, Math.min(255, r));
          data[idx + 1] = Math.max(0, Math.min(255, g));
          data[idx + 2] = Math.max(0, Math.min(255, b));
          data[idx + 3] = 255;
        }
      }
      
      ctx.putImageData(oceanData, 0, 0);
      
      // 超詳細な大陸データ（実際の地形に基づく）
      const continentData = [
        // アフリカ大陸（詳細な輪郭）
        {
          name: 'Africa',
          color: '#2d5016',
          shadowColor: '#1f3810',
          points: [
            [3400, 800], [3600, 700], [3800, 750], [4000, 900], [4200, 1100],
            [4300, 1400], [4350, 1700], [4300, 2000], [4200, 2300], [4000, 2600],
            [3800, 2800], [3600, 2900], [3400, 2850], [3200, 2700], [3000, 2400],
            [2900, 2100], [2950, 1800], [3000, 1500], [3100, 1200], [3200, 900]
          ]
        },
        // ユーラシア大陸
        {
          name: 'Eurasia',
          color: '#3d6b1f',
          shadowColor: '#2a4a15',
          points: [
            [3200, 600], [5200, 400], [6800, 500], [7200, 700], [7400, 1000],
            [7300, 1300], [7000, 1500], [6500, 1600], [5800, 1550], [5000, 1400],
            [4200, 1200], [3800, 1000], [3400, 800], [3200, 600]
          ]
        },
        // 北アメリカ
        {
          name: 'North America',
          color: '#4a7c2a',
          shadowColor: '#35591e',
          points: [
            [800, 400], [1600, 300], [2000, 400], [2200, 700], [2100, 1000],
            [1900, 1200], [1600, 1300], [1200, 1250], [800, 1100], [600, 900],
            [650, 650], [700, 400]
          ]
        },
        // 南アメリカ
        {
          name: 'South America',
          color: '#2d5a1a',
          shadowColor: '#1f3d12',
          points: [
            [1800, 1800], [2100, 1750], [2300, 1900], [2350, 2200], [2300, 2500],
            [2200, 2800], [2000, 3100], [1800, 3300], [1600, 3250], [1400, 3000],
            [1350, 2700], [1400, 2400], [1500, 2100], [1650, 1850]
          ]
        },
        // オーストラリア
        {
          name: 'Australia',
          color: '#5d8a35',
          shadowColor: '#426327',
          points: [
            [5400, 2600], [5800, 2550], [6000, 2650], [6050, 2850], [5950, 3000],
            [5700, 3050], [5450, 3000], [5350, 2800], [5400, 2600]
          ]
        }
      ];
      
      // 大陸の詳細描画
      continentData.forEach(continent => {
        ctx.save();
        
        // 影効果
        ctx.shadowColor = continent.shadowColor;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        
        // 大陸の基本色
        ctx.fillStyle = continent.color;
        ctx.strokeStyle = '#1a3d0f';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(continent.points[0][0], continent.points[0][1]);
        
        // スムーズな曲線で描画
        for (let i = 1; i < continent.points.length; i++) {
          const current = continent.points[i];
          const next = continent.points[(i + 1) % continent.points.length];
          const controlX = (current[0] + next[0]) / 2;
          const controlY = (current[1] + next[1]) / 2;
          ctx.quadraticCurveTo(current[0], current[1], controlX, controlY);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 地形の詳細（山脈、平野など）
        ctx.globalAlpha = 0.4;
        
        // 山岳地帯
        if (continent.name === 'Eurasia') {
          // ヒマラヤ山脈
          ctx.fillStyle = '#8FBC8F';
          for (let i = 0; i < 50; i++) {
            const x = 4400 + Math.random() * 800;
            const y = 1000 + Math.random() * 300;
            const radius = Math.random() * 25 + 15;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
        
        // アンデス山脈
        if (continent.name === 'South America') {
          ctx.fillStyle = '#A0C8A0';
          for (let i = 0; i < 60; i++) {
            const x = 1900 + Math.random() * 100;
            const y = 1800 + i * 25 + Math.random() * 40;
            const radius = Math.random() * 20 + 10;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
        
        ctx.globalAlpha = 1;
        ctx.restore();
      });
      
      // 氷河と雪（北極・南極）
      ctx.fillStyle = 'rgba(240, 248, 255, 0.9)';
      
      // 北極
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * 200;
        const radius = Math.random() * 30 + 10;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // 南極
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = canvas.height - 200 + Math.random() * 200;
        const radius = Math.random() * 40 + 15;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // 海流の表現
      ctx.strokeStyle = 'rgba(100, 149, 200, 0.3)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        ctx.moveTo(startX, startY);
        
        for (let j = 0; j < 10; j++) {
          const x = startX + j * 200 + Math.sin(j * 0.5) * 100;
          const y = startY + Math.sin(j * 0.3) * 50;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // 高品質法線マップの作成
    const createDetailedNormalMap = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d')!;
      
      // 基準色（平坦な海面）
      ctx.fillStyle = '#8080ff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 大陸の高度による法線変化
      const continents = [
        // アフリカ - エチオピア高原
        { x: 1700, y: 500, width: 400, height: 300, elevation: '#b0b0ff' },
        // ヒマラヤ山脈
        { x: 2200, y: 400, width: 600, height: 200, elevation: '#f0f0ff' },
        // アンデス山脈
        { x: 900, y: 900, width: 100, height: 800, elevation: '#d0d0ff' },
        // ロッキー山脈
        { x: 400, y: 300, width: 200, height: 400, elevation: '#c0c0ff' },
        // アルプス山脈
        { x: 1640, y: 350, width: 150, height: 100, elevation: '#e0e0ff' }
      ];
      
      continents.forEach(mountain => {
        // 山脈の基本形状
        const gradient = ctx.createRadialGradient(
          mountain.x + mountain.width/2, mountain.y + mountain.height/2, 0,
          mountain.x + mountain.width/2, mountain.y + mountain.height/2, 
          Math.max(mountain.width, mountain.height)
        );
        gradient.addColorStop(0, mountain.elevation);
        gradient.addColorStop(0.7, '#9090ff');
        gradient.addColorStop(1, '#8080ff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(mountain.x, mountain.y, mountain.width, mountain.height);
        
        // 山脈の詳細な起伏
        ctx.fillStyle = mountain.elevation;
        for (let i = 0; i < 100; i++) {
          const x = mountain.x + Math.random() * mountain.width;
          const y = mountain.y + Math.random() * mountain.height;
          const radius = Math.random() * 15 + 5;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
      
      // 海底の起伏
      ctx.fillStyle = '#7070ff';
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 30 + 10;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // 高度マップの作成（displacement mapping用）
    const createHeightMap = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      
      // 基準高度（海面）
      ctx.fillStyle = '#404040';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 山脈の高度データ
      const mountainRanges = [
        // エベレスト周辺
        { x: 1100, y: 200, radius: 80, height: '#ffffff' },
        // アンデス山脈
        { x: 450, y: 450, radius: 50, height: '#e0e0e0' },
        // アルプス
        { x: 820, y: 175, radius: 40, height: '#d0d0d0' },
        // ロッキー山脈
        { x: 200, y: 150, radius: 60, height: '#c0c0c0' }
      ];
      
      mountainRanges.forEach(peak => {
        const gradient = ctx.createRadialGradient(
          peak.x, peak.y, 0,
          peak.x, peak.y, peak.radius
        );
        gradient.addColorStop(0, peak.height);
        gradient.addColorStop(1, '#404040');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(peak.x, peak.y, peak.radius, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // 超高解像度地球の作成
    const geometry = new THREE.SphereGeometry(1, 256, 128); // さらに高解像度
    
    const earthTexture = createRealisticEarthTexture();
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.RepeatWrapping;
    earthTexture.generateMipmaps = true;
    earthTexture.minFilter = THREE.LinearMipmapLinearFilter;
    earthTexture.magFilter = THREE.LinearFilter;
    
    const normalMap = createDetailedNormalMap();
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    
    const heightMap = createHeightMap();
    heightMap.wrapS = THREE.RepeatWrapping;
    heightMap.wrapT = THREE.RepeatWrapping;
    
    // 最高品質のマテリアル
    const material = new THREE.MeshStandardMaterial({
      map: earthTexture,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      displacementMap: heightMap,
      displacementScale: 0.02,
      roughness: 0.8,
      metalness: 0.1,
      envMapIntensity: 0.5,
      transparent: false
    });
    
    const globe = new THREE.Mesh(geometry, material);
    
    // 地球の自転軸の傾斜（23.5度）を追加
    globe.rotation.z = THREE.MathUtils.degToRad(23.5);
    
    // 影を受けるように設定
    globe.receiveShadow = true;
    globe.castShadow = true;
    
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
    
    // 雲レイヤーも地球と同じ傾斜
    clouds.rotation.z = THREE.MathUtils.degToRad(23.5);
    
    scene.add(clouds);
    
    // 雲の回転アニメーション
    let cloudRotation = 0;
    const animateClouds = () => {
      cloudRotation += 0.0008; // 地球より少し遅く回転
      clouds.rotation.y = cloudRotation;
    };

    // マーカーグループの作成
    const markers = new THREE.Group();
    markersRef.current = markers;
    scene.add(markers);

    // NASA級ライティングシステム
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
    
    // 環境マッピング用のキューブマップ作成
    const createSpaceEnvironment = () => {
      const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512);
      const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
      scene.add(cubeCamera);
      
      return cubeRenderTarget.texture;
    };
    
    const envMap = createSpaceEnvironment();
    material.envMap = envMap;
    material.envMapIntensity = 0.3;

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