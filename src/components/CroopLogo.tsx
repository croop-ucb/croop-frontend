import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  width?: number;
  height?: number;
  curve?: string;
  fontSize?: number;
  shadowDy?: number;
  shadowDx?: number;
}

// Cada letra posicionada ao longo de um arco parabólico (apex em y=80, bordas em y=107)
// A rotação de cada letra acompanha a tangente da curva naquele ponto
const CHARS = ['C', 'R', 'O', 'O', 'P'];
const ARC = [
  { x: 60,  y: 107, r: -21 },
  { x: 130, y: 87,  r: -11 },
  { x: 200, y: 80,  r:   0 },
  { x: 270, y: 87,  r:  11 },
  { x: 340, y: 107, r:  21 },
];

export default function CroopLogo({
  width = screenWidth * 0.9,
  height = 160,
  fontSize = 75,
  shadowDy = 6,
  shadowDx = 3,
}: Props) {
  return (
    <Svg viewBox="0 0 400 200" width={width} height={height}>
      {ARC.map(({ x, y, r }, i) => (
        <SvgText
          key={`s${i}`}
          x={x + shadowDx}
          y={y + shadowDy}
          fill="#1E331E"
          fontSize={fontSize}
          fontWeight="bold"
          textAnchor="middle"
          transform={`rotate(${r}, ${x + shadowDx}, ${y + shadowDy})`}
        >
          {CHARS[i]}
        </SvgText>
      ))}
      {ARC.map(({ x, y, r }, i) => (
        <SvgText
          key={`t${i}`}
          x={x}
          y={y}
          fill="#FFFFFF"
          fontSize={fontSize}
          fontWeight="bold"
          textAnchor="middle"
          transform={`rotate(${r}, ${x}, ${y})`}
        >
          {CHARS[i]}
        </SvgText>
      ))}
    </Svg>
  );
}
