import BottomSheet, {
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Map from "@/components/Map";
import { icons } from "@/constants";

const RideLayout = ({
	title,
	snapPoints,
	children,
}: {
	title: string;
	snapPoints?: string[];
	children: React.ReactNode;
}) => {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const [hasError, setHasError] = React.useState(false);

	// Fallback UI if BottomSheet fails
	if (hasError) {
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
						<Text className="text-xl font-JakartaSemiBold ml-5">
							{title || "Go Back"}
						</Text>
					</View>
					<Map />
				</View>
				<ScrollView className="flex-1 p-5 bg-white">{children}</ScrollView>
			</View>
		);
	}

	try {
		return (
			<GestureHandlerRootView className="flex-1">
				<View className="flex-1 bg-white">
					<View className="flex flex-col h-screen bg-blue-500">
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
							<Text className="text-xl font-JakartaSemiBold ml-5">
								{title || "Go Back"}
							</Text>
						</View>

						<Map />
					</View>

					<BottomSheet
						ref={bottomSheetRef}
						snapPoints={snapPoints || ["40%", "85%"]}
						index={0}
					>
						{title === "Choose a Rider" ? (
							<BottomSheetView
								style={{
									flex: 1,
									padding: 20,
								}}
							>
								{children}
							</BottomSheetView>
						) : (
							<BottomSheetScrollView
								style={{
									flex: 1,
									padding: 20,
								}}
							>
								{children}
							</BottomSheetScrollView>
						)}
					</BottomSheet>
				</View>
			</GestureHandlerRootView>
		);
	} catch (error) {
		console.error("BottomSheet error:", error);
		setHasError(true);
		return null; // This will trigger a re-render with the fallback UI
	}
};

export default RideLayout;
