import { GooglePlaceProspect } from '../types/leads';

export async function verifyGoogleMapsKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || !apiKey.trim()) return { valid: false, error: 'API key is empty.' };
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Bangalore&key=${apiKey.trim()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
        return { valid: true };
      }
      return { valid: false, error: data.error_message || data.status };
    }
    return { valid: false, error: `HTTP ${res.status}` };
  } catch (e: any) {
    return { valid: false, error: e.message || 'Network error.' };
  }
}

export async function searchGooglePlacesProspects(
  keyword: string,
  location: string,
  _radiusKm: number,
  apiKey?: string
): Promise<GooglePlaceProspect[]> {
  if (!apiKey || !apiKey.trim()) {
    return [];
  }
  try {
    const query = encodeURIComponent(`${keyword} in ${location}`);
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey.trim()}`);
    if (res.ok) {
      const data = await res.json();
      return (data.results || []).map((p: any) => ({
        placeId: p.place_id,
        name: p.name,
        address: p.formatted_address || location,
        rating: p.rating,
        userRatingsTotal: p.user_ratings_total,
        hasWebsite: Boolean(p.website),
        websiteUrl: p.website || undefined,
        phone: p.formatted_phone_number || undefined,
        category: keyword,
        location: p.geometry?.location
      }));
    }
    return [];
  } catch {
    return [];
  }
}
