import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../components/ui/Icon';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import { useAppStore } from '../store/appStore';

interface SettingItemProps {
    icon: IconName;
    title: string;
    value?: string;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitch?: (val: boolean) => void;
    onPress?: () => void;
    color?: string;
    isDestructive?: boolean;
}

const SettingItem = ({
    icon, title, value, hasSwitch, switchValue, onSwitch, onPress, color = COLORS.primary, isDestructive
}: SettingItemProps) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={hasSwitch || !onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.settingIcon, { backgroundColor: isDestructive ? '#FFF0F0' : color + '20' }]}>
            <Icon name={icon} size={20} color={isDestructive ? COLORS.expense : color} />
        </View>
        <Text style={[styles.settingTitle, isDestructive && { color: COLORS.expense }]}>{title}</Text>

        {value && <Text style={styles.settingValue}>{value}</Text>}

        {hasSwitch ? (
            <Switch
                value={switchValue}
                onValueChange={onSwitch}
                trackColor={{ false: '#E2E8F0', true: COLORS.primarySoft }}
                thumbColor={switchValue ? COLORS.primary : '#fff'}
            />
        ) : (
            <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
        )}
    </TouchableOpacity>
);

export const SettingsScreen = () => {
    const { currency, setCurrency, isAppLocked, setAppLocked, userName, userAvatar, setUserName, setUserAvatar, setFirstLaunch } = useAppStore();
    const [isDarkMode, setIsDarkMode] = React.useState(false); // Mock for now

    // Edit Profile Modal State
    const [isEditProfileVisible, setIsEditProfileVisible] = React.useState(false);
    const [tempName, setTempName] = React.useState('');
    const [tempAvatar, setTempAvatar] = React.useState('');

    const toggleCurrency = () => {
        setCurrency(currency === 'VND' ? 'USD' : 'VND');
    };

    const handleOpenEditProfile = () => {
        setTempName(userName);
        setTempAvatar(userAvatar || '👋');
        setIsEditProfileVisible(true);
    };

    const handleSaveProfile = () => {
        setUserName(tempName.trim() || 'Bạn ơi');
        setUserAvatar(tempAvatar.trim() || '👋');
        setIsEditProfileVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Cài Đặt</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileCard}>
                    <View style={styles.profileAvatar}>
                        <Text style={styles.avatarEmoji}>{userAvatar || '👋'}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName} numberOfLines={1}>{userName}</Text>
                        <Text style={styles.profileEmail}>Người dùng cục bộ</Text>
                    </View>
                    <TouchableOpacity style={styles.editBtn} onPress={handleOpenEditProfile}>
                        <Icon name="edit" size={18} color={COLORS.primaryDark} />
                    </TouchableOpacity>
                </View>

                {/* Settings Groups */}
                <View style={styles.settingsGroup}>
                    <Text style={styles.groupTitle}>TÙY CHỈNH</Text>
                    <View style={styles.groupContent}>
                        <SettingItem
                            icon="payments"
                            title="Đơn vị tiền tệ"
                            value={currency}
                            onPress={toggleCurrency}
                            color={COLORS.income}
                        />
                    </View>
                </View>

                <View style={styles.settingsGroup}>
                    <Text style={styles.groupTitle}>BẢO MẬT</Text>
                    <View style={styles.groupContent}>
                        <SettingItem
                            icon="lock"
                            title="Khóa ứng dụng (Biometric/PIN)"
                            hasSwitch
                            switchValue={isAppLocked}
                            onSwitch={setAppLocked}
                            color={COLORS.expense}
                        />
                    </View>
                </View>

                <View style={styles.settingsGroup}>
                    <Text style={styles.groupTitle}>KHÁC</Text>
                    <View style={styles.groupContent}>
                        <SettingItem
                            icon="info"
                            title="Xem lại giới thiệu"
                            onPress={() => setFirstLaunch(true)}
                            color={COLORS.income}
                        />
                    </View>
                </View>

                <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditProfileVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsEditProfileVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cập nhật thông tin</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Tên của bạn</Text>
                            <TextInput
                                style={styles.input}
                                value={tempName}
                                onChangeText={setTempName}
                                placeholder="Ví dụ: Minh Anh"
                                placeholderTextColor={COLORS.textMuted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Ảnh đại diện (Emoji)</Text>
                            <TextInput
                                style={styles.input}
                                value={tempAvatar}
                                onChangeText={setTempAvatar}
                                placeholder="Ví dụ: 🐶"
                                placeholderTextColor={COLORS.textMuted}
                                maxLength={2}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setIsEditProfileVisible(false)}
                            >
                                <Text style={styles.modalBtnCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnSave]}
                                onPress={handleSaveProfile}
                            >
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
        paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
    },
    screenTitle: { fontSize: 24, fontFamily: FONTS.heading, color: COLORS.textMain },
    scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },

    // Profile
    profileCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primarySoft,
        borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.xxl, ...SHADOWS.soft,
    },
    profileAvatar: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white,
    },
    avatarEmoji: { fontSize: 28 },
    profileInfo: { flex: 1, marginLeft: 16 },
    profileName: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: 4 },
    profileEmail: { fontSize: 13, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.8)' },
    editBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },

    // Settings Groups
    settingsGroup: { marginBottom: SPACING.xl },
    groupTitle: {
        fontSize: 12, fontFamily: FONTS.bodyBold, color: COLORS.textMuted,
        letterSpacing: 1, marginBottom: 8, paddingLeft: 8,
    },
    groupContent: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.xl, paddingVertical: 8,
        ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border,
    },
    settingItem: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    },
    settingIcon: {
        width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    },
    settingTitle: { flex: 1, marginLeft: 16, fontSize: 16, fontFamily: FONTS.bodySemiBold, color: COLORS.textMain },
    settingValue: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: COLORS.textMuted, marginRight: 8 },
    divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 68 }, // Align with text

    versionText: { textAlign: 'center', fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 40, opacity: 0.6 },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.xl,
    },
    modalContent: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.card, padding: SPACING.xl, width: '100%',
        ...SHADOWS.soft,
    },
    modalTitle: {
        fontSize: 20, fontFamily: FONTS.heading, color: COLORS.textMain, marginBottom: SPACING.lg, textAlign: 'center',
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    inputLabel: {
        fontSize: 13, fontFamily: FONTS.bodyBold, color: COLORS.textMuted, marginBottom: 8,
    },
    input: {
        borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.btn, paddingHorizontal: 16, paddingVertical: 12,
        fontSize: 16, fontFamily: FONTS.body, color: COLORS.textMain, backgroundColor: '#F8FAFC',
    },
    modalActions: {
        flexDirection: 'row', gap: 12, marginTop: SPACING.lg,
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
