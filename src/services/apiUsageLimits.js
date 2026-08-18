const GOOGLE_DAILY_REQUEST_LIMIT = 20;
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
  const usage = loadUsage(GOOGLE_USAGE_KEY);

  return {
    count: usage.date === today ? Number(usage.count) || 0 : 0,
    limit: GOOGLE_DAILY_REQUEST_LIMIT,
    remaining: Math.max(
      0,
      GOOGLE_DAILY_REQUEST_LIMIT - (usage.date === today ? Number(usage.count) || 0 : 0)
    ),
  };
}

export function reserveGoogleRequest(units = 1) {
  const today = getTodayKey();
  const usage = getGoogleRequestUsage();

  if (usage.count + units > GOOGLE_DAILY_REQUEST_LIMIT) {
    throw new Error(
      `Daily Google request limit reached (${GOOGLE_DAILY_REQUEST_LIMIT}/day). Try again tomorrow.`
    );
  }

  localStorage.setItem(
    GOOGLE_USAGE_KEY,
    JSON.stringify({
      date: today,
      count: usage.count + units,
    })
  );
}
