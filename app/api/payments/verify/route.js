import { NextResponse } from "next/server";
import { getRequestUser, unauthorized } from "@/app/lib/auth";
import {
  getRazorpay,
  isRazorpayConfigured,
  isSimulatedPaymentId,
  simulatedPayment,
} from "@/app/lib/razorpay";

export async function POST(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, amountMinor } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
    }

    if (isSimulatedPaymentId(razorpayPaymentId)) {
      const sim = simulatedPayment(razorpayPaymentId, amountMinor);
      return NextResponse.json({
        verified: true,
        simulated: true,
        razorpayPaymentId: sim.id,
        method: sim.method,
        cardLast4: sim.card.last4,
        cardBrand: sim.card.network,
        upiId: "",
      });
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
    }

    const rzp = getRazorpay();
    const payment = await rzp.payments.fetch(razorpayPaymentId);

    const orderOk = payment.order_id === razorpayOrderId;
    const amountOk = !amountMinor || Number(payment.amount) === Number(amountMinor);
    const statusOk = ["captured", "authorized"].includes(payment.status);

    if (!orderOk || !amountOk || !statusOk) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    return NextResponse.json({
      verified: true,
      razorpayPaymentId: payment.id,
      method: payment.method,
      cardLast4: payment.card?.last4 || "",
      cardBrand: payment.card?.network || "",
      upiId: payment.vpa || "",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
