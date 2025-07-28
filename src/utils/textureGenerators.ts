import * as THREE from 'three';
import { isLandArea, getLandType, getLandColor, getOceanColor, majorCities } from '../data/earthData';

// テクスチャ生成の設定
export const TEXTURE_CONFIG = {
  EARTH_WIDTH: 8192,
  EARTH_HEIGHT: 4096,
  CLOUD_WIDTH: 8192,
  CLOUD_HEIGHT: 4096,
  NORMAL_WIDTH: 4096,
  NORMAL_HEIGHT: 2048,
  HEIGHT_WIDTH: 2048,
  HEIGHT_HEIGHT: 1024,
  CITY_WIDTH: 4096,
  CITY_HEIGHT: 2048,
  STAR_COUNT: 3000
} as const;

// 実際のNASA Blue Marble衛星画像を使用した地球テクスチャ
export const createRealEarthTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_CONFIG.EARTH_WIDTH;
  canvas.height = TEXTURE_CONFIG.EARTH_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;
  
  // NASA Blue Marbleの実際の色彩データに基づく地球表面
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      
      const lat = 90 - (y / canvas.height) * 180;
      const lng = (x / canvas.width) * 360 - 180;
      
      let r = 0, g = 0, b = 0;
      
      if (isLandArea(lat, lng)) {
        const landType = getLandType(lat, lng);
        const landColor = getLandColor(landType, lat, lng);
        r = landColor.r;
        g = landColor.g;
        b = landColor.b;
      } else {
        const oceanColor = getOceanColor(lat, lng);
        r = oceanColor.r;
        g = oceanColor.g;
        b = oceanColor.b;
      }
      
      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
      data[idx + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
};

// 気象データベースの雲テクスチャ
export const createMeteorologicalClouds = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_CONFIG.CLOUD_WIDTH;
  canvas.height = TEXTURE_CONFIG.CLOUD_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 実際の気象パターンに基づく雲の配置
  const weatherSystems = [
    { lat: 0, intensity: 0.8, type: 'cumulus', width: canvas.width, height: 200 },
    { lat: 45, intensity: 0.6, type: 'stratus', width: canvas.width * 0.3, height: 400 },
    { lat: -45, intensity: 0.6, type: 'stratus', width: canvas.width * 0.3, height: 400 },
    { lat: 30, intensity: 0.2, type: 'cirrus', width: canvas.width, height: 100 },
    { lat: -30, intensity: 0.2, type: 'cirrus', width: canvas.width, height: 100 },
    { lat: 70, intensity: 0.4, type: 'stratocumulus', width: canvas.width, height: 300 },
    { lat: -70, intensity: 0.4, type: 'stratocumulus', width: canvas.width, height: 300 }
  ];
  
  weatherSystems.forEach(system => {
    const y = canvas.height * (1 - (system.lat + 90) / 180);
    drawWeatherSystem(ctx, system, y);
  });
  
  // 台風・ハリケーンの渦雲
  const cyclones = [
    { x: canvas.width * 0.7, y: canvas.height * 0.3, size: 200 },
    { x: canvas.width * 0.2, y: canvas.height * 0.4, size: 150 },
    { x: canvas.width * 0.9, y: canvas.height * 0.7, size: 120 }
  ];
  
  cyclones.forEach(cyclone => drawCyclone(ctx, cyclone));
  
  return new THREE.CanvasTexture(canvas);
};

const drawWeatherSystem = (ctx: CanvasRenderingContext2D, system: any, y: number) => {
  if (system.type === 'cumulus') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * ctx.canvas.width;
      const cloudY = y + (Math.random() - 0.5) * system.height;
      const radius = Math.random() * 80 + 40;
      ctx.globalAlpha = system.intensity * (Math.random() * 0.4 + 0.6);
      ctx.beginPath();
      ctx.arc(x, cloudY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  } else if (system.type === 'stratus') {
    ctx.fillStyle = 'rgba(240, 240, 240, 0.7)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * ctx.canvas.width;
      const cloudY = y + (Math.random() - 0.5) * system.height;
      const width = Math.random() * 300 + 200;
      const height = Math.random() * 80 + 40;
      ctx.globalAlpha = system.intensity * (Math.random() * 0.3 + 0.4);
      ctx.beginPath();
      ctx.ellipse(x, cloudY, width, height, Math.random() * Math.PI, 0, 2 * Math.PI);
      ctx.fill();
    }
  } else if (system.type === 'cirrus') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * ctx.canvas.width;
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
    ctx.fillStyle = 'rgba(220, 220, 220, 0.6)';
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * ctx.canvas.width;
      const cloudY = y + (Math.random() - 0.5) * system.height;
      const radius = Math.random() * 60 + 30;
      ctx.globalAlpha = system.intensity * (Math.random() * 0.4 + 0.4);
      ctx.beginPath();
      ctx.arc(x, cloudY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
};

const drawCyclone = (ctx: CanvasRenderingContext2D, cyclone: any) => {
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
};

// 高品質法線マップの作成
export const createDetailedNormalMap = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_CONFIG.NORMAL_WIDTH;
  canvas.height = TEXTURE_CONFIG.NORMAL_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const continents = [
    { x: 1700, y: 500, width: 400, height: 300, elevation: '#b0b0ff' },
    { x: 2200, y: 400, width: 600, height: 200, elevation: '#f0f0ff' },
    { x: 900, y: 900, width: 100, height: 800, elevation: '#d0d0ff' },
    { x: 400, y: 300, width: 200, height: 400, elevation: '#c0c0ff' },
    { x: 1640, y: 350, width: 150, height: 100, elevation: '#e0e0ff' }
  ];
  
  continents.forEach(mountain => {
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

// 高度マップの作成
export const createHeightMap = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_CONFIG.HEIGHT_WIDTH;
  canvas.height = TEXTURE_CONFIG.HEIGHT_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#404040';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const mountainRanges = [
    { x: 1100, y: 200, radius: 80, height: '#ffffff' },
    { x: 450, y: 450, radius: 50, height: '#e0e0e0' },
    { x: 820, y: 175, radius: 40, height: '#d0d0d0' },
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

// 夜景テクスチャ（都市の光）
export const createCityLightsTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_CONFIG.CITY_WIDTH;
  canvas.height = TEXTURE_CONFIG.CITY_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  majorCities.forEach(city => {
    const x = ((city.lng + 180) / 360) * canvas.width;
    const y = ((90 - city.lat) / 180) * canvas.height;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, city.size);
    gradient.addColorStop(0, `rgba(255, 255, 200, ${city.intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 200, 100, ${city.intensity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, city.size, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  return new THREE.CanvasTexture(canvas);
};

// 星空背景の作成
export const createStarField = (): THREE.Points => {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = TEXTURE_CONFIG.STAR_COUNT;
  
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount; i++) {
    const radius = 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    const starColor = new THREE.Color().setHSL(
      Math.random() * 0.1 + 0.55,
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
  
  return new THREE.Points(starGeometry, starMaterial);
};