import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useEffect, useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Quicksand_500Medium, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { VarelaRound_400Regular } from '@expo-google-fonts/varela-round';

import { useAppStore } from './src/store/appStore';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Icon } from './src/components/ui/Icon';
import { COLORS } from './src/constants/theme';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function App() {
    const { isAppLocked } = useAppStore();
    const [isAuthenticated, setIsAuthenticated] = useState(!isAppLocked);
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Tải font từ thư viện @expo-google-fonts chuẩn thay vì file ttf gốc
                await Font.loadAsync({
                    Quicksand: Quicksand_500Medium,
                    QuicksandBold: Quicksand_700Bold,
                    Nunito: Nunito_400Regular,
                    NunitoMedium: Nunito_500Medium,
                    NunitoSemiBold: Nunito_600SemiBold,
                    NunitoBold: Nunito_700Bold,
                    VarelaRound: VarelaRound_400Regular,
                    ...MaterialCommunityIcons.font,
                });

            } catch (e) {
                console.warn('Failed during app init:', e);
            } finally {
                setAppIsReady(true);
                await SplashScreen.hideAsync().catch(() => { });
            }
        }
        prepare();
    }, []);

    useEffect(() => {
        if (isAppLocked) {
            authenticate();
        }
    }, [isAppLocked]);

    const authenticate = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Xác thực để mở Quản Lý Chi Tiêu',
                fallbackLabel: 'Sử dụng mật khẩu',
            });
            setIsAuthenticated(result.success);
        } else {
            setIsAuthenticated(true);
        }
    };

    if (!appIsReady) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (isAppLocked && !isAuthenticated) {
        return (
            <View style={styles.lockedContainer}>
                <Icon name="lock" size={64} color={COLORS.primary} />
                <Text style={styles.lockedText}>Ứng dụng đã bị khóa</Text>
                <Text style={styles.unlockPrompt} onPress={authenticate}>
                    Chạm để mở khóa
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <RootNavigator />
                <StatusBar style="auto" />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    lockedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    lockedText: {
        marginTop: 24,
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    unlockPrompt: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.primary,
        padding: 12,
    },
});
