// Simple test component to check if APIs are working
import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";

const APITest = () => {
	const [driversResult, setDriversResult] = useState("Not tested");
	const [userResult, setUserResult] = useState("Not tested");

	const testDriversAPI = async () => {
		try {
			setDriversResult("Testing...");
			const response = await fetch("/(api)/driver");
			const data = await response.json();
			setDriversResult(`Success: ${JSON.stringify(data).substring(0, 100)}...`);
		} catch (error) {
			setDriversResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	};

	const testUserAPI = async () => {
		try {
			setUserResult("Testing...");
			const response = await fetch("/(api)/user");
			const data = await response.json();
			setUserResult(`Success: ${JSON.stringify(data).substring(0, 100)}...`);
		} catch (error) {
			setUserResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	};

	return (
		<View className="p-4">
			<Text className="text-lg font-bold mb-4">API Test</Text>

			<View className="mb-4">
				<Button title="Test Drivers API" onPress={testDriversAPI} />
				<Text className="mt-2">Result: {driversResult}</Text>
			</View>

			<View className="mb-4">
				<Button title="Test User API" onPress={testUserAPI} />
				<Text className="mt-2">Result: {userResult}</Text>
			</View>
		</View>
	);
};

export default APITest;
