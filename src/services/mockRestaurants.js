export const UCF_CENTER = { lat: 28.6024, lng: -81.2001 };
export const UCF_BOUNDS = {
  north: 28.626,
  south: 28.545,
  east: -81.165,
  west: -81.235,
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
      <text x="450" y="374" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#5b554c">UCF mock restaurant</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const MOCK_RESTAURANTS = [
  {
    id: "mock-ucf-knights-bistro",
    name: "Knights Bistro",
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
    location: { lat: 28.6077, lng: -81.1998 },
    address: "Knights Plaza, Orlando, FL 32816",
    phone: "(321) 555-0144",
    website: "https://example.com/knights-bistro",
    tags: ["Date night", "Highly rated", "Open now", "Group friendly"],
    color: "#f3eadb",
    accent: "#0f766e",
  },
  {
    id: "mock-ucf-plaza-sushi",
    name: "Plaza Sushi House",
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
    location: { lat: 28.6088, lng: -81.1962 },
    address: "Gemini Blvd N, Orlando, FL 32816",
    phone: "(321) 555-0178",
    website: "https://example.com/plaza-sushi",
    tags: ["Asian", "Date night", "Highly rated", "Gluten-free"],
    color: "#e8f3ef",
    accent: "#dc2626",
  },
  {
    id: "mock-ucf-taco-yard",
    name: "Alafaya Taco Yard",
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
    location: { lat: 28.5926, lng: -81.2083 },
    address: "N Alafaya Trl, Orlando, FL 32817",
    phone: "(321) 555-0119",
    website: "https://example.com/alafaya-taco-yard",
    tags: ["Global", "Casual hangout", "Open now", "Cheap eats"],
    color: "#fff0dd",
    accent: "#f97316",
  },
  {
    id: "mock-ucf-noodle-bar",
    name: "University Noodle Bar",
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
    location: { lat: 28.5966, lng: -81.2153 },
    address: "University Blvd, Orlando, FL 32817",
    phone: "(321) 555-0162",
    website: "https://example.com/university-noodle-bar",
    tags: ["Asian", "Solo meal", "Open now", "Late night"],
    color: "#eaf0ff",
    accent: "#2563eb",
  },
  {
    id: "mock-ucf-pizza-market",
    name: "Campus Pizza Market",
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
    location: { lat: 28.6011, lng: -81.2058 },
    address: "E Colonial Dr, Orlando, FL 32817",
    phone: "(321) 555-0191",
    website: "https://example.com/market-street-pizza",
    tags: ["Western", "Group outing", "Open now", "Cheap eats"],
    color: "#fef2f2",
    accent: "#b91c1c",
  },
  {
    id: "mock-ucf-waterford-grill",
    name: "Waterford Grill",
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
    location: { lat: 28.5519, lng: -81.2003 },
    address: "Waterford Lakes Pkwy, Orlando, FL 32828",
    phone: "(321) 555-0131",
    website: "https://example.com/waterford-grill",
    tags: ["Date night", "Highly rated", "Seafood", "Group friendly"],
    color: "#e4f7fb",
    accent: "#0891b2",
  },
  {
    id: "mock-ucf-bowl-co",
    name: "Memory Mall Bowl Co.",
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
    location: { lat: 28.6023, lng: -81.2037 },
    address: "Memory Mall, Orlando, FL 32816",
    phone: "(321) 555-0126",
    website: "https://example.com/memory-mall-bowl-co",
    tags: ["Solo meal", "Casual hangout", "Open now", "Vegetarian"],
    color: "#edf7e7",
    accent: "#65a30d",
  },
  {
    id: "mock-ucf-curry-room",
    name: "Research Park Curry Room",
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
    location: { lat: 28.5882, lng: -81.1994 },
    address: "Central Florida Research Park, Orlando, FL 32826",
    phone: "(321) 555-0187",
    website: "https://example.com/research-park-curry-room",
    tags: ["Asian", "Exotic", "Highly rated", "Halal", "Vegan"],
    color: "#fff7ed",
    accent: "#ea580c",
  },
  {
    id: "mock-ucf-burger-house",
    name: "Knights Burger House",
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
    location: { lat: 28.6181, lng: -81.2054 },
    address: "McCulloch Rd, Orlando, FL 32817",
    phone: "(321) 555-0155",
    website: "https://example.com/knights-burger-house",
    tags: ["Western", "Casual hangout", "Group outing", "Late night"],
    color: "#f8f4ec",
    accent: "#92400e",
  },
  {
    id: "mock-ucf-palm-cafe",
    name: "Palm Cafe UCF",
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
    location: { lat: 28.5912, lng: -81.2222 },
    address: "University Blvd, Orlando, FL 32817",
    phone: "(321) 555-0108",
    website: "https://example.com/palm-cafe-ucf",
    tags: ["Solo meal", "Coffee", "Open now", "Study spot"],
    color: "#eef2ff",
    accent: "#4f46e5",
  },
];

function reviewForRestaurant(name, rating) {
  return [
    {
      author: "Mock reviewer",
      rating,
      text: `${name} is placeholder UCF-area data so we can keep building FoodFinder without API costs.`,
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

export function getMockUcfRestaurants(cravings = []) {
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
      distance: "UCF area",
      phoneUrl: phoneUrl ? `tel:${phoneUrl}` : "",
      pricePerPerson: restaurant.priceEstimate,
      diningType: "Restaurant",
      matchNote:
        cravings.length > 0
          ? `Matched near UCF using your ${cravings.join(" / ")} profile.`
          : "UCF-only mock restaurant while we build.",
      menuUrl: restaurant.website,
      mapsUrl: `https://www.openstreetmap.org/?mlat=${restaurant.location.lat}&mlon=${restaurant.location.lng}#map=18/${restaurant.location.lat}/${restaurant.location.lng}`,
      reviews: reviewForRestaurant(restaurant.name, restaurant.rating),
      tags: Array.from(
        new Set([...(cravings.length ? cravings.slice(0, 2) : []), ...restaurant.tags])
      ).slice(0, 4),
    };
  });
}
