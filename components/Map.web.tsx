import React from "react";
import { View, Text } from "react-native";

// Web fallback component for Map - this won't be used since you're mobile-only
// but prevents bundling errors during web builds
const Map = () => {
	return (
		<View className="flex justify-center items-center w-full h-full bg-gray-200 rounded-2xl">
			<Text className="text-gray-600">Map not available on web</Text>
		</View>
	);
};

export default Map;
