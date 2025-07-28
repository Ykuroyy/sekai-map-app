// 実際の地球データと地理的計算関数

export interface LandColor {
  r: number;
  g: number;
  b: number;
}

export interface OceanColor {
  r: number;
  g: number;
  b: number;
}

// 陸地判定関数
export const isLandArea = (lat: number, lng: number): boolean => {
  // アフリカ
  if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52) {
    return isInAfrica(lat, lng);
  }
  // ユーラシア大陸
  if (lat >= 10 && lat <= 81 && lng >= -10 && lng <= 180) {
    return isInEurasia(lat, lng);
  }
  // 北アメリカ
  if (lat >= 15 && lat <= 84 && lng >= -168 && lng <= -52) {
    return isInNorthAmerica(lat, lng);
  }
  // 南アメリカ
  if (lat >= -56 && lat <= 13 && lng >= -82 && lng <= -35) {
    return isInSouthAmerica(lat, lng);
  }
  // オーストラリア
  if (lat >= -45 && lat <= -10 && lng >= 112 && lng <= 155) {
    return isInAustralia(lat, lng);
  }
  // 南極大陸
  if (lat <= -60) {
    return true;
  }
  // グリーンランド
  if (lat >= 60 && lat <= 84 && lng >= -73 && lng <= -12) {
    return true;
  }
  return false;
};

const isInAfrica = (lat: number, lng: number): boolean => {
  // サハラ砂漠（北アフリカ）
  if (lat >= 15 && lat <= 30 && lng >= -18 && lng <= 40) return true;
  // 中央アフリカ
  if (lat >= -5 && lat <= 15 && lng >= 8 && lng <= 45) return true;
  // 南アフリカ
  if (lat >= -35 && lat <= -5 && lng >= 12 && lng <= 40) return true;
  // 東アフリカ
  if (lat >= -12 && lat <= 18 && lng >= 25 && lng <= 52) return true;
  return false;
};

const isInEurasia = (lat: number, lng: number): boolean => {
  // ヨーロッパ
  if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 60) return true;
  // シベリア
  if (lat >= 50 && lat <= 81 && lng >= 60 && lng <= 180) return true;
  // 中央アジア
  if (lat >= 35 && lat <= 55 && lng >= 45 && lng <= 90) return true;
  // 中国
  if (lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135) return true;
  // インド亜大陸
  if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) return true;
  // 東南アジア
  if (lat >= -11 && lat <= 28 && lng >= 92 && lng <= 141) return true;
  // 日本列島
  if (lat >= 24 && lat <= 46 && lng >= 123 && lng <= 146) return true;
  return false;
};

const isInNorthAmerica = (lat: number, lng: number): boolean => {
  // カナダ
  if (lat >= 42 && lat <= 84 && lng >= -141 && lng <= -52) return true;
  // アメリカ本土
  if (lat >= 25 && lat <= 49 && lng >= -125 && lng <= -67) return true;
  // メキシコ
  if (lat >= 15 && lat <= 32 && lng >= -117 && lng <= -86) return true;
  // アラスカ
  if (lat >= 55 && lat <= 71 && lng >= -168 && lng <= -130) return true;
  return false;
};

const isInSouthAmerica = (lat: number, lng: number): boolean => {
  // ブラジル
  if (lat >= -34 && lat <= 5 && lng >= -74 && lng <= -35) return true;
  // アルゼンチン・チリ
  if (lat >= -56 && lat <= -22 && lng >= -74 && lng <= -53) return true;
  // 北部（コロンビア・ベネズエラ）
  if (lat >= -5 && lat <= 13 && lng >= -82 && lng <= -60) return true;
  return false;
};

const isInAustralia = (lat: number, lng: number): boolean => {
  // オーストラリア本土
  if (lat >= -39 && lat <= -10 && lng >= 112 && lng <= 154) return true;
  // タスマニア
  if (lat >= -44 && lat <= -40 && lng >= 144 && lng <= 149) return true;
  return false;
};

export type LandType = 'ice' | 'desert' | 'forest' | 'grassland';

export const getLandType = (lat: number, lng: number): LandType => {
  // 氷雪地帯
  if (lat > 66 || lat < -60) return 'ice';
  // 砂漠地帯
  if ((lat >= 15 && lat <= 35 && lng >= -18 && lng <= 50) || // サハラ
      (lat >= 25 && lat <= 45 && lng >= 40 && lng <= 80) || // 中央アジア砂漠
      (lat >= -30 && lat <= -15 && lng >= 112 && lng <= 140)) return 'desert'; // オーストラリア内陸
  // 森林地帯
  if ((lat >= -10 && lat <= 10 && lng >= -70 && lng <= -45) || // アマゾン
      (lat >= 45 && lat <= 70 && lng >= -180 && lng <= 180) || // タイガ
      (lat >= -5 && lat <= 5 && lng >= 10 && lng <= 30)) return 'forest'; // コンゴ盆地
  // 草原・農地
  return 'grassland';
};

export const getLandColor = (landType: LandType, lat: number, lng: number): LandColor => {
  const variation = Math.sin(lat * 0.1) * Math.cos(lng * 0.1) * 20;
  
  switch (landType) {
    case 'ice':
      return { r: 248 + variation, g: 248 + variation, b: 255 };
    case 'desert':
      return { r: 238 + variation, g: 203 + variation, b: 173 };
    case 'forest':
      return { r: 34 + variation, g: 139 + variation, b: 34 };
    case 'grassland':
      return { r: 154 + variation, g: 205 + variation, b: 50 };
    default:
      return { r: 139, g: 69, b: 19 };
  }
};

export const getOceanColor = (lat: number, lng: number): OceanColor => {
  // 水温による色の変化
  const tempFactor = Math.cos(lat * Math.PI / 180);
  // 深度による色の変化
  const depth = Math.sin(lng * 0.05) * Math.cos(lat * 0.05) * 30 + 100;
  const depthFactor = Math.min(1, depth / 200);
  
  const baseR = 0 + tempFactor * 30;
  const baseG = 105 + tempFactor * 40;  
  const baseB = 148 + tempFactor * 50;
  
  return {
    r: baseR * (1 - depthFactor * 0.5),
    g: baseG * (1 - depthFactor * 0.3),
    b: baseB * (1 - depthFactor * 0.2)
  };
};

// 主要都市データ
export interface CityData {
  lat: number;
  lng: number;
  intensity: number;
  size: number;
}

export const majorCities: CityData[] = [
  // 東京
  { lat: 35.6762, lng: 139.6503, intensity: 0.9, size: 25 },
  // ニューヨーク
  { lat: 40.7128, lng: -74.0060, intensity: 0.8, size: 20 },
  // ロンドン
  { lat: 51.5074, lng: -0.1278, intensity: 0.7, size: 18 },
  // パリ
  { lat: 48.8566, lng: 2.3522, intensity: 0.7, size: 18 },
  // 上海
  { lat: 31.2304, lng: 121.4737, intensity: 0.8, size: 22 },
  // ロサンゼルス
  { lat: 34.0522, lng: -118.2437, intensity: 0.7, size: 25 },
  // ムンバイ
  { lat: 19.0760, lng: 72.8777, intensity: 0.6, size: 20 },
  // サンパウロ
  { lat: -23.5505, lng: -46.6333, intensity: 0.6, size: 22 },
  // モスクワ
  { lat: 55.7558, lng: 37.6176, intensity: 0.6, size: 18 },
  // カイロ
  { lat: 30.0444, lng: 31.2357, intensity: 0.5, size: 15 }
];