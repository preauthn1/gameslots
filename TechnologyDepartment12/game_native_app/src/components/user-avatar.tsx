// @ts-nocheck
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { colors } from '@/theme/colors';
import { scale as s } from '@/utils/scale';

const rings = [
  require('../../assets/brand/avatar/avatar-ring-stage-1.png'),
  require('../../assets/brand/avatar/avatar-ring-stage-2.png'),
  require('../../assets/brand/avatar/avatar-ring-stage-3.png'),
  require('../../assets/brand/avatar/avatar-ring-stage-4.png'),
  require('../../assets/brand/avatar/avatar-ring-stage-5.png'),
];
const defaultAvatar = require('../../assets/brand/nav/avatar.png');

const ringForLevel = (level) => {
  const numeric = Number(level);
  const safe = Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 0;
  return rings[Math.min(rings.length - 1, Math.floor(safe / 4))];
};

export function UserAvatar({ src, level = 0, size = 36, badge = 0 }) {
  const frame = s(size);
  const photo = Math.round(size * 0.84 * 10) / 10;
  const photoSize = s(photo);
  const vipSize = s(Math.max(8, Math.round(size * 0.22)));
  const count = Number(badge) || 0;
  return (
    <View style={{ width: frame, height: frame }}>
      <Image
        source={src ? { uri: src } : defaultAvatar}
        style={[styles.photo, { width: photoSize, height: photoSize, borderRadius: photoSize / 2, marginLeft: -photoSize / 2, marginTop: -photoSize / 2 }]}
        contentFit="cover"
      />
      <Image source={ringForLevel(level)} style={[styles.ring, { width: frame, height: frame }]} contentFit="fill" />
      <Text style={[styles.vip, { fontSize: vipSize, lineHeight: vipSize, marginTop: -vipSize / 2 }]}>V{Number(level) || 0}</Text>
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : String(count)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { position: 'absolute', top: '50%', left: '50%', backgroundColor: colors.surface },
  ring: { position: 'absolute', top: 0, left: 0, zIndex: 2, elevation: 2 },
  vip: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '84%',
    zIndex: 3,
    elevation: 3,
    color: colors.accentInk,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  badge: {
    position: 'absolute',
    top: s(-2),
    right: s(-4),
    zIndex: 3,
    minWidth: s(14),
    padding: s(2),
    borderRadius: s(12),
    backgroundColor: '#f83033',
    alignItems: 'center',
  },
  badgeText: { color: '#ffffff', fontSize: s(10), fontWeight: '500', lineHeight: s(11) },
});
