import { useEffect, useState } from 'react';
import { FallbackWorldMap } from './FallbackWorldMap';

interface RealWorldMapProps {
  highlightedCountry?: string;
  selectedCountry?: string;
  isCorrect?: boolean;
  onCountryClick?: (countryId: string) => void;
  options?: string[];
}

interface Country {
  type: 'Feature';
  properties: {
    NAME: string;
    ISO_A2: string;
    ISO_A3: string;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

// 国名とコードのマッピング
const countryCodeMap: { [key: string]: string } = {
  'United States of America': 'US',
  'USA': 'US',
  'United Kingdom': 'GB',
  'China': 'CN',
  'Japan': 'JP',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Russia': 'RU',
  'Canada': 'CA',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Peru': 'PE',
  'Colombia': 'CO',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'India': 'IN',
  'Thailand': 'TH',
  'Indonesia': 'ID',
  'Malaysia': 'MY',
  'Singapore': 'SG',
  'Philippines': 'PH',
  'Vietnam': 'VN',
  'Egypt': 'EG',
  'South Africa': 'ZA',
  'Nigeria': 'NG',
  'Morocco': 'MA',
  'Kenya': 'KE',
  'Saudi Arabia': 'SA',
  'Turkey': 'TR',
  'Israel': 'IL',
  'Poland': 'PL',
  'Netherlands': 'NL',
  'Switzerland': 'CH',
  'Sweden': 'SE',
  'South Korea': 'KR'
};

// 地理座標からSVG座標への変換
function mercatorProjection(longitude: number, latitude: number, width: number, height: number) {
  const x = (longitude + 180) * (width / 360);
  const latRad = (latitude * Math.PI) / 180;
  const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
  const y = (height / 2) - (width * mercN / (2 * Math.PI));
  return [x, y];
}

// 座標配列をSVGパスに変換
function coordinatesToPath(coordinates: any[], width: number, height: number): string {
  if (!coordinates || coordinates.length === 0) return '';

  const pathParts: string[] = [];
  
  function processCoordinateArray(coords: any[]): string {
    if (coords.length === 0) return '';
    
    const points = coords.map(coord => {
      if (Array.isArray(coord) && coord.length >= 2) {
        return mercatorProjection(coord[0], coord[1], width, height);
      }
      return [0, 0];
    });
    
    if (points.length === 0) return '';
    
    let path = `M${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      path += `L${points[i][0]},${points[i][1]}`;
    }
    path += 'Z';
    return path;
  }

  if (coordinates[0] && Array.isArray(coordinates[0][0])) {
    // MultiPolygon or Polygon with holes
    coordinates.forEach(ring => {
      if (Array.isArray(ring[0])) {
        ring.forEach((subRing: any[]) => {
          const path = processCoordinateArray(subRing);
          if (path) pathParts.push(path);
        });
      } else {
        const path = processCoordinateArray(ring);
        if (path) pathParts.push(path);
      }
    });
  } else {
    // Simple coordinate array
    const path = processCoordinateArray(coordinates);
    if (path) pathParts.push(path);
  }
  
  return pathParts.join(' ');
}

export const RealWorldMap = ({ 
  highlightedCountry, 
  selectedCountry, 
  isCorrect,
  onCountryClick,
  options = []
}: RealWorldMapProps) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorldData = async () => {
      try {
        setIsLoading(true);
        
        // 複数のデータソースを試す
        const sources = [
          'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
          'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
          'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
        ];
        
        let data = null;
        let lastError = null;
        
        for (const source of sources) {
          try {
            console.log(`Trying to load from: ${source}`);
            const response = await fetch(source);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const jsonData = await response.json();
            
            // TopoJSONの場合は変換が必要
            if (jsonData.objects && jsonData.objects.countries) {
              // TopoJSON形式 - 簡単な変換を試みる
              console.log('TopoJSON detected, using fallback data');
              throw new Error('TopoJSON format not supported, trying next source');
            }
            
            // GeoJSON形式を確認
            if (jsonData.features && Array.isArray(jsonData.features)) {
              data = jsonData;
              console.log(`Successfully loaded ${jsonData.features.length} countries`);
              break;
            } else {
              throw new Error('Invalid GeoJSON format');
            }
          } catch (err) {
            console.warn(`Failed to load from ${source}:`, err);
            lastError = err;
            continue;
          }
        }
        
        if (!data) {
          throw lastError || new Error('All data sources failed');
        }
        
        setCountries(data.features || []);
        setError(null);
      } catch (err) {
        console.error('World map loading error:', err);
        setError('オンライン地図データを読み込めませんでした。オフライン地図を使用します。');
        
        // フォールバック: 空の配列を設定してフォールバック地図を表示
        setCountries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorldData();
  }, []);

  const getCountryCode = (country: Country): string | null => {
    const name = country.properties.NAME;
    const iso2 = country.properties.ISO_A2;
    
    // ISO_A2が利用可能な場合はそれを使用
    if (iso2 && iso2 !== '-99') {
      return iso2;
    }
    
    // 国名からマッピング
    return countryCodeMap[name] || null;
  };

  const getCountryFill = (country: Country): string => {
    const countryCode = getCountryCode(country);
    
    if (!countryCode) {
      return '#f3f4f6'; // デフォルト色
    }

    if (countryCode === highlightedCountry) {
      if (isCorrect !== undefined) {
        return isCorrect ? '#22c55e' : '#ef4444'; // 正解：緑、不正解：赤
      }
      return '#3b82f6'; // 問題の国：青
    }
    
    if (options.includes(countryCode)) {
      if (countryCode === selectedCountry) {
        return isCorrect ? '#22c55e' : '#ef4444'; // 選択した国
      }
      return '#fbbf24'; // 選択肢の国：黄色
    }
    
    return '#e5e7eb'; // その他の国：薄いグレー
  };

  const getCountryStroke = (country: Country): string => {
    const countryCode = getCountryCode(country);
    
    if (countryCode && (countryCode === highlightedCountry || options.includes(countryCode))) {
      return '#1f2937';
    }
    return '#9ca3af';
  };

  const getCountryStrokeWidth = (country: Country): number => {
    const countryCode = getCountryCode(country);
    
    if (countryCode === highlightedCountry) {
      return 2;
    }
    if (countryCode && options.includes(countryCode)) {
      return 1.5;
    }
    return 0.5;
  };

  const isClickable = (country: Country): boolean => {
    const countryCode = getCountryCode(country);
    return Boolean(countryCode && options.includes(countryCode) && onCountryClick);
  };

  const handleCountryClick = (country: Country) => {
    const countryCode = getCountryCode(country);
    if (countryCode && isClickable(country)) {
      onCountryClick?.(countryCode);
    }
  };

  if (isLoading) {
    return (
      <div className="world-map-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px',
          color: '#4b5563'
        }}>
          🌍 世界地図を読み込んでいます...
        </div>
      </div>
    );
  }

  // エラーがある場合または国データが空の場合はフォールバック地図を使用
  if (error || countries.length === 0) {
    return (
      <FallbackWorldMap 
        highlightedCountry={highlightedCountry}
        selectedCountry={selectedCountry}
        isCorrect={isCorrect}
        onCountryClick={onCountryClick}
        options={options}
      />
    );
  }

  const svgWidth = 1000;
  const svgHeight = 500;

  return (
    <div className="world-map-container">
      <div style={{ 
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#f0f9ff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="100%"
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            display: 'block'
          }}
        >
          {/* 海洋の背景 */}
          <rect width={svgWidth} height={svgHeight} fill="#bfdbfe" />
          
          {countries.map((country, index) => {
            const pathData = coordinatesToPath(
              country.geometry.type === 'MultiPolygon' 
                ? country.geometry.coordinates.flat() 
                : country.geometry.coordinates,
              svgWidth,
              svgHeight
            );

            if (!pathData) return null;

            return (
              <path
                key={index}
                d={pathData}
                fill={getCountryFill(country)}
                stroke={getCountryStroke(country)}
                strokeWidth={getCountryStrokeWidth(country)}
                style={{
                  cursor: isClickable(country) ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => handleCountryClick(country)}
                onMouseEnter={(e) => {
                  if (isClickable(country)) {
                    e.currentTarget.style.opacity = '0.8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable(country)) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                <title>{country.properties.NAME}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="map-legend">
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