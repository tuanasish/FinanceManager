import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LineChartProps {
    data: number[];
    color?: string;
}

const LineChart = ({ data, color = '#3B82F6' }: LineChartProps) => {
    const maxVal = Math.max(...data, 1);

    return (
        <View style={styles.container}>
            <View style={styles.barsContainer}>
                {data.map((value, index) => {
                    const height = Math.max((value / maxVal) * 120, 4);
                    return (
                        <View key={index} style={styles.barWrapper}>
                            <View style={[styles.bar, { height, backgroundColor: color }]} />
                            <Text style={styles.barLabel}>T{index + 1}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default LineChart;

const styles = StyleSheet.create({
    container: {
        height: 180,
        justifyContent: 'flex-end',
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: 160,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        width: 24,
        borderRadius: 6,
        minHeight: 4,
    },
    barLabel: {
        marginTop: 6,
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
