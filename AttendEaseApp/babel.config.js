module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    'nativewind/babel' // <--- Moved up here!
  ],
  plugins: [
    'react-native-reanimated/plugin' // <--- Reanimated stays down here
  ],
};