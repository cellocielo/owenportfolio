/**
 * Persistent Slide Title Links Utility
 * Allows inserting, editing, and deleting custom destination links for each slide's title,
 * persisting them permanently in localStorage with namespacing by zone, project name, badge, and ID.
 */

const STORAGE_KEY = 'portfolio_custom_slide_links';

// In-memory cache for fast synchronous access
const memoryLinkCache: Record<string, string> = {};

// Built-in default links for specific slides
export const DEFAULT_LINKS: Record<string, string> = {
  // Spritz
  'frame_spritz': 'https://spritzfragranceapp.vercel.app/',
  'frame_spritz_web_application_dev': 'https://spritzfragranceapp.vercel.app/',

  // Interactive 3D Unity Simulation
  'frame_interactive_3d_unity_simulation': 'https://youtu.be/pECVg5tfTos',
  'frame_interactive_3d_unity_simulation_game_engine_dev': 'https://youtu.be/pECVg5tfTos',

  // All JAMMA Tennis slides -> jammatennis.com (except Strings zone)
  'sweetspot_sweetspot-jamma': 'https://jammatennis.com',
  'sweetspot_jamma_tennis': 'https://jammatennis.com',
  'sweetspot_jamma_tennis_financial_growth': 'https://jammatennis.com',
  'grip_grip-jamma': 'https://jammatennis.com',
  'grip_jamma_tennis': 'https://jammatennis.com',
  'grip_jamma_tennis_executive_leadership': 'https://jammatennis.com',

  // Research slides (SIP) -> Canva link
  'strings_human_ai_collaboration_research__sip_2026_': 'https://www.canva.com/design/DAGNHKcH9WQ/4TR-r2zP1hB1eUTbhNQbHg/edit',
  'strings_human_ai_collaboration_research__sip_2026__agency_vs__automation': 'https://www.canva.com/design/DAGNHKcH9WQ/4TR-r2zP1hB1eUTbhNQbHg/edit',
  'strings_nature_based_recreational_apps__sip_2025_': 'https://www.canva.com/design/DAGNHKcH9WQ/4TR-r2zP1hB1eUTbhNQbHg/edit',
  'strings_nature_based_recreational_apps__sip_2025__user_vs__eco_friction': 'https://www.canva.com/design/DAGNHKcH9WQ/4TR-r2zP1hB1eUTbhNQbHg/edit',

  // L3 AV Auditory Framework
  'frame_l3_autonomous_vehicle_auditory_framework': '#paper-l3-av',
  'frame_l3_autonomous_vehicle_auditory_framework_decision_systems': '#paper-l3-av',

  // Indoor Bouldering -> Kaya Climb user profile
  'dampener_indoor_bouldering': 'https://kaya-app.kayaclimb.com/user/vamanos6871',
  'dampener_indoor_bouldering_physical_problem_solving': 'https://kaya-app.kayaclimb.com/user/vamanos6871',

  // Denzel Curry Superfan -> Spotify playlist
  'dampener_denzel_curry_superfan': 'https://open.spotify.com/playlist/1B86vjWFKG2VQWsJFahaYm?si=d0a158a286624ef4',
  'dampener_denzel_curry_superfan_auditory_architecture': 'https://open.spotify.com/playlist/1B86vjWFKG2VQWsJFahaYm?si=d0a158a286624ef4',
  'dampener_exploring___dissecting_music': 'https://open.spotify.com/playlist/1B86vjWFKG2VQWsJFahaYm?si=d0a158a286624ef4'
};

// Initialize cache from localStorage & purge disabled links
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let changed = false;
      for (const k of Object.keys(parsed)) {
        const lower = k.toLowerCase();
        if (
          lower.includes('fragrance') ||
          lower.includes('_tennis') ||
          (lower.includes('sweetspot') && (lower.includes('coaching') || lower.includes('tomorrow') || lower.includes('tft'))) ||
          (lower.includes('grip') && (lower.includes('tomorrow') || lower.includes('tft'))) ||
          (lower.includes('strings') && (lower.includes('jamma') || lower.includes('strike')))
        ) {
          delete parsed[k];
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      Object.assign(memoryLinkCache, parsed);
    }
  }
} catch (err) {
  console.warn('Failed to initialize link cache from localStorage', err);
}

// Check if a slide explicitly has destination link capability disabled
export function isSlideLinkDisabled(
  zone: string,
  projectName?: string,
  projectId?: string
): boolean {
  const z = (zone || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = (projectName || '').trim().toLowerCase();
  const id = (projectId || '').trim().toLowerCase();

  // 1. Last 3 slides on "Sweet Spot": Coaching Tennis, Tech For Tomorrow (scaling & teaching)
  if (
    (z === 'sweetspot' || z === 'thesweetspot') &&
    (name.includes('coaching') || name.includes('tomorrow') || id.includes('coaching') || id.includes('tft'))
  ) {
    return true;
  }

  // 2. "collecting fragrances" in dampener
  if (name.includes('fragrance') || id.includes('fragrance')) {
    return true;
  }

  // 3. "tennis" (the personal interests / dampener Tennis slide)
  if ((z === 'dampener' || z === 'vibrationdampener') && (name === 'tennis' || id.includes('tennis-img') || id === 'dampener-tennis')) {
    return true;
  }

  // 4. "techfortomorrow in the grip section"
  if (z === 'grip' && (name.includes('tech for tomorrow') || id.includes('tft'))) {
    return true;
  }

  // 5. "JAMMA Tennis" in the strings section ("shouldnt have a link just slides that say jamma tennis")
  if (
    (z === 'strings' || z === 'thestrings') &&
    (name.includes('jamma') || name.includes('strike') || id.includes('jamma'))
  ) {
    return true;
  }

  return false;
}

// Generate unique key for a project slide in a zone
export function getSlideLinkKey(
  zone: string,
  projectName: string,
  projectBadge?: string,
  projectId?: string
): string {
  const zoneKey = zone.trim().toLowerCase();

  // 1. If explicit projectId is provided, prioritize it
  if (projectId) {
    return `${zoneKey}_${projectId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
  }

  // 2. If projectBadge is provided, use name + badge to keep different slides with same name unique
  const nameKey = projectName.trim().toLowerCase().replace(/\s+/g, '_');
  if (projectBadge) {
    const badgeKey = projectBadge.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return `${zoneKey}_${nameKey}_${badgeKey}`;
  }

  // 3. Fallback to zone + name
  return `${zoneKey}_${nameKey}`;
}

export function getAllCustomLinks(): Record<string, string> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read links from localStorage', e);
  }
  return { ...memoryLinkCache };
}

// Ensure URL has a valid protocol
export function formatUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// Get saved link for a slide
export function getCustomLink(
  zone: string,
  projectName: string,
  projectBadge?: string,
  projectId?: string
): string | null {
  if (isSlideLinkDisabled(zone, projectName, projectId)) {
    return null;
  }

  const specificKey = getSlideLinkKey(zone, projectName, projectBadge, projectId);
  if (memoryLinkCache[specificKey]) return memoryLinkCache[specificKey];

  const all = getAllCustomLinks();
  if (all[specificKey]) return all[specificKey];

  // Fallback to name+badge if queried by ID
  if (projectId && projectBadge) {
    const badgeKey = getSlideLinkKey(zone, projectName, projectBadge);
    if (memoryLinkCache[badgeKey]) return memoryLinkCache[badgeKey];
    if (all[badgeKey]) return all[badgeKey];
  }

  // Fallback to zone+name
  const nameKey = `${zone.trim().toLowerCase()}_${projectName.trim().toLowerCase().replace(/\s+/g, '_')}`;
  if (memoryLinkCache[nameKey]) return memoryLinkCache[nameKey];
  if (all[nameKey]) return all[nameKey];

  // Fallback to DEFAULT_LINKS
  if (DEFAULT_LINKS[specificKey]) return DEFAULT_LINKS[specificKey];
  if (projectId && DEFAULT_LINKS[`${zone.trim().toLowerCase()}_${projectId.trim().toLowerCase()}`]) {
    return DEFAULT_LINKS[`${zone.trim().toLowerCase()}_${projectId.trim().toLowerCase()}`];
  }
  if (projectBadge) {
    const badgeKey = getSlideLinkKey(zone, projectName, projectBadge);
    if (DEFAULT_LINKS[badgeKey]) return DEFAULT_LINKS[badgeKey];
  }
  if (DEFAULT_LINKS[nameKey]) return DEFAULT_LINKS[nameKey];

  // General fallback for all JAMMA slides
  if (projectName.toLowerCase().includes('jamma')) {
    return 'https://jammatennis.com';
  }

  return null;
}

// Save custom link for a slide
export function saveCustomLink(
  zone: string,
  projectName: string,
  rawUrl: string,
  projectBadge?: string,
  projectId?: string
): string {
  const formatted = formatUrl(rawUrl);
  const specificKey = getSlideLinkKey(zone, projectName, projectBadge, projectId);

  memoryLinkCache[specificKey] = formatted;

  try {
    const all = getAllCustomLinks();
    all[specificKey] = formatted;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Failed to save link to localStorage', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('custom-links-updated', {
        detail: { key: specificKey, link: formatted },
      })
    );
  }

  return formatted;
}

// Remove custom link
export function removeCustomLink(
  zone: string,
  projectName: string,
  projectBadge?: string,
  projectId?: string
): void {
  const specificKey = getSlideLinkKey(zone, projectName, projectBadge, projectId);
  delete memoryLinkCache[specificKey];

  const nameKey = `${zone.trim().toLowerCase()}_${projectName.trim().toLowerCase().replace(/\s+/g, '_')}`;
  delete memoryLinkCache[nameKey];

  let badgeKey = '';
  if (projectBadge) {
    badgeKey = getSlideLinkKey(zone, projectName, projectBadge);
    delete memoryLinkCache[badgeKey];
  }

  try {
    const all = getAllCustomLinks();
    delete all[specificKey];
    delete all[nameKey];
    if (badgeKey) delete all[badgeKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to remove link from localStorage', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('custom-links-updated', {
        detail: { key: specificKey, link: null },
      })
    );
  }
}
