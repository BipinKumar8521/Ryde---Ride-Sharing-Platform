const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add reanimated worklets support
config.transformer.getTransformOptions = () => ({
	transform: {
		experimentalImportSupport: false,
		inlineRequires: false,
	},
});

module.exports = config;
