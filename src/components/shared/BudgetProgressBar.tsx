import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/format';

interface BudgetProgressBarProps {
    categoryName: string;
    categoryIcon: string;
    limitAmount: number;
    spentAmount: number;
}

const BudgetProgressBar = ({ categoryName, limitAmount, spentAmount }: BudgetProgressBarProps) => {
    const percentage = limitAmount > 0 ? Math.min((spentAmount / limitAmount) * 100, 100) : 0;
    const isOverBudget = spentAmount > limitAmount;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.categoryName}>{categoryName}</Text>
                <Text style={styles.amountText}>
                    {formatCurrency(spentAmount)}{' '}
                    <Text style={styles.limitText}>/ {formatCurrency(limitAmount)}</Text>
                </Text>
            </View>
            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: isOverBudget ? '#EF4444' : '#3B82F6',
                        },
                    ]}
                />
            </View>
            {isOverBudget && (
                <Text style={styles.overBudgetText}>Đã vượt quá ngân sách!</Text>
            )}
        </View>
    );
};

export default BudgetProgressBar;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    amountText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    limitText: {
        color: '#94A3B8',
        fontWeight: 'normal',
        fontSize: 13,
    },
    barBackground: {
        height: 10,
        backgroundColor: '#F1F5F9',
        borderRadius: 5,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 5,
    },
    overBudgetText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        fontWeight: '500',
    },
});
