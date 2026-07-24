const CALENDAR_PAGE =
  "https://www.kongju.ac.kr/KNU/16834/subview.do";
const CALENDAR_MONTH_API =
  "https://www.kongju.ac.kr/schdulmanage/KNU/80/monthSchdul";

function textContent(value) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function dateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function parseCalendarRows(markup, year, fallbackMonth) {
  const rows = [];
  const scheduleTable =
    markup.match(
      /<div class="sche-comt">([\s\S]*?)<div class="table-tail">/i,
    )?.[1] || "";
  const pattern =
    /<tr>\s*<th>([\s\S]*?)<\/th>\s*<td>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/td>\s*<\/tr>/gi;

  for (const match of scheduleTable.matchAll(pattern)) {
    const dateLabel = textContent(match[1]);
    const title = textContent(match[2]);
    const dates = [...dateLabel.matchAll(/(\d{2})\.(\d{2})/g)];
    if (!title || dates.length === 0) continue;

    const startMonth = Number(dates[0][1]) || fallbackMonth;
    const startDay = Number(dates[0][2]);
    const endMonth = dates[1] ? Number(dates[1][1]) : startMonth;
    const endDay = dates[1] ? Number(dates[1][2]) : startDay;

    rows.push({
      id: `${year}-${startMonth}-${startDay}-${title}`,
      title,
      startDate: dateKey(year, startMonth, startDay),
      endDate: dateKey(year, endMonth, endDay),
      dateLabel,
    });
  }

  return rows;
}

function validNumber(value, minimum, maximum) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ message: "Method not allowed" });
  }

  const today = new Date();
  const year =
    validNumber(request.query.year, 2000, 2100) || today.getFullYear();
  const month =
    validNumber(request.query.month, 1, 12) || today.getMonth() + 1;

  try {
    const pageResponse = await fetch(CALENDAR_PAGE, {
      headers: {
        "User-Agent": "PORTY Campus Assistant/1.0",
      },
    });
    if (!pageResponse.ok) {
      throw new Error(`Calendar page returned ${pageResponse.status}`);
    }

    const pageMarkup = await pageResponse.text();
    const csrfToken = pageMarkup.match(/var csrfToken = "([^"]+)"/)?.[1];
    const cookie = pageResponse.headers.get("set-cookie")?.split(";")[0];
    if (!csrfToken || !cookie) {
      throw new Error("Calendar session could not be created");
    }

    const monthResponse = await fetch(CALENDAR_MONTH_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Cookie: cookie,
        "User-Agent": "PORTY Campus Assistant/1.0",
        "X-CSRF-TOKEN": csrfToken,
      },
      body: new URLSearchParams({
        year: String(year),
        month: String(month),
      }),
    });
    if (!monthResponse.ok) {
      throw new Error(`Calendar API returned ${monthResponse.status}`);
    }

    const monthMarkup = await monthResponse.text();
    if (monthMarkup.includes("보안 토큰이 유효하지 않습니다")) {
      throw new Error("Calendar session expired");
    }

    response.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    return response.status(200).json({
      status: "ok",
      year,
      month,
      events: parseCalendarRows(monthMarkup, year, month),
      sourceUrl: CALENDAR_PAGE,
      notice: "일정은 학교 사정에 따라 변경될 수 있습니다.",
    });
  } catch (error) {
    return response.status(502).json({
      status: "unavailable",
      year,
      month,
      events: [],
      sourceUrl: CALENDAR_PAGE,
      message: "공식 학사일정을 불러오지 못했습니다.",
    });
  }
};

module.exports.parseCalendarRows = parseCalendarRows;
