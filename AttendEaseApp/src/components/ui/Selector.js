import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Modal,
    Pressable,
    findNodeHandle,
    UIManager
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Selector({ value, defaultOption, options = [], onChange, styleSelector, selectedStyle, styleButton }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultOption);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    const selectorRef = useRef(null);

    // --- SYNCHRONIZE INTERNAL STATE WITH EXTERNAL CONTROL PROPS ---
    useEffect(() => {
        if (value !== undefined && value !== null) {
            // Find the matching option object from the list using either value or value.value
            const targetValue = typeof value === 'object' ? value.value : value;
            const matchedOption = options.find(opt => opt.value === targetValue);
            
            if (matchedOption) {
                setSelectedValue(matchedOption);
            }
        } else if (defaultOption) {
            setSelectedValue(defaultOption);
        }
    }, [value, options]);

    // Triggers callback only when an intentional user selection occurs
    const handleSelect = (item) => {
        setSelectedValue(item);
        setIsExpanded(false);
        if (onChange) {
            onChange(item);
        }
    };

    const measureDropdown = () => {
        const handle = findNodeHandle(selectorRef.current);
        if (handle) {
            UIManager.measureInWindow(handle, (x, y, width, height) => {
                setPosition({
                    top: y + height + 5,
                    left: x,
                    width: width
                });
                setIsExpanded(true);
            });
        }
    };

    const renderItem = ({ item }) => (
        <Pressable
            onPress={() => handleSelect(item)}
            className="p-3 border-b border-gray-100 dark:border-neutral-800/60 active:bg-gray-100 dark:active:bg-neutral-800"
        >
            <Text className="text-gray-900 dark:text-neutral-50 text-base">
                {item.label}
            </Text>
        </Pressable>
    );

    return (
        <>
            {/* Selector Outer Box */}
            <View
                ref={selectorRef}
                className={!!styleSelector ? styleSelector : "min-w-40 bg-white dark:bg-neutral-900/40 elevation-sm rounded-full px-2 pl-3 border border-gray-100 dark:border-neutral-800/60"}
            >
                <Pressable onPress={measureDropdown}>
                    <View className="flex-row items-center justify-between py-2">
                        <Text className={selectedStyle || "text-gray-900 dark:text-neutral-50 font-medium"}>
                            {selectedValue?.label || "Select"}
                        </Text>
                        
                        <View className={!!styleButton ? styleButton : "p-1 px-3 bg-gray-100 dark:bg-neutral-800 rounded-full"}>
                            <Ionicons 
                                size={16} 
                                name={isExpanded ? "chevron-up" : "chevron-down"} 
                                className="text-gray-600 dark:!text-neutral-200"
                            />
                        </View>
                    </View>
                </Pressable>
            </View>

            {/* Dropdown Floating Window Modal */}
            <Modal
                visible={isExpanded}
                transparent
                animationType="fade"
                onRequestClose={() => setIsExpanded(false)}
            >
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => setIsExpanded(false)}
                >
                    <View
                        style={{
                            position: 'absolute',
                            top: position.top,
                            left: position.left,
                            width: position.width,
                            maxHeight: 320,
                        }}
                        className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl elevation-xl shadow-2xl overflow-hidden"
                    >
                        <FlatList
                            data={options}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderItem}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator
                        />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}