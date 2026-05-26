import { Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';

import { theme } from '../../../constants/theme';

type BrandLogoVariant = 'horizontal' | 'vertical' | 'icon';

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

type LogoSource = {
  source: ImageSourcePropType;
  type: 'image' | 'svg';
};

const horizontalLogo = require('../../../../resources/logo-horizontal.png');

const logoSources: Record<BrandLogoVariant, LogoSource> = {
  horizontal: {
    source: horizontalLogo,
    type: 'image',
  },
  vertical: {
    source: horizontalLogo,
    type: 'image',
  },
  icon: {
    source: require('../../../../resources/fav-icon.svg'),
    type: 'svg',
  },
};

const dimensions = {
  horizontal: {
    width: 190,
    height: 54,
  },
  vertical: {
    width: 190,
    height: 54,
  },
  icon: {
    width: 42,
    height: 42,
  },
};

export function BrandLogo({
  variant = 'horizontal',
  accessibilityLabel = 'Listaokê',
  style,
}: BrandLogoProps) {
  const logo = logoSources[variant];
  const size = dimensions[variant];

  const svgAsset = logo.type === 'svg' ? Image.resolveAssetSource(logo.source) : null;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[styles.container, style]}
    >
      {logo.type === 'svg' && svgAsset ? (
        <SvgUri uri={svgAsset.uri} width={size.width} height={size.height} />
      ) : (
        <Image
          source={logo.source}
          style={[
            styles.image,
            {
              width: size.width,
              height: size.height,
            },
          ]}
          resizeMode="contain"
        />
      )}

      <Text style={styles.fallbackText}>Listaokê</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    minHeight: 42,
    justifyContent: 'center',
  },
  image: {
    alignSelf: 'flex-start',
  },
  fallbackText: {
    color: theme.colors.text,
    fontSize: 1,
    lineHeight: 1,
    opacity: 0,
  },
});