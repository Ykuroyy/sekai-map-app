import { useEffect, useRef } from 'react';

interface FallbackWorldMapProps {
  highlightedCountry?: string;
  selectedCountry?: string;
  isCorrect?: boolean;
  onCountryClick?: (countryId: string) => void;
  options?: string[];
}

// SVGベースの簡易世界地図（主要国のみ）
const fallbackMapSvg = `
<svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
  <!-- 海洋背景 -->
  <rect width="1000" height="500" fill="#dbeafe" />
  
  <!-- 北アメリカ -->
  <path id="CA" d="M80 60 L320 50 L340 70 L330 90 L320 100 L300 95 L280 100 L260 95 L240 100 L220 95 L200 100 L180 95 L160 100 L140 95 L120 100 L100 95 L80 90 Z" />
  <path id="US" d="M80 90 L320 100 L340 120 L330 140 L320 150 L300 145 L280 150 L260 145 L240 150 L220 145 L200 150 L180 145 L160 150 L140 145 L120 150 L100 145 L80 140 Z" />
  <path id="MX" d="M80 140 L200 150 L190 170 L180 180 L160 185 L140 180 L120 185 L100 180 L90 170 L80 160 Z" />
  
  <!-- 南アメリカ -->
  <path id="BR" d="M220 200 L300 210 L320 230 L330 260 L325 290 L315 320 L300 340 L280 350 L260 345 L240 350 L220 345 L200 350 L180 345 L170 320 L165 290 L170 260 L180 230 L200 210 Z" />
  <path id="AR" d="M240 345 L280 350 L290 370 L295 400 L290 430 L285 450 L275 460 L265 455 L255 460 L245 455 L235 450 L230 430 L235 400 L240 370 Z" />
  <path id="CL" d="M180 330 L200 335 L205 355 L200 385 L205 415 L200 445 L195 465 L185 470 L175 465 L170 445 L175 415 L170 385 L175 355 Z" />
  <path id="PE" d="M170 230 L200 240 L210 260 L205 280 L195 300 L185 305 L175 300 L165 280 L160 260 L165 240 Z" />
  <path id="CO" d="M160 200 L190 210 L200 230 L195 250 L185 255 L175 250 L165 255 L155 250 L150 230 L155 210 Z" />
  
  <!-- ヨーロッパ -->
  <path id="GB" d="M450 110 L465 105 L470 120 L465 135 L460 145 L455 140 L450 125 L445 115 Z" />
  <path id="FR" d="M460 140 L485 145 L495 160 L490 175 L480 185 L470 180 L460 185 L450 180 L445 165 L450 150 Z" />
  <path id="DE" d="M485 125 L505 130 L510 145 L505 160 L500 175 L490 180 L480 175 L475 160 L470 145 L475 130 Z" />
  <path id="IT" d="M485 175 L500 180 L505 195 L500 210 L495 225 L500 240 L505 255 L500 265 L495 260 L490 245 L485 230 L480 215 L475 200 L470 185 L475 180 Z" />
  <path id="ES" d="M430 170 L470 175 L475 190 L470 205 L465 215 L450 220 L435 215 L420 210 L415 195 L420 180 Z" />
  <path id="RU" d="M510 70 L750 60 L770 80 L760 100 L750 110 L730 105 L710 110 L690 105 L670 110 L650 105 L630 110 L610 105 L590 110 L570 105 L550 110 L530 105 L510 100 Z" />
  <path id="PL" d="M505 140 L525 145 L530 160 L525 175 L520 185 L510 190 L500 185 L495 170 L490 155 L495 145 Z" />
  <path id="NL" d="M470 125 L485 130 L488 140 L483 150 L473 153 L468 143 L470 133 Z" />
  <path id="CH" d="M475 155 L490 160 L493 170 L488 180 L478 183 L473 173 L475 163 Z" />
  <path id="SE" d="M500 85 L520 90 L525 110 L520 130 L515 140 L510 135 L505 115 L500 95 Z" />
  
  <!-- アジア -->
  <path id="CN" d="M620 130 L720 120 L740 140 L750 160 L745 180 L735 200 L720 210 L700 205 L680 210 L660 205 L640 210 L620 205 L605 190 L600 170 L605 150 L610 130 Z" />
  <path id="JP" d="M770 160 L790 165 L795 180 L790 195 L785 200 L780 195 L775 180 L770 165 Z M775 210 L795 215 L800 230 L795 245 L790 250 L785 245 L780 230 L775 215 Z" />
  <path id="KR" d="M750 180 L765 185 L768 195 L763 205 L758 200 L755 190 Z" />
  <path id="IN" d="M560 210 L605 220 L615 240 L610 260 L605 280 L600 300 L605 320 L600 335 L595 330 L590 310 L585 290 L580 270 L575 250 L570 230 L565 220 Z" />
  <path id="TH" d="M650 260 L665 265 L670 280 L665 295 L660 310 L665 325 L660 335 L655 330 L650 315 L645 300 L650 285 L645 270 Z" />
  <path id="VN" d="M670 245 L685 250 L690 265 L685 280 L680 295 L685 310 L680 320 L675 315 L670 300 L665 285 L670 270 L665 255 Z" />
  <path id="ID" d="M670 335 L720 340 L730 350 L725 365 L710 370 L690 365 L670 370 L660 360 L665 350 L670 340 Z" />
  <path id="MY" d="M660 315 L690 320 L695 330 L690 340 L685 345 L680 340 L675 330 L670 320 L665 315 Z" />
  <path id="PH" d="M720 270 L740 275 L745 290 L740 305 L735 300 L730 285 L725 275 Z M730 315 L750 320 L755 335 L750 350 L745 345 L740 330 L735 320 Z" />
  <path id="SG" d="M688 345 L692 346 L693 349 L691 351 L689 350 L688 347 Z" />
  
  <!-- 中東 -->
  <path id="SA" d="M530 240 L580 250 L590 270 L585 290 L575 310 L565 305 L555 310 L545 305 L535 310 L525 305 L520 285 L525 265 L530 245 Z" />
  <path id="TR" d="M505 195 L545 200 L555 215 L550 230 L540 235 L530 230 L520 235 L510 230 L505 215 L500 200 Z" />
  <path id="IL" d="M520 230 L530 233 L532 240 L530 247 L526 250 L522 247 L520 240 L518 233 Z" />
  
  <!-- アフリカ -->
  <path id="EG" d="M505 250 L540 255 L545 275 L540 295 L535 315 L530 335 L525 330 L520 310 L515 290 L510 270 Z" />
  <path id="ZA" d="M500 420 L560 425 L570 440 L565 460 L555 475 L540 480 L520 475 L500 480 L485 465 L480 445 L485 425 Z" />
  <path id="NG" d="M450 330 L485 335 L490 355 L485 375 L480 390 L475 385 L470 365 L465 345 L460 335 L455 330 Z" />
  <path id="MA" d="M420 250 L455 255 L460 275 L455 295 L450 315 L445 310 L440 290 L435 270 L430 255 L425 250 Z" />
  <path id="KE" d="M530 350 L560 355 L565 375 L560 395 L555 415 L550 410 L545 390 L540 370 L535 355 Z" />
  
  <!-- オセアニア -->
  <path id="AU" d="M730 400 L830 405 L850 420 L845 440 L835 455 L815 465 L795 460 L775 465 L755 460 L735 455 L725 440 L720 420 L725 405 Z" />
  <path id="NZ" d="M870 440 L890 445 L895 460 L890 475 L885 470 L880 455 L875 445 Z M880 485 L900 490 L905 505 L900 520 L895 515 L890 500 L885 490 Z" />
</svg>`;

const countryNames: { [key: string]: string } = {
  'CA': 'カナダ',
  'US': 'アメリカ',
  'MX': 'メキシコ',
  'BR': 'ブラジル',
  'AR': 'アルゼンチン',
  'CL': 'チリ',
  'PE': 'ペルー',
  'CO': 'コロンビア',
  'GB': 'イギリス',
  'FR': 'フランス',
  'DE': 'ドイツ',
  'IT': 'イタリア',
  'ES': 'スペイン',
  'RU': 'ロシア',
  'PL': 'ポーランド',
  'NL': 'オランダ',
  'CH': 'スイス',
  'SE': 'スウェーデン',
  'CN': '中国',
  'JP': '日本',
  'KR': '韓国',
  'IN': 'インド',
  'TH': 'タイ',
  'VN': 'ベトナム',
  'ID': 'インドネシア',
  'MY': 'マレーシア',
  'PH': 'フィリピン',
  'SG': 'シンガポール',
  'SA': 'サウジアラビア',
  'TR': 'トルコ',
  'IL': 'イスラエル',
  'EG': 'エジプト',
  'ZA': '南アフリカ',
  'NG': 'ナイジェリア',
  'MA': 'モロッコ',
  'KE': 'ケニア',
  'AU': 'オーストラリア',
  'NZ': 'ニュージーランド'
};

export const FallbackWorldMap = ({ 
  highlightedCountry, 
  selectedCountry, 
  isCorrect,
  onCountryClick,
  options = []
}: FallbackWorldMapProps) => {
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    console.log('Rendering fallback world map');
    console.log('Highlighted country:', highlightedCountry);
    console.log('Options:', options);
    
    // SVGを挿入
    svgRef.current.innerHTML = fallbackMapSvg;
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;

    // スタイルを設定
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.maxWidth = '100%';
    
    // 各国のパスを取得
    const paths = svg.querySelectorAll('path[id]');
    console.log('Found paths:', paths.length);
    
    paths.forEach((path) => {
      const countryId = path.id;
      const countryName = countryNames[countryId];
      
      console.log(`Processing country: ${countryId} (${countryName})`);
      
      // ツールチップ用のtitle要素を追加
      const existingTitle = path.querySelector('title');
      if (existingTitle) {
        existingTitle.remove();
      }
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = countryName || countryId;
      path.appendChild(title);
      
      // 色の設定
      let fill = '#e5e7eb'; // デフォルト色（薄いグレー）
      let stroke = '#9ca3af';
      let strokeWidth = '1';
      let cursor = 'default';
      
      if (countryId === highlightedCountry) {
        console.log(`Highlighting country: ${countryId}`);
        if (isCorrect !== undefined) {
          fill = isCorrect ? '#22c55e' : '#ef4444'; // 正解：緑、不正解：赤
        } else {
          fill = '#3b82f6'; // 問題の国：青
        }
        stroke = '#1f2937';
        strokeWidth = '3';
      } else if (options.includes(countryId)) {
        console.log(`Option country: ${countryId}`);
        if (countryId === selectedCountry) {
          fill = isCorrect ? '#22c55e' : '#ef4444'; // 選択した国
        } else {
          fill = '#fbbf24'; // 選択肢の国：黄色
        }
        stroke = '#1f2937';
        strokeWidth = '2';
        cursor = 'pointer';
      }
      
      // スタイルを適用
      (path as SVGPathElement).style.fill = fill;
      (path as SVGPathElement).style.stroke = stroke;
      (path as SVGPathElement).style.strokeWidth = strokeWidth;
      (path as SVGPathElement).style.cursor = cursor;
      (path as SVGPathElement).style.transition = 'all 0.3s ease';
      
      // 既存のイベントリスナーを削除
      (path as any)._clickHandler && path.removeEventListener('click', (path as any)._clickHandler);
      (path as any)._mouseEnterHandler && path.removeEventListener('mouseenter', (path as any)._mouseEnterHandler);
      (path as any)._mouseLeaveHandler && path.removeEventListener('mouseleave', (path as any)._mouseLeaveHandler);
      
      // クリックイベント
      if (options.includes(countryId) && onCountryClick) {
        console.log(`Adding click handler for: ${countryId}`);
        
        const handleClick = () => {
          console.log(`Country clicked: ${countryId}`);
          onCountryClick(countryId);
        };
        const handleMouseEnter = () => {
          (path as SVGPathElement).style.opacity = '0.8';
          (path as SVGPathElement).style.filter = 'brightness(1.1)';
        };
        const handleMouseLeave = () => {
          (path as SVGPathElement).style.opacity = '1';
          (path as SVGPathElement).style.filter = 'brightness(1)';
        };
        
        // イベントリスナーを保存して後で削除できるようにする
        (path as any)._clickHandler = handleClick;
        (path as any)._mouseEnterHandler = handleMouseEnter;
        (path as any)._mouseLeaveHandler = handleMouseLeave;
        
        path.addEventListener('click', handleClick);
        path.addEventListener('mouseenter', handleMouseEnter);
        path.addEventListener('mouseleave', handleMouseLeave);
      }
    });
    
    // クリーンアップ関数
    return () => {
      const pathsToClean = svg.querySelectorAll('path[id]');
      pathsToClean.forEach((path) => {
        if ((path as any)._clickHandler) {
          path.removeEventListener('click', (path as any)._clickHandler);
          path.removeEventListener('mouseenter', (path as any)._mouseEnterHandler);
          path.removeEventListener('mouseleave', (path as any)._mouseLeaveHandler);
        }
      });
    };
  }, [highlightedCountry, selectedCountry, isCorrect, options, onCountryClick]);

  return (
    <div className="world-map-container">
      <div style={{ 
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#f0f9ff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div ref={svgRef}></div>
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