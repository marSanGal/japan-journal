import { View, StyleSheet } from 'react-native';
import { COLORS } from '../lib/constants';

export default function InkDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <View style={styles.diamond} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 8,
    gap: 10,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  diamond: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.primary,
    opacity: 0.4,
    transform: [{ rotate: '45deg' }],
  },
});
