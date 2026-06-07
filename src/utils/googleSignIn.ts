import { supabase } from './supabase';
import { Alert, Platform, NativeModules, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let GoogleSignin: any = null;
let statusCodes: any = null;
let nativeGoogleAvailable = false;

try {
  const RNGoogleSignin = NativeModules.RNGoogleSignin;
  if (RNGoogleSignin) {
    const googleModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleModule.GoogleSignin;
    statusCodes = googleModule.statusCodes;
    if (GoogleSignin?.configure) {
      GoogleSignin.configure({
        webClientId: '716773765351-d0bpb2g0ji5cpkf53tfddctjvsi92rvk.apps.googleusercontent.com',
        offlineAccess: true,
      });
      nativeGoogleAvailable = true;
    }
  }
} catch {
  nativeGoogleAvailable = false;
}

export const isGoogleSignInAvailable = () => true;

export const signInWithGoogle = async (): Promise<{ username: string; email: string } | null> => {
  // Native Google Sign-In (works in development builds)
  if (nativeGoogleAvailable && GoogleSignin) {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error('No idToken received');

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;

      if (data?.user) {
        const userData = {
          username: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
        };
        await AsyncStorage.setItem('repsfinder_current_user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error: any) {
      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) return null;
      // Fall through to web OAuth
    }
  }

  // Web OAuth flow (works in Expo Go and browsers)
  try {
    const redirectTo = Platform.OS === 'web'
      ? window.location.origin + '/auth/callback'
      : 'com.repsfinder.app://auth/callback';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      Alert.alert(
        'Google Sign-In',
        Platform.OS === 'web'
          ? 'Error al conectar con Google. Intenta con email.'
          : 'Para iniciar sesión con Google necesitas un build de producción (EAS Build).\n\nUsa email para continuar en Expo Go.'
      );
      return null;
    }

    // Listen for the session after redirect
    return new Promise((resolve) => {
      let resolved = false;

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && !resolved) {
          resolved = true;
          subscription.unsubscribe();
          const userData = {
            username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
          };
          await AsyncStorage.setItem('repsfinder_current_user', JSON.stringify(userData));
          resolve(userData);
        }
      });

      setTimeout(() => {
        if (!resolved) {
          subscription.unsubscribe();
          resolve(null);
        }
      }, 120000);
    });
  } catch {
    Alert.alert(
      'Google Sign-In',
      Platform.OS === 'web'
        ? 'Error al conectar con Google.'
        : 'Para iniciar sesión con Google necesitas un build de producción.\n\nUsa email para continuar.'
    );
    return null;
  }
};