// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure expo-router can resolve its entry point
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
