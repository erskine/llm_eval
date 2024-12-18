export interface ExperimentRequest {
  name?: string;
  description?: string;
  system_prompt: string;
  user_prompt: string;
  models: string[];
}

export interface TokenCounts {
  input: number;
  output: number;
  total: number;
}

export interface ExperimentResult {
  model: string;
  response: string;
  elapsed_time: number;
  token_counts: TokenCounts;
}

export interface ExperimentResponse {
  experiment_id: number;
  experiment_config: ExperimentRequest;
  results: ExperimentResult[];
} 