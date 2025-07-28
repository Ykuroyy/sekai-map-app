export interface Country {
  id: string;
  name: string;
  nameJa: string;
  region: string;
  subregion: string;
  latlng: [number, number];
  area: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const countries: Country[] = [
  // アジア
  { id: 'JP', name: 'Japan', nameJa: '日本', region: 'Asia', subregion: 'Eastern Asia', latlng: [36, 138], area: 377975, difficulty: 'easy' },
  { id: 'CN', name: 'China', nameJa: '中国', region: 'Asia', subregion: 'Eastern Asia', latlng: [35, 105], area: 9596961, difficulty: 'easy' },
  { id: 'KR', name: 'South Korea', nameJa: '韓国', region: 'Asia', subregion: 'Eastern Asia', latlng: [37, 127.5], area: 100210, difficulty: 'medium' },
  { id: 'IN', name: 'India', nameJa: 'インド', region: 'Asia', subregion: 'Southern Asia', latlng: [20, 77], area: 3287263, difficulty: 'easy' },
  { id: 'TH', name: 'Thailand', nameJa: 'タイ', region: 'Asia', subregion: 'Southeast Asia', latlng: [15, 100], area: 513120, difficulty: 'medium' },
  { id: 'VN', name: 'Vietnam', nameJa: 'ベトナム', region: 'Asia', subregion: 'Southeast Asia', latlng: [16.16, 107.83], area: 331212, difficulty: 'medium' },
  { id: 'ID', name: 'Indonesia', nameJa: 'インドネシア', region: 'Asia', subregion: 'Southeast Asia', latlng: [-5, 120], area: 1904569, difficulty: 'medium' },
  { id: 'MY', name: 'Malaysia', nameJa: 'マレーシア', region: 'Asia', subregion: 'Southeast Asia', latlng: [2.5, 112.5], area: 330803, difficulty: 'hard' },
  { id: 'PH', name: 'Philippines', nameJa: 'フィリピン', region: 'Asia', subregion: 'Southeast Asia', latlng: [13, 122], area: 342353, difficulty: 'medium' },
  { id: 'SG', name: 'Singapore', nameJa: 'シンガポール', region: 'Asia', subregion: 'Southeast Asia', latlng: [1.36, 103.8], area: 728, difficulty: 'hard' },
  
  // ヨーロッパ
  { id: 'GB', name: 'United Kingdom', nameJa: 'イギリス', region: 'Europe', subregion: 'Northern Europe', latlng: [54, -2], area: 242495, difficulty: 'easy' },
  { id: 'FR', name: 'France', nameJa: 'フランス', region: 'Europe', subregion: 'Western Europe', latlng: [46, 2], area: 551695, difficulty: 'easy' },
  { id: 'DE', name: 'Germany', nameJa: 'ドイツ', region: 'Europe', subregion: 'Western Europe', latlng: [51, 9], area: 357114, difficulty: 'easy' },
  { id: 'IT', name: 'Italy', nameJa: 'イタリア', region: 'Europe', subregion: 'Southern Europe', latlng: [42.83, 12.83], area: 301336, difficulty: 'easy' },
  { id: 'ES', name: 'Spain', nameJa: 'スペイン', region: 'Europe', subregion: 'Southern Europe', latlng: [40, -4], area: 505992, difficulty: 'easy' },
  { id: 'RU', name: 'Russia', nameJa: 'ロシア', region: 'Europe', subregion: 'Eastern Europe', latlng: [60, 100], area: 17098242, difficulty: 'easy' },
  { id: 'PL', name: 'Poland', nameJa: 'ポーランド', region: 'Europe', subregion: 'Eastern Europe', latlng: [52, 20], area: 312679, difficulty: 'medium' },
  { id: 'NL', name: 'Netherlands', nameJa: 'オランダ', region: 'Europe', subregion: 'Western Europe', latlng: [52.5, 5.75], area: 41850, difficulty: 'medium' },
  { id: 'CH', name: 'Switzerland', nameJa: 'スイス', region: 'Europe', subregion: 'Western Europe', latlng: [47, 8], area: 41284, difficulty: 'medium' },
  { id: 'SE', name: 'Sweden', nameJa: 'スウェーデン', region: 'Europe', subregion: 'Northern Europe', latlng: [62, 15], area: 450295, difficulty: 'medium' },
  
  // 北アメリカ
  { id: 'US', name: 'United States', nameJa: 'アメリカ', region: 'Americas', subregion: 'Northern America', latlng: [38, -97], area: 9833517, difficulty: 'easy' },
  { id: 'CA', name: 'Canada', nameJa: 'カナダ', region: 'Americas', subregion: 'Northern America', latlng: [60, -95], area: 9984670, difficulty: 'easy' },
  { id: 'MX', name: 'Mexico', nameJa: 'メキシコ', region: 'Americas', subregion: 'Central America', latlng: [23, -102], area: 1964375, difficulty: 'easy' },
  
  // 南アメリカ
  { id: 'BR', name: 'Brazil', nameJa: 'ブラジル', region: 'Americas', subregion: 'South America', latlng: [-10, -55], area: 8515767, difficulty: 'easy' },
  { id: 'AR', name: 'Argentina', nameJa: 'アルゼンチン', region: 'Americas', subregion: 'South America', latlng: [-34, -64], area: 2780400, difficulty: 'medium' },
  { id: 'CL', name: 'Chile', nameJa: 'チリ', region: 'Americas', subregion: 'South America', latlng: [-30, -71], area: 756102, difficulty: 'easy' },
  { id: 'PE', name: 'Peru', nameJa: 'ペルー', region: 'Americas', subregion: 'South America', latlng: [-10, -76], area: 1285216, difficulty: 'medium' },
  { id: 'CO', name: 'Colombia', nameJa: 'コロンビア', region: 'Americas', subregion: 'South America', latlng: [4, -72], area: 1141748, difficulty: 'medium' },
  
  // アフリカ
  { id: 'EG', name: 'Egypt', nameJa: 'エジプト', region: 'Africa', subregion: 'Northern Africa', latlng: [27, 30], area: 1002450, difficulty: 'easy' },
  { id: 'ZA', name: 'South Africa', nameJa: '南アフリカ', region: 'Africa', subregion: 'Southern Africa', latlng: [-29, 24], area: 1221037, difficulty: 'medium' },
  { id: 'NG', name: 'Nigeria', nameJa: 'ナイジェリア', region: 'Africa', subregion: 'Western Africa', latlng: [10, 8], area: 923768, difficulty: 'hard' },
  { id: 'KE', name: 'Kenya', nameJa: 'ケニア', region: 'Africa', subregion: 'Eastern Africa', latlng: [-1, 38], area: 580367, difficulty: 'medium' },
  { id: 'MA', name: 'Morocco', nameJa: 'モロッコ', region: 'Africa', subregion: 'Northern Africa', latlng: [32, -5], area: 446550, difficulty: 'medium' },
  
  // オセアニア
  { id: 'AU', name: 'Australia', nameJa: 'オーストラリア', region: 'Oceania', subregion: 'Australia and New Zealand', latlng: [-27, 133], area: 7692024, difficulty: 'easy' },
  { id: 'NZ', name: 'New Zealand', nameJa: 'ニュージーランド', region: 'Oceania', subregion: 'Australia and New Zealand', latlng: [-41, 174], area: 270467, difficulty: 'easy' },
  
  // 中東
  { id: 'SA', name: 'Saudi Arabia', nameJa: 'サウジアラビア', region: 'Asia', subregion: 'Western Asia', latlng: [25, 45], area: 2149690, difficulty: 'medium' },
  { id: 'TR', name: 'Turkey', nameJa: 'トルコ', region: 'Asia', subregion: 'Western Asia', latlng: [39, 35], area: 783562, difficulty: 'medium' },
  { id: 'IL', name: 'Israel', nameJa: 'イスラエル', region: 'Asia', subregion: 'Western Asia', latlng: [31, 35], area: 20770, difficulty: 'hard' },
];

export function getRandomCountries(count: number, excludeId?: string): Country[] {
  const availableCountries = excludeId 
    ? countries.filter(c => c.id !== excludeId)
    : countries;
  
  const shuffled = [...availableCountries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCountryById(id: string): Country | undefined {
  return countries.find(c => c.id === id);
}