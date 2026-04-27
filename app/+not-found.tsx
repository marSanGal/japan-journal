import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { COLORS } from '../lib/constants';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Page not found</Text>
      <Link href="/" style={styles.link}>
        Go home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
  },
  link: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: COLORS.primary,
  },
});
