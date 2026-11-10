import { Dimensions, PixelRatio } from 'react-native';

/** Style numbers in this app are authored for a 375-wide layout (Figma frames are 750). */
const DESIGN_WIDTH = 375;
const ratio = Dimensions.get('window').width / DESIGN_WIDTH;

export function scale(size: number) {
  return PixelRatio.roundToNearestPixel(size * ratio);
}
