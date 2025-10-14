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

	// Use default location if user location is not available (for testing)
	const defaultLatitude = 28.7041; // Delhi coordinates as fallback
	const defaultLongitude = 77.1025;

	const effectiveUserLatitude = userLatitude || defaultLatitude;
	const effectiveUserLongitude = userLongitude || defaultLongitude;

	const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");

	// Debug logging
	useEffect(() => {
		console.log("Map component - drivers:", drivers);
		console.log("Map component - loading:", loading);
		console.log("Map component - error:", error);
		console.log("Map component - userLatitude:", userLatitude);
		console.log("Map component - userLongitude:", userLongitude);
	}, [drivers, loading, error, userLatitude, userLongitude]);
	const [markers, setMarkers] = useState<MarkerData[]>([]);
	const [routeCoordinates, setRouteCoordinates] = useState<
		{ latitude: number; longitude: number }[]
	>([]);

	const getRouteCoordinates = async (
		origin: { lat: number; lng: number },
		destination: { lat: number; lng: number }
	) => {
		// Skip route fetching if API key is not available
		if (!olaMapsApiKey) {
			console.warn("OlaMaps API key not found, skipping route coordinates");
			return;
		}

		try {
			console.log(
				"Fetching route coordinates from:",
				origin,
				"to:",
				destination
			);
			const response = await fetch(
				`https://api.olamaps.io/routing/v1/directions?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&api_key=${olaMapsApiKey}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			console.log("Route API response status:", response.status);

			if (response.ok) {
				const data = await response.json();
				console.log("Route data received:", data);
				if (data.routes && data.routes[0] && data.routes[0].geometry) {
					// Decode polyline if OlaMaps returns encoded polyline
					const coordinates = decodePolyline(data.routes[0].geometry);
					setRouteCoordinates(coordinates);
				}
			} else {
				console.error(
					"Route API error:",
					response.status,
					await response.text()
				);
			}
		} catch (error) {
			console.error("Error fetching route:", error);
			// Don't let route fetching errors break the entire map
			console.log("Map will continue to work without route display");
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
		if (Array.isArray(drivers) && drivers.length > 0) {
			const newMarkers = generateMarkersFromData({
				data: drivers,
				userLatitude: effectiveUserLatitude,
				userLongitude: effectiveUserLongitude,
			});

			setMarkers(newMarkers);
		} else {
			// Clear markers if no drivers or API failed
			setMarkers([]);
		}
	}, [drivers, effectiveUserLatitude, effectiveUserLongitude]);

	useEffect(() => {
		if (
			markers.length > 0 &&
			destinationLatitude !== undefined &&
			destinationLongitude !== undefined
		) {
			calculateDriverTimes({
				markers,
				userLatitude: effectiveUserLatitude,
				userLongitude: effectiveUserLongitude,
				destinationLatitude,
				destinationLongitude,
			})
				.then((drivers) => {
					setDrivers(drivers as MarkerData[]);
				})
				.catch((err) => {
					console.error("Error calculating driver times:", err);
					// Don't break the map if driver time calculation fails
				});
		}
	}, [
		markers,
		destinationLatitude,
		destinationLongitude,
		effectiveUserLatitude,
		effectiveUserLongitude,
	]);

	useEffect(() => {
		if (
			effectiveUserLatitude &&
			effectiveUserLongitude &&
			destinationLatitude &&
			destinationLongitude
		) {
			getRouteCoordinates(
				{ lat: effectiveUserLatitude, lng: effectiveUserLongitude },
				{ lat: destinationLatitude, lng: destinationLongitude }
			);
		}
	}, [
		effectiveUserLatitude,
		effectiveUserLongitude,
		destinationLatitude,
		destinationLongitude,
	]);

	const region = calculateRegion({
		userLatitude: effectiveUserLatitude,
		userLongitude: effectiveUserLongitude,
		destinationLatitude,
		destinationLongitude,
	});

	if (loading)
		return (
			<View className="flex justify-between items-center w-full">
				<ActivityIndicator size="small" color="#000" />
			</View>
		);

	// Show map even if drivers API fails - just without driver markers
	// if (error)
	// 	return (
	// 		<View className="flex justify-between items-center w-full">
	// 			<Text className="text-red-500 text-center p-4">
	// 				Error loading drivers: {error}
	// 			</Text>
	// 			<Text className="text-gray-500 text-center text-sm">
	// 				Map will load without driver markers
	// 			</Text>
	// 		</View>
	// 	);

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
