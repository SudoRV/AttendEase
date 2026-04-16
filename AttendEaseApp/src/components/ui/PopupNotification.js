import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function PopupNotification({ title, body, onClose }) {
  // Auto-dismiss the notification after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Animated.View
      entering={SlideInUp}
      exiting={SlideOutUp}
      className="absolute top-12 left-4 right-4 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 flex-row items-center z-50"
      style={{ elevation: 10 }} // Ensures it sits above Android UI
    >
      {/* Icon */}
      <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-3 shadow-2xl">
        <Ionicons name="notifications" size={24} color="#4F46E5" />
      </View>

      {/* Text Content */}
      <View className="flex-1">
        <Text className="text-slate-900 font-bold text-lg" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-slate-500 mt-0.5" numberOfLines={2}>
          {body}
        </Text>
      </View>

      {/* Manual Close Button */}
      <TouchableOpacity onPress={onClose} className="p-2 ml-2">
        <Ionicons name="close" size={20} color="#94A3B8" />
      </TouchableOpacity>
    </Animated.View>
  );
}