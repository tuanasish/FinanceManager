import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/ui/Icon';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import { getTransactionsByMonth, TransactionWithCategory } from '../db';
import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../utils/format';
import DonutChart from '../components/shared/DonutChart';
import LineChart from '../components/shared/LineChart';

export const ReportScreen = () => {
    const { selectedMonth, selectedYear, currency } = useAppStore();
    const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

    useFocusEffect(
        useCallback(() => {
            const data = getTransactionsByMonth(selectedMonth, selectedYear);
            setTransactions(data);
        }, [selectedMonth, selectedYear])
    );

    const filteredData = transactions.filter(t => t.category_type === activeTab);
    const totalAmount = filteredData.reduce((sum, t) => sum + t.amount, 0);

    // Group for Donut Chart & Top Spending
    const categoryTotals = filteredData.reduce((acc, t) => {
        if (!acc[t.category_id]) {
            acc[t.category_id] = {
                name: t.category_name,
                icon: t.category_icon,
                amount: 0,
                color: getCatColor(Object.keys(acc).length),
            };
        }
        acc[t.category_id].amount += t.amount;
        return acc;
    }, {} as Record<number, any>);

    const chartData = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount).map(item => ({
        ...item,
        percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
    }));

    // Data for Line Chart (Simplified: aggregate by 5-day intervals)
    const lineData = [10, 25, 15, 45, 30, 60, 40]; // Dummy data for visual

    function getCatColor(index: number) {
        const colors = [COLORS.expense, COLORS.primary, COLORS.budgetWarning, COLORS.income, '#AB47BC', '#29B6F6'];
        return colors[index % colors.length];
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Báo Cáo</Text>
                <TouchableOpacity style={styles.notifBtn}>
                    <Icon name="more-horiz" color={COLORS.textMain} size={22} />
                </TouchableOpacity>
            </View>

            {/* Filter */}
            <View style={styles.filterRow}>
                <TouchableOpacity style={styles.dateSelector}>
                    <Text style={styles.dateText}>Tháng {selectedMonth}/{selectedYear}</Text>
                    <Icon name="expand-more" size={20} color={COLORS.textMain} />
                </TouchableOpacity>

                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, activeTab === 'expense' && styles.typeBtnActiveExp]}
                        onPress={() => setActiveTab('expense')}
                    >
                        <Text style={[styles.typeText, activeTab === 'expense' && styles.typeTextActive]}>Chi Tiêu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, activeTab === 'income' && styles.typeBtnActiveInc]}
                        onPress={() => setActiveTab('income')}
                    >
                        <Text style={[styles.typeText, activeTab === 'income' && styles.typeTextActive]}>Thu Nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Total spending highlight */}
                <View style={styles.totalBadge}>
                    <Text style={styles.totalLabel}>
                        {activeTab === 'expense' ? 'Tổng chi tiêu' : 'Tổng thu nhập'}
                    </Text>
                    <Text style={[styles.totalAmount, { color: activeTab === 'expense' ? COLORS.expense : COLORS.income }]}>
                        {formatCurrency(totalAmount, currency)}
                    </Text>
                </View>

                {/* Donut Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.cardTitle}>Phân bổ danh mục</Text>
                    <View style={styles.donutContainer}>
                        {chartData.length > 0 ? (
                            <DonutChart data={chartData} size={200} totalAmount={totalAmount} currency={currency} />
                        ) : (
                            <View style={styles.emptyChart}>
                                <Text style={styles.emptyText}>Chưa có dữ liệu tháng này</Text>
                            </View>
                        )}
                    </View>

                    {/* Legend */}
                    {chartData.length > 0 && (
                        <View style={styles.legendContainer}>
                            {chartData.map((item, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                    <View style={styles.legendInfo}>
                                        <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.legendPercent}>{item.percentage.toFixed(1)}%</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Line Chart (Trend) */}
                <View style={styles.chartCard}>
                    <Text style={styles.cardTitle}>Xu hướng</Text>
                    <View style={styles.lineContainer}>
                        <LineChart data={lineData} color={activeTab === 'expense' ? COLORS.expense : COLORS.income} />
                    </View>
                </View>

                {/* Top Spending List */}
                {chartData.length > 0 && (
                    <View style={styles.topList}>
                        <Text style={[styles.cardTitle, { marginBottom: SPACING.lg }]}>Chi tiêu cao nhất</Text>
                        {chartData.map((item, index) => (
                            <View key={index} style={styles.topListItem}>
                                <View style={[styles.topListIcon, { backgroundColor: item.color + '20' }]}>
                                    <Icon name={item.icon || 'cash'} size={20} color={item.color} />
                                </View>
                                <View style={styles.topListInfo}>
                                    <View style={styles.topListHeader}>
                                        <Text style={styles.topListName}>{item.name}</Text>
                                        <Text style={styles.topListAmount}>{formatCurrency(item.amount, currency)}</Text>
                                    </View>
                                    <View style={styles.topListProgressBg}>
                                        <View style={[styles.topListProgressFill, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
    },
    screenTitle: { fontSize: 24, fontFamily: FONTS.heading, color: COLORS.textMain },
    notifBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white,
        alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm,
    },
    filterRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg,
    },
    dateSelector: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, gap: 4, ...SHADOWS.sm,
    },
    dateText: { fontSize: 13, fontFamily: FONTS.bodyBold, color: COLORS.textMain },
    typeSelector: {
        flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 9999, padding: 4, ...SHADOWS.sm,
    },
    typeBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 9999 },
    typeBtnActiveExp: { backgroundColor: COLORS.expense },
    typeBtnActiveInc: { backgroundColor: COLORS.income },
    typeText: { fontSize: 13, fontFamily: FONTS.bodyBold, color: COLORS.textMuted },
    typeTextActive: { color: COLORS.white },
    scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
    totalBadge: { alignItems: 'center', marginBottom: SPACING.xl },
    totalLabel: { fontSize: 13, fontFamily: FONTS.bodyBold, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
    totalAmount: { fontSize: 32, fontFamily: FONTS.numbers, fontWeight: 'bold' },
    chartCard: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.card, padding: SPACING.xl,
        marginBottom: SPACING.xl, ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border,
    },
    cardTitle: { fontSize: 16, fontFamily: FONTS.heading, color: COLORS.textMain, marginBottom: SPACING.lg },
    donutContainer: { alignItems: 'center', justifyContent: 'center', height: 220 },
    emptyChart: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontFamily: FONTS.body, color: COLORS.textMuted },
    legendContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: SPACING.lg },
    legendItem: { flexDirection: 'row', alignItems: 'center', width: '45%', gap: 8 },
    legendDot: { width: 12, height: 12, borderRadius: 6 },
    legendInfo: { flex: 1 },
    legendName: { fontSize: 13, fontFamily: FONTS.bodySemiBold, color: COLORS.textMain },
    legendPercent: { fontSize: 11, fontFamily: FONTS.body, color: COLORS.textMuted },
    lineContainer: { height: 160, alignItems: 'center', justifyContent: 'center' },
    topList: { backgroundColor: COLORS.white, borderRadius: RADIUS.card, padding: SPACING.xl, ...SHADOWS.soft, borderWidth: 1, borderColor: COLORS.border },
    topListItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
    topListIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    topListInfo: { flex: 1, marginLeft: 16 },
    topListHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    topListName: { fontSize: 14, fontFamily: FONTS.bodyBold, color: COLORS.textMain },
    topListAmount: { fontSize: 14, fontFamily: FONTS.numbers, color: COLORS.textMain, fontWeight: 'bold' },
    topListProgressBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
    topListProgressFill: { height: '100%', borderRadius: 3 },
});
