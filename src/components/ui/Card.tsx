import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
}

export const Card = ({ children, style }: CardProps) => {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

export const CardContent = ({ children, style }: CardProps) => {
    return (
        <View style={[styles.cardContent, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.card,
        padding: 16,
        ...SHADOWS.sm, // Apply soft shadow from theme
    },
    cardContent: {
        // Inner content wrapper
    },
});
