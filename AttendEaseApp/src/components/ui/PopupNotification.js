import React, { useEffect } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function PopupNotification({ title, body, onClose }) {
  const { width } = useWindowDimensions();
  
  // Reanimated shared values for dynamic touch Tracking
  const translateY = useSharedValue(-150); // Start off-screen height
  const opacity = useSharedValue(0);

  // 1. Entrance Animation Sequence on display load
  useEffect(() => {
    translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 250 });

    // Auto-dismiss safety callback fallbacks after 6 seconds
    const timer = setTimeout(() => {
      dismissNotification();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const dismissNotification = () => {
    'worklet';
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-200, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  // 2. Interactive Gesture Listener Configuration (Pan Upward to Close)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only track tracking layouts when moving upward (negative displacement)
      if (event.translationY < 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      // If pulled past threshold velocity or distance, swipe dismiss out of viewport
      if (event.translationY < -40 || event.velocityY < -300) {
        dismissNotification();
      } else {
        // Snap back cleanly to safe original resting boundary position
        translateY.value = withSpring(0, { damping: 12 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[animatedStyle, { elevation: 12 }]}
        className="absolute top-14 left-4 right-4 bg-white/95 dark:bg-neutral-900/95 rounded-3xl p-4 elevation-lg border border-slate-100/80 dark:border-neutral-800/60 flex-row items-center z-50 overflow-hidden backdrop-blur-md"
      >
        {/* Decorative Top Pull Drag Indicator Handle */}
        <View className="absolute top-1.5 left-0 right-0 items-center justify-center">
          <View className="w-10 h-1 bg-slate-200 dark:bg-neutral-700/60 rounded-full" />
        </View>

        {/* Catchy Left Accent Gradient Icon Ring */}
        <View className="w-12 h-12 bg-indigo-50 dark:bg-blue-950/40 rounded-2xl items-center justify-center mr-3.5 border border-indigo-100/40 dark:border-blue-900/40">
          <Ionicons name="notifications-sharp" size={22} className="text-indigo-600 dark:text-blue-400" />
        </View>

        {/* Main Context Text Frame Layout */}
        <View className="flex-1 pr-1 pt-1">
          <Text className="text-slate-900 dark:text-neutral-50 font-extrabold text-base tracking-wide" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-slate-500 dark:text-neutral-400 text-sm font-medium mt-0.5 leading-4" numberOfLines={2}>
            {body}
          </Text>
        </View>
        
      </Animated.View>
    </GestureDetector>
  );
}