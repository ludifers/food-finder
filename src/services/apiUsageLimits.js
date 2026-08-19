const GOOGLE_DAILY_REQUEST_LIMIT = 20;
const GOOGLE_HOURLY_REQUEST_LIMIT = 10;
const GOOGLE_USAGE_KEY = "googleApiUsage";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadUsage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

export function getGoogleRequestUsage() {
  const today = getTodayKey();
  const currentHour = new Date().getHours();
  const usage = loadUsage(GOOGLE_USAGE_KEY);
  const dailyCount = usage.date === today ? Number(usage.count) || 0 : 0;
  const hourlyCount =
    usage.date === today && usage.hour === currentHour
      ? Number(usage.hourlyCount) || 0
      : 0;

  return {
    count: dailyCount,
    hourlyCount,
    hourlyLimit: GOOGLE_HOURLY_REQUEST_LIMIT,
    limit: GOOGLE_DAILY_REQUEST_LIMIT,
    remaining: Math.max(0, GOOGLE_DAILY_REQUEST_LIMIT - dailyCount),
    hourlyRemaining: Math.max(0, GOOGLE_HOURLY_REQUEST_LIMIT - hourlyCount),
  };
}

export function reserveGoogleRequest(units = 1) {
  const today = getTodayKey();
  const currentHour = new Date().getHours();
  const usage = getGoogleRequestUsage();

  if (usage.count + units > GOOGLE_DAILY_REQUEST_LIMIT) {
    throw new Error(
      "FoodFinder reached today's live search limit. Come back tomorrow for more UCF restaurant matches."
    );
  }

  if (usage.hourlyCount + units > GOOGLE_HOURLY_REQUEST_LIMIT) {
    throw new Error(
      "FoodFinder is cooling down live searches right now. Try again in a bit."
    );
  }

  localStorage.setItem(
    GOOGLE_USAGE_KEY,
    JSON.stringify({
      date: today,
      hour: currentHour,
      count: usage.count + units,
      hourlyCount: usage.hourlyCount + units,
    })
  );
}
