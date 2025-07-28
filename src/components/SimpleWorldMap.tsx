import { useEffect, useRef } from 'react';
import { worldMapSvg, countryNameMap } from '../data/worldMapData';

interface SimpleWorldMapProps {
  highlightedCountry?: string;
  selectedCountry?: string;
  isCorrect?: boolean;
  onCountryClick?: (countryId: string) => void;
  options?: string[];
}

export const SimpleWorldMap = ({ 
  highlightedCountry, 
  selectedCountry, 
  isCorrect,
  onCountryClick,
  options = []
}: SimpleWorldMapProps) => {
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    // SVGを挿入
    svgRef.current.innerHTML = worldMapSvg;
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;

    // スタイルを設定
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.maxWidth = '100%';
    svg.style.border = '2px solid #e5e7eb';
    svg.style.borderRadius = '8px';
    svg.style.backgroundColor = '#f0f9ff';
    
    // 各国のパスを取得
    const paths = svg.querySelectorAll('path[id]');
    
    paths.forEach((path) => {
      const countryId = path.id;
      const countryInfo = countryNameMap[countryId];
      
      if (!countryInfo) return;
      
      // ツールチップ用のtitle要素を追加
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = countryInfo.nameJa;
      path.appendChild(title);
      
      // 色の設定
      let fill = '#e5e7eb'; // デフォルト色（薄いグレー）
      let stroke = '#9ca3af';
      let strokeWidth = '0.5';
      let cursor = 'default';
      
      if (countryId === highlightedCountry) {
        if (isCorrect !== undefined) {
          fill = isCorrect ? '#22c55e' : '#ef4444'; // 正解：緑、不正解：赤
        } else {
          fill = '#3b82f6'; // 問題の国：青
        }
        stroke = '#1f2937';
        strokeWidth = '2';
      } else if (options.includes(countryId)) {
        if (countryId === selectedCountry) {
          fill = isCorrect ? '#22c55e' : '#ef4444'; // 選択した国
        } else {
          fill = '#fbbf24'; // 選択肢の国：黄色
        }
        stroke = '#1f2937';
        strokeWidth = '1.5';
        cursor = 'pointer';
      }
      
      // スタイルを適用
      (path as SVGPathElement).style.fill = fill;
      (path as SVGPathElement).style.stroke = stroke;
      (path as SVGPathElement).style.strokeWidth = strokeWidth;
      (path as SVGPathElement).style.cursor = cursor;
      (path as SVGPathElement).style.transition = 'fill 0.3s, stroke 0.3s';
      
      // クリックイベント
      if (options.includes(countryId) && onCountryClick) {
        const handleClick = () => onCountryClick(countryId);
        const handleMouseEnter = () => {
          (path as SVGPathElement).style.opacity = '0.8';
        };
        const handleMouseLeave = () => {
          (path as SVGPathElement).style.opacity = '1';
        };
        
        path.addEventListener('click', handleClick);
        path.addEventListener('mouseenter', handleMouseEnter);
        path.addEventListener('mouseleave', handleMouseLeave);
        
        // クリーンアップ
        return () => {
          path.removeEventListener('click', handleClick);
          path.removeEventListener('mouseenter', handleMouseEnter);
          path.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    });
  }, [highlightedCountry, selectedCountry, isCorrect, options, onCountryClick]);

  return (
    <div className="world-map-container">
      <div ref={svgRef}></div>
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