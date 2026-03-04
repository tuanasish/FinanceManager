import { create } from 'zustand'

interface FilterState {
    currentMonth: number;
    currentYear: number;
    setMonth: (month: number) => void;
    setYear: (year: number) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    currentMonth: new Date().getMonth() + 1, // 1-12
    currentYear: new Date().getFullYear(),
    setMonth: (month) => set({ currentMonth: month }),
    setYear: (year) => set({ currentYear: year }),
}))
