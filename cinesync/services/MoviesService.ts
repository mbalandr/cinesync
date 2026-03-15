// services/MovieService.ts

// Use your provided API key directly.
const API_KEY = '';

// Base URLs for the two different endpoints.
const OMDB_BASE_URL = 'http://www.omdbapi.com/';
const POSTER_BASE_URL = 'http://img.omdbapi.com/';

/**
 * Type definitions for movie search results and details.
 */
export type MovieSummary = {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
};

export type OMDbSearchResponse = {
  Response: 'True' | 'False';
  Search?: MovieSummary[];
  totalResults?: string;
  Error?: string;
};

export type MovieDetails = {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: 'True' | 'False';
  Error?: string;
};

/**
 * Searches for movies based on a given search term.
 * @param searchTerm - The movie title or keyword to search.
 * @returns A promise that resolves to an array of movie summaries.
 */
export const searchMovies = async (searchTerm: string): Promise<MovieSummary[]> => {
  const url = `${OMDB_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`;
  const response = await fetch(url);
  const data: OMDbSearchResponse = await response.json();
  if (data.Response === 'True' && data.Search) {
    return data.Search;
  } else {
    throw new Error(data.Error || 'Error fetching movie search results.');
  }
};

/**
 * Retrieves detailed information for a movie by its IMDb ID.
 * @param imdbID - The IMDb ID of the movie.
 * @returns A promise that resolves to the detailed movie information.
 */
export const getMovieDetails = async (imdbID: string): Promise<MovieDetails> => {
  const url = `${OMDB_BASE_URL}?apikey=${API_KEY}&i=${encodeURIComponent(imdbID)}`;
  const response = await fetch(url);
  const data: MovieDetails = await response.json();
  if (data.Response === 'True') {
    return data;
  } else {
    throw new Error(data.Error || 'Error fetching movie details.');
  }
};

/**
 * Constructs the URL for a movie poster image.
 * @param imdbID - The IMDb ID of the movie.
 * @param height - (Optional) Desired height of the poster image in pixels (default is 600).
 * @returns The full URL to retrieve the poster image.
 */
export const getPosterUrl = (imdbID: string, height: number = 600): string => {
  return `${POSTER_BASE_URL}?i=${encodeURIComponent(imdbID)}&h=${height}&apikey=${API_KEY}`;
};
