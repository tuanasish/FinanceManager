import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TransactionScreen } from '../screens/TransactionScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Icon } from '../components/ui/Icon';
import { COLORS, SHADOWS, FONTS, RADIUS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const AddButton = ({ onPress }: { onPress: () => void }) => (
    <View style={styles.addBtnWrapper}>
        <TouchableOpacity
            style={styles.addBtn}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.addBtnInner}>
                <Icon name="add" color={COLORS.white} size={32} />
            </View>
        </TouchableOpacity>
    </View>
);

export const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: COLORS.primaryDark,
                    tabBarInactiveTintColor: COLORS.textMuted,
                    tabBarStyle: [
                        styles.tabBar,
                        { height: 65 + (Platform.OS === 'ios' ? insets.bottom : 10) }
                    ],
                    tabBarLabelStyle: styles.tabLabel,
                    tabBarItemStyle: styles.tabItem,
                }}
            >
                <Tab.Screen
                    name="DashboardTabs"
                    component={DashboardScreen}
                    options={{
                        tabBarLabel: 'Tổng quan',
                        tabBarIcon: ({ color, focused }) => (
                            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                                <Icon name="home" color={focused ? COLORS.primaryDark : color} size={24} />
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Transactions"
                    component={TransactionScreen}
                    options={{
                        tabBarLabel: 'Giao dịch',
                        tabBarIcon: ({ color, focused }) => (
                            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                                <Icon name="list" color={focused ? COLORS.primaryDark : color} size={24} />
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Add"
                    component={View}
                    options={({ navigation }) => ({
                        tabBarButton: (props) => (
                            <AddButton onPress={() => navigation.navigate('AddTransaction')} />
                        ),
                    })}
                />
                <Tab.Screen
                    name="Budget"
                    component={BudgetScreen}
                    options={{
                        tabBarLabel: 'Ngân sách',
                        tabBarIcon: ({ color, focused }) => (
                            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                                <Icon name={focused ? "pie-chart" : "pie-chart"} color={focused ? COLORS.primaryDark : color} size={24} />
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="SettingsTab"
                    component={SettingsScreen}
                    options={{
                        tabBarLabel: 'Cài đặt',
                        tabBarIcon: ({ color, focused }) => (
                            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                                <Icon name="settings" color={focused ? COLORS.primaryDark : color} size={24} />
                            </View>
                        ),
                    }}
                />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // Ensure background matches behind rounded corners
    },
    tabBar: {
        position: 'absolute', // To allow rounded corners to show background
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 0,
        borderTopLeftRadius: RADIUS.card,
        borderTopRightRadius: RADIUS.card,
        ...SHADOWS.nav,
        paddingTop: 8,
    },
    tabItem: {
        paddingTop: 4,
    },
    tabLabel: {
        fontFamily: FONTS.bodyBold,
        fontSize: 10,
        marginTop: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerActive: {
        backgroundColor: COLORS.primarySoft + '30', // 30 is opacity hex
    },
    addBtnWrapper: {
        top: -24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.floating,
    },
    addBtnInner: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
