import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconName } from '../ui/Icon';
import { formatCurrency } from '../../utils/format';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';

interface TransactionItemProps {
    title: string;
    amount: number;
    type: 'income' | 'expense';
    date: Date;
    categoryIcon: IconName;
    categoryName: string;
}

export const TransactionItem = ({
    title,
    amount,
    type,
    date,
    categoryIcon,
    categoryName,
}: TransactionItemProps) => {
    const { currency } = useAppStore();
    const isExpense = type === 'expense';
    const iconBgColor = isExpense ? '#FFF0F0' : '#E8F5E9';
    const iconColor = isExpense ? COLORS.expense : COLORS.income;

    return (
        <View style={styles.container}>
            <View style={styles.leftSide}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                    <Icon name={categoryIcon} size={20} color={iconColor} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    <Text style={styles.subtitle}>{categoryName} • {formatDate(date)}</Text>
                </View>
            </View>
            <View style={styles.rightSide}>
                <Text style={[styles.amount, { color: isExpense ? COLORS.textMain : COLORS.income }]}>
                    {isExpense ? '-' : '+'}{formatCurrency(Math.abs(amount), currency)}
                </Text>
            </View>
        </View>
    );
};

function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        ...SHADOWS.sm,
    },
    leftSide: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily: FONTS.bodyBold,
        color: COLORS.textMain,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: FONTS.body,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    rightSide: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    amount: {
        fontSize: 16,
        fontFamily: FONTS.numbers,
        fontWeight: 'bold',
    },
});
