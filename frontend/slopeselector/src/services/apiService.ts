import type { ApiResponse, HistoryItem } from '../types';

// The base URL for our backend API
const API_BASE_URL = '/api'; // Assumes frontend is served by the same host

/**
 * Fetches new recommendations from the backend.
 * The backend will call Gemini and save the results.
 */
export const getRecommendations = async (prompt: string, userId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, userId }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch recommendations');
  }

  return response.json() as Promise<ApiResponse>;
};

/**
 * Fetches the user's prompt history.
 */
export const getHistory = async (userId: string): Promise<HistoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/history/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json() as Promise<HistoryItem[]>;
};

/**
 * Fetches a specific, saved recommendation set from the DB.
 */
export const getRecommendationById = async (setId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/recommendations/${setId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch recommendation details');
  }

  return response.json() as Promise<ApiResponse>;
};
