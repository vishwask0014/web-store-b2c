import { Check, Truck, XCircle, Clock } from "lucide-react";

export default function ItemTimeline({ item }) {
  const steps = [
    { key: "placed", label: "Placed", done: true, icon: Check },
    {
      key: "shipped",
      label: "Shipped",
      done: Boolean(item.shippedAt),
      icon: Truck,
    },
    {
      key: "delivered",
      label: "Delivered",
      done: Boolean(item.deliveredAt),
      icon: Check,
    },
  ];

  if (item.cancelledAt) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
        <XCircle size={14} />
        Cancelled on {new Date(item.cancelledAt).toLocaleDateString()}
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-1">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex flex-1 items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  step.done ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                <Icon size={12} />
              </span>
              <span
                className={`text-[10px] ${
                  step.done ? "font-medium text-emerald-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 rounded ${
                  steps[idx + 1].done ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ShippingInfo({ item }) {
  if (!item.shippedAt && !item.tracking?.trackingNumber) return null;
  return (
    <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
      <div className="flex items-center gap-1.5 font-medium">
        <Clock size={12} />
        Shipped {new Date(item.shippedAt).toLocaleDateString()}
      </div>
      {item.tracking?.trackingNumber && (
        <p className="mt-1">
          {item.tracking.courier || "Courier"}: <b>{item.tracking.trackingNumber}</b>
          {item.tracking.estimatedDelivery
            ? ` · arrives by ${new Date(item.tracking.estimatedDelivery).toLocaleDateString()}`
            : ""}
        </p>
      )}
    </div>
  );
}
