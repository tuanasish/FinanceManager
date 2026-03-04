import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import { useAppStore } from '../../store/appStore';

export const MonthSelector = () => {
    const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useAppStore();

    const onPrev = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const onNext = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPrev} style={styles.arrowButton}>
                <Icon name="chevron-left" size={20} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.textContainer}>
                <Text style={styles.monthText}>Tháng {selectedMonth}</Text>
                <Text style={styles.yearText}>{selectedYear}</Text>
            </View>

            <TouchableOpacity onPress={onNext} style={styles.arrowButton}>
                <Icon name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>
        </View>
    );
};

export default MonthSelector;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    arrowButton: {
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
    },
    textContainer: {
        alignItems: 'center',
    },
    monthText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    yearText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
});
