import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import type { Globe3DProps, CountryCoordinates } from '../types/globe';
import {
  createRealEarthTexture,
  createMeteorologicalClouds,
  createDetailedNormalMap,
  createHeightMap,
  createCityLightsTexture,
  createStarField
} from '../utils/textureGenerators';
import {
  calculateTargetRotation,
  setupLighting,
  createAtmosphere,
  createCountryHighlight,
  setupRenderer,
  setupCamera,
  createResizeHandler
} from '../utils/globe3dUtils';

// 国の座標データ（緯度経度）
const countryCoordinates: CountryCoordinates = {
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
  // Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);
  const spinningRef = useRef<boolean>(false);
  
  // State
  const [isSpinning, setIsSpinning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [frontCountry, setFrontCountry] = useState<string>('');

  // 正面の国を検出する関数（改良版）
  const detectFrontCountry = useCallback(() => {
    if (!globeRef.current || !isReady) return;
    
    const globe = globeRef.current;
    let closestCountry = '';
    let maxDotProduct = -1; // 最大のドット積（最も正面に近い）
    
    // カメラの正面方向ベクトル
    const cameraDirection = new THREE.Vector3(0, 0, -1);
    
    // 各国の位置をチェック
    Object.entries(countryCoordinates).forEach(([countryId, coord]) => {
      // 国の3D位置を計算（地球座標系）
      const phi = (90 - coord.lat) * (Math.PI / 180);
      const theta = (coord.lng + 180) * (Math.PI / 180);
      
      const x = -Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      
      const countryPosition = new THREE.Vector3(x, y, z);
      
      // 地球儀の回転を適用
      countryPosition.applyEuler(globe.rotation);
      
      // カメラ方向とのドット積を計算（-Z方向が正面）
      const dotProduct = cameraDirection.dot(countryPosition);
      
      // 最も正面に近い国を検出
      if (dotProduct > maxDotProduct) {
        maxDotProduct = dotProduct;
        closestCountry = countryId;
      }
    });
    
    if (closestCountry && closestCountry !== frontCountry) {
      setFrontCountry(closestCountry);
      console.log('正面の国:', countryCoordinates[closestCountry]?.name);
    }
  }, [isReady, frontCountry]);

  // 国のハイライト更新をメモ化
  const addCountryHighlight = useCallback(() => {
    if (!targetCountry || !markersRef.current) return;
    
    // 既存のハイライトをクリア
    while (markersRef.current.children.length > 0) {
      markersRef.current.remove(markersRef.current.children[0]);
    }
    
    // 新しいハイライトを作成
    const highlight = createCountryHighlight(targetCountry, countryCoordinates, isCorrect);
    if (highlight) {
      markersRef.current.add(highlight.highlight);
      markersRef.current.add(highlight.ring);
    }
  }, [targetCountry, isCorrect]);

  // 重いテクスチャ生成をメモ化してパフォーマンス向上
  const textures = useMemo(() => {
    console.log('Generating textures...');
    const earthTexture = createRealEarthTexture();
    const normalMap = createDetailedNormalMap();
    const heightMap = createHeightMap();
    const nightTexture = createCityLightsTexture();
    
    // テクスチャ設定を最適化
    [earthTexture, normalMap, heightMap, nightTexture].forEach(texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    
    // Earth texture specific settings
    earthTexture.generateMipmaps = true;
    earthTexture.minFilter = THREE.LinearMipmapLinearFilter;
    earthTexture.magFilter = THREE.LinearFilter;
    
    return { earthTexture, normalMap, heightMap, nightTexture };
  }, []); // 空の依存配列でコンポーネント初回マウント時のみ実行

  useEffect(() => {
    if (!mountRef.current) return;

    // シーンの初期化
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // カメラの設定
    const camera = setupCamera(mountRef.current);
    cameraRef.current = camera;

    // レンダラーの設定
    const renderer = setupRenderer(mountRef.current);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);
    
    // 星空背景の作成
    const starField = createStarField();
    scene.add(starField);
    
    // パフォーマンス最適化：ジオメトリの詳細度を適切に調整
    const geometry = new THREE.SphereGeometry(1, 128, 64); // 256,128から128,64に調整してパフォーマンス向上
    
    // メモ化されたテクスチャを使用
    const { earthTexture, normalMap, heightMap, nightTexture } = textures;
    
    // 最高品質のマテリアル（昼夜テクスチャ合成）
    const material = new THREE.MeshStandardMaterial({
      map: earthTexture,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      displacementMap: heightMap,
      displacementScale: 0.02,
      emissiveMap: nightTexture,
      emissiveIntensity: 0.3,
      roughness: 0.7,
      metalness: 0.05,
      envMapIntensity: 0.4,
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
    createAtmosphere(scene);
    
    
    // 雲ジオメトリのパフォーマンス最適化
    const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 32); // さらなる最適化
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
    setupLighting(scene);

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
      
      // 正面の国を検出（回転停止後）
      if (!spinningRef.current && isReady) {
        detectFrontCountry();
      }

      renderer.render(scene, camera);
    };
    animate();

    // リサイズハンドラー
    const handleResize = createResizeHandler(camera, renderer, mountRef.current);
    window.addEventListener('resize', handleResize);

    // 初期化完了後に回転開始
    const startSpinning = () => {
      console.log('Globe initialized, starting rotation');
      spinningRef.current = true;
      setIsSpinning(true);
      
      let targetRotation = { x: 0, y: 0 };
      
      // targetCountryが設定されている場合、その国が正面に来るように計算
      if (targetCountry && countryCoordinates[targetCountry]) {
        targetRotation = calculateTargetRotation(targetCountry, countryCoordinates);
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
        
        // ターゲット国が設定されている場合、それを正面国として表示
        if (targetCountry) {
          setFrontCountry(targetCountry);
        }
        
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
  }, [onGlobeReady, textures]);

  // ハイライトの更新
  useEffect(() => {
    if (isReady) {
      addCountryHighlight();
    }
  }, [targetCountry, selectedCountry, isCorrect, isReady]);

  return (
    <div className="globe-container" style={{ position: 'relative' }}>
      {/* 正面の国指示 */}
      {!isSpinning && isReady && (
        <div className="front-country-label">
          {frontCountry ? (
            <>🌎 この国はどこでしょう？</>
          ) : (
            <>🌎 正面の国を探しています...</>
          )}
        </div>
      )}
      
      {/* 十字線（クロスヘア） */}
      {!isSpinning && (
        <>
          <div className="crosshair-vertical" />
          <div className="crosshair-horizontal" />
        </>
      )}
      
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
      
      {/* 正面国名表示エリア */}
      {frontCountry && !isSpinning && isReady && (
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: '12px',
          border: '2px solid #3b82f6',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
        }}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            正面の国
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#3b82f6',
            padding: '0.5rem 1rem',
            background: 'white',
            borderRadius: '8px',
            display: 'inline-block',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {countryCoordinates[frontCountry]?.name || '不明'}
          </div>
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