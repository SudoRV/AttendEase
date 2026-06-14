const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 1. Get the default config exactly ONCE
const config = getDefaultConfig(__dirname);

// 2. Wrap it with NativeWind so your CSS works
module.exports = withNativeWind(config, { input: './global.css' });