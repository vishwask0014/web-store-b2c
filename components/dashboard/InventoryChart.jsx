"use client";

import { buildInventoryByCategory } from "@/data/dashboard";
import { DonutChart } from "./DonutChart";

export default function InventoryChart({ stores, productsByStore }) {
  return (
    <DonutChart
      title="Inventory"
      subtitle="Products by store category"
      data={buildInventoryByCategory(stores, productsByStore)}
    />
  );
}
