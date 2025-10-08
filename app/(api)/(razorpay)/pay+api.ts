import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
	key_id: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!,
	key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

		if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
			return new Response(
				JSON.stringify({ error: "Missing required payment fields" }),
				{ status: 400 }
			);
		}

		// Verify the payment signature
		const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
		hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
		const generated_signature = hmac.digest("hex");

		if (generated_signature !== razorpay_signature) {
			return new Response(
				JSON.stringify({ error: "Payment verification failed" }),
				{ status: 400 }
			);
		}

		// Fetch payment details from Razorpay
		const payment = await razorpay.payments.fetch(razorpay_payment_id);

		return new Response(
			JSON.stringify({
				success: true,
				message: "Payment successful",
				payment_id: razorpay_payment_id,
				order_id: razorpay_order_id,
				status: payment.status,
			})
		);
	} catch (error) {
		console.error("Error verifying payment:", error);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
}
