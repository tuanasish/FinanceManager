import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView, Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/Icon';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import { addTransaction, getCategoriesByType, getAllBudgets, CategoryRow, BudgetWithCategory } from '../db';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

export const AddTransactionScreen = ({ navigation }: any) => {
    const { currency } = useAppStore();
    const insets = useSafeAreaInsets();
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('0');
    const [note, setNote] = useState('');
    const [categories, setCategories] = useState<CategoryRow[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(null);

    // Budget selection
    const [budgets, setBudgets] = useState<BudgetWithCategory[]>([]);
    const [selectedBudget, setSelectedBudget] = useState<BudgetWithCategory | null>(null);
    const [showBudgetPicker, setShowBudgetPicker] = useState(false);

    const activeColor = type === 'expense' ? COLORS.expense : COLORS.income;

    React.useEffect(() => {
        const cats = getCategoriesByType(type);
        setCategories(cats);
        if (cats.length > 0) {
            setSelectedCategory(cats[0]);
        } else {
            setSelectedCategory(null);
        }

        // Load budgets for expense type
        if (type === 'expense') {
            const allBudgets = getAllBudgets();
            setBudgets(allBudgets);
        } else {
            setBudgets([]);
            setSelectedBudget(null);
        }
    }, [type]);

    // Auto-match budget when category changes
    React.useEffect(() => {
        if (selectedCategory && type === 'expense') {
            const matching = budgets.filter(b => b.category_id === selectedCategory.id);
            if (matching.length === 1) {
                setSelectedBudget(matching[0]);
            } else {
                setSelectedBudget(null);
            }
        }
    }, [selectedCategory, budgets]);

    const handleNumberPress = (num: string) => {
        if (amount === '0') {
            setAmount(num);
        } else {
            if (amount.length < 12) {
                setAmount(amount + num);
            }
        }
    };

    const handleBackspace = () => {
        if (amount.length > 1) {
            setAmount(amount.slice(0, -1));
        } else {
            setAmount('0');
        }
    };

    const handleSave = () => {
        if (amount === '0' || !selectedCategory) return;

        addTransaction(
            Number(amount),
            type,
            selectedCategory.id,
            note || null,
            Date.now(),
            selectedBudget?.id || null
        );
        navigation.goBack();
    };

    const formatDisplayAmount = (val: string) => {
        return new Intl.NumberFormat('vi-VN').format(Number(val));
    };

    const matchingBudgets = selectedCategory ? budgets.filter(b => b.category_id === selectedCategory.id) : [];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Icon name="close" size={24} color={COLORS.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thêm Giao Dịch</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Segmented Control */}
            <View style={styles.segmentedControl}>
                <TouchableOpacity
                    style={[styles.segment, type === 'expense' && { backgroundColor: COLORS.expense }]}
                    onPress={() => setType('expense')}
                >
                    <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>
                        Chi tiêu
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.segment, type === 'income' && { backgroundColor: COLORS.income }]}
                    onPress={() => setType('income')}
                >
                    <Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>
                        Thu nhập
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Amount Display */}
            <View style={styles.amountContainer}>
                <Text style={[styles.amountValue, { color: activeColor }]}>
                    {formatDisplayAmount(amount)}
                    <Text style={styles.currencySymbol}> {currency === 'VND' ? 'đ' : '$'}</Text>
                </Text>
            </View>

            {/* Note Input */}
            <View style={styles.noteContainer}>
                <Icon name="edit" size={20} color={COLORS.textMuted} />
                <TextInput
                    style={styles.noteInput}
                    placeholder="Thêm ghi chú..."
                    placeholderTextColor={COLORS.textMuted}
                    value={note}
                    onChangeText={setNote}
                    maxLength={50}
                />
            </View>

            {/* Budget Selector (only for expense) */}
            {type === 'expense' && matchingBudgets.length > 0 && (
                <TouchableOpacity
                    style={styles.budgetSelector}
                    onPress={() => setShowBudgetPicker(true)}
                >
                    <Icon name="wallet" size={20} color={selectedBudget ? COLORS.primary : COLORS.textMuted} />
                    <Text style={[styles.budgetSelectorText, selectedBudget && { color: COLORS.primary }]}>
                        {selectedBudget ? selectedBudget.name : 'Chọn ngân sách'}
                    </Text>
                    <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
            )}

            {/* Category Carousel */}
            <View style={styles.categorySection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryCard,
                                selectedCategory?.id === cat.id && {
                                    backgroundColor: type === 'expense' ? '#FFF0F0' : '#E8F5E9',
                                    borderColor: activeColor,
                                    borderWidth: 1.5,
                                }
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <View style={[
                                styles.categoryIconWrapper,
                                selectedCategory?.id === cat.id && { backgroundColor: activeColor }
                            ]}>
                                <Icon
                                    name={cat.icon as any}
                                    size={24}
                                    color={selectedCategory?.id === cat.id ? COLORS.white : COLORS.textMuted}
                                />
                            </View>
                            <Text style={[
                                styles.categoryName,
                                selectedCategory?.id === cat.id && { color: activeColor, fontFamily: FONTS.bodyBold }
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Numpad */}
            <View style={[styles.numpadContainer, { paddingBottom: insets.bottom || SPACING.xl }]}>
                <View style={styles.numpadRow}>
                    {['1', '2', '3'].map((num) => (
                        <TouchableOpacity key={num} style={styles.numKey} onPress={() => handleNumberPress(num)}>
                            <Text style={styles.numText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.numpadRow}>
                    {['4', '5', '6'].map((num) => (
                        <TouchableOpacity key={num} style={styles.numKey} onPress={() => handleNumberPress(num)}>
                            <Text style={styles.numText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.numpadRow}>
                    {['7', '8', '9'].map((num) => (
                        <TouchableOpacity key={num} style={styles.numKey} onPress={() => handleNumberPress(num)}>
                            <Text style={styles.numText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.numpadRow}>
                    <TouchableOpacity style={styles.numKey} onPress={() => handleNumberPress('000')}>
                        <Text style={styles.numText}>000</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.numKey} onPress={() => handleNumberPress('0')}>
                        <Text style={styles.numText}>0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.numKey} onPress={handleBackspace} onLongPress={() => setAmount('0')}>
                        <Icon name="backspace" size={28} color={COLORS.textMain} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: activeColor, opacity: amount === '0' ? 0.5 : 1 }]}
                    onPress={handleSave}
                    disabled={amount === '0'}
                >
                    <Text style={styles.saveBtnText}>Lưu giao dịch</Text>
                </TouchableOpacity>
            </View>

            {/* Budget Picker Modal */}
            <Modal visible={showBudgetPicker} transparent animationType="slide" onRequestClose={() => setShowBudgetPicker(false)}>
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerContent}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Chọn ngân sách</Text>
                            <TouchableOpacity onPress={() => setShowBudgetPicker(false)}>
                                <Icon name="close" size={24} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {/* Option: No budget */}
                            <TouchableOpacity
                                style={[styles.pickerItem, !selectedBudget && styles.pickerItemActive]}
                                onPress={() => { setSelectedBudget(null); setShowBudgetPicker(false); }}
                            >
                                <Icon name="close-circle" size={20} color={COLORS.textMuted} />
                                <Text style={styles.pickerItemText}>Không chọn</Text>
                            </TouchableOpacity>
                            {matchingBudgets.map(b => (
                                <TouchableOpacity
                                    key={b.id}
                                    style={[styles.pickerItem, selectedBudget?.id === b.id && styles.pickerItemActive]}
                                    onPress={() => { setSelectedBudget(b); setShowBudgetPicker(false); }}
                                >
                                    <Icon name={b.category_icon as any || 'wallet'} size={20} color={COLORS.primary} />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.pickerItemText}>{b.name}</Text>
                                        <Text style={styles.pickerItemSub}>{b.category_name} • Hạn mức: {new Intl.NumberFormat('vi-VN').format(b.limit_amount)}đ</Text>
                                    </View>
                                    {selectedBudget?.id === b.id && <Icon name="check" size={20} color={COLORS.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
    },
    closeBtn: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    headerTitle: {
        fontFamily: FONTS.heading,
        fontSize: 18,
        color: COLORS.textMain,
    },
    segmentedControl: {
        flexDirection: 'row',
        marginHorizontal: SPACING.xl,
        backgroundColor: COLORS.white,
        borderRadius: 9999,
        padding: 4,
        ...SHADOWS.sm,
        marginBottom: SPACING.xxl,
    },
    segment: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 9999,
    },
    segmentText: {
        fontFamily: FONTS.bodyBold,
        fontSize: 14,
        color: COLORS.textMuted,
    },
    segmentTextActive: {
        color: COLORS.white,
    },
    amountContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    amountValue: {
        fontFamily: FONTS.numbers,
        fontSize: 48,
        fontWeight: 'bold',
    },
    currencySymbol: {
        fontSize: 24,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.xl,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.btn,
        paddingHorizontal: SPACING.lg,
        height: 56,
        ...SHADOWS.sm,
        marginBottom: 12,
    },
    noteInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontFamily: FONTS.bodyMedium,
        fontSize: 16,
        color: COLORS.textMain,
    },
    budgetSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.xl,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.btn,
        paddingHorizontal: SPACING.lg,
        height: 48,
        ...SHADOWS.sm,
        marginBottom: SPACING.xxl,
        gap: 10,
    },
    budgetSelectorText: {
        flex: 1,
        fontFamily: FONTS.bodyMedium,
        fontSize: 15,
        color: COLORS.textMuted,
    },
    categorySection: {
        marginBottom: SPACING.xl,
    },
    categoryScroll: {
        paddingHorizontal: SPACING.xl,
        gap: SPACING.md,
    },
    categoryCard: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    categoryIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontFamily: FONTS.body,
        fontSize: 11,
        color: COLORS.textMuted,
    },
    numpadContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.xl,
        ...SHADOWS.floating,
        justifyContent: 'flex-end',
    },
    numpadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    numKey: {
        width: (width - 48 - 32) / 3,
        height: 60,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.btn,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numText: {
        fontFamily: FONTS.numbers,
        fontSize: 24,
        color: COLORS.textMain,
    },
    saveBtn: {
        height: 56,
        borderRadius: RADIUS.btn,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.md,
        ...SHADOWS.sm,
    },
    saveBtnText: {
        fontFamily: FONTS.heading,
        fontSize: 18,
        color: COLORS.white,
    },

    // Budget Picker Modal
    pickerOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    },
    pickerContent: {
        backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.card, borderTopRightRadius: RADIUS.card,
        padding: SPACING.xxl, paddingBottom: 100, ...SHADOWS.floating,
    },
    pickerHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl,
    },
    pickerTitle: {
        fontSize: 20, fontFamily: FONTS.heading, color: COLORS.textMain,
    },
    pickerItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    pickerItemActive: {
        backgroundColor: COLORS.primary + '10', borderRadius: 12,
    },
    pickerItemText: {
        marginLeft: 12, fontFamily: FONTS.bodyMedium, fontSize: 15, color: COLORS.textMain,
    },
    pickerItemSub: {
        marginLeft: 12, fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2,
    },
});
