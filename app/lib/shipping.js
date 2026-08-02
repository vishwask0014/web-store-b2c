export const COURIERS = [
  "FedEx",
  "DHL",
  "UPS",
  "USPS",
  "Blue Dart",
  "Delhivery",
  "DTDC",
  "India Post",
  "Blinkit Logistics",
];

export function trackingUrl(courier, trackingNumber) {
  if (!courier || !trackingNumber) return null;
  const num = encodeURIComponent(trackingNumber);
  switch (courier?.toLowerCase()) {
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
    case "dhl":
      return `https://www.dhl.com/en/express/tracking.html?AWB=${num}&brand=DHL`;
    case "ups":
      return `https://www.ups.com/track?loc=en_US&tracknum=${num}`;
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`;
    case "blue dart":
      return `https://www.bluedart.com/tracking?action=track&track_no=${num}`;
    case "delhivery":
      return `https://www.delhivery.com/track/package/${num}`;
    case "dtdc":
      return `https://www.dtdc.in/tracking/tracking_results.asp?strCnno=${num}&TrkType2=awb_no`;
    case "india post":
      return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?TrackNo=${num}`;
    case "blinkit logistics":
      return null;
    default:
      return null;
  }
}
