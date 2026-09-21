/**
 * Know India Data Adapter
 * Single source of truth for all India-related data
 * 
 * This adapter wraps the @aryanjsx/knowindia package and provides
 * consistent functions for accessing states, union territories, and places data.
 * 
 * @module lib/knowIndia
 */

import { states as getStatesData, uts as getUTsData, INDIA } from '@aryanjsx/knowindia';

/**
 * Generate a URL-friendly slug from a name
 * @param {string} name - The name to convert to slug
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with dashes
    .replace(/-+/g, '-')       // Replace multiple dashes with single dash
    .trim();
};

/**
 * Get all states and union territories combined
 * @returns {Array} Array of all states and UTs with slugs
 */
export const getAllStates = () => {
  const statesData = getStatesData();
  const utsData = getUTsData();
  const allRegions = [];

  // Process states
  for (const code in statesData) {
    const state = statesData[code];
    allRegions.push({
      ...state,
      code,
      slug: generateSlug(state.name),
      type: 'state',
    });
  }

  // Process union territories
  for (const code in utsData) {
    const ut = utsData[code];
    allRegions.push({
      ...ut,
      code,
      slug: generateSlug(ut.name),
      type: 'union_territory',
    });
  }

  // Sort alphabetically by name
  return allRegions.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get a specific state or UT by its slug
 * @param {string} slug - The URL slug of the state/UT
 * @returns {Object|null} State/UT data or null if not found
 */
export const getStateBySlug = (slug) => {
  if (!slug) return null;
  
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-');
  const statesData = getStatesData();
  const utsData = getUTsData();

  // Search in states
  for (const code in statesData) {
    const state = statesData[code];
    const stateSlug = generateSlug(state.name);
    if (stateSlug === normalizedSlug) {
      return {
        ...state,
        code,
        slug: stateSlug,
        type: 'state',
      };
    }
  }

  // Search in union territories
  for (const code in utsData) {
    const ut = utsData[code];
    const utSlug = generateSlug(ut.name);
    if (utSlug === normalizedSlug) {
      return {
        ...ut,
        code,
        slug: utSlug,
        type: 'union_territory',
      };
    }
  }

  return null;
};

/**
 * Get a state/UT by its code (e.g., 'MH', 'DL')
 * @param {string} code - The state/UT code
 * @returns {Object|null} State/UT data or null if not found
 */
export const getStateByCode = (code) => {
  if (!code) return null;
  
  const upperCode = code.toUpperCase();
  const statesData = getStatesData();
  const utsData = getUTsData();

  if (statesData[upperCode]) {
    return {
      ...statesData[upperCode],
      code: upperCode,
      slug: generateSlug(statesData[upperCode].name),
      type: 'state',
    };
  }

  if (utsData[upperCode]) {
    return {
      ...utsData[upperCode],
      code: upperCode,
      slug: generateSlug(utsData[upperCode].name),
      type: 'union_territory',
    };
  }

  return null;
};

/**
 * Get all places (tourist attractions) for a specific state/UT
 * @param {string} stateSlug - The URL slug of the state/UT
 * @returns {Array} Array of places with slugs
 */
export const getPlacesByState = (stateSlug) => {
  const state = getStateBySlug(stateSlug);
  if (!state || !state.touristAttractions) return [];

  return state.touristAttractions.map((place, index) => ({
    ...place,
    id: `${state.code.toLowerCase()}-${index + 1}`,
    slug: generateSlug(place.name),
    state: state.name,
    stateSlug: state.slug,
    stateCode: state.code,
  }));
};

/**
 * Get a specific place by state slug and place slug
 * @param {string} stateSlug - The URL slug of the state/UT
 * @param {string} placeSlug - The URL slug of the place
 * @returns {Object|null} Place data or null if not found
 */
export const getPlaceBySlug = (stateSlug, placeSlug) => {
  const places = getPlacesByState(stateSlug);
  if (!places.length) return null;

  const normalizedPlaceSlug = placeSlug.toLowerCase();
  return places.find(place => 
    generateSlug(place.name) === normalizedPlaceSlug || 
    place.id === normalizedPlaceSlug ||
    place.slug === normalizedPlaceSlug
  ) || null;
};

/**
 * Get all places from all states/UTs
 * @returns {Array} Array of all places with state info
 */
export const getAllPlaces = () => {
  const allStates = getAllStates();
  const allPlaces = [];

  allStates.forEach(state => {
    if (state.touristAttractions) {
      state.touristAttractions.forEach((place, index) => {
        allPlaces.push({
          ...place,
          id: `${state.code.toLowerCase()}-${index + 1}`,
          slug: generateSlug(place.name),
          state: state.name,
          stateSlug: state.slug,
          stateCode: state.code,
        });
      });
    }
  });

  return allPlaces;
};

/**
 * Search states and places by query
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Object} Object with states and places arrays
 */
export const searchAll = (query, limit = 10) => {
  if (!query || query.length < 2) {
    return { states: [], places: [] };
  }

  const normalizedQuery = query.toLowerCase().trim();
  const allStates = getAllStates();
  const allPlaces = getAllPlaces();

  // Search states
  const matchedStates = allStates
    .filter(state => {
      const nameMatch = state.name.toLowerCase().includes(normalizedQuery);
      const capitalMatch = state.capital?.toLowerCase().includes(normalizedQuery);
      const codeMatch = state.code?.toLowerCase() === normalizedQuery;
      return nameMatch || capitalMatch || codeMatch;
    })
    .slice(0, limit);

  // Search places
  const matchedPlaces = allPlaces
    .filter(place => {
      const nameMatch = place.name.toLowerCase().includes(normalizedQuery);
      const typeMatch = place.type?.toLowerCase().includes(normalizedQuery);
      const cityMatch = place.city?.toLowerCase().includes(normalizedQuery);
      const stateMatch = place.state?.toLowerCase().includes(normalizedQuery);
      return nameMatch || typeMatch || cityMatch || stateMatch;
    })
    .slice(0, limit);

  return {
    states: matchedStates,
    places: matchedPlaces,
  };
};

/**
 * Get raw data from the package (for advanced usage)
 * @returns {Object} Raw INDIA() data with states and uts
 */
export const getRawData = () => {
  return INDIA();
};

/**
 * Get only states (not UTs)
 * @returns {Array} Array of states only
 */
export const getStatesOnly = () => {
  const statesData = getStatesData();
  const result = [];

  for (const code in statesData) {
    const state = statesData[code];
    result.push({
      ...state,
      code,
      slug: generateSlug(state.name),
      type: 'state',
    });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get only union territories
 * @returns {Array} Array of UTs only
 */
export const getUnionTerritoriesOnly = () => {
  const utsData = getUTsData();
  const result = [];

  for (const code in utsData) {
    const ut = utsData[code];
    result.push({
      ...ut,
      code,
      slug: generateSlug(ut.name),
      type: 'union_territory',
    });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
};

// Default export with all functions
const knowIndiaAdapter = {
  getAllStates,
  getStateBySlug,
  getStateByCode,
  getPlacesByState,
  getPlaceBySlug,
  getAllPlaces,
  searchAll,
  getRawData,
  getStatesOnly,
  getUnionTerritoriesOnly,
  generateSlug,
};

export default knowIndiaAdapter;
