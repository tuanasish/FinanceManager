import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Icon } from '../ui/Icon';

interface CustomNumpadProps {
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
}

const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['000', '0', 'del'],
];

const screenWidth = Dimensions.get('window').width;
const keyWidth = (screenWidth - 48 - 16) / 3; // padding 24*2, gap 8*2

const CustomNumpad = ({ value, onChange, onSave }: CustomNumpadProps) => {
    const handlePress = (key: string) => {
        if (key === 'del') {
            onChange(value.slice(0, -1));
        } else {
            onChange(value + key);
        }
    };

    return (
        <View style={styles.container}>
            {KEYS.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((key) => (
                        <TouchableOpacity
                            key={key}
                            style={styles.key}
                            onPress={() => handlePress(key)}
                            activeOpacity={0.6}
                        >
                            {key === 'del' ? (
                                <Icon name="delete" size={24} color="#64748B" />
                            ) : (
                                <Text style={styles.keyText}>{key}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            ))}

            <TouchableOpacity
                style={styles.saveButton}
                onPress={onSave}
                activeOpacity={0.8}
            >
                <Icon name="check" size={22} color="#FFFFFF" />
                <Text style={styles.saveText}>Xong</Text>
            </TouchableOpacity>
        </View>
    );
};

export default CustomNumpad;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingTop: 8,
        paddingBottom: 24,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    key: {
        width: keyWidth,
        aspectRatio: 2,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1E293B',
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },
    saveText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
