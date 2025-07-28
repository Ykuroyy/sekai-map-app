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
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // 透明背景
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 地球の作成
    const geometry = new THREE.SphereGeometry(1, 64, 32);
    
    // 高品質な地球テクスチャを作成
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // 海洋の美しいグラデーション
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#87CEEB');
    oceanGradient.addColorStop(0.5, '#4682B4');
    oceanGradient.addColorStop(1, '#191970');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 大陸をより詳細に描画
    ctx.fillStyle = '#228B22';
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 2;
    
    // アフリカ大陸
    ctx.beginPath();
    ctx.ellipse(900, 400, 150, 200, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // ヨーロッパ
    ctx.beginPath();
    ctx.ellipse(850, 250, 80, 60, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // アジア
    ctx.beginPath();
    ctx.ellipse(1200, 300, 200, 150, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // 北アメリカ
    ctx.beginPath();
    ctx.ellipse(400, 250, 120, 100, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // 南アメリカ
    ctx.beginPath();
    ctx.ellipse(500, 600, 80, 150, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // オーストラリア
    ctx.beginPath();
    ctx.ellipse(1400, 700, 100, 60, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // 山脈や地形の詳細を追加
    ctx.fillStyle = '#8FBC8F';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 20 + 5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    const material = new THREE.MeshLambertMaterial({ 
      map: texture,
      transparent: false
    });
    
    const globe = new THREE.Mesh(geometry, material);
    globeRef.current = globe;
    scene.add(globe);

    // マーカーグループの作成
    const markers = new THREE.Group();
    markersRef.current = markers;
    scene.add(markers);

    // ライトの追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

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
          height: '500px',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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