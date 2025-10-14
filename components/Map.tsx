import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
	calculateDriverTimes,
	calculateRegion,
	generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const olaMapsApiKey = process.env.EXPO_PUBLIC_OLAMAPS_API_KEY;

const Map = () => {
	const {
		userLongitude,
		userLatitude,
		destinationLatitude,
		destinationLongitude,
	} = useLocationStore();
	const { selectedDriver, setDrivers } = useDriverStore();

	const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
	const [markers, setMarkers] = useState<MarkerData[]>([]);
	const [routeCoordinates, setRouteCoordinates] = useState<
		{ latitude: number; longitude: number }[]
	>([]);

	const getRouteCoordinates = async (
		origin: { lat: number; lng: number },
		destination: { lat: number; lng: number }
	) => {
		try {
			const response = await fetch(
				`https://api.olamaps.io/routing/v1/directions?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&api_key=${olaMapsApiKey}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				if (data.routes && data.routes[0] && data.routes[0].geometry) {
					// Decode polyline if OlaMaps returns encoded polyline
					const coordinates = decodePolyline(data.routes[0].geometry);
					setRouteCoordinates(coordinates);
				}
			}
		} catch (error) {
			console.error("Error fetching route:", error);
		}
	};

	const decodePolyline = (encoded: string) => {
		const coordinates: { latitude: number; longitude: number }[] = [];
		let index = 0;
		let lat = 0;
		let lng = 0;

		while (index < encoded.length) {
			let b,
				shift = 0,
				result = 0;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
			lat += deltaLat;

			shift = 0;
			result = 0;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
			lng += deltaLng;

			coordinates.push({
				latitude: lat / 1e5,
				longitude: lng / 1e5,
			});
		}
		return coordinates;
	};

	useEffect(() => {
		if (Array.isArray(drivers)) {
			if (!userLatitude || !userLongitude) return;

			const newMarkers = generateMarkersFromData({
				data: drivers,
				userLatitude,
				userLongitude,
			});

			setMarkers(newMarkers);
		}
	}, [drivers, userLatitude, userLongitude]);

	useEffect(() => {
		if (
			markers.length > 0 &&
			destinationLatitude !== undefined &&
			destinationLongitude !== undefined
		) {
			calculateDriverTimes({
				markers,
				userLatitude,
				userLongitude,
				destinationLatitude,
				destinationLongitude,
			}).then((drivers) => {
				setDrivers(drivers as MarkerData[]);
			});
		}
	}, [markers, destinationLatitude, destinationLongitude]);

	useEffect(() => {
		if (
			userLatitude &&
			userLongitude &&
			destinationLatitude &&
			destinationLongitude
		) {
			getRouteCoordinates(
				{ lat: userLatitude, lng: userLongitude },
				{ lat: destinationLatitude, lng: destinationLongitude }
			);
		}
	}, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

	const region = calculateRegion({
		userLatitude,
		userLongitude,
		destinationLatitude,
		destinationLongitude,
	});

	if (loading || (!userLatitude && !userLongitude))
		return (
			<View className="flex justify-between items-center w-full">
				<ActivityIndicator size="small" color="#000" />
			</View>
		);

	if (error)
		return (
			<View className="flex justify-between items-center w-full">
				<Text>Error: {error}</Text>
			</View>
		);

	return (
		<MapView
			provider={PROVIDER_DEFAULT}
			className="w-full h-full rounded-2xl"
			tintColor="black"
			mapType="standard"
			showsPointsOfInterest={false}
			initialRegion={region}
			showsUserLocation={true}
			userInterfaceStyle="light"
		>
			{markers.map((marker, index) => (
				<Marker
					key={marker.id}
					coordinate={{
						latitude: marker.latitude,
						longitude: marker.longitude,
					}}
					title={marker.title}
					image={
						selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
					}
				/>
			))}

			{destinationLatitude && destinationLongitude && (
				<>
					<Marker
						key="destination"
						coordinate={{
							latitude: destinationLatitude,
							longitude: destinationLongitude,
						}}
						title="Destination"
						image={icons.pin}
					/>
					{routeCoordinates.length > 0 && (
						<Polyline
							coordinates={routeCoordinates}
							strokeColor="#0286FF"
							strokeWidth={3}
							lineDashPattern={[0]}
						/>
					)}
				</>
			)}
		</MapView>
	);
};

export default Map;
