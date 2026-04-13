import { useRef } from "react";
import { Animated, Pressable } from "react-native"

const CustomButton = ({ children, onPress, style, ...rest }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true
    }).start();
  }

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 0,
      useNativeDriver: true
    }).start();
  }

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}

export default CustomButton;