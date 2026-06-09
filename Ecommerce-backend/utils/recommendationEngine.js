// utils/recommendationEngine.js

// 1. Convert text into a mathematical frequency map (Bag of Words)
function getTermFrequency(text) {
  // Lowercase everything and extract only letters/numbers
  const words = text.toLowerCase().match(/\w+/g) || [];
  const frequency = {};
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return frequency;
}

// 2. Calculate the Cosine Similarity angle between two frequency maps
function calculateCosineSimilarity(freq1, freq2) {
  // Get a unique list of all words from both products
  const uniqueWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let word of uniqueWords) {
    const val1 = freq1[word] || 0;
    const val2 = freq2[word] || 0;
    
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  // Return a score between 0 (completely different) and 1 (identical)
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

module.exports = { getTermFrequency, calculateCosineSimilarity };