import { useState } from 'react';
import { GooglePlaceProspect } from '../../types/leads';
import { searchGooglePlacesProspects } from '../../services/googleMapsService';
import { formatWhatsAppNumber } from '../../lib/formatters';
import { IconSearch, IconGoogleMaps, IconWhatsApp, IconPlus, IconCheck, IconAlertCircle } from '../../lib/icons';

interface GoogleMapsLeadHunterProps {
  onImportLead: (prospect: GooglePlaceProspect) => void;
  onOpenWhatsApp: (phone: string, businessName: string) => void;
}

export function GoogleMapsLeadHunter({ onImportLead, onOpenWhatsApp }: GoogleMapsLeadHunterProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [radiusKm, setRadiusKm] = useState(15);
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(true);
  const [hasPhoneOnly, setHasPhoneOnly] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [prospects, setProspects] = useState<GooglePlaceProspect[]>([]);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [searchNotice, setSearchNotice] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !location.trim()) return;
    setIsSearching(true);
    setSearchNotice(null);
    try {
      const apiKey = localStorage.getItem('csc_maps_key') || '';
      if (!apiKey) {
        setSearchNotice('Google Places API key is not configured. Add your API key in Connectors Mesh to query Google Maps.');
        setProspects([]);
        return;
      }
      const results = await searchGooglePlacesProspects(keyword, location, radiusKm, apiKey);
      let filtered = results;
      if (noWebsiteOnly) {
        filtered = filtered.filter((p) => !p.hasWebsite);
      }
      if (hasPhoneOnly) {
        filtered = filtered.filter((p) => Boolean(p.phone));
      }
      setProspects(filtered);
      if (filtered.length === 0) {
        setSearchNotice('Zero results returned for the specified category and location.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = (p: GooglePlaceProspect) => {
    onImportLead(p);
    setImportedIds((prev) => new Set(prev).add(p.placeId));
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-4 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <IconGoogleMaps className="w-4 h-4 text-rose-500" />
          <h3 className="font-display text-sm font-bold text-white tracking-tight">Google Maps Hunter</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300">
          Places API
        </span>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[#a1a1a1] font-medium mb-1 text-[11px]">Target Keyword / Category</label>
          <input
            type="text"
            required
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. Dentists, Architects"
            className="w-full px-3 py-1.5 bg-black border border-[#222222] focus:border-white rounded-md text-white text-xs placeholder:text-[#555555] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#a1a1a1] font-medium mb-1 text-[11px]">City or Locality</label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bangalore, Indiranagar"
            className="w-full px-3 py-1.5 bg-black border border-[#222222] focus:border-white rounded-md text-white text-xs placeholder:text-[#555555] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#a1a1a1] font-medium mb-1 text-[11px]">Search Radius: {radiusKm} km</label>
          <input
            type="range"
            min="2"
            max="50"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer mt-2.5 accent-white"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-1.5 px-3 bg-white hover:bg-[#eaeaea] text-black font-semibold rounded-md text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-xs"
          >
            <IconSearch className="w-3.5 h-3.5" />
            <span>{isSearching ? 'Scanning...' : 'Scan Places'}</span>
          </button>
        </div>
      </form>

      {/* Filter Toggles */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#a1a1a1]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={noWebsiteOnly}
            onChange={(e) => setNoWebsiteOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-emerald-500"
          />
          <span className="font-medium text-emerald-400">No Website Only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasPhoneOnly}
            onChange={(e) => setHasPhoneOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-emerald-500"
          />
          <span>Phone Detected</span>
        </label>
      </div>

      {searchNotice && (
        <div className="p-3 bg-black border border-[#222222] rounded-md text-xs text-[#ededed] flex items-center gap-2">
          <IconAlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{searchNotice}</span>
        </div>
      )}

      {/* Results List */}
      {prospects.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-[#222222]">
          <div className="text-[11px] font-mono font-semibold text-[#888888] uppercase tracking-wider">
            Discovered Places ({prospects.length})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prospects.map((p) => {
              const isImported = importedIds.has(p.placeId);
              const waNum = formatWhatsAppNumber(p.phone);

              return (
                <div key={p.placeId} className="bg-black border border-[#222222] hover:border-[#383838] rounded-md p-3 space-y-2 text-xs transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-white font-display text-xs">{p.name}</h4>
                      <p className="text-[11px] text-[#888888] truncate max-w-xs">{p.address}</p>
                    </div>
                    {!p.hasWebsite && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 shrink-0">
                        No Website
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1c1c1c] text-[11px]">
                    <span className="text-[#888888] font-mono">
                      {p.rating ? `★ ${p.rating} (${p.userRatingsTotal || 0})` : 'Unrated'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {waNum && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(waNum, p.name)}
                          className="px-2 py-1 bg-black hover:bg-[#111111] border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                        >
                          <IconWhatsApp className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleImport(p)}
                        disabled={isImported}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                          isImported
                            ? 'bg-[#181818] border border-[#2e2e2e] text-[#666666]'
                            : 'bg-white text-black font-semibold hover:bg-[#eaeaea] shadow-xs active:scale-[0.98]'
                        }`}
                      >
                        {isImported ? (
                          <>
                            <IconCheck className="w-3 h-3 text-emerald-400" />
                            <span>Imported</span>
                          </>
                        ) : (
                          <>
                            <IconPlus className="w-3 h-3" />
                            <span>Import</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
