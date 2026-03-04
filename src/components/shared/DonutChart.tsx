import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/format';
import { FONTS, COLORS } from '../../constants/theme';

interface DonutChartProps {
    data: { amount: number; color: string; name: string }[];
    size?: number;
    totalAmount?: number;
    currency?: string;
}

const DonutChart = ({ data, size = 200, totalAmount = 0, currency = 'VND' }: DonutChartProps) => {
    // This is still a placeholder chart. We can use react-native-svg or victory-native for real charts later.
    // For now, rendering a nice circular placeholder that matches the design.

    return (
        <View style={styles.container}>
            <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
                <Text style={styles.placeholderLabel}>Tổng</Text>
                <Text style={styles.placeholderTotal}>{formatCurrency(totalAmount, currency)}</Text>
            </View>
        </View>
    );
};

export default DonutChart;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    placeholder: {
        height: 160,
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    placeholderLabel: {
        fontSize: 14,
        fontFamily: FONTS.body,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    placeholderTotal: {
        fontSize: 20,
        fontFamily: FONTS.numbers,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    placeholderEmoji: {
        fontSize: 40,
        marginBottom: 8,
    },
    placeholderText: {
        color: '#94A3B8',
        fontWeight: '500',
    },
    legendContainer: {
        width: '100%',
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendLabel: {
        flex: 1,
        fontSize: 14,
        color: '#64748B',
    },
    legendPercent: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
});
