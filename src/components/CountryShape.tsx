import React from 'react';
import { CountryShape as CountryShapeType } from '../data/countryShapes';

interface CountryShapeProps {
  shape: CountryShapeType;
  isCorrect?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const CountryShape: React.FC<CountryShapeProps> = ({ 
  shape, 
  isCorrect, 
  isSelected,
  onClick 
}) => {
  const fillColor = isCorrect 
    ? '#4ade80' 
    : isSelected 
      ? '#ef4444' 
      : '#e5e7eb';
  
  const strokeColor = isCorrect
    ? '#22c55e'
    : isSelected
      ? '#dc2626'
      : '#9ca3af';

  return (
    <div 
      className="country-shape-container"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        transform: isSelected || isCorrect ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <svg
        viewBox={shape.viewBox}
        width="100%"
        height="100%"
        style={{ maxWidth: '300px', maxHeight: '300px' }}
      >
        <path
          d={shape.svgPath}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
          style={{
            transition: 'fill 0.3s, stroke 0.3s',
          }}
        />
      </svg>
    </div>
  );
};