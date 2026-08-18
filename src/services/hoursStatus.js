function inferTimeZone(location) {
  if (!location) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  const { lat, lng } = location;

  if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66) {
    if (lng <= -114) return "America/Los_Angeles";
    if (lng <= -101) return "America/Denver";
    if (lng <= -86) return "America/Chicago";
    return "America/New_York";
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function localDateParts(timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    weekday: "long",
    year: "numeric",
  }).formatToParts(new Date());
  const valueFor = (type) => parts.find((part) => part.type === type)?.value;
  const hour = Number(valueFor("hour"));

  return {
    dayName: valueFor("weekday"),
    minutes: (hour === 24 ? 0 : hour) * 60 + Number(valueFor("minute")),
  };
}

function parseTime(timeText) {
  const match = timeText
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  const period = match[3].toUpperCase();
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;

  return hour * 60 + minute;
}

function parseHoursRange(dayHours) {
  const normalized = dayHours.replace(/[–—]/g, "-");
  const [openText, closeText] = normalized.split(/\s+-\s+/);

  if (!openText || !closeText) {
    return null;
  }

  const open = parseTime(openText);
  const close = parseTime(closeText);

  if (open === null || close === null) {
    return null;
  }

  return { close, open };
}

function hoursForDay(hoursDetail = [], dayName) {
  const matchingLine = hoursDetail.find((line) =>
    String(line).toLowerCase().startsWith(`${dayName.toLowerCase()}:`)
  );

  if (!matchingLine) {
    return "";
  }

  return matchingLine.split(":").slice(1).join(":").trim();
}

function isWithinRange(minutes, range) {
  if (range.close > range.open) {
    return minutes >= range.open && minutes < range.close;
  }

  return minutes >= range.open || minutes < range.close;
}

export function getHoursStatus(restaurant) {
  if (!restaurant) {
    return "Hours unavailable";
  }

  const timeZone = inferTimeZone(restaurant.location);
  const { dayName, minutes } = localDateParts(timeZone);
  const dayHours = hoursForDay(restaurant.hoursDetail, dayName);

  if (!dayHours) {
    if (restaurant.hours === "Open now") return "Open";
    if (restaurant.hours === "Closed now") return "Closed";
    return "Hours unavailable";
  }

  if (/closed/i.test(dayHours)) {
    return "Closed";
  }

  if (/24\s*hours|open\s*24/i.test(dayHours)) {
    return "Open";
  }

  const range = parseHoursRange(dayHours);

  if (!range) {
    if (restaurant.hours === "Open now") return "Open";
    if (restaurant.hours === "Closed now") return "Closed";
    return "Hours unavailable";
  }

  return isWithinRange(minutes, range) ? "Open" : "Closed";
}
