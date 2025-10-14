import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";
import RazorpayCheckout from "react-native-razorpay";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);

  const handleRazorpayPayment = async () => {
    try {
      // Create Razorpay order
      const orderResponse = await fetchAPI("/(api)/(razorpay)/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      });

      if (!orderResponse.order_id) {
        Alert.alert("Error", "Unable to create payment order");
        return;
      }

      const options = {
        description: "Ride Payment",
        image: "https://i.imgur.com/3g7nmJC.png", // Your company logo
        currency: "INR",
        key: orderResponse.key_id,
        amount: orderResponse.amount,
        order_id: orderResponse.order_id,
        name: "Ryde",
        prefill: {
          email: email,
          contact: "", // Add contact if available
          name: fullName || email.split("@")[0],
        },
        theme: { color: "#53a20e" },
      };

      RazorpayCheckout.open(options)
        .then((data: any) => {
          // Payment success
          handlePaymentSuccess(data);
        })
        .catch((error: any) => {
          // Payment failed
          Alert.alert(
            "Payment Failed",
            error.description || "Payment was cancelled",
          );
        });
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      // Verify payment on server
      const verificationResponse = await fetchAPI("/(api)/(razorpay)/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
        }),
      });

      if (verificationResponse.success) {
        // Create ride record
        await fetchAPI("/(api)/ride/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin_address: userAddress,
            destination_address: destinationAddress,
            origin_latitude: userLatitude,
            origin_longitude: userLongitude,
            destination_latitude: destinationLatitude,
            destination_longitude: destinationLongitude,
            ride_time: rideTime.toFixed(0),
            fare_price: parseInt(amount) * 100,
            payment_status: "paid",
            driver_id: driverId,
            user_id: userId,
          }),
        });

        setSuccess(true);
      } else {
        Alert.alert("Payment Verification Failed", "Please contact support");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      Alert.alert(
        "Error",
        "Payment verification failed. Please contact support.",
      );
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={handleRazorpayPayment}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
