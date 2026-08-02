"use client";

import { buildCustomerSegments } from "@/data/dashboard";
import { DonutChart } from "./DonutChart";

export default function CustomerChart({ orders }) {
  return <DonutChart title="Customers" subtitle="New, returning, guest and VIP" data={buildCustomerSegments(orders)} />;
}
