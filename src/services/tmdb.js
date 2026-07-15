const API_KEY = '571cc4efbe00ca299f501a2dad5be976';
const BASE_URL = 'https://api.themoviedb.org/3';

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
export const THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w342';

// Helper to fetch and merge multiple pages for deeper results
const fetchMultiPage = async (url) => {
  try {
    const urls = [`${url}&page=1`, `${url}&page=2`];
    const responses = await Promise.all(urls.map(u => fetch(u)));
    
    const data = await Promise.all(responses.map(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    }));

    return [...(data[0].results || []), ...(data[1].results || [])];
  } catch (error) {
    console.error("Multi-page fetch failed:", error);
    return [];
  }
};

export const fetchTrending = () => 
  fetchMultiPage(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);

export const fetchTopRated = () => 
  fetchMultiPage(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);

export const fetchTVShows = () =>
  fetchMultiPage(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);

export const fetchUpcoming = () =>
  fetchMultiPage(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);

export const fetchMoviesByGenre = (genreId) => 
  fetchMultiPage(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`);

export const fetchSearchResults = (query) => {
  if (!query) return [];
  return fetchMultiPage(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US`);
};

export const fetchMovieTrailerKey = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const trailer = data.results?.find(
      (video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
    );
    return trailer ? trailer.key : null;
  } catch (error) {
    console.error("Error fetching trailer key:", error);
    return null;
  }
};