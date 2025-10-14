import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";

import Map from "@/components/Map";
import { icons } from "@/constants";

// Temporary simple layout without BottomSheet to avoid reanimated issues
const SimpleRideLayout = ({
	title,
	children,
}: {
	title: string;
	snapPoints?: string[];
	children: React.ReactNode;
}) => {
	return (
		<View className="flex-1 bg-white">
			<View className="flex flex-col h-1/2 bg-blue-500">
				<View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
					<TouchableOpacity onPress={() => router.back()}>
						<View className="w-10 h-10 bg-white rounded-full items-center justify-center">
							<Image
								source={icons.backArrow}
								resizeMode="contain"
								className="w-6 h-6"
							/>
						</View>
					</TouchableOpacity>
					<Text className="text-xl font-JakartaSemiBold ml-5 text-white">
						{title || "Go Back"}
					</Text>
				</View>
				<Map />
			</View>
			<ScrollView className="flex-1 p-5 bg-white">
				<Text className="text-lg font-JakartaSemiBold mb-4">{title}</Text>
				{children}
			</ScrollView>
		</View>
	);
};

export default SimpleRideLayout;
