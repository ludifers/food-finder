export const VIERA_CENTER = { lat: 28.2456, lng: -80.7292 };
export const VIERA_BOUNDS = {
  north: 28.283,
  south: 28.205,
  east: -80.69,
  west: -80.765,
};

function imageForRestaurant(name, color, accent) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 680">
      <rect width="900" height="680" fill="${color}"/>
      <circle cx="710" cy="160" r="140" fill="${accent}" opacity=".28"/>
      <circle cx="190" cy="540" r="180" fill="#fffdfa" opacity=".18"/>
      <rect x="110" y="120" width="680" height="420" rx="36" fill="#fffdfa" opacity=".92"/>
      <path d="M190 392h520v58H190z" fill="${accent}" opacity=".22"/>
      <text x="450" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="800" fill="#151515">${name}</text>
      <text x="450" y="374" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#5b554c">Viera mock restaurant</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const MOCK_RESTAURANTS = [
  {
    id: "mock-viera-avenue-bistro",
    name: "Avenue Bistro Viera",
    cuisine: "American Restaurant",
    price: "$$",
    priceEstimate: "$16-$32 per person",
    rating: 4.7,
    hours: "Open now",
    hoursDetail: [
      "Monday: 11:00 AM - 9:00 PM",
      "Tuesday: 11:00 AM - 9:00 PM",
      "Wednesday: 11:00 AM - 9:00 PM",
      "Thursday: 11:00 AM - 9:00 PM",
      "Friday: 11:00 AM - 10:00 PM",
      "Saturday: 10:00 AM - 10:00 PM",
      "Sunday: 10:00 AM - 8:00 PM",
    ],
    location: { lat: 28.2444, lng: -80.7276 },
    address: "2261 Town Center Ave, Viera, FL 32940",
    phone: "(321) 555-0144",
    website: "https://example.com/avenue-bistro",
    tags: ["Date night", "Highly rated", "Open now"],
    color: "#f3eadb",
    accent: "#0f766e",
  },
  {
    id: "mock-viera-stadium-sushi",
    name: "Stadium Sushi House",
    cuisine: "Japanese Restaurant",
    price: "$$",
    priceEstimate: "$18-$36 per person",
    rating: 4.8,
    hours: "Open now",
    hoursDetail: [
      "Monday: 12:00 PM - 9:30 PM",
      "Tuesday: 12:00 PM - 9:30 PM",
      "Wednesday: 12:00 PM - 9:30 PM",
      "Thursday: 12:00 PM - 9:30 PM",
      "Friday: 12:00 PM - 10:30 PM",
      "Saturday: 12:00 PM - 10:30 PM",
      "Sunday: 12:00 PM - 9:00 PM",
    ],
    location: { lat: 28.2581, lng: -80.7372 },
    address: "5820 Stadium Pkwy, Viera, FL 32940",
    phone: "(321) 555-0178",
    website: "https://example.com/stadium-sushi",
    tags: ["Asian", "Date night", "Highly rated"],
    color: "#e8f3ef",
    accent: "#dc2626",
  },
  {
    id: "mock-viera-taco-yard",
    name: "Viera Taco Yard",
    cuisine: "Mexican Restaurant",
    price: "$",
    priceEstimate: "$10-$22 per person",
    rating: 4.5,
    hours: "Open now",
    hoursDetail: [
      "Monday: 11:00 AM - 9:00 PM",
      "Tuesday: 11:00 AM - 9:00 PM",
      "Wednesday: 11:00 AM - 9:00 PM",
      "Thursday: 11:00 AM - 9:00 PM",
      "Friday: 11:00 AM - 11:00 PM",
      "Saturday: 11:00 AM - 11:00 PM",
      "Sunday: 11:00 AM - 8:00 PM",
    ],
    location: { lat: 28.2394, lng: -80.7242 },
    address: "6720 Lake Andrew Dr, Viera, FL 32940",
    phone: "(321) 555-0119",
    website: "https://example.com/viera-taco-yard",
    tags: ["Global", "Casual hangout", "Open now"],
    color: "#fff0dd",
    accent: "#f97316",
  },
  {
    id: "mock-viera-noodle-bar",
    name: "Wickham Noodle Bar",
    cuisine: "Asian Restaurant",
    price: "$$",
    priceEstimate: "$14-$28 per person",
    rating: 4.6,
    hours: "Open now",
    hoursDetail: [
      "Monday: 11:30 AM - 9:00 PM",
      "Tuesday: 11:30 AM - 9:00 PM",
      "Wednesday: 11:30 AM - 9:00 PM",
      "Thursday: 11:30 AM - 9:00 PM",
      "Friday: 11:30 AM - 10:00 PM",
      "Saturday: 12:00 PM - 10:00 PM",
      "Sunday: 12:00 PM - 8:30 PM",
    ],
    location: { lat: 28.2238, lng: -80.7268 },
    address: "5410 N Wickham Rd, Viera, FL 32940",
    phone: "(321) 555-0162",
    website: "https://example.com/wickham-noodle-bar",
    tags: ["Asian", "Solo meal", "Open now"],
    color: "#eaf0ff",
    accent: "#2563eb",
  },
  {
    id: "mock-viera-pizza-market",
    name: "Market Street Pizza",
    cuisine: "Pizza Restaurant",
    price: "$",
    priceEstimate: "$9-$20 per person",
    rating: 4.4,
    hours: "Open now",
    hoursDetail: [
      "Monday: 11:00 AM - 10:00 PM",
      "Tuesday: 11:00 AM - 10:00 PM",
      "Wednesday: 11:00 AM - 10:00 PM",
      "Thursday: 11:00 AM - 10:00 PM",
      "Friday: 11:00 AM - 11:00 PM",
      "Saturday: 11:00 AM - 11:00 PM",
      "Sunday: 12:00 PM - 9:00 PM",
    ],
    location: { lat: 28.2467, lng: -80.7193 },
    address: "2290 Town Center Ave, Viera, FL 32940",
    phone: "(321) 555-0191",
    website: "https://example.com/market-street-pizza",
    tags: ["Western", "Group outing", "Open now"],
    color: "#fef2f2",
    accent: "#b91c1c",
  },
  {
    id: "mock-viera-lake-grill",
    name: "Lake Andrew Grill",
    cuisine: "Seafood Restaurant",
    price: "$$$",
    priceEstimate: "$32-$58 per person",
    rating: 4.9,
    hours: "Open now",
    hoursDetail: [
      "Monday: 4:00 PM - 9:00 PM",
      "Tuesday: 4:00 PM - 9:00 PM",
      "Wednesday: 4:00 PM - 9:00 PM",
      "Thursday: 4:00 PM - 9:00 PM",
      "Friday: 4:00 PM - 10:00 PM",
      "Saturday: 4:00 PM - 10:00 PM",
      "Sunday: 4:00 PM - 8:30 PM",
    ],
    location: { lat: 28.2299, lng: -80.7047 },
    address: "7730 Lake Andrew Dr, Viera, FL 32940",
    phone: "(321) 555-0131",
    website: "https://example.com/lake-andrew-grill",
    tags: ["Date night", "Highly rated", "Seafood"],
    color: "#e4f7fb",
    accent: "#0891b2",
  },
  {
    id: "mock-viera-bowl-co",
    name: "Suntree Bowl Co.",
    cuisine: "Healthy Restaurant",
    price: "$",
    priceEstimate: "$11-$18 per person",
    rating: 4.6,
    hours: "Open now",
    hoursDetail: [
      "Monday: 8:00 AM - 8:00 PM",
      "Tuesday: 8:00 AM - 8:00 PM",
      "Wednesday: 8:00 AM - 8:00 PM",
      "Thursday: 8:00 AM - 8:00 PM",
      "Friday: 8:00 AM - 8:00 PM",
      "Saturday: 9:00 AM - 7:00 PM",
      "Sunday: 9:00 AM - 6:00 PM",
    ],
    location: { lat: 28.2156, lng: -80.7015 },
    address: "6300 N Wickham Rd, Viera, FL 32940",
    phone: "(321) 555-0126",
    website: "https://example.com/suntree-bowl-co",
    tags: ["Solo meal", "Casual hangout", "Open now"],
    color: "#edf7e7",
    accent: "#65a30d",
  },
  {
    id: "mock-viera-curry-room",
    name: "Space Coast Curry Room",
    cuisine: "Indian Restaurant",
    price: "$$",
    priceEstimate: "$16-$34 per person",
    rating: 4.7,
    hours: "Closed now",
    hoursDetail: [
      "Monday: Closed",
      "Tuesday: 11:30 AM - 9:00 PM",
      "Wednesday: 11:30 AM - 9:00 PM",
      "Thursday: 11:30 AM - 9:00 PM",
      "Friday: 11:30 AM - 10:00 PM",
      "Saturday: 12:00 PM - 10:00 PM",
      "Sunday: 12:00 PM - 8:00 PM",
    ],
    location: { lat: 28.2532, lng: -80.7104 },
    address: "7425 Murrell Rd, Viera, FL 32940",
    phone: "(321) 555-0187",
    website: "https://example.com/space-coast-curry-room",
    tags: ["Asian", "Exotic", "Highly rated"],
    color: "#fff7ed",
    accent: "#ea580c",
  },
  {
    id: "mock-viera-burger-house",
    name: "Viera Burger House",
    cuisine: "Hamburger Restaurant",
    price: "$",
    priceEstimate: "$10-$19 per person",
    rating: 4.3,
    hours: "Open now",
    hoursDetail: [
      "Monday: 11:00 AM - 9:00 PM",
      "Tuesday: 11:00 AM - 9:00 PM",
      "Wednesday: 11:00 AM - 9:00 PM",
      "Thursday: 11:00 AM - 9:00 PM",
      "Friday: 11:00 AM - 10:00 PM",
      "Saturday: 11:00 AM - 10:00 PM",
      "Sunday: 11:00 AM - 8:00 PM",
    ],
    location: { lat: 28.2644, lng: -80.747 },
    address: "5380 Stadium Pkwy, Viera, FL 32940",
    phone: "(321) 555-0155",
    website: "https://example.com/viera-burger-house",
    tags: ["Western", "Casual hangout", "Group outing"],
    color: "#f8f4ec",
    accent: "#92400e",
  },
  {
    id: "mock-viera-palm-cafe",
    name: "Palm Cafe Viera",
    cuisine: "Cafe",
    price: "$",
    priceEstimate: "$7-$16 per person",
    rating: 4.5,
    hours: "Open now",
    hoursDetail: [
      "Monday: 7:00 AM - 5:00 PM",
      "Tuesday: 7:00 AM - 5:00 PM",
      "Wednesday: 7:00 AM - 5:00 PM",
      "Thursday: 7:00 AM - 5:00 PM",
      "Friday: 7:00 AM - 6:00 PM",
      "Saturday: 8:00 AM - 4:00 PM",
      "Sunday: 8:00 AM - 3:00 PM",
    ],
    location: { lat: 28.2353, lng: -80.7436 },
    address: "2950 Viera Blvd, Viera, FL 32940",
    phone: "(321) 555-0108",
    website: "https://example.com/palm-cafe-viera",
    tags: ["Solo meal", "Coffee", "Open now"],
    color: "#eef2ff",
    accent: "#4f46e5",
  },
];

function reviewForRestaurant(name, rating) {
  return [
    {
      author: "Mock reviewer",
      rating,
      text: `${name} is placeholder Viera data so we can keep building FoodFinder without API costs.`,
      time: "local dev",
      url: "",
    },
    {
      author: "FoodFinder dev note",
      rating,
      text: "Photos, ratings, and reviews will switch back to live Google data when the provider is set to Google.",
      time: "",
      url: "",
    },
  ];
}

export function getMockVieraRestaurants(cravings = []) {
  return MOCK_RESTAURANTS.map((restaurant) => {
    const image = imageForRestaurant(
      restaurant.name,
      restaurant.color,
      restaurant.accent
    );
    const phoneUrl = restaurant.phone.replace(/[^\d+]/g, "");

    return {
      ...restaurant,
      image,
      gallery: [image],
      distance: "Viera area",
      phoneUrl: phoneUrl ? `tel:${phoneUrl}` : "",
      pricePerPerson: restaurant.priceEstimate,
      diningType: "Restaurant",
      matchNote:
        cravings.length > 0
          ? `Matched in Viera using your ${cravings.join(" / ")} profile.`
          : "Viera-only mock restaurant while we build.",
      menuUrl: restaurant.website,
      mapsUrl: `https://www.openstreetmap.org/?mlat=${restaurant.location.lat}&mlon=${restaurant.location.lng}#map=18/${restaurant.location.lat}/${restaurant.location.lng}`,
      reviews: reviewForRestaurant(restaurant.name, restaurant.rating),
      tags: Array.from(
        new Set([...(cravings.length ? cravings.slice(0, 2) : []), ...restaurant.tags])
      ).slice(0, 4),
    };
  });
}
