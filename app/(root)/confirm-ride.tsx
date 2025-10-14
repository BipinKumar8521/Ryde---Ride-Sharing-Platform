import { router } from "expo-router";
import { FlatList, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import SimpleRideLayout from "@/components/SimpleRideLayout";
import { useDriverStore } from "@/store";

const ConfirmRide = () => {
	const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();

	return (
		<SimpleRideLayout title={"Choose a Rider"}>
			<FlatList
				data={drivers}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({ item, index }) => (
					<DriverCard
						item={item}
						selected={selectedDriver!}
						setSelected={() => setSelectedDriver(item.id!)}
					/>
				)}
				ListFooterComponent={() => (
					<View className="mx-5 mt-10">
						<CustomButton
							title="Select Ride"
							onPress={() => router.push("/(root)/book-ride")}
						/>
					</View>
				)}
			/>
		</SimpleRideLayout>
	);
};

export default ConfirmRide;
