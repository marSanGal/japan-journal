import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import { COLORS } from '../lib/constants';

const CELL = 48;
const HALF = CELL / 2;

function WaveCell() {
  return (
    <View style={styles.clipBox}>
      <View style={[styles.arc, styles.arcOuter]} />
      <View style={[styles.arc, styles.arcMid]} />
      <View style={[styles.arc, styles.arcInner]} />
    </View>
  );
}

export default function SeigaihaBackground() {
  const { width, height } = useWindowDimensions();

  const grid = useMemo(() => {
    const cols = Math.ceil(width / CELL) + 2;
    const rows = Math.ceil(height / HALF) + 2;

    return Array.from({ length: rows }, (_, r) => (
      <View
        key={r}
        style={{
          flexDirection: 'row' as const,
          marginLeft: r % 2 === 0 ? -HALF : 0,
        }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <WaveCell key={c} />
        ))}
      </View>
    ));
  }, [width, height]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.wrapper]} pointerEvents="none">
      {grid}
    </View>
  );
}

const ARC = (size: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  top: HALF - size / 2,
});

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  clipBox: {
    width: CELL,
    height: HALF,
    overflow: 'hidden',
    alignItems: 'center',
  },
  arc: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: COLORS.text,
  },
  arcOuter: {
    ...ARC(CELL * 0.92),
    opacity: 0.09,
  },
  arcMid: {
    ...ARC(CELL * 0.62),
    opacity: 0.07,
  },
  arcInner: {
    ...ARC(CELL * 0.32),
    opacity: 0.055,
  },
});
