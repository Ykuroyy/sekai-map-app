import { worldMapPaths, worldMapViewBox, type CountryPath } from '../data/worldMapSvg';

interface WorldMapProps {
  highlightedCountry?: string;
  selectedCountry?: string;
  isCorrect?: boolean;
  onCountryClick?: (countryId: string) => void;
  options?: string[];
}

export const WorldMap = ({ 
  highlightedCountry, 
  selectedCountry, 
  isCorrect,
  onCountryClick,
  options = []
}: WorldMapProps) => {
  const getCountryFill = (countryId: string) => {
    if (countryId === highlightedCountry) {
      if (isCorrect !== undefined) {
        return isCorrect ? '#22c55e' : '#ef4444'; // 正解：緑、不正解：赤
      }
      return '#3b82f6'; // 問題の国：青
    }
    
    if (options.includes(countryId)) {
      if (countryId === selectedCountry) {
        return isCorrect ? '#22c55e' : '#ef4444'; // 選択した国
      }
      return '#e5e7eb'; // 選択肢の国：薄いグレー
    }
    
    return '#f3f4f6'; // その他の国：非常に薄いグレー
  };

  const getCountryStroke = (countryId: string) => {
    if (countryId === highlightedCountry || options.includes(countryId)) {
      return '#1f2937';
    }
    return '#d1d5db';
  };

  const isClickable = (countryId: string) => {
    return options.includes(countryId) && onCountryClick;
  };

  return (
    <div className="world-map-container">
      <svg
        viewBox={worldMapViewBox}
        width="100%"
        height="100%"
        style={{ 
          maxWidth: '800px', 
          maxHeight: '500px',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}
      >
        {worldMapPaths.map((country: CountryPath) => (
          <path
            key={country.id}
            d={country.path}
            fill={getCountryFill(country.id)}
            stroke={getCountryStroke(country.id)}
            strokeWidth="1"
            style={{
              cursor: isClickable(country.id) ? 'pointer' : 'default',
              transition: 'fill 0.3s, stroke 0.3s',
            }}
            onClick={() => {
              if (isClickable(country.id)) {
                onCountryClick?.(country.id);
              }
            }}
            onMouseEnter={(e) => {
              if (isClickable(country.id)) {
                e.currentTarget.style.opacity = '0.8';
              }
            }}
            onMouseLeave={(e) => {
              if (isClickable(country.id)) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            <title>{country.name}</title>
          </path>
        ))}
      </svg>
    </div>
  );
};