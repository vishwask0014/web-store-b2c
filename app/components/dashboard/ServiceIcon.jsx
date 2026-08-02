import {
  Apple,
  Armchair,
  BookOpen,
  Droplets,
  Paintbrush,
  Scissors,
  Shirt,
  Smartphone,
  SprayCan,
  Wrench,
  Zap,
} from "lucide-react";

const KEYWORDS = [
  { keys: ["grocery", "food", "vegetable", "vegetables", "fruit", "fruits", "produce", "meat"], icon: Apple },
  { keys: ["clean", "cleaning", "mop", "spray", "home cleaning", "housekeeping"], icon: SprayCan },
  { keys: ["beauty", "salon", "spa", "nail", "hair", "cut", "makeup", "skin"], icon: Scissors },
  { keys: ["electric", "electrical", "electrician", "wiring", "power", "appliance"], icon: Zap },
  { keys: ["plumbing", "plumber", "tap", "pipe", "drain"], icon: Droplets },
  { keys: ["paint", "painting", "painter", "decor", "interior"], icon: Paintbrush },
  { keys: ["laundry", "washing", "wash", "ironing", "shirt", "fashion", "tailor"], icon: Shirt },
  { keys: ["mobile", "phone", "laptop", "electronics", "tv", "computer", "gadget"], icon: Smartphone },
  { keys: ["furniture", "sofa", "assembly", "carpentry", "wood"], icon: Armchair },
  { keys: ["book", "stationery"], icon: BookOpen },
  { keys: ["mechanic", "repair", "car", "auto", "automobile", "engine", "service center", "garage"], icon: Wrench },
];

export function getServiceIcon(name = "", category = "") {
  const text = `${name} ${category}`.toLowerCase();
  for (const { keys, icon } of KEYWORDS) {
    if (keys.some((k) => text.includes(k))) return icon;
  }
  return Wrench;
}

export function ServiceIconFallback({ name, category, className }) {
  const Icon = getServiceIcon(name, category);
  return <Icon className={className} />;
}
