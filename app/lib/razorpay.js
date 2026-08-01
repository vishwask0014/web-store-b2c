import Razorpay from "razorpay";
import User from "@/app/models/User";

export const PLATFORM_FEE_PERCENT = 6;
export const CURRENCY = process.env.RAZORPAY_CURRENCY || "INR";
export const PAYOUT_CURRENCY = "INR";

const keyId = () => process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

export function isRazorpayConfigured() {
  return Boolean(keyId() && process.env.RAZORPAY_KEY_SECRET);
}

let instance = null;

export function getRazorpay() {
  if (!isRazorpayConfigured()) return null;
  if (!instance) {
    instance = new Razorpay({
      key_id: keyId(),
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
}

const round2 = (n) => Math.round(n * 100) / 100;

export function sellerShareOf(amount) {
  return round2(amount * (1 - PLATFORM_FEE_PERCENT / 100));
}

export function platformFeeOf(amount) {
  return round2(amount * (PLATFORM_FEE_PERCENT / 100));
}

export function buildSettlements(order, storesByStoreId) {
  const byOwner = new Map();
  for (const item of order.items) {
    const store = storesByStoreId.get(item.storeId);
    if (!store) continue;
    const line = (Number(item.price) + Number(item.serviceCharge || 0)) * item.quantity;
    const owner = byOwner.get(store.ownerId) || { ownerId: store.ownerId, storeIds: [], amount: 0 };
    owner.amount = round2(owner.amount + line);
    if (!owner.storeIds.includes(store.uniqueStoreId)) owner.storeIds.push(store.uniqueStoreId);
    byOwner.set(store.ownerId, owner);
  }
  return [...byOwner.values()].map(({ ownerId, storeIds, amount }) => ({
    ownerId,
    storeIds,
    amount,
    fee: platformFeeOf(amount),
    share: sellerShareOf(amount),
    status: "pending",
    payoutId: "",
    paidAt: "",
    note: "",
  }));
}

function getFundAccountPayload(payout) {
  if (payout.type === "upi") {
    return {
      account_type: "vpa",
      vpa: { address: payout.upiId },
    };
  }
  return {
    account_type: "bank_account",
    bank_account: {
      name: payout.accountHolder || "",
      ifsc: payout.ifsc || "",
      account_number: payout.accountNumber || "",
    },
  };
}

export async function processDeliveredPayouts(order) {
  const results = [];
  const rzp = getRazorpay();
  const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;

  for (const settlement of order.settlements || []) {
    const user = await User.findOne({ uid: settlement.ownerId });
    if (!user || !user.payout) {
      results.push({
        ownerId: settlement.ownerId,
        status: "blocked",
        note: "Seller has no payout details on file.",
      });
      continue;
    }
    if (!rzp || !accountNumber) {
      results.push({
        ownerId: settlement.ownerId,
        status: "blocked",
        note: "RazorpayX payouts are not configured yet.",
      });
      continue;
    }
    try {
      let contactId = user.razorpayContactId;
      if (!contactId) {
        const contact = await rzp.contacts.create({
          name: user.name || "Seller",
          email: user.email || "",
          type: "customer",
        });
        contactId = contact.id;
        user.razorpayContactId = contactId;
      }

      let fundAccountId = user.razorpayFundAccountId;
      if (!fundAccountId) {
        const fundAccount = await rzp.fundAccounts.create({
          contact_id: contactId,
          ...getFundAccountPayload(user.payout),
        });
        fundAccountId = fundAccount.id;
        user.razorpayFundAccountId = fundAccountId;
      }

      const payout = await rzp.payouts.create({
        account_number: accountNumber,
        amount: Math.round(settlement.share * 100),
        currency: PAYOUT_CURRENCY,
        mode: user.payout.type === "upi" ? "UPI" : "IMPS",
        purpose: "payout",
        fund_account_id: fundAccountId,
        reference: `pay_${order.orderId.toLowerCase()}_${settlement.ownerId.slice(-6)}`,
        notes: { orderId: order.orderId, ownerId: settlement.ownerId },
      });

      await user.save();
      results.push({ ownerId: settlement.ownerId, status: "initiated", payoutId: payout.id });
    } catch (err) {
      results.push({
        ownerId: settlement.ownerId,
        status: "failed",
        note: err.message,
      });
    }
  }
  return results;
}
