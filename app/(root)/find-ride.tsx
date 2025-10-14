import { router } from "expo-router";
import { Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import OlaTextInput from "@/components/OlaTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";

const FindRide = () => {
	const {
		userAddress,
		destinationAddress,
		setDestinationLocation,
		setUserLocation,
	} = useLocationStore();

	return (
		<RideLayout title="Ride">
			<View className="my-3">
				<Text className="text-lg font-JakartaSemiBold mb-3">From</Text>

				<OlaTextInput
					icon={icons.target}
					initialLocation={userAddress!}
					containerStyle="bg-neutral-100"
					textInputBackgroundColor="#f5f5f5"
					handlePress={(location: {
						latitude: number;
						longitude: number;
						address: string;
					}) => setUserLocation(location)}
				/>
			</View>

			<View className="my-3">
				<Text className="text-lg font-JakartaSemiBold mb-3">To</Text>

				<OlaTextInput
					icon={icons.map}
					initialLocation={destinationAddress!}
					containerStyle="bg-neutral-100"
					textInputBackgroundColor="transparent"
					handlePress={(location: {
						latitude: number;
						longitude: number;
						address: string;
					}) => setDestinationLocation(location)}
				/>
			</View>

			<CustomButton
				title="Find Now"
				onPress={() => router.push(`/(root)/confirm-ride`)}
				className="mt-5"
			/>
		</RideLayout>
	);
};

export default FindRide;
