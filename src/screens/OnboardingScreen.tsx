import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import Svg, { Circle, Ellipse, Path, Line, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

export const OnboardingScreen = ({ navigation }: any) => {
    const { setFirstLaunch, setCurrency, setUserName, setUserAvatar } = useAppStore();
    const [selectedCurrency, setSelectedCurrency] = useState<'VND' | 'USD'>('VND');
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');

    const handleFinish = () => {
        if (name.trim()) setUserName(name.trim());
        if (avatar.trim()) setUserAvatar(avatar.trim());
        setCurrency(selectedCurrency);
        setFirstLaunch(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Skip button */}
                    <View style={styles.skipRow}>
                        <TouchableOpacity onPress={handleFinish}>
                            <Text style={styles.skipText}>Bỏ qua</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Main content */}
                    <View style={styles.content}>
                        {/* Piggy bank illustration */}
                        <View style={styles.illustrationContainer}>
                            <View style={styles.cloudBase} />
                            <View style={styles.cloudTop} />
                            <Svg width={150} height={150} viewBox="0 0 150 150">
                                <Defs>
                                    <RadialGradient id="pigGrad" cx="40%" cy="30%" r="70%">
                                        <Stop offset="0%" stopColor="#FFF0F5" />
                                        <Stop offset="100%" stopColor="#FFB6C1" />
                                    </RadialGradient>
                                    <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <Stop offset="0%" stopColor="#FFF3CD" />
                                        <Stop offset="100%" stopColor="#FFD700" />
                                    </LinearGradient>
                                </Defs>
                                {/* Coin */}
                                <Circle cx={75} cy={22} r={14} fill="url(#goldGrad)" stroke="#F6C343" strokeWidth={2} />
                                {/* Body */}
                                <Ellipse cx={75} cy={82} rx={55} ry={46} fill="url(#pigGrad)" />
                                {/* Snout */}
                                <Ellipse cx={108} cy={85} rx={15} ry={12} fill="#FFC0CB" stroke="#FF9AA2" strokeWidth={1.5} />
                                <Ellipse cx={102} cy={84} rx={2.5} ry={4} fill="#FF6B6B" opacity={0.8} />
                                <Ellipse cx={114} cy={84} rx={2.5} ry={4} fill="#FF6B6B" opacity={0.8} />
                                {/* Ears */}
                                <Path d="M42 52 L30 28 L58 42 Z" fill="url(#pigGrad)" stroke="#FFB6C1" strokeWidth={1} />
                                <Path d="M90 42 L108 22 L112 47 Z" fill="url(#pigGrad)" stroke="#FFB6C1" strokeWidth={1} />
                                {/* Eyes */}
                                <Path d="M60 65 Q 65 58 70 65" fill="none" stroke="#555" strokeLinecap="round" strokeWidth={3.5} />
                                <Path d="M85 65 Q 90 58 95 65" fill="none" stroke="#555" strokeLinecap="round" strokeWidth={3.5} />
                                {/* Blush */}
                                <Ellipse cx={55} cy={76} rx={6} ry={4} fill="#FF9AA2" opacity={0.5} />
                                <Ellipse cx={98} cy={76} rx={6} ry={4} fill="#FF9AA2" opacity={0.5} />
                                {/* Legs */}
                                <Path d="M55 120 L50 140 L65 140 L65 120 Z" fill="#FFB6C1" />
                                <Path d="M90 120 L90 140 L105 140 L100 120 Z" fill="#FFB6C1" />
                                {/* Slot */}
                                <Line x1={60} y1={36} x2={90} y2={36} stroke="#FF9AA2" strokeLinecap="round" strokeWidth={4} />
                            </Svg>
                        </View>

                        {/* Title */}
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>
                                Quản lý chi tiêu{'\n'}
                                <Text style={styles.titleHighlight}>vui vẻ</Text>
                            </Text>
                            <Text style={styles.subtitle}>
                                Theo dõi tài chính cá nhân một cách nhẹ nhàng như mây trôi.
                            </Text>
                        </View>
                    </View>

                    {/* Bottom section */}
                    <View style={styles.bottomSection}>
                        {/* Profile Input */}
                        <View style={styles.profileInputSection}>
                            <View style={styles.profileInputRow}>
                                <View style={styles.avatarInputContainer}>
                                    <TextInput
                                        style={styles.avatarInput}
                                        value={avatar}
                                        onChangeText={setAvatar}
                                        placeholder="😊"
                                        placeholderTextColor={COLORS.textMuted}
                                        maxLength={2}
                                        textAlign="center"
                                    />
                                </View>
                                <TextInput
                                    style={styles.nameInput}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Tên của bạn"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>
                        </View>

                        {/* Currency selector */}
                        <View style={styles.currencySection}>
                            <Text style={styles.currencyLabel}>ĐƠN VỊ MẶC ĐỊNH</Text>
                            <View style={styles.currencyToggle}>
                                <TouchableOpacity
                                    style={[
                                        styles.currencyBtn,
                                        selectedCurrency === 'VND' && styles.currencyBtnActive,
                                    ]}
                                    onPress={() => setSelectedCurrency('VND')}
                                >
                                    <View style={styles.currencyIcon}>
                                        <Text style={styles.currencyIconText}>đ</Text>
                                    </View>
                                    <Text style={[
                                        styles.currencyBtnText,
                                        selectedCurrency === 'VND' && styles.currencyBtnTextActive,
                                    ]}>VND</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.currencyBtn,
                                        selectedCurrency === 'USD' && styles.currencyBtnActive,
                                    ]}
                                    onPress={() => setSelectedCurrency('USD')}
                                >
                                    <View style={[styles.currencyIcon, { borderWidth: 1, borderColor: COLORS.textMuted }]}>
                                        <Text style={styles.currencyIconText}>$</Text>
                                    </View>
                                    <Text style={[
                                        styles.currencyBtnText,
                                        selectedCurrency === 'USD' && styles.currencyBtnTextActive,
                                    ]}>USD</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Start button */}
                        <TouchableOpacity style={styles.startButton} onPress={handleFinish} activeOpacity={0.9}>
                            <Text style={styles.startButtonText}>Bắt đầu ngay</Text>
                            <Text style={styles.startButtonArrow}>›</Text>
                        </TouchableOpacity>

                        {/* Footer text */}
                        <Text style={styles.footerText}>
                            Offline First • Dữ liệu an toàn trên thiết bị của bạn
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    skipRow: {
        alignItems: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    skipText: {
        color: COLORS.textMuted,
        fontFamily: FONTS.bodyBold,
        fontSize: 14,
        letterSpacing: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    illustrationContainer: {
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    cloudBase: {
        position: 'absolute',
        bottom: 20,
        width: '110%',
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 100,
        ...SHADOWS.soft,
    },
    cloudTop: {
        position: 'absolute',
        bottom: 40,
        width: '85%',
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 60,
        ...SHADOWS.soft,
    },
    titleContainer: {
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 34,
        fontFamily: FONTS.heading,
        color: COLORS.textMain,
        textAlign: 'center',
        lineHeight: 42,
    },
    titleHighlight: {
        color: COLORS.primarySoft,
        fontSize: 36,
        fontFamily: FONTS.heading,
    },
    subtitle: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontFamily: FONTS.body,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 22,
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 16,
    },

    // Profile Input
    profileInputSection: {
        alignItems: 'center',
    },
    profileInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: RADIUS.card,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.9)',
        width: '100%',
        ...SHADOWS.soft,
    },
    avatarInputContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInput: {
        fontSize: 24,
        textAlign: 'center',
        width: 48,
        height: 48,
        padding: 0,
    },
    nameInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONTS.bodySemiBold,
        color: COLORS.textMain,
        paddingVertical: 8,
        paddingRight: 12,
    },

    // Currency
    currencySection: {
        alignItems: 'center',
        gap: 12,
    },
    currencyLabel: {
        color: COLORS.textMuted,
        fontFamily: FONTS.bodyBold,
        fontSize: 11,
        letterSpacing: 2,
    },
    currencyToggle: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 9999,
        padding: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.9)',
        width: 240,
        ...SHADOWS.soft,
    },
    currencyBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 9999,
        gap: 8,
    },
    currencyBtnActive: {
        backgroundColor: COLORS.primarySoft,
        ...SHADOWS.sm,
    },
    currencyBtnText: {
        fontFamily: FONTS.bodyBold,
        fontSize: 15,
        color: COLORS.textMuted,
    },
    currencyBtnTextActive: {
        color: COLORS.white,
    },
    currencyIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencyIconText: {
        fontSize: 11,
        fontFamily: FONTS.numbers,
    },
    startButton: {
        backgroundColor: COLORS.primarySoft,
        borderRadius: RADIUS.btn,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...SHADOWS.floating,
    },
    startButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.heading,
        fontSize: 20,
    },
    startButtonArrow: {
        color: COLORS.white,
        fontSize: 24,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 11,
        color: COLORS.textMuted,
        fontFamily: FONTS.bodyMedium,
        opacity: 0.8,
    },
});
