import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { DayLog } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

const pickPreviewLine = (narrative: string): string => {
  const sentences = narrative
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 120);
  if (sentences.length === 0) return narrative.slice(0, 80) + '…';
  return sentences[Math.floor(Math.random() * sentences.length)] + '.';
};

export const scheduleAnniversaryNotifications = async (
  days: Record<string, DayLog>,
  travelers: string[]
): Promise<number> => {
  const granted = await requestPermissions();
  if (!granted) return 0;

  await Notifications.cancelAllScheduledNotificationsAsync();

  let scheduled = 0;
  const names = travelers.join(' & ');

  for (const [dateStr, dayLog] of Object.entries(days)) {
    if (!dayLog.narrative) continue;

    const original = new Date(dateStr + 'T10:00:00');
    const anniversary = new Date(original);
    anniversary.setFullYear(anniversary.getFullYear() + 1);

    if (anniversary.getTime() < Date.now()) continue;

    const preview = pickPreviewLine(dayLog.narrative);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🌸 One year ago today — ${names} in Japan`,
        body: `"${preview}"`,
        data: { date: dateStr },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: anniversary,
      },
    });

    scheduled++;
  }

  return scheduled;
};
