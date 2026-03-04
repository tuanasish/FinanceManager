import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../components/ui/Icon';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import { getAllTransactions, TransactionWithCategory } from '../db';
import { formatCurrency } from '../utils/format';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }: any) => {
    const { currency, userName, userAvatar } = useAppStore();
    const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = () => {
        const all = getAllTransactions();
        setTransactions(all.slice(0, 5));

        let income = 0;
        let expense = 0;
        all.forEach((t) => {
            if (t.category_type === 'income') income += t.amount;
            else expense += t.amount;
        });
        setTotalIncome(income);
        setTotalExpense(expense);
    };

    const balance = totalIncome - totalExpense;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng!';
        if (hour < 18) return 'Chào buổi chiều!';
        return 'Chào buổi tối!';
    };



    const getCategoryColor = (type: string) => {
        return type === 'income' ? COLORS.income : COLORS.expense;
    };

    const formatDate = (timestamp: number) => {
        const d = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return d.toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' });
        if (days === 1) return 'Hôm qua';
        return d.toLocaleDateString('vi');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{userAvatar || '👋'}</Text>
                        </View>
                        <View>
                            <Text style={styles.greeting}>{getGreeting()}</Text>
                            <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notifBtn}>
                        <Icon name="notifications" color={COLORS.textMain} size={22} />
                    </TouchableOpacity>
                </View>

                {/* Balance Card */}
                <View style={styles.balanceCardWrapper}>
                    <View style={styles.balanceCardGlow} />
                    <View style={styles.balanceCard}>
                        <View style={styles.balanceCardBg}>
                            <View style={styles.balanceDecorTR} />
                            <View style={styles.balanceDecorBL} />
                        </View>
                        <View style={styles.balanceContent}>
                            <Text style={styles.balanceLabel}>Tổng số dư</Text>
                            <Text style={styles.balanceAmount}>
                                {formatCurrency(balance, currency)}
                            </Text>
                            <View style={styles.trendBadge}>
                                <Icon name="trending-up" color={COLORS.white} size={14} />
                                <Text style={styles.trendText}>Tháng này</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Income / Expense Grid */}
                <View style={styles.summaryGrid}>
                    <View style={[styles.summaryCard, { backgroundColor: 'rgba(167,215,197,0.2)', borderColor: 'rgba(167,215,197,0.3)' }]}>
                        <View style={styles.summaryCardDecor} />
                        <View style={styles.summaryRow}>
                            <View style={[styles.summaryIcon, { backgroundColor: COLORS.white }]}>
                                <Icon name="arrow-downward" color={COLORS.income} size={18} />
                            </View>
                            <Text style={styles.summaryLabel}>THU NHẬP</Text>
                        </View>
                        <Text style={styles.summaryAmount}>+ {formatCurrency(totalIncome, currency)}</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: 'rgba(244,166,166,0.2)', borderColor: 'rgba(244,166,166,0.3)' }]}>
                        <View style={[styles.summaryCardDecor, { backgroundColor: 'rgba(244,166,166,0.3)' }]} />
                        <View style={styles.summaryRow}>
                            <View style={[styles.summaryIcon, { backgroundColor: COLORS.white }]}>
                                <Icon name="arrow-upward" color={COLORS.expense} size={18} />
                            </View>
                            <Text style={styles.summaryLabel}>CHI TIÊU</Text>
                        </View>
                        <Text style={styles.summaryAmount}>- {formatCurrency(totalExpense, currency)}</Text>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Vừa chi tiêu</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                        <Text style={styles.sectionLink}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.transactionList}>
                    {transactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
                        </View>
                    ) : (
                        transactions.map((t) => (
                            <View key={t.id} style={styles.transactionItem}>
                                <View style={[
                                    styles.transactionIcon,
                                    { backgroundColor: t.category_type === 'income' ? '#E8F5E9' : '#FFF0F0' }
                                ]}>
                                    <Icon
                                        name={t.category_icon as any || 'cash'}
                                        color={getCategoryColor(t.category_type)}
                                        size={22}
                                    />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionName} numberOfLines={1}>
                                        {t.note || t.category_name}
                                    </Text>
                                    <Text style={styles.transactionMeta} numberOfLines={1}>
                                        {t.category_name} • {formatDate(t.date)}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.transactionAmount,
                                    { color: t.category_type === 'income' ? COLORS.income : COLORS.expense }
                                ]}>
                                    {t.category_type === 'income' ? '+' : '-'} {formatCurrency(t.amount, currency)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: SPACING.xxl,
        paddingTop: SPACING.lg,
        paddingBottom: 120,
        gap: SPACING.xl,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
        ...SHADOWS.sm,
    },
    avatarText: {
        fontSize: 22,
    },
    greeting: {
        fontSize: 12,
        fontFamily: FONTS.bodySemiBold,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    userName: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: COLORS.textMain,
    },
    notifBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    // Balance Card
    balanceCardWrapper: {
        position: 'relative',
    },
    balanceCardGlow: {
        position: 'absolute',
        top: 16,
        left: '10%',
        right: '10%',
        bottom: 0,
        backgroundColor: 'rgba(136,179,200,0.2)',
        borderRadius: 60,
        // blur not available in RN, use opacity as approximation
    },
    balanceCard: {
        height: 190,
        borderRadius: RADIUS.card,
        overflow: 'hidden',
        ...SHADOWS.soft,
    },
    balanceCardBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.income,
        // Gradient simulation: income -> primary
    },
    balanceDecorTR: {
        position: 'absolute',
        right: -30,
        top: -30,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    balanceDecorBL: {
        position: 'absolute',
        left: -20,
        bottom: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    balanceContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xxl,
    },
    balanceLabel: {
        fontSize: 14,
        fontFamily: FONTS.subheading,
        color: COLORS.white,
        opacity: 0.9,
        letterSpacing: 1,
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 36,
        fontFamily: FONTS.numbers,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginTop: 12,
    },
    trendText: {
        fontSize: 12,
        fontFamily: FONTS.bodySemiBold,
        color: COLORS.white,
    },
    // Summary Grid
    summaryGrid: {
        flexDirection: 'row',
        gap: SPACING.lg,
    },
    summaryCard: {
        flex: 1,
        padding: SPACING.lg,
        borderRadius: RADIUS.card,
        borderWidth: 1,
        overflow: 'hidden',
    },
    summaryCardDecor: {
        position: 'absolute',
        right: -16,
        top: -16,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(167,215,197,0.3)',
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    summaryIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    summaryLabel: {
        fontSize: 11,
        fontFamily: FONTS.bodyBold,
        color: COLORS.textMuted,
        letterSpacing: 1,
    },
    summaryAmount: {
        fontSize: 18,
        fontFamily: FONTS.numbers,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    // Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.textMain,
    },
    sectionLink: {
        fontSize: 14,
        fontFamily: FONTS.bodySemiBold,
        color: COLORS.primary,
    },
    // Transaction List
    transactionList: {
        gap: 12,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...SHADOWS.sm,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionInfo: {
        flex: 1,
        marginLeft: 16,
    },
    transactionName: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.textMain,
    },
    transactionMeta: {
        fontSize: 12,
        fontFamily: FONTS.body,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: 16,
        fontFamily: FONTS.numbers,
        fontWeight: 'bold',
    },
    // Empty
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: FONTS.heading,
        color: COLORS.textMuted,
    },
});
