export interface GooglePlaceProspect {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  userRatingsTotal?: number;
  hasWebsite: boolean;
  websiteUrl?: string;
  category?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface LeadHunterFilter {
  query: string;
  location: string;
  radiusKm: number;
  noWebsiteOnly: boolean;
  hasPhoneOnly: boolean;
}
