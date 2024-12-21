import { useQuery } from '@tanstack/react-query';
import { type Experiment } from "@/types/api";

async function fetchExperiments(): Promise<Experiment[]> {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    console.log('baseUrl', baseUrl);
    const response = await fetch(`${baseUrl}/api/v1/experiments`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.detail || 
        `Failed to fetch experiments: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export function useExperiments() {
  return useQuery({
    queryKey: ['experiments'],
    queryFn: fetchExperiments,
    retry: 1, // Only retry once on failure
  });
} 