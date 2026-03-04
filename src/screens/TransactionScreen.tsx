import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/ui/Icon';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import { getAllTransactions, TransactionWithCategory } from '../db';
import { formatCurrency } from '../utils/format';
import { useAppStore } from '../store/appStore';

export const TransactionScreen = () => {
    const { currency } = useAppStore();
    const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'expense' | 'income'>('all');

    useFocusEffect(
        useCallback(() => {
            const all = getAllTransactions();
            setTransactions(all);
        }, [])
    );

    const filteredTransactions = transactions.filter((t) => {
        const matchesFilter = activeFilter === 'all' || t.category_type === activeFilter;
        const matchesSearch = searchQuery === '' ||
            (t.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Group by date
    const grouped = filteredTransactions.reduce((acc, t) => {
        const date = new Date(t.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let label: string;
        if (date.toDateString() === today.toDateString()) {
            label = `Hôm nay, ${date.getDate()}/${date.getMonth() + 1}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            label = `Hôm qua, ${date.getDate()}/${date.getMonth() + 1}`;
        } else {
            label = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        }

        if (!acc[label]) acc[label] = [];
        acc[label].push(t);
        return acc;
    }, {} as Record<string, TransactionWithCategory[]>);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.screenTitle}>Sổ Giao Dịch</Text>

                </View>

                {/* Search */}
                <View style={styles.searchBar}>
                    <Icon name="search" color={COLORS.primary} size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm bánh mì, grab..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter tabs */}
                <View style={styles.filterTabs}>
                    {(['all', 'expense', 'income'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
                            onPress={() => setActiveFilter(f)}
                        >
                            <Text style={[styles.filterTabText, activeFilter === f && styles.filterTabTextActive]}>
                                {f === 'all' ? 'Tất cả' : f === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Transaction list */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Timeline line */}
                {Object.keys(grouped).length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
                    </View>
                ) : (
                    Object.entries(grouped).map(([dateLabel, items]) => (
                        <View key={dateLabel} style={styles.dateGroup}>
                            <View style={styles.dateLabel}>
                                <Text style={styles.dateLabelText}>{dateLabel}</Text>
                            </View>
                            <View style={styles.dateItems}>
                                {items.map((t) => (
                                    <View key={t.id} style={styles.transactionItem}>
                                        <View style={[
                                            styles.transactionIcon,
                                            { backgroundColor: t.category_type === 'income' ? '#E8F5E9' : '#FFF0F0' }
                                        ]}>
                                            <Icon
                                                name={t.category_icon as any || 'cash'}
                                                color={t.category_type === 'income' ? COLORS.income : COLORS.expense}
                                                size={22}
                                            />
                                        </View>
                                        <View style={styles.transactionInfo}>
                                            <Text style={styles.transactionName} numberOfLines={1}>
                                                {t.note || t.category_name}
                                            </Text>
                                            <Text style={styles.transactionMeta} numberOfLines={1}>
                                                {t.category_name}
                                            </Text>
                                        </View>
                                        <Text style={[
                                            styles.transactionAmount,
                                            { color: t.category_type === 'income' ? COLORS.income : COLORS.expense }
                                        ]}>
                                            {t.category_type === 'income' ? '+' : '-'} {formatCurrency(t.amount, currency)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.background,
    },
    headerTop: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    },
    screenTitle: {
        fontSize: 24, fontFamily: FONTS.heading, color: COLORS.textMain,
    },
    filterBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white,
        alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm,
    },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        borderRadius: 9999, paddingHorizontal: 16, height: 48, ...SHADOWS.soft, marginBottom: 12,
    },
    searchInput: {
        flex: 1, marginLeft: 12, fontFamily: FONTS.bodyMedium, fontSize: 15, color: COLORS.textMain,
    },
    filterTabs: {
        flexDirection: 'row', gap: 8, marginBottom: 8,
    },
    filterTab: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, backgroundColor: COLORS.white,
    },
    filterTabActive: {
        backgroundColor: COLORS.primary,
    },
    filterTabText: {
        fontSize: 13, fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted,
    },
    filterTabTextActive: {
        color: COLORS.white,
    },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
    dateGroup: { marginTop: 16, marginBottom: 8 },
    dateLabel: {
        marginBottom: 8, alignSelf: 'flex-start',
    },
    dateLabelText: {
        fontSize: 12, fontFamily: FONTS.heading, color: COLORS.textMuted,
        textTransform: 'uppercase', letterSpacing: 1,
        backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 9999, ...SHADOWS.sm, overflow: 'hidden',
    },
    dateItems: { gap: 10 },
    transactionItem: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        backgroundColor: COLORS.white, borderRadius: 16, ...SHADOWS.soft,
    },
    transactionIcon: {
        width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    },
    transactionInfo: { flex: 1, marginLeft: 16 },
    transactionName: { fontSize: 15, fontFamily: FONTS.heading, color: COLORS.textMain },
    transactionMeta: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted, marginTop: 2 },
    transactionAmount: { fontSize: 17, fontFamily: FONTS.numbers, fontWeight: '500' },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontFamily: FONTS.heading, color: COLORS.textMuted },
});
