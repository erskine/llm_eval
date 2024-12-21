export interface ExperimentRequest {
  name?: string;
  description?: string;
  system_prompt: string;
  user_prompt: string;
  models: string[];
}

export interface Experiment {
  id: number;
  name: string;
  timestamp: string;
  status: string;
  description: string;
}

export interface ExperimentDetails extends Experiment {
  parameters: {
    system_prompt: string;
    user_prompt: string;
    models: string;
  };
  outputs: Record<string, string>;
} 