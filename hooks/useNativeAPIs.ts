// ==========================================
// HOOK - useNativeAPIs
// API natives : Vibration, Localisation, Accéléromètre
// ==========================================
import { useCallback, useEffect, useState } from 'react';
import { Vibration, Platform } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';

// --- useVibration ---
export function useVibration() {
  const vibrate = useCallback((pattern?: number | number[]) => {
    if (typeof pattern === 'number') {
      Vibration.vibrate(pattern);
    } else if (Array.isArray(pattern)) {
      Vibration.vibrate(pattern);
    } else {
      // Vibration courte par défaut (feedback haptique)
      Vibration.vibrate(50);
    }
  }, []);

  const vibrateSuccess = useCallback(() => {
    Vibration.vibrate([0, 30, 50, 30]);
  }, []);

  const vibrateError = useCallback(() => {
    Vibration.vibrate([0, 100, 50, 100, 50, 100]);
  }, []);

  const cancel = useCallback(() => {
    Vibration.cancel();
  }, []);

  return { vibrate, vibrateSuccess, vibrateError, cancel };
}

// --- useLocation ---
export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission de localisation refusée');
        setIsLoading(false);
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc);

      // Reverse geocoding pour obtenir l'adresse
      try {
        const [addr] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (addr) {
          const formatted = [addr.city, addr.region, addr.country]
            .filter(Boolean)
            .join(', ');
          setAddress(formatted);
        }
      } catch {
        // Le reverse geocoding peut échouer, ce n'est pas critique
      }

      setIsLoading(false);
      return loc;
    } catch (err) {
      setError('Impossible de récupérer la localisation');
      setIsLoading(false);
      return null;
    }
  }, []);

  return { location, address, isLoading, error, requestLocation };
}

// --- useAccelerometer ---
export function useAccelerometer() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [isShaking, setIsShaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    Accelerometer.isAvailableAsync().then(setIsAvailable);
  }, []);

  const startListening = useCallback(() => {
    if (!isAvailable) return;

    Accelerometer.setUpdateInterval(150);
    const subscription = Accelerometer.addListener((accelerometerData) => {
      setData(accelerometerData);

      // Détection de secousse (shake)
      const totalForce = Math.sqrt(
        accelerometerData.x ** 2 +
          accelerometerData.y ** 2 +
          accelerometerData.z ** 2
      );
      setIsShaking(totalForce > 2.5);
    });

    return () => subscription.remove();
  }, [isAvailable]);

  return { data, isShaking, isAvailable, startListening };
}
