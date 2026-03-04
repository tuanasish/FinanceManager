// Joyful Pastel Finance - Design Tokens
// Extracted from design/screens/*.html

export const COLORS = {
    // Primary
    primary: '#88B3C8',        // Rainy Sky
    primarySoft: '#A3C9DA',
    primaryDark: '#6A9AB0',

    // Background
    background: '#F9F7F2',     // Rice Paper
    backgroundDark: '#101c22',

    // Surface
    surface: '#FFFFFF',        // Cloud White
    surfaceDark: '#1E2A32',

    // Text
    textMain: '#4A4A4A',       // Charcoal
    textMuted: '#9B9B9B',      // Stone

    // Semantic
    income: '#A7D7C5',         // Matcha Latte
    expense: '#F4A6A6',        // Sakura Pink
    budgetFill: '#E0BBE4',     // Taro Milk
    budgetWarning: '#FFB74D',  // Soft Orange

    // Utility
    white: '#FFFFFF',
    black: '#000000',
    border: '#F1F5F9',
    divider: '#F8F8F8',
};

export const RADIUS = {
    card: 24,
    btn: 16,
    lg: 20,
    xl: 32,
    full: 9999,
};

export const SHADOWS = {
    soft: {
        shadowColor: '#88B3C8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 4,
    },
    nav: {
        shadowColor: '#88B3C8',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 8,
    },
    floating: {
        shadowColor: '#88B3C8',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 32,
        elevation: 10,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
};

export const FONTS = {
    heading: 'QuicksandBold',
    subheading: 'Quicksand',
    body: 'Nunito',
    bodyMedium: 'NunitoMedium',
    bodySemiBold: 'NunitoSemiBold',
    bodyBold: 'NunitoBold',
    numbers: 'VarelaRound',
    // Fallbacks for when fonts aren't loaded
    headingFallback: 'System',
    bodyFallback: 'System',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};
