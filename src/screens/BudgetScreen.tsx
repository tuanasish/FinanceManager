import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/ui/Icon';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import { getAllBudgets, getTransactionsByMonth, addBudget, getCategoriesByType, CategoryRow } from '../db';
import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../utils/format';

interface BudgetWithSpent {
    id: number;
    category_id: number;
    limit_amount: number;
    month: string;
    spent: number;
    category_name: string;
    category_icon: string;
    category_color: string;
    currency?: string;
}

export const BudgetScreen = ({ navigation }: any) => {
    const { selectedMonth, selectedYear, currency } = useAppStore();
    const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [categories, setCategories] = useState<CategoryRow[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(null);
    const [limitAmount, setLimitAmount] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadBudgets();
        }, [selectedMonth, selectedYear])
    );

    const loadBudgets = () => {
        const allBudgets = getAllBudgets();
        const monthTransactions = getTransactionsByMonth(selectedMonth, selectedYear);

        const budgetsWithSpent = allBudgets.map(budget => {
            const spent = monthTransactions
                .filter(t => t.category_id === budget.category_id && t.category_type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            return { ...budget, spent };
        });

        // Add "Khác" (Others) virtual budget
        const budgetedCategoryIds = allBudgets.map(b => b.category_id);
        const otherSpent = monthTransactions
            .filter(t => !budgetedCategoryIds.includes(t.category_id) && t.category_type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        if (otherSpent > 0 || budgetsWithSpent.length === 0) {
            budgetsWithSpent.push({
                id: 999,
                category_id: 999,
                category_name: 'Khác',
                category_icon: 'more-horiz',
                limit_amount: 0,
                spent: otherSpent,
                currency: 'VND',
                month: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
            } as BudgetWithSpent);
        }

        setBudgets(budgetsWithSpent);
    };

    const handleOpenModal = () => {
        const expenseCategories = getCategoriesByType('expense');
        setCategories(expenseCategories);
        setSelectedCategory(null);
        setLimitAmount('');
        setIsModalVisible(true);
    };

    const handleSaveBudget = () => {
        if (!selectedCategory || !limitAmount.trim()) return;

        const amount = parseInt(limitAmount.replace(/[^0-9]/g, ''), 10);
        if (isNaN(amount) || amount <= 0) return;

        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        addBudget(selectedCategory.id, amount, monthStr);
        setIsModalVisible(false);
        loadBudgets();
    };

    const totalBudget = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = Math.max(0, totalBudget - totalSpent);
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Ngân Sách</Text>
                <TouchableOpacity style={styles.notifBtn}>
                    <Icon name="tune" color={COLORS.textMain} size={22} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Overview Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.overviewTop}>
                        <View style={styles.overviewLeft}>
                            <Text style={styles.overviewLabel}>Còn lại có thể chi</Text>
                            <Text style={styles.overviewAmount}>{formatCurrency(remaining, currency)}</Text>
                        </View>
                        <View style={styles.overviewRight}>
                            <Text style={styles.overviewSpent}>Đã chi {formatCurrency(totalSpent, currency)}</Text>
                            <Text style={styles.overviewTotal}>/ {formatCurrency(totalBudget, currency)}</Text>
                        </View>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[
                            styles.progressFill,
                            { width: `${Math.min(percentage, 100)}%` },
                            percentage >= 100 && { backgroundColor: COLORS.expense }
                        ]} />
                    </View>
                    <Text style={styles.overviewDesc}>
                        {percentage >= 100 ? 'Đã vượt ngân sách!' : `Bạn đã dùng ${percentage.toFixed(0)}% ngân sách tháng này`}
                    </Text>
                </View>

                {/* Budget Details Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Chi tiết ngân sách</Text>
                </View>

                {/* Grid */}
                <View style={styles.grid}>
                    {/* Add Budget Card */}
                    <TouchableOpacity style={styles.addCard} onPress={handleOpenModal}>
                        <View style={[styles.iconWrapper, { backgroundColor: COLORS.primarySoft }]}>
                            <Icon name="add" size={24} color={COLORS.white} />
                        </View>
                        <Text style={styles.addCardText}>Tạo mới</Text>
                    </TouchableOpacity>

                    {budgets.map((b) => {
                        const bPercentage = b.limit_amount > 0 ? (b.spent / b.limit_amount) * 100 : (b.spent > 0 ? 100 : 0);
                        const isWarning = bPercentage >= 80 && bPercentage < 100;
                        const isExceeded = bPercentage >= 100;

                        return (
                            <View key={b.id} style={styles.budgetCard}>
                                <View style={styles.budgetHeader}>
                                    <View style={[
                                        styles.catIconWrapper,
                                        isExceeded ? { backgroundColor: '#FFF0F0' } :
                                            isWarning ? { backgroundColor: '#FFF8E1' } : {}
                                    ]}>
                                        <Icon
                                            name={b.category_icon || 'cash'}
                                            size={20}
                                            color={isExceeded ? COLORS.expense : isWarning ? COLORS.budgetWarning : COLORS.primary}
                                        />
                                    </View>
                                    <TouchableOpacity>
                                        <Icon name="more-vert" size={20} color={COLORS.textMuted} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.catName} numberOfLines={1}>{b.category_name}</Text>
                                <Text style={styles.spentAmount}>{formatCurrency(b.spent, currency)}</Text>
                                <Text style={styles.totalAmount}>/ {formatCurrency(b.limit_amount, currency)}</Text>

                                <View style={[styles.miniProgressTrack, { marginTop: 12 }]}>
                                    <View style={[
                                        styles.miniProgressFill,
                                        { width: `${Math.min(bPercentage, 100)}%` },
                                        isExceeded && { backgroundColor: COLORS.expense },
                                        isWarning && { backgroundColor: COLORS.budgetWarning }
                                    ]} />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Add Budget Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tạo ngân sách mới</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Icon name="close" size={24} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Category selector */}
                        <Text style={styles.inputLabel}>Chọn danh mục chi tiêu</Text>
                        <FlatList
                            data={categories}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.categoryList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory?.id === item.id && styles.categoryChipActive,
                                    ]}
                                    onPress={() => setSelectedCategory(item)}
                                >
                                    <View style={[
                                        styles.categoryChipIcon,
                                        selectedCategory?.id === item.id && { backgroundColor: COLORS.primarySoft + '40' },
                                    ]}>
                                        <Icon name={item.icon} size={18} color={selectedCategory?.id === item.id ? COLORS.primaryDark : COLORS.textMuted} />
                                    </View>
                                    <Text style={[
                                        styles.categoryChipText,
                                        selectedCategory?.id === item.id && styles.categoryChipTextActive,
                                    ]} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />

                        {/* Amount input */}
                        <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Hạn mức ({currency})</Text>
                        <TextInput
                            style={styles.input}
                            value={limitAmount}
                            onChangeText={setLimitAmount}
                            placeholder={currency === 'VND' ? 'Ví dụ: 2000000' : 'Ví dụ: 500'}
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric"
                        />

                        {/* Actions */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.modalBtnCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalBtn,
                                    styles.modalBtnSave,
                                    (!selectedCategory || !limitAmount.trim()) && { opacity: 0.5 },
                                ]}
                                onPress={handleSaveBudget}
                                disabled={!selectedCategory || !limitAmount.trim()}
                            >
                                <Text style={styles.modalBtnSaveText}>Tạo ngân sách</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
    overviewCard: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.card, padding: SPACING.xxl,
        ...SHADOWS.soft, marginBottom: SPACING.xxl, borderWidth: 1, borderColor: COLORS.border,
    },
    overviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.lg },
    overviewLeft: { flex: 1 },
    overviewLabel: { fontSize: 13, fontFamily: FONTS.bodyBold, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 4 },
    overviewAmount: { fontSize: 32, fontFamily: FONTS.numbers, fontWeight: 'bold', color: COLORS.primaryDark },
    overviewRight: { alignItems: 'flex-end' },
    overviewSpent: { fontSize: 13, fontFamily: FONTS.bodySemiBold, color: COLORS.textMain },
    overviewTotal: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted },
    progressTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.md },
    progressFill: { height: '100%', backgroundColor: COLORS.budgetFill, borderRadius: 4 },
    overviewDesc: { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted },
    sectionHeader: { marginBottom: SPACING.md },
    sectionTitle: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.textMain },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
    addCard: {
        width: '47%', aspectRatio: 1, backgroundColor: 'rgba(136,179,200,0.1)',
        borderRadius: RADIUS.lg, borderWidth: 2, borderColor: 'rgba(136,179,200,0.3)', borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center', gap: 12,
    },
    iconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    addCardText: { fontSize: 14, fontFamily: FONTS.bodySemiBold, color: COLORS.primary },
    budgetCard: {
        width: '47%', backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
        padding: SPACING.lg, ...SHADOWS.sm, borderWidth: 1, borderColor: '#F8FAFC',
    },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    catIconWrapper: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F7FA',
        alignItems: 'center', justifyContent: 'center',
    },
    catName: { fontSize: 14, fontFamily: FONTS.bodyBold, color: COLORS.textMain, marginBottom: 4 },
    spentAmount: { fontSize: 16, fontFamily: FONTS.numbers, color: COLORS.textMain, fontWeight: 'bold' },
    totalAmount: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted },
    miniProgressTrack: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
    miniProgressFill: { height: '100%', backgroundColor: COLORS.budgetFill, borderRadius: 2 },

    // Modal styles
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.card, borderTopRightRadius: RADIUS.card,
        padding: SPACING.xxl, paddingBottom: 40, ...SHADOWS.floating,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: 20, fontFamily: FONTS.heading, color: COLORS.textMain,
    },
    inputLabel: {
        fontSize: 13, fontFamily: FONTS.bodyBold, color: COLORS.textMuted, marginBottom: 10, letterSpacing: 0.5,
    },
    categoryList: {
        gap: 10, paddingVertical: 4,
    },
    categoryChip: {
        alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14,
        borderRadius: RADIUS.btn, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: 'transparent',
        minWidth: 72,
    },
    categoryChipActive: {
        borderColor: COLORS.primarySoft, backgroundColor: COLORS.primarySoft + '15',
    },
    categoryChipIcon: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9',
        alignItems: 'center', justifyContent: 'center',
    },
    categoryChipText: {
        fontSize: 11, fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted, textAlign: 'center',
    },
    categoryChipTextActive: {
        color: COLORS.primaryDark,
    },
    input: {
        borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.btn, paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 18, fontFamily: FONTS.numbers, color: COLORS.textMain, backgroundColor: '#F8FAFC',
    },
    modalActions: {
        flexDirection: 'row', gap: 12, marginTop: SPACING.xxl,
    },
    modalBtn: {
        flex: 1, paddingVertical: 14, borderRadius: RADIUS.btn, alignItems: 'center', justifyContent: 'center',
    },
    modalBtnCancel: {
        backgroundColor: '#F1F5F9',
    },
    modalBtnCancelText: {
        fontSize: 16, fontFamily: FONTS.bodyBold, color: COLORS.textMain,
    },
    modalBtnSave: {
        backgroundColor: COLORS.primary,
    },
    modalBtnSaveText: {
        fontSize: 16, fontFamily: FONTS.bodyBold, color: COLORS.white,
    },
});
