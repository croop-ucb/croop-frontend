import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path, Text as SvgText, TextPath, Defs } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  width?: number;
  height?: number;
  curve?: string;
  fontSize?: number;
  shadowDy?: number;
  shadowDx?: number;
}

export default function CroopLogo({
  width = screenWidth * 0.9,
  height = 160,
  curve = 'M 40,110 Q 200,20 360,110',
  fontSize = 75,
  shadowDy = 12,
  shadowDx = 3,
}: Props) {
  return (
    <Svg viewBox="0 0 400 200" width={width} height={height}>
      <Defs>
        <Path id="curve" d={curve} />
      </Defs>
      <SvgText fill="#1E331E" fontSize={fontSize} fontWeight="bold" dy={shadowDy} dx={shadowDx}>
        <TextPath href="#curve" startOffset="50%" textAnchor="middle">
          CROOP
        </TextPath>
      </SvgText>
      <SvgText fill="#FFFFFF" fontSize={fontSize} fontWeight="bold">
        <TextPath href="#curve" startOffset="50%" textAnchor="middle">
          CROOP
        </TextPath>
      </SvgText>
    </Svg>
  );
}
