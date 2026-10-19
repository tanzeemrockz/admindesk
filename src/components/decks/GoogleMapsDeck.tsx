import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  verifyGoogleMapsKey,
  searchGooglePlacesProspects
} from '../../services/googleMapsService';
import { GooglePlaceProspect } from '../../types/leads';
import {
  IconGoogleMaps,
  IconSearch,
  IconPlus,
  IconExternalLink,
  IconCheckCircle,
  IconAlertCircle,
  IconKey
} from '../../lib/icons';

interface GoogleMapsDeckProps {
  initialKey?: string;
  onImportLead?: (prospect: GooglePlaceProspect) => void;
}

export function GoogleMapsDeck({ initialKey = '', onImportLead }: GoogleMapsDeckProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('csc_maps_key') || initialKey);
  const [keyStatus, setKeyStatus] = useState<'connected' | 'disconnected' | 'verifying' | 'error'>('disconnected');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [keyword, setKeyword] = useState('Boutique');
  const [location, setLocation] = useState('Tirunelveli, Tamil Nadu');
  const [radiusKm, setRadiusKm] = useState(15);
  const [filterNoWebsiteOnly, setFilterNoWebsiteOnly] = useState(false);
  const [results, setResults] = useState<GooglePlaceProspect[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importedPlaceIds, setImportedPlaceIds] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const verifyKey = useCallback(async (k: string) => {
    if (!k.trim()) {
      setKeyStatus('disconnected');
      return;
    }
    setKeyStatus('verifying');
    setErrorMsg(null);

    const res = await verifyGoogleMapsKey(k);
    if (res.valid) {
      setKeyStatus('connected');
    } else {
      setKeyStatus('error');
      setErrorMsg(res.error || 'Invalid Google Maps API Key');
    }
  }, []);

  useEffect(() => {
    if (apiKey) verifyKey(apiKey);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim() || !location.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);
    try {
      const data = await searchGooglePlacesProspects(keyword, location, radiusKm, apiKey);
      setResults(data);
      if (data.length === 0) {
        showNotice('No prospects found matching query criteria.', 'error');
      } else {
        showNotice(`Found ${data.length} prospects in ${location}.`, 'success');
      }
    } catch (err: any) {
      showNotice(err.message || 'Search failed', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (prospect: GooglePlaceProspect) => {
    try {
      const newLead = {
        id: `lead-maps-${Date.now()}`,
        name: prospect.name,
        company: prospect.name,
        source: 'Google Maps Engine',
        phone: prospect.phone || '',
        estimated_value_inr: 45000,
        has_website: prospect.hasWebsite,
        website_url: prospect.websiteUrl,
        notes: `Discovered on Google Maps (${prospect.address}). Rating: ${prospect.rating ?? 'N/A'} (${prospect.userRatingsTotal ?? 0} reviews). ${prospect.hasWebsite ? 'Has website' : 'HOT: No website detected'}.`,
        status: 'Cold Contact',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('leads').insert([newLead]);
      if (error) throw error;

      setImportedPlaceIds((prev) => ({ ...prev, [prospect.placeId]: true }));
      if (onImportLead) onImportLead(prospect);
      showNotice(`Imported "${prospect.name}" to Supabase Leads!`, 'success');
    } catch (err: any) {
      showNotice(err.message || 'Import failed', 'error');
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('csc_maps_key', apiKey);
    verifyKey(apiKey);
  };

  const displayedResults = filterNoWebsiteOnly
    ? results.filter((r) => !r.hasWebsite)
    : results;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-base border border-border text-rose-400">
            <IconGoogleMaps className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-white">Google Maps Engine</h1>
              {keyStatus === 'connected' && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Places API Ready
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Live Google Places prospect intelligence, missing website detection, and 1-click Supabase lead ingestion.
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setKeyword('Boutique');
              setLocation('Tirunelveli, Tamil Nadu');
              setTimeout(() => handleSearch(), 100);
            }}
            className="px-2.5 py-1 rounded-lg bg-base hover:bg-elevated border border-border text-zinc-300 text-xs font-mono transition"
          >
            Tirunelveli Boutiques
          </button>
          <button
            onClick={() => {
              setKeyword('Catering Services');
              setLocation('Madurai, Tamil Nadu');
              setTimeout(() => handleSearch(), 100);
            }}
            className="px-2.5 py-1 rounded-lg bg-base hover:bg-elevated border border-border text-zinc-300 text-xs font-mono transition"
          >
            Madurai Caterers
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Search & Results (8 cols) and API Key (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Search Bar & Results Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search Controls Card */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Industry / Target Business Category
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. Boutique, Caterer, Packaging"
                    required
                    className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    City, Locality, or Region
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Tirunelveli, Tamil Nadu"
                    required
                    className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                {/* Radius Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400">Radius:</span>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-28 accent-rose-500"
                  />
                  <span className="text-xs font-mono font-bold text-white">{radiusKm} km</span>
                </div>

                {/* Filter Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={filterNoWebsiteOnly}
                    onChange={(e) => setFilterNoWebsiteOnly(e.target.checked)}
                    className="rounded bg-base border-border text-rose-500 focus:ring-0"
                  />
                  <span>Only businesses without a website (Hot Leads)</span>
                </label>

                {/* Search Trigger */}
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                >
                  <IconSearch className="w-3.5 h-3.5 text-zinc-950" />
                  <span>{isSearching ? 'Scanning Maps...' : 'Execute Places Scan'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Results List */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Prospects Stream ({displayedResults.length})
              </h2>
              <span className="text-[11px] text-zinc-400 font-mono">
                {displayedResults.filter((r) => !r.hasWebsite).length} missing websites
              </span>
            </div>

            {displayedResults.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                {results.length > 0 && filterNoWebsiteOnly
                  ? 'All discovered prospects currently possess an existing website.'
                  : 'Enter target industry and city above, then click Execute Places Scan.'}
              </div>
            ) : (
              <div className="space-y-3">
                {displayedResults.map((prospect) => {
                  const isImported = Boolean(importedPlaceIds[prospect.placeId]);

                  return (
                    <div
                      key={prospect.placeId}
                      className="p-4 rounded-xl bg-base border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs truncate">
                            {prospect.name}
                          </span>
                          {!prospect.hasWebsite ? (
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                              NO WEBSITE (HOT)
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400">
                              Has Website
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-zinc-400 truncate">
                          {prospect.address}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                          {prospect.phone && (
                            <span className="text-zinc-300">{prospect.phone}</span>
                          )}
                          <span>•</span>
                          <span>Rating: {prospect.rating ?? 'N/A'} ({prospect.userRatingsTotal ?? 0} reviews)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prospect.name + ' ' + prospect.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-surface hover:bg-elevated border border-border text-zinc-400 hover:text-white transition"
                          title="Open on Google Maps"
                        >
                          <IconExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleImport(prospect)}
                          disabled={isImported}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            isImported
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                              : 'bg-white hover:bg-zinc-200 text-zinc-950'
                          }`}
                        >
                          {isImported ? (
                            <>
                              <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Imported</span>
                            </>
                          ) : (
                            <>
                              <IconPlus className="w-3.5 h-3.5 text-zinc-950" />
                              <span>Import to Leads</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: API Key Settings & Intelligence Notes (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <IconKey className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Google Maps API Key
              </h2>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Places API Web Service Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy••••••••••••••••••••••••••••"
                  className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                  <IconAlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-elevated hover:bg-zinc-800 border border-border text-white font-semibold text-xs transition"
              >
                Save &amp; Verify Key
              </button>
            </form>

            <div className="text-[11px] text-zinc-400 space-y-2 pt-2 border-t border-border">
              <span className="font-semibold text-zinc-200">How Lead Hunter Works:</span>
              <p className="leading-relaxed">
                Queries the official Google Places REST API Text Search endpoint with keyword and location constraints. Prospects with <code className="text-zinc-300 font-mono">website: null</code> represent high-conversion opportunities for custom web design, portfolio deployment, and SEO services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
