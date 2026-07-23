const aiApiUrl = import.meta.env.VITE_AI_API_URL || "";

async function readJson(request) {
  if (!request.ok) {
    throw new Error(`AI server returned ${request.status}`);
  }

  return request.json();
}

export async function getScheduleReference() {
  return readJson(await fetch(`${aiApiUrl}/api/ai/schedule`));
}

export async function getMealStatus({ campus, place, dorm }) {
  const params = new URLSearchParams({ location: place });
  if (dorm) {
    params.set("dorm", dorm);
  }

  return readJson(
    await fetch(
      `${aiApiUrl}/api/ai/meal/${encodeURIComponent(campus)}?${params}`,
    ),
  );
}
