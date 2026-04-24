const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'JapanJournalApp/1.0';

interface NominatimResult {
  display_name: string;
  name?: string;
  type?: string;
  address?: Record<string, string>;
}

function extractPlaceName(result: NominatimResult): string | null {
  if (result.name && result.name.trim().length > 0) {
    return result.name.trim();
  }

  const addr = result.address;
  if (!addr) return null;

  const candidates = [
    addr.tourism,
    addr.amenity,
    addr.shop,
    addr.building,
    addr.leisure,
    addr.historic,
    addr.road,
    addr.neighbourhood,
    addr.suburb,
  ];

  for (const c of candidates) {
    if (c && c.trim().length > 0) return c.trim();
  }

  return null;
}

export async function fetchNearbyPlaces(
  lat: number,
  lon: number
): Promise<string[]> {
  const headers = { 'User-Agent': USER_AGENT, Accept: 'application/json' };
  const places: string[] = [];
  const seen = new Set<string>();

  const addUnique = (name: string | null) => {
    if (!name) return;
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      places.push(name);
    }
  };

  try {
    const reverseRes = await fetch(
      `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
      { headers }
    );
    if (reverseRes.ok) {
      const data: NominatimResult = await reverseRes.json();
      addUnique(extractPlaceName(data));

      if (data.address) {
        addUnique(data.address.road || null);
        addUnique(data.address.neighbourhood || null);
        addUnique(data.address.suburb || null);
        addUnique(data.address.city || data.address.town || data.address.village || null);
      }
    }
  } catch {
    // continue to search query
  }

  const delta = 0.003;
  const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
  const poiTypes = ['tourism', 'amenity', 'shop', 'historic', 'leisure'];

  for (const poiType of poiTypes) {
    if (places.length >= 8) break;
    try {
      const searchRes = await fetch(
        `${NOMINATIM_BASE}/search?format=json&limit=3&viewbox=${viewbox}&bounded=1&q=[${poiType}]&addressdetails=1`,
        { headers }
      );
      if (searchRes.ok) {
        const results: NominatimResult[] = await searchRes.json();
        for (const r of results) {
          addUnique(extractPlaceName(r));
        }
      }
    } catch {
      // skip this category
    }
  }

  return places.slice(0, 8);
}
