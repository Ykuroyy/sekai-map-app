import { useEffect, useRef } from 'react';

interface DetailedWorldMapProps {
  highlightedCountry?: string;
  selectedCountry?: string;
  isCorrect?: boolean;
  onCountryClick?: (countryId: string) => void;
  options?: string[];
}

const worldMapSvg = `
<svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
  <!-- 海洋の背景 -->
  <rect width="1000" height="500" fill="#a7c7e8" />
  
  <!-- 北アメリカ -->
  <!-- カナダ -->
  <path id="CA" d="M50 60 L380 40 L390 50 L410 45 L420 55 L400 65 L390 70 L380 75 L370 80 L350 85 L330 80 L310 85 L290 80 L270 85 L250 80 L230 85 L210 80 L190 85 L170 80 L150 85 L130 80 L110 85 L90 80 L70 85 L50 80 Z" fill="#d4e6b7" stroke="#2d3748" stroke-width="1"/>
  
  <!-- アメリカ -->
  <path id="US" d="M70 80 L380 75 L380 130 L370 135 L360 140 L350 135 L340 140 L330 135 L320 140 L310 135 L300 140 L290 135 L280 140 L270 135 L260 140 L250 135 L240 140 L230 135 L220 140 L210 135 L200 140 L190 135 L180 140 L170 135 L160 140 L150 135 L140 140 L130 135 L120 140 L110 135 L100 140 L90 135 L80 140 L70 135 Z" fill="#d4e6b7" stroke="#2d3748" stroke-width="1"/>
  
  <!-- アラスカ -->
  <path id="US-AK" d="M30 80 L60 75 L65 85 L60 95 L55 100 L50 95 L45 100 L40 95 L35 100 L30 95 Z" fill="#d4e6b7" stroke="#2d3748" stroke-width="1"/>
  
  <!-- メキシコ -->
  <path id="MX" d="M70 135 L220 140 L230 150 L225 160 L220 165 L210 170 L200 165 L190 170 L180 165 L170 170 L160 165 L150 170 L140 165 L130 170 L120 165 L110 170 L100 165 L90 170 L80 165 L70 160 Z" fill="#d4e6b7" stroke="#2d3748" stroke-width="1"/>
  
  <!-- 南アメリカ -->
  <!-- ブラジル -->
  <path id="BR" d="M280 200 L360 205 L380 220 L390 250 L385 280 L380 310 L370 340 L350 360 L330 370 L310 375 L290 370 L270 375 L250 370 L230 375 L210 370 L200 340 L195 310 L200 280 L205 250 L220 220 L240 205 L260 200 Z" fill="#c6e2a4" stroke="#2d3748" stroke-width="1"/>
  
  <!-- アルゼンチン -->
  <path id="AR" d="M250 370 L300 375 L310 390 L315 420 L310 450 L305 480 L295 490 L285 485 L275 490 L265 485 L255 490 L245 485 L240 470 L235 440 L240 410 L245 380 Z" fill="#c6e2a4" stroke="#2d3748" stroke-width="1"/>
  
  <!-- チリ -->
  <path id="CL" d="M210 350 L240 355 L245 370 L240 400 L245 430 L240 460 L245 490 L235 500 L225 495 L220 480 L215 450 L220 420 L215 390 L220 360 Z" fill="#c6e2a4" stroke="#2d3748" stroke-width="1"/>
  
  <!-- ペルー -->
  <path id="PE" d="M200 250 L250 255 L260 270 L255 290 L250 310 L245 330 L240 340 L230 335 L220 340 L210 335 L200 340 L195 320 L200 300 L195 280 L200 260 Z" fill="#c6e2a4" stroke="#2d3748" stroke-width="1"/>
  
  <!-- コロンビア -->
  <path id="CO" d="M200 200 L250 205 L260 220 L255 240 L250 255 L245 260 L235 255 L225 260 L215 255 L205 260 L195 255 L190 235 L195 215 Z" fill="#c6e2a4" stroke="#2d3748" stroke-width="1"/>
  
  <!-- ヨーロッパ -->
  <!-- イギリス -->
  <path id="GB" d="M460 100 L480 95 L485 105 L480 115 L475 125 L470 135 L465 130 L460 120 L455 110 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- フランス -->
  <path id="FR" d="M470 130 L500 135 L510 150 L505 165 L495 175 L485 170 L475 175 L465 170 L460 155 L465 140 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- ドイツ -->
  <path id="DE" d="M500 120 L520 125 L525 140 L520 155 L515 170 L505 175 L495 170 L490 155 L485 140 L490 125 L495 120 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- イタリア -->
  <path id="IT" d="M500 165 L515 170 L520 185 L515 200 L510 215 L515 230 L520 245 L515 255 L510 250 L505 235 L500 220 L495 205 L490 190 L485 175 L490 170 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- スペイン -->
  <path id="ES" d="M440 160 L485 165 L490 180 L485 195 L480 205 L465 210 L450 205 L435 200 L430 185 L435 170 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- ロシア -->
  <path id="RU" d="M520 60 L800 40 L810 50 L820 55 L830 60 L820 70 L810 75 L800 80 L790 85 L780 80 L770 85 L760 80 L750 85 L740 80 L730 85 L720 80 L710 85 L700 80 L690 85 L680 80 L670 85 L660 80 L650 85 L640 80 L630 85 L620 80 L610 85 L600 80 L590 85 L580 80 L570 85 L560 80 L550 85 L540 80 L530 85 L520 80 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- ポーランド -->
  <path id="PL" d="M520 140 L545 145 L550 160 L545 175 L535 180 L525 175 L520 160 L515 145 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- オランダ -->
  <path id="NL" d="M485 120 L500 125 L503 135 L498 145 L488 148 L483 138 L485 128 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- スイス -->
  <path id="CH" d="M490 150 L505 155 L508 165 L503 175 L493 178 L488 168 L490 158 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- スウェーデン -->
  <path id="SE" d="M510 70 L530 75 L535 95 L530 115 L525 125 L520 120 L515 100 L510 80 Z" fill="#f4d03f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- アジア -->
  <!-- 中国 -->
  <path id="CN" d="M650 120 L750 115 L770 130 L780 150 L775 170 L770 190 L760 210 L745 220 L725 215 L705 220 L685 215 L665 220 L645 215 L630 200 L625 180 L630 160 L635 140 L640 120 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- 日本 -->
  <path id="JP" d="M800 150 L820 155 L825 170 L820 185 L815 190 L810 185 L805 170 L800 155 Z M805 200 L825 205 L830 220 L825 235 L820 240 L815 235 L810 220 L805 205 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- 韓国 -->
  <path id="KR" d="M780 170 L790 175 L793 185 L788 195 L783 190 L780 180 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- インド -->
  <path id="IN" d="M580 200 L630 205 L640 225 L635 245 L630 265 L625 285 L630 305 L625 320 L620 315 L615 295 L610 275 L605 255 L600 235 L595 215 L590 205 L585 200 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- タイ -->
  <path id="TH" d="M680 240 L695 245 L700 260 L695 275 L690 290 L695 305 L690 315 L685 310 L680 295 L675 280 L680 265 L675 250 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- ベトナム -->
  <path id="VN" d="M700 225 L715 230 L720 245 L715 260 L710 275 L715 290 L710 300 L705 295 L700 280 L695 265 L700 250 L695 235 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- インドネシア -->
  <path id="ID" d="M700 310 L750 315 L760 325 L755 340 L740 345 L720 340 L700 345 L690 335 L695 325 L700 315 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- マレーシア -->
  <path id="MY" d="M690 290 L720 295 L725 305 L720 315 L715 320 L710 315 L705 305 L700 295 L695 290 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- フィリピン -->
  <path id="PH" d="M750 250 L770 255 L775 270 L770 285 L765 280 L760 265 L755 255 Z M760 290 L780 295 L785 310 L780 325 L775 320 L770 305 L765 295 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- シンガポール -->
  <path id="SG" d="M718 320 L722 321 L723 324 L721 326 L719 325 L718 322 Z" fill="#deb887" stroke="#2d3748" stroke-width="1"/>
  
  <!-- 中東 -->
  <!-- サウジアラビア -->
  <path id="SA" d="M550 220 L600 225 L610 245 L605 265 L595 285 L585 280 L575 285 L565 280 L555 285 L545 280 L540 260 L545 240 L550 220 Z" fill="#f4a460" stroke="#2d3748" stroke-width="1"/>
  
  <!-- トルコ -->
  <path id="TR" d="M520 180 L560 185 L570 200 L565 215 L555 220 L545 215 L535 220 L525 215 L520 200 L515 185 Z" fill="#f4a460" stroke="#2d3748" stroke-width="1"/>
  
  <!-- イスラエル -->
  <path id="IL" d="M535 215 L545 218 L547 225 L545 232 L541 235 L537 232 L535 225 L533 218 Z" fill="#f4a460" stroke="#2d3748" stroke-width="1"/>
  
  <!-- アフリカ -->
  <!-- エジプト -->
  <path id="EG" d="M520 230 L555 235 L560 255 L555 275 L550 295 L545 315 L540 310 L535 290 L530 270 L525 250 L520 235 Z" fill="#cd853f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- 南アフリカ -->
  <path id="ZA" d="M520 400 L580 405 L590 420 L585 440 L575 455 L560 460 L540 455 L520 460 L510 445 L505 425 L510 405 Z" fill="#cd853f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- ナイジェリア -->
  <path id="NG" d="M460 310 L500 315 L505 335 L500 355 L495 375 L490 370 L485 350 L480 330 L475 315 L470 310 Z" fill="#cd853f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- モロッコ -->
  <path id="MA" d="M430 230 L470 235 L475 255 L470 275 L465 295 L460 290 L455 270 L450 250 L445 235 L440 230 Z" fill="#cd853f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- ケニア -->
  <path id="KE" d="M540 330 L570 335 L575 355 L570 375 L565 395 L560 390 L555 370 L550 350 L545 335 Z" fill="#cd853f" stroke="#2d3748" stroke-width="1"/>
  
  <!-- オセアニア -->
  <!-- オーストラリア -->
  <path id="AU" d="M760 380 L860 385 L880 400 L875 420 L865 435 L845 445 L825 440 L805 445 L785 440 L765 445 L750 430 L745 410 L750 390 Z" fill="#98fb98" stroke="#2d3748" stroke-width="1"/>
  
  <!-- ニュージーランド -->
  <path id="NZ" d="M900 420 L920 425 L925 440 L920 455 L915 450 L910 435 L905 425 Z M910 465 L930 470 L935 485 L930 500 L925 495 L920 480 L915 470 Z" fill="#98fb98" stroke="#2d3748" stroke-width="1"/>
</svg>`;

const countryNameMap: { [key: string]: { name: string; nameJa: string } } = {
  'CA': { name: 'Canada', nameJa: 'カナダ' },
  'US': { name: 'United States', nameJa: 'アメリカ' },
  'MX': { name: 'Mexico', nameJa: 'メキシコ' },
  'BR': { name: 'Brazil', nameJa: 'ブラジル' },
  'AR': { name: 'Argentina', nameJa: 'アルゼンチン' },
  'CL': { name: 'Chile', nameJa: 'チリ' },
  'PE': { name: 'Peru', nameJa: 'ペルー' },
  'CO': { name: 'Colombia', nameJa: 'コロンビア' },
  'GB': { name: 'United Kingdom', nameJa: 'イギリス' },
  'FR': { name: 'France', nameJa: 'フランス' },
  'DE': { name: 'Germany', nameJa: 'ドイツ' },
  'IT': { name: 'Italy', nameJa: 'イタリア' },
  'ES': { name: 'Spain', nameJa: 'スペイン' },
  'PL': { name: 'Poland', nameJa: 'ポーランド' },
  'NL': { name: 'Netherlands', nameJa: 'オランダ' },
  'CH': { name: 'Switzerland', nameJa: 'スイス' },
  'SE': { name: 'Sweden', nameJa: 'スウェーデン' },
  'RU': { name: 'Russia', nameJa: 'ロシア' },
  'CN': { name: 'China', nameJa: '中国' },
  'JP': { name: 'Japan', nameJa: '日本' },
  'KR': { name: 'South Korea', nameJa: '韓国' },
  'IN': { name: 'India', nameJa: 'インド' },
  'TH': { name: 'Thailand', nameJa: 'タイ' },
  'VN': { name: 'Vietnam', nameJa: 'ベトナム' },
  'ID': { name: 'Indonesia', nameJa: 'インドネシア' },
  'MY': { name: 'Malaysia', nameJa: 'マレーシア' },
  'PH': { name: 'Philippines', nameJa: 'フィリピン' },
  'SG': { name: 'Singapore', nameJa: 'シンガポール' },
  'SA': { name: 'Saudi Arabia', nameJa: 'サウジアラビア' },
  'TR': { name: 'Turkey', nameJa: 'トルコ' },
  'IL': { name: 'Israel', nameJa: 'イスラエル' },
  'EG': { name: 'Egypt', nameJa: 'エジプト' },
  'ZA': { name: 'South Africa', nameJa: '南アフリカ' },
  'NG': { name: 'Nigeria', nameJa: 'ナイジェリア' },
  'MA': { name: 'Morocco', nameJa: 'モロッコ' },
  'KE': { name: 'Kenya', nameJa: 'ケニア' },
  'AU': { name: 'Australia', nameJa: 'オーストラリア' },
  'NZ': { name: 'New Zealand', nameJa: 'ニュージーランド' }
};

export const DetailedWorldMap = ({ 
  highlightedCountry, 
  selectedCountry, 
  isCorrect,
  onCountryClick,
  options = []
}: DetailedWorldMapProps) => {
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
    svg.style.border = '2px solid #2d3748';
    svg.style.borderRadius = '12px';
    svg.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    
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
      let fill = path.getAttribute('fill') || '#e5e7eb'; // デフォルトの元の色を保持
      let stroke = '#2d3748';
      let strokeWidth = '1';
      let cursor = 'default';
      
      if (countryId === highlightedCountry) {
        if (isCorrect !== undefined) {
          fill = isCorrect ? '#22c55e' : '#ef4444'; // 正解：緑、不正解：赤
        } else {
          fill = '#3b82f6'; // 問題の国：青
        }
        stroke = '#1a202c';
        strokeWidth = '3';
      } else if (options.includes(countryId)) {
        if (countryId === selectedCountry) {
          fill = isCorrect ? '#22c55e' : '#ef4444'; // 選択した国
        } else {
          fill = '#fbbf24'; // 選択肢の国：黄色
        }
        stroke = '#1a202c';
        strokeWidth = '2';
        cursor = 'pointer';
      }
      
      // スタイルを適用
      (path as SVGPathElement).style.fill = fill;
      (path as SVGPathElement).style.stroke = stroke;
      (path as SVGPathElement).style.strokeWidth = strokeWidth;
      (path as SVGPathElement).style.cursor = cursor;
      (path as SVGPathElement).style.transition = 'all 0.3s ease';
      
      // クリックイベント
      if (options.includes(countryId) && onCountryClick) {
        const handleClick = () => onCountryClick(countryId);
        const handleMouseEnter = () => {
          (path as SVGPathElement).style.opacity = '0.8';
          (path as SVGPathElement).style.filter = 'brightness(1.1)';
        };
        const handleMouseLeave = () => {
          (path as SVGPathElement).style.opacity = '1';
          (path as SVGPathElement).style.filter = 'brightness(1)';
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