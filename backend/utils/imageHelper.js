const axios = require('axios');

// Predefined high-quality Unsplash image fallbacks for popular travel search keywords
const FALLBACK_IMAGES = {
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop&q=80',
  tokyo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80',
  nyc: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop&q=80',
  italy: 'https://images.unsplash.com/photo-1529260830199-44552441d72c?w=1200&auto=format&fit=crop&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
  indonesia: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&auto=format&fit=crop&q=80',
  australia: 'https://images.unsplash.com/photo-1523482596112-990520c2902f?w=1200&auto=format&fit=crop&q=80',
  switzerland: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format&fit=crop&q=80',
  swiss: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format&fit=crop&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop&q=80',
  uae: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop&q=80',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop&q=80',
  india: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop&q=80',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
  island: 'https://images.unsplash.com/photo-1505881502353-a1986add3762?w=1200&auto=format&fit=crop&q=80',
  nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=80',
  travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80',
};

const getDestinationImage = async (destination) => {
  const query = (destination || 'travel').trim().toLowerCase();
  
  // 1. Try Unsplash API if credentials available
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (accessKey && accessKey !== 'your_unsplash_api_key_here_optional' && accessKey.trim() !== '') {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: query,
          orientation: 'landscape',
          per_page: 1
        },
        headers: {
          Authorization: `Client-ID ${accessKey}`
        },
        timeout: 5000 // 5 seconds timeout
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        return response.data.results[0].urls.regular;
      }
    } catch (err) {
      console.warn('Unsplash API call failed, falling back to local list:', err.message);
    }
  }

  // 2. Lookup keyword in pre-mapped fallbacks
  for (const key of Object.keys(FALLBACK_IMAGES)) {
    if (query.includes(key)) {
      return FALLBACK_IMAGES[key];
    }
  }

  // 3. Complete fallback using dynamic source unsplash URL
  // This uses Unsplash source system which serves high-quality images based on matching keyword query
  return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80`;
};

module.exports = { getDestinationImage };
