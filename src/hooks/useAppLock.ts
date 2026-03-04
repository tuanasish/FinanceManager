import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppStore } from '../store/appStore';

export const useAppLock = () => {
    const isAppLocked = useAppStore(state => state.isAppLocked);
    const [isAuthenticated, setIsAuthenticated] = useState(!isAppLocked);

    const authenticate = async () => {
        if (!isAppLocked) {
            setIsAuthenticated(true);
            return true;
        }

        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                setIsAuthenticated(true);
                return true;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Xác thực để mở khóa ứng dụng',
                fallbackLabel: 'Sử dụng mật khẩu thiết bị',
            });

            if (result.success) {
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Authentication Error', error);
            return false;
        }
    };

    useEffect(() => {
        if (isAppLocked && !isAuthenticated) {
            authenticate();
        }
    }, [isAppLocked]);

    return { isAuthenticated, authenticate };
};
