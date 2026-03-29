import React from "react";
import { StyleSheet } from "react-native";
import LinearGradient from 'react-native-linear-gradient';

export default function GradientWrapper({
    children,
    style,
    colors = ["#818CF8", "#4F46E5"],
    start = { x: 0, y: 1 },
    end = { x: 1, y: 0 },
  }) {
    return (
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  const styles = StyleSheet.create({
    container: {
      borderRadius: 16,
      padding: 16,
    },
  });