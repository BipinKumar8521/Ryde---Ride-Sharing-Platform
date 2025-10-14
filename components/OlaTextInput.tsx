import React, { useState } from "react";
import {
	View,
	Image,
	TextInput,
	FlatList,
	TouchableOpacity,
	Text,
	StyleSheet,
} from "react-native";

import { icons } from "@/constants";
import { OlaInputProps } from "@/types/type";

const olaMapsApiKey = process.env.EXPO_PUBLIC_OLAMAPS_API_KEY;

interface OlaSuggestion {
	place_id: string;
	description: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
	};
}

const OlaTextInput = ({
	icon,
	initialLocation,
	containerStyle,
	textInputBackgroundColor,
	handlePress,
}: OlaInputProps) => {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<OlaSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const searchPlaces = async (input: string) => {
		if (!input.trim() || !olaMapsApiKey) return;

		try {
			const response = await fetch(
				`https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(input)}&api_key=${olaMapsApiKey}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				if (data.predictions) {
					setSuggestions(data.predictions);
					setShowSuggestions(true);
				}
			}
		} catch (error) {
			console.error("Error fetching places:", error);
		}
	};

	const getPlaceDetails = async (placeId: string) => {
		try {
			const response = await fetch(
				`https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${olaMapsApiKey}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				if (data.result) {
					const location = data.result.geometry.location;
					handlePress({
						latitude: location.lat,
						longitude: location.lng,
						address: data.result.formatted_address || data.result.name,
					});
				}
			}
		} catch (error) {
			console.error("Error fetching place details:", error);
		}
	};

	const handleSuggestionPress = (suggestion: OlaSuggestion) => {
		setQuery(suggestion.description);
		setShowSuggestions(false);
		getPlaceDetails(suggestion.place_id);
	};

	const handleInputChange = (text: string) => {
		setQuery(text);
		if (text.length > 2) {
			searchPlaces(text);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	};

	const renderSuggestion = ({ item }: { item: OlaSuggestion }) => (
		<TouchableOpacity
			style={styles.suggestionItem}
			onPress={() => handleSuggestionPress(item)}
		>
			<Text style={styles.mainText}>
				{item.structured_formatting.main_text}
			</Text>
			<Text style={styles.secondaryText}>
				{item.structured_formatting.secondary_text}
			</Text>
		</TouchableOpacity>
	);

	return (
		<View
			className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
		>
			<View style={styles.textInputContainer}>
				<View style={styles.inputRow}>
					<View className="justify-center items-center w-6 h-6 ml-4">
						<Image
							source={icon ? icon : icons.search}
							className="w-6 h-6"
							resizeMode="contain"
						/>
					</View>
					<TextInput
						style={[
							styles.textInput,
							{
								backgroundColor: textInputBackgroundColor
									? textInputBackgroundColor
									: "white",
							},
						]}
						placeholder={initialLocation ?? "Where do you want to go?"}
						placeholderTextColor="gray"
						value={query}
						onChangeText={handleInputChange}
						onFocus={() => {
							if (suggestions.length > 0) {
								setShowSuggestions(true);
							}
						}}
					/>
				</View>

				{showSuggestions && suggestions.length > 0 && (
					<FlatList
						data={suggestions}
						keyExtractor={(item) => item.place_id}
						renderItem={renderSuggestion}
						style={[
							styles.suggestionsList,
							{
								backgroundColor: textInputBackgroundColor
									? textInputBackgroundColor
									: "white",
							},
						]}
						keyboardShouldPersistTaps="handled"
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	textInputContainer: {
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 20,
		marginHorizontal: 20,
		position: "relative",
		shadowColor: "#d4d4d4",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	inputRow: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
	},
	textInput: {
		fontSize: 16,
		fontWeight: "600",
		marginTop: 5,
		flex: 1,
		borderRadius: 200,
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	suggestionsList: {
		position: "absolute",
		top: 50,
		left: 0,
		right: 0,
		maxHeight: 200,
		borderRadius: 10,
		shadowColor: "#d4d4d4",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		zIndex: 99,
	},
	suggestionItem: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	mainText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#000",
	},
	secondaryText: {
		fontSize: 14,
		color: "#666",
		marginTop: 2,
	},
});

export default OlaTextInput;
