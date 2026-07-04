// ==========================================
// HOOK - useNotifications
// Système de notifications (expo-notifications)
// ==========================================
import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) setExpoPushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notif) => setNotification(notif)
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // Gérer le tap sur la notification
        console.log('Notification tapped:', response);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Planifier une notification locale
  const scheduleNotification = useCallback(
    async (title: string, body: string, trigger?: Notifications.NotificationTriggerInput) => {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title, body, sound: true },
          trigger: trigger || { seconds: 1 },
        });
        return id;
      } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
      }
    },
    []
  );

  // Rappel repas quotidien
  const scheduleMealReminder = useCallback(
    async (mealName: string, hour: number, minute: number) => {
      return scheduleNotification(
        '🍽️ Rappel repas',
        `N'oublie pas de préparer : ${mealName}`,
        {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        }
      );
    },
    [scheduleNotification]
  );

  // Rappel courses
  const scheduleShoppingReminder = useCallback(
    async (itemCount: number) => {
      return scheduleNotification(
        '🛒 Courses à faire',
        `Tu as ${itemCount} articles sur ta liste`,
        { seconds: 5 }
      );
    },
    [scheduleNotification]
  );

  // Annuler toutes les notifications
  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  return {
    expoPushToken,
    notification,
    scheduleNotification,
    scheduleMealReminder,
    scheduleShoppingReminder,
    cancelAllNotifications,
  };
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission for notifications not granted');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch {
    return null;
  }
}
