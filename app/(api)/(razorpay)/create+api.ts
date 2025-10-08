import Razorpay from "razorpay";

const razorpay = new Razorpay({
	key_id: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!,
	key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
	const body = await request.json();
	const { amount, currency = "INR", receipt } = body;

	if (!amount) {
		return new Response(JSON.stringify({ error: "Amount is required" }), {
			status: 400,
		});
	}

	try {
		const options = {
			amount: parseInt(amount) * 100, // amount in the smallest currency unit (paise for INR)
			currency,
			receipt: receipt || `receipt_${Date.now()}`,
		};

		const order = await razorpay.orders.create(options);

		return new Response(
			JSON.stringify({
				order_id: order.id,
				amount: order.amount,
				currency: order.currency,
				receipt: order.receipt,
				key_id: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
			})
		);
	} catch (error) {
		console.error("Error creating Razorpay order:", error);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
}
