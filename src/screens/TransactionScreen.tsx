import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/ui/Icon';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import { getAllTransactions, deleteTransaction, updateTransaction, getAllCategories, TransactionWithCategory, CategoryRow } from '../db';
import { formatCurrency } from '../utils/format';
import { useAppStore } from '../store/appStore';

export const TransactionScreen = ({ navigation }: any) => {
    const { currency } = useAppStore();
    const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
    const [categories, setCategories] = useState<CategoryRow[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'expense' | 'income'>('all');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);

    // Edit modal state
    const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editNote, setEditNote] = useState('');

    // Action menu state
    const [actionTransaction, setActionTransaction] = useState<TransactionWithCategory | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = () => {
        setTransactions(getAllTransactions());
        setCategories(getAllCategories());
    };

    const filteredTransactions = transactions.filter((t) => {
        const matchesType = activeFilter === 'all' || t.category_type === activeFilter;
        const matchesCategory = selectedCategoryId === null || t.category_id === selectedCategoryId;
        const matchesSearch = searchQuery === '' ||
            (t.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesCategory && matchesSearch;
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

    const handleDelete = (id: number) => {
        Alert.alert('Xóa giao dịch', 'Bạn có chắc muốn xóa giao dịch này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: () => {
                    deleteTransaction(id);
                    loadData();
                }
            },
        ]);
    };

    const handleEdit = (t: TransactionWithCategory) => {
        setEditingTransaction(t);
        setEditAmount(t.amount.toString());
        setEditNote(t.note || '');
    };

    const handleSaveEdit = () => {
        if (!editingTransaction) return;
        const amt = parseInt(editAmount.replace(/[^0-9]/g, ''), 10);
        if (isNaN(amt) || amt <= 0) return;
        updateTransaction(
            editingTransaction.id, amt, editingTransaction.type,
            editingTransaction.category_id, editNote || null, editingTransaction.date
        );
        setEditingTransaction(null);
        loadData();
    };

    const selectedCategoryName = selectedCategoryId
        ? categories.find(c => c.id === selectedCategoryId)?.name || 'Tất cả'
        : 'Tất cả';

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

                    {/* Category filter button */}
                    <TouchableOpacity
                        style={[styles.filterTab, selectedCategoryId !== null && styles.filterTabActive]}
                        onPress={() => setShowCategoryFilter(true)}
                    >
                        <Icon name="tune" size={14} color={selectedCategoryId ? COLORS.white : COLORS.textMuted} />
                        <Text style={[styles.filterTabText, { marginLeft: 4 }, selectedCategoryId !== null && styles.filterTabTextActive]}>
                            {selectedCategoryId ? selectedCategoryName : 'Danh mục'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Transaction list */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
                                    <TouchableOpacity key={t.id} style={styles.transactionItem} onLongPress={() => handleEdit(t)} activeOpacity={0.7}>
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
                                        <TouchableOpacity style={styles.moreBtn} onPress={() => setActionTransaction(t)}>
                                            <Icon name="dots-vertical" size={18} color={COLORS.textMuted} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Action Menu Modal */}
            <Modal visible={!!actionTransaction} transparent animationType="fade" onRequestClose={() => setActionTransaction(null)}>
                <TouchableOpacity style={styles.actionOverlay} activeOpacity={1} onPress={() => setActionTransaction(null)}>
                    <View style={styles.actionSheet}>
                        <Text style={styles.actionTitle} numberOfLines={1}>
                            {actionTransaction?.note || actionTransaction?.category_name}
                        </Text>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            const t = actionTransaction;
                            setActionTransaction(null);
                            if (t) handleEdit(t);
                        }}>
                            <Icon name="edit" size={20} color={COLORS.primary} />
                            <Text style={styles.actionItemText}>Sửa giao dịch</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            const id = actionTransaction?.id;
                            setActionTransaction(null);
                            if (id) handleDelete(id);
                        }}>
                            <Icon name="delete" size={20} color={COLORS.expense} />
                            <Text style={[styles.actionItemText, { color: COLORS.expense }]}>Xóa giao dịch</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionItem, { borderBottomWidth: 0 }]} onPress={() => setActionTransaction(null)}>
                            <Text style={[styles.actionItemText, { color: COLORS.textMuted, textAlign: 'center', flex: 1 }]}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Category Filter Modal */}
            <Modal visible={showCategoryFilter} transparent animationType="slide" onRequestClose={() => setShowCategoryFilter(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Lọc theo danh mục</Text>
                            <TouchableOpacity onPress={() => setShowCategoryFilter(false)}>
                                <Icon name="close" size={24} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            <TouchableOpacity
                                style={[styles.catFilterItem, selectedCategoryId === null && styles.catFilterItemActive]}
                                onPress={() => { setSelectedCategoryId(null); setShowCategoryFilter(false); }}
                            >
                                <Icon name="apps" size={20} color={COLORS.primary} />
                                <Text style={[styles.catFilterText, selectedCategoryId === null && { color: COLORS.primary, fontFamily: FONTS.bodySemiBold }]}>Tất cả danh mục</Text>
                            </TouchableOpacity>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.catFilterItem, selectedCategoryId === cat.id && styles.catFilterItemActive]}
                                    onPress={() => { setSelectedCategoryId(cat.id); setShowCategoryFilter(false); }}
                                >
                                    <View style={[styles.catFilterIcon, { backgroundColor: cat.color + '20' }]}>
                                        <Icon name={cat.icon as any} size={18} color={cat.color} />
                                    </View>
                                    <Text style={[styles.catFilterText, selectedCategoryId === cat.id && { color: COLORS.primary, fontFamily: FONTS.bodySemiBold }]}>
                                        {cat.name}
                                    </Text>
                                    <Text style={styles.catFilterType}>
                                        {cat.type === 'expense' ? 'Chi' : 'Thu'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Edit Transaction Modal */}
            <Modal visible={!!editingTransaction} transparent animationType="slide" onRequestClose={() => setEditingTransaction(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sửa giao dịch</Text>
                            <TouchableOpacity onPress={() => setEditingTransaction(null)}>
                                <Icon name="close" size={24} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>SỐ TIỀN</Text>
                        <TextInput
                            style={styles.editInput}
                            keyboardType="numeric"
                            value={editAmount}
                            onChangeText={setEditAmount}
                            placeholder="Nhập số tiền"
                        />

                        <Text style={styles.inputLabel}>GHI CHÚ</Text>
                        <TextInput
                            style={styles.editInput}
                            value={editNote}
                            onChangeText={setEditNote}
                            placeholder="Ghi chú"
                        />

                        <View style={styles.editBtnRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingTransaction(null)}>
                                <Text style={styles.cancelBtnText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                                <Text style={styles.saveBtnText}>Lưu</Text>
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
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        borderRadius: 9999, paddingHorizontal: 16, height: 48, ...SHADOWS.soft, marginBottom: 12,
    },
    searchInput: {
        flex: 1, marginLeft: 12, fontFamily: FONTS.bodyMedium, fontSize: 15, color: COLORS.textMain,
    },
    filterTabs: {
        flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap',
    },
    filterTab: {
        flexDirection: 'row', alignItems: 'center',
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
    moreBtn: {
        width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        marginLeft: 6,
    },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontFamily: FONTS.heading, color: COLORS.textMuted },

    // Modal styles
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

    // Action sheet
    actionOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
    },
    actionSheet: {
        backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20,
    },
    actionTitle: {
        fontFamily: FONTS.heading, fontSize: 16, color: COLORS.textMain,
        textAlign: 'center', marginBottom: 16, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    actionItem: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    actionItemText: {
        fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textMain,
    },
    inputLabel: {
        fontSize: 13, fontFamily: FONTS.bodyBold, color: COLORS.textMuted, marginBottom: 8, letterSpacing: 0.5,
    },
    editInput: {
        backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textMain, marginBottom: 16,
    },
    editBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center',
    },
    cancelBtnText: { fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted, fontSize: 16 },
    saveBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center',
    },
    saveBtnText: { fontFamily: FONTS.bodySemiBold, color: COLORS.white, fontSize: 16 },

    // Category filter styles
    catFilterItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    catFilterItemActive: {
        backgroundColor: COLORS.primary + '10', borderRadius: 12,
        paddingHorizontal: 12, marginHorizontal: -8,
    },
    catFilterIcon: {
        width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    },
    catFilterText: {
        flex: 1, marginLeft: 12, fontFamily: FONTS.bodyMedium, fontSize: 15, color: COLORS.textMain,
    },
    catFilterType: {
        fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted,
        backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    },
});
