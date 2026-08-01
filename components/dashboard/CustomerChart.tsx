"use client";

import { buildCustomerSegments } from "@/data/dashboard";
import type { OrderSummary } from "@/types/dashboard";
import { DonutChart } from "./DonutChart";

interface CustomerChartProps {
  orders: OrderSummary[];
}

export default function CustomerChart({ orders }: CustomerChartProps) {
  return <DonutChart title="Customers" subtitle="New, returning, guest and VIP" data={buildCustomerSegments(orders)} />;
}
