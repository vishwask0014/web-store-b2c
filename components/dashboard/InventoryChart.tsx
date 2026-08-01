"use client";

import { buildInventoryByCategory } from "@/data/dashboard";
import type { StoreSummary } from "@/types/dashboard";
import { DonutChart } from "./DonutChart";

interface InventoryChartProps {
  stores: StoreSummary[];
  productsByStore: Record<string, number>;
}

export default function InventoryChart({ stores, productsByStore }: InventoryChartProps) {
  return (
    <DonutChart
      title="Inventory"
      subtitle="Products by store category"
      data={buildInventoryByCategory(stores, productsByStore)}
    />
  );
}
