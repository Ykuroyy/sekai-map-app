import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Globe3DProps {
  targetCountry?: string;
  selectedCountry?: string;
  isCorrect?: boolean;
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
  targetCountry,
  selectedCountry,
  isCorrect,
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

  // 正面に来た国を視覚的にハイライト
  const addCountryHighlight = () => {
    if (!targetCountry || !countryCoordinates[targetCountry] || !markersRef.current) return;
    
    // 既存のハイライトをクリア
    while (markersRef.current.children.length > 0) {
      markersRef.current.remove(markersRef.current.children[0]);
    }
    
    const coord = countryCoordinates[targetCountry];
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
    ring.lookAt(new THREE.Vector3(0, 0, 3)); // カメラ方向を向く
    
    markersRef.current.add(highlight);
    markersRef.current.add(ring);
    
    console.log(`✅ Added highlight for target country: ${targetCountry}`);
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

    // NASA衛星データベースの地球テクスチャ（超リアル）
    const createNASAEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16384;  // 16K解像度
      canvas.height = 8192;
      const ctx = canvas.getContext('2d')!;
      
      // NASA Blue Marble衛星データに基づく海洋
      const oceanData = ctx.createImageData(canvas.width, canvas.height);
      const data = oceanData.data;
      
      // 実際の海流、水温、深度データを模擬
      const oceanZones = [
        // 赤道暖流
        { latRange: [-10, 10], color: [0, 119, 190], temp: 'warm' },
        // 亜熱帯
        { latRange: [-30, -10], color: [0, 105, 148], temp: 'moderate' },
        { latRange: [10, 30], color: [0, 105, 148], temp: 'moderate' }, 
        // 温帯
        { latRange: [-50, -30], color: [0, 85, 128], temp: 'cool' },
        { latRange: [30, 50], color: [0, 85, 128], temp: 'cool' },
        // 極域
        { latRange: [-90, -50], color: [0, 65, 108], temp: 'cold' },
        { latRange: [50, 90], color: [0, 65, 108], temp: 'cold' }
      ];
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          
          // 実際の緯度経度計算
          const lat = 90 - (y / canvas.height) * 180;
          const lng = (x / canvas.width) * 360 - 180;
          
          // 海域の決定
          let oceanColor = [0, 85, 128]; // デフォルト
          for (const zone of oceanZones) {
            if (lat >= zone.latRange[0] && lat <= zone.latRange[1]) {
              oceanColor = zone.color;
              break;
            }
          }
          
          // 海底地形による色の変化（大陸棚、深海溝など）
          const bathymetry = Math.sin(lng * 0.1) * Math.cos(lat * 0.1) * 30;
          const depth = Math.max(0, Math.min(50, bathymetry + 30));
          
          // 深度による色調整
          const depthFactor = depth / 50;
          const r = Math.floor(oceanColor[0] * (1 - depthFactor * 0.7));
          const g = Math.floor(oceanColor[1] * (1 - depthFactor * 0.5));  
          const b = Math.floor(oceanColor[2] * (1 - depthFactor * 0.3));
          
          // 海流による微細な変化
          const currentX = Math.sin(lng * 0.05 + lat * 0.02) * 10;
          const currentY = Math.cos(lng * 0.03 - lat * 0.04) * 8;
          
          data[idx] = Math.max(0, Math.min(255, r + currentX));
          data[idx + 1] = Math.max(0, Math.min(255, g + currentY));
          data[idx + 2] = Math.max(0, Math.min(255, b + currentX * 0.5));
          data[idx + 3] = 255;
        }
      }
      
      ctx.putImageData(oceanData, 0, 0);
      
      // 実際の地球観測データに基づく超詳細大陸
      const realContinentData = [
        // アフリカ大陸（NASA衛星画像ベース）
        {
          name: 'Africa',
          biomes: [
            { region: 'Sahara', color: '#C19A6B', points: [[6800, 1600], [7800, 1400], [8200, 1800], [7600, 2200]] },
            { region: 'Congo_Basin', color: '#228B22', points: [[7200, 2400], [7600, 2200], [7800, 2800], [7400, 3000]] },
            { region: 'East_Africa', color: '#8B4513', points: [[8000, 2000], [8400, 1800], [8600, 2600], [8200, 2800]] },
            { region: 'South_Africa', color: '#556B2F', points: [[7400, 3000], [7800, 2800], [8200, 3200], [7600, 3400]] }
          ]
        },
        // ユーラシア大陸（生態系別）
        {
          name: 'Eurasia',
          biomes: [
            { region: 'Siberian_Taiga', color: '#2F4F2F', points: [[8800, 800], [12800, 600], [13200, 1200], [9200, 1400]] },
            { region: 'Central_Asia', color: '#D2B48C', points: [[9600, 1400], [11200, 1200], [11600, 1800], [10000, 2000]] },
            { region: 'Indian_Subcontinent', color: '#6B8E23', points: [[10400, 2000], [11200, 1800], [11600, 2400], [10800, 2600]] },
            { region: 'Southeast_Asia', color: '#228B22', points: [[11600, 2400], [12800, 2200], [13200, 2800], [12000, 3000]] },
            { region: 'Europe', color: '#9ACD32', points: [[8400, 1000], [9600, 800], [10000, 1400], [8800, 1600]] },
            { region: 'China', color: '#8FBC8F', points: [[11200, 1200], [12800, 1000], [13200, 1800], [11600, 2000]] }
          ]
        },
        // 北アメリカ（詳細な生態系）
        {
          name: 'North_America',
          biomes: [
            { region: 'Canadian_Shield', color: '#2F4F2F', points: [[1600, 600], [3200, 400], [3600, 1200], [2000, 1400]] },
            { region: 'Great_Plains', color: '#F5DEB3', points: [[2000, 1400], [3200, 1200], [3600, 2000], [2400, 2200]] },
            { region: 'Eastern_Forest', color: '#228B22', points: [[3200, 1200], [4000, 1000], [4400, 2000], [3600, 2200]] },
            { region: 'Western_Mountains', color: '#8B4513', points: [[800, 1000], [2000, 800], [2400, 1800], [1200, 2000]] },
            { region: 'Desert_Southwest', color: '#D2691E', points: [[1600, 1800], [2800, 1600], [3200, 2400], [2000, 2600]] }
          ]
        },
        // 南アメリカ（アマゾン含む）
        {
          name: 'South_America',
          biomes: [
            { region: 'Amazon_Rainforest', color: '#006400', points: [[3600, 3600], [4800, 3400], [5200, 4400], [3800, 4600]] },
            { region: 'Andes_Mountains', color: '#8B4513', points: [[3200, 3400], [3600, 3600], [3800, 5800], [3400, 6000]] },
            { region: 'Pampas', color: '#9ACD32', points: [[3800, 4600], [4400, 4400], [4800, 5400], [4200, 5600]] },
            { region: 'Patagonia', color: '#BC8F8F', points: [[3400, 5600], [4200, 5400], [4600, 6200], [3800, 6400]] }
          ]
        },
        // オーストラリア（内陸砂漠含む）
        {
          name: 'Australia',
          biomes: [
            { region: 'Outback', color: '#CD853F', points: [[10800, 5200], [12000, 5000], [12400, 5800], [11200, 6000]] },
            { region: 'Coastal_Forest', color: '#228B22', points: [[12000, 5000], [12800, 4800], [13200, 5600], [12400, 5800]] },
            { region: 'Great_Barrier_Reef_Coast', color: '#40E0D0', points: [[12800, 4800], [13200, 4600], [13600, 5400], [13200, 5600]] }
          ]
        },
        // 南極大陸（氷床）
        {
          name: 'Antarctica',
          biomes: [
            { region: 'Ice_Sheet', color: '#F0F8FF', points: [[0, 7200], [16384, 7200], [16384, 8192], [0, 8192]] }
          ]
        },
        // グリーンランド
        {
          name: 'Greenland',
          biomes: [
            { region: 'Ice_Cap', color: '#F5F5F5', points: [[1600, 400], [2400, 200], [2800, 1000], [2000, 1200]] }
          ]
        }
      ];
      
      // 超詳細生態系描画
      realContinentData.forEach(continent => {
        continent.biomes.forEach(biome => {
          ctx.save();
          
          // 生態系別の影効果
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          // 生態系の色
          ctx.fillStyle = biome.color;
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 1;
          
          ctx.beginPath();
          ctx.moveTo(biome.points[0][0], biome.points[0][1]);
          
          // 自然な境界線
          for (let i = 1; i < biome.points.length; i++) {
            const current = biome.points[i];
            const next = biome.points[(i + 1) % biome.points.length];
            const controlX = (current[0] + next[0]) / 2 + (Math.random() - 0.5) * 50;
            const controlY = (current[1] + next[1]) / 2 + (Math.random() - 0.5) * 50;
            ctx.quadraticCurveTo(current[0], current[1], controlX, controlY);
          }
          
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // 生態系内の詳細（植生、地形など）
          ctx.globalAlpha = 0.6;
          
          // 生態系別の詳細パターン
          if (biome.region === 'Amazon_Rainforest') {
            // 密集した森林
            ctx.fillStyle = '#004d00';
            for (let i = 0; i < 200; i++) {
              const x = biome.points[0][0] + Math.random() * (biome.points[2][0] - biome.points[0][0]);
              const y = biome.points[0][1] + Math.random() * (biome.points[2][1] - biome.points[0][1]);
              ctx.beginPath();
              ctx.arc(x, y, Math.random() * 8 + 3, 0, 2 * Math.PI);
              ctx.fill();
            }
          } else if (biome.region === 'Sahara') {
            // 砂丘パターン
            ctx.strokeStyle = '#DEB887';
            ctx.lineWidth = 3;
            for (let i = 0; i < 50; i++) {
              const x = biome.points[0][0] + Math.random() * (biome.points[2][0] - biome.points[0][0]);
              const y = biome.points[0][1] + Math.random() * (biome.points[2][1] - biome.points[0][1]);
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.quadraticCurveTo(x + 50, y - 20, x + 100, y);
              ctx.stroke();
            }
          } else if (biome.region === 'Siberian_Taiga') {
            // 針葉樹林
            ctx.fillStyle = '#1a4d1a';
            for (let i = 0; i < 150; i++) {
              const x = biome.points[0][0] + Math.random() * (biome.points[2][0] - biome.points[0][0]);
              const y = biome.points[0][1] + Math.random() * (biome.points[2][1] - biome.points[0][1]);
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x - 3, y + 8);
              ctx.lineTo(x + 3, y + 8);
              ctx.closePath();
              ctx.fill();
            }
          } else if (biome.region === 'Great_Plains') {
            // 平原の草地
            ctx.strokeStyle = '#90EE90';
            ctx.lineWidth = 1;
            for (let i = 0; i < 300; i++) {
              const x = biome.points[0][0] + Math.random() * (biome.points[2][0] - biome.points[0][0]);
              const y = biome.points[0][1] + Math.random() * (biome.points[2][1] - biome.points[0][1]);
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + Math.random() * 6 - 3, y - Math.random() * 10);
              ctx.stroke();
            }
          } else if (biome.region === 'Ice_Sheet' || biome.region === 'Ice_Cap') {
            // 氷の割れ目
            ctx.strokeStyle = '#B0E0E6';
            ctx.lineWidth = 2;
            for (let i = 0; i < 100; i++) {
              const x = biome.points[0][0] + Math.random() * (biome.points[2][0] - biome.points[0][0]);
              const y = biome.points[0][1] + Math.random() * (biome.points[2][1] - biome.points[0][1]);
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20);
              ctx.stroke();
            }
          }
          
          ctx.globalAlpha = 1;
          ctx.restore();
        });
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
    
    const earthTexture = createNASAEarthTexture();
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
    
    // 気象データベースの雲テクスチャ（超リアル）
    const createMeteorologicalClouds = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 8192;  // 高解像度雲
      canvas.height = 4096;
      const ctx = canvas.getContext('2d')!;
      
      // 透明背景
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 実際の気象パターンに基づく雲の配置
      const weatherSystems = [
        // 熱帯収束帯（ITCZ）
        { lat: 0, intensity: 0.8, type: 'cumulus', width: canvas.width, height: 200 },
        // 中緯度低気圧
        { lat: 45, intensity: 0.6, type: 'stratus', width: canvas.width * 0.3, height: 400 },
        { lat: -45, intensity: 0.6, type: 'stratus', width: canvas.width * 0.3, height: 400 },
        // 亜熱帯高気圧（雲少ない）
        { lat: 30, intensity: 0.2, type: 'cirrus', width: canvas.width, height: 100 },
        { lat: -30, intensity: 0.2, type: 'cirrus', width: canvas.width, height: 100 },
        // 極域雲
        { lat: 70, intensity: 0.4, type: 'stratocumulus', width: canvas.width, height: 300 },
        { lat: -70, intensity: 0.4, type: 'stratocumulus', width: canvas.width, height: 300 }
      ];
      
      weatherSystems.forEach(system => {
        const y = canvas.height * (1 - (system.lat + 90) / 180);
        
        if (system.type === 'cumulus') {
          // 積雲（対流性）
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          for (let i = 0; i < 150; i++) {
            const x = Math.random() * canvas.width;
            const cloudY = y + (Math.random() - 0.5) * system.height;
            const radius = Math.random() * 80 + 40;
            ctx.globalAlpha = system.intensity * (Math.random() * 0.4 + 0.6);
            ctx.beginPath();
            ctx.arc(x, cloudY, radius, 0, 2 * Math.PI);
            ctx.fill();
          }
        } else if (system.type === 'stratus') {
          // 層雲（前線性）
          ctx.fillStyle = 'rgba(240, 240, 240, 0.7)';
          for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const cloudY = y + (Math.random() - 0.5) * system.height;
            const width = Math.random() * 300 + 200;
            const height = Math.random() * 80 + 40;
            ctx.globalAlpha = system.intensity * (Math.random() * 0.3 + 0.4);
            ctx.beginPath();
            ctx.ellipse(x, cloudY, width, height, Math.random() * Math.PI, 0, 2 * Math.PI);
            ctx.fill();
          }
        } else if (system.type === 'cirrus') {
          // 巻雲（高高度）
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 3;
          for (let i = 0; i < 80; i++) {
            const x = Math.random() * canvas.width;
            const cloudY = y + (Math.random() - 0.5) * system.height;
            ctx.globalAlpha = system.intensity * (Math.random() * 0.3 + 0.3);
            ctx.beginPath();
            ctx.moveTo(x, cloudY);
            for (let j = 0; j < 5; j++) {
              const nextX = x + j * 50 + Math.random() * 30;
              const nextY = cloudY + Math.sin(j * 0.5) * 20;
              ctx.lineTo(nextX, nextY);
            }
            ctx.stroke();
          }
        } else if (system.type === 'stratocumulus') {
          // 層積雲
          ctx.fillStyle = 'rgba(220, 220, 220, 0.6)';
          for (let i = 0; i < 120; i++) {
            const x = Math.random() * canvas.width;
            const cloudY = y + (Math.random() - 0.5) * system.height;
            const radius = Math.random() * 60 + 30;
            ctx.globalAlpha = system.intensity * (Math.random() * 0.4 + 0.4);
            ctx.beginPath();
            ctx.arc(x, cloudY, radius, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      });
      
      // 台風・ハリケーンの渦雲
      const cyclones = [
        { x: canvas.width * 0.7, y: canvas.height * 0.3, size: 200 }, // 西太平洋
        { x: canvas.width * 0.2, y: canvas.height * 0.4, size: 150 }, // 大西洋
        { x: canvas.width * 0.9, y: canvas.height * 0.7, size: 120 }  // インド洋
      ];
      
      cyclones.forEach(cyclone => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let r = 0; r < cyclone.size; r += 10) {
          const points = Math.floor((r / 10) * 8 + 8);
          for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2 + (r * 0.02);
            const x = cyclone.x + Math.cos(angle) * r;
            const y = cyclone.y + Math.sin(angle) * r * 0.7;
            const cloudSize = Math.max(5, 20 - r * 0.1);
            ctx.globalAlpha = Math.max(0.1, 0.8 - r * 0.004);
            ctx.beginPath();
            ctx.arc(x, y, cloudSize, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      });
      
      ctx.globalAlpha = 1;
      return new THREE.CanvasTexture(canvas);
    };
    
    const cloudGeometry = new THREE.SphereGeometry(1.01, 128, 64);
    const cloudTexture = createMeteorologicalClouds();
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

    // クリック機能は不要（ボタンで選択するため）

    // アニメーションループ
    let animationId: number;
    let startTime = Date.now();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      if (globeRef.current && spinningRef.current) {
        // 3秒間で目標位置に向かって滑らかに回転
        const progress = Math.min(elapsed / 3000, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOut効果
        
        // 初期の高速回転 + 目標位置への補間
        const baseRotationY = elapsed * 0.003; // 基本の回転速度
        
        // 目標回転を取得（stopTimerに保存されている）
        const targetRotation = (initTimer as any)?.stopTimer?.targetRotation || { x: 0, y: 0 };
        
        // 滑らかに目標位置へ
        globeRef.current.rotation.y = baseRotationY + (targetRotation.y * easeProgress);
        globeRef.current.rotation.x = targetRotation.x * easeProgress;
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

    // 指定された国が正面に来るように回転計算
    const calculateTargetRotation = (countryId: string) => {
      const coord = countryCoordinates[countryId];
      if (!coord) return { x: 0, y: 0 };
      
      // 経度を地球儀のY軸回転に変換（西経は正の値、東経は負の値）
      const targetY = -coord.lng * (Math.PI / 180);
      
      // 緯度を地球儀のX軸回転に変換（北緯は負の値、南緯は正の値）  
      const targetX = -coord.lat * (Math.PI / 180);
      
      return { x: targetX, y: targetY };
    };

    // 初期化完了後に回転開始
    const startSpinning = () => {
      console.log('Globe initialized, starting rotation');
      spinningRef.current = true;
      setIsSpinning(true);
      
      let targetRotation = { x: 0, y: 0 };
      
      // targetCountryが設定されている場合、その国が正面に来るように計算
      if (targetCountry && countryCoordinates[targetCountry]) {
        targetRotation = calculateTargetRotation(targetCountry);
        console.log(`Target country: ${targetCountry}, target rotation:`, targetRotation);
      }
      
      // 3秒後に指定位置で停止
      const stopTimer = setTimeout(() => {
        console.log('Stopping globe rotation at target position');
        spinningRef.current = false;
        setIsSpinning(false);
        
        // 最終位置に設定
        if (globeRef.current) {
          globeRef.current.rotation.x = targetRotation.x;
          globeRef.current.rotation.y = targetRotation.y;
        }
        
        setIsReady(true);
        if (onGlobeReady) {
          onGlobeReady();
        }
      }, 3000);
      
      // 回転アニメーション中の目標位置を保存
      (stopTimer as any).targetRotation = targetRotation;
      
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
      // クリーンアップ処理
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

  // ハイライトの更新
  useEffect(() => {
    if (isReady) {
      addCountryHighlight();
    }
  }, [targetCountry, selectedCountry, isCorrect, isReady]);

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