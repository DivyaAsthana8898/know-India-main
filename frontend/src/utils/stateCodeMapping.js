/**
 * Mapping between state codes used in the India map component and the knowindia package
 * 
 * The India map component uses some different state codes than the knowindia package.
 * This mapping helps convert between the two.
 */

const mapToKnowIndia = {
  'OR': 'OD', // Odisha
  'CT': 'CG', // Chhattisgarh
  'UT': 'UK', // Uttarakhand
};

/**
 * Convert a map component state code to a knowindia package state code
 * @param {string} mapCode - The state code used in the map component
 * @returns {string} - The corresponding state code in the knowindia package
 */
export const convertMapCodeToKnowIndia = (mapCode) => {
  return mapToKnowIndia[mapCode] || mapCode;
};