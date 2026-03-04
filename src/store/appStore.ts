import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AppState {
    isFirstLaunch: boolean;
    isDarkMode: boolean;
    currency: string;
    isAppLocked: boolean;
    selectedMonth: number;
    selectedYear: number;
    userName: string;
    userAvatar: string;
    setFirstLaunch: (val: boolean) => void;
    setDarkMode: (val: boolean) => void;
    setCurrency: (val: string) => void;
    setAppLocked: (val: boolean) => void;
    setSelectedMonth: (val: number) => void;
    setSelectedYear: (val: number) => void;
    setUserName: (val: string) => void;
    setUserAvatar: (val: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            isFirstLaunch: true,
            isDarkMode: false,
            currency: 'VND',
            isAppLocked: false,
            selectedMonth: new Date().getMonth() + 1,
            selectedYear: new Date().getFullYear(),
            userName: 'Bạn ơi',
            userAvatar: '',
            setFirstLaunch: (val) => set({ isFirstLaunch: val }),
            setDarkMode: (val) => set({ isDarkMode: val }),
            setCurrency: (val) => set({ currency: val }),
            setAppLocked: (val) => set({ isAppLocked: val }),
            setSelectedMonth: (val) => set({ selectedMonth: val }),
            setSelectedYear: (val) => set({ selectedYear: val }),
            setUserName: (val) => set({ userName: val }),
            setUserAvatar: (val) => set({ userAvatar: val }),
        }),
        {
            name: 'expense-app-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)
