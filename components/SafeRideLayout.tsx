import { router } from "expo-router";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Map from "@/components/Map";
import ErrorBoundary from "@/components/ErrorBoundary";
import { icons } from "@/constants";

// Lazy load BottomSheet components to handle import errors
const LazyBottomSheet = React.lazy(() =>
	import("@gorhom/bottom-sheet").then((module) => ({ default: module.default }))
);

const LazyBottomSheetView = React.lazy(() =>
	import("@gorhom/bottom-sheet").then((module) => ({
		default: module.BottomSheetView,
	}))
);

const LazyBottomSheetScrollView = React.lazy(() =>
	import("@gorhom/bottom-sheet").then((module) => ({
		default: module.BottomSheetScrollView,
	}))
);

// Fallback layout without BottomSheet
const FallbackLayout = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) => (
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

// BottomSheet layout
const BottomSheetLayout = ({
	title,
	snapPoints,
	children,
}: {
	title: string;
	snapPoints?: string[];
	children: React.ReactNode;
}) => {
	const bottomSheetRef = useRef<any>(null);

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

				<React.Suspense
					fallback={<FallbackLayout title={title}>{children}</FallbackLayout>}
				>
					<LazyBottomSheet
						ref={bottomSheetRef}
						snapPoints={snapPoints || ["40%", "85%"]}
						index={0}
					>
						{title === "Choose a Rider" ? (
							<React.Suspense
								fallback={<View className="p-5">{children}</View>}
							>
								<LazyBottomSheetView style={{ flex: 1, padding: 20 }}>
									{children}
								</LazyBottomSheetView>
							</React.Suspense>
						) : (
							<React.Suspense
								fallback={<ScrollView className="p-5">{children}</ScrollView>}
							>
								<LazyBottomSheetScrollView style={{ flex: 1, padding: 20 }}>
									{children}
								</LazyBottomSheetScrollView>
							</React.Suspense>
						)}
					</LazyBottomSheet>
				</React.Suspense>
			</View>
		</GestureHandlerRootView>
	);
};

const SafeRideLayout = ({
	title,
	snapPoints,
	children,
}: {
	title: string;
	snapPoints?: string[];
	children: React.ReactNode;
}) => {
	return (
		<ErrorBoundary
			fallback={<FallbackLayout title={title}>{children}</FallbackLayout>}
		>
			<BottomSheetLayout title={title} snapPoints={snapPoints}>
				{children}
			</BottomSheetLayout>
		</ErrorBoundary>
	);
};

export default SafeRideLayout;
