import React, { useEffect, useRef, memo } from "react";
import { Animated } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

function AnimatedTabIcon({ focused, iconName, size, color }) {
  const animatedWidth = useRef(new Animated.Value(size)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: focused ? size + 40 : size,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        width: animatedWidth,
        height: size + 6,
        borderRadius: 999,
        backgroundColor: focused ? "#E0E7FF" : "transparent",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10
      }}
    >
      <Ionicons name={iconName} size={size - 2} color={color} />
    </Animated.View>
  );
}

export default memo(AnimatedTabIcon);