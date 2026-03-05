import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/ui/Icon';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import { getAllBudgets, getTransactionsByMonth, addBudget, updateBudget, deleteBudget, getCategoriesByType, CategoryRow, BudgetWithCategory } from '../db';
import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../utils/format';

interface BudgetWithSpent extends BudgetWithCategory {
    spent: number;
}

export const BudgetScreen = ({ navigation }: any) => {
    const { selectedMonth, selectedYear, currency } = useAppStore();
    const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);

    // Create modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [categories, setCategories] = useState<CategoryRow[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(null);
    const [budgetName, setBudgetName] = useState('');
    const [limitAmount, setLimitAmount] = useState('');

    // Edit budget state
    const [editingBudget, setEditingBudget] = useState<BudgetWithSpent | null>(null);
    const [editName, setEditName] = useState('');
    const [editLimitAmount, setEditLimitAmount] = useState('');

    // 3-dot menu
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadBudgets();
        }, [selectedMonth, selectedYear])
    );

    const loadBudgets = () => {
        const allBudgets = getAllBudgets();
        const monthTransactions = getTransactionsByMonth(selectedMonth, selectedYear);

        const budgetsWithSpent: BudgetWithSpent[] = allBudgets.map(budget => {
            // Tính chi tiêu: giao dịch gán budget_id hoặc cùng category_id
            const spent = monthTransactions
                .filter(t =>
                    (t.budget_id === budget.id || (t.budget_id === null && t.category_id === budget.category_id))
                    && t.category_type === 'expense'
                )
                .reduce((sum, t) => sum + t.amount, 0);
            return { ...budget, spent };
        });

        // "Khác" virtual budget for unbudgeted expenses
        const budgetedCategoryIds = allBudgets.map(b => b.category_id);
        const budgetIds = allBudgets.map(b => b.id);
        const otherSpent = monthTransactions
            .filter(t =>
                !budgetedCategoryIds.includes(t.category_id)
                && (t.budget_id === null || !budgetIds.includes(t.budget_id))
                && t.category_type === 'expense'
            )
            .reduce((sum, t) => sum + t.amount, 0);

        if (otherSpent > 0 || budgetsWithSpent.length === 0) {
            budgetsWithSpent.push({
                id: 999,
                name: 'Khác',
                category_id: 999,
                category_name: 'Khác',
                category_icon: 'more-horiz',
                category_color: '#6B7280',
                limit_amount: 0,
                spent: otherSpent,
                month: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
            } as BudgetWithSpent);
        }

        setBudgets(budgetsWithSpent);
    };

    const handleOpenModal = () => {
        const expenseCategories = getCategoriesByType('expense');
        setCategories(expenseCategories);
        setSelectedCategory(null);
        setBudgetName('');
        setLimitAmount('');
        setIsModalVisible(true);
    };

    const handleSaveBudget = () => {
        if (!selectedCategory || !limitAmount.trim() || !budgetName.trim()) return;

        const amount = parseInt(limitAmount.replace(/[^0-9]/g, ''), 10);
        if (isNaN(amount) || amount <= 0) return;

        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        addBudget(budgetName.trim(), selectedCategory.id, amount, monthStr);
        setIsModalVisible(false);
        loadBudgets();
    };

    const handleEditBudget = (budget: BudgetWithSpent) => {
        if (budget.id === 999) return;
        setEditingBudget(budget);
        setEditName(budget.name);
        setEditLimitAmount(budget.limit_amount.toString());
    };

    const handleSaveEditBudget = () => {
        if (!editingBudget || !editName.trim()) return;
        const amount = parseInt(editLimitAmount.replace(/[^0-9]/g, ''), 10);
        if (isNaN(amount) || amount <= 0) return;
        updateBudget(editingBudget.id, editName.trim(), amount);
        setEditingBudget(null);
        loadBudgets();
    };

    const handleDeleteBudget = (budget: BudgetWithSpent) => {
        if (budget.id === 999) return;
        Alert.alert('Xóa ngân sách', `Xóa ngân sách "${budget.name}"?`, [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: () => { deleteBudget(budget.id); loadBudgets(); } },
        ]);
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
                        {percentage >= 100 ? 'Đã vượt ngân sách!' : `Bạn đã dùng ${percentage < 1 && percentage > 0 ? '< 1' : percentage.toFixed(0)}% ngân sách tháng này`}
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
                                    {b.id !== 999 && (
                                        <TouchableOpacity
                                            onPress={() => setActiveMenuId(activeMenuId === b.id ? null : b.id)}
                                            style={styles.budgetActionBtn}
                                        >
                                            <Icon name="dots-vertical" size={18} color={COLORS.textMuted} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {activeMenuId === b.id && (
                                    <View style={styles.popupMenu}>
                                        <TouchableOpacity style={styles.popupItem} onPress={() => { setActiveMenuId(null); handleEditBudget(b); }}>
                                            <Icon name="edit" size={16} color={COLORS.primary} />
                                            <Text style={styles.popupText}>Sửa</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.popupItem} onPress={() => { setActiveMenuId(null); handleDeleteBudget(b); }}>
                                            <Icon name="delete" size={16} color={COLORS.expense} />
                                            <Text style={[styles.popupText, { color: COLORS.expense }]}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <Text style={styles.budgetName} numberOfLines={1}>{b.name || b.category_name}</Text>
                                <Text style={styles.catLabel} numberOfLines={1}>{b.category_name}</Text>
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

            {/* Create Budget Modal */}
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

                        {/* Budget Name */}
                        <Text style={styles.inputLabel}>TÊN NGÂN SÁCH</Text>
                        <TextInput
                            style={styles.textInputField}
                            placeholder="VD: Xăng xe tháng 3"
                            placeholderTextColor={COLORS.textMuted}
                            value={budgetName}
                            onChangeText={setBudgetName}
                        />

                        {/* Category Selection */}
                        <Text style={styles.inputLabel}>THỂ LOẠI</Text>
                        <FlatList
                            horizontal
                            data={categories}
                            keyExtractor={(item) => item.id.toString()}
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: 16, maxHeight: 80 }}
                            contentContainerStyle={{ gap: 10 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.catChip,
                                        selectedCategory?.id === item.id && styles.catChipActive
                                    ]}
                                    onPress={() => setSelectedCategory(item)}
                                >
                                    <Icon
                                        name={item.icon as any}
                                        size={18}
                                        color={selectedCategory?.id === item.id ? COLORS.white : COLORS.textMuted}
                                    />
                                    <Text
                                        style={[
                                            styles.catChipText,
                                            selectedCategory?.id === item.id && styles.catChipTextActive
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />

                        {/* Limit Amount */}
                        <Text style={styles.inputLabel}>HẠN MỨC (VNĐ)</Text>
                        <TextInput
                            style={styles.textInputField}
                            placeholder="500000"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric"
                            value={limitAmount}
                            onChangeText={setLimitAmount}
                        />

                        {/* Buttons */}
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity
                                style={styles.modalBtnCancel}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.modalBtnCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveBudget}>
                                <Text style={styles.modalBtnSaveText}>Tạo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Budget Modal */}
            <Modal visible={!!editingBudget} transparent animationType="slide" onRequestClose={() => setEditingBudget(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sửa ngân sách</Text>
                            <TouchableOpacity onPress={() => setEditingBudget(null)}>
                                <Icon name="close" size={24} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {editingBudget && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View style={[styles.catIconWrapper, { marginRight: 12 }]}>
                                    <Icon name={editingBudget.category_icon as any || 'cash'} size={20} color={COLORS.primary} />
                                </View>
                                <Text style={{ fontFamily: FONTS.heading, fontSize: 15, color: COLORS.textMuted }}>{editingBudget.category_name}</Text>
                            </View>
                        )}

                        <Text style={styles.inputLabel}>TÊN</Text>
                        <TextInput
                            style={styles.textInputField}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Tên ngân sách"
                        />

                        <Text style={styles.inputLabel}>HẠN MỨC MỚI</Text>
                        <TextInput
                            style={styles.textInputField}
                            keyboardType="numeric"
                            value={editLimitAmount}
                            onChangeText={setEditLimitAmount}
                            placeholder="Nhập hạn mức"
                        />

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setEditingBudget(null)}>
                                <Text style={styles.modalBtnCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveEditBudget}>
                                <Text style={styles.modalBtnSaveText}>Lưu</Text>
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
        paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.sm,
    },
    screenTitle: { fontSize: 24, fontFamily: FONTS.heading, color: COLORS.textMain },
    scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },

    // Overview
    overviewCard: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.card, padding: SPACING.xxl,
        ...SHADOWS.floating, marginBottom: SPACING.xxl,
    },
    overviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xl },
    overviewLeft: { flex: 1 },
    overviewRight: { alignItems: 'flex-end', marginLeft: 16 },
    overviewLabel: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
    overviewAmount: { fontFamily: FONTS.numbers, fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
    overviewSpent: { fontFamily: FONTS.numbers, fontSize: 14, fontWeight: '600', color: COLORS.expense },
    overviewTotal: { fontFamily: FONTS.numbers, fontSize: 13, color: COLORS.textMuted },
    progressTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
    progressFill: { height: '100%', backgroundColor: COLORS.budgetFill, borderRadius: 3 },
    overviewDesc: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },

    // Section
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    sectionTitle: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.textMain },

    // Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
    addCard: {
        width: '47%', height: 150, backgroundColor: COLORS.white, borderRadius: RADIUS.card,
        alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.primarySoft,
        borderStyle: 'dashed',
    },
    iconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    addCardText: { fontFamily: FONTS.heading, fontSize: 14, color: COLORS.primary },
    budgetCard: {
        width: '47%', backgroundColor: COLORS.white, borderRadius: RADIUS.card,
        padding: SPACING.lg, ...SHADOWS.soft,
    },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    catIconWrapper: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primarySoft + '30',
        alignItems: 'center', justifyContent: 'center',
    },
    budgetActionBtn: {
        width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    popupMenu: {
        position: 'absolute', top: 44, right: 0, zIndex: 10,
        backgroundColor: COLORS.white, borderRadius: 12, paddingVertical: 4,
        ...SHADOWS.floating, minWidth: 120,
    },
    popupItem: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8,
    },
    popupText: {
        fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.textMain,
    },
    budgetName: { fontFamily: FONTS.heading, fontSize: 14, color: COLORS.textMain, marginBottom: 2 },
    catLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, marginBottom: 6 },
    spentAmount: { fontFamily: FONTS.numbers, fontSize: 16, fontWeight: '600', color: COLORS.textMain },
    totalAmount: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted },
    miniProgressTrack: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
    miniProgressFill: { height: '100%', backgroundColor: COLORS.budgetFill, borderRadius: 2 },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.card, borderTopRightRadius: RADIUS.card,
        padding: SPACING.xxl, paddingBottom: 100, ...SHADOWS.floating,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: 20, fontFamily: FONTS.heading, color: COLORS.textMain,
    },
    inputLabel: {
        fontSize: 13, fontFamily: FONTS.bodyBold, color: COLORS.textMuted, marginBottom: 8, letterSpacing: 0.5,
    },
    textInputField: {
        backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textMain, marginBottom: 16,
    },
    catChip: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 9999, backgroundColor: '#F1F5F9', gap: 6,
    },
    catChipActive: { backgroundColor: COLORS.primary },
    catChipText: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.textMuted },
    catChipTextActive: { color: COLORS.white },
    modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    modalBtnCancel: {
        flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center',
    },
    modalBtnCancelText: { fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted, fontSize: 16 },
    modalBtnSave: {
        flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center',
    },
    modalBtnSaveText: { fontFamily: FONTS.bodySemiBold, color: COLORS.white, fontSize: 16 },
});
