import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../lib/constants';

interface Props {
  narrative: string;
}

export default function ChapterCard({ narrative }: Props) {
  const lines = narrative.split('\n').filter((l) => l.trim());
  const title = lines[0] || '';
  const body = lines.slice(1).join('\n\n');

  return (
    <View style={styles.container}>
      <View style={styles.tape} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.divider} />
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    margin: 16,
    padding: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tape: {
    position: 'absolute',
    top: -6,
    left: '35%',
    width: '30%',
    height: 12,
    backgroundColor: COLORS.primary + '40',
    borderRadius: 2,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  body: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
});
