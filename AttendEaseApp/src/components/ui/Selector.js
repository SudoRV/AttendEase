import React, { useEffect, useRef, useState } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    FlatList,
    Modal,
    Pressable,
    findNodeHandle,
    UIManager
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Selector({ defaultOption, options = [], onChange }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultOption);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    const selectorRef = useRef(null);

    useEffect(() => {
        if (!onChange || !selectedValue) return;
        onChange(selectedValue);
    }, [selectedValue]);

    const measureDropdown = () => {
        const handle = findNodeHandle(selectorRef.current);
        if (handle) {
            UIManager.measureInWindow(handle, (x, y, width, height) => {
                setPosition({
                    top: y + height + 5, // 👈 below selector
                    left: x,
                    width: width
                });
                setIsExpanded(true);
            });
        }
    };

    const handleSelect = (item) => {
        setSelectedValue(item);
        setIsExpanded(false);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleSelect(item)}
            className="p-3 border-b border-gray-100 active:bg-gray-100"
        >
            <Text>{item.label}</Text>
        </TouchableOpacity>
    );

    return (
        <>
            {/* Selector */}
            <View
                ref={selectorRef}
                className="min-w-40 bg-white elevation-sm rounded-full px-2 pl-3"
            >
                <View className="flex-row items-center justify-between py-2">
                    <Text>{selectedValue?.label || "Select"}</Text>

                    <TouchableOpacity onPress={measureDropdown}>
                        <View className="p-1 px-3 bg-gray-100 rounded-full">
                            <Ionicons size={16} name={`${isExpanded ? "chevron-up" : "chevron-down"}`} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal */}
            <Modal
                visible={isExpanded}
                transparent
                animationType="fade"
                onRequestClose={() => setIsExpanded(false)}
            >
                {/* Transparent overlay */}
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => setIsExpanded(false)}
                >
                    {/* Dropdown */}
                    <View
                        style={{
                            position: 'absolute',
                            top: position.top,
                            left: position.left,
                            width: position.width,
                            maxHeight: 240,
                            backgroundColor: 'white',
                            borderRadius: 10,
                            elevation: 10
                        }}
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