import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Map of commonly used icon names to MaterialCommunityIcons names
const ICON_MAP: Record<string, string> = {
    // Navigation
    'home': 'home',
    'grid-view': 'view-dashboard',
    'list': 'format-list-bulleted',
    'receipt-long': 'receipt',
    'pie-chart': 'chart-pie',
    'settings': 'cog',
    'person': 'account',
    'plus': 'plus',
    'add': 'plus',

    // Transaction categories
    'restaurant': 'food',
    'local-cafe': 'coffee',
    'coffee': 'coffee',
    'directions-car': 'car',
    'directions-bike': 'bike',
    'commute': 'bus',
    'shopping-bag': 'shopping',
    'shopping-cart': 'cart',
    'confirmation-number': 'ticket',
    'stadia-controller': 'gamepad-variant',
    'receipt': 'receipt',

    // Actions
    'arrow-downward': 'arrow-down',
    'arrow-upward': 'arrow-up',
    'arrow-forward-ios': 'chevron-right',
    'chevron-right': 'chevron-right',
    'chevron-left': 'chevron-left',
    'close': 'close',
    'more-horiz': 'dots-horizontal',
    'more-vert': 'dots-vertical',
    'edit': 'pencil',
    'edit-note': 'note-edit',
    'search': 'magnify',
    'tune': 'tune',
    'backspace': 'backspace',
    'calendar-today': 'calendar-today',
    'notifications': 'bell',
    'trending-up': 'trending-up',
    'expand-more': 'chevron-down',

    // Settings
    'payments': 'cash',
    'dark-mode': 'moon-waning-crescent',
    'lock': 'lock',
    'description': 'file-document',
    'backup': 'cloud-upload',

    // Other
    'cloud': 'cloud',
    'star': 'star',
    'heart': 'heart',
    'check': 'check',
    'info': 'information',
    'warning': 'alert',
    'error': 'alert-circle',
};

export type IconName = keyof typeof ICON_MAP | string;

interface IconProps {
    name: IconName;
    color?: string;
    size?: number;
}

export const Icon = ({ name, color = '#4A4A4A', size = 24 }: IconProps) => {
    const mappedName = ICON_MAP[name] || name;

    return (
        <MaterialCommunityIcons
            name={mappedName as any}
            color={color}
            size={size}
        />
    );
};
