export interface ExperimentRequest {
  name?: string;
  description?: string;
  system_prompt: string;
  user_prompt: string;
  models: string[];
}

export interface Experiment {
  id: string;
  name?: string;
  description?: string;
  timestamp: string;
  status: string;
  parameters?: ExperimentParameters;
}

export interface ExperimentParameters {
  system_prompt: string;
  user_prompt: string;
  models: string[];
}

export interface ExperimentResponse {
  id: string;
  results: Array<{
    model: string;
    elapsed_time: number;
    token_counts: {
      total: number;
      input: number;
      output: number;
    };
    response: string;
  }>;
}

export interface ExperimentDetails extends Experiment {
  parameters: {
    system_prompt: string;
    user_prompt: string;
    models: string[];
    [key: string]: any;
  };
  outputs: {
    [key: string]: string;
  };
} 