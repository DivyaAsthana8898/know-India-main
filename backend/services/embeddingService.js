/**
 * Embedding Service with FAISS fallback
 * Uses FAISS for vector search when available (local dev)
 * Falls back to text-based search on serverless (Vercel)
 */

let statesFunc = null;
let utsFunc = null;

// Try to load knowindia package
try {
  const knowindia = require('@aryanjsx/knowindia');
  statesFunc = knowindia.states;
  utsFunc = knowindia.uts;
  console.log('KnowIndia package loaded successfully');
} catch (err) {
  console.error('KnowIndia package not available:', err.message);
}

// FAISS (optional - may not work on serverless)
let IndexFlatL2 = null;
let faissAvailable = false;

// Try to load faiss-node (will fail on Vercel)
try {
  const faiss = require('faiss-node');
  IndexFlatL2 = faiss.IndexFlatL2;
  faissAvailable = true;
  console.log('FAISS native module loaded successfully');
} catch (err) {
  console.log('FAISS not available, using text-based search fallback:', err.message);
  faissAvailable = false;
}

// Transformer pipeline (optional for serverless)
let pipeline = null;
let embeddingModel = null;
let transformersAvailable = false;

// FAISS index and place data
let faissIndex = null;
let placesData = [];
let isInitialized = false;
let isInitializing = false;

// Embedding dimension for all-MiniLM-L6-v2
const EMBEDDING_DIM = 384;

/**
 * Load the transformer model (optional)
 */
async function loadModel() {
  if (embeddingModel) return embeddingModel;
  if (!faissAvailable) return null; // Skip if FAISS not available
  
  try {
    console.log('Loading embedding model: Xenova/all-MiniLM-L6-v2...');
    
    const { pipeline: transformerPipeline } = await import('@huggingface/transformers');
    pipeline = transformerPipeline;
    
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    transformersAvailable = true;
    
    console.log('Embedding model loaded successfully!');
    return embeddingModel;
  } catch (err) {
    console.log('Transformers not available:', err.message);
    transformersAvailable = false;
    return null;
  }
}

/**
 * Generate embedding for a text string
 */
async function generateEmbedding(text) {
  if (!embeddingModel) {
    await loadModel();
  }
  
  if (!embeddingModel) {
    return null; // Embeddings not available
  }
  
  // Generate embedding
  const output = await embeddingModel(text, { pooling: 'mean', normalize: true });
  
  // Convert to array
  return Array.from(output.data);
}

/**
 * Build searchable text for a place
 */
function buildPlaceSearchText(place, stateName, stateData) {
  const parts = [
    place.name,
    place.type || '',
    place.city || place.district || '',
    stateName,
    stateData.region || '',
    ...(stateData.famousFor || []),
  ];
  
  // Add keywords based on type
  const typeKeywords = getTypeKeywords(place.type || '');
  parts.push(...typeKeywords);
  
  return parts.filter(p => p).join(' ').toLowerCase();
}

/**
 * Get additional keywords based on place type
 */
function getTypeKeywords(type) {
  const typeLower = type.toLowerCase();
  const keywords = [];
  
  if (typeLower.includes('beach')) {
    keywords.push('beach', 'sea', 'ocean', 'coastal', 'sand', 'water', 'swim', 'relaxation');
  }
  if (typeLower.includes('temple') || typeLower.includes('religious')) {
    keywords.push('temple', 'spiritual', 'worship', 'religion', 'pilgrimage', 'sacred', 'prayer');
  }
  if (typeLower.includes('fort') || typeLower.includes('palace') || typeLower.includes('historical')) {
    keywords.push('heritage', 'history', 'ancient', 'architecture', 'monument', 'royal', 'culture');
  }
  if (typeLower.includes('hill') || typeLower.includes('mountain')) {
    keywords.push('hill', 'mountain', 'scenic', 'view', 'cool', 'nature', 'trekking', 'peaceful');
  }
  if (typeLower.includes('wildlife') || typeLower.includes('sanctuary') || typeLower.includes('national park')) {
    keywords.push('wildlife', 'animals', 'safari', 'nature', 'birds', 'forest', 'adventure');
  }
  if (typeLower.includes('waterfall')) {
    keywords.push('waterfall', 'nature', 'scenic', 'photography', 'trekking', 'adventure');
  }
  if (typeLower.includes('lake') || typeLower.includes('backwater')) {
    keywords.push('lake', 'water', 'boating', 'peaceful', 'scenic', 'nature', 'relaxation');
  }
  
  return keywords;
}

/**
 * Load all places from KnowIndia
 */
function loadPlacesData() {
  if (placesData.length > 0) return placesData;
  
  if (!statesFunc || !utsFunc) {
    console.log('KnowIndia not available, cannot load places');
    return placesData;
  }
  
  console.log('Loading places from KnowIndia...');
  
  // Get all states and UTs
  const allStates = statesFunc();
  const allUts = utsFunc();
  
  // Collect all places
  placesData = [];
  
  // Process states
  for (const [code, stateData] of Object.entries(allStates)) {
    const attractions = [
      ...(stateData.touristAttractions || []),
      ...(stateData.tourismHighlights || []),
    ];
    
    for (const place of attractions) {
      const searchText = buildPlaceSearchText(place, stateData.name, stateData);
      placesData.push({
        id: placesData.length,
        name: place.name,
        type: place.type,
        location: place.city || place.district || '',
        state: stateData.name,
        stateCode: code,
        region: stateData.region,
        searchText: searchText,
      });
    }
  }
  
  // Process union territories
  for (const [code, utData] of Object.entries(allUts)) {
    const attractions = [
      ...(utData.touristAttractions || []),
      ...(utData.tourismHighlights || []),
    ];
    
    for (const place of attractions) {
      const searchText = buildPlaceSearchText(place, utData.name, utData);
      placesData.push({
        id: placesData.length,
        name: place.name,
        type: place.type,
        location: place.city || place.district || '',
        state: utData.name,
        stateCode: code,
        region: utData.region || 'India',
        searchText: searchText,
      });
    }
  }
  
  console.log(`Loaded ${placesData.length} places from KnowIndia`);
  return placesData;
}

/**
 * Load all places from KnowIndia and build FAISS index (if available)
 */
async function initializeIndex() {
  if (isInitialized) return true;
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return isInitialized;
  }
  
  isInitializing = true;
  
  try {
    // Always load places data (works everywhere)
    loadPlacesData();
    
    // Only build FAISS index if available (local dev)
    if (faissAvailable) {
      console.log('Building FAISS index with vector embeddings...');
      
      // Load the model first
      await loadModel();
      
      if (embeddingModel) {
        // Generate embeddings for all places
        console.log('Generating embeddings for all places...');
        const embeddings = [];
        
        for (let i = 0; i < placesData.length; i++) {
          const embedding = await generateEmbedding(placesData[i].searchText);
          embeddings.push(embedding);
          
          // Progress log every 50 places
          if ((i + 1) % 50 === 0) {
            console.log(`Generated embeddings: ${i + 1}/${placesData.length}`);
          }
        }
        
        console.log('Building FAISS index...');
        
        // Create FAISS index
        faissIndex = new IndexFlatL2(EMBEDDING_DIM);
        
        // Add all embeddings to the index
        for (const embedding of embeddings) {
          faissIndex.add(embedding);
        }
        
        console.log(`FAISS index built with ${faissIndex.ntotal()} vectors`);
      }
    } else {
      console.log('Using text-based search (FAISS not available)');
    }
    
    isInitialized = true;
    isInitializing = false;
    
    return true;
  } catch (error) {
    console.error('Error initializing index:', error);
    // Still mark as initialized so text search works
    isInitialized = true;
    isInitializing = false;
    return true;
  }
}

/**
 * Text-based search using keyword matching (fallback for serverless)
 */
function textBasedSearch(query, topK = 10, destinationFilter = null) {
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  let results = placesData.map(place => {
    let score = 0;
    const searchText = place.searchText;
    
    // Score based on term matches
    for (const term of queryTerms) {
      if (searchText.includes(term)) {
        score += 1;
        // Bonus for exact name match
        if (place.name.toLowerCase().includes(term)) {
          score += 2;
        }
        // Bonus for type match
        if (place.type && place.type.toLowerCase().includes(term)) {
          score += 1.5;
        }
      }
    }
    
    return { ...place, score };
  });
  
  // Apply destination filter
  if (destinationFilter) {
    const filterLower = destinationFilter.toLowerCase();
    results = results.filter(place => {
      const stateLower = place.state.toLowerCase();
      return stateLower.includes(filterLower) || filterLower.includes(stateLower);
    });
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  // Return top K results with score > 0
  return results.filter(r => r.score > 0).slice(0, topK);
}

/**
 * Search for places using vector similarity (or text fallback)
 * @param {string} query - Search query
 * @param {number} topK - Number of results to return
 * @param {string} destinationFilter - Optional: filter by destination/state
 * @returns {Array} Array of matching places with scores
 */
async function searchPlaces(query, topK = 10, destinationFilter = null) {
  // Ensure places are loaded
  if (!isInitialized) {
    await initializeIndex();
  }
  
  // Use FAISS if available, otherwise text-based search
  if (faissIndex && embeddingModel) {
    // Vector search with FAISS
    const queryEmbedding = await generateEmbedding(query.toLowerCase());
    
    if (queryEmbedding) {
      // Search in FAISS
      const searchK = destinationFilter ? Math.min(topK * 5, placesData.length) : topK;
      const results = faissIndex.search(queryEmbedding, searchK);
      
      // Map results to place data
      let matchedPlaces = [];
      
      for (let i = 0; i < results.labels.length; i++) {
        const placeId = results.labels[i];
        const distance = results.distances[i];
        
        if (placeId >= 0 && placeId < placesData.length) {
          const place = placesData[placeId];
          
          // Apply destination filter if provided
          if (destinationFilter) {
            const filterLower = destinationFilter.toLowerCase();
            const stateLower = place.state.toLowerCase();
            
            if (!stateLower.includes(filterLower) && !filterLower.includes(stateLower)) {
              continue;
            }
          }
          
          matchedPlaces.push({
            ...place,
            score: 1 / (1 + distance),
            distance: distance,
          });
        }
      }
      
      return matchedPlaces.slice(0, topK);
    }
  }
  
  // Fallback to text-based search
  console.log('Using text-based search fallback');
  return textBasedSearch(query, topK, destinationFilter);
}

/**
 * Get all places for a specific state/UT
 */
function getPlacesByState(stateName) {
  // Ensure places are loaded
  if (placesData.length === 0) {
    loadPlacesData();
  }
  
  const stateLower = stateName.toLowerCase();
  return placesData.filter(place => 
    place.state.toLowerCase().includes(stateLower) ||
    stateLower.includes(place.state.toLowerCase())
  );
}

/**
 * Check if index is ready
 */
function isReady() {
  return isInitialized || placesData.length > 0;
}

/**
 * Get index stats
 */
function getStats() {
  return {
    isInitialized,
    totalPlaces: placesData.length,
    indexSize: faissIndex ? faissIndex.ntotal() : 0,
    faissAvailable,
    transformersAvailable,
    searchMode: faissIndex ? 'vector' : 'text',
  };
}

module.exports = {
  initializeIndex,
  searchPlaces,
  generateEmbedding,
  getPlacesByState,
  isReady,
  getStats,
};
