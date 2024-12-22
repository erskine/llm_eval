import { useQuery } from '@tanstack/react-query';
import { type ExperimentDetails } from "@/types/api";

async function fetchExperimentDetails(id: string | number): Promise<ExperimentDetails> {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const url = `${baseUrl}/api/v1/experiments/${id}`;
    console.log('Fetching experiment details:', { url, id });
    
    const response = await fetch(url);
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    if (!response.ok) {
      throw new Error(
        `Failed to fetch experiment details: ${response.status} ${response.statusText}\n${responseText}`
      );
    }
    
    const data = JSON.parse(responseText);
    console.log('Parsed experiment details:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export function useExperimentDetails(id: string | number | null) {
  return useQuery({
    queryKey: ['experiment', id],
    queryFn: () => id ? fetchExperimentDetails(id) : null,
    enabled: id !== null,
  });
} 