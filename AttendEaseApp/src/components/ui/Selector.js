import React, { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import {
    View,
    Text,
    ScrollView,
    Modal,
    Pressable,
    findNodeHandle,
    UIManager
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Selector({
    value,
    defaultOption,
    options = [],
    onChange,
    styleSelector,
    selectedStyle,
    styleButton
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultOption);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const selectorRef = useRef(null);
    const { width: deviceWidth, height: deviceHeight } = useWindowDimensions();

    // --- SYNCHRONIZE INTERNAL STATE WITH EXTERNAL CONTROL PROPS ---
    useEffect(() => {
        if (value !== undefined && value !== null) {
            const targetValue = typeof value === 'object' ? value.value : value;
            const matchedOption = options.find(opt => opt.value === targetValue);

            if (matchedOption) {
                setSelectedValue(matchedOption);
            }
        } else if (defaultOption) {
            setSelectedValue(defaultOption);
        }
    }, [value, options]);

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

    return (
        <>
            {/* Selector Outer Box */}
            <View
                ref={selectorRef}
                className={!!styleSelector ? styleSelector : "min-w-40 bg-white dark:bg-neutral-950/40 elevation-sm rounded-full px-2 pl-3 border border-gray-100 dark:border-neutral-800/60"}
            >
                <Pressable onPress={measureDropdown}>
                    <View className="flex-row w-full justify-center items-center gap-x-2 overflow-hidden">
                        <View className="flex-1 justify-between py-2 overflow-hidden">
                            <Text numberOfLines={1} ellipsizeMode='tail' className={`flex-1 ${selectedStyle || "text-gray-900 dark:text-neutral-50 font-medium"}`}>
                                {selectedValue?.label || options[0].label}
                            </Text>
                        </View>

                        <View className={(!!styleButton ? styleButton : "p-1 px-3 bg-gray-100 dark:bg-neutral-800 rounded-full") + ""}>
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
                onRequestClose={() => setIsExpanded(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" }}
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
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator
                            bounces={false}
                        >
                            {
                                options.map((item, index) => {
                                    const isSelected = selectedValue?.value === item.value;

                                    return (
                                        <Pressable
                                            key={item.value?.toString() || index.toString()}
                                            onPress={() => handleSelect(item)}
                                            className={`p-3 flex-row items-center justify-between border-b border-gray-100 dark:border-neutral-800/60 ${isSelected
                                                ? 'bg-indigo-500'
                                                : 'active:bg-gray-100 dark:active:bg-neutral-800'
                                                }`}
                                        >
                                            <Text           
                                                className={`text-base ${isSelected
                                                    ? 'text-white font-semibold'
                                                    : 'text-gray-900 dark:text-neutral-50'
                                                    }`}
                                            >
                                                {item.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}