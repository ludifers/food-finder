import { inferFoodTypesFromText } from "./foodPreferences";

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 680'%3E%3Crect width='900' height='680' fill='%23f6faf7'/%3E%3Ccircle cx='450' cy='300' r='92' fill='%23167a4a' opacity='.22'/%3E%3Cpath d='M300 410h300v42H300z' fill='%2310231a' opacity='.18'/%3E%3Cpath d='M352 276h196l38 134H314z' fill='%23ffffff' stroke='%23cbdad0' stroke-width='18'/%3E%3C/svg%3E";

function formatPrice(priceLevel) {
  if (!priceLevel && priceLevel !== 0) {
    return "Price varies";
  }

  if (typeof priceLevel === "string") {
    const tiers = {
      PRICE_LEVEL_INEXPENSIVE: "$",
      PRICE_LEVEL_MODERATE: "$$",
      PRICE_LEVEL_EXPENSIVE: "$$$",
      PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
    };

    return tiers[priceLevel] || "Price varies";
  }

  return "$".repeat(Math.max(1, Math.min(Number(priceLevel), 4)));
}

function estimatePriceRange(price, cuisine = "") {
  const normalizedCuisine = cuisine.toLowerCase();
  const cuisineRanges = [
    { match: ["coffee", "cafe", "bakery"], ranges: ["$5-$15", "$10-$22", "$18-$32", "$30+"], defaultIndex: 0 },
    { match: ["pizza"], ranges: ["$8-$18", "$14-$28", "$25-$45", "$45+"], defaultIndex: 0 },
    { match: ["chicken"], ranges: ["$9-$20", "$14-$28", "$24-$42", "$42+"], defaultIndex: 0 },
    { match: ["burger", "sandwich"], ranges: ["$9-$18", "$14-$26", "$24-$40", "$40+"], defaultIndex: 0 },
    { match: ["mexican", "taco"], ranges: ["$9-$20", "$15-$30", "$28-$48", "$48+"], defaultIndex: 0 },
    { match: ["sushi", "japanese"], ranges: ["$15-$28", "$22-$42", "$40-$75", "$75+"], defaultIndex: 1 },
    { match: ["thai", "vietnamese", "chinese", "korean"], ranges: ["$11-$22", "$18-$34", "$32-$58", "$58+"], defaultIndex: 1 },
    { match: ["indian"], ranges: ["$12-$24", "$18-$35", "$32-$55", "$55+"], defaultIndex: 1 },
    { match: ["italian"], ranges: ["$13-$26", "$20-$40", "$38-$70", "$70+"], defaultIndex: 1 },
    { match: ["steak", "seafood"], ranges: ["$20-$38", "$32-$60", "$55-$95", "$95+"], defaultIndex: 2 },
    { match: ["american"], ranges: ["$12-$24", "$18-$35", "$32-$60", "$60+"], defaultIndex: 1 },
    { match: ["restaurant"], ranges: ["$10-$22", "$16-$32", "$30-$55", "$55+"], defaultIndex: 1 },
  ];
  const fallbackRanges = ["$8-$15", "$15-$30", "$30-$60", "$60+"];
  const priceIndexes = {
    $: 0,
    $$: 1,
    $$$: 2,
    $$$$: 3,
  };
  const priceIndex = priceIndexes[price];

  const cuisineMatch = cuisineRanges.find((item) =>
    item.match.some((keyword) => normalizedCuisine.includes(keyword))
  );
  const inferredIndex = priceIndex ?? cuisineMatch?.defaultIndex ?? 1;
  const range = cuisineMatch?.ranges[inferredIndex] || fallbackRanges[inferredIndex];

  return `${range} per person`;
}

function getPhotoUrl(place) {
  const photo = place.photos?.[0];

  if (!photo?.getURI) {
    return fallbackImage;
  }

  return photo.getURI({ maxWidth: 900, maxHeight: 680 });
}

function getPhotoGallery(place) {
  const photos = place.photos || [];
  const urls = photos
    .slice(0, 4)
    .map((photo) => {
      if (photo.getURI) {
        return photo.getURI({ maxWidth: 900, maxHeight: 680 });
      }

      if (photo.getUrl) {
        return photo.getUrl({ maxWidth: 900, maxHeight: 680 });
      }

      return "";
    })
    .filter(Boolean);

  if (urls.length === 0) {
    return [fallbackImage];
  }

  return urls;
}

function normalizePlaceText(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.text || value.displayName || "";
}

function formatTypeName(type) {
  return normalizePlaceText(type).replaceAll("_", " ");
}

function getPlaceTypeLabels(place) {
  return [
    place.primaryTypeDisplayName,
    place.primaryType,
    ...(place.types || []),
  ]
    .map(formatTypeName)
    .filter(Boolean);
}

function getCuisine(place) {
  return (
    getPlaceTypeLabels(place).find(
      (type) => type.toLowerCase() !== "restaurant"
    ) || "Restaurant"
  );
}

function getFoodTypes(place, cuisine) {
  return inferFoodTypesFromText(
    getPlaceName(place),
    cuisine,
    getPlaceTypeLabels(place)
  );
}

function getPlaceName(place) {
  return normalizePlaceText(place.displayName) || place.name || "Nearby restaurant";
}

function getHours(place) {
  if (place.regularOpeningHours?.isOpen?.()) {
    return "Open now";
  }

  if (place.regularOpeningHours || place.opening_hours) {
    return "Hours available";
  }

  return "Hours not listed";
}

function getHoursDetail(place) {
  return (
    place.regularOpeningHours?.weekdayDescriptions ||
    place.opening_hours?.weekday_text ||
    []
  );
}

function buildTags(place, cravings, foodTypes = []) {
  const tags = new Set(cravings.length ? cravings.slice(0, 3) : ["Popular nearby"]);

  foodTypes.slice(0, 2).forEach((type) => tags.add(type));

  if (place.rating >= 4.5) {
    tags.add("Highly rated");
  }

  if (place.regularOpeningHours?.isOpen?.()) {
    tags.add("Open now");
  }

  return Array.from(tags).slice(0, 4);
}

function buildGoogleMapsSearchUrl(name, placeId) {
  if (!placeId) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    name || "Restaurant"
  )}&query_place_id=${placeId}`;
}

function buildMenuSearchUrl(name, address) {
  const query = [name, address, "menu"].filter(Boolean).join(" ");

  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildPhoneUrl(phone) {
  if (!phone || phone.includes("available")) {
    return "";
  }

  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function mapGoogleReviews(place, mapsUrl) {
  const reviews = place.reviews || [];
  const mappedReviews = reviews
    .filter((review) => review.text || review.originalText)
    .slice(0, 2)
    .map((review) => ({
      author:
        review.authorAttribution?.displayName ||
        review.author_name ||
        "Google reviewer",
      rating: review.rating,
      text: review.text || review.originalText,
      time:
        review.relativePublishTimeDescription ||
        review.relative_time_description ||
        "",
      url: review.googleMapsURI || review.authorAttribution?.uri || mapsUrl,
    }));

  if (mappedReviews.length) {
    return mappedReviews;
  }

  if (place.reviewSummary?.text) {
    return [
      {
        author: "Google review summary",
        rating: place.rating,
        text: place.reviewSummary.text,
        time: "",
        url: place.reviewSummary.reviewsURI || mapsUrl,
      },
    ];
  }

  return [
    {
      author: "Google Maps",
      rating: place.rating,
      text: "Open the Google Maps listing for recent reviews.",
      time: "",
      url: mapsUrl,
    },
  ];
}

export function mapGooglePlaceToRestaurant(place, index, cravings = []) {
  const image = getPhotoUrl(place);
  const gallery = getPhotoGallery(place);
  const name = getPlaceName(place);
  const cuisine = getCuisine(place);
  const foodTypes = getFoodTypes(place, cuisine);
  const price = formatPrice(place.priceLevel);
  const priceEstimate = estimatePriceRange(price, cuisine);
  const rating = place.rating || "New";
  const tags = buildTags(place, cravings, foodTypes);
  const mapsUrl = place.googleMapsURI || "";
  const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || "";
  const address = place.formattedAddress || "Address available on Google Maps";
  const website = place.websiteURI || mapsUrl;
  const hoursDetail = getHoursDetail(place);

  return {
    id: place.id,
    name,
    image: gallery[0] || image,
    gallery,
    cuisine,
    price,
    priceEstimate,
    distance: "Nearby",
    rating,
    hours: getHours(place),
    hoursDetail,
    highlight: cuisine,
    emoji: String(index + 1),
    tags,
    foodTypes,
    cravings,

    phone: phone || "Phone available on Google Maps",
    phoneUrl: buildPhoneUrl(phone),
    pricePerPerson: priceEstimate,
    diningType: "Restaurant",
    matchNote:
      cravings.length > 0
        ? `Matched near UCF using your ${cravings.join(" / ")} profile.`
        : "Popular restaurant result from Google Places near UCF.",
    address,
    budgetNote: price === "Price varies" ? "Google does not list a price level." : `${price} on Google`,
    driveTime: "Open in Google Maps for live travel time",
    driveNote: "Live traffic is handled by Google Maps.",

    dealTitle: "Google Maps listing",
    dealPrice: rating === "New" ? "Rating not listed" : `${rating} rating`,
    dealDetails: place.userRatingCount
      ? `${place.userRatingCount} Google reviews`
      : "Review count not listed",

    menuHighlights: [cuisine, "Photos and details from Google Places", "Check menu link"],
    localFavorites: tags,

    reviews: mapGoogleReviews(place, mapsUrl),

    details: {
      parking: "Check listing",
      dineIn: "Check listing",
      takeout: "Check listing",
    },

    summary:
      place.editorialSummary ||
      `${name} is a live Google Places result near UCF.`,
    mapsUrl,
    website,
    menuUrl: website || buildMenuSearchUrl(name, address),
    location: place.location
      ? {
          lat: place.location.lat(),
          lng: place.location.lng(),
        }
      : null,
  };
}

export function mapLegacyPlaceToRestaurant(place, index, cravings = []) {
  const image = place.photos?.[0]?.getUrl
    ? place.photos[0].getUrl({ maxWidth: 900, maxHeight: 680 })
    : fallbackImage;
  const name = place.name || "Nearby restaurant";
  const cuisine = getCuisine({
    ...place,
    displayName: name,
    primaryType: place.types?.find((type) => type !== "restaurant"),
  });
  const foodTypes = getFoodTypes(
    {
      ...place,
      displayName: name,
      primaryType: place.types?.find((type) => type !== "restaurant"),
    },
    cuisine
  );
  const price = formatPrice(place.price_level);
  const priceEstimate = estimatePriceRange(price, cuisine);
  const rating = place.rating || "New";
  const isOpen = place.opening_hours?.isOpen?.();
  const hoursDetail = getHoursDetail(place);
  const tags = buildTags(
    {
      rating: place.rating,
      regularOpeningHours: isOpen ? { isOpen: () => true } : null,
    },
    cravings,
    foodTypes
  );

  const mapsUrl = buildGoogleMapsSearchUrl(place.name, place.place_id);
  const address = place.vicinity || place.formatted_address || "Address available on Google Maps";

  const gallery = getPhotoGallery(place);

  return {
    id: place.place_id,
    name,
    image: gallery[0] || image,
    gallery,
    cuisine,
    price,
    priceEstimate,
    distance: "Nearby",
    rating,
    hours: isOpen ? "Open now" : "Hours available on Google Maps",
    hoursDetail,
    highlight: cuisine,
    emoji: String(index + 1),
    tags,
    foodTypes,
    cravings,

    phone: "Phone available on Google Maps",
    phoneUrl: "",
    pricePerPerson: priceEstimate,
    diningType: "Restaurant",
    matchNote:
      cravings.length > 0
        ? `Matched near UCF using your ${cravings.join(" / ")} profile.`
        : "Popular restaurant result from Google Places near UCF.",
    address,
    budgetNote: price === "Price varies" ? "Google does not list a price level." : `${price} on Google`,
    driveTime: "Open in Google Maps for live travel time",
    driveNote: "Live traffic is handled by Google Maps.",

    dealTitle: "Google Maps listing",
    dealPrice: rating === "New" ? "Rating not listed" : `${rating} rating`,
    dealDetails: place.user_ratings_total
      ? `${place.user_ratings_total} Google reviews`
      : "Review count not listed",

    menuHighlights: [cuisine, "Photos and details from Google Places", "Check menu link"],
    localFavorites: tags,

    reviews: mapGoogleReviews(place, mapsUrl),

    details: {
      parking: "Check listing",
      dineIn: "Check listing",
      takeout: "Check listing",
    },

    summary: `${place.name || "This restaurant"} is a live Google Places result near UCF.`,
    mapsUrl,
    website: mapsUrl,
    menuUrl: buildMenuSearchUrl(place.name, address),
    location: place.geometry?.location
      ? {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }
      : null,
  };
}
