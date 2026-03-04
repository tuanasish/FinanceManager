import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, FONTS, SHADOWS } from '../../constants/theme';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    title?: string;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    disabled?: boolean;
    onPress?: () => void;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
    children?: React.ReactNode;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    title,
    loading,
    leftIcon,
    rightIcon,
    disabled,
    onPress,
    style,
    textStyle,
    children,
}: ButtonProps) => {
    // Determine text content - children take priority over title
    const textContent = children || title;

    return (
        <TouchableOpacity
            style={[
                styles.base,
                variantStyles[variant],
                sizeStyles[size],
                (disabled || loading) && styles.disabled,
                variant === 'primary' && !disabled && SHADOWS.sm, // Apply shadow to primary buttons
                style,
            ]}
            disabled={disabled || loading}
            activeOpacity={0.8}
            onPress={onPress}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primaryDark : COLORS.white} />
            ) : (
                <>
                    {leftIcon && leftIcon}
                    {textContent && (
                        typeof textContent === 'string' ? (
                            <Text style={[
                                styles.text,
                                textVariantStyles[variant],
                                textSizeStyles[size],
                                leftIcon ? { marginLeft: 8 } : undefined,
                                rightIcon ? { marginRight: 8 } : undefined,
                                textStyle,
                            ]}>
                                {textContent}
                            </Text>
                        ) : textContent
                    )}
                    {rightIcon && rightIcon}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.btn, // Updated to 16px from theme
    },
    text: {
        fontFamily: FONTS.heading, // Using new font family
    },
    disabled: {
        opacity: 0.5,
    },
});

const variantStyles = StyleSheet.create({
    primary: {
        backgroundColor: COLORS.primarySoft,
    },
    secondary: {
        backgroundColor: COLORS.primaryDark,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primarySoft,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
});

const textVariantStyles = StyleSheet.create({
    primary: {
        color: COLORS.white,
    },
    secondary: {
        color: COLORS.white,
    },
    outline: {
        color: COLORS.primarySoft,
    },
    ghost: {
        color: COLORS.primaryDark,
    },
});

const sizeStyles = StyleSheet.create({
    sm: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    md: {
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    lg: {
        paddingHorizontal: 24,
        paddingVertical: 18,
    },
});

const textSizeStyles = StyleSheet.create({
    sm: {
        fontSize: 14,
    },
    md: {
        fontSize: 16,
    },
    lg: {
        fontSize: 18,
    },
});
